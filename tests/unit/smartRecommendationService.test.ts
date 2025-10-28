import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import smartRecommendationService from '../../src/services/smartRecommendationService';
import { RecommendationPreferences } from '../../src/types/recommendation';

// Mock dependencies
jest.mock('../../src/services/index', () => ({
  multiChainMonitoring: {
    getUserAssets: jest.fn()
  },
  advancedAnalytics: {
    getAnalyticsData: jest.fn()
  },
  coinGecko: {
    getPrice: jest.fn()
  }
}));

describe('SmartRecommendationService', () => {
  const mockWalletAddress = '0x1234567890abcdef';
  const mockUserAssets = [
    {
      symbol: 'DOT',
      totalValue: 10000,
      apy: 12.5,
      chain: 'polkadot'
    },
    {
      symbol: 'KSM',
      totalValue: 5000,
      apy: 15.2,
      chain: 'kusama'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserRecommendations', () => {
    it('should return recommendations for valid wallet address', async () => {
      const { multiChainMonitoring } = require('../../src/services/index');
      multiChainMonitoring.getUserAssets.mockResolvedValue(mockUserAssets);

      const recommendations = await smartRecommendationService.getUserRecommendations(mockWalletAddress);

      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
      
      recommendations.forEach(rec => {
        expect(rec.id).toBeDefined();
        expect(rec.type).toMatch(/^(stake|unstake|rebalance|bridge|swap|yield_farm)$/);
        expect(rec.priority).toMatch(/^(low|medium|high|urgent)$/);
        expect(rec.title).toBeDefined();
        expect(rec.description).toBeDefined();
        expect(Array.isArray(rec.reasoning)).toBe(true);
        expect(rec.confidence).toBeGreaterThan(0);
        expect(rec.confidence).toBeLessThanOrEqual(1);
        expect(rec.riskLevel).toMatch(/^(low|medium|high)$/);
      });
    });

    it('should limit recommendations to specified count', async () => {
      const { multiChainMonitoring } = require('../../src/services/index');
      multiChainMonitoring.getUserAssets.mockResolvedValue(mockUserAssets);

      const limit = 5;
      const recommendations = await smartRecommendationService.getUserRecommendations(mockWalletAddress, limit);

      expect(recommendations.length).toBeLessThanOrEqual(limit);
    });

    it('should sort recommendations by priority and confidence', async () => {
      const { multiChainMonitoring } = require('../../src/services/index');
      multiChainMonitoring.getUserAssets.mockResolvedValue(mockUserAssets);

      const recommendations = await smartRecommendationService.getUserRecommendations(mockWalletAddress);

      if (recommendations.length > 1) {
        for (let i = 0; i < recommendations.length - 1; i++) {
          const current = recommendations[i];
          const next = recommendations[i + 1];
          
          // Should be sorted by priority first, then confidence
          const currentPriorityWeight = getPriorityWeight(current.priority);
          const nextPriorityWeight = getPriorityWeight(next.priority);
          
          if (currentPriorityWeight === nextPriorityWeight) {
            expect(current.confidence).toBeGreaterThanOrEqual(next.confidence);
          } else {
            expect(currentPriorityWeight).toBeGreaterThanOrEqual(nextPriorityWeight);
          }
        }
      }
    });
  });

  describe('yield optimization recommendations', () => {
    it('should generate yield recommendations for better opportunities', async () => {
      const { multiChainMonitoring } = require('../../src/services/index');
      const lowYieldAssets = [
        {
          symbol: 'DOT',
          totalValue: 10000,
          apy: 8.0, // Lower than available opportunities
          chain: 'polkadot'
        }
      ];
      multiChainMonitoring.getUserAssets.mockResolvedValue(lowYieldAssets);

      const recommendations = await smartRecommendationService.getUserRecommendations(mockWalletAddress);
      const yieldRecs = recommendations.filter(rec => rec.type === 'stake');

      expect(yieldRecs.length).toBeGreaterThan(0);
      
      yieldRecs.forEach(rec => {
        expect(rec.expectedOutcome?.apyIncrease).toBeGreaterThan(0);
        expect(rec.metadata?.currentAPY).toBeDefined();
        expect(rec.metadata?.targetAPY).toBeDefined();
        expect(rec.metadata?.targetAPY).toBeGreaterThan(rec.metadata?.currentAPY);
      });
    });
  });

  describe('risk management recommendations', () => {
    it('should generate diversification recommendations for concentrated portfolios', async () => {
      const { multiChainMonitoring } = require('../../src/services/index');
      const concentratedAssets = [
        {
          symbol: 'DOT',
          totalValue: 15000, // 75% of total
          apy: 12.5,
          chain: 'polkadot'
        },
        {
          symbol: 'KSM',
          totalValue: 5000, // 25% of total
          apy: 15.2,
          chain: 'kusama'
        }
      ];
      multiChainMonitoring.getUserAssets.mockResolvedValue(concentratedAssets);

      const recommendations = await smartRecommendationService.getUserRecommendations(mockWalletAddress);
      const riskRecs = recommendations.filter(rec => 
        rec.type === 'rebalance' && rec.title.includes('集中度风险')
      );

      expect(riskRecs.length).toBeGreaterThan(0);
      
      riskRecs.forEach(rec => {
        expect(rec.priority).toBe('high');
        expect(rec.expectedOutcome?.riskReduction).toBeGreaterThan(0);
        expect(rec.metadata?.currentConcentration).toBeGreaterThan(50);
      });
    });
  });

  describe('rebalancing recommendations', () => {
    it('should generate rebalancing recommendations for unbalanced portfolios', async () => {
      const { multiChainMonitoring } = require('../../src/services/index');
      const unbalancedAssets = [
        {
          symbol: 'DOT',
          totalValue: 12000, // 60% - significantly above equal weight
          apy: 12.5,
          chain: 'polkadot'
        },
        {
          symbol: 'KSM',
          totalValue: 8000, // 40% - below equal weight
          apy: 15.2,
          chain: 'kusama'
        }
      ];
      multiChainMonitoring.getUserAssets.mockResolvedValue(unbalancedAssets);

      const recommendations = await smartRecommendationService.getUserRecommendations(mockWalletAddress);
      const rebalanceRecs = recommendations.filter(rec => 
        rec.type === 'rebalance' && rec.title.includes('再平衡')
      );

      expect(rebalanceRecs.length).toBeGreaterThan(0);
      
      rebalanceRecs.forEach(rec => {
        expect(rec.metadata?.currentAllocation).toBeDefined();
        expect(rec.metadata?.targetAllocation).toBeDefined();
        expect(rec.metadata?.action).toMatch(/^(increase|decrease)$/);
      });
    });
  });

  describe('market insights', () => {
    it('should return market insights', async () => {
      const insights = await smartRecommendationService.getMarketInsights();

      expect(Array.isArray(insights)).toBe(true);
      
      insights.forEach(insight => {
        expect(insight.id).toBeDefined();
        expect(insight.type).toMatch(/^(trend|opportunity|risk|news|technical)$/);
        expect(insight.severity).toMatch(/^(low|medium|high)$/);
        expect(insight.title).toBeDefined();
        expect(insight.description).toBeDefined();
        expect(insight.impact).toMatch(/^(positive|negative|neutral)$/);
        expect(Array.isArray(insight.affectedAssets)).toBe(true);
        expect(Array.isArray(insight.affectedChains)).toBe(true);
        expect(insight.confidence).toBeGreaterThan(0);
        expect(insight.confidence).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('recommendation execution', () => {
    it('should execute recommendations successfully', async () => {
      const { multiChainMonitoring } = require('../../src/services/index');
      multiChainMonitoring.getUserAssets.mockResolvedValue(mockUserAssets);

      const recommendations = await smartRecommendationService.getUserRecommendations(mockWalletAddress);
      
      if (recommendations.length > 0) {
        const result = await smartRecommendationService.executeRecommendation(
          recommendations[0].id, 
          mockWalletAddress
        );

        expect(typeof result).toBe('boolean');
      }
    });

    it('should return false for non-existent recommendation', async () => {
      const result = await smartRecommendationService.executeRecommendation(
        'non-existent-id', 
        mockWalletAddress
      );

      expect(result).toBe(false);
    });
  });

  describe('event handling', () => {
    it('should support event listeners', () => {
      const mockCallback = jest.fn();
      
      smartRecommendationService.addEventListener('test_event', mockCallback);
      
      // Event listener should be added without errors
      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe('user preferences', () => {
    it('should handle default preferences for new users', async () => {
      const { multiChainMonitoring } = require('../src/services/index');
      multiChainMonitoring.getUserAssets.mockResolvedValue(mockUserAssets);

      const recommendations = await smartRecommendationService.getUserRecommendations(mockWalletAddress);

      // Should work with default preferences
      expect(Array.isArray(recommendations)).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle service errors gracefully', async () => {
      const { multiChainMonitoring } = require('../src/services/index');
      multiChainMonitoring.getUserAssets.mockRejectedValue(new Error('Service error'));

      const recommendations = await smartRecommendationService.getUserRecommendations(mockWalletAddress);

      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBe(0);
    });
  });
});

// Helper function to match the service's priority weighting
function getPriorityWeight(priority: string): number {
  switch (priority) {
    case 'urgent': return 4;
    case 'high': return 3;
    case 'medium': return 2;
    case 'low': return 1;
    default: return 0;
  }
}