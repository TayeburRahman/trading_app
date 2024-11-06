import { Schema, model } from 'mongoose';
import { IProducts } from './products.interface';

const productSchema = new Schema({
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  subCategory: {
    type: Schema.Types.ObjectId,
    ref: 'SubCategory',
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  condition: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  productValue: {
    type: Number,
    required: true,
  },
  status: {
    type: String, 
    default: 'pending', 
    enum: ['completed', "pending"]
  },
  address: {
    type: String,
    // required: true,
  },
  images: [
    {
      type: String,
    },
  ],
});

export const Product = model<IProducts>('Product', productSchema);
