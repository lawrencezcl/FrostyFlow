import { BridgeTransaction, BridgeRoute, BridgeQuote, BridgeError } from '../types/bridge';

/**
 * Hyperbridge 服务 - 处理多链之间的桥接
 */
class HyperbridgeService {
  private readonly HYPERBRIDGE_API_URL = 'https://api.hyperbridge.network';
  private readonly SUPPORTED_CHAINS = [
    'polkadot', 'kusama', 'ethereum', 'moonbeam', 'moonriver', 
    'astar', 'base', 'arbitrum', 'optimism', 'bsc'
  ];

  /**
   * 获取支持的桥接路由
   */
  async getSupportedRoutes(): Promise<BridgeRoute[]> {
    try {
      const response = await fetch(`${this.HYPERBRIDGE_API_URL}/routes`);
      const data = await response.json();
      
      return data.routes.map((route: any) => ({
        id: route.id,
        sourceChain: route.source_chain,
        targetChain: route.target_chain,
        protocol: 'hyperbridge',
        estimatedTime: route.estimated_time,
        fee: {
          amount: route.fee.amount,
          asset: route.fee.asset
        },
        minAmount: route.min_amount,
        maxAmount: route.max_amount,
        isActive: route.is_active
      }));
    } catch (error) {
      console.error('Failed to fetch Hyperbridge routes:', error);
      return [];
    }
  }

  /**
   * 获取最优桥接路径
   */
  async findOptimalRoute(
    sourceChain: string,
    targetChain: string,
    asset: string,
    amount: number
  ): Promise<BridgeRoute | null> {
    try {
      const routes = await this.getSupportedRoutes();
      const validRoutes = routes.filter(route => 
        route.sourceChain === sourceChain &&
        route.targetChain === targetChain &&
        route.isActive &&
        amount >= route.minAmount &&
        amount <= route.maxAmount
      );

      if (validRoutes.length === 0) {
        return null;
      }

      // 选择费用最低且时间最短的路由
      return validRoutes.reduce((best, current) => {
        const bestScore = best.fee.amount + (best.estimatedTime / 1000);
        const currentScore = current.fee.amount + (current.estimatedTime / 1000);
        return currentScore < bestScore ? current : best;
      });
    } catch (error) {
      console.error('Failed to find optimal route:', error);
      return null;
    }
  }

  /**
   * 获取桥接报价
   */
  async getQuote(
    sourceChain: string,
    targetChain: string,
    asset: string,
    amount: number
  ): Promise<BridgeQuote | null> {
    try {
      const response = await fetch(`${this.HYPERBRIDGE_API_URL}/quote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source_chain: sourceChain,
          target_chain: targetChain,
          asset,
          amount
        })
      });

      if (!response.ok) {
        throw new Error(`Quote request failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        route: {
          id: data.route.id,
          sourceChain: data.route.source_chain,
          targetChain: data.route.target_chain,
          protocol: 'hyperbridge',
          estimatedTime: data.route.estimated_time,
          fee: data.route.fee,
          minAmount: data.route.min_amount,
          maxAmount: data.route.max_amount,
          isActive: true
        },
        inputAmount: amount,
        outputAmount: data.output_amount,
        fee: data.fee,
        priceImpact: data.price_impact,
        estimatedTime: data.estimated_time,
        steps: data.steps
      };
    } catch (error) {
      console.error('Failed to get Hyperbridge quote:', error);
      return null;
    }
  }

  /**
   * 执行跨链桥接
   */
  async executeBridge(
    sourceChain: string,
    targetChain: string,
    asset: string,
    amount: number,
    recipient: string,
    walletAddress: string
  ): Promise<BridgeTransaction> {
    try {
      // 验证参数
      if (!this.SUPPORTED_CHAINS.includes(sourceChain) || !this.SUPPORTED_CHAINS.includes(targetChain)) {
        throw new BridgeError('Unsupported chain', 'UNSUPPORTED_CHAIN');
      }

      if (amount <= 0) {
        throw new BridgeError('Invalid amount', 'INVALID_AMOUNT');
      }

      // 获取最优路由
      const route = await this.findOptimalRoute(sourceChain, targetChain, asset, amount);
      if (!route) {
        throw new BridgeError('No available route', 'NO_ROUTE');
      }

      // 创建桥接交易
      const transactionId = this.generateTransactionId();
      const transaction: BridgeTransaction = {
        id: transactionId,
        txHash: '',
        sourceChain,
        targetChain,
        asset,
        amount,
        recipient,
        status: 'pending',
        progress: 0,
        estimatedTime: route.estimatedTime,
        steps: this.createBridgeSteps(sourceChain, targetChain, route.protocol),
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      // 模拟桥接过程
      this.simulateBridgeProcess(transaction);

      return transaction;
    } catch (error) {
      if (error instanceof BridgeError) {
        throw error;
      }
      throw new BridgeError('Bridge execution failed', 'EXECUTION_FAILED');
    }
  }

  /**
   * 跟踪桥接进度
   */
  async trackBridgeProgress(transactionId: string): Promise<BridgeTransaction | null> {
    try {
      const response = await fetch(`${this.HYPERBRIDGE_API_URL}/transactions/${transactionId}`);
      
      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      
      return {
        id: data.id,
        txHash: data.tx_hash,
        sourceChain: data.source_chain,
        targetChain: data.target_chain,
        asset: data.asset,
        amount: data.amount,
        recipient: data.recipient,
        status: data.status,
        progress: data.progress,
        estimatedTime: data.estimated_time,
        steps: data.steps,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Failed to track bridge progress:', error);
      return null;
    }
  }

  /**
   * 批量桥接（用于复杂的多步骤跨链操作）
   */
  async executeBatchBridge(
    operations: Array<{
      sourceChain: string;
      targetChain: string;
      asset: string;
      amount: number;
      recipient: string;
    }>,
    walletAddress: string
  ): Promise<BridgeTransaction[]> {
    const transactions: BridgeTransaction[] = [];

    for (const operation of operations) {
      try {
        const transaction = await this.executeBridge(
          operation.sourceChain,
          operation.targetChain,
          operation.asset,
          operation.amount,
          operation.recipient,
          walletAddress
        );
        transactions.push(transaction);
      } catch (error) {
        console.error('Batch bridge operation failed:', error);
        // 继续处理其他操作，但记录错误
      }
    }

    return transactions;
  }

  /**
   * 生成交易ID
   */
  private generateTransactionId(): string {
    return `hyperbridge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 创建桥接步骤
   */
  private createBridgeSteps(sourceChain: string, targetChain: string, protocol: string) {
    const steps = [
      {
        id: 'approve',
        name: '授权代币',
        description: `授权 ${protocol} 合约使用代币`,
        status: 'pending' as const,
      },
      {
        id: 'deposit',
        name: '存入资产',
        description: `在 ${sourceChain} 上存入资产`,
        status: 'pending' as const,
      },
      {
        id: 'validate',
        name: '验证交易',
        description: '验证器网络确认交易',
        status: 'pending' as const,
      },
      {
        id: 'relay',
        name: '中继传输',
        description: '跨链消息传输',
        status: 'pending' as const,
      },
      {
        id: 'execute',
        name: '执行交易',
        description: `在 ${targetChain} 上执行交易`,
        status: 'pending' as const,
      },
      {
        id: 'complete',
        name: '完成转账',
        description: '资产转账到目标地址',
        status: 'pending' as const,
      }
    ];

    return steps;
  }

  /**
   * 模拟桥接过程
   */
  private simulateBridgeProcess(transaction: BridgeTransaction) {
    let currentStep = 0;
    const stepInterval = 25000; // 25秒一个步骤

    const updateStep = () => {
      if (currentStep < transaction.steps.length) {
        transaction.steps[currentStep].status = 'completed';
        transaction.steps[currentStep].timestamp = Date.now();
        
        if (currentStep + 1 < transaction.steps.length) {
          transaction.steps[currentStep + 1].status = 'active';
        }

        transaction.progress = ((currentStep + 1) / transaction.steps.length) * 100;
        transaction.updatedAt = Date.now();

        if (currentStep === transaction.steps.length - 1) {
          transaction.status = 'completed';
          transaction.txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
        }

        currentStep++;

        if (currentStep < transaction.steps.length) {
          setTimeout(updateStep, stepInterval);
        }
      }
    };

    // 开始第一个步骤
    transaction.steps[0].status = 'active';
    setTimeout(updateStep, stepInterval);
  }
}

export default new HyperbridgeService();