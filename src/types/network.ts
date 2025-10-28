// 扩展网络支持相关类型定义
export interface NetworkConfig {
  id: string;
  name: string;
  displayName: string;
  chainId: number;
  rpcUrls: string[];
  blockExplorerUrls: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  iconUrl?: string;
  isTestnet: boolean;
  isMainnet: boolean;
  isActive: boolean;
  supportedFeatures: NetworkFeature[];
  bridgeSupport: BridgeSupport[];
  stakingSupport: StakingSupport[];
  dexSupport: DexSupport[];
}

export interface NetworkFeature {
  type: 'staking' | 'bridge' | 'dex' | 'lending' | 'governance' | 'nft';
  isSupported: boolean;
  protocols: string[];
  limitations?: string[];
}

export interface BridgeSupport {
  targetChain: string;
  bridgeProtocol: string;
  supportedAssets: string[];
  minAmount: number;
  maxAmount: number;
  estimatedTime: number;
  fees: {
    fixed: number;
    percentage: number;
  };
  isActive: boolean;
}

export interface StakingSupport {
  asset: string;
  protocol: string;
  minStake: number;
  maxStake?: number;
  lockupPeriod: number;
  unbondingPeriod: number;
  currentAPY: number;
  isLiquidStaking: boolean;
  slashingRisk: boolean;
  validatorSelection: 'auto' | 'manual';
}

export interface DexSupport {
  protocol: string;
  supportedPairs: TradingPair[];
  features: DexFeature[];
  liquidityPools: LiquidityPool[];
  fees: {
    trading: number;
    withdrawal: number;
  };
}

export interface TradingPair {
  baseAsset: string;
  quoteAsset: string;
  liquidity: number;
  volume24h: number;
  priceImpact: number;
}

export interface DexFeature {
  type: 'spot' | 'margin' | 'futures' | 'options' | 'lending';
  isSupported: boolean;
  limitations?: string[];
}

export interface LiquidityPool {
  id: string;
  assets: string[];
  totalLiquidity: number;
  apy: number;
  volume24h: number;
  fees: number;
}

export interface NetworkStatus {
  chainId: number;
  blockHeight: number;
  blockTime: number;
  gasPrice: number;
  networkCongestion: 'low' | 'medium' | 'high';
  isHealthy: boolean;
  lastUpdated: number;
  rpcLatency: number;
  syncStatus: 'synced' | 'syncing' | 'behind';
}

export interface CrossChainRoute {
  id: string;
  sourceChain: string;
  targetChain: string;
  asset: string;
  bridgeProtocol: string;
  estimatedTime: number;
  estimatedFee: number;
  steps: RouteStep[];
  reliability: number;
  isRecommended: boolean;
}

export interface RouteStep {
  stepNumber: number;
  action: 'bridge' | 'swap' | 'wrap' | 'unwrap';
  protocol: string;
  sourceAsset: string;
  targetAsset: string;
  estimatedTime: number;
  estimatedFee: number;
  description: string;
}

export interface NetworkIntegrationTest {
  id: string;
  networkId: string;
  testType: 'connection' | 'transaction' | 'bridge' | 'staking' | 'dex';
  status: 'pending' | 'running' | 'passed' | 'failed';
  startTime: number;
  endTime?: number;
  duration?: number;
  results: TestResult[];
  errorMessage?: string;
  retryCount: number;
  maxRetries: number;
}

export interface TestResult {
  testName: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  details?: any;
  errorMessage?: string;
  expectedValue?: any;
  actualValue?: any;
}

export interface NetworkPerformanceMetrics {
  networkId: string;
  timestamp: number;
  blockTime: number;
  transactionThroughput: number;
  gasPrice: {
    slow: number;
    standard: number;
    fast: number;
  };
  networkLatency: number;
  successRate: number;
  congestionLevel: number;
  activeValidators?: number;
  stakingRatio?: number;
}

export interface AssetSupport {
  networkId: string;
  assets: SupportedAsset[];
  lastUpdated: number;
}

export interface SupportedAsset {
  symbol: string;
  name: string;
  contractAddress?: string;
  decimals: number;
  isNative: boolean;
  logoUrl?: string;
  coingeckoId?: string;
  features: AssetFeature[];
  bridgeSupport: string[];
  stakingSupport: boolean;
  dexSupport: boolean;
}

export interface AssetFeature {
  type: 'transfer' | 'stake' | 'bridge' | 'swap' | 'lend' | 'governance';
  isSupported: boolean;
  protocols: string[];
  limitations?: string[];
}

export interface NetworkCompatibility {
  sourceNetwork: string;
  targetNetwork: string;
  compatibilityScore: number;
  supportedOperations: string[];
  limitations: string[];
  recommendedBridges: string[];
  estimatedCosts: {
    bridge: number;
    gas: number;
    total: number;
  };
}

export interface MultiChainPortfolio {
  totalValue: number;
  networks: NetworkPortfolio[];
  crossChainOpportunities: CrossChainOpportunity[];
  rebalanceRecommendations: RebalanceRecommendation[];
  lastUpdated: number;
}

export interface NetworkPortfolio {
  networkId: string;
  networkName: string;
  totalValue: number;
  assets: PortfolioAsset[];
  stakingPositions: StakingPosition[];
  liquidityPositions: LiquidityPosition[];
  pendingTransactions: PendingTransaction[];
}

export interface PortfolioAsset {
  symbol: string;
  balance: number;
  value: number;
  price: number;
  change24h: number;
  allocation: number;
}

export interface StakingPosition {
  asset: string;
  protocol: string;
  stakedAmount: number;
  rewardAmount: number;
  apy: number;
  lockupEnd?: number;
  canUnstake: boolean;
}

export interface LiquidityPosition {
  poolId: string;
  protocol: string;
  assets: string[];
  liquidity: number;
  rewards: number;
  apy: number;
  impermanentLoss: number;
}

export interface PendingTransaction {
  hash: string;
  type: 'transfer' | 'stake' | 'unstake' | 'bridge' | 'swap';
  status: 'pending' | 'confirming' | 'confirmed' | 'failed';
  timestamp: number;
  estimatedCompletion: number;
  gasUsed?: number;
  gasFee?: number;
}

export interface CrossChainOpportunity {
  id: string;
  type: 'arbitrage' | 'yield_farming' | 'staking' | 'liquidity_mining';
  sourceChain: string;
  targetChain: string;
  asset: string;
  currentAPY: number;
  targetAPY: number;
  potentialProfit: number;
  requiredAmount: number;
  estimatedCost: number;
  riskLevel: 'low' | 'medium' | 'high';
  timeframe: number;
  steps: string[];
}

export interface RebalanceRecommendation {
  id: string;
  type: 'cross_chain' | 'within_chain';
  reason: string;
  sourceNetwork: string;
  targetNetwork?: string;
  asset: string;
  currentAllocation: number;
  recommendedAllocation: number;
  amountToMove: number;
  estimatedCost: number;
  expectedBenefit: number;
  priority: 'low' | 'medium' | 'high';
}

export interface NetworkMonitoring {
  networkId: string;
  isMonitoring: boolean;
  alerts: NetworkAlert[];
  thresholds: MonitoringThreshold[];
  lastCheck: number;
  checkInterval: number;
}

export interface NetworkAlert {
  id: string;
  type: 'performance' | 'security' | 'maintenance' | 'congestion';
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: number;
  isResolved: boolean;
  resolvedAt?: number;
  affectedFeatures: string[];
}

export interface MonitoringThreshold {
  metric: 'block_time' | 'gas_price' | 'success_rate' | 'latency';
  warningThreshold: number;
  criticalThreshold: number;
  isEnabled: boolean;
}

export interface NetworkUpgrade {
  networkId: string;
  version: string;
  scheduledDate: number;
  description: string;
  features: string[];
  breakingChanges: string[];
  migrationRequired: boolean;
  estimatedDowntime: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

export interface TestSuite {
  id: string;
  name: string;
  description: string;
  networks: string[];
  tests: IntegrationTest[];
  schedule: TestSchedule;
  lastRun?: number;
  nextRun?: number;
  results: TestSuiteResult[];
}

export interface IntegrationTest {
  id: string;
  name: string;
  description: string;
  category: 'connection' | 'transaction' | 'bridge' | 'staking' | 'dex' | 'governance';
  priority: 'low' | 'medium' | 'high' | 'critical';
  timeout: number;
  retryCount: number;
  prerequisites: string[];
  steps: TestStep[];
  expectedResults: any;
  cleanup?: TestStep[];
}

export interface TestStep {
  stepNumber: number;
  action: string;
  parameters: any;
  expectedResult: any;
  timeout: number;
  retryOnFailure: boolean;
}

export interface TestSchedule {
  type: 'manual' | 'interval' | 'cron';
  interval?: number;
  cronExpression?: string;
  timezone: string;
  isEnabled: boolean;
}

export interface TestSuiteResult {
  suiteId: string;
  runId: string;
  startTime: number;
  endTime: number;
  duration: number;
  status: 'passed' | 'failed' | 'partial';
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  testResults: TestResult[];
  summary: string;
  artifacts: TestArtifact[];
}

export interface TestArtifact {
  type: 'log' | 'screenshot' | 'transaction' | 'report';
  name: string;
  url: string;
  size: number;
  timestamp: number;
}