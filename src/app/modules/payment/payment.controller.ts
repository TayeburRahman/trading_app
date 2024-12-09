import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchasync';
import { PaymentService } from './payment.service';
import sendResponse from '../../../shared/sendResponse';

const makePaymentIntent = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.makePaymentIntent(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payment intent create successfully',
    data: result,
  });
  
});

const paymentSuccessAndSave = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.paymentSuccessAndSave(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Save successfully',
    data: result,
  });
  
});


const getTotalIncomeByPlanType = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.getAllPlanIncome();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Successfully',
    data: result,
  });
  
});

const getTransitionsHistory = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.getTransitionsHistory();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Successfully',
    data: result,
  });
  
});



 
 

 

export const PaymentController = {
  makePaymentIntent,
  paymentSuccessAndSave,
  getTotalIncomeByPlanType,
  getTransitionsHistory
};
