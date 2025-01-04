import { model, Schema } from 'mongoose';
import { IPoints, IPointsDetails } from './points.interface';

const pointsDetailsSchema = new Schema<IPointsDetails>({
  title: {
    type: String, 
    required: true,
  },
  point: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
}); 


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
    details: {
      type: [pointsDetailsSchema], 
    },
  },
  { timestamps: true },
);

export const Point = model<IPoints>('Point', pointSchema);
