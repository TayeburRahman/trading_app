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

const cancelSwapRequest: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    console.log("cancelSwapRequest", req.params.id);
    const result = await SwapService.cancelSwapRequest(req);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Successfully delete!',
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

const partnerProfileDetails: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await SwapService.partnerProfileDetails(req);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Partner profile history successfully get!',
      data: result,
    });
  },
);

const getSwapProductPlanType: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await SwapService.getSwapProductPlanType(req);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Partner profile history successfully get!',
      data: result,
    });
  },
);


const createReports: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await SwapService.createReports(req as any);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Report Create Successfully!',
      data: result,
    });
  },
);

const getReports: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await SwapService.getReports(req as any);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Report gets successfully!',
      data: result,
    });
  },
);


const reportReports: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await SwapService.replayReports(req as any);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Replay Successfully!',
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
  getUsersSwapProduct,
  cancelSwapRequest,
  partnerProfileDetails,
  getSwapProductPlanType,
  createReports,
  getReports,
  reportReports
};
