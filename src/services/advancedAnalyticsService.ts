import { 
  AnalyticsData, 
  AnalyticsMetrics, 
  ChartData, 
  DataInsight, 
  TimeRange,
  AnalyticsQuery,
  DashboardLayout,
  AnalyticsPreferences 
} from '../types/analytics';
import coinGeckoService from './coinGecko';
import multiChainMonitoringService from './multiChainMonitoringService';
import realtimeStatusTrackingService from './realtimeStatusTrackingService';

/**
 * Advanced Analytics Service
 */
class AdvancedAnalyticsService {
  private cache: Map<string, any> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5-minute cache
  private eventListeners: Map<string, Function[]> = new Map();

  /**
   * Get analytics data
   */
  async getAnalyticsData(
    timeRange: TimeRange,
    walletAddress?: string
  ): Promise<AnalyticsData> {
    const cacheKey = `analytics_${timeRange.period}_${walletAddress || 'global'}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const [metrics, charts, insights] = await Promise.all([
        this.getMetrics(timeRange, walletAddress),
        this.getChartData(timeRange, walletAddress),
        this.generateInsights(timeRange, walletAddress)
      ]);

      const data: AnalyticsData = {
        timeRange,
        metrics,
        charts,
        insights,
        comparisons: await this.getComparisons(timeRange, walletAddress),
        predictions: await this.getPredictions(timeRange, walletAddress)
      };

      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Failed to get analytics data:', error);
      throw error;
    }
  }

  /**
   * Get key metrics
   */
  private async getMetrics(timeRange: TimeRange, walletAddress?: string): Promise<AnalyticsMetrics> {
    // Mock data - in a real implementation, this would be fetched from various data sources
    const baseMetrics = {
      totalValueLocked: this.createMetricValue(125000000, 118000000, 'currency'),
      totalRewards: this.createMetricValue(2500000, 2200000, 'currency'),
      averageAPY: this.createMetricValue(12.5, 11.8, 'percentage'),
      transactionVolume: this.createMetricValue(45000000, 38000000, 'currency'),
      activeUsers: this.createMetricValue(15420, 14200, 'number'),
      successRate: this.createMetricValue(98.5, 97.2, 'percentage'),
      averageTransactionTime: this.createMetricValue(180000, 220000, 'duration'),
      gasEfficiency: this.createMetricValue(85.2, 82.1, 'percentage')
    };

    if (walletAddress) {
      // Get user-specific metrics
      const userAssets = await multiChainMonitoringService.getUserAssets(walletAddress);
      const userStats = realtimeStatusTrackingService.getStatistics();
      
      // Adjust metrics for user data
      const currentUserTVL = userAssets.reduce((sum: number, asset: any) => sum + asset.totalValue, 0);
      baseMetrics.totalValueLocked = this.createMetricValue(
        currentUserTVL,
        currentUserTVL, // Assuming no previous data for user, so no change
        'currency'
      );
    }

    return baseMetrics;
  }

  /**
   * Create a metric value
   */
  private createMetricValue(current: number, previous: number, format: string) {
    const change = current - previous;
    const changePercent = previous > 0 ? (change / previous) * 100 : 0;
    const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'stable';
    
    return {
      current,
      previous,
      change,
      changePercent,
      trend: trend as 'up' | 'down' | 'stable',
      unit: this.getUnit(format),
      format: format as 'number' | 'duration' | 'currency' | 'percentage'
    };
  }

  /**
   * Get the unit for a format
   */
  private getUnit(format: string): string {
    switch (format) {
      case 'currency': return 'USD';
      case 'percentage': return '%';
      case 'duration': return 'ms';
      default: return '';
    }
  }

  /**
   * Get chart data
   */
  private async getChartData(timeRange: TimeRange, walletAddress?: string): Promise<ChartData[]> {
    const charts: ChartData[] = [];

    // TVL Trend Chart
    charts.push({
      id: 'tvl_trend',
      type: 'line',
      title: 'Total Value Locked Trend',
      description: 'Shows the change in total value locked over time',
      data: this.generateTimeSeriesData(timeRange, 100000000, 150000000),
      config: {
        xAxis: { label: 'Time', type: 'time', format: 'MM-DD' },
        yAxis: { label: 'TVL (USD)', type: 'linear', format: '$,.0f' },
        colors: ['#1890ff'],
        showLegend: false,
        showTooltip: true,
        showGrid: true,
        animation: true,
        responsive: true
      },
      insights: ['TVL has grown by 15.2% in the last 30 days', 'Growth is mainly from DOT and ETH staking']
    });

    // Reward Distribution Pie Chart
    charts.push({
      id: 'reward_distribution',
      type: 'pie',
      title: 'Reward Distribution',
      description: 'Shows the distribution of rewards by asset type',
      data: [
        { x: 'DOT', y: 45.2, category: 'DOT' },
        { x: 'ETH', y: 28.7, category: 'ETH' },
        { x: 'KSM', y: 15.3, category: 'KSM' },
        { x: 'GLMR', y: 10.8, category: 'GLMR' }
      ],
      config: {
        xAxis: { label: 'Asset', type: 'category', format: '' },
        yAxis: { label: 'Percentage', type: 'linear', format: '.1%' },
        colors: ['#1890ff', '#52c41a', '#faad14', '#f5222d'],
        showLegend: true,
        showTooltip: true,
        showGrid: false,
        animation: true,
        responsive: true
      },
      insights: ['DOT contributes the most rewards', 'ETH staking rewards are growing steadily']
    });

    // Transaction Success Rate Trend
    charts.push({
      id: 'success_rate_trend',
      type: 'area',
      title: 'Transaction Success Rate Trend',
      description: 'Shows the change in transaction success rate over time',
      data: this.generateTimeSeriesData(timeRange, 95, 99),
      config: {
        xAxis: { label: 'Time', type: 'time', format: 'MM-DD' },
        yAxis: { label: 'Success Rate (%)', type: 'linear', format: '.1f', min: 90, max: 100 },
        colors: ['#52c41a'],
        showLegend: false,
        showTooltip: true,
        showGrid: true,
        animation: true,
        responsive: true
      },
      insights: ['Success rate remains above 98%', 'Success rate drops slightly during network congestion']
    });

    return charts;
  }

  /**
   * 生成时间序列数据
   */
  private generateTimeSeriesData(timeRange: TimeRange, min: number, max: number) {
    const points = this.getDataPoints(timeRange);
    const data = [];
    
    for (let i = 0; i < points; i++) {
      const timestamp = timeRange.start + (i * (timeRange.end - timeRange.start) / points);
      const value = min + Math.random() * (max - min) + Math.sin(i / 10) * (max - min) * 0.1;
      data.push({ x: timestamp, y: value });
    }
    
    return data;
  }

  /**
   * 获取数据点数量
   */
  private getDataPoints(timeRange: TimeRange): number {
    switch (timeRange.period) {
      case '1h': return 60;
      case '24h': return 24;
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      case '1y': return 365;
      default: return 30;
    }
  }

  /**
   * 生成数据洞察
   */
  private async generateInsights(timeRange: TimeRange, walletAddress?: string): Promise<DataInsight[]> {
    const insights: DataInsight[] = [];

    // 趋势洞察
    insights.push({
      id: 'tvl_growth_trend',
      type: 'trend',
      severity: 'high',
      title: 'TVL 强劲增长',
      description: '总锁定价值在过去30天内增长了15.2%，主要由DOT和ETH质押推动',
      confidence: 0.92,
      impact: 'positive',
      actionable: true,
      suggestedActions: [
        '考虑增加DOT和ETH的质押比例',
        '关注新兴资产的质押机会'
      ],
      relatedMetrics: ['totalValueLocked', 'averageAPY'],
      timestamp: Date.now()
    });

    // 异常检测
    insights.push({
      id: 'gas_efficiency_anomaly',
      type: 'anomaly',
      severity: 'medium',
      title: 'Gas效率异常',
      description: '检测到某些时段的Gas效率显著下降，可能与网络拥堵有关',
      confidence: 0.78,
      impact: 'negative',
      actionable: true,
      suggestedActions: [
        '避免在网络高峰期进行大额交易',
        '考虑使用Gas优化策略'
      ],
      relatedMetrics: ['gasEfficiency', 'averageTransactionTime'],
      timestamp: Date.now()
    });

    // 相关性分析
    insights.push({
      id: 'apy_correlation',
      type: 'correlation',
      severity: 'low',
      title: 'APY与市场波动相关性',
      description: '发现APY与市场波动性存在负相关关系，波动性增加时APY趋于稳定',
      confidence: 0.85,
      impact: 'neutral',
      actionable: false,
      relatedMetrics: ['averageAPY'],
      timestamp: Date.now()
    });

    return insights;
  }

  /**
   * 获取比较数据
   */
  private async getComparisons(timeRange: TimeRange, walletAddress?: string) {
    return [
      {
        id: 'period_comparison',
        title: '与上期对比',
        type: 'period' as const,
        baseline: { label: '当前周期', period: timeRange },
        comparison: { label: '上个周期' },
        metrics: {
          totalValueLocked: { baseline: 125000000, comparison: 118000000, difference: 7000000, percentChange: 5.93 },
          averageAPY: { baseline: 12.5, comparison: 11.8, difference: 0.7, percentChange: 5.93 }
        }
      }
    ];
  }

  /**
   * 获取预测数据
   */
  private async getPredictions(timeRange: TimeRange, walletAddress?: string) {
    const now = Date.now();
    const futurePoints = 30; // 预测30个点
    
    return [
      {
        id: 'tvl_prediction',
        metric: 'totalValueLocked',
        timeHorizon: 30 * 24 * 60 * 60 * 1000, // 30天
        confidence: 0.75,
        predictions: Array.from({ length: futurePoints }, (_, i) => ({
          timestamp: now + i * 24 * 60 * 60 * 1000,
          value: 125000000 + i * 1000000 + Math.random() * 5000000,
          upperBound: 125000000 + i * 1000000 + 10000000,
          lowerBound: 125000000 + i * 1000000 - 5000000,
          confidence: 0.75 - (i * 0.01)
        })),
        model: 'ARIMA',
        accuracy: 0.82,
        lastUpdated: now
      }
    ];
  }

  /**
   * 缓存数据
   */
  private setCachedData(key: string, data: any) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * 获取缓存数据
   */
  private getCachedData(key: string) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  /**
   * 清除缓存
   */
  clearCache() {
    this.cache.clear();
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
   * 移除事件监听器
   */
  removeEventListener(event: string, callback: Function) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
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
          console.error('Analytics event listener error:', error);
        }
      });
    }
  }
}

export default new AdvancedAnalyticsService();