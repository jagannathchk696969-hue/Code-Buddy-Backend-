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
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Chrome Private Network Access preflight support
app.use((req, res, next) => {
  if (req.headers['access-control-request-private-network']) {
    res.setHeader('Access-Control-Allow-Private-Network', 'true');
  }
  next();
});

// Permissive CORS configuration supporting Vercel, Render, and Localhost
app.use(cors({
  origin: (origin, callback) => {
    // Allow tools, curl, and server-to-server requests
    if (!origin) return callback(null, true);

    // Allow configured frontend, all Vercel deployments, Render, and local dev
    if (
      config.frontendOrigin === '*' ||
      origin === config.frontendOrigin ||
      /\.vercel\.app$/.test(origin) ||
      /\.onrender\.com$/.test(origin) ||
      /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Request-Private-Network']
}));

app.options('*', cors());

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
