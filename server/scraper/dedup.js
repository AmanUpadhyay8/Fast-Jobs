// scraper/dedup.js
import Job from '../src/models/Job.model.js';
import Company from '../src/models/Company.model.js';

export async function upsertJobs(jobs) {
    const companies = await Company.find({ isActive: true }).lean();
    const companySet = new Set(companies.map(c => c.name.toLowerCase()));

    const now = new Date();
    const twelveHoursAgo = new Date(now - 12 * 60 * 60 * 1000);

    let inserted = 0, skipped = 0, dropped = 0;

    for (const job of jobs) {
        // Drop jobs not on the company whitelist
        if (!companySet.has(job.company?.toLowerCase())) {
            dropped++;
            continue;
        }

        job.isRecent = job.postedAt > twelveHoursAgo;
        job.fetchedAt = now;

        try {
            await Job.create(job);
            inserted++;
        } catch (err) {
            if (err.code === 11000) {
                skipped++; // duplicate — expected, compound index blocks it silently
            } else {
                console.error('Unexpected insert error:', err.message);
            }
        }
    }

    return { inserted, skipped, dropped };
}