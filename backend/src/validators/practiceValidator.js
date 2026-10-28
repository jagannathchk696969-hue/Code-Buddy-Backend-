import { z } from 'zod';
import { supportedLanguages } from './aiValidator.js';

export const saveProblemSchema = z.object({
  language: z.string().refine(val => supportedLanguages.includes(val.toLowerCase()), {
    message: `Language must be one of: ${supportedLanguages.join(', ')}`
  }),
  topic: z.string().min(1).max(100),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  title: z.string().min(1).max(255),
  description: z.string().min(1).max(8000),
  inputDescription: z.string().min(1).max(4000),
  outputDescription: z.string().min(1).max(4000),
  constraints: z.string().min(1).max(2000),
  sampleInput: z.string().max(4000),
  sampleOutput: z.string().max(4000),
  conceptPracticed: z.string().max(255).optional().default('')
});

export const saveAttemptSchema = z.object({
  submittedCode: z.string().max(20000),
  hintsUsed: z.number().int().min(0).max(5).default(0),
  completed: z.boolean().default(false)
});
