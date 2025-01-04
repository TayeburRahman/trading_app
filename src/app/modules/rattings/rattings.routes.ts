import { Router } from 'express';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { RattingValidation } from './ratting.validation';
import { validateRequest } from '../../middlewares/validateRequest';
import { RattingController } from './rattings.controller';

const router = Router();
router.post(
  '/send',
  auth(ENUM_USER_ROLE.USER), 
  RattingController.insertIntoDB,
);

router.get(
  '/my-reviews',
  auth(ENUM_USER_ROLE.USER),
  RattingController.myRattingAndReview,
);

router.get(
  '/average-ratting',
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN),
  RattingController.averageRatting,
);
export const RattingRoutes = router;
