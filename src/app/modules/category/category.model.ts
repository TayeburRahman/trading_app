import { model, Schema } from 'mongoose';
import { ICategory } from './category.interface';

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Category = model('Category', categorySchema);
