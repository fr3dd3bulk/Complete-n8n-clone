import express from 'express';
import { 
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
  getNodeDefinitions,
  createNodeDefinition,
  updateNodeDefinition,
  deleteNodeDefinition,
  getSystemStats,
  getUsers,
  updateUser,
  getOrganizations,
} from './controller.js';
import { authenticate, authorize } from '../auth/middleware.js';

const router = express.Router();

router.get('/plans', authenticate, authorize('super_admin'), getPlans);
router.post('/plans', authenticate, authorize('super_admin'), createPlan);
router.put('/plans/:id', authenticate, authorize('super_admin'), updatePlan);
router.delete('/plans/:id', authenticate, authorize('super_admin'), deletePlan);

router.get('/nodes', authenticate, authorize('super_admin'), getNodeDefinitions);
router.post('/nodes', authenticate, authorize('super_admin'), createNodeDefinition);
router.put('/nodes/:id', authenticate, authorize('super_admin'), updateNodeDefinition);
router.delete('/nodes/:id', authenticate, authorize('super_admin'), deleteNodeDefinition);

router.get('/stats', authenticate, authorize('super_admin'), getSystemStats);

router.get('/users', authenticate, authorize('super_admin'), getUsers);
router.put('/users/:id', authenticate, authorize('super_admin'), updateUser);

router.get('/organizations', authenticate, authorize('super_admin'), getOrganizations);

export default router;
