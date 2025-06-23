import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { Transaction } from '@/types';
import { useAuth } from './AuthContext';

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: {
    type: 'send' | 'charge';
    amount: number;
    recipientEmail?: string;
    description?: string;
  }) => Promise<void>;
  getTransactionHistory: (userEmail: string) => Transaction[];
  refreshTransactions: () => Promise<void>;
  isLoading: boolean;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      refreshTransactions();
    } else {
      setTransactions([]);
    }
  }, [user]);

  const refreshTransactions = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await apiClient.getTransactionHistory();
      if (response.success && response.data) {
        setTransactions(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addTransaction = async (transactionData: {
    type: 'send' | 'charge';
    amount: number;
    recipientEmail?: string;
    description?: string;
  }) => {
    try {
      const response = await apiClient.createTransaction(transactionData);
      if (response.success) {
        // Refresh transactions to get the latest data
        await refreshTransactions();
      } else {
        throw new Error(response.message || 'Transaction failed');
      }
    } catch (error) {
      console.error('Transaction error:', error);
      throw error;
    }
  };

  const getTransactionHistory = (userEmail: string) => {
    return transactions.filter(t => 
      t.senderEmail === userEmail || 
      t.recipientEmail === userEmail
    );
  };

  return (
    <TransactionContext.Provider value={{
      transactions,
      addTransaction,
      getTransactionHistory,
      refreshTransactions,
      isLoading
    }}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
}