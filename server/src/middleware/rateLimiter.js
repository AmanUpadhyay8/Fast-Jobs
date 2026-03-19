// src/middleware/rateLimiter.js
import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 100,               // max 100 requests per window
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,       // returns rate limit info in headers
    legacyHeaders: false,
});