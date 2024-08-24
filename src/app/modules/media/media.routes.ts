import { Router } from 'express';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { uploadFile } from '../../middlewares/fileUploader';
import { AddsController } from './media.controller';
const router = Router();

router.post(
  '/create-adds',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  uploadFile(),
  AddsController.insertIntoDB,
);
router.post(
  '/create-video-adds',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  uploadFile(),
  AddsController.addVideoAdds,
);
router.get(
  '/all-adds',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.USER),
  AddsController.allAdds,
);
router.get(
  '/all-video-adds',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.USER),
  AddsController.allVideoAdds,
);
router.patch(
  '/edit-adds/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  uploadFile(),
  AddsController.updateAdds,
);
router.patch(
  '/edit-video-adds/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  uploadFile(),
  AddsController.updateVideoAdds,
);
router.delete(
  '/delete-adds/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  AddsController.deleteAdds,
);
router.delete(
  '/delete-video-adds/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  AddsController.deleteVideoAdds,
);

export const AddsRoutes = router;
