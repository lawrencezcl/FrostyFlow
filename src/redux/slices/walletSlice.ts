import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WalletState, WalletAccount, WalletType } from '@/types';

const initialState: WalletState = {
  isConnected: false,
  account: null,
  walletType: null,
  isLoading: false,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setWalletConnected: (state, action: PayloadAction<{ account: WalletAccount; walletType: WalletType }>) => {
      const { account, walletType } = action.payload;
      state.isConnected = true;
      state.account = account;
      state.walletType = walletType;
      state.isLoading = false;
      
      // Save to sessionStorage for persistence during session
      sessionStorage.setItem('walletConnection', JSON.stringify({
        account,
        walletType,
        isConnected: true,
      }));
    },
    
    setWalletDisconnected: (state) => {
      state.isConnected = false;
      state.account = null;
      state.walletType = null;
      state.isLoading = false;
      
      // Clear session storage
      sessionStorage.removeItem('walletConnection');
    },
    
    setWalletLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    updateAccount: (state, action: PayloadAction<WalletAccount>) => {
      state.account = action.payload;
      
      // Update sessionStorage
      if (state.isConnected && state.walletType) {
        sessionStorage.setItem('walletConnection', JSON.stringify({
          account: action.payload,
          walletType: state.walletType,
          isConnected: true,
        }));
      }
    },
    
    initializeWalletFromSession: (state) => {
      try {
        const savedConnection = sessionStorage.getItem('walletConnection');
        if (savedConnection) {
          const { account, walletType, isConnected } = JSON.parse(savedConnection);
          if (isConnected && account && walletType) {
            state.isConnected = true;
            state.account = account;
            state.walletType = walletType;
          }
        }
      } catch (error) {
        console.error('Failed to initialize wallet from session:', error);
        // Clear invalid session data
        sessionStorage.removeItem('walletConnection');
      }
    },
    
    clearWalletError: (state) => {
      // Reserved for future error handling
      state.isLoading = false;
    },
  },
});

export const {
  setWalletConnected,
  setWalletDisconnected,
  setWalletLoading,
  updateAccount,
  initializeWalletFromSession,
  clearWalletError,
} = walletSlice.actions;

export default walletSlice.reducer;