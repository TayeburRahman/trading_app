import { Router } from 'express';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { PaymentController } from './payment.controller';

const router = Router();

router.post(
  '/payment-intent',
  auth(ENUM_USER_ROLE.USER),
  PaymentController.makePaymentIntent,
);

router.post(
  '/success_intent',
  auth(ENUM_USER_ROLE.USER),
  PaymentController.paymentSuccessAndSave,
);

router.get(
  '/incomes-totals',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  PaymentController.getTotalIncomeByPlanType,
);

router.get(
  '/transitions-history',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  PaymentController.getTransitionsHistory,
);

export const PaymentRoutes = router;
