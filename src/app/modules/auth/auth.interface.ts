/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { Model } from 'mongoose';
export type IEmailOptions = {
  email: string;
  subject: string;
  // template: string;
  // data?: { [key: string]: any };
  html: any;
};
export type IRegistration = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  avatar?: string;
  phone_number?: string;
  role?: string;
};
export type IActivationToken = {
  //i will do it , but what? its hello world.
  token: string;
  activationCode: string;
};
export type IActivationRequest = {
  userEmail: string;
  activation_code: string;
};
export type IReqUser = {
  userId: string;
  role: string;
};

export type Ireting = {
  userId: string;
};

export type IUser = {
  [x: string]: any;
  _id?: string;
  name: string;
  email: string;
  phone_number: string;
  password: string;
  deviceToken: string;
  address: string;
  role: 'ADMIN' | 'SUPER_ADMIN' | 'USER';
  profile_image: string;
  cover_image: string;
  gender: 'male' | 'female' | 'others' | '';
  isSubscribed: boolean;
  is_block: boolean;
  verifyCode: any;
  activationCode: any;
  verifyExpire: Date | any;
  isActive: boolean;
  expirationTime: Date;
  isPaid: boolean;
  points: number;
  isApproved: boolean;
  userType: 'Gold' | 'Platinum' | 'Diamond' | 'Trial';
  conversationId: string;
  planExpatDate: Date | any;
};
export type UserModel = {
  isUserExist(
    email: string,
  ): Promise<Pick<IUser, '_id' | 'email' | 'password' | 'role'>>;
  isPasswordMatched(
    givenPassword: string,
    savedPassword: string,
  ): Promise<boolean>;
} & Model<IUser>;
