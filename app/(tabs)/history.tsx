import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowUpRight, ArrowDownLeft, Plus, Filter } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { TransactionProvider, useTransactions } from '@/contexts/TransactionContext';
import { router } from 'expo-router';

function HistoryContent() {
  const { user } = useAuth();
  const { getTransactionHistory } = useTransactions();
  const [filter, setFilter] = useState<'all' | 'send' | 'receive' | 'charge'>('all');

  if (!user) {
    return (
      <View style={styles.authPrompt}>
        <Text style={styles.authTitle}>Login Required</Text>
        <Text style={styles.authDescription}>
          Please log in to view your transaction history
        </Text>
        <TouchableOpacity 
          style={styles.authButton}
          onPress={() => router.push('/auth')}
        >
          <Text style={styles.authButtonText}>Log In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const allTransactions = getTransactionHistory(user.email);
  const filteredTransactions = filter === 'all' 
    ? allTransactions 
    : allTransactions.filter(t => t.type === filter);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'send':
        return <ArrowUpRight size={20} color="#EF4444" />;
      case 'receive':
        return <ArrowDownLeft size={20} color="#22C55E" />;
      case 'charge':
        return <Plus size={20} color="#3B82F6" />;
      default:
        return <Plus size={20} color="#6B7280" />;
    }
  };

  const getTransactionTitle = (transaction: any) => {
    switch (transaction.type) {
      case 'send':
        return 'Sent to';
      case 'receive':
        return 'Received from';
      case 'charge':
        return 'Added funds';
      default:
        return 'Transaction';
    }
  };

  const getTransactionSubtitle = (transaction: any) => {
    switch (transaction.type) {
      case 'send':
        return transaction.recipientEmail;
      case 'receive':
        return transaction.senderEmail;
      case 'charge':
        return 'Card ending in ••••';
      default:
        return '';
    }
  };

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'send', label: 'Sent' },
    { key: 'receive', label: 'Received' },
    { key: 'charge', label: 'Added' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transaction History</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {filters.map((filterOption) => (
            <TouchableOpacity
              key={filterOption.key}
              style={[
                styles.filterTab,
                filter === filterOption.key && styles.filterTabActive
              ]}
              onPress={() => setFilter(filterOption.key as any)}
            >
              <Text style={[
                styles.filterTabText,
                filter === filterOption.key && styles.filterTabTextActive
              ]}>
                {filterOption.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {filteredTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Filter size={48} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>
              {filter === 'all' ? 'No transactions yet' : `No ${filter} transactions`}
            </Text>
            <Text style={styles.emptyStateDescription}>
              {filter === 'all' 
                ? 'Start by sending money or charging your account'
                : `You haven't ${filter === 'send' ? 'sent any money' : 
                    filter === 'receive' ? 'received any money' : 'added any funds'} yet`
              }
            </Text>
          </View>
        ) : (
          <View style={styles.transactionsList}>
            {filteredTransactions.map((transaction) => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View style={styles.transactionIcon}>
                  {getTransactionIcon(transaction.type)}
                </View>
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionTitle}>
                    {getTransactionTitle(transaction)}
                  </Text>
                  <Text style={styles.transactionSubtitle}>
                    {getTransactionSubtitle(transaction)}
                  </Text>
                  {transaction.description && (
                    <Text style={styles.transactionDescription}>
                      {transaction.description}
                    </Text>
                  )}
                  <Text style={styles.transactionDate}>
                    {formatDate(transaction.timestamp)}
                  </Text>
                </View>
                <View style={styles.transactionAmountContainer}>
                  <Text style={[
                    styles.transactionAmount,
                    {
                      color: transaction.type === 'send' ? '#EF4444' : '#22C55E'
                    }
                  ]}>
                    {transaction.type === 'send' ? '-' : '+'}
                    {formatCurrency(transaction.amount)}
                  </Text>
                  <View style={[
                    styles.statusBadge,
                    {
                      backgroundColor: transaction.status === 'completed' ? '#DCFCE7' : 
                                       transaction.status === 'pending' ? '#FEF3C7' : '#FEE2E2'
                    }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      {
                        color: transaction.status === 'completed' ? '#166534' : 
                               transaction.status === 'pending' ? '#B45309' : '#DC2626'
                      }
                    ]}>
                      {transaction.status}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export default function HistoryScreen() {
  return (
    <TransactionProvider>
      <HistoryContent />
    </TransactionProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 24,
    paddingBottom: 0,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  filterContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  filterTabActive: {
    backgroundColor: '#3B82F6',
  },
  filterTabText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  transactionsList: {
    paddingBottom: 24,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 2,
  },
  transactionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 2,
  },
  transactionDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  transactionAmountContainer: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  authPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  authTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 8,
  },
  authDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  authButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  authButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});