import { model, Schema } from 'mongoose';
import { IReport, ISwap } from './swap.interface';

const swapSchema = new Schema<ISwap>(
  {
    userFrom: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productFrom: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productTo: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    isApproved: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    swapUserToPoint: {
      type: Number,
    },
    swapUserFromPoint: {
      type: Number,
    },
    plan_type: {
      type: String,
      default: "Gold"
    },
    reporting: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      default: []
    },
    ratting: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: []
      },
    ],
  },
  {
    timestamps: true,
  },
);


const ReportSchema: Schema = new Schema<IReport>(
  {
    againstUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userFrom: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    description: {
      type: String,
      required: true
    },
    swapId: {
      type: Schema.Types.ObjectId,
      ref: 'Swap',
      required: true
    },
    reportImage: {
      type: [String],
      default: []
    },
    replay: {
      type: String,
    },
    replayed: {
      type: Boolean,
      default: false
    },
  },
  { timestamps: true }
);
export const Reports = model('Reports', ReportSchema);


export const Swap = model('Swap', swapSchema);

