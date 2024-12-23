/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Request } from 'express';
import ApiError from '../../../errors/ApiError';
import User from '../auth/auth.model';
import { Subscription } from '../subscriptions/subscriptions.model';
import { Plan } from './user-plan.model';
import QueryBuilder from '../../../builder/QueryBuilder';
import { IReqUser } from '../auth/auth.interface';
import Notification from '../notifications/notifications.model';
import { IUpgradePlan } from './user-plan.interface';
import cron from 'node-cron';
import { logger } from '../../../shared/logger';
import { Point } from '../points/points.model';
import { IPoints } from '../points/points.interface';
import { ISubscriptions } from '../subscriptions/subscriptions.interface';
import { Swap } from '../swap/swap.model';

cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const result = await Plan.updateMany(
      { 
        planEndDate: { $lte: now },
      },
      {
        $unset: { payment_status: 'unpaid', active: false },
      },
    ); 

    if (result.modifiedCount > 0) {
      logger.info(
        `Removed activation codes from ${result.modifiedCount} expired inactive users`,
      );
    }
  } catch (error) {
    logger.error('Error removing activation codes from expired users:', error);
  }
});

const createSubscription = async (req: Request) => {
  let data = req.body;
  const {userId}=  req.user as IReqUser;

  const checkUser = await User.findById(userId);

  if (!checkUser) {
    throw new ApiError(404, 'User not found');
  }

  const subscriptionPlan = await Subscription.findById(data.plan_id) as ISubscriptions;

  if (!subscriptionPlan) {
    throw new ApiError(404, 'Plan not found');
  }

  const startDate = new Date();

  const endDate = new Date(
    startDate.getTime() + subscriptionPlan.duration * 24 * 60 * 60 * 1000,
  );
  data.planStartDate = startDate;
  data.planEndDate = endDate;
  data.user_id = req?.user?.userId;

  // console.log("UPDATE ++++++",data)
  // console.log("====checkUser=======",data)

  const existingPlan = await Plan.findOne({
    user_id: userId,
    payment_status: { $in: ["unpaid", "trial"] }
  });

  if(existingPlan) {
   await Plan.deleteOne({ user_id: userId,   payment_status: { $in: ["unpaid", "trial"] } });
  }

  const paymentStatus = data.plan_type === "Trial" ? "trial" : "unpaid";
  data.payment_status = paymentStatus;

  const subscription = await Plan.create(data); 
  
  checkUser.userType = data.plan_type
  checkUser.planExpatDate = endDate
  await checkUser.save();

  const notification = await Notification.create({
    user: checkUser?._id,
    title: 'Subscription Plan Request!',
    message: `Request Unlock New Plan From ${checkUser?.name} on ${subscriptionPlan?.planName} Subscription Successful.`,
  });

  await Notification.create({
    admin: true,
    plan_id: subscription._id,
    title: 'New user applied!',
    message: `A new user has applied for ${subscriptionPlan?.planName} membership packages and waiting for approval, review the application for approval.`,
  });

  //@ts-ignore
  global.io.to(checkUser?._id.toString()).emit('notification', notification);

  return subscription;
};

const updateSubscription = async (req: Request) => {
  const { id } = req.params;
  const updateData = req.body;

  if (id) {
    throw new ApiError(404, 'Invalid subscription ID format');
  }

  const updatedSubscription = await Plan.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!updatedSubscription) {
    throw new ApiError(404, 'Subscription not found!');
  }

  return updatedSubscription;
};

const AllSubscriber = async (query: Record<string, unknown>) => {
  const subscriptionsQuery = new QueryBuilder(
    Plan.find({ status: { $ne: 'decline' } }).populate('user_id'),
    query,
  )
    .search(['plan_type'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await subscriptionsQuery.modelQuery;
  const meta = await subscriptionsQuery.countTotal();
  const subscriptions = await Subscription.find({});
  const planTypes = [...new Set(subscriptions?.map(sub => sub?.planName))];
  return {
    meta,
    data: result,
    planTypes,
  };
};

const getSubscribeData = async (params: Record<string, unknown>) => {
  const subscriptionsQuery = await Plan.findById(params.id).populate('user_id');
  return subscriptionsQuery;
};

const statusUpdateRequest = async (req: Request) => {
  const { id } = req.params;
  const { status } = req.query;
  const { reason } = req.body;

  if (
    !id ||
    !status ||
    !['padding', 'decline', 'approved'].includes(status as string)
  ) {
    throw new ApiError(400, 'Invalid ID or status');
  }

  const plan: any = await Plan.findById(id).populate('plan_id');

  if (status === 'decline') {
    if (!reason) {
      throw new ApiError(400, 'Reason is required!');
    }

    const notification = await Notification.create({
      title: 'Subscription Application Declined.',
      user: plan.user_id,
      plan_id: plan._id,
      message: `We regret to inform you that your application has been declined. Reason: ${reason}. Please correct your information and resubmit.`,
    });

    //@ts-ignore
    const socketIo = global.io;
    if (socketIo) {
      socketIo.emit(`notification::${plan.user_id.toString()}`, notification);
    }
  }

  if (status === 'approved') {
    const notification = await Notification.create({
      title: 'Subscription Application Update.',
      user: plan.user_id,
      plan_id: plan._id,
      message: `Your subscription application has been approved. Please complete your payment ${plan.plan_id.fee} to activate your plan.`,
    });

    //@ts-ignore
    const socketIo = global.io;
    if (socketIo) {
      socketIo.emit(`notification::${plan.user_id.toString()}`, notification);
    }
  }

  const updatedPlan = await Plan.findByIdAndUpdate(
    id,
    { status, declineReason: reason, active: true },
    { new: true, runValidators: true },
  );

  if (!updatedPlan) {
    throw new ApiError(404, 'Plan not found');
  }

  return updatedPlan;
};

const mySubscription = async (req: Request) => {
  const { userId } = req.user as IReqUser;

  const isExistUser = await User.findById(userId);

  if (!isExistUser) {
    throw new ApiError(404, 'User not found');
  }
  const subscription = await Plan.findOne({ user_id: userId }).populate("plan_id");

  if (!subscription) {
    return null;
  }
  return subscription;
};

const myMembership = async (req: Request) => {
  const { userId } = req.params;
  const profile = await User.findById(userId);  
  if (!profile) {
    throw new ApiError(404, 'User not found');
  }
  const plan = await Plan.findOne({ user_id: userId })
  .populate("plan_id")
   .select("amount planStartDate planEndDate plan_type status name email" )  
   const point = await Point.findOne({user: userId}) as IPoints

  return { profile, plan, point : point? point?.points: 0 }
}

const getPointList = async (req: Request) =>{
  const {userId} = req.params;
  if (!userId) {
    throw new ApiError(401, 'User not authenticated');
  }
  const points = await Point.findOne({user: userId});
 return points
}

const getPlanSwapHistory = async (req: Request) =>{
  const {userId} = req.params;
  if (!userId) {
    throw new ApiError(401, 'User not authenticated');
  } 
  const points = await Point.findOne({user: userId});

  const swapHistory = await Swap.find({
    
  })
 return points
}

export const UpgradePlanService = {
  updateSubscription,
  AllSubscriber,
  mySubscription,
  createSubscription,
  statusUpdateRequest,
  getSubscribeData,
  myMembership,
  getPointList,
  getPlanSwapHistory
};
