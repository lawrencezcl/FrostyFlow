import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Asset, AssetState } from '../../types';
import { testnetApiService } from '../../services/testnetApiService';
import { coinGeckoService } from '../../services/coinGecko';
import { bifrostService } from '../../services/bifrostService';
import { bifrostSdkRealService } from '../../services/bifrostSdkReal';

const initialState: AssetState = {
  assets: [],
  totalValue: 0,
  totalEarnings: 0,
  totalUsdValue: 0,
  totalProfit: 0,
  isLoading: false,
};

// Async thunk for fetching initial asset data
export const fetchInitialData = createAsyncThunk(
  'asset/fetchInitialData',
  async (_, { getState }) => {
    const { wallet, chain } = getState() as { wallet: any; chain: any };
    if (wallet.address) {
      const assets = await bifrostService.getBalances(wallet.address, chain.chain.id);
      return assets;
    }
    return [];
  }
);

// Async thunk for staking/minting
export const stakeMint = createAsyncThunk(
  'asset/stakeMint',
  async (params: { asset: string; amount: number; gasMode: string; chainId?: string; address?: string }) => {
    const { asset, amount, address } = params;
    const result = await bifrostService.stake(address!, asset, amount);
    return {
      asset,
      amount,
      liquidTokens: amount * 0.98, // This should be updated with the actual amount from the event
      txHash: result.data,
      success: result.success,
      message: result.message
    };
  }
);

// Async thunk for fetching real-time asset prices
export const fetchAssetPrices = createAsyncThunk(
  'asset/fetchAssetPrices',
  async (assetSymbols: string[], { getState }) => {
    try {
      // Convert asset symbols to CoinGecko IDs
      const coinGeckoIds = assetSymbols.map(symbol => 
        coinGeckoService.getAssetCoinGeckoId(symbol)
      );
      
      const result = await coinGeckoService.getMultipleAssetUsdPrices(coinGeckoIds);
      
      if (result.success && result.data) {
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to fetch prices');
      }
    } catch (error: any) {
      console.error('Failed to fetch asset prices:', error);
      throw error;
    }
  }
);

// Async thunk for updating asset prices in the store
export const updateAssetPrices = createAsyncThunk(
  'asset/updateAssetPrices',
  async (_, { getState, dispatch }) => {
    const state = getState() as { asset: AssetState };
    const { assets } = state.asset;
    
    if (assets.length === 0) {
      return { updatedAssets: [] };
    }
    
    // Get unique asset symbols
    const assetSymbols = [...new Set(assets.map(asset => asset.assetId))];
    
    try {
      // Fetch prices for all assets
      const priceData = await dispatch(fetchAssetPrices(assetSymbols)).unwrap();
      
      // Update assets with new prices
      const updatedAssets = assets.map(asset => {
        const coinGeckoId = coinGeckoService.getAssetCoinGeckoId(asset.assetId);
        const priceInfo = priceData[coinGeckoId];
        
        if (priceInfo) {
          const balanceNum = parseFloat(asset.balance) || 0;
          const newUsdValue = balanceNum * priceInfo.price;
          
          return {
            ...asset,
            price: priceInfo.price,
            usdValue: newUsdValue,
            change24h: priceInfo.change24h,
          };
        }
        
        return asset;
      });
      
      return { updatedAssets };
    } catch (error) {
      console.error('Failed to update asset prices:', error);
      throw error;
    }
  }
);

// Async thunk for redemption
export const initiateRedeem = createAsyncThunk(
  'asset/initiateRedeem',
  async (params: { asset: string; amount: number; chainId?: string; address?: string }) => {
    const { asset, amount, address } = params;
    const result = await bifrostService.redeem(address!, asset, amount);
    return {
      asset,
      amount,
      estimatedReceiveAmount: amount * 0.95, // This should be updated with the actual amount from the event
      txHash: result.data,
      success: result.success,
      message: result.message,
      unlockTime: Date.now() + 28 * 24 * 60 * 60 * 1000 // This should be updated with the actual unlock time from the event
    };
  }
);

interface UpdateAssetBalancePayload {
  assetId: string;
  balance: string;
  usdValue: number;
}

interface AddAssetPayload {
  asset: Asset;
}

const assetSlice = createSlice({
  name: 'asset',
  initialState,
  reducers: {
    addAsset: (state, action: PayloadAction<AddAssetPayload>) => {
      const { asset } = action.payload;
      const existingIndex = state.assets.findIndex(a => a.id === asset.id);
      
      if (existingIndex >= 0) {
        state.assets[existingIndex] = asset;
      } else {
        state.assets.push(asset);
      }
      
      // Recalculate totals
      assetSlice.caseReducers.calculateTotals(state);
    },
    
    updateAssetBalance: (state, action: PayloadAction<UpdateAssetBalancePayload>) => {
      const { assetId, balance, usdValue } = action.payload;
      
      const asset = state.assets.find(a => a.id === assetId);
      if (asset) {
        asset.balance = balance;
        asset.usdValue = usdValue;
      }
      
      // Recalculate total values
      assetSlice.caseReducers.calculateTotals(state);
    },
    
    setChainAssets: (state, action: PayloadAction<Asset[]>) => {
      state.assets = action.payload;
      
      // Recalculate totals
      assetSlice.caseReducers.calculateTotals(state);
    },
    
    setAssetLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    calculateTotals: (state) => {
      let totalValue = 0;
      let totalProfit = 0;
      
      state.assets.forEach((asset) => {
        totalValue += asset.usdValue;
        // 简化利润计算
        const balanceNum = parseFloat(asset.balance) || 0;
        const profit = balanceNum * 0.05; // 模拟5%利润
        totalProfit += profit;
      });
      
      state.totalUsdValue = totalValue;
      state.totalProfit = totalProfit;
      state.totalValue = totalValue;
      state.totalEarnings = totalProfit;
    },
    
    updateAssetApy: (state, action: PayloadAction<{ assetId: string; apy: number }>) => {
      const { assetId, apy } = action.payload;
      
      const asset = state.assets.find(a => a.id === assetId);
      if (asset) {
        asset.apy = apy;
      }
    },
    
    updateAssetRate: (state, action: PayloadAction<{ assetId: string; rate: number }>) => {
      const { assetId, rate } = action.payload;
      
      const asset = state.assets.find(a => a.id === assetId);
      if (asset) {
        asset.rate = rate;
      }
    },
    
    clearAssets: (state) => {
      state.assets = [];
      state.totalUsdValue = 0;
      state.totalProfit = 0;
      state.totalValue = 0;
      state.totalEarnings = 0;
    },

    // Action for setting asset prices and 24h changes
    updateAssetPricesAndChanges: (state, action: PayloadAction<Array<{ assetId: string; price: number; change24h: number }>>) => {
      action.payload.forEach(update => {
        const asset = state.assets.find(a => a.assetId === update.assetId);
        if (asset) {
          asset.price = update.price;
          asset.change24h = update.change24h;
          // Recalculate USD value
          const balanceNum = parseFloat(asset.balance) || 0;
          asset.usdValue = balanceNum * update.price;
        }
      });
      
      // Recalculate totals
      assetSlice.caseReducers.calculateTotals(state);
    },
    
    initializeMockAssets: (state) => {
      // 模拟初始资产数据
      const mockAssets: Asset[] = [
        {
          id: 'dot_1',
          assetId: 'DOT',
          baseAssetId: 'DOT',
          symbol: 'DOT',
          name: 'Polkadot',
          balance: '10.0',
          price: 6.5,
          usdValue: 65,
          chain: 'Polkadot',
          apy: 12.5,
          rate: 1,
          minMintAmount: 1
        },
        {
          id: 'vdot_1',
          assetId: 'vDOT',
          baseAssetId: 'DOT',
          symbol: 'vDOT',
          name: 'Liquid DOT',
          balance: '5.2',
          price: 6.3,
          usdValue: 32.76,
          chain: 'Bifrost',
          apy: 12.5,
          rate: 1.02,
          minMintAmount: 0.1
        },
        {
          id: 'ksm_1',
          assetId: 'KSM',
          baseAssetId: 'KSM',
          symbol: 'KSM',
          name: 'Kusama',
          balance: '2.5',
          price: 25.8,
          usdValue: 64.5,
          chain: 'Kusama',
          apy: 15.2,
          rate: 1,
          minMintAmount: 0.1
        }
      ];
      
      state.assets = mockAssets;
      assetSlice.caseReducers.calculateTotals(state);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInitialData.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchInitialData.fulfilled, (state, action: PayloadAction<Asset[]>) => {
        state.assets = action.payload;
        assetSlice.caseReducers.calculateTotals(state);
        state.isLoading = false;
      })
      .addCase(fetchInitialData.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(fetchAssetPrices.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAssetPrices.fulfilled, (state, action) => {
        state.isLoading = false;
        // Price data fetched successfully
      })
      .addCase(fetchAssetPrices.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(updateAssetPrices.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateAssetPrices.fulfilled, (state, action) => {
        state.isLoading = false;
        
        if (action.payload.updatedAssets.length > 0) {
          state.assets = action.payload.updatedAssets;
          assetSlice.caseReducers.calculateTotals(state);
        }
      })
      .addCase(updateAssetPrices.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(stakeMint.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(stakeMint.fulfilled, (state, action) => {
        state.isLoading = false;
        
        if (action.payload.success) {
          // Add new liquid asset
          const newAsset: Asset = {
            id: `v${action.payload.asset}_${Date.now()}`,
            assetId: `v${action.payload.asset}`,
            baseAssetId: action.payload.asset,
            symbol: `v${action.payload.asset}`,
            name: `Liquid ${action.payload.asset}`,
            balance: action.payload.liquidTokens.toString(),
            price: 1,
            usdValue: action.payload.liquidTokens,
            chain: 'Bifrost',
            apy: 12.5,
            rate: 1.02,
            minMintAmount: 0.1
          };
          state.assets.push(newAsset);
        }
        
        assetSlice.caseReducers.calculateTotals(state);
      })
      .addCase(stakeMint.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(initiateRedeem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initiateRedeem.fulfilled, (state, action) => {
        state.isLoading = false;
        // Redemption logic could be implemented here
        assetSlice.caseReducers.calculateTotals(state);
      })
      .addCase(initiateRedeem.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const {
  addAsset,
  updateAssetBalance,
  setChainAssets,
  setAssetLoading,
  calculateTotals,
  updateAssetApy,
  updateAssetRate,
  clearAssets,
  updateAssetPricesAndChanges,
  initializeMockAssets,
} = assetSlice.actions;

export default assetSlice.reducer;