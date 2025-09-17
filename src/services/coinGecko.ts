import { ApiResponse } from '../types';

/**
 * CoinGecko API服务
 * 用于获取加密货币价格和市场数据
 */
class CoinGeckoService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存
  private readonly BASE_URL = 'https://api.coingecko.com/api/v3';

  /**
   * 获取错误信息
   */
  private getErrorMessage(status?: number): string {
    if (status === 429) {
      return '请求过于频繁，请1分钟后重试';
    }
    if (status === 401) {
      return 'API密钥无效';
    }
    return '获取价格数据失败，请重试';
  }

  /**
   * 检查缓存是否有效
   */
  private isCacheValid(cacheKey: string): boolean {
    const cached = this.cache.get(cacheKey);
    if (!cached) return false;
    
    const now = Date.now();
    return (now - cached.timestamp) < this.CACHE_DURATION;
  }

  /**
   * 执行HTTP请求
   */
  private async fetchData(url: string): Promise<any> {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP错误: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API请求失败:', error);
      throw error;
    }
  }

  /**
   * 获取资产价格
   * @param assetIds - 资产ID数组 (如 ['polkadot', 'kusama'])
   * @param vsCurrencies - 对比货币数组 (如 ['usd', 'cny'])
   */
  async getAssetPrice(
    assetIds: string[],
    vsCurrencies: string[] = ['usd'],
  ): Promise<ApiResponse<Record<string, Record<string, number>>>> {
    try {
      const cacheKey = `prices-${assetIds.join(',')}-${vsCurrencies.join(',')}`;
      
      // 检查缓存
      if (this.isCacheValid(cacheKey)) {
        const cached = this.cache.get(cacheKey)!;
        return {
          success: true,
          data: cached.data,
          message: '从缓存获取价格数据',
        };
      }

      const url = `${this.BASE_URL}/simple/price?ids=${assetIds.join(',')}&vs_currencies=${vsCurrencies.join(',')}&include_24hr_change=true`;
      const response = await this.fetchData(url);

      // 更新缓存
      this.cache.set(cacheKey, {
        data: response,
        timestamp: Date.now(),
      });

      return {
        success: true,
        data: response,
        message: '成功获取价格数据',
      };
    } catch (error: any) {
      console.error('获取资产价格失败:', error);
      return {
        success: false,
        error: '获取价格失败',
        message: error.message || '未知错误',
      };
    }
  }

  /**
   * 获取具体资产的USD价格
   * @param assetId - 资产ID (如 'polkadot')
   */
  async getAssetUsdPrice(assetId: string): Promise<ApiResponse<{ price: number; change24h: number }>> {
    try {
      const result = await this.getAssetPrice([assetId], ['usd']);
      
      if (!result.success || !result.data) {
        return {
          success: false,
          error: '获取价格失败',
          message: result.message || '数据为空',
        };
      }

      const assetData = result.data[assetId];
      if (!assetData) {
        return {
          success: false,
          error: '资产不存在',
          message: `未找到资产 ${assetId} 的价格数据`,
        };
      }

      return {
        success: true,
        data: {
          price: assetData.usd || 0,
          change24h: assetData.usd_24h_change || 0,
        },
        message: '成功获取USD价格',
      };
    } catch (error: any) {
      console.error('获取USD价格失败:', error);
      return {
        success: false,
        error: '获取USD价格失败',
        message: error.message || '未知错误',
      };
    }
  }

  /**
   * 获取多个资产的USD价格
   * @param assetIds - 资产ID数组
   */
  async getMultipleAssetUsdPrices(
    assetIds: string[],
  ): Promise<ApiResponse<Record<string, { price: number; change24h: number }>>> {
    try {
      const result = await this.getAssetPrice(assetIds, ['usd']);
      
      if (!result.success || !result.data) {
        return {
          success: false,
          error: '获取价格失败',
          message: result.message || '数据为空',
        };
      }

      const prices: Record<string, { price: number; change24h: number }> = {};
      
      assetIds.forEach((assetId) => {
        const assetData = result.data![assetId];
        if (assetData) {
          prices[assetId] = {
            price: assetData.usd || 0,
            change24h: assetData.usd_24h_change || 0,
          };
        }
      });

      return {
        success: true,
        data: prices,
        message: '成功获取多个资产价格',
      };
    } catch (error: any) {
      console.error('获取多个资产价格失败:', error);
      return {
        success: false,
        error: '获取多个资产价格失败',
        message: error.message || '未知错误',
      };
    }
  }

  /**
   * 清除价格缓存
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * 获取支持的资产ID映射
   * DOT -> polkadot, KSM -> kusama, etc.
   */
  getAssetIdMapping(): Record<string, string> {
    return {
      DOT: 'polkadot',
      KSM: 'kusama',
      GLMR: 'moonbeam',
      vDOT: 'polkadot', // 流动性质押代币使用基础资产的价格
      vKSM: 'kusama',
      vGLMR: 'moonbeam',
    };
  }

  /**
   * 将资产符号转换为CoinGecko ID
   */
  getAssetCoinGeckoId(assetSymbol: string): string {
    const mapping = this.getAssetIdMapping();
    return mapping[assetSymbol] || assetSymbol.toLowerCase();
  }
}

// 创建单例实例
export const coinGeckoService = new CoinGeckoService();
export default coinGeckoService;