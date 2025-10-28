import { BridgeTransaction, BridgeRoute, BridgeQuote, BridgeError, SupportedChain } from '../types/bridge';
import snowbridgeService from './snowbridgeService';
import hyperbridgeService from './hyperbridgeService';

/**
 * 跨链桥接管理服务 - 统一管理所有桥接协议
 */
class CrossChainBridgeService {
  private transactions: Map<string, BridgeTransaction> = new Map();
  private eventListeners: Map<string, Function[]> = new Map();

  /**
   * 获取所有支持的链
   */
  async getSupportedChains(): Promise<SupportedChain[]> {
    return [
      {
        id: 'polkadot',
        name: 'Polkadot',
        displayName: 'Polkadot',
        nativeAsset: 'DOT',
        rpcUrl: 'wss://rpc.polkadot.io',
        explorerUrl: 'https://polkadot.subscan.io',
        isTestnet: false,
        bridgeProtocols: ['snowbridge', 'hyperbridge'],
        supportedAssets: ['DOT', 'vDOT']
      },
      {
        id: 'ethereum',
        name: 'Ethereum',
        displayName: 'Ethereum',
        nativeAsset: 'ETH',
        rpcUrl: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
        explorerUrl: 'https://etherscan.io',
        isTestnet: false,
        bridgeProtocols: ['snowbridge', 'hyperbridge'],
        supportedAssets: ['ETH', 'USDC', 'USDT']
      },
      {
        id: 'moonbeam',
        name: 'Moonbeam',
        displayName: 'Moonbeam',
        nativeAsset: 'GLMR',
        rpcUrl: 'https://rpc.api.moonbeam.network',
        explorerUrl: 'https://moonbeam.moonscan.io',
        isTestnet: false,
        bridgeProtocols: ['hyperbridge'],
        supportedAssets: ['GLMR', 'DOT', 'ETH']
      },
      {
        id: 'base',
        name: 'Base',
        displayName: 'Base',
        nativeAsset: 'ETH',
        rpcUrl: 'https://mainnet.base.org',
        explorerUrl: 'https://basescan.org',
        isTestnet: false,
        bridgeProtocols: ['hyperbridge'],
        supportedAssets: ['ETH', 'USDC']
      },
      {
        id: 'arbitrum',
        name: 'Arbitrum',
        displayName: 'Arbitrum One',
        nativeAsset: 'ETH',
        rpcUrl: 'https://arb1.arbitrum.io/rpc',
        explorerUrl: 'https://arbiscan.io',
        isTestnet: false,
        bridgeProtocols: ['hyperbridge'],
        supportedAssets: ['ETH', 'USDC', 'ARB']
      }
    ];
  }

  /**
   * 获取所有可用的桥接路由
   */
  async getAllRoutes(): Promise<BridgeRoute[]> {
    try {
      const [snowbridgeRoutes, hyperbridgeRoutes] = await Promise.all([
        snowbridgeService.getSupportedRoutes(),
        hyperbridgeService.getSupportedRoutes()
      ]);

      return [...snowbridgeRoutes, ...hyperbridgeRoutes];
    } catch (error) {
      console.error('Failed to get all routes:', error);
      return [];
    }
  }

  /**
   * 获取最佳桥接报价
   */
  async getBestQuote(
    sourceChain: string,
    targetChain: string,
    asset: string,
    amount: number
  ): Promise<BridgeQuote | null> {
    try {
      const [snowbridgeQuote, hyperbridgeQuote] = await Promise.all([
        snowbridgeService.getQuote(sourceChain, targetChain, asset, amount),
        hyperbridgeService.getQuote(sourceChain, targetChain, asset, amount)
      ]);

      const quotes = [snowbridgeQuote, hyperbridgeQuote].filter(Boolean) as BridgeQuote[];
      
      if (quotes.length === 0) {
        return null;
      }

      // 选择输出金额最高且费用最低的报价
      return quotes.reduce((best, current) => {
        const bestScore = best.outputAmount - best.fee;
        const currentScore = current.outputAmount - current.fee;
        return currentScore > bestScore ? current : best;
      });
    } catch (error) {
      console.error('Failed to get best quote:', error);
      return null;
    }
  }

  /**
   * 执行桥接交易
   */
  async executeBridge(
    sourceChain: string,
    targetChain: string,
    asset: string,
    amount: number,
    recipient: string,
    walletAddress: string,
    preferredProtocol?: 'snowbridge' | 'hyperbridge'
  ): Promise<BridgeTransaction> {
    try {
      let transaction: BridgeTransaction;

      if (preferredProtocol === 'snowbridge') {
        transaction = await snowbridgeService.executeBridge(
          sourceChain, targetChain, asset, amount, recipient, walletAddress
        );
      } else if (preferredProtocol === 'hyperbridge') {
        transaction = await hyperbridgeService.executeBridge(
          sourceChain, targetChain, asset, amount, recipient, walletAddress
        );
      } else {
        // 自动选择最佳协议
        const quote = await this.getBestQuote(sourceChain, targetChain, asset, amount);
        if (!quote) {
          throw new BridgeError('No available bridge route', 'NO_ROUTE');
        }

        if (quote.route.protocol === 'snowbridge') {
          transaction = await snowbridgeService.executeBridge(
            sourceChain, targetChain, asset, amount, recipient, walletAddress
          );
        } else {
          transaction = await hyperbridgeService.executeBridge(
            sourceChain, targetChain, asset, amount, recipient, walletAddress
          );
        }
      }

      // 存储交易记录
      this.transactions.set(transaction.id, transaction);
      
      // 触发事件
      this.emitEvent('bridge_initiated', transaction);

      // 开始监控交易状态
      this.monitorTransaction(transaction.id);

      return transaction;
    } catch (error) {
      if (error instanceof BridgeError) {
        throw error;
      }
      throw new BridgeError('Bridge execution failed', 'EXECUTION_FAILED');
    }
  }

  /**
   * 获取交易状态
   */
  async getTransactionStatus(transactionId: string): Promise<BridgeTransaction | null> {
    // 先从本地缓存获取
    const localTransaction = this.transactions.get(transactionId);
    if (localTransaction) {
      return localTransaction;
    }

    // 从各个服务查询
    try {
      const [snowbridgeResult, hyperbridgeResult] = await Promise.all([
        snowbridgeService.trackBridgeProgress(transactionId),
        hyperbridgeService.trackBridgeProgress(transactionId)
      ]);

      const result = snowbridgeResult || hyperbridgeResult;
      if (result) {
        this.transactions.set(transactionId, result);
      }

      return result;
    } catch (error) {
      console.error('Failed to get transaction status:', error);
      return null;
    }
  }

  /**
   * 获取用户的所有桥接交易
   */
  getUserTransactions(walletAddress: string): BridgeTransaction[] {
    return Array.from(this.transactions.values()).filter(
      tx => tx.recipient === walletAddress
    );
  }

  /**
   * 监控交易状态
   */
  private async monitorTransaction(transactionId: string) {
    const checkStatus = async () => {
      const transaction = await this.getTransactionStatus(transactionId);
      if (!transaction) return;

      const previousTransaction = this.transactions.get(transactionId);
      
      // 检查状态是否有变化
      if (!previousTransaction || transaction.status !== previousTransaction.status) {
        this.transactions.set(transactionId, transaction);
        this.emitEvent('status_update', transaction);
      }

      // 如果交易未完成，继续监控
      if (transaction.status === 'pending' || transaction.status === 'processing') {
        setTimeout(checkStatus, 10000); // 10秒后再次检查
      } else {
        // 交易完成或失败
        this.emitEvent(
          transaction.status === 'completed' ? 'bridge_completed' : 'bridge_failed',
          transaction
        );
      }
    };

    // 开始监控
    setTimeout(checkStatus, 5000); // 5秒后开始第一次检查
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
          console.error('Event listener error:', error);
        }
      });
    }
  }

  /**
   * 清理已完成的交易记录（避免内存泄漏）
   */
  cleanupCompletedTransactions() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    for (const [id, transaction] of this.transactions.entries()) {
      if (
        (transaction.status === 'completed' || transaction.status === 'failed') &&
        now - transaction.updatedAt > oneHour
      ) {
        this.transactions.delete(id);
      }
    }
  }
}

export default new CrossChainBridgeService();