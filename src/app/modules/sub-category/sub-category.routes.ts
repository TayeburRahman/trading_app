import { Router } from 'express';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';

import { uploadFile } from '../../middlewares/fileUploader';
import { SubCategoryController } from './sub-category.controller';
const router = Router();

router.post(
  '/add',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  SubCategoryController.insertIntoDB,
);
router.get(
  '/get-all', 
  SubCategoryController.categories,
);
router.patch(
  '/edit/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  uploadFile(),
  SubCategoryController.updateCategory,
);
router.delete(
  '/delete/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  SubCategoryController.deleteCategory,
);

export const SubCategoryRoutes = router;
