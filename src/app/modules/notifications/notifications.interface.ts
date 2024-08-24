import { Types } from 'mongoose';
import { IUser } from '../auth/auth.interface';

export type INotification = {
  title: string;
  message: string;
  status: boolean;
  user: Types.ObjectId | IUser;
};
