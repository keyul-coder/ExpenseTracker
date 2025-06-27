import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Pressable
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { transactionStorage } from '../services/storage';

export default function AddTransactionScreen({ navigation }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    description: '',
    location: '',
    type: '',
    category: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pickerType, setPickerType] = useState(null); // 'type' or 'category'
  const [showPicker, setShowPicker] = useState(false);

  const transactionTypes = [
    { label: 'Credit', value: 'credit' },
    { label: 'Debit', value: 'debit' },
    { label: 'Refund', value: 'refund' },
  ];

  const categories = [
    { label: 'Shopping', value: 'shopping' },
    { label: 'Travel', value: 'travel' },
    { label: 'Utility', value: 'utility' },
    { label: 'Food & Dining', value: 'food' },
    { label: 'Entertainment', value: 'entertainment' },
    { label: 'Healthcare', value: 'healthcare' },
    { label: 'Education', value: 'education' },
    { label: 'Transportation', value: 'transport' },
    { label: 'Income', value: 'income' },
    { label: 'Other', value: 'other' },
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const openPicker = (type) => {
    setPickerType(type);
    setShowPicker(true);
  };

  const handlePickerSelect = (value) => {
    if (pickerType === 'type') {
      handleInputChange('type', value);
    } else {
      handleInputChange('category', value);
    }
    setShowPicker(false);
  };

  const validateForm = () => {
    if (!formData.date.trim()) {
      Alert.alert('Error', 'Date is required');
      return false;
    }
    if (!formData.amount.trim() || isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Error', 'Description is required');
      return false;
    }
    if (!formData.location.trim()) {
      Alert.alert('Error', 'Location is required');
      return false;
    }
    if (!formData.type) {
      Alert.alert('Error', 'Please select a transaction type');
      return false;
    }
    if (!formData.category) {
      Alert.alert('Error', 'Please select a category');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await transactionStorage.addTransaction(formData);
      Alert.alert('Success', 'Transaction added successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSelectedLabel = (value, options) => {
    const selected = options.find(opt => opt.value === value);
    return selected ? selected.label : 'Select an option';
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Date Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Date</Text>
            <TextInput
              style={styles.input}
              value={formData.date}
              onChangeText={(value) => handleInputChange('date', value)}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Amount Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Amount</Text>
            <View style={styles.amountContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountInput}
                value={formData.amount}
                onChangeText={(value) => handleInputChange('amount', value)}
                placeholder="0.00"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Description Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.input}
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              placeholder="Enter transaction description"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Location Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              value={formData.location}
              onChangeText={(value) => handleInputChange('location', value)}
              placeholder="Enter location"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Transaction Type */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Transaction Type</Text>
            <TouchableOpacity
              style={styles.pickerInput}
              onPress={() => openPicker('type')}
            >
              <Text style={formData.type ? styles.pickerTextSelected : styles.pickerTextPlaceholder}>
                {getSelectedLabel(formData.type, transactionTypes)}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Category */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Category</Text>
            <TouchableOpacity
              style={styles.pickerInput}
              onPress={() => openPicker('category')}
            >
              <Text style={formData.category ? styles.pickerTextSelected : styles.pickerTextPlaceholder}>
                {getSelectedLabel(formData.category, categories)}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Submit Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Add Transaction</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      {/* Picker Modal */}
      <Modal
        visible={showPicker}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.pickerModal}>
            <Picker
              selectedValue={pickerType === 'type' ? formData.type : formData.category}
              onValueChange={handlePickerSelect}
              style={styles.modalPicker}
            >
              {pickerType === 'type' ? (
                transactionTypes.map((type, index) => (
                  <Picker.Item 
                    key={index} 
                    label={type.label} 
                    value={type.value}
                  />
                ))
              ) : (
                categories.map((category, index) => (
                  <Picker.Item 
                    key={index} 
                    label={category.label} 
                    value={category.value}
                  />
                ))
              )}
            </Picker>
            <Pressable
              style={styles.modalCloseButton}
              onPress={() => setShowPicker(false)}
            >
              <Text style={styles.modalCloseButtonText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
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
  form: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  pickerInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    height: 50,
    backgroundColor: '#FFFFFF',
  },
  pickerTextSelected: {
    fontSize: 16,
    color: '#111827',
  },
  pickerTextPlaceholder: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  currencySymbol: {
    paddingLeft: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  amountInput: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  pickerModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 20,
  },
  modalPicker: {
    width: '100%',
  },
  modalCloseButton: {
    padding: 16,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    marginHorizontal: 16,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});