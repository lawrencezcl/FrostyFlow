import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MultiChainAsset, PortfolioSummary, ChainInfo, AssetFilter, MonitoringAlert } from '../../types/monitoring';

interface MonitoringState {
  assets: MultiChainAsset[];
  portfolioSummary: PortfolioSummary | null;
  supportedChains: ChainInfo[];
  selectedChains: string[];
  assetFilter: AssetFilter;
  alerts: MonitoringAlert[];
  isLoading: boolean;
  isRealtimeEnabled: boolean;
  lastUpdateTime: number;
  error: string | null;
}

const initialState: MonitoringState = {
  assets: [],
  portfolioSummary: null,
  supportedChains: [],
  selectedChains: [],
  assetFilter: {
    chains: [],
    assets: [],
    minValue: 0,
    maxValue: 1000000,
    showStakedOnly: false,
    showZeroBalance: false,
    sortBy: 'value',
    sortOrder: 'desc'
  },
  alerts: [],
  isLoading: false,
  isRealtimeEnabled: false,
  lastUpdateTime: 0,
  error: null,
};

const monitoringSlice = createSlice({
  name: 'monitoring',
  initialState,
  reducers: {
    // 设置资产数据
    setAssets: (state, action: PayloadAction<MultiChainAsset[]>) => {
      state.assets = action.payload;
      state.lastUpdateTime = Date.now();
    },

    // 更新单个资产
    updateAsset: (state, action: PayloadAction<MultiChainAsset>) => {
      const index = state.assets.findIndex(asset => asset.symbol === action.payload.symbol);
      if (index !== -1) {
        state.assets[index] = action.payload;
      } else {
        state.assets.push(action.payload);
      }
      state.lastUpdateTime = Date.now();
    },

    // 设置投资组合摘要
    setPortfolioSummary: (state, action: PayloadAction<PortfolioSummary>) => {
      state.portfolioSummary = action.payload;
    },

    // 设置支持的链
    setSupportedChains: (state, action: PayloadAction<ChainInfo[]>) => {
      state.supportedChains = action.payload;
    },

    // 更新链状态
    updateChainStatus: (state, action: PayloadAction<{ chainId: string; status: 'online' | 'offline' | 'maintenance' }>) => {
      const chain = state.supportedChains.find(c => c.id === action.payload.chainId);
      if (chain) {
        chain.status = action.payload.status;
      }
    },

    // 设置选中的链
    setSelectedChains: (state, action: PayloadAction<string[]>) => {
      state.selectedChains = action.payload;
      state.assetFilter.chains = action.payload;
    },

    // 切换链选择
    toggleChainSelection: (state, action: PayloadAction<string>) => {
      const chainId = action.payload;
      const index = state.selectedChains.indexOf(chainId);
      
      if (index > -1) {
        state.selectedChains.splice(index, 1);
      } else {
        state.selectedChains.push(chainId);
      }
      
      state.assetFilter.chains = state.selectedChains;
    },

    // 更新资产过滤器
    updateAssetFilter: (state, action: PayloadAction<Partial<AssetFilter>>) => {
      state.assetFilter = { ...state.assetFilter, ...action.payload };
    },

    // 重置过滤器
    resetAssetFilter: (state) => {
      state.assetFilter = {
        chains: [],
        assets: [],
        minValue: 0,
        maxValue: 1000000,
        showStakedOnly: false,
        showZeroBalance: false,
        sortBy: 'value',
        sortOrder: 'desc'
      };
      state.selectedChains = [];
    },

    // 添加警报
    addAlert: (state, action: PayloadAction<MonitoringAlert>) => {
      state.alerts.unshift(action.payload);
      // 限制警报数量
      if (state.alerts.length > 50) {
        state.alerts = state.alerts.slice(0, 50);
      }
    },

    // 标记警报为已读
    markAlertAsRead: (state, action: PayloadAction<string>) => {
      const alert = state.alerts.find(a => a.id === action.payload);
      if (alert) {
        alert.isRead = true;
      }
    },

    // 清除所有警报
    clearAllAlerts: (state) => {
      state.alerts = [];
    },

    // 移除警报
    removeAlert: (state, action: PayloadAction<string>) => {
      state.alerts = state.alerts.filter(alert => alert.id !== action.payload);
    },

    // 设置加载状态
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // 设置实时监控状态
    setRealtimeEnabled: (state, action: PayloadAction<boolean>) => {
      state.isRealtimeEnabled = action.payload;
    },

    // 设置错误信息
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // 更新最后更新时间
    updateLastUpdateTime: (state) => {
      state.lastUpdateTime = Date.now();
    },

    // 清除所有数据
    clearMonitoringData: (state) => {
      state.assets = [];
      state.portfolioSummary = null;
      state.alerts = [];
      state.error = null;
      state.lastUpdateTime = 0;
    },

    // 批量更新资产价格
    updateAssetPrices: (state, action: PayloadAction<{ [symbol: string]: { price: number; change24h: number } }>) => {
      const priceUpdates = action.payload;
      
      state.assets.forEach(asset => {
        const priceData = priceUpdates[asset.symbol];
        if (priceData) {
          asset.price = priceData.price;
          asset.priceChange24h = priceData.change24h;
          
          // 重新计算总价值
          asset.totalValue = asset.totalBalance * priceData.price;
          
          // 更新分布价值
          asset.distributions.forEach(dist => {
            dist.value = dist.balance * priceData.price;
          });
        }
      });
      
      state.lastUpdateTime = Date.now();
    },

    // 设置资产排序
    setSorting: (state, action: PayloadAction<{ sortBy: 'value' | 'balance' | 'change' | 'apy'; sortOrder: 'asc' | 'desc' }>) => {
      state.assetFilter.sortBy = action.payload.sortBy;
      state.assetFilter.sortOrder = action.payload.sortOrder;
    },
  },
});

export const {
  setAssets,
  updateAsset,
  setPortfolioSummary,
  setSupportedChains,
  updateChainStatus,
  setSelectedChains,
  toggleChainSelection,
  updateAssetFilter,
  resetAssetFilter,
  addAlert,
  markAlertAsRead,
  clearAllAlerts,
  removeAlert,
  setLoading,
  setRealtimeEnabled,
  setError,
  updateLastUpdateTime,
  clearMonitoringData,
  updateAssetPrices,
  setSorting,
} = monitoringSlice.actions;

export default monitoringSlice.reducer;