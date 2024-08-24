import { model, Schema } from 'mongoose';
import { ISubCategory } from './sub-category.interface';

const subCategorySchema = new Schema<ISubCategory>(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    swapLevel: {
      type: String,
      enum: ['Gold', 'Platinum', 'Diamond'],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const SubCategory = model('SubCategory', subCategorySchema);
