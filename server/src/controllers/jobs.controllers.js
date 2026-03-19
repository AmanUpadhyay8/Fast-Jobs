// src/controllers/jobs.controller.js
import Job from '../models/Job.model.js';

export async function getJobs(req, res, next) {
    try {
        const { level, maxAge, company, page = 1, limit = 50 } = req.query;

        const filter = {};
        if (level) filter.level = level;
        if (company) filter.company = new RegExp(company, 'i');
        if (maxAge) filter.postedAt = {
            $gte: new Date(Date.now() - Number(maxAge) * 60 * 60 * 1000)
        };

        const jobs = await Job.find(filter)
            .sort({ postedAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit))
            .lean();

        res.json({ jobs, count: jobs.length });
    } catch (err) {
        next(err);
    }
}