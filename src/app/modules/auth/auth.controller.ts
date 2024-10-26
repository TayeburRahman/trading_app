/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Request, RequestHandler, Response } from 'express';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchasync';
import config from '../../../config';
import { IUser } from './auth.interface';
import { AuthService } from './auth.service';

const registrationUser: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    await AuthService.registrationUser(req.body);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Please check your email to active your account`,
    });
  },
);

const activateUser: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AuthService.activateUser(req.body);
    const { refreshToken } = result;
    // set refresh token into cookie
    const cookieOptions = {
      secure: config.env === 'production',
      httpOnly: true,
    };
    res.cookie('refreshToken', refreshToken, cookieOptions);
    // await AuthService.activateUser(req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'User activate successful',
      data: result,
    });
  },
);

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.getAllUsers(req.query);
  sendResponse<IUser[]>(res, {
    statusCode: 200,
    success: true,
    message: 'User retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await AuthService.deleteUser(id);
  sendResponse<IUser>(res, {
    statusCode: 200,
    success: true,
    message: 'User deleted successfully',
    data: result,
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const { ...loginData } = req.body;
  const result = await AuthService.loginUser(loginData);
  const { refreshToken } = result;
  // set refresh token into cookie
  const cookieOptions = {
    secure: config.env === 'production',
    httpOnly: true,
  };
  res.cookie('refreshToken', refreshToken, cookieOptions);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Login Successful!',
    data: result,
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const { ...passwordData } = req.body;
  const user = req.user;
  console.log(user, passwordData, 'user, passwordData');
  await AuthService.changePassword(user, passwordData);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Password change successfully !',
  });
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.updateProfile(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Profile update successfully',
    data: result,
  });
});

const forgotPass = catchAsync(async (req: Request, res: Response) => {
  await AuthService.forgotPass(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Check your email!',
  });
});

const checkIsValidForgetActivationCode = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AuthService.checkIsValidForgetActivationCode(req.body);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Success!',
      data: result,
    });
  },
);

const resendActivationCode: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const data = req.body;

    const result = await AuthService.resendActivationCode(data);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Resend successfully',
      data: result,
    });
  },
);

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  // const token = req.headers.authorization || '';
  await AuthService.resetPassword(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Account recovered!',
  });
});

const deleteMyAccount = catchAsync(async (req: Request, res: Response) => {
  await AuthService.deleteMyAccount(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Account deleted!',
  });
});

const block_unblockUser = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result: any = await AuthService.block_unblockUser(id);
  sendResponse<IUser>(res, {
    statusCode: 200,
    success: true,
    message: `User ${result.is_block ? 'Blocked' : 'Unblocked'} successfully`,
    data: result,
  });
});

const resendVerificationCode = catchAsync(async (req: Request, res: Response) => {
  // const token = req.headers.authorization || '';
  await AuthService.resendVerificationCode(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Account recovered!',
  });
});

 

export const AuthController = {
  getAllUsers,
  deleteUser,
  registrationUser,
  login,
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
