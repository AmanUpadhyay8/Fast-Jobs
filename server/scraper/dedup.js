// server/scraper/dedup.js
import Job from '../src/models/Job.model.js';

export async function upsertJobs(jobs, whitelistedCompanies) {
    const companySet = new Set(whitelistedCompanies.map(c => c.name.toLowerCase()));
    const now = new Date();

    let inserted = 0, skipped = 0, dropped = 0;

    for (const job of jobs) {
        // Filter: only whitelisted companies
        if (!companySet.has(job.company.toLowerCase())) {
            dropped++;
            continue;
        }

        const twelveHoursAgo = new Date(now - 12 * 60 * 60 * 1000);
        job.isNew = job.postedAt > twelveHoursAgo;

        try {
            await Job.create(job);
            inserted++;
        } catch (err) {
            if (err.code === 11000) {
                skipped++;  // duplicate — compound index rejection, expected
            } else {
                console.error('Unexpected insert error:', err.message);
            }
        }
    }

    return { inserted, skipped, dropped };
}