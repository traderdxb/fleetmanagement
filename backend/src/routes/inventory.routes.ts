import { Router } from 'express';
import {
  getDevices,
  getDevice,
  createDevice,
  updateDevice,
  deleteDevice,
  getSIMs,
  createSIM,
  updateSIM,
  deleteSIM,
  getInventoryStats,
} from '../controllers/inventory.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Device routes
router.get('/devices', authenticate, getDevices);
router.get('/devices/:id', authenticate, getDevice);
router.post('/devices', authenticate, authorize('ADMIN', 'MANAGER', 'SUPPORT'), createDevice);
router.put('/devices/:id', authenticate, authorize('ADMIN', 'MANAGER', 'SUPPORT'), updateDevice);
router.delete('/devices/:id', authenticate, authorize('ADMIN', 'MANAGER'), deleteDevice);

// SIM routes
router.get('/sims', authenticate, getSIMs);
router.post('/sims', authenticate, authorize('ADMIN', 'MANAGER', 'SUPPORT'), createSIM);
router.put('/sims/:id', authenticate, authorize('ADMIN', 'MANAGER', 'SUPPORT'), updateSIM);
router.delete('/sims/:id', authenticate, authorize('ADMIN', 'MANAGER'), deleteSIM);

// Stats
router.get('/stats', authenticate, getInventoryStats);

export default router;
