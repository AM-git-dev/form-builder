import { Router } from 'express';
import authRoutes from './auth.routes.js';
import formsRoutes from './forms.routes.js';
import analyticsRoutes from './analytics.routes.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/forms', formsRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
