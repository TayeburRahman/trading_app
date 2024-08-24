import { Request } from 'express';

import ApiError from '../../../errors/ApiError';
import httpStatus from 'http-status';
import { Ratting } from './rattings.model';
import { Types } from 'mongoose';
import { IReqUser } from '../auth/auth.interface';
import User from '../auth/auth.model';
import { Swap } from '../swap/swap.model';

const insertIntoDB = async (req: Request) => {
  const { userId } = req.user as IReqUser;
  const { swapId, ratting, comment } = req.body;
  const isExistUser = await User.findById(userId);
  if (!isExistUser) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const isExistSwap = await Swap.findById(swapId);

  if (!isExistSwap) {
    throw new ApiError(404, 'Swap not found');
  }

  return await Ratting.create({
    user: userId,
    swapOwner: isExistSwap?.userTo,
    swapId,
    ratting,
    comment,
  });
};

const averageRatting = async (req: Request) => {
  const { id } = req.params;
  const swapObjectId = new Types.ObjectId(id);
  const result = await Ratting.aggregate([
    { $match: { swap: swapObjectId } },
    {
      $group: {
        _id: '$swap',
        averageRating: { $avg: '$ratting' },
      },
    },
  ]);

  if (result.length > 0) {
    const averageRating = result[0].averageRating.toFixed(2);
    return Number(averageRating);
  } else {
    return {
      message: 'No ratings found for this swap.',
    };
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
