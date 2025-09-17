import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Redeem, RedeemState } from '../../types';

const initialState: RedeemState = {
  redeems: [],
  isLoading: false,
};

// Async thunks for redeem operations
export const initiateRedeem = createAsyncThunk(
  'redeem/initiateRedeem',
  async (params: { asset: string; amount: number; type: 'instant' | 'standard' }) => {
    // 模拟赎回操作
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const redeem: Redeem = {
      redeemId: 'redeem_' + Date.now(),
      type: params.type,
      assetId: params.asset,
      amount: params.amount,
      status: 'unlocking',
      expireTime: Date.now() + (params.type === 'instant' ? 0 : 7 * 24 * 60 * 60 * 1000),
      createdTime: Date.now(),
      chainId: 'bifrost'
    };
    
    return redeem;
  }
);

export const claimRedeem = createAsyncThunk(
  'redeem/claimRedeem',
  async (redeemId: string) => {
    // 模拟领取操作
    await new Promise(resolve => setTimeout(resolve, 2000));
    return redeemId;
  }
);

const redeemSlice = createSlice({
  name: 'redeem',
  initialState,
  reducers: {
    addRedeemRecord: (state, action: PayloadAction<Redeem>) => {
      state.redeems.unshift(action.payload);
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
        // Silently handle storage load errors
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(initiateRedeem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initiateRedeem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.redeems.unshift(action.payload);
        localStorage.setItem('currentRedeems', JSON.stringify(state.redeems));
      })
      .addCase(initiateRedeem.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(claimRedeem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(claimRedeem.fulfilled, (state, action) => {
        state.isLoading = false;
        const redeem = state.redeems.find(r => r.redeemId === action.payload);
        if (redeem) {
          redeem.status = 'completed';
          localStorage.setItem('currentRedeems', JSON.stringify(state.redeems));
        }
      })
      .addCase(claimRedeem.rejected, (state) => {
        state.isLoading = false;
      });
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
} = redeemSlice.actions;

export default redeemSlice.reducer;