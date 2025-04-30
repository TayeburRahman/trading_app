/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */

import bcrypt from 'bcrypt';
import ApiError from '../../../errors/ApiError';
import cron from 'node-cron';
import { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../../../config';
import { Request } from 'express';
import { jwtHelpers } from '../../../helpers/jwtHelpers';
import { updateImageUrl } from '../../../utils/url-modifier';
import QueryBuilder from '../../../builder/QueryBuilder';
import { IGenericResponse } from '../../../interfaces/paginations';
import httpStatus from 'http-status';
import sendEmail from '../../../utils/sendEmail';
import { registrationSuccessEmailBody } from '../../../mails/user.register';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { sendResetEmail } from '../auth/sendResetMails';
import { logger } from '../../../shared/logger';
import {
  IActivationRequest,
  IRegistration,
  IReqUser,
  IUser,
} from './auth.interface';
import User from './auth.model';
import { userSearchableField } from './auth.constants';
import { sendPushNotification } from '../push-notification/push.notifications';

const registrationUser = async (payload: IRegistration) => {
  const { firstName, lastName, email, password, phone_number, role, confirmPassword } =
    payload as any

  console.log("Auth", role)

  if (!firstName) {
    throw new ApiError(400, "First Name is required!");

  }

  if (!lastName) {
    throw new ApiError(400, "Last Name is required!");
  }

  const user = {
    name: String(firstName + " " + lastName),
    email,
    password,
    phone_number,
    role,
    expirationTime: Date.now() + 5 * 60 * 1000,
    isActive: false
  } as unknown as IUser;

  // if (password !== confirmPassword) {
  //   throw new ApiError(400, "Password and ConfirmPassword didn't match");
  // }
  // const isEmailExist = await User.findOne({ email });
  // if (isEmailExist?.isActive) {
  //   throw new ApiError(400, 'Email already exist');
  // }

  const activationToken = createActivationToken();

  const activationCode = activationToken.activationCode;
  const data = { user: { name: user.name }, activationCode };
  try {
    sendEmail({
      email: user.email,
      subject: 'Activate Your Account',
      html: registrationSuccessEmailBody(data),
    });
  } catch (error: any) {
    throw new ApiError(500, `${error.message}`);
  }

  // user.activationCode = activationCode;
  // await User.create(user);
  return user;
};

//!
const createActivationToken = () => {
  const activationCode = Math.floor(100000 + Math.random() * 900000).toString();
  return { activationCode };
};

//!
const activateUser = async (req: Request) => {
  const { activation_code, userEmail, deviceToken } = req.body;


  const existUser = await User.findOne({ email: userEmail });
  if (!existUser) {
    throw new ApiError(400, 'User not found');
  }
  // console.log(`Activation`, existUser.activationCode, activation_code)
  if (existUser.activationCode !== activation_code) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Code didn't match");
  }
  const user = (await User.findOneAndUpdate(
    { email: userEmail },
    { isActive: true, deviceToken },
    {
      new: true,
      runValidators: true,
    },
  )) as IUser;

  const accessToken = jwtHelpers.createToken(
    {
      userId: existUser._id,
      role: existUser.role,
    },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string,
  );


  const payload = {
    title: 'Account Active Successfully.',
    body: 'You have successfully logged in to your account.',
  };

  sendPushNotification({ fcmToken: deviceToken, payload });


  //Create refresh token
  const refreshToken = jwtHelpers.createToken(
    { userId: existUser._id, role: existUser.role },
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as string,
  );
  return {
    accessToken,
    refreshToken,
    user,
  };
};

cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const result = await User.deleteMany({
      isActive: false,
      expirationTime: { $lte: now },
    });
    if (result.deletedCount > 0) {
      logger.info(`Deleted ${result.deletedCount} expired inactive users`);
    }
  } catch (error) {
    logger.error('Error deleting expired users:', error);
  }
});


const getAllUsers = async (
  query: Record<string, unknown>,
): Promise<IGenericResponse<IUser[]>> => {

  if (query.searchTerm) {
    delete query.page;
  }

  const userQuery = new QueryBuilder(User.find({ role: 'USER' }), query)
    .search(userSearchableField)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await userQuery.modelQuery;
  const meta = await userQuery.countTotal();

  return {
    meta,
    data: result,
  };
};
//!
const updateProfile = async (req: Request): Promise<IUser | null> => {
  //@ts-ignore
  const { files } = req;
  const { userId } = req.user as IReqUser;
  const checkValidUser = await User.findById(userId);
  if (!checkValidUser) {
    throw new ApiError(404, 'You are not authorized');
  }

  let cover_image = undefined;

  //@ts-ignore
  if (files && files.cover_image) {
    //@ts-ignore
    cover_image = `/images/profile/${files.cover_image[0].filename}`;
  }

  let profile_image = undefined;
  //@ts-ignore
  if (files && files.profile_image) {
    //@ts-ignore
    profile_image = `/images/profile/${files.profile_image[0].filename}`;
  }

  //@ts-ignore
  const data = req.body;
  if (!data) {
    throw new Error('Data is missing in the request body!');
  }

  const isExist = await User.findOne({ _id: userId });

  if (!isExist) {
    throw new ApiError(404, 'User not found !');
  }

  const { ...UserData } = data;

  const updatedUserData: Partial<IUser> = { ...UserData };

  const result = await User.findOneAndUpdate(
    { _id: userId },
    { profile_image, cover_image, ...updatedUserData },
    {
      new: true,
    },
  );
  return result;
};
//!
const deleteUser = async (id: string): Promise<IUser | null> => {
  const result = await User.findByIdAndDelete(id);

  return result;
};
//!
const loginUser = async (req: Request) => {
  const { email, password, deviceToken } = req.body;

  const isUserExist = (await User.isUserExist(email)) as IUser;
  const checkUser = await User.findOne({ email }) as IUser;
  if (!isUserExist) {
    throw new ApiError(404, 'User does not exist');
  }

  if (
    isUserExist.password &&
    !(await User.isPasswordMatched(password, isUserExist.password))
  ) {
    throw new ApiError(402, 'Password is incorrect');
  }

  if (!checkUser.isActive) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      'Please active your account then try to login',
    );
  }

  if (checkUser.is_block) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      'User account is blocked. Please contact support for assistance.',
    );
  }



  await User.findOneAndUpdate(
    { email: email },
    { deviceToken },
    {
      new: true,
    }) as IUser;

  const payload = {
    title: 'Login Successfully.',
    body: 'You have successfully logged in to your account.',
  };

  sendPushNotification({ fcmToken: deviceToken, payload });

  const { _id: userId, role } = isUserExist;
  const accessToken = jwtHelpers.createToken(
    { userId, role, conversationId: checkUser?.conversationId },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string,
  );
  //Create refresh token
  const refreshToken = jwtHelpers.createToken(
    { userId, role },
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as string,
  );

  return {
    user: checkUser,
    conversationId: checkUser?.conversationId,
    // isPaid: checkUser?.isPaid,
    accessToken,
    refreshToken,
  };
};
//!
const deleteMyAccount = async (payload: {
  email: string;
  password: string;
}) => {
  const { email, password } = payload;

  const isUserExist = await User.isUserExist(email);
  //@ts-ignore
  if (!isUserExist) {
    throw new ApiError(404, 'User does not exist');
  }

  if (
    isUserExist.password &&
    !(await User.isPasswordMatched(password, isUserExist.password))
  ) {
    throw new ApiError(402, 'Password is incorrect');
  }
  return await User.findOneAndDelete({ email });
};
//!
const changePassword = async (
  user: JwtPayload | null,
  payload: any,
): Promise<void> => {
  const { userId } = user as any;
  //@ts-ignore
  const { oldPassword, newPassword, confirmPassword } = payload;
  if (newPassword !== confirmPassword) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Password and Confirm password not match',
    );
  }
  const isUserExist = await User.findOne({ _id: userId }).select('+password');
  if (!isUserExist) {
    throw new ApiError(404, 'User does not exist');
  }
  if (
    isUserExist.password &&
    !(await User.isPasswordMatched(oldPassword, isUserExist.password))
  ) {
    throw new ApiError(402, 'Old password is incorrect');
  }
  isUserExist.password = newPassword;
  await isUserExist.save();
};
//!
const forgotPass = async (payload: { email: string }) => {
  const user = (await User.findOne({ email: payload.email })) as IUser;

  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User does not exist!');
  }

  const activationCode = forgetActivationCode();
  const expiryTime = new Date(Date.now() + 3 * 60 * 1000);
  user.verifyCode = activationCode;
  user.verifyExpire = expiryTime;
  await user.save();
  try {
    sendResetEmail(
      user.email,
      `
      <div>
        <p>Hi, ${user.name}</p>
        <p>Your password reset Code: ${activationCode}</p>
        <p>Thank you</p>
      </div>
  `,
    );
  } catch (error: any) {
    throw new ApiError(500, `${error.message}`);
  }
  return;
};

//!
const resendVerificationCode = async (payload: { email: string }) => {
  const email = payload.email;
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User does not exist!');
  }

  let profile = null;
  if (user.role === ENUM_USER_ROLE.USER) {
    profile = await User.findOne({ _id: user._id });
  }

  if (!profile) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Profile not found!');
  }

  if (!profile.email) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email not found!');
  }

  const activationCode = forgetActivationCode();
  const expiryTime = new Date(Date.now() + 15 * 60 * 1000);
  user.verifyCode = activationCode;
  user.verifyExpire = expiryTime;
  await user.save();

  try {
    sendResetEmail(
      profile.email,
      ` <div>
          <p>Hi, ${profile.name}</p>
          <p>Your password reset Code: ${activationCode}</p>
          <p>Thank you</p>
        </div>
      `,
    );
  } catch (error: any) {
    throw new ApiError(500, `${error.message}`);
  }

  return;
};
//
const resendActivationCode = async (payload: { email: string }) => {
  const email = payload.email;
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User does not exist!');
  }

  let profile = null;
  if (user.role === ENUM_USER_ROLE.USER) {
    profile = await User.findOne({ _id: user._id });
  }

  if (!profile) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Profile not found!');
  }

  if (!profile.email) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email not found!');
  }

  const activationCode = forgetActivationCode();
  const expiryTime = new Date(Date.now() + 15 * 60 * 1000);
  user.activationCode = activationCode;
  user.verifyExpire = expiryTime;
  await user.save();

  try {
    sendResetEmail(
      profile.email,
      `
     <div style="font-family: Arial, sans-serif; line-height: 1.6;">
       <h2 style="color: #333;">Resend Activation Code</h2>
       <p>Hi ${user.name},</p>
       <p>You recently requested a new activation code. To activate your account, please use the following code:</p>
       <h3 style="background-color: #f1f1f1; padding: 10px; border-radius: 5px; text-align: center;">
         ${activationCode}
       </h3>
       <p>This code is valid for 15 minutes. If you didn't request this, you can safely ignore this email.</p>
       <p>If you need further assistance, feel free to reach out to our support team.</p>
       <p>Thank you!</p>
       <p style="font-size: 0.9em; color: #555;">The [Your App Name] Team</p>
     </div>

  `,
    );
  } catch (error: any) {
    throw new ApiError(500, `${error.message}`);
  }

  return;
};
// Code verify - done
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const result = await User.updateMany(
      {
        isActive: false,
        verifyExpire: { $lte: now },
      },
      {
        $unset: { codeVerify: false },
      },
    );

    if (result.modifiedCount > 0) {
      logger.info(
        `Removed activation codes from ${result.modifiedCount} expired inactive users`,
      );
    }
  } catch (error) {
    logger.error('Error removing activation codes from expired users:', error);
  }
});
const forgetActivationCode = () => {
  const activationCode = Math.floor(100000 + Math.random() * 900000).toString();
  return activationCode;
};
//!
const checkIsValidForgetActivationCode = async (payload: {
  code: string;
  email: string;
}) => {
  const user = await User.findOne({ email: payload.email });

  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User does not exist!');
  }

  if (user.verifyCode !== payload.code) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid reset code!');
  }

  const currentTime = new Date();
  if (currentTime > user.verifyExpire) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Reset code has expired!');
  }

  return { valid: true };
};
//!
const resetPassword = async (payload: {
  email: string;
  newPassword: string;
  confirmPassword: string;
}) => {
  const { email, newPassword, confirmPassword } = payload;

  console.log('===', newPassword, confirmPassword);
  if (newPassword !== confirmPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Password didn't match");
  }
  const user = await User.findOne({ email }, { _id: 1 });

  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User not found!');
  }

  // await jwtHelpers.verifyToken(token, config.jwt.secret as string);

  const password = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  await User.updateOne({ email }, { password }, { new: true });
  user.verifyCode = null;
  user.verifyExpire = null;
  await user.save();
};

const block_unblockUser = async (id: string): Promise<IUser | null> => {
  const isUserExist = await User.findById(id);
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No User Found');
  }
  const result = await User.findByIdAndUpdate(
    { _id: id },
    { is_block: !isUserExist.is_block },
    { new: true },
  );

  console.log("updates all", result);

  return result;
};

export const AuthService = {
  getAllUsers,
  deleteUser,
  registrationUser,
  loginUser,
  changePassword,
  updateProfile,
  forgotPass,
  resetPassword,
  activateUser,
  deleteMyAccount,
  checkIsValidForgetActivationCode,
  resendActivationCode,
  block_unblockUser,
  resendVerificationCode
};
