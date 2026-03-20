// scraper/dedup.js
import Job from '../src/models/Job.model.js';
import Company from '../src/models/Company.model.js';

function matchesWhitelist(scrapedName, companyList) {
    if (!scrapedName) return false;
    const scraped = scrapedName.toLowerCase();

    return companyList.some(c => {
        const whitelisted = c.name.toLowerCase();
        // match if either contains the other
        return scraped.includes(whitelisted) || whitelisted.includes(scraped);
    });
}

function getMatchedName(scrapedName, companyList) {
    if (!scrapedName) return null;
    const scraped = scrapedName.toLowerCase();

    const match = companyList.find(c => {
        const whitelisted = c.name.toLowerCase();
        return scraped.includes(whitelisted) || whitelisted.includes(scraped);
    });

    // Always store the clean whitelisted name, not the scraped variant
    // so "Electronic Arts (EA)" gets stored as "Electronic Arts"
    return match ? match.name : null;
}

export async function upsertJobs(jobs) {
    const companies = await Company.find({ isActive: true }).lean();

    // Debug — print all unique company names coming from the scraper
    const scrapedCompanies = [...new Set(jobs.map(j => j.company))].sort();
    console.log('\n  Companies from scraper:');
    scrapedCompanies.forEach(name => {
        const matched = matchesWhitelist(name, companies);
        console.log(`    ${matched ? '✓' : '✗'} "${name}"`);
    });

    const now = new Date();
    const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000);

    let inserted = 0, skipped = 0, dropped = 0;

    for (const job of jobs) {
        const matchedName = getMatchedName(job.company, companies);

        if (!matchedName) {
            dropped++;
            continue;
        }

        // Normalize to clean whitelisted name
        job.company = matchedName;
        job.isRecent = job.postedAt > twentyFourHoursAgo;
        job.fetchedAt = now;

        try {
            await Job.create(job);
            inserted++;
        } catch (err) {
            if (err.code === 11000) {
                skipped++;
            } else {
                console.error('Unexpected insert error:', err.message);
            }
        }
    }

    return { inserted, skipped, dropped };
}