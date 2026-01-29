import { Router } from 'express';
import authRoutes from './auth.routes.js';
import formsRoutes from './forms.routes.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/forms', formsRoutes);

export default router;
