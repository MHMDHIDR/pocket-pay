import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, CreditCard, DollarSign, Calendar, Lock } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { TransactionProvider, useTransactions } from '@/contexts/TransactionContext';

function ChargeContent() {
  const { user, updateBalance } = useAuth();
  const { addNotification } = useNotifications();
  const { addTransaction } = useTransactions();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
  });

  const handleAmountChange = (text: string) => {
    // Remove any non-numeric characters except decimal point
    const cleanText = text.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleanText.split('.');
    if (parts.length > 2) {
      return;
    }
    
    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) {
      return;
    }
    
    setFormData({ ...formData, amount: cleanText });
  };

  const handleCardNumberChange = (text: string) => {
    // Remove all non-numeric characters
    const cleanText = text.replace(/\D/g, '');
    
    // Limit to 16 digits and add spaces every 4 digits
    const limitedText = cleanText.substring(0, 16);
    const formattedText = limitedText.replace(/(\d{4})(?=\d)/g, '$1 ');
    
    setFormData({ ...formData, cardNumber: formattedText });
  };

  const handleExpiryChange = (text: string) => {
    // Remove all non-numeric characters
    const cleanText = text.replace(/\D/g, '');
    
    // Format as MM/YY
    let formattedText = cleanText;
    if (cleanText.length >= 3) {
      formattedText = cleanText.substring(0, 2) + '/' + cleanText.substring(2, 4);
    }
    
    setFormData({ ...formData, expiryDate: formattedText });
  };

  const handleCvvChange = (text: string) => {
    // Remove all non-numeric characters and limit to 4 digits
    const cleanText = text.replace(/\D/g, '').substring(0, 4);
    setFormData({ ...formData, cvv: cleanText });
  };

  const validateForm = () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return false;
    }

    if (parseFloat(formData.amount) > 1000) {
      Alert.alert('Error', 'Maximum charge amount is $1,000');
      return false;
    }

    if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length !== 16) {
      Alert.alert('Error', 'Please enter a valid 16-digit card number');
      return false;
    }

    if (!formData.expiryDate || formData.expiryDate.length !== 5) {
      Alert.alert('Error', 'Please enter a valid expiry date (MM/YY)');
      return false;
    }

    if (!formData.cvv || formData.cvv.length < 3) {
      Alert.alert('Error', 'Please enter a valid CVV');
      return false;
    }

    if (!formData.cardName) {
      Alert.alert('Error', 'Please enter the name on card');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    // Simulate payment processing
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const amount = parseFloat(formData.amount);
      
      // Update user balance
      updateBalance(amount);
      
      // Add transaction record
      addTransaction({
        type: 'charge',
        amount: amount,
        description: `Added funds via ****${formData.cardNumber.slice(-4)}`,
        status: 'completed'
      });

      // Show success notification
      addNotification(
        `Successfully added ${formatCurrency(amount)} to your account`,
        'success'
      );

      Alert.alert(
        'Success!',
        `${formatCurrency(amount)} has been added to your account`,
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)/dashboard')
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to process payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const quickAmounts = [10, 25, 50, 100];

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authPrompt}>
          <Text style={styles.authTitle}>Login Required</Text>
          <Text style={styles.authDescription}>
            Please log in to charge your account
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

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Funds</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Amount Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amount to Add</Text>
            <View style={styles.amountContainer}>
              <View style={styles.amountInputContainer}>
                <DollarSign size={24} color="#3B82F6" />
                <TextInput
                  style={styles.amountInput}
                  placeholder="0.00"
                  placeholderTextColor="#9CA3AF"
                  value={formData.amount}
                  onChangeText={handleAmountChange}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            {/* Quick Amount Buttons */}
            <View style={styles.quickAmounts}>
              {quickAmounts.map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={styles.quickAmountButton}
                  onPress={() => setFormData({ ...formData, amount: amount.toString() })}
                >
                  <Text style={styles.quickAmountText}>
                    ${amount}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Card Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Card Details</Text>
            
            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <CreditCard size={20} color="#6B7280" />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Card number"
                placeholderTextColor="#9CA3AF"
                value={formData.cardNumber}
                onChangeText={handleCardNumberChange}
                keyboardType="numeric"
                maxLength={19}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputContainer, styles.inputHalf]}>
                <View style={styles.inputIcon}>
                  <Calendar size={20} color="#6B7280" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="MM/YY"
                  placeholderTextColor="#9CA3AF"
                  value={formData.expiryDate}
                  onChangeText={handleExpiryChange}
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>

              <View style={[styles.inputContainer, styles.inputHalf]}>
                <View style={styles.inputIcon}>
                  <Lock size={20} color="#6B7280" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="CVV"
                  placeholderTextColor="#9CA3AF"
                  value={formData.cvv}
                  onChangeText={handleCvvChange}
                  keyboardType="numeric"
                  secureTextEntry
                  maxLength={4}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, { paddingLeft: 16 }]}
                placeholder="Name on card"
                placeholderTextColor="#9CA3AF"
                value={formData.cardName}
                onChangeText={(text) => setFormData({ ...formData, cardName: text })}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Security Notice */}
          <View style={styles.section}>
            <View style={styles.securityNotice}>
              <Lock size={16} color="#22C55E" />
              <Text style={styles.securityText}>
                Your payment information is encrypted and secure
              </Text>
            </View>
          </View>

          {/* Submit Button */}
          <View style={styles.section}>
            <TouchableOpacity 
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? 'Processing...' : `Add ${formData.amount ? formatCurrency(parseFloat(formData.amount)) : 'Funds'}`}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default function ChargeScreen() {
  return (
    <TransactionProvider>
      <ChargeContent />
    </TransactionProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 16,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingHorizontal: 20,
    paddingVertical: 16,
    minWidth: 200,
  },
  amountInput: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginLeft: 8,
    flex: 1,
    textAlign: 'center',
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  quickAmountButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quickAmountText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#3B82F6',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputHalf: {
    flex: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  securityText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#166534',
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#22C55E',
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
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