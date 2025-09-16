import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Asset, AssetState } from '@/types';

const initialState: AssetState = {
  assets: {},
  totalUsdValue: 0,
  totalProfit: 0,
  isLoading: false,
};

interface UpdateAssetBalancePayload {
  chainId: string;
  assetId: string;
  balance: number;
  usdValue: number;
}

interface SetChainAssetsPayload {
  chainId: string;
  assets: Record<string, Asset>;
}

const assetSlice = createSlice({
  name: 'asset',
  initialState,
  reducers: {
    updateAssetBalance: (state, action: PayloadAction<UpdateAssetBalancePayload>) => {
      const { chainId, assetId, balance, usdValue } = action.payload;
      
      if (!state.assets[chainId]) {
        state.assets[chainId] = {};
      }
      
      if (state.assets[chainId][assetId]) {
        state.assets[chainId][assetId].balance = balance;
        state.assets[chainId][assetId].usdValue = usdValue;
      }
      
      // Recalculate total USD value
      assetSlice.caseReducers.calculateTotals(state);
    },
    
    setChainAssets: (state, action: PayloadAction<SetChainAssetsPayload>) => {
      const { chainId, assets } = action.payload;
      state.assets[chainId] = assets;
      
      // Recalculate totals
      assetSlice.caseReducers.calculateTotals(state);
    },
    
    setAssetLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    calculateTotals: (state) => {
      let totalValue = 0;
      let totalProfit = 0;
      
      Object.values(state.assets).forEach((chainAssets) => {
        Object.values(chainAssets).forEach((asset) => {
          totalValue += asset.usdValue;
          // Simplified profit calculation: (current_balance - initial_staked_amount) * rate
          // For now, we'll calculate based on the difference from the base asset value
          const baseValue = asset.balance / asset.rate * asset.usdValue / asset.balance;
          const profit = asset.usdValue - baseValue;
          totalProfit += Math.max(0, profit);
        });
      });
      
      state.totalUsdValue = totalValue;
      state.totalProfit = totalProfit;
    },
    
    updateAssetApy: (state, action: PayloadAction<{ chainId: string; assetId: string; apy: number }>) => {
      const { chainId, assetId, apy } = action.payload;
      
      if (state.assets[chainId]?.[assetId]) {
        state.assets[chainId][assetId].apy = apy;
      }
    },
    
    updateAssetRate: (state, action: PayloadAction<{ chainId: string; assetId: string; rate: number }>) => {
      const { chainId, assetId, rate } = action.payload;
      
      if (state.assets[chainId]?.[assetId]) {
        state.assets[chainId][assetId].rate = rate;
      }
    },
    
    clearAssets: (state) => {
      state.assets = {};
      state.totalUsdValue = 0;
      state.totalProfit = 0;
    },
  },
});

export const {
  updateAssetBalance,
  setChainAssets,
  setAssetLoading,
  calculateTotals,
  updateAssetApy,
  updateAssetRate,
  clearAssets,
} = assetSlice.actions;

export default assetSlice.reducer;