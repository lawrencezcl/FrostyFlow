import { coinGeckoService } from './coinGecko';
import { store } from '../redux/store';

export interface PriceUpdateConfig {
  enabled: boolean;
  interval: number; // 更新间隔（毫秒）
  retryAttempts: number;
  retryDelay: number; // 重试延迟（毫秒）
}

export class PriceUpdateService {
  private intervalId: NodeJS.Timeout | null = null;
  private config: PriceUpdateConfig;
  private retryCount = 0;
  private isRunning = false;

  constructor(config: PriceUpdateConfig) {
    this.config = config;
  }

  /**
   * 启动价格更新服务
   */
  start(): void {
    if (this.isRunning) {
      console.warn('Price update service is already running');
      return;
    }

    if (!this.config.enabled) {
      console.log('Price update service is disabled');
      return;
    }

    this.isRunning = true;
    this.retryCount = 0;
    
    // 立即执行一次更新
    this.updatePrices();
    
    // 设置定时更新
    this.intervalId = setInterval(() => {
      this.updatePrices();
    }, this.config.interval);
    
    console.log(`Price update service started with ${this.config.interval}ms interval`);
  }

  /**
   * 停止价格更新服务
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.isRunning = false;
    console.log('Price update service stopped');
  }

  /**
   * 更新价格
   */
  private async updatePrices(): Promise<void> {
    try {
      const state = store.getState();
      const { assets } = state.asset;
      
      if (assets.length === 0) {
        return;
      }

      // 获取所有资产符号
      const assetSymbols = [...new Set(assets.map(asset => asset.assetId))];
      
      // 获取价格数据
      const result = await coinGeckoService.getMultipleAssetUsdPrices(
        assetSymbols.map(symbol => coinGeckoService.getAssetCoinGeckoId(symbol))
      );

      if (result.success && result.data) {
        // 转换价格数据格式
        const priceUpdates = Object.entries(result.data).map(([coinGeckoId, priceInfo]) => {
          // 将CoinGecko ID转换回资产符号
          const mapping = coinGeckoService.getAssetIdMapping();
          const assetSymbol = Object.entries(mapping).find(([_, id]) => id === coinGeckoId)?.[0] || coinGeckoId;
          
          return {
            assetId: assetSymbol,
            price: priceInfo.price,
            change24h: priceInfo.change24h,
          };
        });

        // 更新Redux状态
        store.dispatch({
          type: 'asset/updateAssetPricesAndChanges',
          payload: priceUpdates,
        });

        this.retryCount = 0; // 重置重试计数
        console.log('Prices updated successfully');
      } else {
        throw new Error(result.error || 'Failed to fetch prices');
      }
    } catch (error: any) {
      console.error('Failed to update prices:', error);
      
      // 重试逻辑
      if (this.retryCount < this.config.retryAttempts) {
        this.retryCount++;
        console.log(`Retrying price update (${this.retryCount}/${this.config.retryAttempts})...`);
        
        setTimeout(() => {
          this.updatePrices();
        }, this.config.retryDelay);
      } else {
        console.error('Max retry attempts reached for price update');
      }
    }
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<PriceUpdateConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // 如果正在运行且间隔时间改变，重启服务
    if (this.isRunning && newConfig.interval && newConfig.interval !== this.config.interval) {
      this.stop();
      this.start();
    }
  }

  /**
   * 检查服务状态
   */
  getStatus(): { running: boolean; config: PriceUpdateConfig; retryCount: number } {
    return {
      running: this.isRunning,
      config: this.config,
      retryCount: this.retryCount,
    };
  }

  /**
   * 手动触发价格更新
   */
  async manualUpdate(): Promise<void> {
    console.log('Manual price update triggered');
    await this.updatePrices();
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    coinGeckoService.clearCache();
    console.log('Price cache cleared');
  }
}

// 创建全局实例
export const priceUpdateService = new PriceUpdateService({
  enabled: true,
  interval: 60000, // 1分钟
  retryAttempts: 3,
  retryDelay: 5000,
});

export default priceUpdateService;