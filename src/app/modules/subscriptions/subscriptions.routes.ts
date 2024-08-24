import { Router } from 'express';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { SubscriptionController } from './subscriptions.controller';

const router = Router();

router.post(
  '/add',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  SubscriptionController.insertIntoDB,
);
router.get(
  '/all',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.USER),
  SubscriptionController.subscriptions,
);
router.patch(
  '/edit/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  SubscriptionController.updateSubscription,
);
router.delete(
  '/delete/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  SubscriptionController.deleteSubscription,
);

export const SubscriptionsRoutes = router;
