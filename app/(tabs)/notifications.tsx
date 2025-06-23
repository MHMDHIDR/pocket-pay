import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Info, X } from 'lucide-react-native';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

export default function NotificationsScreen() {
  const { user } = useAuth();
  const { notifications, removeNotification, clearNotifications } = useNotifications();

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authPrompt}>
          <Bell size={48} color="#D1D5DB" />
          <Text style={styles.authTitle}>Login Required</Text>
          <Text style={styles.authDescription}>
            Please log in to view your notifications
          </Text>
          <TouchableOpacity 
            style={styles.authButton}
            onPress={() => router.push('/auth')}
          >
            <Text style={styles.authButtonText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} color="#22C55E" />;
      case 'error':
        return <AlertCircle size={20} color="#EF4444" />;
      case 'info':
        return <Info size={20} color="#3B82F6" />;
      default:
        return <Bell size={20} color="#6B7280" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return '#DCFCE7';
      case 'error':
        return '#FEE2E2';
      case 'info':
        return '#DBEAFE';
      default:
        return '#F3F4F6';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        {notifications.length > 0 && (
          <TouchableOpacity onPress={clearNotifications}>
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Bell size={48} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>No notifications</Text>
            <Text style={styles.emptyStateDescription}>
              You're all caught up! New notifications will appear here.
            </Text>
          </View>
        ) : (
          <View style={styles.notificationsList}>
            {notifications.map((notification) => (
              <View key={notification.id} style={styles.notificationItem}>
                <View style={[
                  styles.notificationIcon,
                  { backgroundColor: getNotificationColor(notification.type) }
                ]}>
                  {getNotificationIcon(notification.type)}
                </View>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationMessage}>
                    {notification.message}
                  </Text>
                  <Text style={styles.notificationTime}>
                    {formatDate(notification.timestamp)}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.dismissButton}
                  onPress={() => removeNotification(notification.id)}
                >
                  <X size={16} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Sample Notifications for Demo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sample Notifications</Text>
          <Text style={styles.sectionDescription}>
            These are examples of notifications you might receive:
          </Text>
          
          <View style={styles.sampleNotificationsList}>
            <View style={styles.sampleNotificationItem}>
              <View style={[styles.notificationIcon, { backgroundColor: '#DCFCE7' }]}>
                <CheckCircle size={20} color="#22C55E" />
              </View>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationMessage}>
                  You received $25.00 from jane@college.edu
                </Text>
                <Text style={styles.notificationTime}>Payment received</Text>
              </View>
            </View>

            <View style={styles.sampleNotificationItem}>
              <View style={[styles.notificationIcon, { backgroundColor: '#DBEAFE' }]}>
                <Info size={20} color="#3B82F6" />
              </View>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationMessage}>
                  Your payment of $15.50 to mike@university.edu was successful
                </Text>
                <Text style={styles.notificationTime}>Payment sent</Text>
              </View>
            </View>

            <View style={styles.sampleNotificationItem}>
              <View style={[styles.notificationIcon, { backgroundColor: '#DCFCE7' }]}>
                <CheckCircle size={20} color="#22C55E" />
              </View>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationMessage}>
                  $50.00 has been added to your account
                </Text>
                <Text style={styles.notificationTime}>Funds added</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 0,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  clearAllText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#3B82F6',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  notificationsList: {
    paddingBottom: 24,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  sampleNotificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    opacity: 0.7,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    lineHeight: 22,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  dismissButton: {
    padding: 4,
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
  section: {
    marginTop: 24,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  sampleNotificationsList: {
    marginTop: 8,
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
    marginTop: 16,
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