import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchasync';
import { ManageService } from './settings.service';
import sendResponse from '../../../shared/sendResponse';

const addAboutUs = catchAsync(async (req: Request, res: Response) => {
  const result = await ManageService.addAboutUs(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Successful',
    data: result,
  });
});
const addFacts = catchAsync(async (req: Request, res: Response) => {
  const result = await ManageService.addFacts(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Successful',
    data: result,
  });
});
const addTermsConditions = catchAsync(async (req: Request, res: Response) => {
  const result = await ManageService.addTermsConditions(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Successful',
    data: result,
  });
});
const getFacts = catchAsync(async (req: Request, res: Response) => {
  const result = await ManageService.getFacts();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Successful',
    data: result,
  });
});
const getAboutUs = catchAsync(async (req: Request, res: Response) => {
  const result = await ManageService.getAboutUs();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Successful',
    data: result,
  });
});
const getTermsConditions = catchAsync(async (req: Request, res: Response) => {
  const result = await ManageService.getTermsConditions();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Successful',
    data: result,
  });
});

export const ManageController = {
  addFacts,
  addAboutUs,
  addTermsConditions,
  getFacts,
  getAboutUs,
  getTermsConditions,
};
