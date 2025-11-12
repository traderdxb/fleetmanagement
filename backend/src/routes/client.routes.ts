import { Router } from 'express';
import {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  getClientHistory,
} from '../controllers/client.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, getClients);
router.get('/:id', authenticate, getClient);
router.post('/', authenticate, authorize('ADMIN', 'MANAGER', 'SUPPORT', 'SALES', 'ACCOUNTS'), createClient);
router.put('/:id', authenticate, authorize('ADMIN', 'MANAGER', 'SUPPORT', 'ACCOUNTS'), updateClient);
router.delete('/:id', authenticate, authorize('ADMIN', 'MANAGER'), deleteClient);
router.get('/:id/history', authenticate, getClientHistory);

export default router;
