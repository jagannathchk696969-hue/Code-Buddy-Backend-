import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  listProblems,
  saveProblem,
  getProblem,
  recordAttempt,
  listAttempts
} from '../controllers/practiceController.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', listProblems);
router.post('/', saveProblem);
router.get('/attempts', listAttempts);
router.get('/:id', getProblem);
router.post('/:id/attempts', recordAttempt);

export default router;
