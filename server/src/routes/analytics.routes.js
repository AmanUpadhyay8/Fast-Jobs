import { Router } from 'express';
import { getAnalytics } from '../controllers/analytics.controllers.js';
const router = Router();
router.get('/', getAnalytics);
export default router;