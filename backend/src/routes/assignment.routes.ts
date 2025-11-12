import { Router } from 'express';
import {
  getAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  createReplacement,
  getReplacements,
  createRemoval,
  getRemovals,
} from '../controllers/assignment.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Assignment routes
router.get('/', authenticate, getAssignments);
router.get('/:id', authenticate, getAssignment);
router.post('/', authenticate, authorize('ADMIN', 'MANAGER', 'SUPPORT', 'SALES'), createAssignment);
router.put('/:id', authenticate, authorize('ADMIN', 'MANAGER', 'SUPPORT'), updateAssignment);
router.delete('/:id', authenticate, authorize('ADMIN', 'MANAGER'), deleteAssignment);

// Replacement routes
router.get('/replacements/all', authenticate, getReplacements);
router.post('/replacements', authenticate, authorize('ADMIN', 'MANAGER', 'SUPPORT'), createReplacement);

// Removal routes
router.get('/removals/all', authenticate, getRemovals);
router.post('/removals', authenticate, authorize('ADMIN', 'MANAGER', 'SUPPORT'), createRemoval);

export default router;
