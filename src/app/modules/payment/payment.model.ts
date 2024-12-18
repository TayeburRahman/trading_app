import { Schema, model } from 'mongoose'; 
import { IPayment } from './payment.interface';

const paymentSchema = new Schema<IPayment>(
  {
    payment_method: {
      type: String,
      default: 'Card',
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    plan_id: {
      type: Schema.Types.ObjectId,
      ref: 'Plan',
    },
    package_id: {
      type: Schema.Types.ObjectId,
      ref: 'Subscription',
    },
    amount: Number,
    transaction_id: String,
    note: String,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);

export const Payment = model('Payment', paymentSchema);
