import { Request, RequestHandler, Response } from 'express';
import catchAsync from '../../../shared/catchasync';
import { SwapService } from './swap.service';
import sendResponse from '../../../shared/sendResponse';

const makeSwap: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await SwapService.makeSwap(req);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Swap successful',
      data: result,
    });
  },
);

const pendingSwap: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await SwapService.pendingSwap(req);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Successful',
      data: result,
    });
  },
);

const swapDetails: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await SwapService.swapDetails(req.params.id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Successful',
      data: result,
    });
  },
);

const approveSwap: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await SwapService.approveSwap(req);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Approve Successful',
      data: result,
    });
  },
);

const rejectSwap: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await SwapService.rejectSwap(req.params.id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Reject Successful',
      data: result,
    });
  },
);

const getUsersSwapProduct: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await SwapService.getUsersSwapProduct(req);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Swap history successfully get!',
      data: result,
    });
  },
);
 

export const SwapController = {
  makeSwap,
  pendingSwap,
  swapDetails,
  approveSwap,
  rejectSwap,
  getUsersSwapProduct
};
