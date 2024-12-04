import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchasync';
import sendResponse from '../../../shared/sendResponse';
import { UpgradePlanService } from './user-plan.service';
import { IReqUser } from '../auth/auth.interface';

const createSubscription = catchAsync(async (req: Request, res: Response) => {
  const result = await UpgradePlanService.createSubscription(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Plan upgrade successful',
    data: result,
  });
});

const upgradeSubscription = catchAsync(async (req: Request, res: Response) => {
  const result = await UpgradePlanService.updateSubscription(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Plan upgrade successful',
    data: result,
  });
});

const AllSubscriber = catchAsync(async (req: Request, res: Response) => {
  const result = await UpgradePlanService.AllSubscriber(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Plan retrieved successful',
    data: result,
  });
});

const getSubscribeData = catchAsync(async (req: Request, res: Response) => {
  const result = await UpgradePlanService.getSubscribeData(req.params);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Plan retrieved successful',
    data: result,
  });
});

const statusUpdateRequest = catchAsync(async (req: Request, res: Response) => {
  const result = await UpgradePlanService.statusUpdateRequest(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Plan Update successful',
    data: result,
  });
});

const mySubscription = catchAsync(async (req: Request, res: Response) => {
  const result = await UpgradePlanService.mySubscription(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'My Plan retrieved successful',
    data: result,
  });
});

const myMembership = catchAsync(async (req: Request, res: Response) => {
  const result = await UpgradePlanService.myMembership(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'My Plan retrieved successful',
    data: result,
  });
});

const getPointList = catchAsync(async (req: Request, res: Response) => {
  const result = await UpgradePlanService.getPointList(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'My Plan retrieved successful',
    data: result,
  });
});

 

 

export const UpgradePlanController = {
  upgradeSubscription,
  AllSubscriber,
  mySubscription,
  createSubscription,
  statusUpdateRequest,
  getSubscribeData,
  myMembership,
  getPointList
};
