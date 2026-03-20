// scraper/index.js
import 'dotenv/config';
import mongoose from 'mongoose';
import { scrapeWebJobs } from './scraper.worker.js';
import { upsertJobs } from './dedup.js';
import ScraperConfig from '../src/models/ScraperConfig.model.js';

async function run() {
    console.log('Scraper started:', new Date().toISOString());

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const config = await ScraperConfig.findOne({ isActive: true });

    if (!config) {
        console.log('No active scraper config found. Run seed.js first.');
        await mongoose.disconnect();
        process.exit(0);
    }

    // Pull maxPages and maxAgeDays from MongoDB — change these in Atlas anytime
    const maxPages = config.webScraper?.maxPages ?? 2;
    const maxAgeDays = config.webScraper?.maxAgeDays ?? 1;

    console.log(`\nWeb scraper config: maxPages=${maxPages}, maxAgeDays=${maxAgeDays}`);

    const webJobs = await scrapeWebJobs({ maxPages, maxAgeDays });
    console.log(`Total fetched: ${webJobs.length}`);

    const result = await upsertJobs(webJobs);
    console.log(`inserted=${result.inserted} | skipped=${result.skipped} | dropped=${result.dropped}`);

    await mongoose.disconnect();
    console.log('\nScraper finished:', new Date().toISOString());
    process.exit(0);
}

run().catch(err => {
    console.error('Scraper run failed:', err);
    process.exit(1);
});