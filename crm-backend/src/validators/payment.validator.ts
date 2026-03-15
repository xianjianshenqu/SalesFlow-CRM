import { z } from 'zod';

export const createPaymentSchema = z.object({
  body: z.object({
    customerId: z.string().min(1, 'Customer ID is required'),
    invoiceId: z.string().min(1, 'Invoice ID is required'),
    totalAmount: z.number().min(0),
    paidAmount: z.number().min(0).default(0),
    status: z.enum(['paid', 'partial', 'pending', 'overdue']).default('pending'),
    planType: z.string().optional(),
    dueDate: z.string(),
    lastReminder: z.string().optional(),
  }),
});

export const updatePaymentSchema = z.object({
  body: z.object({
    totalAmount: z.number().min(0).optional(),
    paidAmount: z.number().min(0).optional(),
    status: z.enum(['paid', 'partial', 'pending', 'overdue']).optional(),
    planType: z.string().optional(),
    dueDate: z.string().optional(),
    lastReminder: z.string().optional(),
  }),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>['body'];
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>['body'];