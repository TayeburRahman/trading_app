import { Router } from 'express';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { uploadFile } from '../../middlewares/fileUploader';
import { ProductController } from './products.controller';
const router = Router();

router.post(
  '/add-product',
  auth(ENUM_USER_ROLE.USER),
  uploadFile(),
  ProductController.insertIntoDB,
);

router.get(
  '/my-products',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.USER),
  ProductController.myProducts,
);

router.get(
  '/get-all',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.USER),
  ProductController.products,
);

router.get(
  '/details/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.USER),
  ProductController.singleProduct,
);

router.get(
  '/details/user/:productId',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.USER),
  ProductController.productForSwap,
);

router.patch(
  '/edit/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.USER),
  uploadFile(),
  ProductController.updateProduct,
);

router.delete(
  '/delete/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.USER),
  ProductController.deleteProduct,
);
export const ProductRoutes = router;
