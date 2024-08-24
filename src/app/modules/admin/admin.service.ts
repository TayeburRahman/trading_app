/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

import ApiError from '../../../errors/ApiError';
import { IRegistration } from '../auth/auth.interface';
import User from '../auth/auth.model';

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

export const AdminService = {
  registerAdmin,
  getAllAdmin,
};
