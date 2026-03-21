import { Router } from 'express';
import { requireWebVerifyInternal } from '../middleware/requireWebVerifyInternal.js';
import { publicVerifyController } from '../controllers/publicVerifyController.js';

const router = Router();

router.get('/verify/:nafdac', requireWebVerifyInternal, publicVerifyController);

export default router;
