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
import mongoose from 'mongoose';
import { sendPushNotification } from '../push-notification/push.notifications';

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
  const data = req.body;
  const { userId } = req.user as IReqUser;

  if (!data.plan_id || !data.plan_type) {
    throw new ApiError(400, 'Plan ID and Plan Type are required');
  }

  const checkUser = await User.findById(userId);
  if (!checkUser) {
    throw new ApiError(404, 'User not found');
  }

  const subscriptionPlan = await Subscription.findById(data.plan_id) as ISubscriptions;
  if (!subscriptionPlan) {
    throw new ApiError(404, 'Plan not found');
  }

  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);

  data.planStartDate = startDate;
  data.planEndDate = endDate;
  data.user_id = userId;

  try {
    const userPlan = await Plan.findOne({ user_id: userId });
    if (userPlan?.payment_status === 'trial' && data.plan_type === "Trial") {
      throw new ApiError(400, 'User already has a trial plan');
    }

    const existingPlan = await Plan.findOne({ user_id: userId, payment_status: { $in: ['unpaid', 'trial'] } });
    if (existingPlan) {
      await Plan.deleteMany({ user_id: userId, payment_status: { $in: ['unpaid', 'trial'] } });
    }

    data.payment_status = data.plan_type === 'Trial' ? 'trial' : 'unpaid';

    const subscription = await Plan.create([data]) as any;

    checkUser.userType = data.plan_type;
    checkUser.planExpatDate = endDate;
    await checkUser.save();

    const notifications = [
      {
        user: checkUser._id,
        title: 'Subscription Plan Request!',
        message: `Request Unlock New Plan From ${checkUser.name} on ${subscriptionPlan.planName} Subscription Successful.`,
      },
      {
        admin: true,
        plan_id: subscription?._id,
        title: 'New user applied!',
        message: `A new user has applied for ${subscriptionPlan.planName} membership packages and waiting for approval, review the application for approval.`,
      },
    ];

    await Notification.create(notifications);
    //@ts-ignore
    global.io.to(checkUser._id.toString()).emit('notification', notifications);

    return {
      message: 'Subscription created successfully',
      subscription,
    };
  } catch (error: any) {
    console.error('Transaction error:', error.message);
    throw new ApiError(500, 'Failed to create subscription');
  }
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

// ----
const statusUpdateRequest = async (req: Request) => {
  const { id } = req.params;
  const { status } = req.query;
  const { reason } = req.body;

  console.log("Received Request:", { id, status, reason });

  // Validate input
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid ID format');
  }
  if (!status || !['padding', 'decline', 'approved'].includes(status as string)) {
    throw new ApiError(400, 'Invalid status value');
  }

  const plan: any = await Plan.findById(id).populate('plan_id');
  if (!plan) {
    throw new ApiError(404, 'Plan not found');
  }

  // Decline status logic
  if (status === 'decline') {
    if (!reason) {
      throw new ApiError(400, 'Reason is required for declining');
    }

    await sendNotification(
      plan.user_id,
      'Subscription Application Declined.',
      `We regret to inform you that your application has been declined. Reason: ${reason}. Please correct your information and resubmit.`,
      plan._id
    );
  }

  // Prevent duplicate approval
  if (plan?.status === 'approved') {
    throw new ApiError(400, 'Plan already approved');
  }

  // Approved status logic
  if (status === 'approved') {
    await sendNotification(
      plan.user_id,
      'Subscription Application Update.',
      `Your subscription application has been approved. Please complete your payment ${plan.plan_id.fee} to activate your plan.`,
      plan._id
    );
  }

  // Update plan
  const updatedPlan = await Plan.findByIdAndUpdate(
    id,
    {
      status,
      ...(status === 'decline' ? { declineReason: reason } : {}),
      active: status === 'approved',
    },
    { new: true, runValidators: true }
  );

  if (!updatedPlan) {
    throw new ApiError(404, 'Plan not found during update');
  }


  return updatedPlan;
};
const sendNotification = async (
  userId: string,
  title: string,
  message: string,
  planId: string
) => {
  const notification = await Notification.create({
    title,
    user: userId,
    plan_id: planId,
    message,
  });

  const dbReceiver = await User.findById(userId)
  if (dbReceiver?.deviceToken) {
    const payload = {
      title: title,
      body: message
    };
    sendPushNotification({ fcmToken: dbReceiver?.deviceToken, payload });
  }

  //@ts-ignore
  const socketIo = global.io;
  if (socketIo) {
    socketIo.emit(`notification::${userId}`, notification);
  } else {
    console.error('Socket.io is not initialized');
  }
};
// ----

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
    .select("amount planStartDate planEndDate plan_type status name email")
  const point = await Point.findOne({ user: userId }) as IPoints

  return { profile, plan, point: point ? point?.points : 0 }
}

const getPointList = async (req: Request) => {
  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(401, 'User not authenticated');
  }
  const points = await Point.findOne({ user: userId });
  return points
}

const getPlanSwapHistory = async (req: Request) => {
  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(401, 'User not authenticated');
  }
  const points = await Point.findOne({ user: userId });

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
