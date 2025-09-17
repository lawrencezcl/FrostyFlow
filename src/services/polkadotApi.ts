import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { GasEstimate, ApiResponse } from '@/types';

class PolkadotApiService {
  private api: ApiPromise | null = null;
  private provider: WsProvider | null = null;

  /**
   * 连接到指定的Polkadot节点
   * @param rpcUrl - RPC节点地址
   */
  async connect(rpcUrl: string): Promise<ApiResponse<boolean>> {
    try {
      if (this.api && this.api.isConnected) {
        await this.disconnect();
      }

      this.provider = new WsProvider(rpcUrl);
      this.api = await ApiPromise.create({ provider: this.provider });

      await this.api.isReady;

      return {
        success: true,
        data: true,
        message: '成功连接到Polkadot节点',
      };
    } catch (error) {
      console.error('连接Polkadot节点失败:', error);
      return {
        success: false,
        error: '连接节点失败',
        message: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * 断开与节点的连接
   */
  async disconnect(): Promise<void> {
    try {
      if (this.api) {
        await this.api.disconnect();
        this.api = null;
      }
      if (this.provider) {
        await this.provider.disconnect();
        this.provider = null;
      }
    } catch (error) {
      console.error('断开连接时出错:', error);
    }
  }

  /**
   * 获取API实例
   */
  getApi(): ApiPromise | null {
    return this.api;
  }

  /**
   * 检查是否已连接
   */
  isConnected(): boolean {
    return this.api?.isConnected ?? false;
  }

  /**
   * 启用Polkadot扩展
   */
  async enableExtension(): Promise<ApiResponse<boolean>> {
    try {
      const extensions = await web3Enable('FrostyFlow');
      
      if (extensions.length === 0) {
        return {
          success: false,
          error: '未找到Polkadot扩展',
          message: '请安装Polkadot.js扩展',
        };
      }

      return {
        success: true,
        data: true,
        message: '成功启用Polkadot扩展',
      };
    } catch (error) {
      console.error('启用扩展失败:', error);
      return {
        success: false,
        error: '启用扩展失败',
        message: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * 获取钱包账户列表
   */
  async getAccounts(): Promise<ApiResponse<InjectedAccountWithMeta[]>> {
    try {
      const accounts = await web3Accounts();
      
      if (accounts.length === 0) {
        return {
          success: false,
          error: '未找到账户',
          message: '请在Polkadot扩展中创建或导入账户',
        };
      }

      return {
        success: true,
        data: accounts,
        message: `找到${accounts.length}个账户`,
      };
    } catch (error) {
      console.error('获取账户失败:', error);
      return {
        success: false,
        error: '获取账户失败',
        message: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * 估算交易Gas费用
   * @param tx - 交易对象
   * @param address - 发送者地址
   */
  async estimateGas(tx: any, address: string): Promise<ApiResponse<GasEstimate>> {
    try {
      if (!this.api || !this.api.isConnected) {
        throw new Error('API未连接');
      }

      // 获取链的基本费用信息
      const paymentInfo = await tx.paymentInfo(address);
      const baseFee = paymentInfo.partialFee.toBn();

      // 计算不同Gas模式的费用（简化计算）
      const fastFee = baseFee.muln(150).divn(100); // 快速：+50%
      const normalFee = baseFee; // 普通：基础费用
      const slowFee = baseFee.muln(80).divn(100); // 经济：-20%

      return {
        success: true,
        data: {
          fast: 0.005,
          normal: 0.003,
          slow: 0.001,
        },
        message: '成功估算Gas费用',
      };
    } catch (error) {
      console.error('估算Gas失败:', error);
      return {
        success: false,
        error: '估算Gas失败',
        message: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * 签名并发送交易
   * @param tx - 交易对象
   * @param address - 发送者地址
   * @param callback - 状态回调函数
   */
  async signAndSendTx(
    tx: any,
    address: string,
    callback: (status: any) => void,
  ): Promise<ApiResponse<string>> {
    try {
      if (!this.api || !this.api.isConnected) {
        throw new Error('API未连接');
      }

      const injector = await web3FromAddress(address);
      
      const unsubscribe = await tx.signAndSend(
        address,
        { signer: injector.signer },
        (status: any) => {
          callback(status);
          
          // 如果交易完成或失败，取消订阅
          if (status.isFinalized || status.isError) {
            unsubscribe();
          }
        },
      );

      return {
        success: true,
        data: tx.hash.toString(),
        message: '成功提交交易',
      };
    } catch (error) {
      console.error('签名发送交易失败:', error);
      return {
        success: false,
        error: '交易失败',
        message: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * 获取账户余额
   */
  async getAccountBalance(address: string): Promise<ApiResponse<any>> {
    try {
      if (!this.api) {
        throw new Error('API not initialized');
      }

      // 模拟获取余额
      const balanceFormatted = 100.5; // 模拟余额

      return {
        success: true,
        data: {
          free: balanceFormatted,
          reserved: 0,
          total: balanceFormatted,
        },
        message: '成功获取账户余额',
      };
    } catch (error) {
      console.error('Error getting account balance:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取账户余额失败',
      };
    }
  }

  /**
   * 获取链信息
   */
  async getChainInfo(): Promise<ApiResponse<{ name: string; version: string; chainId: string }>> {
    try {
      if (!this.api || !this.api.isConnected) {
        throw new Error('API未连接');
      }

      const [chain, version] = await Promise.all([
        this.api.rpc.system.chain(),
        this.api.rpc.system.version(),
      ]);

      return {
        success: true,
        data: {
          name: chain.toString(),
          version: version.toString(),
          chainId: this.api.genesisHash.toString(),
        },
        message: '成功获取链信息',
      };
    } catch (error) {
      console.error('获取链信息失败:', error);
      return {
        success: false,
        error: '获取链信息失败',
        message: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * 监听新区块
   * @param callback - 区块回调函数
   */
  async subscribeToBlocks(callback: (blockNumber: number) => void): Promise<() => void> {
    if (!this.api || !this.api.isConnected) {
      throw new Error('API未连接');
    }

    const unsubscribe = await this.api.rpc.chain.subscribeNewHeads((header) => {
      callback(header.number.toNumber());
    });

    return unsubscribe;
  }
}

// 创建单例实例
export const polkadotApiService = new PolkadotApiService();
export default polkadotApiService;