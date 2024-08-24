import { Request } from 'express';
import ApiError from '../../../errors/ApiError';
import { ISubscriptions } from './subscriptions.interface';
import { Subscription } from './subscriptions.model';

const insertIntoDB = async (payload: ISubscriptions) => {
  return await Subscription.create(payload);
};

const subscriptions = async () => {
  return await Subscription.find();
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
export const SubscriptionService = {
  insertIntoDB,
  subscriptions,
  updateSubscription,
  deleteSubscription,
};
