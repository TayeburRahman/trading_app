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

const createSubscription = async (req: Request) => {
  let data = req.body;

  const checkUser = await User.findById(req?.user?.userId);

  if (!checkUser) {
    throw new ApiError(404, 'User not found');
  }

  const subscriptionPlan = await Subscription.findById(data.planId);

  if (!subscriptionPlan) {
    throw new ApiError(404, 'Plan not found');
  }

  checkUser.isSubscribed = true;

  const startDate = new Date();
  const endDate = new Date(
    startDate.getTime() + subscriptionPlan.duration * 24 * 60 * 60 * 1000,
  );
  data.planEndDate = endDate;

  const subscription = await Plan.create(data);

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
    throw new ApiError(404, 'Subscription not found');
  }

  return updatedSubscription;
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

const statusUpdateRequest = async (req: Request) => {
  const { id } = req.params;
  const { status } = req.query;

  if (
    !id ||
    !status ||
    !['padding', 'decline', 'approved'].includes(status as string)
  ) {
    throw new ApiError(400, 'Invalid ID or status');
  }

  const updatedPlan = await Plan.findByIdAndUpdate(
    id,
    { status },
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
  const subscription = await Subscription.findOne({ user_id: userId }).sort({
    createdAt: -1,
  });
  if (!subscription) {
    return null;
  }
  return subscription;
};

export const UpgradePlanService = {
  updateSubscription,
  AllSubscriber,
  mySubscription,
  createSubscription,
  statusUpdateRequest,
};
