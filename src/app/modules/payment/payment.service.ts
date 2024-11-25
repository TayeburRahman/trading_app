import Stripe from 'stripe';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { Payment } from './payment.model';
import { Plan } from '../user-subscription/user-plan.model';
import { Subscription } from '../subscriptions/subscriptions.model';
import { ISubscriptions } from '../subscriptions/subscriptions.interface';

const stripe = new Stripe(config.stripe.stripe_secret_key as string);

const makePaymentIntent = async (payload: { amount: any }) => {

  const amount = Math.trunc(payload.amount * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    payment_method_types: ['card'],
  });

  const data = {
    client_secret: paymentIntent.client_secret,
    transactionId: paymentIntent.id,
  };

  return data;
}; 

const paymentSuccessAndSave = async (payload: {
  amount: number;
  user: string;
  transaction_id: string;
  plan_id: string;
  subscriptions_id: string;
}) => {

  const requiredFields = ["amount", "user", "transaction_id", "plan_id", "subscriptions_id"] as const;

  for (const field of requiredFields) {
    if (!payload[field]) {
      throw new ApiError(400, `${field} field is required.`);
    }
  }

  const result = await Payment.create(payload);

  const subscriptionPlan = await Subscription.findById(payload.subscriptions_id) as ISubscriptions;

  if (!subscriptionPlan) {
    throw new ApiError(404, "Subscription plan not found.");
  } 
  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + subscriptionPlan.duration * 24 * 60 * 60 * 1000);

  const update = await Plan.findOneAndUpdate(
    { _id: payload.plan_id },
    {
      payment_status: "paid",
      active: true,
      planStartDate: startDate,
      planEndDate: endDate,
    },
    { new: true }  
  );

  if (!update) {
    throw new ApiError(404, "Plan not found.");
  }

  return { payment: result, plan: update };
};
export const PaymentService = { makePaymentIntent, paymentSuccessAndSave };
