// 实时状态追踪相关类型定义
export interface TransactionStatus {
  id: string;
  type: 'stake' | 'redeem' | 'bridge' | 'slpx' | 'swap';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  currentStep: number;
  totalSteps: number;
  estimatedTime: number;
  remainingTime: number;
  steps: StatusStep[];
  metadata: TransactionMetadata;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
}

export interface StatusStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'failed' | 'skipped';
  startTime?: number;
  endTime?: number;
  duration?: number;
  txHash?: string;
  blockNumber?: number;
  confirmations?: number;
  requiredConfirmations?: number;
  errorMessage?: string;
  retryCount?: number;
  maxRetries?: number;
}

export interface TransactionMetadata {
  sourceChain?: string;
  targetChain?: string;
  asset?: string;
  amount?: number;
  recipient?: string;
  walletAddress?: string;
  bridgeProtocol?: string;
  stakingProtocol?: string;
  slippage?: number;
  deadline?: number;
  gasPrice?: number;
  gasLimit?: number;
  nonce?: number;
}

export interface ProgressVisualization {
  type: 'linear' | 'circular' | 'timeline' | 'stepper';
  showPercentage: boolean;
  showTimeRemaining: boolean;
  showStepDetails: boolean;
  animationEnabled: boolean;
  colorScheme: 'default' | 'success' | 'warning' | 'error';
}

export interface StatusNotification {
  id: string;
  transactionId: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: number;
  isRead: boolean;
  autoClose: boolean;
  duration?: number;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  action: () => void;
}

export interface StatusFilter {
  types: string[];
  statuses: string[];
  chains: string[];
  dateRange: {
    start: number;
    end: number;
  };
  amountRange: {
    min: number;
    max: number;
  };
  sortBy: 'createdAt' | 'updatedAt' | 'amount' | 'progress';
  sortOrder: 'asc' | 'desc';
}

export interface StatusStatistics {
  totalTransactions: number;
  pendingTransactions: number;
  completedTransactions: number;
  failedTransactions: number;
  averageCompletionTime: number;
  successRate: number;
  typeDistribution: {
    [type: string]: number;
  };
  chainDistribution: {
    [chain: string]: number;
  };
  dailyStats: {
    date: string;
    count: number;
    successCount: number;
    failureCount: number;
  }[];
}

export interface RealtimeUpdate {
  transactionId: string;
  updateType: 'status' | 'step' | 'progress' | 'metadata';
  data: any;
  timestamp: number;
}

export interface StatusWebSocketMessage {
  type: 'transaction_update' | 'step_update' | 'batch_update' | 'system_status';
  data: RealtimeUpdate | RealtimeUpdate[];
  timestamp: number;
}

export interface TransactionTimeline {
  transactionId: string;
  events: TimelineEvent[];
  totalDuration: number;
  estimatedDuration: number;
  efficiency: number; // 实际时间 vs 预估时间的比率
}

export interface TimelineEvent {
  id: string;
  type: 'start' | 'step_start' | 'step_complete' | 'step_fail' | 'retry' | 'complete' | 'fail';
  stepId?: string;
  timestamp: number;
  duration?: number;
  description: string;
  metadata?: any;
}

export interface StatusAlert {
  id: string;
  type: 'stuck_transaction' | 'high_failure_rate' | 'network_issue' | 'gas_price_spike';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  affectedTransactions: string[];
  suggestedActions: string[];
  timestamp: number;
  isResolved: boolean;
  resolvedAt?: number;
}

export interface PerformanceMetrics {
  averageStepDuration: {
    [stepType: string]: number;
  };
  stepSuccessRates: {
    [stepType: string]: number;
  };
  chainPerformance: {
    [chain: string]: {
      averageTime: number;
      successRate: number;
      gasEfficiency: number;
    };
  };
  protocolPerformance: {
    [protocol: string]: {
      averageTime: number;
      successRate: number;
      reliability: number;
    };
  };
  timeOfDayPerformance: {
    hour: number;
    averageTime: number;
    successRate: number;
    transactionCount: number;
  }[];
}

// 状态追踪配置
export interface StatusTrackingConfig {
  enableRealtimeUpdates: boolean;
  updateInterval: number;
  enableNotifications: boolean;
  notificationSettings: {
    onStart: boolean;
    onComplete: boolean;
    onFailure: boolean;
    onStuck: boolean;
    soundEnabled: boolean;
    desktopNotifications: boolean;
  };
  retentionPeriod: number; // 保留历史记录的天数
  maxConcurrentTracking: number;
  enablePerformanceMetrics: boolean;
  enablePredictiveAnalysis: boolean;
}

// 批量操作状态
export interface BatchOperationStatus {
  id: string;
  name: string;
  totalOperations: number;
  completedOperations: number;
  failedOperations: number;
  pendingOperations: number;
  overallProgress: number;
  estimatedTimeRemaining: number;
  operations: TransactionStatus[];
  startTime: number;
  endTime?: number;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
}