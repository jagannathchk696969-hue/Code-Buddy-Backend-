import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getMe, updateProfile } from '../controllers/authController.js';

const router = express.Router();

router.get('/auth/me', requireAuth, getMe);
router.get('/profile', requireAuth, getMe);
router.patch('/profile', requireAuth, updateProfile);

export default router;
