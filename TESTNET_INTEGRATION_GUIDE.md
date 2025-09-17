# FrostyFlow 测试网集成指南

## 概述

本指南将帮助您将 FrostyFlow 项目从模拟数据环境迁移到真实的 Bifrost 测试网环境，实现完整的多链流动性质押功能。

## 目录

1. [环境准备](#环境准备)
2. [测试网配置](#测试网配置)
3. [API 服务集成](#api-服务集成)
4. [钱包连接](#钱包连接)
5. [状态管理更新](#状态管理更新)
6. [测试验证](#测试验证)
7. [部署指南](#部署指南)

## 环境准备

### 1. 更新依赖包

```bash
# 更新 Polkadot.js 相关包
npm install @polkadot/api@^10.13.1 @polkadot/extension-dapp@^0.47.1 @polkadot/keyring@^12.6.2 @polkadot/util@^12.6.2 @polkadot/util-crypto@^12.6.2

# 安装测试网支持包
npm install @polkadot/types@^10.13.1 @polkadot/api-contract@^10.13.1
```

### 2. 环境变量配置

创建 `.env.local` 文件：

```env
# Bifrost 测试网配置
REACT_APP_BIFROST_TESTNET_WS=wss://bifrost-testnet.liebi.com/ws
REACT_APP_BIFROST_TESTNET_RPC=https://bifrost-testnet.liebi.com

# Polkadot 测试网配置  
REACT_APP_POLKADOT_TESTNET_WS=wss://westend-rpc.polkadot.io
REACT_APP_POLKADOT_TESTNET_RPC=https://westend-rpc.polkadot.io

# Kusama 测试网配置
REACT_APP_KUSAMA_TESTNET_WS=wss://kusama-rpc.polkadot.io
REACT_APP_KUSAMA_TESTNET_RPC=https://kusama-rpc.polkadot.io

# 应用配置
REACT_APP_ENVIRONMENT=testnet
REACT_APP_DEBUG=true
```

## 测试网配置

### 网络配置

所有测试网配置将在单独的配置文件中定义，包括：

- Bifrost 测试网
- Westend (Polkadot 测试网)
- Kusama 测试网

每个网络包含：
- WebSocket 端点
- RPC 端点
- 原生代币信息
- 支持的资产列表
- 网络特定参数

## API 服务集成

### 核心功能

1. **网络连接管理**
   - 多网络 API 连接
   - 连接状态监控
   - 自动重连机制

2. **账户余额查询**
   - 实时余额获取
   - 多资产支持
   - 质押状态查询

3. **交易操作**
   - 质押铸造流动性代币
   - 赎回操作
   - 交易状态追踪

## 钱包连接

### 支持的钱包

- Polkadot.js Extension
- Talisman
- SubWallet

### 功能特性

- 多账户管理
- 账户切换
- 交易签名
- 安全断开

## 状态管理更新

### Redux 状态结构

```typescript
interface AppState {
  wallet: {
    isConnected: boolean;
    accounts: Account[];
    selectedAccount: Account | null;
  };
  asset: {
    chains: Chain[];
    selectedChain: string;
    loading: boolean;
  };
  staking: {
    positions: StakingPosition[];
    rewards: Reward[];
  };
}
```

### 异步操作

- fetchChains: 获取支持的网络
- refreshBalances: 刷新账户余额
- stakeMint: 执行质押操作
- initiateRedeem: 发起赎回

## 测试验证

### 本地测试步骤

1. **连接测试**
   ```bash
   npm run test:connections
   ```

2. **钱包集成测试**
   ```bash
   npm run test:wallet
   ```

3. **API 功能测试**
   ```bash
   npm run test:api
   ```

4. **完整流程测试**
   ```bash
   npm run test:e2e
   ```

### 测试网测试

1. 安装钱包扩展
2. 创建测试账户
3. 获取测试代币
4. 执行质押流程
5. 验证交易结果

## 部署指南

### 构建配置

```bash
# 生产构建
npm run build

# 测试网构建
REACT_APP_ENVIRONMENT=testnet npm run build
```

### 部署检查清单

- [ ] 环境变量配置正确
- [ ] 网络端点可访问
- [ ] 钱包集成正常
- [ ] API 服务响应正常
- [ ] 交易流程完整

## 故障排除

### 常见问题

1. **连接失败**
   - 检查网络端点
   - 验证防火墙设置
   - 确认 WebSocket 支持

2. **钱包连接问题**
   - 确认扩展已安装
   - 检查权限设置
   - 验证账户状态

3. **交易失败**
   - 检查账户余额
   - 验证交易参数
   - 确认网络状态

## 下一步

1. 运行自动化设置脚本
2. 测试基本功能
3. 执行完整的用户流程测试
4. 准备生产部署

---

**注意**: 这是一个逐步迁移过程。建议先在测试网环境充分验证所有功能后，再考虑主网部署。
