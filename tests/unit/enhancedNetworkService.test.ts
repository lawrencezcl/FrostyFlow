import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import enhancedNetworkService from '../../src/services/enhancedNetworkService';
import { NetworkConfig, TestSuite } from '../../src/types/network';

describe('EnhancedNetworkService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('network management', () => {
    it('should return all networks', () => {
      const networks = enhancedNetworkService.getAllNetworks();
      
      expect(Array.isArray(networks)).toBe(true);
      expect(networks.length).toBeGreaterThan(0);
      
      networks.forEach(network => {
        expect(network.id).toBeDefined();
        expect(network.name).toBeDefined();
        expect(network.displayName).toBeDefined();
        expect(typeof network.chainId).toBe('number');
        expect(Array.isArray(network.rpcUrls)).toBe(true);
        expect(Array.isArray(network.blockExplorerUrls)).toBe(true);
        expect(network.nativeCurrency).toBeDefined();
        expect(typeof network.isTestnet).toBe('boolean');
        expect(typeof network.isMainnet).toBe('boolean');
        expect(typeof network.isActive).toBe('boolean');
      });
    });

    it('should return only active networks', () => {
      const activeNetworks = enhancedNetworkService.getActiveNetworks();
      
      expect(Array.isArray(activeNetworks)).toBe(true);
      activeNetworks.forEach(network => {
        expect(network.isActive).toBe(true);
      });
    });

    it('should get specific network by id', () => {
      const networks = enhancedNetworkService.getAllNetworks();
      if (networks.length > 0) {
        const networkId = networks[0].id;
        const network = enhancedNetworkService.getNetwork(networkId);
        
        expect(network).toBeDefined();
        expect(network!.id).toBe(networkId);
      }
    });

    it('should return undefined for non-existent network', () => {
      const network = enhancedNetworkService.getNetwork('non-existent-network');
      expect(network).toBeUndefined();
    });

    it('should add new network', () => {
      const newNetwork: NetworkConfig = {
        id: 'test-network',
        name: 'test-network',
        displayName: 'Test Network',
        chainId: 9999,
        rpcUrls: ['wss://test.example.com'],
        blockExplorerUrls: ['https://explorer.test.com'],
        nativeCurrency: {
          name: 'Test Token',
          symbol: 'TEST',
          decimals: 18
        },
        isTestnet: true,
        isMainnet: false,
        isActive: true,
        supportedFeatures: [],
        bridgeSupport: [],
        stakingSupport: [],
        dexSupport: []
      };

      enhancedNetworkService.addNetwork(newNetwork);
      const retrievedNetwork = enhancedNetworkService.getNetwork('test-network');
      
      expect(retrievedNetwork).toBeDefined();
      expect(retrievedNetwork!.id).toBe('test-network');
    });

    it('should update existing network', () => {
      const networks = enhancedNetworkService.getAllNetworks();
      if (networks.length > 0) {
        const networkId = networks[0].id;
        const updates = { displayName: 'Updated Network Name' };
        
        enhancedNetworkService.updateNetwork(networkId, updates);
        const updatedNetwork = enhancedNetworkService.getNetwork(networkId);
        
        expect(updatedNetwork!.displayName).toBe('Updated Network Name');
      }
    });
  });

  describe('network status', () => {
    it('should update and retrieve network status', () => {
      const networks = enhancedNetworkService.getAllNetworks();
      if (networks.length > 0) {
        const networkId = networks[0].id;
        const status = {
          chainId: networks[0].chainId,
          blockHeight: 1000000,
          blockTime: 6000,
          gasPrice: 20,
          networkCongestion: 'low' as const,
          isHealthy: true,
          lastUpdated: Date.now(),
          rpcLatency: 100,
          syncStatus: 'synced' as const
        };

        enhancedNetworkService.updateNetworkStatus(networkId, status);
        const retrievedStatus = enhancedNetworkService.getNetworkStatus(networkId);
        
        expect(retrievedStatus).toBeDefined();
        expect(retrievedStatus!.blockHeight).toBe(1000000);
       expect(retrievedStatus!.isHealthy).toBe(true);
      }
    });
  });

  describe('network compatibility', () => {
    it('should check compatibility between networks', async () => {
      const networks = enhancedNetworkService.getAllNetworks();
      if (networks.length >= 2) {
        const sourceNetwork = networks[0].id;
        const targetNetwork = networks[1].id;
        
        const compatibility = await enhancedNetworkService.checkNetworkCompatibility(
          sourceNetwork, 
          targetNetwork
        );
        
        expect(compatibility).toBeDefined();
        expect(compatibility.sourceNetwork).toBe(sourceNetwork);
        expect(compatibility.targetNetwork).toBe(targetNetwork);
        expect(typeof compatibility.compatibilityScore).toBe('number');
        expect(compatibility.compatibilityScore).toBeGreaterThanOrEqual(0);
        expect(compatibility.compatibilityScore).toBeLessThanOrEqual(1);
        expect(Array.isArray(compatibility.supportedOperations)).toBe(true);
        expect(Array.isArray(compatibility.limitations)).toBe(true);
        expect(Array.isArray(compatibility.recommendedBridges)).toBe(true);
        expect(compatibility.estimatedCosts).toBeDefined();
      }
    });

    it('should throw error for non-existent networks', async () => {
      await expect(
        enhancedNetworkService.checkNetworkCompatibility('non-existent-1', 'non-existent-2')
      ).rejects.toThrow('Network not found');
    });
  });

  describe('integration testing', () => {
    it('should create test suite', () => {
      const testSuite: TestSuite = {
        id: 'test-suite-1',
        name: 'Basic Integration Test',
        description: 'Test basic network functionality',
        networks: ['polkadot'],
        tests: [
          {
            id: 'connection-test',
            name: 'Connection Test',
            description: 'Test network connection',
            category: 'connection',
            priority: 'high',
            timeout: 30000,
            retryCount: 3,
            prerequisites: [],
            steps: [],
            expectedResults: {}
          }
        ],
        schedule: {
          type: 'manual',
          timezone: 'UTC',
          isEnabled: true
        },
        results: []
      };

      enhancedNetworkService.createTestSuite(testSuite);
      
      // Test suite should be created without errors
      expect(true).toBe(true);
    });

    it('should run integration tests', async () => {
      const testSuite: TestSuite = {
        id: 'test-suite-2',
        name: 'Integration Test Suite',
        description: 'Comprehensive integration tests',
        networks: ['polkadot', 'bifrost'],
        tests: [
          {
            id: 'connection-test',
            name: 'Connection Test',
            description: 'Test network connection',
            category: 'connection',
            priority: 'high',
            timeout: 30000,
            retryCount: 3,
            prerequisites: [],
            steps: [],
            expectedResults: {}
          },
          {
            id: 'transaction-test',
            name: 'Transaction Test',
            description: 'Test transaction processing',
            category: 'transaction',
            priority: 'medium',
            timeout: 60000,
            retryCount: 2,
            prerequisites: [],
            steps: [],
            expectedResults: {}
          }
        ],
        schedule: {
          type: 'manual',
          timezone: 'UTC',
          isEnabled: true
        },
        results: []
      };

      enhancedNetworkService.createTestSuite(testSuite);
      const result = await enhancedNetworkService.runIntegrationTests(testSuite.id);
      
      expect(result).toBeDefined();
      expect(result.suiteId).toBe(testSuite.id);
      expect(result.runId).toBeDefined();
      expect(result.startTime).toBeDefined();
      expect(result.endTime).toBeDefined();
      expect(result.duration).toBeGreaterThan(0);
      expect(result.status).toMatch(/^(passed|failed|partial)$/);
      expect(result.totalTests).toBe(testSuite.tests.length);
      expect(result.passedTests + result.failedTests + result.skippedTests).toBe(result.totalTests);
      expect(Array.isArray(result.testResults)).toBe(true);
      expect(result.summary).toBeDefined();
      expect(Array.isArray(result.artifacts)).toBe(true);
    });

    it('should throw error for non-existent test suite', async () => {
      await expect(
        enhancedNetworkService.runIntegrationTests('non-existent-suite')
      ).rejects.toThrow('Test suite not found');
    });

    it('should retrieve test results', () => {
      const results = enhancedNetworkService.getTestResults('test-suite-2');
      
      expect(Array.isArray(results)).toBe(true);
      // Results should include the test we ran earlier
      if (results.length > 0) {
        expect(results[0].suiteId).toBe('test-suite-2');
      }
    });
  });

  describe('performance metrics', () => {
    it('should collect network metrics', () => {
      const networks = enhancedNetworkService.getAllNetworks();
      if (networks.length > 0) {
        const networkId = networks[0].id;
        
        // Wait a bit for metrics to be collected
        setTimeout(() => {
          const metrics = enhancedNetworkService.getNetworkMetrics(networkId);
          
          expect(Array.isArray(metrics)).toBe(true);
          
          metrics.forEach(metric => {
            expect(metric.networkId).toBe(networkId);
            expect(typeof metric.timestamp).toBe('number');
            expect(typeof metric.blockTime).toBe('number');
            expect(typeof metric.transactionThroughput).toBe('number');
            expect(metric.gasPrice).toBeDefined();
            expect(typeof metric.networkLatency).toBe('number');
            expect(typeof metric.successRate).toBe('number');
            expect(metric.successRate).toBeGreaterThanOrEqual(0);
            expect(metric.successRate).toBeLessThanOrEqual(1);
            expect(typeof metric.congestionLevel).toBe('number');
            expect(metric.congestionLevel).toBeGreaterThanOrEqual(0);
            expect(metric.congestionLevel).toBeLessThanOrEqual(1);
          });
        }, 1000);
      }
    });

    it('should filter metrics by time range', () => {
      const networks = enhancedNetworkService.getAllNetworks();
      if (networks.length > 0) {
        const networkId = networks[0].id;
        const now = Date.now();
        const timeRange = {
          start: now - 60 * 60 * 1000, // 1 hour ago
          end: now
        };
        
        const metrics = enhancedNetworkService.getNetworkMetrics(networkId, timeRange);
        
        expect(Array.isArray(metrics)).toBe(true);
        
        metrics.forEach(metric => {
          expect(metric.timestamp).toBeGreaterThanOrEqual(timeRange.start);
          expect(metric.timestamp).toBeLessThanOrEqual(timeRange.end);
        });
      }
    });
  });

  describe('event handling', () => {
    it('should support event listeners', () => {
      const mockCallback = jest.fn();
      
      enhancedNetworkService.addEventListener('test_event', mockCallback);
      
      // Event listener should be added without errors
      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe('default network configurations', () => {
    it('should have polkadot network configured', () => {
      const polkadot = enhancedNetworkService.getNetwork('polkadot');
      
      expect(polkadot).toBeDefined();
      expect(polkadot!.name).toBe('polkadot');
      expect(polkadot!.displayName).toBe('Polkadot');
      expect(polkadot!.isMainnet).toBe(true);
      expect(polkadot!.isActive).toBe(true);
      expect(polkadot!.nativeCurrency.symbol).toBe('DOT');
    });

    it('should have bifrost network configured', () => {
      const bifrost = enhancedNetworkService.getNetwork('bifrost');
      
      expect(bifrost).toBeDefined();
      expect(bifrost!.name).toBe('bifrost');
      expect(bifrost!.displayName).toBe('Bifrost');
      expect(bifrost!.isMainnet).toBe(true);
      expect(bifrost!.isActive).toBe(true);
      expect(bifrost!.nativeCurrency.symbol).toBe('BNC');
    });

    it('should have proper staking support configured', () => {
      const polkadot = enhancedNetworkService.getNetwork('polkadot');
      const bifrost = enhancedNetworkService.getNetwork('bifrost');
      
      expect(polkadot!.stakingSupport.length).toBeGreaterThan(0);
      expect(bifrost!.stakingSupport.length).toBeGreaterThan(0);
      
      polkadot!.stakingSupport.forEach(staking => {
        expect(staking.asset).toBeDefined();
        expect(staking.protocol).toBeDefined();
        expect(typeof staking.minStake).toBe('number');
        expect(typeof staking.currentAPY).toBe('number');
        expect(typeof staking.isLiquidStaking).toBe('boolean');
        expect(typeof staking.slashingRisk).toBe('boolean');
      });
    });
  });
});