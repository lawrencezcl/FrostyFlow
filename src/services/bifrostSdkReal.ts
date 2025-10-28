import { ApiPromise, WsProvider } from '@polkadot/api';
import { ApiResponse, EstimateMintResponse, ApyResponse } from '../types';

/**
 * Real Bifrost SDK适配层
 * 连接到真实测试网络进行流动性质押操作
 */
class BifrostSdkRealService {
  private api: ApiPromise | null = null;
  private isConnected: boolean = false;

  constructor() {
    this.initializeConnection();
  }

  /**
   * 初始化与Bifrost测试网的连接
   */
  private async initializeConnection(): Promise<void> {
    try {
      const wsEndpoint = process.env.REACT_APP_BIFROST_TESTNET_WS || 'wss://rpc.testnet.bifrost-para.liebi.com/ws';

      const provider = new WsProvider(wsEndpoint);
      this.api = await ApiPromise.create({
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
              MOVR: 10,
              vDOT: 11,
              vKSM: 12,
              vETH: 13,
              vGLMR: 14
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

      await this.api.isReady;
      this.isConnected = true;
      console.log('✅ Connected to Bifrost testnet successfully');
    } catch (error) {
      console.error('❌ Failed to connect to Bifrost testnet:', error);
      this.isConnected = false;
    }
  }

  /**
   * 等待API连接就绪
   */
  private async waitForConnection(): Promise<boolean> {
    if (this.isConnected && this.api) {
      return true;
    }

    // 等待连接初始化
    let attempts = 0;
    while (!this.isConnected && attempts < 10) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    return this.isConnected;
  }

  /**
   * 估算铸造流动性质押代币的数量 (真实API调用)
   */
  async estimateMintAmount(
    chainId: string,
    assetId: string,
    baseAmount: number,
  ): Promise<ApiResponse<EstimateMintResponse>> {
    try {
      const connected = await this.waitForConnection();
      if (!connected || !this.api) {
        throw new Error('未连接到Bifrost网络');
      }

      // 查询当前汇率和流动性池信息
      const poolInfo = await this.api.query.vTokenMinting.vTokenMintingLedger({ Token: assetId });

      // 查询当前质押率
      const currentRate = await this.api.query.vTokenMinting.vTokenExchangeRate({ Token: assetId });

      // 计算预计获得的流动性质押代币数量
      const rate = Number(currentRate.toString()) / Math.pow(10, 12); // 转换为正常数值
      const vAssetAmount = baseAmount * rate;

      return {
        success: true,
        data: {
          vAssetAmount: parseFloat(vAssetAmount.toFixed(6)),
          rate: parseFloat(rate.toFixed(6)),
        },
        message: '成功获取预计铸造数量',
      };
    } catch (error) {
      console.error('❌ 估算铸造数量失败:', error);
      return {
        success: false,
        error: '获取预计数量失败',
        message: error instanceof Error ? error.message : '网络连接错误',
      };
    }
  }

  /**
   * 获取资产的年化收益率 (真实API调用)
   */
  async getAPY(chainId: string, assetId: string): Promise<ApiResponse<ApyResponse>> {
    try {
      const connected = await this.waitForConnection();
      if (!connected || !this.api) {
        throw new Error('未连接到Bifrost网络');
      }

      // 查询质押池的年化收益率
      const poolReward = await this.api.query.vTokenMinting.vTokenRewardPerBlock({ Token: assetId });
      const totalStaked = await this.api.query.vTokenMinting.totalStaked({ Token: assetId });

      // 计算年化收益率
      const blockReward = Number(poolReward.toString());
      const stakedAmount = Number(totalStaked.toString());

      // 简化的APY计算 (实际实现需要更复杂的计算)
      const blockTime = 12000; // 12秒
      const blocksPerYear = (365 * 24 * 60 * 60 * 1000) / blockTime;
      const yearlyReward = blockReward * blocksPerYear;
      const apy = stakedAmount > 0 ? (yearlyReward / stakedAmount) * 100 : 0;

      return {
        success: true,
        data: {
          apy: parseFloat(apy.toFixed(2)),
          updateTime: Date.now(),
        },
        message: '成功获取年化收益率',
      };
    } catch (error) {
      console.error('❌ 获取APY失败:', error);
      return {
        success: false,
        error: '获取年化收益率失败',
        message: error instanceof Error ? error.message : '网络连接错误',
      };
    }
  }

  /**
   * 获取资产余额 (真实API调用)
   */
  async getAssetBalance(
    chainId: string,
    assetId: string,
    walletAddress: string,
  ): Promise<ApiResponse<number>> {
    try {
      const connected = await this.waitForConnection();
      if (!connected || !this.api) {
        throw new Error('未连接到Bifrost网络');
      }

      let balance = 0;

      if (assetId.startsWith('v')) {
        // 查询流动性质押代币余额
        const vTokenBalance = await this.api.query.tokens.accounts(walletAddress, { VToken: assetId.slice(1) });
        balance = Number((vTokenBalance as any).free?.toString() || '0');
      } else {
        // 查询基础资产余额
        const nativeBalance = await this.api.query.tokens.accounts(walletAddress, { Token: assetId });
        balance = Number((nativeBalance as any).free?.toString() || '0');
      }

      // 转换为可读格式 (假设12位小数)
      const readableBalance = balance / Math.pow(10, 12);

      return {
        success: true,
        data: parseFloat(readableBalance.toFixed(6)),
        message: '成功获取资产余额',
      };
    } catch (error) {
      console.error('❌ 获取资产余额失败:', error);
      return {
        success: false,
        error: '获取资产余额失败',
        message: error instanceof Error ? error.message : '网络连接错误',
      };
    }
  }

  /**
   * 执行质押铸造交易 (真实交易)
   */
  async executeMint(
    chainId: string,
    assetId: string,
    amount: number,
    walletAddress: string,
    signAndSend: (tx: any) => Promise<string>,
  ): Promise<ApiResponse<{ txHash: string; vAssetAmount: number }>> {
    try {
      const connected = await this.waitForConnection();
      if (!connected || !this.api) {
        throw new Error('未连接到Bifrost网络');
      }

      // 构建质押交易
      const amountInSmallestUnit = Math.floor(amount * Math.pow(10, 12));
      const tx = this.api.tx.vTokenMinting.mint({ Token: assetId }, amountInSmallestUnit);

      // 通过钱包签名并发送交易
      const txHash = await signAndSend(tx);

      // 估算获得的流动性质押代币数量
      const mintResponse = await this.estimateMintAmount(chainId, assetId, amount);

      return {
        success: true,
        data: {
          txHash,
          vAssetAmount: mintResponse.data?.vAssetAmount || 0,
        },
        message: `成功质押 ${amount} ${assetId}`,
      };
    } catch (error) {
      console.error('❌ 执行质押失败:', error);
      return {
        success: false,
        error: '执行质押失败',
        message: error instanceof Error ? error.message : '交易执行错误',
      };
    }
  }

  /**
   * 执行赎回交易 (真实交易)
   */
  async executeRedeem(
    chainId: string,
    assetId: string,
    amount: number,
    walletAddress: string,
    signAndSend: (tx: any) => Promise<string>,
  ): Promise<ApiResponse<{ txHash: string; estimatedTime: number }>> {
    try {
      const connected = await this.waitForConnection();
      if (!connected || !this.api) {
        throw new Error('未连接到Bifrost网络');
      }

      // 构建赎回交易
      const amountInSmallestUnit = Math.floor(amount * Math.pow(10, 12));
      const tx = this.api.tx.vTokenMinting.redeem({ VToken: assetId.slice(1) }, amountInSmallestUnit);

      // 通过钱包签名并发送交易
      const txHash = await signAndSend(tx);

      // 获取解锁周期 (通常是28天)
      const unlockingPeriod = 28 * 24 * 60 * 60 * 1000; // 28天的毫秒数

      return {
        success: true,
        data: {
          txHash,
          estimatedTime: Date.now() + unlockingPeriod,
        },
        message: `成功提交赎回 ${amount} ${assetId}`,
      };
    } catch (error) {
      console.error('❌ 执行赎回失败:', error);
      return {
        success: false,
        error: '执行赎回失败',
        message: error instanceof Error ? error.message : '交易执行错误',
      };
    }
  }

  /**
   * 获取赎回状态
   */
  async getRedeemStatus(redeemId: string): Promise<ApiResponse<{ status: string; remainingTime: number }>> {
    try {
      const connected = await this.waitForConnection();
      if (!connected || !this.api) {
        throw new Error('未连接到Bifrost网络');
      }

      // 查询赎回请求状态
      const redeemRequest = await this.api.query.vTokenMinting.redeemRequests(redeemId);

      // 解析状态和剩余时间
      const requestData = (redeemRequest as any);
      const status = requestData.isActive ? 'unlocking' : 'completed';
      const remainingTime = requestData.isActive ?
        Number(requestData.endBlock?.toString() || '0') * 12000 - Date.now() : 0;

      return {
        success: true,
        data: {
          status,
          remainingTime: Math.max(0, remainingTime),
        },
        message: '成功获取赎回状态',
      };
    } catch (error) {
      console.error('❌ 获取赎回状态失败:', error);
      return {
        success: false,
        error: '获取赎回状态失败',
        message: error instanceof Error ? error.message : '网络连接错误',
      };
    }
  }

  /**
   * 断开连接
   */
  async disconnect(): Promise<void> {
    if (this.api) {
      await this.api.disconnect();
      this.api = null;
      this.isConnected = false;
      console.log('🔌 Disconnected from Bifrost testnet');
    }
  }

  /**
   * 获取连接状态
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// 导出单例实例
export const bifrostSdkRealService = new BifrostSdkRealService();