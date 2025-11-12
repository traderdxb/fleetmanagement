import { Router } from 'express';
import { getPlatforms, getLocations, getInstallers, getAccessories, getVehicles, createVehicle } from '../controllers/masterdata.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/platforms', authenticate, getPlatforms);
router.get('/locations', authenticate, getLocations);
router.get('/installers', authenticate, getInstallers);
router.get('/accessories', authenticate, getAccessories);
router.get('/vehicles', authenticate, getVehicles);
router.post('/vehicles', authenticate, createVehicle);

export default router;
