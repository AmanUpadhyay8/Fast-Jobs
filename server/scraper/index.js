// server/scraper/index.js  ← GitHub Actions runs this file directly
// scraper/index.js
import 'dotenv/config';
import mongoose from 'mongoose';
import { fetchJobsForConfig } from './scraper.service.js';
import { upsertJobs } from './dedup.js';
import ScraperConfig from '../src/models/ScraperConfig.model.js';

async function run() {
    console.log('Scraper started:', new Date().toISOString());

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const configs = await ScraperConfig.find({ isActive: true });

    if (configs.length === 0) {
        console.log('No active scraper configs found. Add one to the scraper-configs collection.');
        await mongoose.disconnect();
        process.exit(0);
    }

    for (const config of configs) {
        console.log(`\nRunning config: keywords=[${config.keywords.join(', ')}]`);
        const jobs = await fetchJobsForConfig(config);
        console.log(`Total fetched: ${jobs.length}`);

        const result = await upsertJobs(jobs);
        console.log(`inserted=${result.inserted} | skipped=${result.skipped} | dropped=${result.dropped}`);
    }

    await mongoose.disconnect();
    console.log('\nScraper finished.');
    process.exit(0);
}

run().catch(err => {
    console.error('Scraper run failed:', err);
    process.exit(1);
});