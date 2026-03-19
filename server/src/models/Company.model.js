// src/models/Company.model.js
import mongoose from 'mongoose';

const CompanySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    tier: { type: String, enum: ['premium', 'good', 'startup'], default: 'good' },
    isActive: { type: Boolean, default: true },
});

export default mongoose.model('Company', CompanySchema);