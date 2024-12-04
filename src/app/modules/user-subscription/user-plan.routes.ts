import { Router } from 'express';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { UpgradePlanController } from './user-plan.controller';

const router = Router();

router.post(
  '/create-plan',
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  UpgradePlanController.createSubscription,
);

router.patch(
  '/update-plan/:id',
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  UpgradePlanController.upgradeSubscription,
);

router.get(
  '/my-plan',
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  UpgradePlanController.mySubscription,
);
router.get(
  '/subscribers',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  UpgradePlanController.AllSubscriber,
);

router.get(
  '/subscribe/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  UpgradePlanController.getSubscribeData,
);
router.patch(
  '/subscribe/:id/request',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  UpgradePlanController.statusUpdateRequest,
)

router.get(
  '/profile/:userId',
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  UpgradePlanController.myMembership,
)
router.get(
  '/all-points/:userId',
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  UpgradePlanController.getPointList)

 

 

export const UpgradePlanRoutes = router;
