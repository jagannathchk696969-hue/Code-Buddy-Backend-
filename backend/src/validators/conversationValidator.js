import { z } from 'zod';

export const createConversationSchema = z.object({
  title: z.string().min(1, 'Title is required').max(120).optional().default('New Conversation'),
  language: z.string().max(50).optional().default('python')
});

export const updateConversationSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').max(120)
});
