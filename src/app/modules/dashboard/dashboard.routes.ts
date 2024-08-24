import { Router } from 'express';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { DashboardController } from './dashboard.controller';
const router = Router();
router.get(
  '/total-count',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  DashboardController.totalCount,
);
router.get(
  '/subscription-growth',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  DashboardController.getMonthlySubscriptionGrowth,
);
router.get(
  '/user-growth',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  DashboardController.getMonthlyUserGrowth,
);
router.get(
  '/pending-users',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  DashboardController.getLatestPendingUsers,
);
router.get(
  '/users-points',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  DashboardController.getUserTypePoints,
);
router.patch(
  '/approve/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  DashboardController.approveUser,
);
router.patch(
  '/reject/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  DashboardController.rejectUser,
);

export const DashboardRoutes = router;
