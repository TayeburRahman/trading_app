import { model, Schema } from 'mongoose';
import { ISubscriptions } from './subscriptions.interface';

const subscriptionsSchema = new Schema<ISubscriptions>(
  {
    planName: {
      type: String,
      enum: ['Trial', 'Gold', 'Platinum', 'Diamond'],
      required: true,
    },
    fee: {
      type: Number,
      required: true,
    },
    pointRangeStart: {
      type: Number,
      required: true,
    },
    pointRangeEnd: {
      type: Number,
      required: true,
    },
    swapPoint: {
      type: Number,
      required: true,
    },
    positiveCommentPoint: {
      type: Number,
      required: true,
    },
    negativeCommentPoint: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  },
);

export const Subscription = model('Subscription', subscriptionsSchema);
