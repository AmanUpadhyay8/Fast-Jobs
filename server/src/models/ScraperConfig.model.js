// src/models/ScraperConfig.model.js
import mongoose from 'mongoose';

const ScraperConfigSchema = new mongoose.Schema({
    keywords: [String],
    isActive: { type: Boolean, default: true },
    webScraper: {
        maxPages: { type: Number, default: 2 },
        maxAgeDays: { type: Number, default: 1 },
    },
});

export default mongoose.model('ScraperConfig', ScraperConfigSchema);