import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Customer, Stage } from '../types';
import { mockCustomers } from '../../data/customers';

interface CustomerState {
  customers: Customer[];
  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, data: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  getCustomerById: (id: string) => Customer | undefined;
  filterByStage: (stage: Stage | 'all') => Customer[];
}

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set, get) => ({
      customers: mockCustomers,
      
      addCustomer: (customer) => {
        set((state) => ({
          customers: [...state.customers, customer]
        }));
      },
      
      updateCustomer: (id, data) => {
        set((state) => ({
          customers: state.customers.map((customer) =>
            customer.id === id ? { ...customer, ...data, updatedAt: new Date().toISOString() } : customer
          )
        }));
      },
      
      deleteCustomer: (id) => {
        set((state) => ({
          customers: state.customers.filter((customer) => customer.id !== id)
        }));
      },
      
      getCustomerById: (id) => {
        return get().customers.find((customer) => customer.id === id);
      },
      
      filterByStage: (stage) => {
        if (stage === 'all') return get().customers;
        return get().customers.filter((customer) => customer.stage === stage);
      }
    }),
    {
      name: 'crm-customers'
    }
  )
);