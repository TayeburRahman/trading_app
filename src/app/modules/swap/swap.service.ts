import { Request } from 'express';
import { ISwap } from './swap.interface';
import ApiError from '../../../errors/ApiError';
import { Swap } from './swap.model';
import User from '../auth/auth.model';
import { IReqUser, IUser } from '../auth/auth.interface';
// import { Point } from '../points/points.model';
import { Product } from '../products/products.model';
import { Point } from '../points/points.model';
import { Subscription } from '../subscriptions/subscriptions.model';
import httpStatus from 'http-status';
import { makeSwapPoints } from '../points/points.services';
import Notification from '../notifications/notifications.model';

const makeSwap = async (req: Request) => {
  const user: any= req.user as IReqUser;
  const payload = req.body as ISwap;
 
  const isExistUSer = await User.findById(user.userId);
  if (!isExistUSer) {
    throw new ApiError(404, 'Requested User not found');
  }

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

  const result = await Swap.create({
    userFrom: user.userId,
    userTo: payload.userTo,
    productFrom: payload.productFrom,
    productTo: payload.productTo,
  });

  const notificationMessage = 'You have a swap request!.';
  const notification = await Notification.create({
    title:  `${isExistUSer.name} request you to swap!`, 
    user: payload.userTo,
    message: notificationMessage,
  });

  //@ts-ignore
  const socketIo = global.io;
  if (socketIo) {
    socketIo.emit(`notification::${notification?._id.toString()}`, notification); 
  }  

  return result
};

const pendingSwap = async (req: Request) => {
  const { userId } = req.user as IReqUser;
  const swaps = await Swap.find({ userFrom: userId });

  return swaps;
};

const swapDetails = async (id: string) => {
  return await Swap.findById(id).populate('productFrom').populate('productTo');
};

const approveSwap = async (req: Request): Promise<any> => {
  const { id } = req.params;
  const { userId } = req.user as IReqUser;

  // Fetch swap, products, and user in parallel
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
  const toUser = await (User.findOne({_id: toProduct.user})) as IUser;

  if (!toUser) {
    throw new ApiError(httpStatus.NOT_FOUND, 'To user not found');
  } 

  console.log("======user=====",user)
  console.log("======toUser=====",toUser)

  const points = await makeSwapPoints({fromProduct, toProduct}, {user, toUser}); 
  // Update swap and user points in parallel
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
      { $inc: { points: points.earnPointFromUser },
      $addToSet: {
        details: {
          title: 'By swapping product!',
          point: points.earnPointFromUser ,
          date: new Date(),
        },
      },
    },
      { new: true, upsert: true }
    ),
    Point.findOneAndUpdate(
      { user: swap.userTo },
      { $inc: { points: points.earnPointToUser },
      $addToSet: {
        details: {
          title: 'By swapping product!',
          point: points.earnPointToUser ,
          date: new Date(),
        },
      },
    },
      { new: true, upsert: true }
    ),
  ]); 

  const notificationMessage = `Accept your swap request!`;
  const notification = await Notification.create({
    title:  `Start a chat to swap your product.`, 
    user: swap.userFrom,
    message: notificationMessage,
  });

  //@ts-ignore
  const socketIo = global.io;
  if (socketIo) {
    socketIo.emit(`notification::${notification?._id.toString()}`, notification); 
  }  

  return updatedSwap ;
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
        { isApproved: 'approved' }
      ]
    };   

    const populateFields = [
      { path: 'user', select: 'name email phone_number profile_image address' },
      { path: 'category', select: 'name image' },
      { path: 'subCategory', select: 'name' }
    ];
    
    const swaps : any[] = await Swap.find(baseQuery)
      .populate({
        path: 'productFrom',
        populate: populateFields
      })
      .populate({
        path: 'productTo',
        populate: populateFields
      });

      if (title) {
        const regex = new RegExp(title, 'i');   
        return swaps.filter(swap  => 
          (swap.productFrom && regex.test(swap.productFrom.title)) ||
          (swap.productTo && regex.test(swap.productTo.title))
        );
      }

    return swaps;

  } catch (error) {
    console.error("Error fetching swaps:", error);
    throw new Error("Failed to fetch swaps");
  }
};

export const SwapService = {
  makeSwap,
  pendingSwap,
  swapDetails,
  approveSwap,
  rejectSwap,
  getUsersSwapProduct
};
