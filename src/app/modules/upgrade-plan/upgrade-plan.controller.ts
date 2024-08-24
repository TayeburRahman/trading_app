import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchasync';
import sendResponse from '../../../shared/sendResponse';
import { UpgradePlanService } from './upgrade-plan.service';

const upgradeSubscription = catchAsync(async (req: Request, res: Response) => {
  const result = await UpgradePlanService.upgradeSubscription(req);
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

const mySubscription = catchAsync(async (req: Request, res: Response) => {
  const result = await UpgradePlanService.mySubscription(req);
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
};
