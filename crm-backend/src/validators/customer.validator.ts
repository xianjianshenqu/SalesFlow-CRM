import { z } from 'zod';

export const createCustomerSchema = z.object({
  name: z.string().min(1, 'Customer name is required'),
  shortName: z.string().min(1, 'Short name is required').max(10),
  email: z.string().email().optional().or(z.literal('')),
  stage: z.enum(['new_lead', 'contacted', 'solution', 'negotiation', 'won']).default('new_lead'),
  estimatedValue: z.number().min(0).default(0),
  nextFollowUp: z.string().optional(),
  source: z.enum(['direct', 'referral', 'website', 'conference', 'partner']).optional(),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  contactPerson: z.string().min(1, 'Contact person is required'),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  industry: z.string().optional(),
  notes: z.string().optional(),
});

export const updateCustomerSchema = z.object({
  name: z.string().min(1).optional(),
  shortName: z.string().min(1).max(10).optional(),
  email: z.string().email().optional().or(z.literal('')),
  stage: z.enum(['new_lead', 'contacted', 'solution', 'negotiation', 'won']).optional(),
  estimatedValue: z.number().min(0).optional(),
  nextFollowUp: z.string().optional(),
  source: z.enum(['direct', 'referral', 'website', 'conference', 'partner']).optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  industry: z.string().optional(),
  notes: z.string().optional(),
});

export const customerQuerySchema = z.object({
  page: z.string().optional(),
  pageSize: z.string().optional(),
  stage: z.enum(['new_lead', 'contacted', 'solution', 'negotiation', 'won', 'all']).optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  source: z.enum(['direct', 'referral', 'website', 'conference', 'partner']).optional(),
  search: z.string().optional(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;