// src/app.js
import express from 'express';
import cors from 'cors';
import jobsRouter from './routes/jobs.routes.js';
import analyticsRouter from './routes/analytics.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { rateLimiter } from './middleware/rateLimiter.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());
app.use(rateLimiter);

app.get('/health', (_, res) => res.json({ status: 'ok' }));
app.use('/api/jobs', jobsRouter);
app.use('/api/analytics', analyticsRouter);
app.use(errorHandler);

export default app;