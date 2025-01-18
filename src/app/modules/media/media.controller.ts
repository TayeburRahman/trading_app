import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchasync';
import sendResponse from '../../../shared/sendResponse';
import { AddsService } from './media.service';
import { IAdds, IAddsVideo, IFilesVideo } from './media.interface';

const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await AddsService.insertIntoDB(req.files, req.body);
  sendResponse<IAdds>(res, {
    statusCode: 200,
    success: true,
    message: 'Adds create successfully',
    data: result,
  });
});

const addVideoAdds = catchAsync(async (req: Request, res: Response) => {
  const result = await AddsService.addVideoAdds(req.files, req.body);
  sendResponse<IAddsVideo>(res, {
    statusCode: 200,
    success: true,
    message: 'Adds create successfully',
    data: result,
  });
});

const updateAdds = catchAsync(async (req: Request, res: Response) => {
  const result = await AddsService.updateAdds(req);
  sendResponse<IAdds>(res, {
    statusCode: 200,
    success: true,
    message: 'Adds update successfully',
    data: result,
  });
});

const updateVideoAdds = catchAsync(async (req: Request, res: Response) => {
  const result = await AddsService.updateVideoAdds(req);
  sendResponse<IAddsVideo>(res, {
    statusCode: 200,
    success: true,
    message: 'Adds update successfully',
    data: result,
  });
});

const deleteAdds = catchAsync(async (req: Request, res: Response) => {
  const result = await AddsService.deleteAdds(req.params.id);
  sendResponse<IAdds>(res, {
    statusCode: 200,
    success: true,
    message: 'Adds delete successfully',
    data: result,
  });
});

const deleteVideoAdds = catchAsync(async (req: Request, res: Response) => {
  const result = await AddsService.deleteVideoAdds(req.params.id);
  sendResponse<IAddsVideo>(res, {
    statusCode: 200,
    success: true,
    message: 'Adds delete successfully',
    data: result,
  });
});
const allAdds = catchAsync(async (req: Request, res: Response) => {
  const result = await AddsService.allAdds(req.query);
  sendResponse<IAdds[]>(res, {
    statusCode: 200,
    success: true,
    message: 'Adds Retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});
const allVideoAdds = catchAsync(async (req: Request, res: Response) => {
  const result = await AddsService.allVideoAdds(req.query);
  sendResponse<IAddsVideo[]>(res, {
    statusCode: 200,
    success: true,
    message: 'Adds Retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});


const addSmallBanner = catchAsync(async (req: Request, res: Response) => {
  const result = await AddsService.addSmallBanner(req as Request);
  sendResponse<IFilesVideo>(res, {
    statusCode: 200,
    success: true,
    message: 'Adds create successfully',
    data: result,
  });
});

const getSmallBanner = catchAsync(async (req: Request, res: Response) => {
  const result = await AddsService.getSmallBanner(req.query);
  sendResponse<IFilesVideo[]>(res, {
    statusCode: 200,
    success: true,
    message: 'Adds Retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const deleteSmallBanner = catchAsync(async (req: Request, res: Response) => {
  const result = await AddsService.deleteSmallBanner(req.params.id);
  sendResponse<IFilesVideo>(res, {
    statusCode: 200,
    success: true,
    message: 'Adds delete successfully',
    data: result,
  });
});


const updateSmallBanner = catchAsync(async (req: Request, res: Response) => {
  const result = await AddsService.updateSmallBanner(req);
  sendResponse<IFilesVideo>(res, {
    statusCode: 200,
    success: true,
    message: 'Adds update successfully',
    data: result,
  });
});






export const AddsController = {
  insertIntoDB,
  allAdds,
  updateAdds,
  deleteAdds,
  addVideoAdds,
  allVideoAdds,
  updateVideoAdds,
  deleteVideoAdds,
  addSmallBanner,
  getSmallBanner,
  deleteSmallBanner,
  updateSmallBanner
};
