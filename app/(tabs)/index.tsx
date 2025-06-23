import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Send, CreditCard, Shield, Smartphone, Users, Zap } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { user } = useAuth();

  const features = [
    {
      icon: Send,
      title: 'Send Money',
      description: 'Transfer funds to friends instantly using just their email',
      color: '#3B82F6'
    },
    {
      icon: CreditCard,
      title: 'Charge Money',
      description: 'Add funds to your account with our secure payment system',
      color: '#22C55E'
    },
    {
      icon: Shield,
      title: 'Secure & Safe',
      description: 'Bank-level security to keep your money and data protected',
      color: '#F59E0B'
    },
    {
      icon: Smartphone,
      title: 'Mobile First',
      description: 'Designed specifically for mobile with an intuitive interface',
      color: '#8B5CF6'
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <LinearGradient
          colors={['#3B82F6', '#1D4ED8']}
          style={styles.heroSection}
        >
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>PocketPay</Text>
            <Text style={styles.heroSubtitle}>
              The banking app designed for students
            </Text>
            <Text style={styles.heroDescription}>
              Send money, charge funds, and manage your finances with ease. 
              Perfect for college students and young adults.
            </Text>
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: '#3B82F6' }]}
              onPress={() => user ? router.push('/send') : router.push('/auth')}
            >
              <Send size={24} color="#FFFFFF" />
              <Text style={styles.actionText}>Send Money</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: '#22C55E' }]}
              onPress={() => user ? router.push('/charge') : router.push('/auth')}
            >
              <CreditCard size={24} color="#FFFFFF" />
              <Text style={styles.actionText}>Charge Money</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Choose PocketPay?</Text>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: `${feature.color}15` }]}>
                <feature.icon size={24} color={feature.color} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Stats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Join the Community</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Users size={20} color="#3B82F6" />
              <Text style={styles.statNumber}>10K+</Text>
              <Text style={styles.statLabel}>Students</Text>
            </View>
            <View style={styles.statCard}>
              <Zap size={20} color="#22C55E" />
              <Text style={styles.statNumber}>50K+</Text>
              <Text style={styles.statLabel}>Transactions</Text>
            </View>
            <View style={styles.statCard}>
              <Shield size={20} color="#F59E0B" />
              <Text style={styles.statNumber}>100%</Text>
              <Text style={styles.statLabel}>Secure</Text>
            </View>
          </View>
        </View>

        {/* CTA Section */}
        {!user && (
          <View style={styles.section}>
            <View style={styles.ctaCard}>
              <Text style={styles.ctaTitle}>Ready to get started?</Text>
              <Text style={styles.ctaDescription}>
                Create your account and start managing your money today!
              </Text>
              <TouchableOpacity 
                style={styles.ctaButton}
                onPress={() => router.push('/auth')}
              >
                <Text style={styles.ctaButtonText}>Get Started</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
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
  heroSection: {
    padding: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#BFDBFE',
    marginBottom: 16,
  },
  heroDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#DBEAFE',
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 16,
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
  featureCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  ctaCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  ctaTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 8,
  },
  ctaDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  ctaButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  ctaButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});