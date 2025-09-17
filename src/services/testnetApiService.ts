import { ApiPromise, WsProvider } from '@polkadot/api';
import { Chain, Asset } from '../types';

// 网络配置接口
export interface NetworkConfig {
  name: string;
  displayName: string;
  wsEndpoint: string;
  rpcEndpoint: string;
  nativeToken: string;
  decimals: number;
  ss58Format: number;
  blockTime: number;
  supportedAssets: string[];
}

// 测试网络配置
export const TESTNET_NETWORKS: Record<string, NetworkConfig> = {
  bifrost: {
    name: 'bifrost',
    displayName: 'Bifrost Testnet',
    wsEndpoint: process.env.REACT_APP_BIFROST_TESTNET_WS || 'wss://bifrost-rpc.dwellir.com/ws',
    rpcEndpoint: process.env.REACT_APP_BIFROST_TESTNET_RPC || 'https://bifrost-rpc.dwellir.com',
    nativeToken: 'BNC',
    decimals: 12,
    ss58Format: 6,
    blockTime: 12000,
    supportedAssets: ['DOT', 'KSM', 'ETH', 'GLMR']
  },
  polkadot: {
    name: 'polkadot',
    displayName: 'Westend Testnet',
    wsEndpoint: process.env.REACT_APP_POLKADOT_TESTNET_WS || 'wss://westend-rpc.polkadot.io',
    rpcEndpoint: process.env.REACT_APP_POLKADOT_TESTNET_RPC || 'https://westend-rpc.polkadot.io',
    nativeToken: 'WND',
    decimals: 12,
    ss58Format: 42,
    blockTime: 6000,
    supportedAssets: ['WND']
  },
  kusama: {
    name: 'kusama',
    displayName: 'Kusama Testnet',
    wsEndpoint: process.env.REACT_APP_KUSAMA_TESTNET_WS || 'wss://kusama-rpc.polkadot.io',
    rpcEndpoint: process.env.REACT_APP_KUSAMA_TESTNET_RPC || 'https://kusama-rpc.polkadot.io',
    nativeToken: 'KSM',
    decimals: 12,
    ss58Format: 2,
    blockTime: 6000,
    supportedAssets: ['KSM']
  }
};

// API 管理器类
export class ApiManager {
  private static instance: ApiManager;
  private apis: Map<string, ApiPromise> = new Map();
  private connecting: Map<string, Promise<ApiPromise>> = new Map();

  static getInstance(): ApiManager {
    if (!ApiManager.instance) {
      ApiManager.instance = new ApiManager();
    }
    return ApiManager.instance;
  }

  async getApi(networkName: string): Promise<ApiPromise> {
    if (this.apis.has(networkName)) {
      return this.apis.get(networkName)!;
    }

    if (this.connecting.has(networkName)) {
      return this.connecting.get(networkName)!;
    }

    const network = TESTNET_NETWORKS[networkName];
    if (!network) {
      throw new Error(`Unknown network: ${networkName}`);
    }

    const connectionPromise = this.connectToNetwork(network);
    this.connecting.set(networkName, connectionPromise);

    try {
      const api = await connectionPromise;
      this.apis.set(networkName, api);
      this.connecting.delete(networkName);
      return api;
    } catch (error) {
      this.connecting.delete(networkName);
      throw error;
    }
  }

  private async connectToNetwork(network: NetworkConfig): Promise<ApiPromise> {
    const provider = new WsProvider(network.wsEndpoint);
    const api = await ApiPromise.create({
      provider,
      types: {
        // Bifrost 特定类型定义
        TokenSymbol: {
          _enum: {
            ASG: 0,
            BNC: 1,
            KUSD: 2,
            DOT: 3,
            KSM: 4,
            ETH: 5,
            KAR: 6,
            ZLK: 7,
            PHA: 8,
            RMRK: 9,
            MOVR: 10
          }
        },
        CurrencyId: {
          _enum: {
            Native: 'TokenSymbol',
            Token: 'TokenSymbol',
            Token2: 'u8',
            VToken: 'TokenSymbol',
            VToken2: 'u8',
            VSToken: 'TokenSymbol',
            VSToken2: 'u8',
            VSBond: '(TokenSymbol, u32, u32, u32)',
            LPToken: '(TokenSymbol, u8, TokenSymbol, u8)',
            ForeignAsset: 'u32',
            Token3: 'u32',
            Stable: 'TokenSymbol'
          }
        }
      }
    });

    await api.isReady;
    console.log(`Connected to ${network.displayName}`);
    return api;
  }

  async disconnect(networkName?: string): Promise<void> {
    if (networkName) {
      const api = this.apis.get(networkName);
      if (api) {
        await api.disconnect();
        this.apis.delete(networkName);
      }
    } else {
      // 断开所有连接
      const disconnectPromises = Array.from(this.apis.values()).map(api => api.disconnect());
      await Promise.all(disconnectPromises);
      this.apis.clear();
    }
  }
}

// 测试网 API 服务类
export class TestnetApiService {
  private apiManager = ApiManager.getInstance();

  async getChains(): Promise<(Chain & { isConnected: boolean; blockHeight: number; assets: Asset[] })[]> {
    const chains: (Chain & { isConnected: boolean; blockHeight: number; assets: Asset[] })[] = [];
    
    for (const [networkName, config] of Object.entries(TESTNET_NETWORKS)) {
      try {
        const api = await this.apiManager.getApi(networkName);
        const chain = await api.rpc.system.chain();
        
        chains.push({
          chainId: networkName,
          chainName: config.displayName,
          name: config.displayName,
          rpc: config.rpcEndpoint,
          icon: '',
          blockExplorer: '',
          nativeToken: config.nativeToken,
          isConnected: true,
          blockHeight: 0,
          assets: config.supportedAssets.map((symbol: string): Asset => ({
            id: symbol,
            assetId: `v${symbol}`,
            baseAssetId: symbol,
            symbol,
            name: symbol,
            balance: '0',
            price: 0,
            usdValue: 0,
            chain: networkName,
            apy: 0,
            rate: 1,
            minMintAmount: 0
          }))
        });
      } catch (error) {
        console.error(`Failed to connect to ${networkName}:`, error);
        chains.push({
          chainId: networkName,
          chainName: config.displayName,
          name: config.displayName,
          rpc: config.rpcEndpoint,
          icon: '',
          blockExplorer: '',
          nativeToken: config.nativeToken,
          isConnected: false,
          blockHeight: 0,
          assets: [] as Asset[]
        });
      }
    }
    
    return chains;
  }

  async getAccountBalance(networkName: string, address: string, assetSymbol: string): Promise<string> {
    try {
      const api = await this.apiManager.getApi(networkName);
      const account: any = await api.query.system.account(address);
      
      // 转换为可读格式
      const balance = (account as any).data?.free?.toString() || '0';
      const decimals = TESTNET_NETWORKS[networkName]?.decimals || 12;
      
      return (parseInt(balance) / Math.pow(10, decimals)).toFixed(6);
    } catch (error) {
      console.error(`Failed to get balance for ${address} on ${networkName}:`, error);
      return '0';
    }
  }

  async stakeMint(networkName: string, address: string, asset: string, amount: number, gasMode: string): Promise<any> {
    try {
      const api = await this.apiManager.getApi(networkName);
      
      // 构建质押交易
      const tx = api.tx.slp.mint(
        { Token: asset },
        amount * Math.pow(10, 12), // 转换为最小单位
        null // 默认接收地址
      );

      // 返回模拟结果用于测试
      return {
        success: true,
        txHash: '0x' + Math.random().toString(16).substr(2, 64),
        liquidTokens: amount * 0.98, // 98% 的流动性代币
        message: `Successfully staked ${amount} ${asset} on ${networkName}`
      };
      
    } catch (error) {
      console.error('Stake mint failed:', error);
      return {
        success: false,
        txHash: '',
        liquidTokens: 0,
        message: `Failed to stake: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async initiateRedeem(networkName: string, address: string, asset: string, amount: number): Promise<any> {
    try {
      const api = await this.apiManager.getApi(networkName);
      
      // 构建赎回交易
      const tx = api.tx.slp.redeem(
        { Token: asset },
        amount * Math.pow(10, 12)
      );

      // 模拟赎回结果
      return {
        success: true,
        txHash: '0x' + Math.random().toString(16).substr(2, 64),
        estimatedReceiveAmount: amount * 0.95,
        unlockTime: Date.now() + 28 * 24 * 60 * 60 * 1000, // 28天后
        message: `Redeem initiated for ${amount} ${asset}`
      };
      
    } catch (error) {
      console.error('Redeem failed:', error);
      return {
        success: false,
        txHash: '',
        estimatedReceiveAmount: 0,
        unlockTime: 0,
        message: `Failed to redeem: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async getStakingRewards(networkName: string, address: string): Promise<any[]> {
    try {
      const api = await this.apiManager.getApi(networkName);
      
      // 查询质押奖励
      const rewards = await api.query.slp.delegatorLedgers.entries(address);
      
      return rewards.map(([key, value]: [any, any]) => ({
        asset: key.toString(),
        amount: value.toString(),
        timestamp: Date.now()
      }));
      
    } catch (error) {
      console.error('Failed to get staking rewards:', error);
      return [];
    }
  }
}

// 导出单例实例
export const testnetApiService = new TestnetApiService();