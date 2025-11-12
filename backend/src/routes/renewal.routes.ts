import { Router } from 'express';
import { getRenewals, renewSubscription, getUpcomingRenewals } from '../controllers/renewal.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, getRenewals);
router.get('/upcoming', authenticate, getUpcomingRenewals);
router.post('/:id/renew', authenticate, authorize('ADMIN', 'MANAGER', 'ACCOUNTS', 'SUPPORT'), renewSubscription);

export default router;
