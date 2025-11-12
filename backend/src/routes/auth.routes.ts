import { Router } from 'express';
import { login, register, getMe, getAllUsers, updateUser } from '../controllers/auth.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.post('/login', login);
router.post('/register', authenticate, authorize('ADMIN'), register);
router.get('/me', authenticate, getMe);
router.get('/users', authenticate, authorize('ADMIN', 'MANAGER'), getAllUsers);
router.put('/users/:id', authenticate, authorize('ADMIN'), updateUser);

export default router;
