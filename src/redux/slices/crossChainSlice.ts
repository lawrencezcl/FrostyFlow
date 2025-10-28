import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BridgeTransaction, BridgeRoute, SupportedChain } from '../../types/bridge';

interface CrossChainState {
  supportedChains: SupportedChain[];
  availableRoutes: BridgeRoute[];
  activeTransactions: BridgeTransaction[];
  selectedSourceChain: string | null;
  selectedTargetChain: string | null;
  selectedAsset: string | null;
  bridgeAmount: string;
  isLoading: boolean;
  error: string | null;
  lastQuoteUpdate: number;
}

const initialState: CrossChainState = {
  supportedChains: [],
  availableRoutes: [],
  activeTransactions: [],
  selectedSourceChain: null,
  selectedTargetChain: null,
  selectedAsset: null,
  bridgeAmount: '',
  isLoading: false,
  error: null,
  lastQuoteUpdate: 0,
};

const crossChainSlice = createSlice({
  name: 'crossChain',
  initialState,
  reducers: {
    // 设置支持的链
    setSupportedChains: (state, action: PayloadAction<SupportedChain[]>) => {
      state.supportedChains = action.payload;
    },

    // 设置可用路由
    setAvailableRoutes: (state, action: PayloadAction<BridgeRoute[]>) => {
      state.availableRoutes = action.payload;
    },

    // 设置源链
    setSourceChain: (state, action: PayloadAction<string>) => {
      state.selectedSourceChain = action.payload;
      // 清除目标链如果与源链相同
      if (state.selectedTargetChain === action.payload) {
        state.selectedTargetChain = null;
      }
    },

    // 设置目标链
    setTargetChain: (state, action: PayloadAction<string>) => {
      state.selectedTargetChain = action.payload;
    },

    // 设置选中的资产
    setSelectedAsset: (state, action: PayloadAction<string>) => {
      state.selectedAsset = action.payload;
    },

    // 设置桥接金额
    setBridgeAmount: (state, action: PayloadAction<string>) => {
      state.bridgeAmount = action.payload;
    },

    // 添加新的桥接交易
    addBridgeTransaction: (state, action: PayloadAction<BridgeTransaction>) => {
      state.activeTransactions.push(action.payload);
    },

    // 更新桥接交易状态
    updateBridgeTransaction: (state, action: PayloadAction<BridgeTransaction>) => {
      const index = state.activeTransactions.findIndex(tx => tx.id === action.payload.id);
      if (index !== -1) {
        state.activeTransactions[index] = action.payload;
      }
    },

    // 移除已完成的交易
    removeCompletedTransaction: (state, action: PayloadAction<string>) => {
      state.activeTransactions = state.activeTransactions.filter(tx => tx.id !== action.payload);
    },

    // 设置加载状态
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // 设置错误信息
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // 更新报价时间
    updateQuoteTime: (state) => {
      state.lastQuoteUpdate = Date.now();
    },

    // 清除所有状态
    clearCrossChainState: (state) => {
      state.selectedSourceChain = null;
      state.selectedTargetChain = null;
      state.selectedAsset = null;
      state.bridgeAmount = '';
      state.error = null;
    },

    // 交换源链和目标链
    swapChains: (state) => {
      const temp = state.selectedSourceChain;
      state.selectedSourceChain = state.selectedTargetChain;
      state.selectedTargetChain = temp;
    },
  },
});

export const {
  setSupportedChains,
  setAvailableRoutes,
  setSourceChain,
  setTargetChain,
  setSelectedAsset,
  setBridgeAmount,
  addBridgeTransaction,
  updateBridgeTransaction,
  removeCompletedTransaction,
  setLoading,
  setError,
  updateQuoteTime,
  clearCrossChainState,
  swapChains,
} = crossChainSlice.actions;

export default crossChainSlice.reducer;