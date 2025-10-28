// 多链资产监控相关类型定义
export interface MultiChainAsset {
  symbol: string;
  name: string;
  totalBalance: number;
  totalValue: number; // USD value
  distributions: ChainDistribution[];
  apy: number;
  priceChange24h: number;
  price: number;
  marketCap?: number;
  volume24h?: number;
}

export interface ChainDistribution {
  chainId: string;
  chainName: string;
  chainIcon: string;
  balance: number;
  value: number; // USD value
  percentage: number;
  isStaked: boolean;
  stakingRewards?: number;
  vTokenBalance?: number;
}

export interface AssetPerformance {
  asset: string;
  period: '24h' | '7d' | '30d' | '1y';
  priceChange: number;
  priceChangePercent: number;
  volumeChange: number;
  stakingRewards: number;
  totalReturn: number;
}

export interface PortfolioSummary {
  totalValue: number;
  totalStaked: number;
  totalRewards: number;
  totalAssets: number;
  totalChains: number;
  performanceData: {
    period: string;
    value: number;
    change: number;
    changePercent: number;
  }[];
}

export interface ChainInfo {
  id: string;
  name: string;
  displayName: string;
  icon: string;
  nativeAsset: string;
  rpcUrl: string;
  explorerUrl: string;
  isTestnet: boolean;
  totalValue: number;
  assetCount: number;
  stakingSupported: boolean;
  bridgeSupported: boolean;
  status: 'online' | 'offline' | 'maintenance';
  blockHeight?: number;
  blockTime?: number;
}

export interface AssetAllocation {
  asset: string;
  percentage: number;
  value: number;
  targetPercentage?: number;
  rebalanceRecommendation?: 'increase' | 'decrease' | 'hold';
}

export interface StakingReward {
  asset: string;
  chain: string;
  amount: number;
  value: number;
  timestamp: number;
  txHash: string;
  type: 'staking' | 'delegation' | 'liquidity';
}

export interface RealtimePrice {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  marketCap: number;
  lastUpdated: number;
}

export interface MonitoringAlert {
  id: string;
  type: 'price' | 'balance' | 'reward' | 'network';
  severity: 'info' | 'warning' | 'error';
  title: string;
  message: string;
  asset?: string;
  chain?: string;
  timestamp: number;
  isRead: boolean;
  actionRequired: boolean;
}

export interface AssetFilter {
  chains: string[];
  assets: string[];
  minValue: number;
  maxValue: number;
  showStakedOnly: boolean;
  showZeroBalance: boolean;
  sortBy: 'value' | 'balance' | 'change' | 'apy';
  sortOrder: 'asc' | 'desc';
}

export interface ChartDataPoint {
  timestamp: number;
  value: number;
  label?: string;
}

export interface AssetChart {
  asset: string;
  period: '1h' | '24h' | '7d' | '30d' | '1y';
  data: ChartDataPoint[];
  type: 'price' | 'balance' | 'rewards' | 'apy';
}

// WebSocket 消息类型
export interface MonitoringWebSocketMessage {
  type: 'price_update' | 'balance_update' | 'reward_update' | 'alert' | 'chain_status';
  data: any;
  timestamp: number;
}

// 监控配置
export interface MonitoringConfig {
  refreshInterval: number; // 毫秒
  priceAlerts: {
    enabled: boolean;
    thresholds: {
      [asset: string]: {
        upper: number;
        lower: number;
      };
    };
  };
  balanceAlerts: {
    enabled: boolean;
    minBalance: {
      [asset: string]: number;
    };
  };
  rewardNotifications: {
    enabled: boolean;
    minAmount: number;
  };
  autoRefresh: boolean;
  enableNotifications: boolean;
}

// 统计数据
export interface MonitoringStats {
  totalUsers: number;
  totalValueLocked: number;
  totalRewardsDistributed: number;
  activeChains: number;
  supportedAssets: number;
  averageAPY: number;
  topPerformingAssets: {
    asset: string;
    performance: number;
  }[];
  chainDistribution: {
    chain: string;
    percentage: number;
    value: number;
  }[];
}