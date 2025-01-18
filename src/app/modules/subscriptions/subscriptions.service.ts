import { Request } from 'express';
import ApiError from '../../../errors/ApiError';
import { ISubscriptions } from './subscriptions.interface';
import { Subscription } from './subscriptions.model';
import { Plan } from '../user-subscription/user-plan.model';
import User from '../auth/auth.model';

const insertIntoDB = async (payload: ISubscriptions) => {
  return await Subscription.create(payload);
};

const subscriptions = async (req: any) => {
  const query = req.query;
  let userPlan = null;

  console.log("===================", query);

  if (query?.userId) {
    const user = await User.findById(query?.userId);
    if (!user) {
      throw new ApiError(404, 'User not found!');
    }

    const subscriptionsDb = await Plan.find({ user_id: query?.userId, active: true }) as any;
    console.log("subscriptions", subscriptionsDb)
    userPlan = subscriptionsDb.map((sub: any) => sub.plan_id);
  }


  console.log("userPlan", userPlan)

  const result = await Subscription.find().sort({ pointRangeStart: 1 });

  const subscriptionsWithPlanStatus = result.map((subscription: any) => {
    const hasUserPlan = userPlan && userPlan.some((planId: any) => planId.toString() === subscription.plan_id.toString());
    return {
      ...subscription.toObject(),
      hasUserPlan,
    };
  });

  return { subscriptions: subscriptionsWithPlanStatus };
};

const updateSubscription = async (req: Request) => {
  const id = req.params.id;
  const isExist = await Subscription.findOne({ _id: id });

  if (!isExist) {
    throw new ApiError(404, 'Sub Category not found !');
  }

  const { ...categoryData } = req.body;

  const updatedData: Partial<ISubscriptions> = { ...categoryData };

  const result = await Subscription.findOneAndUpdate(
    { _id: id },
    { ...updatedData },
    {
      new: true,
    },
  );
  return result;
};

const deleteSubscription = async (id: string) => {
  const isExist = await Subscription.findOne({ _id: id });

  if (!isExist) {
    throw new ApiError(404, 'Subscription not found !');
  }
  return await Subscription.findByIdAndDelete(id);
};

const subscriptionDetails = async (id: string) => {
  const isExist = (await Subscription.findOne({ _id: id })) as ISubscriptions;

  if (!isExist) {
    throw new ApiError(404, 'Subscription not found !');
  }
  return isExist;
};

export const SubscriptionService = {
  insertIntoDB,
  subscriptions,
  updateSubscription,
  deleteSubscription,
  subscriptionDetails,
};
