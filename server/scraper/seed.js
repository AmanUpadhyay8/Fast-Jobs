// scraper/seed.js
import 'dotenv/config';
import mongoose from 'mongoose';
import Company from '../src/models/Company.model.js';
import ScraperConfig from '../src/models/ScraperConfig.model.js';

await mongoose.connect(process.env.MONGO_URI);

// Add companies you want jobs from
await Company.insertMany([
    { name: 'Google', tier: 'premium' },
    { name: 'Microsoft', tier: 'premium' },
    { name: 'Atlassian', tier: 'premium' },
    { name: 'Razorpay', tier: 'startup' },
    { name: 'Zepto', tier: 'startup' },
    { name: 'Groww', tier: 'startup' },
    { name: 'Postman', tier: 'good' },
    { name: 'Stripe', tier: 'premium' },
    { name: 'Databricks', tier: 'good' },
    { name: 'Salesforce', tier: 'premium' },
    { name: 'VMware', tier: 'good' },
    { name: 'Adobe', tier: 'premium' },
    { name: 'Intuit', tier: 'premium' },
    { name: 'DeShaw', tier: 'premium' },
    { name: 'Rubrik', tier: 'premium' },
    { name: 'Coinbase', tier: 'premium' },
    { name: 'Confluent', tier: 'premium' },
    { name: 'Coupang', tier: 'premium' },
    { name: 'Datadog', tier: 'premium' },
    { name: 'Figma', tier: 'premium' },
    { name: 'Coupang', tier: 'premium' },
    { name: 'Coupang', tier: 'good' },
    { name: 'LinkedIn', tier: 'good' },
    { name: 'Rippling', tier: 'good' },
    { name: 'Hubspot', tier: 'good' },
    { name: 'UiPath', tier: 'good' },
    { name: 'Akamai', tier: 'good' },
    { name: 'Arcesium', tier: 'good' },
    { name: 'Zalando', tier: 'good' },
    { name: 'Meesho', tier: 'good' },
    { name: 'Siemens', tier: 'good' },
    { name: 'Teradata', tier: 'good' },
    { name: 'NVIDIA', tier: 'good' },
    { name: 'Wells Fargo', tier: 'good' },
    { name: 'Goldman Sachs', tier: 'Premium' },
    { name: 'JP Morgan Chase', tier: 'Premium' },
    { name: 'Electronic Arts', tier: 'good' },
    { name: 'Visa', tier: 'Premium' },
    { name: 'Cisco', tier: 'Premium' },
    { name: 'Amazon Web Services', tier: 'good' },
    { name: 'LSEG', tier: 'good' },
    { name: 'Qualcomm', tier: 'good' },
    { name: 'Intel', tier: 'Premium' },
    { name: 'Warner Bros Discovery', tier: 'Premium' },
    { name: 'AMD', tier: 'Premium' },
    { name: 'Freshworks', tier: 'good' },
    { name: 'Apple', tier: 'Premuim' },
    { name: 'Oracle', tier: 'Premium' },
    { name: 'Notion', tier: 'Good' },
    // will add more later
], { ordered: false }).catch(() => console.log('Some companies already exist, skipping'));

// Add search config
await ScraperConfig.create({
    keywords: ['software engineer', 'backend engineer', 'software engineer intern', ' Fullstack Developer', 'Frontend Developer', 'SDE 1', 'SDE 2', 'Software Developer'],
    levels: ['intern', 'sde', 'senior'],
    isActive: true,
});

console.log('Seed complete');
await mongoose.disconnect();
process.exit(0);