// src/routes/jobs.routes.js
import { Router } from 'express';
import { getJobs } from '../controllers/jobs.controllers.js';
const router = Router();
router.get('/', getJobs);
export default router;

