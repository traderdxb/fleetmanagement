import { Router } from 'express';
import { getDashboardStats, getTechnicianPerformance, getInstallationMetrics } from '../controllers/analytics.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/dashboard', authenticate, getDashboardStats);
router.get('/technician-performance', authenticate, authorize('ADMIN', 'MANAGER'), getTechnicianPerformance);
router.get('/installations', authenticate, authorize('ADMIN', 'MANAGER'), getInstallationMetrics);

export default router;
