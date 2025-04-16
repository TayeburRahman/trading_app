/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Types } from 'mongoose';
import ApiError from '../../../errors/ApiError';
import { IRegistration, IReqUser, IUser } from '../auth/auth.interface';
import User from '../auth/auth.model';
import { Ratting } from '../rattings/rattings.model';
import { Plan } from '../user-subscription/user-plan.model';
import { IPoints } from '../points/points.interface';
import { Point } from '../points/points.model';
import cron from 'node-cron';
import { logger } from '../../../shared/logger';
import config from '../../../config';


//!
const registerAdmin = async (payload: IRegistration) => {
  const { email, password, confirmPassword } = payload;
  if (password !== confirmPassword) {
    throw new ApiError(400, "Password and ConfirmPassword didn't match");
  }
  const isEmailExist = await User.findOne({ email });
  if (isEmailExist) {
    throw new ApiError(400, 'Email already exist');
  }
  payload.role = 'ADMIN';

  const newUser = await User.create({ ...payload, isActive: true });

  const { password: omit, ...userWithoutPassword } = newUser.toObject();
  return userWithoutPassword;
};

const getAllAdmin = async () => {
  const results = await User.find({ role: 'ADMIN' }).lean();
  return results;
};

const getMyProfile = async (req: Request) => {
  //@ts-ignore
  const { userId } = req.user as IReqUser;

  if (!userId) {
    throw new ApiError(401, 'User not authenticated');
  }
  const result = await User.findById(userId);
  const plan = await Plan.findOne({ user_id: userId, active: true })


  if (!result) {
    throw new ApiError(404, 'Profile not found');
  }

  const rattingDB: any = await Ratting.aggregate([
    { $match: { swapOwner: new Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$swapOwner',
        averageRating: { $avg: '$ratting' },
      },
    },
  ]);

  let average_rating = 0;
  if (rattingDB?.length > 0) {
    average_rating = Number(rattingDB[0].averageRating.toFixed(2));
  }

  const point = await Point.findOne({ user: userId }) as IPoints


  return { result, planStartDate: plan?.planStartDate, planEndDate: plan?.planEndDate, ratting: average_rating, point: point ? point?.points : 0 };
};

const getUserProfile = async (req: any) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(401, 'User not authenticated');
  }
  const result = await User.findById(userId);

  if (!result) {
    throw new ApiError(404, 'Profile not found');
  }

  return result;
};



const subscriptionsFeature = async (req: any) => {
  const user = req.user as IReqUser;

  const userDb = await User.findById(user.userId) as IUser;

  if (!userDb) {
    throw new ApiError(400, "User Not Found!")
  }

  let result = false

  if (config.subscriptions_feature === "LIVE" && userDb.email.toString() === config?.default_user?.toString()) {
    result = false
  } else if (config.subscriptions_feature === "LIVE") {
    result = true;
  } else {
    result = false
  }
  return { result };
};


export const AdminService = {
  registerAdmin,
  getAllAdmin,
  getMyProfile,
  getUserProfile,
  subscriptionsFeature
};
