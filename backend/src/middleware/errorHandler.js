import { ZodError } from 'zod';
import config from '../config/env.js';

/**
 * Centralized Express Error Handling Middleware.
 * Never leaks stack traces or private credentials to the client in production.
 */
export function errorHandler(err, req, res, next) {
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request payload or parameters',
        details: err.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message
        }))
      }
    });
  }

  // Handle explicit HTTP errors
  const status = err.status || err.statusCode || 500;
  const code = err.code || (status === 404 ? 'NOT_FOUND' : status === 401 ? 'UNAUTHORIZED' : status === 403 ? 'FORBIDDEN' : 'INTERNAL_SERVER_ERROR');
  const message = err.message || 'An unexpected internal server error occurred';

  // Log error safely without leaking credentials
  if (config.nodeEnv !== 'test') {
    console.error(`[ERROR] [${req.method} ${req.originalUrl}] ${code}: ${message}`);
    if (config.nodeEnv === 'development' && err.stack) {
      console.error(err.stack);
    }
  }

  res.status(status).json({
    success: false,
    error: {
      code,
      message,
      ...(config.nodeEnv === 'development' && { details: err.details || undefined })
    }
  });
}

/**
 * 404 Not Found Middleware for unknown routes.
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`
    }
  });
}
