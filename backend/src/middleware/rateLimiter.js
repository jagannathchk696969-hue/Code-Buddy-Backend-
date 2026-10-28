import rateLimit from 'express-rate-limit';

/**
 * Standard API rate limiter: 100 requests per 15 minutes.
 */
export const standardRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again in a few minutes.'
    }
  }
});

/**
 * Strict rate limiter for AI generation endpoints to prevent quota exhaustion and abuse.
 * 30 requests per 10 minutes.
 */
export const aiRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'AI_RATE_LIMIT_EXCEEDED',
      message: 'AI request limit reached. Please wait a short while before generating more requests.'
    }
  }
});
