import { Request, RequestHandler, Response } from 'express';
import catchAsync from '../../../shared/catchasync';
import sendResponse from '../../../shared/sendResponse';
import { AdminService } from './admin.service';

const registerAdmin: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AdminService.registerAdmin(req.body);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Admin Created`,
      data: result,
    });
  },
);

const getAllAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAllAdmin();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'successful!',
    data: result,
  });
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  //@ts-ignore
  const result = await AdminService.getMyProfile(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'successful!',
    data: result,
  });
});

const getUserProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getUserProfile(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'successful!',
    data: result,
  });
});

export const AdminController = {
  registerAdmin,
  getAllAdmin,
  getMyProfile,
  getUserProfile,
};
