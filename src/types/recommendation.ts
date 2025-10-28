// 智能推荐和优化系统相关类型定义
export interface RecommendationEngine {
  id: string;
  name: string;
  description: string;
  version: string;
  isActive: boolean;
  confidence: number;
  lastUpdated: number;
  supportedAssets: string[];
  supportedChains: string[];
}

export interface Recommendation {
  id: string;
  type: 'stake' | 'unstake' | 'rebalance' | 'bridge' | 'swap' | 'yield_farm';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  reasoning: string[];
  expectedOutcome: ExpectedOutcome;
  riskLevel: 'low' | 'medium' | 'high';
  confidence: number;
  timeframe: 'immediate' | 'short' | 'medium' | 'long';
  actionRequired: boolean;
  estimatedGasCost: number;
  potentialReward: number;
  metadata: RecommendationMetadata;
  createdAt: number;
  expiresAt: number;
  isExecuted: boolean;
  executedAt?: number;
}

export interface ExpectedOutcome {
  apyIncrease?: number;
  rewardIncrease?: number;
  riskReduction?: number;
  gasOptimization?: number;
  timeToBreakeven?: number;
  projectedReturn?: number;
  diversificationImprovement?: number;
}

export interface RecommendationMetadata {
  sourceAsset?: string;
  targetAsset?: string;
  sourceChain?: string;
  targetChain?: string;
  amount?: number;
  currentAPY?: number;
  targetAPY?: number;
  slippage?: number;
  deadline?: number;
  protocol?: string;
  strategy?: string;
}

export interface OptimizationStrategy {
  id: string;
  name: string;
  description: string;
  category: 'yield' | 'risk' | 'gas' | 'diversification' | 'liquidity';
  objective: string;
  constraints: OptimizationConstraint[];
  parameters: OptimizationParameter[];
  isActive: boolean;
  performance: StrategyPerformance;
}

export interface OptimizationConstraint {
  type: 'min_amount' | 'max_amount' | 'min_apy' | 'max_risk' | 'asset_allocation' | 'chain_limit';
  value: number;
  unit: string;
  description: string;
}

export interface OptimizationParameter {
  name: string;
  value: number;
  min: number;
  max: number;
  step: number;
  description: string;
}

export interface StrategyPerformance {
  totalReturn: number;
  annualizedReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  averageHoldingPeriod: number;
  executionCount: number;
}

export interface PortfolioOptimization {
  id: string;
  currentAllocation: AssetAllocation[];
  recommendedAllocation: AssetAllocation[];
  rebalanceActions: RebalanceAction[];
  expectedImprovement: OptimizationResult;
  riskMetrics: RiskMetrics;
  constraints: AllocationConstraint[];
  optimizationDate: number;
}

export interface AssetAllocation {
  asset: string;
  chain: string;
  currentWeight: number;
  recommendedWeight: number;
  currentValue: number;
  recommendedValue: number;
  difference: number;
  reasoning: string;
}

export interface RebalanceAction {
  id: string;
  type: 'increase' | 'decrease' | 'maintain';
  asset: string;
  chain: string;
  currentAmount: number;
  targetAmount: number;
  difference: number;
  priority: number;
  estimatedCost: number;
  estimatedTime: number;
}

export interface OptimizationResult {
  expectedAPYIncrease: number;
  riskReduction: number;
  diversificationScore: number;
  liquidityImprovement: number;
  gasEfficiencyGain: number;
  overallScore: number;
}

export interface RiskMetrics {
  portfolioVolatility: number;
  valueAtRisk: number;
  conditionalVaR: number;
  correlationRisk: number;
  concentrationRisk: number;
  liquidityRisk: number;
  smartContractRisk: number;
  overallRiskScore: number;
}

export interface AllocationConstraint {
  type: 'min_allocation' | 'max_allocation' | 'asset_limit' | 'chain_limit';
  target: string;
  value: number;
  unit: 'percentage' | 'absolute';
  description: string;
}

export interface YieldOpportunity {
  id: string;
  protocol: string;
  asset: string;
  chain: string;
  strategy: string;
  currentAPY: number;
  projectedAPY: number;
  tvl: number;
  riskScore: number;
  liquidityScore: number;
  trustScore: number;
  minDeposit: number;
  lockupPeriod: number;
  fees: FeeStructure;
  advantages: string[];
  risks: string[];
  requirements: string[];
}

export interface FeeStructure {
  depositFee: number;
  withdrawalFee: number;
  performanceFee: number;
  managementFee: number;
  gasCost: number;
}

export interface MarketInsight {
  id: string;
  type: 'trend' | 'opportunity' | 'risk' | 'news' | 'technical';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  affectedAssets: string[];
  affectedChains: string[];
  timeframe: string;
  confidence: number;
  source: string;
  timestamp: number;
  actionable: boolean;
  relatedRecommendations: string[];
}

export interface SmartAlert {
  id: string;
  type: 'price' | 'apy' | 'risk' | 'opportunity' | 'rebalance';
  condition: AlertCondition;
  isActive: boolean;
  triggeredCount: number;
  lastTriggered?: number;
  actions: AlertAction[];
  metadata: any;
}

export interface AlertCondition {
  metric: string;
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne' | 'change_gt' | 'change_lt';
  threshold: number;
  timeWindow?: number;
  aggregation?: 'avg' | 'sum' | 'min' | 'max';
}

export interface AlertAction {
  type: 'notification' | 'email' | 'webhook' | 'auto_execute';
  config: any;
  isEnabled: boolean;
}

export interface RecommendationFilter {
  types: string[];
  priorities: string[];
  riskLevels: string[];
  timeframes: string[];
  minConfidence: number;
  maxGasCost: number;
  minPotentialReward: number;
  assets: string[];
  chains: string[];
  showExecuted: boolean;
  showExpired: boolean;
}

export interface RecommendationFeedback {
  recommendationId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  executed: boolean;
  helpful: boolean;
  comments?: string;
  actualOutcome?: {
    apyChange: number;
    rewardChange: number;
    gasUsed: number;
    timeToComplete: number;
  };
  timestamp: number;
}

export interface MLModel {
  id: string;
  name: string;
  type: 'classification' | 'regression' | 'clustering' | 'reinforcement';
  purpose: string;
  features: string[];
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  lastTrained: number;
  trainingDataSize: number;
  version: string;
  isActive: boolean;
}

export interface PredictiveAnalysis {
  id: string;
  type: 'price' | 'apy' | 'risk' | 'volume' | 'volatility';
  asset: string;
  chain?: string;
  timeHorizon: number;
  predictions: PredictionPoint[];
  confidence: number;
  model: string;
  factors: InfluenceFactor[];
  lastUpdated: number;
}

export interface PredictionPoint {
  timestamp: number;
  value: number;
  confidence: number;
  upperBound: number;
  lowerBound: number;
}

export interface InfluenceFactor {
  name: string;
  importance: number;
  direction: 'positive' | 'negative';
  description: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  isActive: boolean;
  executionCount: number;
  lastExecuted?: number;
  successRate: number;
}

export interface AutomationTrigger {
  type: 'time' | 'price' | 'apy' | 'portfolio_change' | 'recommendation';
  config: any;
}

export interface AutomationCondition {
  type: 'and' | 'or';
  rules: ConditionRule[];
}

export interface ConditionRule {
  field: string;
  operator: string;
  value: any;
  description: string;
}

export interface AutomationAction {
  type: 'stake' | 'unstake' | 'rebalance' | 'notify' | 'execute_recommendation';
  config: any;
  maxGasCost?: number;
  requireConfirmation: boolean;
}

// 用户偏好设置
export interface RecommendationPreferences {
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  investmentHorizon: 'short' | 'medium' | 'long';
  preferredAssets: string[];
  preferredChains: string[];
  excludedAssets: string[];
  excludedChains: string[];
  maxGasCostPerTransaction: number;
  minAPYThreshold: number;
  autoExecuteRecommendations: boolean;
  notificationSettings: {
    highPriority: boolean;
    mediumPriority: boolean;
    lowPriority: boolean;
    email: boolean;
    push: boolean;
    frequency: 'immediate' | 'daily' | 'weekly';
  };
  optimizationGoals: {
    maximizeYield: number;
    minimizeRisk: number;
    optimizeGas: number;
    improveDiversification: number;
  };
}