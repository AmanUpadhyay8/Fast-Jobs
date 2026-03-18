// server/src/models/Company.model.js
const CompanySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    tier: { type: String, enum: ['premium', 'good', 'startup'], default: 'good' },
    isActive: { type: Boolean, default: true },
});

// server/src/models/ScraperConfig.model.js
const ScraperConfigSchema = new mongoose.Schema({
    keywords: [String],    // ["software engineer", "backend intern"]
    locations: [String],    // ["Bangalore", "Remote", "Hyderabad"]
    levels: [String],    // ["entry_level", "mid_level"]
    isActive: { type: Boolean, default: true },
});