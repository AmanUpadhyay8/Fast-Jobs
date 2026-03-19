// src/models/ScraperConfig.model.js
import mongoose from 'mongoose';

const ScraperConfigSchema = new mongoose.Schema({
    keywords: [String],
    levels: [String],
    isActive: { type: Boolean, default: true },
});

export default mongoose.model('ScraperConfig', ScraperConfigSchema);