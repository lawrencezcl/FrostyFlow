import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Transaction, TransactionState } from '@/types';

const initialState: TransactionState = {
  transactions: [],
  isLoading: false,
};

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    addTransactionRecord: (state, action: PayloadAction<Transaction>) => {
      state.transactions.unshift(action.payload);
      
      // Keep only last 100 transactions
      if (state.transactions.length > 100) {
        state.transactions = state.transactions.slice(0, 100);
      }
      
      // Save to localStorage
      localStorage.setItem('recentTransactions', JSON.stringify(state.transactions));
    },
    
    updateTransactionStatus: (state, action: PayloadAction<{ txHash: string; status: Transaction['status'] }>) => {
      const { txHash, status } = action.payload;
      const transaction = state.transactions.find(tx => tx.txHash === txHash);
      
      if (transaction) {
        transaction.status = status;
        localStorage.setItem('recentTransactions', JSON.stringify(state.transactions));
      }
    },
    
    setTransactionLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    loadTransactionsFromStorage: (state) => {
      try {
        const savedTransactions = localStorage.getItem('recentTransactions');
        if (savedTransactions) {
          state.transactions = JSON.parse(savedTransactions);
        }
      } catch (error) {
        // Silently handle storage load errors
        state.transactions = [];
      }
    },
    
    clearTransactions: (state) => {
      state.transactions = [];
      localStorage.removeItem('recentTransactions');
    },
    
    removeTransaction: (state, action: PayloadAction<string>) => {
      const txHash = action.payload;
      state.transactions = state.transactions.filter(tx => tx.txHash !== txHash);
      localStorage.setItem('recentTransactions', JSON.stringify(state.transactions));
    },
  },
});

export const {
  addTransactionRecord,
  updateTransactionStatus,
  setTransactionLoading,
  loadTransactionsFromStorage,
  clearTransactions,
  removeTransaction,
} = transactionSlice.actions;

export default transactionSlice.reducer;