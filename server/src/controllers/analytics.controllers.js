// server/src/controllers/analytics.controller.js
import Job from '../models/Job.model.js';

export async function getAnalytics(req, res, next) {
    try {
        const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

        const [total, newCount, byCompany] = await Promise.all([
            Job.countDocuments(),
            Job.countDocuments({ postedAt: { $gte: twelveHoursAgo } }),
            Job.aggregate([
                { $group: { _id: '$company', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 },
                { $project: { name: '$_id', count: 1, _id: 0 } },
            ]),
        ]);

        const topCompany = byCompany[0] || null;

        res.json({ total, newCount, topCompany, byCompany });
    } catch (err) {
        next(err);
    }
}