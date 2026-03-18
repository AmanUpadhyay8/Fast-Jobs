// server/scraper/index.js  ← GitHub Actions runs this file directly
import 'dotenv/config';
import mongoose from 'mongoose';
import { fetchJobsForConfig } from './scraper.service.js';
import { upsertJobs } from './dedup.js';
import ScraperConfig from '../src/models/ScraperConfig.model.js';
import Company from '../src/models/Company.model.js';

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const [configs, companies] = await Promise.all([
        ScraperConfig.find({ isActive: true }),
        Company.find({ isActive: true }),
    ]);

    for (const config of configs) {
        console.log(`Running config: ${config.keywords.join(', ')}`);
        const jobs = await fetchJobsForConfig(config);
        const result = await upsertJobs(jobs, companies);
        console.log(`  inserted=${result.inserted} skipped=${result.skipped} dropped=${result.dropped}`);
    }

    await mongoose.disconnect();
    console.log('Done');
    process.exit(0);
}

run().catch(err => {
    console.error('Scraper run failed:', err);
    process.exit(1);
});