import { defineStore } from 'pinia';
import { useLocalStorage } from '@vueuse/core';
import type { Transaction, TransactionInput } from '~/types/transaction';

const STORAGE_KEY = 'expense-tracker:transactions';

export const useTransactionsStore = defineStore('transactions', () => {
  // State
  const transactions = useLocalStorage<Transaction[]>(STORAGE_KEY, []);

  // Getters
  const sortedTransactions = computed(() => 
    [...transactions.value].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  );

  const incomeTransactions = computed(() => 
    transactions.value.filter(t => t.type === 'income')
  );

  const expenseTransactions = computed(() => 
    transactions.value.filter(t => t.type === 'expense')
  );

  const totalIncome = computed(() => 
    incomeTransactions.value.reduce((sum, t) => sum + t.amount, 0)
  );

  const totalExpense = computed(() => 
    expenseTransactions.value.reduce((sum, t) => sum + t.amount, 0)
  );

  const balance = computed(() => totalIncome.value - totalExpense.value);

  const getTransactionById = (id: string) => {
    return transactions.value.find(t => t.id === id);
  };

  // Actions
  const addTransaction = (input: TransactionInput) => {
    const now = new Date();
    const newTransaction: Transaction = {
      ...input,
      id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now,
    };
    transactions.value.push(newTransaction);
    return newTransaction;
  };

  const updateTransaction = (id: string, updates: Partial<TransactionInput>) => {
    const index = transactions.value.findIndex(t => t.id === id);
    if (index !== -1) {
      transactions.value[index] = {
        ...transactions.value[index],
        ...updates,
        updatedAt: new Date(),
      };
    }
  };

  const deleteTransaction = (id: string) => {
    transactions.value = transactions.value.filter(t => t.id !== id);
  };

  const clearAll = () => {
    transactions.value = [];
  };

  // Filter methods
  const getTransactionsByDateRange = (startDate: Date, endDate: Date) => {
    return transactions.value.filter(t => {
      const tDate = new Date(t.date);
      return tDate >= startDate && tDate <= endDate;
    });
  };

  const getTransactionsByCategory = (categoryId: string) => {
    return transactions.value.filter(t => t.category === categoryId);
  };

  const searchTransactions = (query: string) => {
    const lowerQuery = query.toLowerCase();
    return transactions.value.filter(t => 
      t.description.toLowerCase().includes(lowerQuery) ||
      t.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  };

  return {
    transactions,
    sortedTransactions,
    incomeTransactions,
    expenseTransactions,
    totalIncome,
    totalExpense,
    balance,
    getTransactionById,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    clearAll,
    getTransactionsByDateRange,
    getTransactionsByCategory,
    searchTransactions,
  };
});
