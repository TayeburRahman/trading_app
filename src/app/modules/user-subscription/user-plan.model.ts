import { Schema, model } from 'mongoose';
import { IUpgradePlan } from './user-plan.interface';

const subscriptionSchema = new Schema<IUpgradePlan>({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  plan_id: {
    type: Schema.Types.ObjectId,
    ref: 'Subscription',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  planStartDate: {
    type: Date,
    required: true,
  },
  planEndDate: {
    type: Date,
    required: true,
  },
  plan_type: {
    type: String,
    enum: ['Trial', 'Gold', 'Platinum', 'Platinum'],
    required: true,
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'resubmit', 'decline', 'approved'],
  },
  transactionId: {
    type: String,
  },
  payment_status: {
    type: String,
    required: true,
    enum: ['paid', 'unpaid', 'trial'],
    default: 'unpaid',
  },
  active: {
    type: Boolean,
    default: false,
  },
  orderId: {
    type: String,
  },
  name: {
    type: String,
  },
  date_of_birth: {
    type: Date,
  },
  place_of_birth: {
    type: String,
  },
  license_number: {
    type: String,
  },
  passport_number: {
    type: String,
  },
  email: {
    type: String,
  },
  phone_number: {
    type: String,
  },
  profession: {
    type: String,
  },
  region: {
    type: String,
  },
  religion: {
    type: String,
  },
  haveChildren: {
    type: String,
  },
  havePets: {
    type: String,
  },
  haveVehicle: {
    type: String,
  },
  willingVehicle: {
    type: String,
  },
  ownerOfProperty: {
    type: String,
  },
  ableApproveForm: {
    type: String,
  },
  propertyInsured: {
    type: String,
  },
  utilitiesUptoDate: {
    type: String,
  },
  aboutSwap: {
    type: String,
  },
  departureArrival: {
    type: String,
  },
  datesOfTravel: {
    type: String,
  },
  startDestination: {
    type: String,
  },
  startState: {
    type: String,
  },
  travelStartCounty: {
    type: String,
  },
  travelStartCountry: {
    type: String,
  },
  endDestination: {
    type: String,
  },
  endState: {
    type: String,
  },
  endCounty: {
    type: String,
  },
  endCountry: {
    type: String,
  },
  purposeOfTravel: {
    type: String,
  },
  declineReason: {
    type: String,
  },
},
  {
    timestamps: true,
  },
);

export const Plan = model('Plan', subscriptionSchema);
