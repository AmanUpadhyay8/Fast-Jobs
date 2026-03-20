// src/controllers/config.controller.js
import ScraperConfig from '../models/ScraperConfig.model.js';
import Company from '../models/Company.model.js';

export async function getConfig(req, res, next) {
    try {
        const config = await ScraperConfig.findOne({ isActive: true });
        res.json(config);
    } catch (err) { next(err); }
}

export async function updateConfig(req, res, next) {
    try {
        const { keywords, levels } = req.body;
        const config = await ScraperConfig.findOneAndUpdate(
            { isActive: true },
            { keywords, levels },
            { new: true }
        );
        res.json(config);
    } catch (err) { next(err); }
}

export async function getCompanies(req, res, next) {
    try {
        const companies = await Company.find({ isActive: true }).sort({ name: 1 });
        res.json(companies);
    } catch (err) { next(err); }
}

export async function addCompany(req, res, next) {
    try {
        const { name, tier } = req.body;
        const company = await Company.create({ name, tier });
        res.status(201).json(company);
    } catch (err) { next(err); }
}

export async function removeCompany(req, res, next) {
    try {
        await Company.findOneAndUpdate(
            { name: req.params.name },
            { isActive: false }   // soft delete — keeps history
        );
        res.json({ message: 'Company removed' });
    } catch (err) { next(err); }
}