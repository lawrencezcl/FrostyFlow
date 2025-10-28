import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SLPxStakingRequest, SLPxRoute, UserStakingPosition } from '../../types/slpx';

interface SLPxState {
  supportedRoutes: SLPxRoute[];
  activeRequests: SLPxStakingRequest[];
  userPositions: UserStakingPosition[];
  selectedSourceChain: string | null;
  selectedAsset: string | null;
  stakingAmount: string;
  slippage: number;
  isLoading: boolean;
  error: string | null;
  lastQuoteUpdate: number;
}

const initialState: SLPxState = {
  supportedRoutes: [],
  activeRequests: [],
  userPositions: [],
  selectedSourceChain: null,
  selectedAsset: null,
  stakingAmount: '',
  slippage: 0.5, // 0.5% 默认滑点
  isLoading: false,
  error: null,
  lastQuoteUpdate: 0,
};

const slpxSlice = createSlice({
  name: 'slpx',
  initialState,
  reducers: {
    // 设置支持的路由
    setSupportedRoutes: (state, action: PayloadAction<SLPxRoute[]>) => {
      state.supportedRoutes = action.payload;
    },

    // 设置源链
    setSourceChain: (state, action: PayloadAction<string>) => {
      state.selectedSourceChain = action.payload;
    },

    // 设置选中的资产
    setSelectedAsset: (state, action: PayloadAction<string>) => {
      state.selectedAsset = action.payload;
    },

    // 设置质押金额
    setStakingAmount: (state, action: PayloadAction<string>) => {
      state.stakingAmount = action.payload;
    },

    // 设置滑点
    setSlippage: (state, action: PayloadAction<number>) => {
      state.slippage = action.payload;
    },

    // 添加新的质押请求
    addStakingRequest: (state, action: PayloadAction<SLPxStakingRequest>) => {
      state.activeRequests.push(action.payload);
    },

    // 更新质押请求状态
    updateStakingRequest: (state, action: PayloadAction<SLPxStakingRequest>) => {
      const index = state.activeRequests.findIndex(req => req.id === action.payload.id);
      if (index !== -1) {
        state.activeRequests[index] = action.payload;
      }
    },

    // 移除已完成的请求
    removeCompletedRequest: (state, action: PayloadAction<string>) => {
      state.activeRequests = state.activeRequests.filter(req => req.id !== action.payload);
    },

    // 设置用户质押位置
    setUserPositions: (state, action: PayloadAction<UserStakingPosition[]>) => {
      state.userPositions = action.payload;
    },

    // 更新单个用户位置
    updateUserPosition: (state, action: PayloadAction<UserStakingPosition>) => {
      const index = state.userPositions.findIndex(pos => pos.asset === action.payload.asset);
      if (index !== -1) {
        state.userPositions[index] = action.payload;
      } else {
        state.userPositions.push(action.payload);
      }
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
    clearSLPxState: (state) => {
      state.selectedSourceChain = null;
      state.selectedAsset = null;
      state.stakingAmount = '';
      state.error = null;
    },

    // 清除已完成的请求（避免内存泄漏）
    cleanupCompletedRequests: (state) => {
      const oneHour = 60 * 60 * 1000;
      const now = Date.now();
      
      state.activeRequests = state.activeRequests.filter(req => {
        if (req.status === 'completed' || req.status === 'failed') {
          return now - req.updatedAt < oneHour;
        }
        return true;
      });
    },
  },
});

export const {
  setSupportedRoutes,
  setSourceChain,
  setSelectedAsset,
  setStakingAmount,
  setSlippage,
  addStakingRequest,
  updateStakingRequest,
  removeCompletedRequest,
  setUserPositions,
  updateUserPosition,
  setLoading,
  setError,
  updateQuoteTime,
  clearSLPxState,
  cleanupCompletedRequests,
} = slpxSlice.actions;

export default slpxSlice.reducer;