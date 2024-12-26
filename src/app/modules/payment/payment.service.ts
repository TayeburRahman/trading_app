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
  package_id: string;
}) => {

  console.log("Payment success", payload.amount, payload.user, payload.transaction_id, payload.plan_id)

  const requiredFields = ["amount", "user", "transaction_id", "plan_id", "package_id"] as const;

  for (const field of requiredFields) {
    if (!payload[field]) {
      throw new ApiError(400, `${field} field is required.`);
    }
  }

  const result = await Payment.create(payload);

  const subscriptionPlan = await Subscription.findById(payload.package_id) as ISubscriptions;

  if (!subscriptionPlan) {
    throw new ApiError(404, "Subscription plan not found.");
  } 
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);

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

  console.log(update);

  return { payment: result, plan: update };
};
  
const getGoldIncome = async () => {
  try { 
    const goldPlan = await Subscription.findOne({ planName: 'Gold' });
    if (!goldPlan) {
      return { message: 'Gold plan not found.' };
    }

    const goldPlanId = goldPlan._id;  
    console.log('Gold Plan ID:', goldPlanId);

    // Fetch total income for Gold plan
    const totalIncomeForGold = await Payment.aggregate([
      {
        $match: {
          package_id: goldPlanId,  
        },
      },
      {
        $group: {
          _id: null,
          totalIncome: { $sum: '$amount' },
        },
      },
    ]); 
 
    return {
      planType: 'Gold',
      totalIncome: totalIncomeForGold[0]?.totalIncome || 0,
    };
  } catch (error) {
    console.error('Error fetching Gold income:', error);
    return { message: 'Error fetching data.' };
  }
};


const getPlatinumIncome = async () => {
  try {
    // Fetch the Platinum plan
    const platinumPlan = await Subscription.findOne({ planName: 'Platinum' });
    const platinumPlanId = platinumPlan ? platinumPlan._id : null;

    if (!platinumPlanId) {
      return { message: 'Platinum plan not found.' };
    }

    console.log('Platinum Plan ID:', platinumPlanId);

    // Fetch total income for Platinum plan
    const totalIncomeForPlatinum = await Payment.aggregate([
      {
        $match: {
          package_id: platinumPlanId, // Ensure type matches
        },
      },
      {
        $group: {
          _id: null,
          totalIncome: { $sum: '$amount' }, // Ensure 'amount' is numeric
        },
      },
    ]);

    console.log('Total Income for Platinum:', totalIncomeForPlatinum);

    return {
      planType: 'Platinum',
      totalIncome: totalIncomeForPlatinum[0]?.totalIncome || 0,
    };
  } catch (error) {
    console.error('Error fetching Platinum income:', error);
    return { message: 'Error fetching data.' };
  }
};


const getDiamondIncome = async () => {
  try { 
    const diamondPlan = await Subscription.findOne({ planName: 'Diamond' });
    const diamondPlanId = diamondPlan ? diamondPlan._id : null;

    if (!diamondPlanId) {
      return { message: 'Diamond plan not found.' };
    }

    console.log('Diamond Plan ID:', diamondPlanId);
 
    const totalIncomeForDiamond = await Payment.aggregate([
      {
        $match: {
          package_id: diamondPlanId,  
        },
      },
      {
        $group: {
          _id: null,
          totalIncome: { $sum: '$amount' },  
        },
      },
    ]);

    console.log('Total Income for Diamond:', totalIncomeForDiamond);

    return {
      planType: 'Diamond',
      totalIncome: totalIncomeForDiamond[0]?.totalIncome || 0,
    };
  } catch (error) {
    console.error('Error fetching Diamond income:', error);
    return { message: 'Error fetching data.' };
  }
};


const getAllPlanIncome = async () => {
  const goldIncome = await getGoldIncome();
  const platinumIncome = await getPlatinumIncome();
  const diamondIncome = await getDiamondIncome();

  console.log('Gold income:', goldIncome, platinumIncome, diamondIncome);

  return {
    totalIncome: goldIncome.totalIncome + platinumIncome.totalIncome + diamondIncome.totalIncome,
    planIncome: [
      goldIncome,
      platinumIncome,
      diamondIncome,
    ],
  };
};

const getTransitionsHistory = async () => {
  const payments = await Payment.find({})
   .populate('user', 'name email address')
   .populate('plan_id', 'plan_type') 
   .populate('package_id') 
   .sort({ createdAt: -1 });

   return payments;
}


export const PaymentService = { makePaymentIntent, paymentSuccessAndSave, getAllPlanIncome, getTransitionsHistory};
