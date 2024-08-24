import { Types } from 'mongoose';
import { ICategory } from '../category/category.interface';
import { ISubCategory } from '../sub-category/sub-category.interface';
import { IUser } from '../auth/auth.interface';

export type IProducts = {
  category: Types.ObjectId | ICategory;
  subCategory: Types.ObjectId | ISubCategory;
  user: Types.ObjectId | IUser;
  title: string;
  condition: string;
  description: string;
  productValue: string;
  address: string;
  images: []; // Here will be multiple images. array of object
};
