import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchasync';
import { DashboardService } from './dashboard.service';
import sendResponse from '../../../shared/sendResponse';

const totalCount = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardService.totalCount();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Retrieved successfully',
    data: result,
  });
});

const getMonthlySubscriptionGrowth = catchAsync(
  async (req: Request, res: Response) => {
    const year = req.query.year
      ? parseInt(req.query.year as string, 10)
      : undefined;
    const result = await DashboardService.getMonthlySubscriptionGrowth(year);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Data retrieved successful',
      data: result,
    });
  },
);

const getMonthlyUserGrowth = catchAsync(async (req: Request, res: Response) => {
  const year = req.query.year
    ? parseInt(req.query.year as string, 10)
    : undefined;
  const result = await DashboardService.getMonthlyUserGrowth(year);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Data retrieved successful',
    data: result,
  });
});

const approveUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id;
  const result = await DashboardService.approveUser(userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User approved successfully',
    data: result,
  });
});

const rejectUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id;
  const result = await DashboardService.rejectUser(userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User rejected successfully',
    data: result,
  });
});

const getLatestPendingUsers = catchAsync(
  async (req: Request, res: Response) => {
    const result = await DashboardService.latestPendingUsers();
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Pending users retrieved successfully',
      data: result,
    });
  },
);

const getUserTypePoints = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardService.getUserTypePoints();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Retrieved successfully',
    data: result,
  });
});

const getIncomeDebag = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardService.getIncomeDebag();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Retrieved successfully',
    data: result,
  });
});

 

export const DashboardController = {
  totalCount,
  getMonthlySubscriptionGrowth,
  getMonthlyUserGrowth,
  approveUser,
  rejectUser,
  getLatestPendingUsers,
  getUserTypePoints,
  getIncomeDebag
};
