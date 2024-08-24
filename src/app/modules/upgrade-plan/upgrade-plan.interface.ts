import { Schema } from 'mongoose';

type SubscriptionStatus = 'paid' | 'unpaid' | 'trial';
type SubscriptionPlan = 'Gold' | 'Platinum' | 'Diamond';
type SubscriptionState = 'active' | 'inactive';

export type IUpgradePlan = {
  user_id: Schema.Types.ObjectId;
  plan_id: Schema.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  payment_status: SubscriptionStatus;
  plan_type: SubscriptionPlan;
  status: SubscriptionState;
  transactionId?: string;
  amount: number;
};
