import { Request } from 'express';
import { IReport, ISwap } from './swap.interface';
import ApiError from '../../../errors/ApiError';
import { Reports, Swap } from './swap.model';
import User from '../auth/auth.model';
import { IReqUser, IUser } from '../auth/auth.interface';
// import { Point } from '../points/points.model';
import { Product } from '../products/products.model';
import { Point } from '../points/points.model';
import { Subscription } from '../subscriptions/subscriptions.model';
import httpStatus from 'http-status';
import { makeSwapPoints } from '../points/points.services';
import Notification from '../notifications/notifications.model';
import { Ratting } from '../rattings/rattings.model';
import { Types } from 'mongoose';
import { Plan } from '../user-subscription/user-plan.model';
import Conversation from '../messages/conversation.model';
import { sendPushNotification } from '../push-notification/push.notifications';
import QueryBuilder from '../../../builder/QueryBuilder';
import { ISubscriptions } from '../subscriptions/subscriptions.interface';
import cron from 'node-cron';
import { logger } from '../../../shared/logger';

cron.schedule('* * * * *', async () => {
  try {
    const pointDb = await Point.find({});

    const platinum = await Subscription.findOne({ planName: 'Platinum' }) as ISubscriptions;
    const diamond = await Subscription.findOne({ planName: 'Diamond' }) as ISubscriptions;

    if (!platinum || !diamond) {
      throw new Error('Subscription plans not found');
    }

    for (const point of pointDb) {
      const user = await User.findById(point.user);
      if (!user) continue;

      if (platinum.pointRangeStart <= point.points && user.userType !== 'Platinum') {
        await User.findByIdAndUpdate(point.user, { userType: 'Platinum' });
      }

      if (diamond.pointRangeStart <= point.points && user.userType !== 'Diamond') {
        await User.findByIdAndUpdate(point.user, { userType: 'Diamond' });
      }
    }
  } catch (error) {
    logger.error('Error updating user types based on points:', error);
  }
});

const makeSwap = async (req: Request) => {
  const user: any = req.user as IReqUser;
  const payload = req.body as ISwap;

  const isExistUSer = await User.findById(user.userId);
  if (!isExistUSer) {
    throw new ApiError(404, 'Requested User not found');
  }

  const subscription = await Plan.findOne({ user_id: user.userId }).populate("plan_id");

  if (!subscription?.active) {
    throw new ApiError(404, 'You do not have an active subscription plan. Please subscribe to a plan to proceed.');
  }

  console.log("payload", payload)

  if (!payload.productFrom || !payload.productTo || !payload.userTo) {
    throw new ApiError(400, 'Product or User is missing');
  }

  // Check swap conditions
  if (payload.productFrom === payload.productTo) {
    throw new ApiError(400, 'You cannot swap the same product.');
  }

  if (payload.userTo === user.userId) {
    throw new ApiError(400, 'You cannot swap a product with yourself.');
  }

  const subscriptionTo = await Plan.findOne({ user_id: payload.userTo }).populate("plan_id");

  console.log("package_id", subscriptionTo?.active)

  if (!subscriptionTo?.active) {
    throw new ApiError(404, 'User does not have an active subscription plan. Please find another user.');
  }

  const result = await Swap.create({
    userFrom: user.userId,
    userTo: payload.userTo,
    productFrom: payload.productFrom,
    productTo: payload.productTo,
    plan_type: isExistUSer.userType
  });


  const notificationMessage = 'You have a swap request!.';
  const notification = await Notification.create({
    title: `${isExistUSer.name} request you to swap!`,
    user: payload.userTo,
    message: notificationMessage,
  });

  const dbReceiver = await User.findById(payload.userTo)
  if (dbReceiver?.deviceToken) {
    const payload = {
      title: notificationMessage,
      body: `${isExistUSer.name} request you to swap!`,
    };
    sendPushNotification({ fcmToken: dbReceiver?.deviceToken, payload });
  }

  //@ts-ignore
  const socketIo = global.io;
  if (socketIo) {
    socketIo.emit(`notification::${notification?._id.toString()}`, notification);
  }

  let conversation = await Conversation.findOne({
    participants: { $all: [user.userId, payload.userTo] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [user.userId, payload.userTo],
    });
  }

  return result
};

const pendingSwap = async (req: Request) => {
  const { userId } = req.user as IReqUser;
  const status = req.query.status;

  if (!status) {
    throw new ApiError(400, 'Status is required');
  }

  let swaps: any[] = [];

  if (status === 'my_request') {
    swaps = await Swap.find({ userFrom: userId, isApproved: "pending" })
      .populate('productFrom')
      .populate('productTo')
      .populate('userFrom')
      .populate('userTo')
  }

  if (status === 'receive_request') {
    swaps = await Swap.find({ userTo: userId, isApproved: "pending" })
      .populate('productFrom')
      .populate('productTo')
      .populate('userFrom')
      .populate('userTo')
  }
  return swaps;
};

const cancelSwapRequest = async (req: Request) => {
  const id = req.params.id;
  const deleteSwap = await Swap.findByIdAndDelete(id)
  return deleteSwap;
};

const swapDetails = async (id: string) => {
  return await Swap.findById(id)
    .populate('productFrom')
    .populate('productTo')
    .populate('userFrom')
    .populate('userTo')
};

const approveSwap = async (req: Request): Promise<any> => {
  const { id } = req.params;
  const { userId } = req.user as IReqUser;

  const [swap, fromProduct, toProduct, user] = await Promise.all([
    Swap.findById(id).lean(),
    Swap.findById(id).select('productFrom').then(swap =>
      swap ? Product.findById(swap.productFrom).lean() : null
    ),
    Swap.findById(id).select('productTo').then(swap =>
      swap ? Product.findById(swap.productTo).lean() : null
    ),
    User.findById(userId).lean(),
  ]);

  if (!swap) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Swap not found');
  }
  if (!fromProduct) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product from not found');
  }
  if (!toProduct) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product to not found');
  }
  if (swap.isApproved === 'approved') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Swap already approved');
  }
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  const toUser = await (User.findOne({ _id: toProduct.user })) as IUser;
  if (!toUser) {
    throw new ApiError(httpStatus.NOT_FOUND, 'To user not found');
  }

  const points = await makeSwapPoints({ fromProduct, toProduct }, { user, toUser });

  const [updatedSwap, fromPoint, toPoint] = await Promise.all([
    Swap.findByIdAndUpdate(
      id,
      {
        isApproved: 'approved',
        swapUserToPoint: points.earnPointToUser,
        swapUserFromPoint: points.earnPointFromUser,
      },
      { new: true }
    ),
    Point.findOneAndUpdate(
      { user: swap.userFrom },
      {
        $inc: { points: points.earnPointFromUser },
        $addToSet: {
          details: {
            title: 'By swapping product!',
            point: points.earnPointFromUser,
            date: new Date(),
          },
        },
      },
      { new: true, upsert: true }
    ),
    Point.findOneAndUpdate(
      { user: swap.userTo },
      {
        $inc: { points: points.earnPointToUser },
        $addToSet: {
          details: {
            title: 'By swapping product!',
            point: points.earnPointToUser,
            date: new Date(),
          },
        },
      },
      { new: true, upsert: true }
    ),
  ]);

  const [to_swap, from_swap] = await Promise.all([
    Swap.findByIdAndUpdate(
      toProduct._id,
      {
        status: "completed"
      }),
    Swap.findByIdAndUpdate(
      fromProduct._id,
      {
        status: "completed"
      })
  ])

  const [to_product, from_product] = await Promise.all([
    Product.findByIdAndUpdate(
      toProduct._id,
      {
        status: "swapped"
      }),
    Product.findByIdAndUpdate(
      fromProduct._id,
      {
        status: "swapped"
      })
  ])

  const notificationMessage = `Accept your swap request!`;
  const notification = await Notification.create({
    title: `Start a chat to swap your product.`,
    user: swap.userFrom,
    message: notificationMessage,
  });

  const dbReceiver = await User.findById(swap.userFrom)
  if (dbReceiver?.deviceToken) {
    const payload = {
      title: notificationMessage,
      body: `Start a chat to swap your product.`,
    };
    sendPushNotification({ fcmToken: dbReceiver?.deviceToken, payload });
  }

  //@ts-ignore
  const socketIo = global.io;
  if (socketIo) {
    socketIo.emit(`notification::${notification?._id.toString()}`, notification);
  }

  return updatedSwap;
};

const rejectSwap = async (id: string) => {
  const isExist = await Swap.findById(id);
  if (!isExist) {
    throw new ApiError(404, 'Product not found');
  }
  return await Swap.findByIdAndUpdate(
    id,
    { isApproved: 'rejected' },
    { new: true },
  );
};

const getUsersSwapProduct = async (req: Request) => {
  const user = req.user as IReqUser;
  const title = req.query.productName as string | undefined;

  try {
    const baseQuery: any = {
      $and: [
        {
          $or: [
            { userFrom: user.userId },
            { userTo: user.userId }
          ]
        },
        { isApproved: 'approved' },
      ]
    };

    const populateFields = [
      { path: 'user', select: 'name email phone_number profile_image address' },
      { path: 'category', select: 'name image' },
      { path: 'subCategory', select: 'name' }
    ];

    const swaps: any[] = await Swap.find(baseQuery)
      .populate({
        path: 'productFrom',
        populate: populateFields
      })
      .populate({
        path: 'productTo',
        populate: populateFields
      });

    // Add 'report' field to each swap
    const modifiedSwaps = swaps.map(swap => {
      const isReported = swap.reporting.includes(user.userId);
      const isRetting = swap.ratting.includes(user.userId);
      return {
        ...swap.toObject(),
        report: isReported,
        isRetting: isRetting
      };
    });


    // If title filter is provided, apply it
    if (title) {
      const regex = new RegExp(title, 'i');
      return modifiedSwaps.filter(swap =>
        (swap.productFrom && regex.test(swap.productFrom.title)) ||
        (swap.productTo && regex.test(swap.productTo.title))
      );
    }

    return modifiedSwaps;

  } catch (error) {
    console.error("Error fetching swaps:", error);
    throw new Error("Failed to fetch swaps");
  }
};

const getSwapProductPlanType = async (req: Request) => {
  const user = req.user as { userId: string };
  const planType = req.query.planType as string | undefined;
  const title = req.query.productName as string | undefined;

  try {
    const baseQuery: any = {
      $and: [
        {
          $or: [
            { userFrom: user.userId },
            { userTo: user.userId }
          ]
        },
        { isApproved: 'approved' },
      ]
    };

    const swaps: any[] = await Swap.find(baseQuery)
      .populate({
        path: 'productFrom',
        populate: [
          { path: 'user', select: 'name email phone_number profile_image address' },
          { path: 'category', select: 'name image' },
          { path: 'subCategory', select: 'name' }
        ]
      })
      .populate({
        path: 'productTo',
        populate: [
          { path: 'user', select: 'name email phone_number profile_image address' },
          { path: 'category', select: 'name image' },
          { path: 'subCategory', select: 'name' }
        ]
      });

    const filteredSwaps = swaps.filter(swap => {
      const matchesPlanType = planType ? swap.plan_type.toLowerCase() === planType.toLowerCase() : true;
      const matchesTitle = title
        ? (swap.productFrom && new RegExp(title, 'i').test(swap.productFrom.title)) ||
        (swap.productTo && new RegExp(title, 'i').test(swap.productTo.title))
        : true;

      return matchesPlanType && matchesTitle;
    });

    const planPoint = await Subscription.findOne({ planName: planType }) as any
    const userResult = await User.findById(user.userId) as any


    const result = filteredSwaps.map(swap => {
      const myPoints =
        swap.userTo.toString() === user.userId
          ? swap.swapUserToPoint
          : swap.userFrom.toString() === user.userId
            ? swap.swapUserFromPoint
            : 0;

      return {
        swapId: swap._id,
        myPoints,
        productFrom: swap.productFrom,
        productTo: swap.productTo,
        planType: swap.plan_type,
        isApproved: swap.isApproved,
        createdAt: swap?.createdAt
      };
    });

    return { result, pointRangeStart: planPoint.pointRangeStart, pointRangeEnd: planPoint.pointRangeEnd, userPoint: userResult?.points };

  } catch (error) {
    console.error("Error fetching swap points:", error);
    throw new Error("Failed to fetch swap points");
  }
};

const partnerProfileDetails = async (req: Request) => {
  const id = req.params.id;
  // const user = await User.findById(userId); 
  const profile = await User.findById(id)

  if (!profile) {
    throw new ApiError(404, 'User profile not found');
  }
  const product = await Product.find({ user: id, status: "pending" })


  const ratting = await Ratting.find({ swapOwner: id })
    .populate("swapOwner")
    .populate("swap")
    .populate('user')


  const result = await Ratting.aggregate([
    { $match: { swapOwner: new Types.ObjectId(id) } },
    {
      $group: {
        _id: '$swapOwner',
        averageRating: { $avg: '$ratting' },
      },
    },
  ]);

  let average_rating;

  if (result.length > 0) {
    average_rating = Number(result[0].averageRating.toFixed(2));
  } else {
    average_rating = 0;
  }


  return { profile, product, ratting, average_rating }


}

const createReports = async (req: Request) => {
  const user = req.user as IReqUser;
  const payload = req.body;
  const files = req.files as any;

  if (!payload.againstUser || !payload.description || !payload.swapId) {
    throw new ApiError(400, 'Invalid payload: againstUser, description, and swapId are required');
  }

  if (files?.reportImage) {
    payload.reportImage = files.reportImage.map((file: any) => `/images/reports/${file.filename}`);
  }

  payload.userFrom = user.userId;

  const result = await Reports.create(payload);

  const swaps = await Swap.findByIdAndUpdate(
    payload.swapId,
    { $push: { reporting: user.userId } },
    { new: true },
  );
  return result;
};

const getReports = async (req: Request) => {
  const query = req.query
  const categoryQuery = new QueryBuilder(Reports.find()
    .populate({ path: 'againstUser', select: 'name email profile_image ' })
    .populate({ path: 'userFrom', select: 'name email profile_image' })
    , query)
    // .search()
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await categoryQuery.modelQuery;
  const meta = await categoryQuery.countTotal();
  return { result, meta }
}

const replayReports = async (req: Request) => {
  const user = req.user as IReqUser;
  const payload = req.body;
  const id = req.query.id;

  if (!payload.description) {
    throw new ApiError(400, 'Invalid payload: description are required');
  }

  const reports = await Reports.findById(id) as IReport

  if (!reports) {
    throw new ApiError(404, 'Report not found');
  }

  const result = await Reports.findByIdAndUpdate(
    id,
    { replayed: true, replay: payload.description },
    { new: true },
  );

  // const notifications

  const notificationMessage = payload.description;
  const notification = await Notification.create({
    title: `Your Reports Replay From Admin!`,
    user: reports.userFrom,
    message: notificationMessage,
  });

  const dbReceiver = await User.findById(reports.userFrom)
  if (dbReceiver?.deviceToken) {
    const payload = {
      title: `Your Reports Replay From Admin!`,
      body: notificationMessage,
    };
    sendPushNotification({ fcmToken: dbReceiver?.deviceToken, payload });
  }

  //@ts-ignore
  const socketIo = global.io;
  if (socketIo) {
    socketIo.emit(`notification::${notification?._id.toString()}`, notification);
  }


  return result;
};

const deleteReport = async (req: Request) => {
  const id = req.params.id;
  const reports = await Reports.findByIdAndDelete(id);
  if (!reports) {
    throw new ApiError(404, 'Report not found');
  }
  const result = await Reports.findByIdAndDelete(id);

  return result;
}


export const SwapService = {
  makeSwap,
  pendingSwap,
  cancelSwapRequest,
  swapDetails,
  approveSwap,
  rejectSwap,
  getUsersSwapProduct,
  partnerProfileDetails,
  getSwapProductPlanType,
  createReports,
  getReports,
  replayReports,
  deleteReport
};
