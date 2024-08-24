import { model, Schema } from 'mongoose';
import { ISubscriptions } from './subscriptions.interface';

const subscriptionsSchema = new Schema<ISubscriptions>(
  {
    planName: {
      type: String,
      enum: ['Gold', 'Platinum', 'Diamond'],
      required: true,
    },
    fee: {
      type: String,
      required: true,
    },
    pointRange: {
      type: String,
      required: true,
    },
    swapPoint: {
      type: String,
      required: true,
    },
    positiveCommentPoint: {
      type: String,
      required: true,
    },
    negativeCommentPoint: {
      type: String,
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
