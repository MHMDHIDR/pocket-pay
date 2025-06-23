import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Send, CreditCard, Eye, EyeOff, ArrowUpRight, ArrowDownLeft, Plus } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { TransactionProvider, useTransactions } from '@/contexts/TransactionContext';

function DashboardContent() {
  const { user } = useAuth();
  const [balanceVisible, setBalanceVisible] = React.useState(true);
  const { transactions, getTransactionHistory } = useTransactions();

  if (!user) {
    return (
      <View style={styles.authPrompt}>
        <Text style={styles.authTitle}>Login Required</Text>
        <Text style={styles.authDescription}>
          Please log in to access your dashboard
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

  const recentTransactions = getTransactionHistory(user.email).slice(0, 3);

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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user.name.split(' ')[0]}</Text>
          </View>
        </View>

        {/* Balance Card */}
        <View style={styles.section}>
          <LinearGradient
            colors={['#3B82F6', '#1D4ED8']}
            style={styles.balanceCard}
          >
            <View style={styles.balanceHeader}>
              <Text style={styles.balanceLabel}>Current Balance</Text>
              <TouchableOpacity onPress={() => setBalanceVisible(!balanceVisible)}>
                {balanceVisible ? (
                  <Eye size={20} color="#BFDBFE" />
                ) : (
                  <EyeOff size={20} color="#BFDBFE" />
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.balanceAmount}>
              {balanceVisible ? formatCurrency(user.balance) : '••••••'}
            </Text>
            <Text style={styles.balanceSubtext}>Available to spend</Text>
          </LinearGradient>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: '#3B82F6' }]}
              onPress={() => router.push('/send')}
            >
              <Send size={24} color="#FFFFFF" />
              <Text style={styles.actionText}>Send Money</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: '#22C55E' }]}
              onPress={() => router.push('/charge')}
            >
              <Plus size={24} color="#FFFFFF" />
              <Text style={styles.actionText}>Add Funds</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {recentTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <CreditCard size={48} color="#D1D5DB" />
              <Text style={styles.emptyStateTitle}>No transactions yet</Text>
              <Text style={styles.emptyStateDescription}>
                Start by sending money or charging your account
              </Text>
            </View>
          ) : (
            <View style={styles.transactionsList}>
              {recentTransactions.map((transaction) => (
                <View key={transaction.id} style={styles.transactionItem}>
                  <View style={styles.transactionIcon}>
                    {transaction.type === 'send' ? (
                      <ArrowUpRight size={20} color="#EF4444" />
                    ) : transaction.type === 'receive' ? (
                      <ArrowDownLeft size={20} color="#22C55E" />
                    ) : (
                      <Plus size={20} color="#3B82F6" />
                    )}
                  </View>
                  <View style={styles.transactionDetails}>
                    <Text style={styles.transactionTitle}>
                      {transaction.type === 'send' ? 'Sent to' : 
                       transaction.type === 'receive' ? 'Received from' : 
                       'Added funds'}
                    </Text>
                    <Text style={styles.transactionSubtitle}>
                      {transaction.type === 'send' ? transaction.recipientEmail :
                       transaction.type === 'receive' ? transaction.senderEmail :
                       'Card ending in ••••'}
                    </Text>
                    <Text style={styles.transactionDate}>
                      {formatDate(transaction.timestamp)}
                    </Text>
                  </View>
                  <Text style={[
                    styles.transactionAmount,
                    {
                      color: transaction.type === 'send' ? '#EF4444' : '#22C55E'
                    }
                  ]}>
                    {transaction.type === 'send' ? '-' : '+'}
                    {formatCurrency(transaction.amount)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function DashboardScreen() {
  return (
    <TransactionProvider>
      <DashboardContent />
    </TransactionProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 0,
  },
  greeting: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  section: {
    padding: 24,
    paddingTop: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#3B82F6',
  },
  balanceCard: {
    padding: 24,
    borderRadius: 20,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#BFDBFE',
  },
  balanceAmount: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  balanceSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#DBEAFE',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  transactionsList: {
    gap: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
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
  transactionDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  transactionAmount: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
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