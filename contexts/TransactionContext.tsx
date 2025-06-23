import React, { createContext, useContext, useState } from 'react';

export interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'charge';
  amount: number;
  recipientEmail?: string;
  senderEmail?: string;
  description?: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
}

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => void;
  getTransactionHistory: (userEmail: string) => Transaction[];
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

// Mock transaction data
const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'receive',
    amount: 25.00,
    senderEmail: 'jane@college.edu',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    status: 'completed'
  },
  {
    id: '2',
    type: 'send',
    amount: 15.50,
    recipientEmail: 'mike@university.edu',
    description: 'Coffee money',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    status: 'completed'
  },
  {
    id: '3',
    type: 'charge',
    amount: 50.00,
    description: 'Added funds',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    status: 'completed'
  }
];

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);

  const addTransaction = (transactionData: Omit<Transaction, 'id' | 'timestamp'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const getTransactionHistory = (userEmail: string) => {
    return transactions.filter(t => 
      t.senderEmail === userEmail || 
      t.recipientEmail === userEmail ||
      t.type === 'charge'
    );
  };

  return (
    <TransactionContext.Provider value={{
      transactions,
      addTransaction,
      getTransactionHistory
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