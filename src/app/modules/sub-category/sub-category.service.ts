/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Request } from 'express';
import QueryBuilder from '../../../builder/QueryBuilder';
import ApiError from '../../../errors/ApiError';
import { ISubCategory } from './sub-category.interface';
import { SubCategory } from './sub-category.model';

const insertIntoDB = async (payload: ISubCategory) => {
  return await SubCategory.create(payload);
};

const categories = async (query: Record<string, unknown>) => {
  const categoryQuery = new QueryBuilder(
    SubCategory.find().populate('category'),
    query,
  )
    .search([])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await categoryQuery.modelQuery;
  const meta = await categoryQuery.countTotal();

  return {
    meta,
    data: result,
  };
};
const updateCategory = async (req: Request) => {
  const id = req.params.id;

  const isExist = await SubCategory.findOne({ _id: id });

  if (!isExist) {
    throw new ApiError(404, 'Sub Category not found !');
  }

  const { ...categoryData } = req.body;

  const updatedData: Partial<ISubCategory> = { ...categoryData };

  const result = await SubCategory.findOneAndUpdate(
    { _id: id },
    { ...updatedData },
    {
      new: true,
    },
  );
  return result;
};
const deleteCategory = async (id: string) => {
  const isExist = await SubCategory.findOne({ _id: id });

  if (!isExist) {
    throw new ApiError(404, 'SubCategory not found !');
  }
  return await SubCategory.findByIdAndDelete(id);
};
export const SubCategoryService = {
  insertIntoDB,
  categories,
  updateCategory,
  deleteCategory,
};
