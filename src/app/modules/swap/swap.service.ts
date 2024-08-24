import { Request } from 'express';
import { ISwap } from './swap.interface';
import ApiError from '../../../errors/ApiError';
import { Swap } from './swap.model';
import User from '../auth/auth.model';
import { IReqUser } from '../auth/auth.interface';
// import { Point } from '../points/points.model';
import { Product } from '../products/products.model';
import { Point } from '../points/points.model';

const makeSwap = async (req: Request) => {
  const user = req.user as IReqUser;
  const payload = req.body as ISwap;
 
  const isExistUSer = await User.findById(user.userId);
  if (!isExistUSer) {
    throw new ApiError(404, 'Requested User not found');
  }

  if (!payload.productFrom || !payload.productTo || !payload.userTo) {
    throw new ApiError(400, 'Product or User is missing');
  }

  console.log("user",isExistUSer)

  return await Swap.create({
    userFrom: user.userId,
    userTo: payload.userTo,
    productFrom: payload.productFrom,
    productTo: payload.productTo,
  });
};

const pendingSwap = async (req: Request) => {
  const { userId } = req.user as IReqUser;
  const swaps = await Swap.find({ userFrom: userId });

  return swaps;
};

const swapDetails = async (id: string) => {
  return await Swap.findById(id).populate('productFrom').populate('productTo');
};

const approveSwap = async (req: Request) => {
  const { id } = req.params;
  const user = req.user as IReqUser;

  // Check if the swap exists
  const isExist = await Swap.findById(id);
  if (!isExist) {
    throw new ApiError(404, 'Swap not found');
  }

  // Check if the products exist
  const isExistFromProduct = await Product.findOne({ _id: isExist.productFrom });
  if (!isExistFromProduct) {
    throw new ApiError(404, 'Product from not found');
  }
 
  const isExistToProduct = await Product.findOne({ _id: isExist.productTo });
  if (!isExistToProduct) {
    throw new ApiError(404, 'Product to not found');
  }

  // Check if the swap is already approved
  if (isExist.isApproved === 'approved') {
    throw new ApiError(400, 'Swap already approved');
  }

  // Calculate points
  const fromUserPoints = (Number(isExistFromProduct.productValue) * 20) / 100;
  const toUserPoints = (Number(isExistToProduct.productValue) * 20) / 100;
  const earnPointFromUser = Math.floor(fromUserPoints);
  const earnPointToUser = Math.floor(toUserPoints);

  // Approve the swap
  const resultApv = await Swap.findByIdAndUpdate(
    id,
    {  isApproved: 'approved',
      swapUserToPoint: earnPointToUser,
      swapUserFromPoint: earnPointFromUser
    },
    { new: true }
  );
  // Update points for the user receiving the product (or create if not exists)
  await Point.findOneAndUpdate(
    { user: isExist.userFrom },
    { $inc: { points: earnPointFromUser } },
    { new: true, upsert: true }
  );

  // Update points for the user giving the product (or create if not exists)
  const data = await Point.findOneAndUpdate(
    { user: isExist.userTo },
    { $inc: { points: earnPointToUser } },
    { new: true, upsert: true }
  );
  // Optionally return the result of the approval
  return resultApv;
};
 
const rejectSwap = async (id: string) => {
  const isExist = await Swap.findById(id);
  if (!isExist) {
    throw new ApiError(404, 'Product not found');
  }
  return await Swap.findByIdAndUpdate(
    id,
    { isApproved: 'rejected' },
    { new: true },
  );
};

const getUsersSwapProduct = async (req: Request) => {
  const user = req.user as IReqUser;
  const title = req.query.productName as string | undefined;  

  try {
    const baseQuery: any = {
      $and: [
        {
          $or: [
            { userFrom: user.userId },
            { userTo: user.userId }
          ]
        },
        { isApproved: 'approved' }
      ]
    };   

    const populateFields = [
      { path: 'user', select: 'name email phone_number profile_image address' },
      { path: 'category', select: 'name image' },
      { path: 'subCategory', select: 'name' }
    ];
    
    const swaps : any[] = await Swap.find(baseQuery)
      .populate({
        path: 'productFrom',
        populate: populateFields
      })
      .populate({
        path: 'productTo',
        populate: populateFields
      });

      if (title) {
        const regex = new RegExp(title, 'i');   
        return swaps.filter(swap  => 
          (swap.productFrom && regex.test(swap.productFrom.title)) ||
          (swap.productTo && regex.test(swap.productTo.title))
        );
      }

    return swaps;

  } catch (error) {
    console.error("Error fetching swaps:", error);
    throw new Error("Failed to fetch swaps");
  }
};

export const SwapService = {
  makeSwap,
  pendingSwap,
  swapDetails,
  approveSwap,
  rejectSwap,
  getUsersSwapProduct
};
