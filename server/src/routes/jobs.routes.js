// server/src/routes/jobs.routes.js
import { Router } from 'express';
import { getJobs } from '../controllers/jobs.controller.js';
const router = Router();
router.get('/', getJobs);
export default router;

// server/src/controllers/jobs.controller.js
import Job from '../models/Job.model.js';

export async function getJobs(req, res, next) {
    try {
        const { level, maxAge, company, page = 1, limit = 50 } = req.query;

        const filter = {};
        if (level) filter.level = level;
        if (company) filter.company = new RegExp(company, 'i');
        if (maxAge) filter.postedAt = { $gte: new Date(Date.now() - maxAge * 60 * 60 * 1000) };

        const jobs = await Job.find(filter)
            .sort({ postedAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .lean();

        res.json({ jobs });
    } catch (err) {
        next(err);
    }
}