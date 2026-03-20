// src/routes/config.routes.js
import { Router } from 'express';
import {
    getConfig,
    updateConfig,
    getCompanies,
    addCompany,
    removeCompany,
} from '../controllers/config.controllers.js';

const router = Router();

router.get('/scraper', getConfig);
router.put('/scraper', updateConfig);
router.get('/companies', getCompanies);
router.post('/companies', addCompany);
router.delete('/companies/:name', removeCompany);

export default router;