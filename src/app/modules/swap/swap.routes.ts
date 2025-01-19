import { Router } from 'express';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { SwapController } from './swap.controller';
import { uploadFile } from '../../middlewares/fileUploader';

const router = Router();

router.post('/make-swap', auth(ENUM_USER_ROLE.USER), SwapController.makeSwap);
router.get(
  '/pending-swap',
  auth(ENUM_USER_ROLE.USER),
  SwapController.pendingSwap,
);
router.patch(
  '/approve/:id',
  auth(ENUM_USER_ROLE.USER),
  SwapController.approveSwap,
);
router.patch(
  '/reject/:id',
  auth(ENUM_USER_ROLE.USER),
  SwapController.rejectSwap,
);
router.get(
  '/swap-details/:id',
  auth(ENUM_USER_ROLE.USER),
  SwapController.swapDetails,
);
router.get(
  '/swap-histoy',
  auth(ENUM_USER_ROLE.USER),
  SwapController.getUsersSwapProduct,
);
router.delete(
  '/swap-delete/:id',
  auth(ENUM_USER_ROLE.USER),
  SwapController.cancelSwapRequest,
);
router.get(
  '/partner_profile/:id',
  auth(ENUM_USER_ROLE.USER),
  SwapController.partnerProfileDetails,
);
router.get(
  '/swap-histoy-plan',
  auth(ENUM_USER_ROLE.USER),
  SwapController.getSwapProductPlanType,
);
router.post(
  '/create-report',
  auth(ENUM_USER_ROLE.USER),
  uploadFile(),
  SwapController.createReports,
);





export const SwapRoutes = router;
