import express from 'express';
import { 
  createCredential,
  getCredentials,
  getCredential,
  updateCredential,
  deleteCredential,
  testCredential,
} from './controller.js';
import { authenticate } from '../auth/middleware.js';

const router = express.Router();

router.post('/', authenticate, createCredential);
router.get('/', authenticate, getCredentials);
router.get('/:id', authenticate, getCredential);
router.put('/:id', authenticate, updateCredential);
router.delete('/:id', authenticate, deleteCredential);
router.post('/:id/test', authenticate, testCredential);

export default router;
