/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

import ApiError from '../../../errors/ApiError';
import { IRegistration, IReqUser } from '../auth/auth.interface';
import User from '../auth/auth.model';
import { Plan } from '../user-subscription/user-plan.model';

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
  const plan = await Plan.findOne({plan_id: userId, active: true})

  console.log("=====", plan)

  if (!result) {
    throw new ApiError(404, 'Profile not found');
  }

  return {result, planStartDate: plan?.planStartDate, planEndDate: plan?.planEndDate};
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

export const AdminService = {
  registerAdmin,
  getAllAdmin,
  getMyProfile,
  getUserProfile,
};
