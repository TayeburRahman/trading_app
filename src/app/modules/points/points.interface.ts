import { Types } from 'mongoose';
import { IUser } from '../auth/auth.interface';

export type IPoints = {
  user: Types.ObjectId | IUser;
  points: number;
};
