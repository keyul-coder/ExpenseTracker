import AsyncStorage from '@react-native-async-storage/async-storage';

let transactionIdCounter = 1;

export const transactionStorage = {
  async getTransactions() {
    try {
      const transactions = await AsyncStorage.getItem('transactions');
      return transactions ? JSON.parse(transactions) : [];
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  },

  async getTransaction(id) {
    try {
      const transactions = await this.getTransactions();
      return transactions.find(t => t.id === id);
    } catch (error) {
      console.error('Error getting transaction:', error);
      return null;
    }
  },

  async addTransaction(transaction) {
    try {
      const transactions = await this.getTransactions();
      const newTransaction = {
        ...transaction,
        id: transactionIdCounter++,
        createdAt: new Date().toISOString()
      };
      transactions.push(newTransaction);
      await AsyncStorage.setItem('transactions', JSON.stringify(transactions));
      return newTransaction;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  },

  async deleteTransaction(id) {
    try {
      let transactions = await this.getTransactions();
      transactions = transactions.filter(t => t.id !== id);
      await AsyncStorage.setItem('transactions', JSON.stringify(transactions));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }
};