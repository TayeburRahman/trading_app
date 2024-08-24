import { model, Schema } from 'mongoose';
import { IPoints } from './points.interface';

const pointSchema = new Schema<IPoints>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    points: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export const Point = model<IPoints>('Point', pointSchema);
