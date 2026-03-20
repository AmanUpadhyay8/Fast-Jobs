// src/controllers/jobs.controller.js
import Job from '../models/Job.model.js';
import Company from '../models/Company.model.js';

export async function getJobs(req, res, next) {
    try {
        const { level, maxAge, company, page = 1, limit = 50 } = req.query;

        const filter = {};
        if (level) filter.level = level;
        if (company) filter.company = new RegExp(company, 'i');
        if (maxAge) filter.postedAt = {
            $gte: new Date(Date.now() - Number(maxAge) * 60 * 60 * 1000)
        };

        const [jobs, companies] = await Promise.all([
            Job.find(filter)
                .sort({ postedAt: -1 })
                .skip((Number(page) - 1) * Number(limit))
                .limit(Number(limit))
                .lean(),
            Company.find({ isActive: true }).lean(),
        ]);

        // Build a quick lookup map
        const tierMap = {};
        companies.forEach(c => {
            tierMap[c.name.toLowerCase()] = c.tier;
        });

        // Attach tier to each job
        const jobsWithTier = jobs.map(job => ({
            ...job,
            tier: tierMap[job.company?.toLowerCase()] || 'good',
        }));

        res.json({ jobs: jobsWithTier, count: jobsWithTier.length });
    } catch (err) {
        next(err);
    }
}