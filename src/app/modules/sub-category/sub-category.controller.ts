import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchasync';
import sendResponse from '../../../shared/sendResponse';
import { ISubCategory } from './sub-category.interface';
import { SubCategoryService } from './sub-category.service';

const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await SubCategoryService.insertIntoDB(req.body);
  sendResponse<ISubCategory>(res, {
    statusCode: 200,
    success: true,
    message: 'SubCategory create successfully',
    data: result,
  });
});
const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await SubCategoryService.updateCategory(req);
  sendResponse<ISubCategory>(res, {
    statusCode: 200,
    success: true,
    message: 'SubCategory update successfully',
    data: result,
  });
});
const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await SubCategoryService.deleteCategory(req.params.id);
  sendResponse<ISubCategory>(res, {
    statusCode: 200,
    success: true,
    message: 'SubCategory delete successfully',
    data: result,
  });
});
const categories = catchAsync(async (req: Request, res: Response) => {
  const result = await SubCategoryService.categories(req.query);
  sendResponse<ISubCategory[]>(res, {
    statusCode: 200,
    success: true,
    message: 'SubCategory Retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

export const SubCategoryController = {
  categories,
  insertIntoDB,
  updateCategory,
  deleteCategory,
};
