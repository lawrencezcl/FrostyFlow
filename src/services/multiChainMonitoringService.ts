import { 
  MultiChainAsset, 
  ChainDistribution, 
  PortfolioSummary, 
  ChainInfo, 
  AssetPerformance,
  RealtimePrice,
  MonitoringAlert,
  AssetFilter,
  MonitoringConfig 
} from '../types/monitoring';
import coinGeckoService from './coinGecko';
import polkadotApiService from './polkadotApi';
import bifrostSdkService from './bifrostSdk';

/**
 * 多链资产监控服务
 */
class MultiChainMonitoringService {
  private assets: Map<string, MultiChainAsset> = new Map();
  private chains: Map<string, ChainInfo> = new Map();
  private prices: Map<string, RealtimePrice> = new Map();
  private alerts: MonitoringAlert[] = [];
  private eventListeners: Map<string, Function[]> = new Map();
  private wsConnection: WebSocket | null = null;
  private refreshInterval: NodeJS.Timeout | null = null;

  // 支持的链配置
  private readonly SUPPORTED_CHAINS: ChainInfo[] = [
    {
      id: 'bifrost',
      name: 'Bifrost',
      displayName: 'Bifrost',
      icon: '🌈',
      nativeAsset: 'BNC',
      rpcUrl: 'wss://bifrost-rpc.liebi.com/ws',
      explorerUrl: 'https://bifrost.subscan.io',
      isTestnet: false,
      totalValue: 0,
      assetCount: 0,
      stakingSupported: true,
      bridgeSupported: true,
      status: 'online'
    },
    {
      id: 'polkadot',
      name: 'Polkadot',
      displayName: 'Polkadot',
      icon: '🔴',
      nativeAsset: 'DOT',
      rpcUrl: 'wss://rpc.polkadot.io',
      explorerUrl: 'https://polkadot.subscan.io',
      isTestnet: false,
      totalValue: 0,
      assetCount: 0,
      stakingSupported: true,
      bridgeSupported: true,
      status: 'online'
    },
    {
      id: 'ethereum',
      name: 'Ethereum',
      displayName: 'Ethereum',
      icon: '⚪',
      nativeAsset: 'ETH',
      rpcUrl: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
      explorerUrl: 'https://etherscan.io',
      isTestnet: false,
      totalValue: 0,
      assetCount: 0,
      stakingSupported: true,
      bridgeSupported: true,
      status: 'online'
    },
    {
      id: 'moonbeam',
      name: 'Moonbeam',
      displayName: 'Moonbeam',
      icon: '🌙',
      nativeAsset: 'GLMR',
      rpcUrl: 'https://rpc.api.moonbeam.network',
      explorerUrl: 'https://moonbeam.moonscan.io',
      isTestnet: false,
      totalValue: 0,
      assetCount: 0,
      stakingSupported: true,
      bridgeSupported: true,
      status: 'online'
    }
  ];

  constructor() {
    this.initializeChains();
  }

  /**
   * 初始化链信息
   */
  private initializeChains() {
    this.SUPPORTED_CHAINS.forEach(chain => {
      this.chains.set(chain.id, chain);
    });
  }

  /**
   * 获取用户的多链资产概览
   */
  async getUserAssets(walletAddress: string, filter?: AssetFilter): Promise<MultiChainAsset[]> {
    try {
      const assets: MultiChainAsset[] = [];
      const assetMap = new Map<string, MultiChainAsset>();

      // 获取所有链上的资产
      for (const chain of this.SUPPORTED_CHAINS) {
        try {
          const chainAssets = await this.getChainAssets(chain.id, walletAddress);
          
          chainAssets.forEach(asset => {
            const existing = assetMap.get(asset.symbol);
            if (existing) {
              // 合并同一资产在不同链上的分布
              existing.totalBalance += asset.balance;
              existing.totalValue += asset.value;
              existing.distributions.push({
                chainId: chain.id,
                chainName: chain.displayName,
                chainIcon: chain.icon,
                balance: asset.balance,
                value: asset.value,
                percentage: 0, // 稍后计算
                isStaked: asset.isStaked || false,
                stakingRewards: asset.stakingRewards,
                vTokenBalance: asset.vTokenBalance
              });
            } else {
              // 创建新的多链资产
              assetMap.set(asset.symbol, {
                symbol: asset.symbol,
                name: asset.name,
                totalBalance: asset.balance,
                totalValue: asset.value,
                distributions: [{
                  chainId: chain.id,
                  chainName: chain.displayName,
                  chainIcon: chain.icon,
                  balance: asset.balance,
                  value: asset.value,
                  percentage: 100,
                  isStaked: asset.isStaked || false,
                  stakingRewards: asset.stakingRewards,
                  vTokenBalance: asset.vTokenBalance
                }],
                apy: asset.apy || 0,
                priceChange24h: 0,
                price: asset.price || 0
              });
            }
          });
        } catch (error) {
          console.error(`Failed to get assets from ${chain.id}:`, error);
        }
      }

      // 计算分布百分比
      assetMap.forEach(asset => {
        asset.distributions.forEach(dist => {
          dist.percentage = (dist.value / asset.totalValue) * 100;
        });
      });

      // 应用过滤器
      let filteredAssets = Array.from(assetMap.values());
      if (filter) {
        filteredAssets = this.applyFilter(filteredAssets, filter);
      }

      // 更新价格信息
      await this.updateAssetPrices(filteredAssets);

      return filteredAssets;
    } catch (error) {
      console.error('Failed to get user assets:', error);
      return [];
    }
  }

  /**
   * 获取单个链上的资产
   */
  private async getChainAssets(chainId: string, walletAddress: string): Promise<any[]> {
    const assets: any[] = [];

    try {
      switch (chainId) {
        case 'bifrost':
          // Get assets on Bifrost
          const bncBalance = await bifrostSdkService.getAssetBalance(chainId, 'BNC', walletAddress);
          const vdotBalance = await bifrostSdkService.getAssetBalance(chainId, 'vDOT', walletAddress);
          const vethBalance = await bifrostSdkService.getAssetBalance(chainId, 'vETH', walletAddress);

          if (bncBalance?.data && bncBalance.data > 0) {
            assets.push({
              symbol: 'BNC',
              name: 'Bifrost Native Coin',
              balance: bncBalance.data,
              value: bncBalance.data * (await this.getAssetPrice('BNC')),
              isStaked: false,
              price: await this.getAssetPrice('BNC')
            });
          }

          if (vdotBalance?.data && vdotBalance.data > 0) {
            assets.push({
              symbol: 'vDOT',
              name: 'Voucher DOT',
              balance: vdotBalance.data,
              value: vdotBalance.data * (await this.getAssetPrice('DOT')) * 1.02, // vToken premium
              isStaked: true,
              vTokenBalance: vdotBalance.data,
              apy: 12.5,
              price: await this.getAssetPrice('DOT')
            });
          }

          if (vethBalance?.data && vethBalance.data > 0) {
            assets.push({
              symbol: 'vETH',
              name: 'Voucher ETH',
              balance: vethBalance.data,
              value: vethBalance.data * (await this.getAssetPrice('ETH')) * 1.02,
              isStaked: true,
              vTokenBalance: vethBalance.data,
              apy: 8.2,
              price: await this.getAssetPrice('ETH')
            });
          }
          break;

        case 'polkadot':
          const dotBalance = await polkadotApiService.getAccountBalance(walletAddress);
          if (dotBalance?.data && dotBalance.data > 0) {
            assets.push({
              symbol: 'DOT',
              name: 'Polkadot',
              balance: dotBalance.data,
              value: dotBalance.data * (await this.getAssetPrice('DOT')),
              isStaked: false,
              price: await this.getAssetPrice('DOT')
            });
          }
          break;

        case 'ethereum':
          // 模拟以太坊资产获取
          const ethBalance = 1.5; // 模拟数据
          if (ethBalance > 0) {
            assets.push({
              symbol: 'ETH',
              name: 'Ethereum',
              balance: ethBalance,
              value: ethBalance * (await this.getAssetPrice('ETH')),
              isStaked: false,
              price: await this.getAssetPrice('ETH')
            });
          }
          break;

        case 'moonbeam':
          // 模拟 Moonbeam 资产获取
          const glmrBalance = 100; // 模拟数据
          if (glmrBalance > 0) {
            assets.push({
              symbol: 'GLMR',
              name: 'Moonbeam',
              balance: glmrBalance,
              value: glmrBalance * (await this.getAssetPrice('GLMR')),
              isStaked: false,
              price: await this.getAssetPrice('GLMR')
            });
          }
          break;
      }
    } catch (error) {
      console.error(`Error getting assets from ${chainId}:`, error);
    }

    return assets;
  }

  /**
   * 获取投资组合摘要
   */
  async getPortfolioSummary(walletAddress: string): Promise<PortfolioSummary> {
    try {
      const assets = await this.getUserAssets(walletAddress);
      
      const totalValue = assets.reduce((sum, asset) => sum + asset.totalValue, 0);
      const totalStaked = assets.reduce((sum, asset) => {
        return sum + asset.distributions.reduce((chainSum, dist) => {
          return chainSum + (dist.isStaked ? dist.value : 0);
        }, 0);
      }, 0);

      const totalRewards = assets.reduce((sum, asset) => {
        return sum + asset.distributions.reduce((chainSum, dist) => {
          return chainSum + (dist.stakingRewards || 0);
        }, 0);
      }, 0);

      const uniqueChains = new Set(assets.flatMap(asset => 
        asset.distributions.map(dist => dist.chainId)
      ));

      return {
        totalValue,
        totalStaked,
        totalRewards,
        totalAssets: assets.length,
        totalChains: uniqueChains.size,
        performanceData: await this.getPerformanceData(walletAddress)
      };
    } catch (error) {
      console.error('Failed to get portfolio summary:', error);
      return {
        totalValue: 0,
        totalStaked: 0,
        totalRewards: 0,
        totalAssets: 0,
        totalChains: 0,
        performanceData: []
      };
    }
  }

  /**
   * 获取资产价格
   */
  private async getAssetPrice(symbol: string): Promise<number> {
    try {
      const cached = this.prices.get(symbol);
      if (cached && Date.now() - cached.lastUpdated < 60000) { // 1 minute cache
        return cached.price;
      }

      const priceResponse = await coinGeckoService.getAssetUsdPrice(symbol.toLowerCase());
      const price = priceResponse.data?.price || 0;
      
      this.prices.set(symbol, {
        symbol,
        price,
        change24h: priceResponse.data?.change24h || 0,
        changePercent24h: 0,
        volume24h: 0,
        marketCap: 0,
        lastUpdated: Date.now()
      });

      return price;
    } catch (error) {
      console.error(`Failed to get price for ${symbol}:`, error);
      return 0;
    }
  }

  /**
   * Update asset prices
   */
  private async updateAssetPrices(assets: MultiChainAsset[]) {
    const symbols = assets.map(asset => asset.symbol);
    
    try {
      const pricesResponse = await coinGeckoService.getMultipleAssetUsdPrices(symbols.map(s => s.toLowerCase()));
      
      assets.forEach(asset => {
        const priceData = pricesResponse.data?.[asset.symbol.toLowerCase()];
        if (priceData) {
          asset.price = priceData.price;
          asset.priceChange24h = priceData.change24h;
        }
      });
    } catch (error) {
      console.error('Failed to update asset prices:', error);
    }
  }

  /**
   * 应用过滤器
   */
  private applyFilter(assets: MultiChainAsset[], filter: AssetFilter): MultiChainAsset[] {
    let filtered = assets;

    // 按链过滤
    if (filter.chains.length > 0) {
      filtered = filtered.filter(asset => 
        asset.distributions.some(dist => filter.chains.includes(dist.chainId))
      );
    }

    // 按资产过滤
    if (filter.assets.length > 0) {
      filtered = filtered.filter(asset => filter.assets.includes(asset.symbol));
    }

    // 按价值范围过滤
    filtered = filtered.filter(asset => 
      asset.totalValue >= filter.minValue && asset.totalValue <= filter.maxValue
    );

    // 只显示质押资产
    if (filter.showStakedOnly) {
      filtered = filtered.filter(asset => 
        asset.distributions.some(dist => dist.isStaked)
      );
    }

    // 显示零余额
    if (!filter.showZeroBalance) {
      filtered = filtered.filter(asset => asset.totalBalance > 0);
    }

    // 排序
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (filter.sortBy) {
        case 'value':
          aValue = a.totalValue;
          bValue = b.totalValue;
          break;
        case 'balance':
          aValue = a.totalBalance;
          bValue = b.totalBalance;
          break;
        case 'change':
          aValue = a.priceChange24h;
          bValue = b.priceChange24h;
          break;
        case 'apy':
          aValue = a.apy;
          bValue = b.apy;
          break;
        default:
          aValue = a.totalValue;
          bValue = b.totalValue;
      }

      return filter.sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });
    return filtered;
  }

  /**
   * 获取性能数据
   */
  private async getPerformanceData(walletAddress: string): Promise<any[]> {
    // 模拟性能数据
    return [
      { period: '24h', value: 10000, change: 150, changePercent: 1.5 },
      { period: '7d', value: 10000, change: 800, changePercent: 8.7 },
      { period: '30d', value: 10000, change: 1200, changePercent: 13.6 },
      { period: '1y', value: 10000, change: 3500, changePercent: 54.2 }
    ];
  }

  /**
   * 开始实时监控
   */
  startRealtimeMonitoring(config: MonitoringConfig) {
    // 启动定时刷新
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    this.refreshInterval = setInterval(() => {
      this.emitEvent('data_refresh', { timestamp: Date.now() });
    }, config.refreshInterval);

    // 启动 WebSocket 连接（模拟）
    this.connectWebSocket();
  }

  /**
   * 停止实时监控
   */
  stopRealtimeMonitoring() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }

    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
  }

  /**
   * 连接 WebSocket
   */
  private connectWebSocket() {
    // 模拟 WebSocket 连接
    // 在实际实现中，这里会连接到真实的 WebSocket 服务
    console.log('WebSocket monitoring started');
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
          console.error('Monitoring event listener error:', error);
        }
      });
    }
  }

  /**
   * 获取支持的链信息
   */
  getSupportedChains(): ChainInfo[] {
    return Array.from(this.chains.values());
  }

  /**
   * 获取链状态
   */
  async getChainStatus(chainId: string): Promise<ChainInfo | null> {
    return this.chains.get(chainId) || null;
  }
}

export default new MultiChainMonitoringService();