// server/src/app.js
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import jobsRouter from './routes/jobs.routes.js';
import analyticsRouter from './routes/analytics.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

app.get('/health', (_, res) => res.json({ status: 'ok' }));  // UptimeRobot pings this
app.use('/api/jobs', jobsRouter);
app.use('/api/analytics', analyticsRouter);
app.use(errorHandler);

export default app;