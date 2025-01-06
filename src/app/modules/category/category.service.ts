/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Request } from 'express';
import QueryBuilder from '../../../builder/QueryBuilder';
import ApiError from '../../../errors/ApiError';
import { ICategory } from './category.interface';
import { Category } from './category.model';

const insertIntoDB = async (files: any, payload: ICategory) => {
  if (!files?.image) {
    throw new ApiError(400, 'File is missing');
  }

  const checkIsExist = await Category.findOne({ name: payload.name });

  if (checkIsExist) {
    throw new ApiError(400, 'Category already exist');
  }
  if (files?.image) {
    payload.image = `/images/image/${files.image[0].filename}`;
  }
  return await Category.create(payload);
};

const categories = async (query: Record<string, unknown>) => {
  const result = await Category.find();
  return {
    data: result,
  };
};

const updateCategory = async (req: Request) => {
  const { files } = req as any;
  const id = req.params.id; 
  let image = undefined;
  const name = req.body.name;

  if(!name){
    throw new ApiError(400, 'Category name is required');
  }

  if (files && files.image) {
    image = `/images/image/${files.image[0].filename}`;
  } 

  const isExist = await Category.findOne({ _id: id });

  if (!isExist) {
    throw new ApiError(404, 'Category not found !');
  }

  const { ...categoryData } = req.body;

  const updatedData: Partial<ICategory> = { ...categoryData }; 

  const result = await Category.findOneAndUpdate(
    { _id: id },
    { image, ...updatedData },
    {
      new: true,
    },
  );
  return result;
};

const deleteCategory = async (id: string) => {
  const isExist = await Category.findOne({ _id: id });

  if (!isExist) {
    throw new ApiError(404, 'Category not found !');
  }
  return await Category.findByIdAndDelete(id);
};

export const categoryService = {
  insertIntoDB,
  categories,
  updateCategory,
  deleteCategory,
};
