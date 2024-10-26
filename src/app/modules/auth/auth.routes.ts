import express from 'express';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { uploadFile } from '../../middlewares/fileUploader';
import { AdminController } from '../admin/admin.controller';
import { validateRequest } from '../../middlewares/validateRequest';
import { AdminValidation } from '../admin/admin.validation';
import { AuthValidation } from './auth.validation';
import { AuthController } from './auth.controller';

const router = express.Router();
//!User
router.post(
  '/register',
  // validateRequest(AuthValidation.create),
  AuthController.registrationUser,
);
router.post('/activate-user', AuthController.activateUser);
router.post(
  '/login',
  validateRequest(AuthValidation.loginZodSchema),
  AuthController.login,
);
router.delete(
  '/delete-account',
  auth(ENUM_USER_ROLE.USER),
  AuthController.deleteMyAccount,
);
router.patch(
  '/change-password',
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN),
  AuthController.changePassword,
);
router.post('/forgot-password', AuthController.forgotPass);
router.post('/reset-password', AuthController.resetPassword);
router.post('/resend-active', AuthController.resendActivationCode);
router.post('/resend-verify', AuthController.resendVerificationCode);
router.post('/verify-otp', AuthController.checkIsValidForgetActivationCode);

router.patch(
  '/edit-profile',
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN),
  uploadFile(),
  AuthController.updateProfile,
);

router.get(
  '/users',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  AuthController.getAllUsers,
);

router.patch(
  '/user-block-unblock/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  AuthController.block_unblockUser,
);

//! Admin Authentication Start
router.post(
  '/admin/register',
  validateRequest(AdminValidation.create),
  AdminController.registerAdmin,
);

router.post(
  '/add-admin',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(AdminValidation.create),
  AdminController.registerAdmin,
);

router.get(
  '/admins',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  AdminController.getAllAdmin,
);

router.get(
  '/profile',
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  AdminController.getMyProfile,
);

router.get(
  '/profile/:userId',
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  AdminController.getUserProfile,
);

export const AuthRoutes = router;
