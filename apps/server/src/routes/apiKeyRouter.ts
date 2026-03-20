import { Router } from 'express';
import { requireAuthSession } from '../middleware/requireAuthSession.js';
import {
  createMyApiKey,
  getMyApiKey,
  revokeMyApiKey,
} from '../controllers/apiKeyController.js';
import { getMyUsageMetrics } from '../controllers/userApiUsageController.js';

const router = Router();

router.get('/me', requireAuthSession, getMyApiKey);
router.get('/metrics', requireAuthSession, getMyUsageMetrics);
router.post('/create', requireAuthSession, createMyApiKey);
router.delete('/me', requireAuthSession, revokeMyApiKey);

export default router;
