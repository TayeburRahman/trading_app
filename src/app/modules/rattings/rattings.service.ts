import { Request } from 'express';

import ApiError from '../../../errors/ApiError';
import httpStatus from 'http-status';
import { Ratting } from './rattings.model';
import { Types } from 'mongoose';
import { IReqUser } from '../auth/auth.interface';
import User from '../auth/auth.model';
import { Swap } from '../swap/swap.model'; 
import { makePoints } from '../points/points.services';
import { Point } from '../points/points.model';

const insertIntoDB = async (req: Request) => {
  const { userId } = req.user as IReqUser;
  const { swapId, ratting, comment } = req.body;
  const isExistUser = await User.findById(userId);
  if (!isExistUser) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  
  const isExistSwap = await Swap.findByIdAndUpdate(
    swapId,
    { $addToSet: { ratting: userId } },  
    { new: true }
  );

  if (!isExistSwap) {
    throw new ApiError(404, 'Swap not found');
  } 

  const points = await makePoints(ratting, isExistUser.userType) 
  const pointChange = ratting >= 3 ? points : -points; 

  const updatePoint = await Point.findOneAndUpdate(
    { user: userId }, 
    {
      $inc: { points: pointChange },  
      $addToSet: {
        details: {
          title: ratting >= 3 ? "Point Earn for Positive Comment" : "Point Lose for Negative Comment",
          point: pointChange,
          date: new Date(),  
        },
      },
    },
    { new: true }  
  );  

  if(!updatePoint) {
    throw new ApiError(404, 'User not found');
  }  

  return await Ratting.create({
    user: userId,
    swapOwner: isExistSwap?.userTo,
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
  return await Ratting.find({ swapOwner: userId });
};

export const RattingService = {
  insertIntoDB,
  averageRatting,
  myRattingAndReview,
};
