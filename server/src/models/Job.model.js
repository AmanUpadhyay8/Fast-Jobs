// server/src/models/Job.model.js
import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    role: { type: String },               // "Backend Engineer", "Intern", "Fullstack" and what else to add..
    level: {
        type: String,
        enum: ['intern', 'sde', 'senior', 'staff', 'principal'],
        required: true
    },
    applyUrl: { type: String, required: true },
    source: { type: String },               // "linkedin", "indeed", "JSearch will show other portals as well"
    postedAt: { type: Date, required: true },
    fetchedAt: { type: Date, default: Date.now },
    isRecent: { type: Boolean, default: false }, // postedAt within 12h of fetchedAt
    tags: [String],
    city: { type: String },
    isRemote: { type: Boolean },
}, { timestamps: true });

// Auto-delete jobs older than 7 days
JobSchema.index({ postedAt: 1 }, { expireAfterSeconds: 604800 });

// Deduplication — silent fail on duplicate insert
JobSchema.index({ company: 1, title: 1, postedAt: 1 }, { unique: true });

// Query performance
JobSchema.index({ level: 1, postedAt: -1 });

export default mongoose.model('Job', JobSchema);