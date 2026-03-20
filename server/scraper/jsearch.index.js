// scraper/jsearch.index.js
import 'dotenv/config';
import mongoose from 'mongoose';
import { fetchJobsForConfig } from './scraper.service.js';
import { upsertJobs } from './dedup.js';

// Hardcoded keywords here — kept to 3 to stay within 200 req/month free limit
// 3 keywords × 1 run/day × 30 days = 90 requests/month
const JSEARCH_KEYWORDS = [
    'software engineer OR backend engineer OR software developer',
    'fullstack developer OR frontend developer',
    'SDE 1 OR SDE 2',
];

async function run() {
    console.log('JSearch scraper started:', new Date().toISOString());

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const jobs = await fetchJobsForConfig({ keywords: JSEARCH_KEYWORDS });
    console.log(`Total fetched from JSearch: ${jobs.length}`);

    const result = await upsertJobs(jobs);
    console.log(`inserted=${result.inserted} | skipped=${result.skipped} | dropped=${result.dropped}`);

    await mongoose.disconnect();
    console.log('JSearch scraper finished:', new Date().toISOString());
    process.exit(0);
}

run().catch(err => {
    console.error('JSearch scraper failed:', err);
    process.exit(1);
});