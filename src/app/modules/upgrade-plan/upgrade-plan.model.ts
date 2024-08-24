import { Schema, model } from 'mongoose';
import { IUpgradePlan } from './upgrade-plan.interface';

const subscriptionSchema = new Schema<IUpgradePlan>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    plan_id: {
      type: Schema.Types.ObjectId,
      ref: 'SubscriptionPlan',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    payment_status: {
      type: String,
      required: true,
      enum: ['paid', 'unpaid', 'trial'],
    },
    plan_type: {
      type: String,
      enum: ['Gold', 'Premium', 'Platinum'],
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'inactive'],
    },
    transactionId: { type: String },
  },
  {
    timestamps: true,
  },
);

export const Plan = model('Plan', subscriptionSchema);
