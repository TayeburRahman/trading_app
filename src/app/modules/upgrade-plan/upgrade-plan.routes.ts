import { Router } from 'express';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { UpgradePlanController } from './upgrade-plan.controller';

const router = Router();

router.post(
  '/upgrade-plan',
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  //   validateRequest(SubscriptionValidation.post),
  UpgradePlanController.upgradeSubscription,
);
router.get(
  '/subscribers',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  UpgradePlanController.AllSubscriber,
);
router.get(
  '/my-plan',
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  UpgradePlanController.mySubscription,
);
export const UpgradePlanRoutes = router;
