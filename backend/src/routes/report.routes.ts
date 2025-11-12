import { Router } from 'express';
import { getActivityReport, getPlatformMasterlist } from '../controllers/report.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/activity', authenticate, getActivityReport);
router.get('/platform-masterlist', authenticate, getPlatformMasterlist);

export default router;
