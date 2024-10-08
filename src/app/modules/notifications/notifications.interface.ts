import { Types } from 'mongoose';
import { IUser } from '../auth/auth.interface';
import { IUpgradePlan } from '../user-subscription/user-plan.interface';

export type INotification = {
  title: string;
  message: string;
  status: boolean;
  admin: boolean;
  plan_id: Types.ObjectId | IUpgradePlan;
  user: Types.ObjectId | IUser;
};
