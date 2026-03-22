import { Router } from 'express';
import { productSearchController } from '../controllers/productSearchController.js';
import { verifyPlanRateLimiter } from '../middleware/verifyPlanRateLimiter.js';

const router = Router();

router.get('/search', verifyPlanRateLimiter, productSearchController);

export default router;
