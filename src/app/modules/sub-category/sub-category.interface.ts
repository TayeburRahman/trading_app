import { Types } from 'mongoose';
import { ICategory } from '../category/category.interface';

export type ISubCategory = {
  name: string;
  category: Types.ObjectId | ICategory;
  swapLevel: 'Platinum' | 'Gold' | 'Diamond';
};
