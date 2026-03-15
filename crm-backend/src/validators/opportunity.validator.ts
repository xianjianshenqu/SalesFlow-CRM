import { z } from 'zod';

export const createOpportunitySchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  title: z.string().min(1, 'Title is required'),
  stage: z.enum(['new_lead', 'contacted', 'solution', 'negotiation', 'won']).default('new_lead'),
  value: z.number().min(0).default(0),
  probability: z.number().min(0).max(100).default(0),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  expectedCloseDate: z.string().optional(),
  description: z.string().optional(),
  nextStep: z.string().optional(),
});

export const updateOpportunitySchema = z.object({
  title: z.string().optional(),
  stage: z.enum(['new_lead', 'contacted', 'solution', 'negotiation', 'won']).optional(),
  value: z.number().min(0).optional(),
  probability: z.number().min(0).max(100).optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  expectedCloseDate: z.string().optional(),
  description: z.string().optional(),
  nextStep: z.string().optional(),
});

export const moveStageSchema = z.object({
  stage: z.enum(['new_lead', 'contacted', 'solution', 'negotiation', 'won']),
});

export type CreateOpportunityInput = z.infer<typeof createOpportunitySchema>;
export type UpdateOpportunityInput = z.infer<typeof updateOpportunitySchema>;