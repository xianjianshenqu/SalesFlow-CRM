import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Payment } from '../types';
import { mockPayments } from '../data/payments';

interface PaymentState {
  payments: Payment[];
  addPayment: (payment: Payment) => void;
  updatePayment: (id: string, data: Partial<Payment>) => void;
  deletePayment: (id: string) => void;
  getPaymentById: (id: string) => Payment | undefined;
  getPaymentsByStatus: (status: Payment['status']) => Payment[];
  getPaymentStats: () => {
    totalPaid: number;
    totalPending: number;
    totalOverdue: number;
    totalCount: number;
  };
  getOverduePayments: () => Payment[];
}

export const usePaymentStore = create<PaymentState>()(
  persist(
    (set, get) => ({
      payments: mockPayments,
      
      addPayment: (payment) => {
        set((state) => ({
          payments: [...state.payments, payment]
        }));
      },
      
      updatePayment: (id, data) => {
        set((state) => ({
          payments: state.payments.map((payment) =>
            payment.id === id ? { ...payment, ...data } : payment
          )
        }));
      },
      
      deletePayment: (id) => {
        set((state) => ({
          payments: state.payments.filter((payment) => payment.id !== id)
        }));
      },
      
      getPaymentById: (id) => {
        return get().payments.find((payment) => payment.id === id);
      },
      
      getPaymentsByStatus: (status) => {
        return get().payments.filter((payment) => payment.status === status);
      },
      
      getPaymentStats: () => {
        const payments = get().payments;
        const totalPaid = payments.reduce((sum, p) => sum + p.paidAmount, 0);
        const totalPending = payments
          .filter((p) => p.status === 'pending' || p.status === 'partial')
          .reduce((sum, p) => sum + p.balance, 0);
        const totalOverdue = payments
          .filter((p) => p.status === 'overdue')
          .reduce((sum, p) => sum + p.balance, 0);
        
        return {
          totalPaid,
          totalPending,
          totalOverdue,
          totalCount: payments.length
        };
      },
      
      getOverduePayments: () => {
        return get().payments.filter((p) => p.status === 'overdue');
      }
    }),
    {
      name: 'crm-payments'
    }
  )
);