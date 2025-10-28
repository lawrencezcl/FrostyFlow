import { 
  SLPxStakingRequest, 
  SLPxRoute, 
  SLPxQuote, 
  SLPxError, 
  StakingPool,
  UserStakingPosition,
  RouteOptimization 
} from '../types/slpx';
import crossChainBridgeService from './crossChainBridgeService';
import bifrostSdkService from './bifrostSdk';

/**
 * SLPx 一键跨链质押服务
 */
class SLPxService {
  private readonly SLPX_API_URL = 'https://api.slpx.bifrost.io';
  private activeRequests: Map<string, SLPxStakingRequest> = new Map();
  private eventListeners: Map<string, Function[]> = new Map();

  // 支持的资产配置
  private readonly SUPPORTED_ASSETS = {
    DOT: {
      chains: ['polkadot', 'moonbeam', 'astar'],
      vTokenSymbol: 'vDOT',
      minStakeAmount: 1,
      maxStakeAmount: 10000,
    },
    ETH: {
      chains: ['ethereum', 'moonbeam', 'base', 'arbitrum'],
      vTokenSymbol: 'vETH',
      minStakeAmount: 0.01,
      maxStakeAmount: 1000,
    },
    KSM: {
      chains: ['kusama', 'moonriver'],
      vTokenSymbol: 'vKSM',
      minStakeAmount: 0.1,
      maxStakeAmount: 5000,
    },
    GLMR: {
      chains: ['moonbeam'],
      vTokenSymbol: 'vGLMR',
      minStakeAmount: 10,
      maxStakeAmount: 100000,
    }
  };

  /**
   * 获取支持的 SLPx 路由
   */
  async getSupportedRoutes(): Promise<SLPxRoute[]> {
    try {
      const routes: SLPxRoute[] = [];
      
      for (const [asset, config] of Object.entries(this.SUPPORTED_ASSETS)) {
        for (const sourceChain of config.chains) {
          if (sourceChain !== 'bifrost') {
            routes.push({
              id: `${sourceChain}-bifrost-${asset}`,
              sourceChain,
              targetChain: 'bifrost',
              asset,
              vTokenAsset: config.vTokenSymbol,
              bridgeProtocol: this.getBridgeProtocol(sourceChain),
              stakingProtocol: 'bifrost-slp',
              totalFee: this.estimateTotalFee(sourceChain, asset),
              estimatedTime: this.estimateTime(sourceChain),
              minAmount: config.minStakeAmount,
              maxAmount: config.maxStakeAmount,
              isActive: true,
              apy: await this.getAssetAPY(asset),
            });
          }
        }
      }

      return routes;
    } catch (error) {
      console.error('Failed to get SLPx routes:', error);
      return [];
    }
  }

  /**
   * 获取 SLPx 报价
   */
  async getQuote(
    sourceChain: string,
    asset: string,
    amount: number,
    optimization: RouteOptimization = { prioritize: 'yield', maxSlippage: 0.5, maxBridgeTime: 600000, preferredBridges: [], avoidBridges: [] }
  ): Promise<SLPxQuote | null> {
    try {
      // 验证参数
      if (!this.SUPPORTED_ASSETS[asset as keyof typeof this.SUPPORTED_ASSETS]) {
        throw new SLPxError('Unsupported asset', 'UNSUPPORTED_ASSET');
      }

      const assetConfig = this.SUPPORTED_ASSETS[asset as keyof typeof this.SUPPORTED_ASSETS];
      if (!assetConfig.chains.includes(sourceChain)) {
        throw new SLPxError('Unsupported source chain for this asset', 'UNSUPPORTED_CHAIN');
      }

      if (amount < assetConfig.minStakeAmount || amount > assetConfig.maxStakeAmount) {
        throw new SLPxError('Amount out of range', 'INVALID_AMOUNT');
      }

      // 获取桥接报价
      const bridgeQuote = await crossChainBridgeService.getBestQuote(sourceChain, 'bifrost', asset, amount);
      if (!bridgeQuote) {
        throw new SLPxError('No bridge route available', 'NO_BRIDGE_ROUTE');
      }

      // 获取质押信息
      const stakingPool = await this.getStakingPool(asset);
      if (!stakingPool) {
        throw new SLPxError('Staking pool not available', 'NO_STAKING_POOL');
      }

      // 计算预期 vToken 数量
      const bridgedAmount = bridgeQuote.outputAmount;
      const stakingFee = bridgedAmount * 0.001; // 0.1% 质押费用
      const netStakingAmount = bridgedAmount - stakingFee;
      const expectedVTokens = netStakingAmount / stakingPool.exchangeRate;

      const quote: SLPxQuote = {
        route: {
          id: `${sourceChain}-bifrost-${asset}`,
          sourceChain,
          targetChain: 'bifrost',
          asset,
          vTokenAsset: assetConfig.vTokenSymbol,
          bridgeProtocol: bridgeQuote.route.protocol,
          stakingProtocol: 'bifrost-slp',
          totalFee: bridgeQuote.fee + stakingFee,
          estimatedTime: bridgeQuote.estimatedTime + 30000, // 加上质押时间
          minAmount: assetConfig.minStakeAmount,
          maxAmount: assetConfig.maxStakeAmount,
          isActive: true,
          apy: stakingPool.apy,
        },
        inputAmount: amount,
        bridgeFee: bridgeQuote.fee,
        stakingFee,
        totalFee: bridgeQuote.fee + stakingFee,
        expectedVTokens,
        exchangeRate: stakingPool.exchangeRate,
        priceImpact: bridgeQuote.priceImpact,
        estimatedTime: bridgeQuote.estimatedTime + 30000,
        steps: [
          '授权代币转移',
          '跨链桥接到 Bifrost',
          '在 Bifrost 上质押',
          '接收 vToken'
        ],
        slippage: optimization.maxSlippage,
      };

      return quote;
    } catch (error) {
      console.error('Failed to get SLPx quote:', error);
      return null;
    }
  }

  /**
   * 执行一键跨链质押
   */
  async executeOneClickStaking(
    sourceChain: string,
    asset: string,
    amount: number,
    walletAddress: string,
    recipient?: string,
    optimization?: RouteOptimization
  ): Promise<SLPxStakingRequest> {
    try {
      // 获取报价
      const quote = await this.getQuote(sourceChain, asset, amount, optimization);
      if (!quote) {
        throw new SLPxError('Unable to get quote', 'NO_QUOTE');
      }

      // 创建 SLPx 请求
      const requestId = this.generateRequestId();
      const request: SLPxStakingRequest = {
        id: requestId,
        sourceChain,
        targetChain: 'bifrost',
        asset,
        amount,
        walletAddress,
        recipient: recipient || walletAddress,
        slippage: quote.slippage,
        deadline: Date.now() + (30 * 60 * 1000), // 30分钟后过期
        status: 'pending',
        progress: 0,
        estimatedTime: quote.estimatedTime,
        steps: this.createSLPxSteps(sourceChain, asset),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // 存储请求
      this.activeRequests.set(requestId, request);

      // 触发事件
      this.emitEvent('slpx_initiated', request);

      // 开始执行流程
      this.executeSLPxFlow(request);

      return request;
    } catch (error) {
      if (error instanceof SLPxError) {
        throw error;
      }
      throw new SLPxError('SLPx execution failed', 'EXECUTION_FAILED');
    }
  }

  /**
   * 获取用户质押位置
   */
  async getUserStakingPositions(walletAddress: string): Promise<UserStakingPosition[]> {
    try {
      const positions: UserStakingPosition[] = [];
      
      for (const [asset, config] of Object.entries(this.SUPPORTED_ASSETS)) {
        const vTokenBalance = await bifrostSdkService.getAssetBalance('bifrost', config.vTokenSymbol, walletAddress);
        
        if (vTokenBalance?.data && vTokenBalance.data > 0) {
          const stakingPool = await this.getStakingPool(asset);
          const currentValue = vTokenBalance.data * (stakingPool?.exchangeRate || 1);
          
          positions.push({
            asset,
            vTokenAsset: config.vTokenSymbol,
            stakedAmount: currentValue, // Simplified calculation
            vTokenBalance: vTokenBalance.data,
            currentValue,
            unrealizedGains: 0, // Requires historical data calculation
            stakingDate: Date.now(), // Needs to be fetched from chain
            lastRewardClaim: Date.now(),
            pendingRewards: 0,
          });
        }
      }

      return positions;
    } catch (error) {
      console.error('Failed to get user staking positions:', error);
      return [];
    }
  }

  /**
   * 获取请求状态
   */
  async getRequestStatus(requestId: string): Promise<SLPxStakingRequest | null> {
    return this.activeRequests.get(requestId) || null;
  }

  /**
   * 执行 SLPx 流程
   */
  private async executeSLPxFlow(request: SLPxStakingRequest) {
    try {
      // 步骤 1: 跨链桥接
      this.updateRequestStep(request, 0, 'active');
      this.emitEvent('bridge_started', request);

      const bridgeTransaction = await crossChainBridgeService.executeBridge(
        request.sourceChain,
        request.targetChain,
        request.asset,
        request.amount,
        request.recipient!,
        request.walletAddress
      );

      request.bridgeTransaction = bridgeTransaction.id;
      this.updateRequest(request);

      // Listen for bridge completion
      crossChainBridgeService.addEventListener('bridge_completed', async (transaction: any) => {
        if (transaction.id === bridgeTransaction.id) {
          this.updateRequestStep(request, 0, 'completed');
          this.emitEvent('bridge_completed', request);
          
          // Step 2: Execute staking
          await this.executeStaking(request);
        }
      });

    } catch (error) {
      request.status = 'failed';
      this.updateRequest(request);
      this.emitEvent('slpx_failed', request);
    }
  }

  /**
   * 执行质押
   */
  private async executeStaking(request: SLPxStakingRequest) {
    try {
      this.updateRequestStep(request, 1, 'active');
      this.emitEvent('staking_started', request);

      // 模拟质押过程
      setTimeout(() => {
        this.updateRequestStep(request, 1, 'completed');
        request.status = 'completed';
        request.progress = 100;
        request.vTokenReceived = request.amount * 0.98; // 简化计算
        this.updateRequest(request);
        
        this.emitEvent('staking_completed', request);
        this.emitEvent('slpx_completed', request);
      }, 30000); // 30秒后完成

    } catch (error) {
      request.status = 'failed';
      this.updateRequest(request);
      this.emitEvent('slpx_failed', request);
    }
  }

  /**
   * 辅助方法
   */
  private generateRequestId(): string {
    return `slpx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getBridgeProtocol(sourceChain: string): string {
    const protocolMap: { [key: string]: string } = {
      'ethereum': 'snowbridge',
      'moonbeam': 'xcmp',
      'astar': 'xcmp',
      'base': 'hyperbridge',
      'arbitrum': 'hyperbridge',
    };
    return protocolMap[sourceChain] || 'hyperbridge';
  }

  private estimateTotalFee(sourceChain: string, asset: string): number {
    // 简化的费用估算
    const baseFee = 0.001; // 0.1%
    const chainMultiplier = sourceChain === 'ethereum' ? 2 : 1;
    return baseFee * chainMultiplier;
  }

  private estimateTime(sourceChain: string): number {
    const timeMap: { [key: string]: number } = {
      'ethereum': 600000, // 10分钟
      'moonbeam': 120000, // 2分钟
      'astar': 180000,    // 3分钟
      'base': 300000,     // 5分钟
      'arbitrum': 240000, // 4分钟
    };
    return timeMap[sourceChain] || 300000;
  }

  private async getAssetAPY(asset: string): Promise<number> {
    // 模拟 APY 数据
    const apyMap: { [key: string]: number } = {
      'DOT': 12.5,
      'ETH': 8.2,
      'KSM': 15.8,
      'GLMR': 18.3,
    };
    return apyMap[asset] || 10.0;
  }

  private async getStakingPool(asset: string): Promise<StakingPool | null> {
    // 模拟质押池数据
    return {
      asset,
      vTokenAsset: this.SUPPORTED_ASSETS[asset as keyof typeof this.SUPPORTED_ASSETS]?.vTokenSymbol || `v${asset}`,
      totalStaked: 1000000,
      totalVTokens: 980000,
      exchangeRate: 1.02,
      apy: await this.getAssetAPY(asset),
      commission: 0.1,
      isActive: true,
      minStakeAmount: 1,
      maxStakeAmount: 10000,
      unstakingPeriod: 28 * 24 * 60 * 60, // 28天
    };
  }

  private createSLPxSteps(sourceChain: string, asset: string) {
    return [
      {
        id: 'bridge',
        name: '跨链桥接',
        description: `将 ${asset} 从 ${sourceChain} 桥接到 Bifrost`,
        status: 'pending' as const,
        estimatedTime: this.estimateTime(sourceChain),
      },
      {
        id: 'stake',
        name: '执行质押',
        description: `在 Bifrost 上质押 ${asset} 获得 v${asset}`,
        status: 'pending' as const,
        estimatedTime: 30000,
      },
    ];
  }

  private updateRequest(request: SLPxStakingRequest) {
    request.updatedAt = Date.now();
    this.activeRequests.set(request.id, request);
  }

  private updateRequestStep(request: SLPxStakingRequest, stepIndex: number, status: 'pending' | 'active' | 'completed' | 'failed') {
    if (request.steps[stepIndex]) {
      request.steps[stepIndex].status = status;
      if (status === 'completed') {
        request.steps[stepIndex].timestamp = Date.now();
        request.progress = ((stepIndex + 1) / request.steps.length) * 100;
      }
    }
    this.updateRequest(request);
  }

  private emitEvent(event: string, data: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('SLPx event listener error:', error);
        }
      });
    }
  }

  addEventListener(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  removeEventListener(event: string, callback: Function) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }
}

export default new SLPxService();