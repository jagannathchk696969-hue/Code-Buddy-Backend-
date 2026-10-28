import express from 'express';
import { aiRateLimiter } from '../middleware/rateLimiter.js';
import { optionalAuth } from '../middleware/auth.js';
import {
  explainCode,
  debugCode,
  generatePractice,
  getHint,
  getSolution,
  chatTutor
} from '../controllers/aiController.js';

const router = express.Router();

// Apply AI rate limiter to all AI generation routes
router.use(aiRateLimiter);

router.post('/explain', optionalAuth, explainCode);
router.post('/debug', optionalAuth, debugCode);
router.post('/practice/generate', optionalAuth, generatePractice);
router.post('/hints', optionalAuth, getHint);
router.post('/solution', optionalAuth, getSolution);
router.post('/chat', optionalAuth, chatTutor);

export default router;
