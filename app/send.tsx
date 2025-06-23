import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Send, DollarSign, Mail, MessageCircle, CircleCheck as CheckCircle } from 'lucide-react-native';
import { useAuth, mockUsers } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { TransactionProvider, useTransactions } from '@/contexts/TransactionContext';

function SendContent() {
  const { user, updateBalance } = useAuth();
  const { addNotification } = useNotifications();
  const { addTransaction } = useTransactions();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Enter details, 2: Confirm, 3: Success
  const [formData, setFormData] = useState({
    email: '',
    amount: '',
    message: '',
  });
  const [recipient, setRecipient] = useState<any>(null);

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

  const validateForm = () => {
    if (!formData.email) {
      Alert.alert('Error', 'Please enter recipient email');
      return false;
    }

    if (formData.email === user?.email) {
      Alert.alert('Error', 'You cannot send money to yourself');
      return false;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return false;
    }

    const amount = parseFloat(formData.amount);
    if (amount > (user?.balance || 0)) {
      Alert.alert('Error', 'Insufficient balance');
      return false;
    }

    if (amount > 1000) {
      Alert.alert('Error', 'Maximum send amount is $1,000');
      return false;
    }

    // Check if recipient exists
    const foundRecipient = mockUsers.find(u => u.email === formData.email);
    if (!foundRecipient) {
      Alert.alert('Error', 'Recipient not found. Please check the email address.');
      return false;
    }

    setRecipient(foundRecipient);
    return true;
  };

  const handleNext = () => {
    if (validateForm()) {
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      // Simulate transaction processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const amount = parseFloat(formData.amount);
      
      // Update sender balance
      updateBalance(-amount);
      
      // Update recipient balance (in real app, this would be handled by backend)
      const recipientIndex = mockUsers.findIndex(u => u.email === formData.email);
      if (recipientIndex !== -1) {
        mockUsers[recipientIndex].balance += amount;
      }
      
      // Add transaction record for sender
      addTransaction({
        type: 'send',
        amount: amount,
        recipientEmail: formData.email,
        description: formData.message || 'Money transfer',
        status: 'completed'
      });

      // Show success notification
      addNotification(
        `Successfully sent ${formatCurrency(amount)} to ${formData.email}`,
        'success'
      );

      setStep(3);
    } catch (error) {
      Alert.alert('Error', 'Failed to send money. Please try again.');
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

  const quickAmounts = [5, 10, 25, 50];

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authPrompt}>
          <Text style={styles.authTitle}>Login Required</Text>
          <Text style={styles.authDescription}>
            Please log in to send money
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
            onPress={() => {
              if (step === 1) {
                router.back();
              } else {
                setStep(step - 1);
              }
            }}
          >
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {step === 1 ? 'Send Money' : step === 2 ? 'Confirm' : 'Success'}
          </Text>
          <View style={styles.placeholder} />
        </View>

        {step === 1 && (
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Balance Display */}
            <View style={styles.section}>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.balanceAmount}>
                {formatCurrency(user.balance)}
              </Text>
            </View>

            {/* Recipient Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Send To</Text>
              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Mail size={20} color="#6B7280" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Recipient email address"
                  placeholderTextColor="#9CA3AF"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              
              {/* Quick Contacts */}
              <Text style={styles.quickContactsTitle}>Quick Contacts</Text>
              <View style={styles.quickContacts}>
                {mockUsers.filter(u => u.email !== user.email).slice(0, 3).map((contact) => (
                  <TouchableOpacity
                    key={contact.id}
                    style={styles.quickContact}
                    onPress={() => setFormData({ ...formData, email: contact.email })}
                  >
                    <Text style={styles.quickContactName}>{contact.name}</Text>
                    <Text style={styles.quickContactEmail}>{contact.email}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Amount Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Amount</Text>
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

            {/* Message Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Message (Optional)</Text>
              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <MessageCircle size={20} color="#6B7280" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="What's this for?"
                  placeholderTextColor="#9CA3AF"
                  value={formData.message}
                  onChangeText={(text) => setFormData({ ...formData, message: text })}
                  multiline
                />
              </View>
            </View>

            {/* Continue Button */}
            <View style={styles.section}>
              <TouchableOpacity style={styles.continueButton} onPress={handleNext}>
                <Text style={styles.continueButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {step === 2 && (
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Confirmation Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Confirm Transfer</Text>
              
              <View style={styles.confirmationCard}>
                <View style={styles.confirmationRow}>
                  <Text style={styles.confirmationLabel}>To:</Text>
                  <View>
                    <Text style={styles.confirmationValue}>{recipient?.name}</Text>
                    <Text style={styles.confirmationSubvalue}>{formData.email}</Text>
                  </View>
                </View>

                <View style={styles.confirmationRow}>
                  <Text style={styles.confirmationLabel}>Amount:</Text>
                  <Text style={styles.confirmationAmount}>
                    {formatCurrency(parseFloat(formData.amount))}
                  </Text>
                </View>

                {formData.message && (
                  <View style={styles.confirmationRow}>
                    <Text style={styles.confirmationLabel}>Message:</Text>
                    <Text style={styles.confirmationValue}>{formData.message}</Text>
                  </View>
                )}

                <View style={styles.confirmationRow}>
                  <Text style={styles.confirmationLabel}>Your new balance:</Text>
                  <Text style={styles.confirmationValue}>
                    {formatCurrency(user.balance - parseFloat(formData.amount))}
                  </Text>
                </View>
              </View>
            </View>

            {/* Send Button */}
            <View style={styles.section}>
              <TouchableOpacity 
                style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                <Send size={20} color="#FFFFFF" />
                <Text style={styles.sendButtonText}>
                  {isLoading ? 'Sending...' : `Send ${formatCurrency(parseFloat(formData.amount))}`}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {step === 3 && (
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <CheckCircle size={64} color="#22C55E" />
            </View>
            <Text style={styles.successTitle}>Money Sent!</Text>
            <Text style={styles.successMessage}>
              You successfully sent {formatCurrency(parseFloat(formData.amount))} to {recipient?.name}
            </Text>
            
            <TouchableOpacity 
              style={styles.doneButton}
              onPress={() => router.replace('/(tabs)/dashboard')}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default function SendScreen() {
  return (
    <TransactionProvider>
      <SendContent />
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
  balanceLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    minHeight: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    paddingVertical: 16,
  },
  quickContactsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  quickContacts: {
    gap: 8,
  },
  quickContact: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quickContactName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  quickContactEmail: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
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
  continueButton: {
    backgroundColor: '#3B82F6',
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  confirmationCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    gap: 16,
  },
  confirmationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  confirmationLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  confirmationValue: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    textAlign: 'right',
  },
  confirmationSubvalue: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'right',
  },
  confirmationAmount: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#3B82F6',
  },
  sendButton: {
    backgroundColor: '#22C55E',
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  sendButtonDisabled: {
    opacity: 0.7,
  },
  sendButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  doneButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  doneButtonText: {
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