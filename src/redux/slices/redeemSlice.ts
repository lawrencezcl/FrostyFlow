import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Redeem, RedeemState } from '@/types';

const initialState: RedeemState = {
  redeems: [],
  isLoading: false,
};

const redeemSlice = createSlice({
  name: 'redeem',
  initialState,
  reducers: {
    addRedeemRecord: (state, action: PayloadAction<Redeem>) => {
      state.redeems.unshift(action.payload);
      
      // Save to localStorage
      localStorage.setItem('currentRedeems', JSON.stringify(state.redeems));
    },
    
    updateRedeemStatus: (state, action: PayloadAction<{ redeemId: string; status: Redeem['status'] }>) => {
      const { redeemId, status } = action.payload;
      const redeem = state.redeems.find(r => r.redeemId === redeemId);
      
      if (redeem) {
        redeem.status = status;
        localStorage.setItem('currentRedeems', JSON.stringify(state.redeems));
      }
    },
    
    setRedeemLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    loadRedeemsFromStorage: (state) => {
      try {
        const savedRedeems = localStorage.getItem('currentRedeems');
        if (savedRedeems) {
          state.redeems = JSON.parse(savedRedeems);
        }
      } catch (error) {
        console.error('Failed to load redeems from storage:', error);
        state.redeems = [];
      }
    },
    
    removeRedeem: (state, action: PayloadAction<string>) => {
      const redeemId = action.payload;
      state.redeems = state.redeems.filter(r => r.redeemId !== redeemId);
      localStorage.setItem('currentRedeems', JSON.stringify(state.redeems));
    },
    
    clearRedeems: (state) => {
      state.redeems = [];
      localStorage.removeItem('currentRedeems');
    },
    
    updateRedeemExpiry: (state, action: PayloadAction<{ redeemId: string; expireTime: number }>) => {
      const { redeemId, expireTime } = action.payload;
      const redeem = state.redeems.find(r => r.redeemId === redeemId);
      
      if (redeem) {
        redeem.expireTime = expireTime;
        localStorage.setItem('currentRedeems', JSON.stringify(state.redeems));
      }
    },
    
    // Helper to get redeems by status
    getRedeemsByStatus: (state, action: PayloadAction<Redeem['status']>) => {
      const status = action.payload;
      return state.redeems.filter(r => r.status === status);
    },
    
    // Helper to get redeems by chain
    getRedeemsByChain: (state, action: PayloadAction<string>) => {
      const chainId = action.payload;
      return state.redeems.filter(r => r.chainId === chainId);
    },
  },
});

export const {
  addRedeemRecord,
  updateRedeemStatus,
  setRedeemLoading,
  loadRedeemsFromStorage,
  removeRedeem,
  clearRedeems,
  updateRedeemExpiry,
  getRedeemsByStatus,
  getRedeemsByChain,
} = redeemSlice.actions;

export default redeemSlice.reducer;