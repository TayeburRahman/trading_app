import { Types } from 'mongoose';
import { IUser } from '../auth/auth.interface';


export type IPointsDetails = {
  title: string;
  point: number; 
  date: Date;
};

export type IPoints = {
  user: Types.ObjectId | IUser;
  points: number;
  details: IPointsDetails[];
};
