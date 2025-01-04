import { Request } from 'express';
import ApiError from '../../../errors/ApiError';
import httpStatus from 'http-status';
import { Ratting } from './rattings.model';
import { Types } from 'mongoose';
import { IReqUser, IUser } from '../auth/auth.interface';
import User from '../auth/auth.model';
import { Swap } from '../swap/swap.model';
import { makePoints } from '../points/points.services';
import { Point } from '../points/points.model';
import { Subscription } from '../subscriptions/subscriptions.model';

const insertIntoDB = async (req: Request): Promise<any> => {
  const { userId } = req.user as IReqUser;
  const { swapId, ratting, comment } = req.body;

  const isExistUser = await User.findById(userId);
  if (!isExistUser) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const planName = isExistUser.userType === 'Trial' ? 'Gold' : isExistUser.userType;
  const isPackagtes = await Subscription.findOne({ planName });
  if (!isPackagtes) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User subscription plan not found');
  }

  const isExistSwap = await Swap.findByIdAndUpdate(
    swapId,
    { $addToSet: { ratting: userId } },
    { new: true }
  );
  if (!isExistSwap) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Swap not found');
  }

  const points = await makePoints(ratting, isPackagtes);
  const pointChange = ratting >= 3 ? points : -points;


  const updatePoint = await Point.findOneAndUpdate(
    { user: userId },
    {
      $inc: { points: pointChange },
      $addToSet: {
        details: {
          title: ratting >= 3 ? 'Earn by positive comments!' : 'Lose by nagitive comments!',
          point: pointChange,
          date: new Date(),
        },
      },
    },
    { new: true }
  );
  if (!updatePoint) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  return await Ratting.create({
    user: userId,
    swapOwner: isExistSwap.userTo,
    swap: swapId,
    ratting,
    comment,
  });
};

const averageRatting = async (req: Request) => {
  const { userId } = req.user as IReqUser;

  try {
    const result = await Ratting.aggregate([
      { $match: { swapOwner: new Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$swapOwner',
          averageRating: { $avg: '$ratting' },
        },
      },
    ]);

    if (result.length > 0) {
      const averageRating = Number(result[0].averageRating.toFixed(2));
      return { averageRating };
    } else {
      return { message: 'No ratings found for this user.' };
    }
  } catch (error) {
    console.error('Error calculating average rating:', error);
    return { message: 'An error occurred while calculating the average rating.' };
  }
};

const myRattingAndReview = async (req: Request) => {
  const { userId } = req.user as IReqUser;
  return await Ratting.find({ swapOwner: userId })
    .populate("swapOwner")
    .populate("swap")
    .populate('user')
};



export const RattingService = {
  insertIntoDB,
  averageRatting,
  myRattingAndReview,
};
