import express from 'express';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { CategoryRoutes } from '../modules/category/category.routes';
import { SubCategoryRoutes } from '../modules/sub-category/sub-category.routes';
import { SubscriptionsRoutes } from '../modules/subscriptions/subscriptions.routes';
import { AddsRoutes } from '../modules/media/media.routes';
import { ManageRoutes } from '../modules/settings/settings.routes';
import { DashboardRoutes } from '../modules/dashboard/dashboard.routes';
import { UpgradePlanRoutes } from '../modules/user-subscription/user-plan.routes';
import { ProductRoutes } from '../modules/products/products.routes';
import { SwapRoutes } from '../modules/swap/swap.routes';
import { RattingRoutes } from '../modules/rattings/rattings.routes';
import { MessageRoutes } from '../modules/messages/message.routes';
import { NotificationRoutes } from '../modules/notifications/notifications.routes';
import { PaymentRoutes } from '../modules/payment/payment.routes';

const router = express.Router();

const moduleRoutes = [
  // -- done
  {
    path: '/auth',
    route: AuthRoutes,
  },
  // -- done
  {
    path: '/category',
    route: CategoryRoutes,
  },
  // -- done
  {
    path: '/sub-category',
    route: SubCategoryRoutes,
  },
  // -- done
  {
    path: '/subscription',
    route: SubscriptionsRoutes,
  },
  // -- done
  {
    path: '/adds',
    route: AddsRoutes,
  },
  // -- done
  {
    path: '/rules',
    route: ManageRoutes,
  },
  // -- done
  {
    path: '/dashboard',
    route: DashboardRoutes,
  },
  // -- done
  {
    path: '/plan',
    route: UpgradePlanRoutes,
  },
  // -- done
  {
    path: '/product',
    route: ProductRoutes,
  },
  // -- done
  {
    path: '/swap',
    route: SwapRoutes,
  },
  // -- done
  {
    path: '/review',
    route: RattingRoutes,
  },
  // -- done
  {
    path: '/message',
    route: MessageRoutes,
  },
  // -- progressing
  {
    path: '/notification',
    route: NotificationRoutes,
  },
  // -- progressing
  {
    path: '/payment',
    route: PaymentRoutes,
  },
];
moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
