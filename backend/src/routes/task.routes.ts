import { Router } from 'express';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/task.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, getTasks);
router.post('/', authenticate, authorize('ADMIN', 'MANAGER', 'SUPPORT'), createTask);
router.put('/:id', authenticate, authorize('ADMIN', 'MANAGER', 'SUPPORT'), updateTask);
router.delete('/:id', authenticate, authorize('ADMIN', 'MANAGER'), deleteTask);

export default router;
