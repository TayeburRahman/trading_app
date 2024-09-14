import { Types } from 'mongoose';
import { IUser } from '../auth/auth.interface';

export type INotification = {
  title: string;
  message: string;
  status: boolean;
  admin: boolean;
  user: Types.ObjectId | IUser;
};
