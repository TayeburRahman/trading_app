import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchasync';
import sendResponse from '../../../shared/sendResponse';
import { ISubscriptions } from './subscriptions.interface';
import { SubscriptionService } from './subscriptions.service';

const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionService.insertIntoDB(req.body);
  sendResponse<ISubscriptions>(res, {
    statusCode: 200,
    success: true,
    message: 'Subscriptions create successfully',
    data: result,
  });
});
const updateSubscription = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionService.updateSubscription(req);
  sendResponse<ISubscriptions>(res, {
    statusCode: 200,
    success: true,
    message: 'Subscriptions update successfully',
    data: result,
  });
});
const deleteSubscription = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionService.deleteSubscription(req.params.id);
  sendResponse<ISubscriptions>(res, {
    statusCode: 200,
    success: true,
    message: 'Subscriptions delete successfully',
    data: result,
  });
});
const subscriptions = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionService.subscriptions();
  sendResponse<ISubscriptions[]>(res, {
    statusCode: 200,
    success: true,
    message: 'Subscriptions Retrieved successfully',
    data: result,
  });
});

export const SubscriptionController = {
  insertIntoDB,
  subscriptions,
  updateSubscription,
  deleteSubscription,
};
