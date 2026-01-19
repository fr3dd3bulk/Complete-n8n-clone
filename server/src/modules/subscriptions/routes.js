import express from 'express';
import { 
  getSubscription,
  getPlans,
  checkLimits,
  createSubscription,
  updateSubscription,
  cancelSubscription,
} from './controller.js';
import { authenticate } from '../auth/middleware.js';

const router = express.Router();

router.get('/plans', getPlans);
router.get('/', authenticate, getSubscription);
router.get('/limits', authenticate, checkLimits);
router.post('/', authenticate, createSubscription);
router.put('/', authenticate, updateSubscription);
router.delete('/', authenticate, cancelSubscription);

export default router;
