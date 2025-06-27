import React, { useState, useEffect } from 'react';
import {View,Text,TouchableOpacity,StyleSheet,Alert,ActivityIndicator,ScrollView,} from 'react-native';
import { transactionStorage } from '../services/storage';

export default function TransactionDetailScreen({ route, navigation }) {
  const { transactionId } = route.params;
  const [transaction, setTransaction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadTransaction();
  }, []);

  const loadTransaction = async () => {
    try {
      const data = await transactionStorage.getTransaction(transactionId);
      if (data) {
        setTransaction(data);
      } else {
        Alert.alert('Error', 'Transaction not found', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load transaction details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ]
    );
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await transactionStorage.deleteTransaction(transactionId);
      Alert.alert('Success', 'Transaction deleted successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete transaction');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatAmount = (amount, type) => {
    const num = parseFloat(amount);
    return `$${Math.abs(num).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryIcon = (category) => {
    const icons = {
      shopping: '🛒',
      travel: '✈️',
      utility: '🏠',
      food: '🍽️',
      entertainment: '🎬',
      healthcare: '🏥',
      education: '📚',
      transport: '🚗',
      income: '💰',
      other: '📋',
    };
    return icons[category] || '📋';
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Transaction not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Transaction Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.description}>{transaction.description}</Text>
          <Text style={styles.location}>{transaction.location}</Text>
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.amount}>
            {formatAmount(transaction.amount, transaction.type)}
          </Text>
          <Text style={styles.transactionTypeText}>
            {transaction.type} Transaction
          </Text>
        </View>
      </View>

      {/* Transaction Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Transaction Date</Text>
            <Text style={styles.detailValue}>
              {formatDate(transaction.date)}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Category</Text>
            <View style={styles.categoryContainer}>
              <View style={styles.categoryIconContainer}>
                <Text style={styles.categoryIcon}>
                  {getCategoryIcon(transaction.category)}
                </Text>
              </View>
              <Text style={styles.categoryText}>
                {transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Transaction ID</Text>
          <Text style={styles.transactionId}>
            TXN-{new Date().getFullYear()}-{String(transaction.id).padStart(3, '0')}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.editButton}
            disabled={true}
          >
            <Text style={styles.editButtonText}>Edit Transaction</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.deleteButton, isDeleting && styles.deleteButtonDisabled]}
            onPress={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.deleteButtonText}>Delete Transaction</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#3B82F6',
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  description: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  location: {
    fontSize: 16,
    color: '#DBEAFE',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  transactionTypeText: {
    fontSize: 14,
    color: '#DBEAFE',
    textTransform: 'capitalize',
  },
  detailsContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIconContainer: {
    width: 32,
    height: 32,
    backgroundColor: '#DBEAFE',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 24,
  },
  transactionId: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#6B7280',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    opacity: 0.5,
  },
  editButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  deleteButtonDisabled: {
    opacity: 0.7,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});