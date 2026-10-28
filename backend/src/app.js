import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import config from './config/env.js';
import { standardRateLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';
import practiceRoutes from './routes/practiceRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration restricted to frontend origin
app.use(cors({
  origin: [config.frontendOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request body parser with safe payload limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Global standard rate limiter
app.use(standardRateLimiter);

// Mount API routes
app.use('/api', healthRoutes);
app.use('/api', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Catch-all 404 handler
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

export default app;
