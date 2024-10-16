import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchasync';
import { categoryService } from './category.service';
import sendResponse from '../../../shared/sendResponse';
import { ICategory } from './category.interface';

const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
  // console.log('==========', req.body, res.files);
  const result = await categoryService.insertIntoDB(req.files, req.body);
  sendResponse<ICategory>(res, {
    statusCode: 200,
    success: true,
    message: 'Category create successfully',
    data: result,
  });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await categoryService.updateCategory(req);
  sendResponse<ICategory>(res, {
    statusCode: 200,
    success: true,
    message: 'Category update successfully',
    data: result,
  });
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await categoryService.deleteCategory(req.params.id);
  sendResponse<ICategory>(res, {
    statusCode: 200,
    success: true,
    message: 'Category delete successfully',
    data: result,
  });
});

const categories = catchAsync(async (req: Request, res: Response) => {
  const result = await categoryService.categories(req.query);
  sendResponse<ICategory[]>(res, {
    statusCode: 200,
    success: true,
    message: 'Category Retrieved successfully',
    data: result.data,
  });
});

export const CategoryController = {
  categories,
  insertIntoDB,
  updateCategory,
  deleteCategory,
};
