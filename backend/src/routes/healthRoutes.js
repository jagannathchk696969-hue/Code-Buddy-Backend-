import express from 'express';
import { aiService } from '../services/ai/aiService.js';

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }
  });
});

router.get('/health/ai', async (req, res) => {
  const metadata = aiService.getProviderInfo();
  const health = await aiService.healthCheck();

  res.json({
    success: health.status === 'connected',
    data: {
      ...metadata,
      ...health
    }
  });
});

export default router;
