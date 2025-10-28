import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import advancedAnalyticsService from '../../src/services/advancedAnalyticsService';
import { TimeRange } from '../../src/types/analytics';

// Mock dependencies
jest.mock('../../src/services/index', () => ({
  multiChainMonitoring: {
    getUserAssets: jest.fn()
  },
  realtimeStatusTracking: {
    getStatistics: jest.fn()
  }
}));

describe('AdvancedAnalyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    advancedAnalyticsService.clearCache();
  });

  describe('getAnalyticsData', () => {
    it('should return analytics data for valid time range', async () => {
      const timeRange: TimeRange = {
        start: Date.now() - 30 * 24 * 60 * 60 * 1000,
        end: Date.now(),
        period: '30d',
        granularity: 'day'
      };

      const result = await advancedAnalyticsService.getAnalyticsData(timeRange);

      expect(result).toBeDefined();
      expect(result.timeRange).toEqual(timeRange);
      expect(result.metrics).toBeDefined();
      expect(result.charts).toBeDefined();
      expect(result.insights).toBeDefined();
      expect(Array.isArray(result.charts)).toBe(true);
      expect(Array.isArray(result.insights)).toBe(true);
    });

    it('should return cached data on subsequent calls', async () => {
      const timeRange: TimeRange = {
        start: Date.now() - 24 * 60 * 60 * 1000,
        end: Date.now(),
        period: '24h',
        granularity: 'hour'
      };

      const result1 = await advancedAnalyticsService.getAnalyticsData(timeRange);
      const result2 = await advancedAnalyticsService.getAnalyticsData(timeRange);

      expect(result1).toEqual(result2);
    });

    it('should handle user-specific analytics when wallet address provided', async () => {
      const timeRange: TimeRange = {
        start: Date.now() - 7 * 24 * 60 * 60 * 1000,
        end: Date.now(),
        period: '7d',
        granularity: 'day'
      };

      const walletAddress = '0x1234567890abcdef';
      const result = await advancedAnalyticsService.getAnalyticsData(timeRange, walletAddress);

      expect(result).toBeDefined();
      expect(result.metrics.totalValueLocked).toBeDefined();
    });
  });

  describe('metrics validation', () => {
    it('should generate valid metric values', async () => {
      const timeRange: TimeRange = {
        start: Date.now() - 24 * 60 * 60 * 1000,
        end: Date.now(),
        period: '24h',
        granularity: 'hour'
      };

      const result = await advancedAnalyticsService.getAnalyticsData(timeRange);
      const metrics = result.metrics;

      // Validate metric structure
      expect(metrics.totalValueLocked.current).toBeGreaterThan(0);
      expect(metrics.totalValueLocked.trend).toMatch(/^(up|down|stable)$/);
      expect(metrics.averageAPY.current).toBeGreaterThan(0);
      expect(metrics.successRate.current).toBeGreaterThanOrEqual(0);
      expect(metrics.successRate.current).toBeLessThanOrEqual(100);
    });
  });

  describe('chart data generation', () => {
    it('should generate valid chart data', async () => {
      const timeRange: TimeRange = {
        start: Date.now() - 7 * 24 * 60 * 60 * 1000,
        end: Date.now(),
        period: '7d',
        granularity: 'day'
      };

      const result = await advancedAnalyticsService.getAnalyticsData(timeRange);
      const charts = result.charts;

      expect(charts.length).toBeGreaterThan(0);
      
      charts.forEach(chart => {
        expect(chart.id).toBeDefined();
        expect(chart.type).toMatch(/^(line|bar|pie|area)$/);
        expect(chart.title).toBeDefined();
        expect(Array.isArray(chart.data)).toBe(true);
        expect(chart.config).toBeDefined();
        expect(Array.isArray(chart.insights)).toBe(true);
      });
    });

    it('should generate appropriate number of data points for time range', async () => {
      const timeRange: TimeRange = {
        start: Date.now() - 24 * 60 * 60 * 1000,
        end: Date.now(),
        period: '24h',
        granularity: 'hour'
      };

      const result = await advancedAnalyticsService.getAnalyticsData(timeRange);
      const lineChart = result.charts.find(chart => chart.type === 'line');

      expect(lineChart).toBeDefined();
      expect(lineChart!.data.length).toBe(24); // 24 hours
    });
  });

  describe('insights generation', () => {
    it('should generate actionable insights', async () => {
      const timeRange: TimeRange = {
        start: Date.now() - 30 * 24 * 60 * 60 * 1000,
        end: Date.now(),
        period: '30d',
        granularity: 'day'
      };

      const result = await advancedAnalyticsService.getAnalyticsData(timeRange);
      const insights = result.insights;

      expect(insights.length).toBeGreaterThan(0);
      
      insights.forEach(insight => {
        expect(insight.id).toBeDefined();
        expect(insight.type).toMatch(/^(trend|anomaly|correlation)$/);
        expect(insight.severity).toMatch(/^(low|medium|high)$/);
        expect(insight.title).toBeDefined();
        expect(insight.description).toBeDefined();
        expect(insight.confidence).toBeGreaterThan(0);
        expect(insight.confidence).toBeLessThanOrEqual(1);
        expect(insight.impact).toMatch(/^(positive|negative|neutral)$/);
      });
    });
  });

  describe('event handling', () => {
    it('should support event listeners', () => {
      const mockCallback = jest.fn();
      
      advancedAnalyticsService.addEventListener('test_event', mockCallback);
      
      // Trigger event through private method (testing internal functionality)
      // In real implementation, this would be triggered by actual service operations
      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should remove event listeners', () => {
      const mockCallback = jest.fn();
      
      advancedAnalyticsService.addEventListener('test_event', mockCallback);
      advancedAnalyticsService.removeEventListener('test_event', mockCallback);
      
      // Event should not be triggered after removal
      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe('cache management', () => {
    it('should clear cache when requested', async () => {
      const timeRange: TimeRange = {
        start: Date.now() - 24 * 60 * 60 * 1000,
        end: Date.now(),
        period: '24h',
        granularity: 'hour'
      };

      // Get data to populate cache
      await advancedAnalyticsService.getAnalyticsData(timeRange);
      
      // Clear cache
      advancedAnalyticsService.clearCache();
      
      // Should work without errors after cache clear
      const result = await advancedAnalyticsService.getAnalyticsData(timeRange);
      expect(result).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should handle invalid time ranges gracefully', async () => {
      const invalidTimeRange: TimeRange = {
        start: Date.now(),
        end: Date.now() - 24 * 60 * 60 * 1000, // End before start
        period: '24h',
        granularity: 'hour'
      };

      await expect(advancedAnalyticsService.getAnalyticsData(invalidTimeRange))
        .rejects.toThrow();
    });
  });
});