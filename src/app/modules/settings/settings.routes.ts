import express from 'express';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { ManageController } from './settings.controller';
const router = express.Router();

router.post(
  '/add-about-us',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  ManageController.addAboutUs,
);

router.post(
  '/add-rules',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  ManageController.addTermsConditions,
);
router.post(
  '/add-facts',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  ManageController.addFacts,
);

router.get(
  '/get-about-us',

  ManageController.getAboutUs,
);
router.get(
  '/get-rules',

  ManageController.getTermsConditions,
);
router.get(
  '/get-facts',

  ManageController.getFacts,
);

export const ManageRoutes = router;
