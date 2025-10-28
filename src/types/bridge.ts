// 跨链桥接服务类型定义
export interface BridgeTransaction {
  id: string;
  txHash: string;
  sourceChain: string;
  targetChain: string;
  asset: string;
  amount: number;
  recipient: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  estimatedTime: number;
  steps: BridgeStep[];
  createdAt: number;
  updatedAt: number;
}

export interface BridgeStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  timestamp?: number;
  txHash?: string;
  blockNumber?: number;
  confirmations?: number;
  requiredConfirmations?: number;
}

export interface BridgeRoute {
  id: string;
  sourceChain: string;
  targetChain: string;
  protocol: 'snowbridge' | 'hyperbridge' | 'xcmp';
  estimatedTime: number;
  fee: {
    amount: number;
    asset: string;
  };
  minAmount: number;
  maxAmount: number;
  isActive: boolean;
}

export interface BridgeQuote {
  route: BridgeRoute;
  inputAmount: number;
  outputAmount: number;
  fee: number;
  priceImpact: number;
  estimatedTime: number;
  steps: string[];
}

export interface SupportedChain {
  id: string;
  name: string;
  displayName: string;
  nativeAsset: string;
  rpcUrl: string;
  explorerUrl: string;
  isTestnet: boolean;
  bridgeProtocols: string[];
  supportedAssets: string[];
}

export interface CrossChainAsset {
  symbol: string;
  name: string;
  decimals: number;
  chains: {
    [chainId: string]: {
      address: string;
      isNative: boolean;
      bridgeable: boolean;
    };
  };
}

// 跨链桥接事件类型
export type BridgeEventType = 
  | 'bridge_initiated'
  | 'bridge_confirmed'
  | 'bridge_processing'
  | 'bridge_completed'
  | 'bridge_failed'
  | 'bridge_step_updated';

export interface BridgeEvent {
  type: BridgeEventType;
  transactionId: string;
  data: any;
  timestamp: number;
}

// 错误类型
export class BridgeError extends Error {
  constructor(
    message: string,
    public code: string,
    public transactionId?: string,
    public step?: string
  ) {
    super(message);
    this.name = 'BridgeError';
  }
}

// 跨链桥接配置
export interface BridgeConfig {
  networks: SupportedChain[];
  routes: BridgeRoute[];
  assets: CrossChainAsset[];
  defaultSlippage: number;
  maxSlippage: number;
  retryAttempts: number;
  retryDelay: number;
  confirmationBlocks: {
    [chainId: string]: number;
  };
}

// WebSocket 消息类型
export interface BridgeWebSocketMessage {
  type: 'status_update' | 'step_update' | 'error' | 'completed';
  transactionId: string;
  data: any;
}

// 统计信息
export interface BridgeStats {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  totalVolume: number;
  averageTime: number;
  popularRoutes: {
    route: string;
    count: number;
    volume: number;
  }[];
}