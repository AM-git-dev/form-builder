import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { formIdParamSchema } from '../schemas/forms.schema.js';

const router = Router();

router.get(
  '/forms/:id/overview',
  authenticate,
  validate({ params: formIdParamSchema }),
  analyticsController.getFormOverview,
);

router.get(
  '/forms/:id/funnel',
  authenticate,
  validate({ params: formIdParamSchema }),
  analyticsController.getFormFunnel,
);

router.get(
  '/forms/:id/timeline',
  authenticate,
  validate({ params: formIdParamSchema }),
  analyticsController.getFormTimeline,
);

router.get(
  '/dashboard',
  authenticate,
  analyticsController.getDashboardStats,
);

export default router;
