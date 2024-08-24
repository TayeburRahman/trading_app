/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Request } from 'express';
import ApiError from '../../../errors/ApiError';
import User from '../auth/auth.model';
import { Subscription } from '../subscriptions/subscriptions.model';
import { Plan } from './upgrade-plan.model';
import QueryBuilder from '../../../builder/QueryBuilder';
import { IReqUser } from '../auth/auth.interface';
import Notification from '../notifications/notifications.model';

const upgradeSubscription = async (req: Request) => {
  const { planId, transactionId, payment_status, amount } = req.body;

  const checkUser = await User.findById(req?.user?.userId);

  if (!checkUser) {
    throw new ApiError(404, 'User not found');
  }
  const subscriptionPlan = await Subscription.findById(planId);

  if (!subscriptionPlan) {
    throw new ApiError(404, 'Plan not found');
  }
  checkUser.isSubscribed = true;

  const startDate = new Date();
  const endDate = new Date(
    startDate.getTime() + subscriptionPlan.duration * 24 * 60 * 60 * 1000,
  );

  const subscription = await Plan.create({
    amount,
    startDate,
    endDate,
    plan_id: planId,
    plan_type: subscriptionPlan?.planName,
    user_id: req?.user?.userId,
    payment_status: payment_status,
    status: 'active',
    transactionId: transactionId,
  });
  await checkUser.save();
  const notification = await Notification.create({
    user: checkUser?._id,
    title: 'Unlock New Subscription Plan',
    message: `Unlock New Plan From ${checkUser?.name} on ${subscriptionPlan?.planName} Subscription.`,
  });
  //@ts-ignore
  global.io.to(checkUser?._id.toString()).emit('notification', notification);
  return subscription;
};
const AllSubscriber = async (query: Record<string, unknown>) => {
  const subscriptionsQuery = new QueryBuilder(
    Plan.find().populate('user_id'),
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

const mySubscription = async (req: Request) => {
  const { userId } = req.user as IReqUser;
  const isExistUser = await User.findById(userId);
  if (!isExistUser) {
    throw new ApiError(404, 'User not found');
  }
  const subscription = await Subscription.findOne({ user_id: userId }).sort({
    createdAt: -1,
  });
  if (!subscription) {
    return null;
  }
  return subscription;
};
export const UpgradePlanService = {
  upgradeSubscription,
  AllSubscriber,
  mySubscription,
};
