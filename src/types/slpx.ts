// SLPx 相关类型定义
export interface SLPxStakingRequest {
  id: string;
  sourceChain: string;
  targetChain: string; // 通常是 Bifrost
  asset: string;
  amount: number;
  walletAddress: string;
  recipient?: string;
  slippage: number;
  deadline: number;
  status: 'pending' | 'bridging' | 'staking' | 'completed' | 'failed';
  progress: number;
  estimatedTime: number;
  steps: SLPxStep[];
  createdAt: number;
  updatedAt: number;
  bridgeTransaction?: string;
  stakingTransaction?: string;
  vTokenReceived?: number;
}

export interface SLPxStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  timestamp?: number;
  txHash?: string;
  estimatedTime: number;
}

export interface SLPxRoute {
  id: string;
  sourceChain: string;
  targetChain: string;
  asset: string;
  vTokenAsset: string;
  bridgeProtocol: string;
  stakingProtocol: string;
  totalFee: number;
  estimatedTime: number;
  minAmount: number;
  maxAmount: number;
  isActive: boolean;
  apy: number;
}

export interface SLPxQuote {
  route: SLPxRoute;
  inputAmount: number;
  bridgeFee: number;
  stakingFee: number;
  totalFee: number;
  expectedVTokens: number;
  exchangeRate: number;
  priceImpact: number;
  estimatedTime: number;
  steps: string[];
  slippage: number;
}

export interface SLPxConfig {
  supportedChains: string[];
  supportedAssets: {
    [asset: string]: {
      chains: string[];
      vTokenSymbol: string;
      minStakeAmount: number;
      maxStakeAmount: number;
    };
  };
  defaultSlippage: number;
  maxSlippage: number;
  deadlineMinutes: number;
  retryAttempts: number;
}

export interface StakingPool {
  asset: string;
  vTokenAsset: string;
  totalStaked: number;
  totalVTokens: number;
  exchangeRate: number;
  apy: number;
  commission: number;
  isActive: boolean;
  minStakeAmount: number;
  maxStakeAmount: number;
  unstakingPeriod: number; // in blocks
}

export interface UserStakingPosition {
  asset: string;
  vTokenAsset: string;
  stakedAmount: number;
  vTokenBalance: number;
  currentValue: number;
  unrealizedGains: number;
  stakingDate: number;
  lastRewardClaim: number;
  pendingRewards: number;
}

// SLPx 错误类型
export class SLPxError extends Error {
  constructor(
    message: string,
    public code: string,
    public requestId?: string,
    public step?: string
  ) {
    super(message);
    this.name = 'SLPxError';
  }
}

// SLPx 事件类型
export type SLPxEventType = 
  | 'slpx_initiated'
  | 'bridge_started'
  | 'bridge_completed'
  | 'staking_started'
  | 'staking_completed'
  | 'slpx_completed'
  | 'slpx_failed'
  | 'step_updated';

export interface SLPxEvent {
  type: SLPxEventType;
  requestId: string;
  data: any;
  timestamp: number;
}

// 智能路由选项
export interface RouteOptimization {
  prioritize: 'speed' | 'cost' | 'yield';
  maxSlippage: number;
  maxBridgeTime: number;
  preferredBridges: string[];
  avoidBridges: string[];
}

// 批量操作
export interface BatchSLPxRequest {
  operations: SLPxStakingRequest[];
  totalAmount: number;
  estimatedTotalTime: number;
  estimatedTotalFee: number;
  optimization: RouteOptimization;
}

// 统计信息
export interface SLPxStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalVolumeStaked: number;
  averageCompletionTime: number;
  popularAssets: {
    asset: string;
    count: number;
    volume: number;
  }[];
  popularRoutes: {
    sourceChain: string;
    asset: string;
    count: number;
    volume: number;
  }[];
}