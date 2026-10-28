import { z } from 'zod';

export const supportedLanguages = ['python', 'c', 'cpp', 'javascript'];

const languageSchema = z.string()
  .transform(val => val.toLowerCase().trim())
  .refine(val => supportedLanguages.includes(val), {
    message: `Language must be one of: ${supportedLanguages.join(', ')}`
  });

export const explainSchema = z.object({
  language: languageSchema,
  code: z.string()
    .min(1, 'Source code cannot be empty')
    .max(12000, 'Code exceeds maximum size of 12,000 characters')
});

export const debugSchema = z.object({
  language: languageSchema,
  code: z.string()
    .min(1, 'Source code cannot be empty')
    .max(12000, 'Code exceeds maximum size of 12,000 characters'),
  errorMessage: z.string().max(4000, 'Error message too long').optional().default(''),
  expectedBehavior: z.string().max(4000, 'Expected behavior description too long').optional().default('')
});

export const practiceGenerateSchema = z.object({
  language: languageSchema,
  topic: z.string().min(1, 'Topic is required').max(100),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced'], {
    errorMap: () => ({ message: "Difficulty must be 'Beginner', 'Intermediate', or 'Advanced'" })
  })
});

export const hintRequestSchema = z.object({
  language: languageSchema,
  problemTitle: z.string().min(1, 'Problem title is required').max(255),
  problemDescription: z.string().min(1, 'Problem description is required').max(8000),
  requestedLevel: z.number().int().min(1, 'Minimum hint level is 1').max(4, 'Normal hints only go up to Level 4. Use the Solution endpoint for Level 5.'),
  studentCode: z.string().max(12000).optional().default('')
});

export const solutionRequestSchema = z.object({
  language: languageSchema,
  problemTitle: z.string().min(1, 'Problem title is required').max(255),
  problemDescription: z.string().min(1, 'Problem description is required').max(8000)
});

export const chatSchema = z.object({
  conversationId: z.string().uuid().optional().nullable(),
  language: z.string().optional().default('python'),
  message: z.string().min(1, 'Message cannot be empty').max(4000, 'Message cannot exceed 4,000 characters'),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().max(6000)
  })).max(25, 'Conversation history cannot exceed 25 messages').optional().default([])
});
