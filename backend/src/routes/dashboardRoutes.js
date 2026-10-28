import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getDashboardStats, getDashboardActivity } from '../controllers/dashboardController.js';

const router = express.Router();

router.use(requireAuth);

router.get('/stats', getDashboardStats);
router.get('/activity', getDashboardActivity);

export default router;
