import { 
  Recommendation, 
  YieldOpportunity, 
  PortfolioOptimization,
  MarketInsight,
  RecommendationPreferences,
  OptimizationStrategy 
} from '../types/recommendation';
import multiChainMonitoringService from './multiChainMonitoringService';
import advancedAnalyticsService from './advancedAnalyticsService';
import coinGeckoService from './coinGecko';

/**
 * 智能推荐服务
 */
class SmartRecommendationService {
  private recommendations: Map<string, Recommendation> = new Map();
  private yieldOpportunities: YieldOpportunity[] = [];
  private marketInsights: MarketInsight[] = [];
  private userPreferences: Map<string, RecommendationPreferences> = new Map();
  private eventListeners: Map<string, Function[]> = new Map();

  /**
   * 获取用户推荐
   */
  async getUserRecommendations(
    walletAddress: string,
    limit: number = 10
  ): Promise<Recommendation[]> {
    try {
      const [userAssets, preferences] = await Promise.all([
        multiChainMonitoringService.getUserAssets(walletAddress),
        this.getUserPreferences(walletAddress)
      ]);

      const recommendations: Recommendation[] = [];

      // 生成收益优化推荐
      const yieldRecommendations = await this.generateYieldRecommendations(userAssets, preferences);
      recommendations.push(...yieldRecommendations);

      // 生成风险管理推荐
      const riskRecommendations = await this.generateRiskRecommendations(userAssets, preferences);
      recommendations.push(...riskRecommendations);

      // 生成再平衡推荐
      const rebalanceRecommendations = await this.generateRebalanceRecommendations(userAssets, preferences);
      recommendations.push(...rebalanceRecommendations);

      // 按优先级和置信度排序
      return recommendations
        .sort((a, b) => {
          const priorityWeight = this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority);
          if (priorityWeight !== 0) return priorityWeight;
          return b.confidence - a.confidence;
        })
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to get user recommendations:', error);
      return [];
    }
  }

  /**
   * 生成收益优化推荐
   */
  private async generateYieldRecommendations(userAssets: any[], preferences: RecommendationPreferences): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    for (const asset of userAssets) {
      // 检查是否有更高收益的机会
      const opportunities = await this.findBetterYieldOpportunities(asset, preferences);
      
      for (const opportunity of opportunities) {
        if (opportunity.projectedAPY > asset.apy + 1) { // 至少高1%才推荐
          recommendations.push({
            id: `yield_${asset.symbol}_${opportunity.protocol}`,
            type: 'stake',
            priority: 'medium',
            title: `提升${asset.symbol}收益率`,
            description: `将${asset.symbol}迁移到${opportunity.protocol}可获得更高收益`,
            reasoning: [
              `当前APY: ${asset.apy.toFixed(2)}%`,
              `目标APY: ${opportunity.projectedAPY.toFixed(2)}%`,
              `预期收益提升: ${(opportunity.projectedAPY - asset.apy).toFixed(2)}%`
            ],
            expectedOutcome: {
              apyIncrease: opportunity.projectedAPY - asset.apy,
              projectedReturn: asset.totalValue * (opportunity.projectedAPY - asset.apy) / 100
            },
            riskLevel: this.assessRiskLevel(opportunity.riskScore),
            confidence: 0.8,
            timeframe: 'medium',
            actionRequired: true,
            estimatedGasCost: opportunity.fees.gasCost,
            potentialReward: asset.totalValue * (opportunity.projectedAPY - asset.apy) / 100,
            metadata: {
              sourceAsset: asset.symbol,
              targetAsset: asset.symbol,
              protocol: opportunity.protocol,
              currentAPY: asset.apy,
              targetAPY: opportunity.projectedAPY
            },
            createdAt: Date.now(),
            expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24小时后过期
            isExecuted: false
          });
        }
      }
    }

    return recommendations;
  }

  /**
   * 生成风险管理推荐
   */
  private async generateRiskRecommendations(userAssets: any[], preferences: RecommendationPreferences): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    // 检查资产集中度风险
    const totalValue = userAssets.reduce((sum, asset) => sum + asset.totalValue, 0);
    
    for (const asset of userAssets) {
      const concentration = (asset.totalValue / totalValue) * 100;
      
      if (concentration > 50) { // 单一资产超过50%
        recommendations.push({
          id: `diversify_${asset.symbol}`,
          type: 'rebalance',
          priority: 'high',
          title: `降低${asset.symbol}集中度风险`,
          description: `${asset.symbol}占投资组合${concentration.toFixed(1)}%，建议分散投资`,
          reasoning: [
            `当前集中度: ${concentration.toFixed(1)}%`,
            '建议单一资产不超过40%',
            '分散投资可降低风险'
          ],
          expectedOutcome: {
            riskReduction: 20,
            diversificationImprovement: 15
          },
          riskLevel: 'low',
          confidence: 0.9,
          timeframe: 'medium',
          actionRequired: true,
          estimatedGasCost: 50,
          potentialReward: 0,
          metadata: {
            sourceAsset: asset.symbol,
            amount: concentration,
            strategy: `Reduce concentration from ${concentration}% to 40%`
          },
          createdAt: Date.now(),
          expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
          isExecuted: false
        });
      }
    }

    return recommendations;
  }

  /**
   * 生成再平衡推荐
   */
  private async generateRebalanceRecommendations(userAssets: any[], preferences: RecommendationPreferences): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    // 简化的再平衡逻辑
    const totalValue = userAssets.reduce((sum, asset) => sum + asset.totalValue, 0);
    const targetAllocation = 100 / userAssets.length; // 等权重分配

    for (const asset of userAssets) {
      const currentAllocation = (asset.totalValue / totalValue) * 100;
      const deviation = Math.abs(currentAllocation - targetAllocation);

      if (deviation > 10) { // 偏差超过10%
        const action = currentAllocation > targetAllocation ? 'decrease' : 'increase';
        
        recommendations.push({
          id: `rebalance_${asset.symbol}`,
          type: 'rebalance',
          priority: 'medium',
          title: `再平衡${asset.symbol}配置`,
          description: `${asset.symbol}配置偏离目标，建议${action === 'increase' ? '增加' : '减少'}配置`,
          reasoning: [
            `当前配置: ${currentAllocation.toFixed(1)}%`,
            `目标配置: ${targetAllocation.toFixed(1)}%`,
            `偏差: ${deviation.toFixed(1)}%`
          ],
          expectedOutcome: {
            diversificationImprovement: 10,
            riskReduction: 5
          },
          riskLevel: 'low',
          confidence: 0.7,
          timeframe: 'medium',
          actionRequired: true,
          estimatedGasCost: 30,
          potentialReward: 0,
          metadata: {
            sourceAsset: asset.symbol,
            strategy: `${action} allocation from ${currentAllocation}% to ${targetAllocation}%`
          },
          createdAt: Date.now(),
          expiresAt: Date.now() + 3 * 24 * 60 * 60 * 1000,
          isExecuted: false
        });
      }
    }

    return recommendations;
  }

  /**
   * 查找更好的收益机会
   */
  private async findBetterYieldOpportunities(asset: any, preferences: RecommendationPreferences): Promise<YieldOpportunity[]> {
    // 模拟收益机会数据
    const opportunities: YieldOpportunity[] = [
      {
        id: `${asset.symbol}_bifrost_liquid_staking`,
        protocol: 'Bifrost Liquid Staking',
        asset: asset.symbol,
        chain: 'Bifrost',
        strategy: 'Liquid Staking',
        currentAPY: asset.apy,
        projectedAPY: asset.apy + 2.5,
        tvl: 50000000,
        riskScore: 3,
        liquidityScore: 9,
        trustScore: 8,
        minDeposit: 0.1,
        lockupPeriod: 0,
        fees: {
          depositFee: 0,
          withdrawalFee: 0.1,
          performanceFee: 5,
          managementFee: 0,
          gasCost: 25
        },
        advantages: ['无锁定期', '高流动性', '自动复投'],
        risks: ['智能合约风险', '流动性风险'],
        requirements: ['最小质押量0.1 ' + asset.symbol]
      }
    ];

    return opportunities.filter(opp => 
      preferences.preferredChains.length === 0 || preferences.preferredChains.includes(opp.chain)
    );
  }

  /**
   * 获取用户偏好
   */
  private async getUserPreferences(walletAddress: string): Promise<RecommendationPreferences> {
    const cached = this.userPreferences.get(walletAddress);
    if (cached) return cached;

    // 默认偏好设置
    const defaultPreferences: RecommendationPreferences = {
      riskTolerance: 'moderate',
      investmentHorizon: 'medium',
      preferredAssets: [],
      preferredChains: [],
      excludedAssets: [],
      excludedChains: [],
      maxGasCostPerTransaction: 100,
      minAPYThreshold: 5,
      autoExecuteRecommendations: false,
      notificationSettings: {
        highPriority: true,
        mediumPriority: true,
        lowPriority: false,
        email: true,
        push: true,
        frequency: 'daily'
      },
      optimizationGoals: {
        maximizeYield: 40,
        minimizeRisk: 30,
        optimizeGas: 15,
        improveDiversification: 15
      }
    };

    this.userPreferences.set(walletAddress, defaultPreferences);
    return defaultPreferences;
  }

  /**
   * 获取优先级权重
   */
  private getPriorityWeight(priority: string): number {
    switch (priority) {
      case 'urgent': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  }

  /**
   * 评估风险等级
   */
  private assessRiskLevel(riskScore: number): 'low' | 'medium' | 'high' {
    if (riskScore <= 3) return 'low';
    if (riskScore <= 6) return 'medium';
    return 'high';
  }

  /**
   * 获取市场洞察
   */
  async getMarketInsights(): Promise<MarketInsight[]> {
    // 模拟市场洞察数据
    return [
      {
        id: 'dot_staking_surge',
        type: 'opportunity',
        severity: 'medium',
        title: 'DOT质押需求激增',
        description: 'DOT质押APY上升至13.5%，建议增加DOT质押配置',
        impact: 'positive',
        affectedAssets: ['DOT'],
        affectedChains: ['Polkadot', 'Bifrost'],
        timeframe: '1-2周',
        confidence: 0.85,
        source: 'Market Analysis',
        timestamp: Date.now(),
        actionable: true,
        relatedRecommendations: []
      }
    ];
  }

  /**
   * 执行推荐
   */
  async executeRecommendation(recommendationId: string, walletAddress: string): Promise<boolean> {
    const recommendation = this.recommendations.get(recommendationId);
    if (!recommendation) return false;

    try {
      // 根据推荐类型执行相应操作
      switch (recommendation.type) {
        case 'stake':
          // 执行质押操作
          break;
        case 'rebalance':
          // 执行再平衡操作
          break;
        // 其他操作类型...
      }

      recommendation.isExecuted = true;
      recommendation.executedAt = Date.now();
      
      this.emitEvent('recommendation_executed', recommendation);
      return true;
    } catch (error) {
      console.error('Failed to execute recommendation:', error);
      return false;
    }
  }

  /**
   * 添加事件监听器
   */
  addEventListener(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  /**
   * 触发事件
   */
  private emitEvent(event: string, data: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Recommendation event listener error:', error);
        }
      });
    }
  }
}

export default new SmartRecommendationService();