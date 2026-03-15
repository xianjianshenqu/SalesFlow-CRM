import { z } from 'zod';

export const createPaymentSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  totalAmount: z.number().min(0),
  paidAmount: z.number().min(0).default(0),
  status: z.enum(['paid', 'partial', 'pending', 'overdue']).default('pending'),
  planType: z.string().optional(),
  dueDate: z.string(),
  notes: z.string().optional(),
});

export const updatePaymentSchema = z.object({
  totalAmount: z.number().min(0).optional(),
  paidAmount: z.number().min(0).optional(),
  status: z.enum(['paid', 'partial', 'pending', 'overdue']).optional(),
  planType: z.string().optional(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;