# FrostyFlow - Bifrost多链流动性质押平台

![FrostyFlow Logo](./public/logo.png)

## 📝 项目简介

FrostyFlow是基于Bifrost协议开发的多链流动性质押平台，为用户提供安全、便捷的跨链质押服务。用户可以质押基础资产（如DOT、KSM）获得对应的流动性质押代币（如vDOT、vKSM），在保持资产流动性的同时获得质押收益。

## 🚀 项目状态

- ✅ **开发完成**: 核心功能已实现
- ✅ **本地构建**: 成功构建并运行
- ✅ **UI/UX测试**: 完成全面测试
- ✅ **文档更新**: 项目文档已更新
- 🔄 **待集成**: 真实区块链数据和钱包

## ✨ 核心功能

### 🔗 多链钱包连接
- **支持钱包**: Polkadot.js、MetaMask、Talisman
- **适配链**: Bifrost Passet Hub、Moonbase Alpha
- **自动识别**: 智能识别已安装的钱包扩展
- **安全连接**: 无私钥存储，仅获取公钥地址

### ⛓️ 多链管理
- **链识别**: 自动识别Bifrost兼容链
- **快速切换**: 一键切换不同链网络
- **添加链**: 支持添加自定义Bifrost兼容链
- **状态监控**: 实时显示链连接状态

### 💰 资产总览
- **总价值统计**: 实时计算所有链的资产总价值
- **收益追踪**: 显示累计质押收益和年化收益率
- **链维度展示**: 按链分组显示资产明细
- **价格更新**: 集成CoinGecko API获取实时价格

### 🏦 质押铸造
- **资产选择**: 支持DOT、KSM等多种基础资产
- **金额校验**: 实时验证质押金额合法性
- **Gas配置**: 提供快速、普通、经济三种Gas模式
- **实时计算**: 动态计算预计获得的流动性质押代币数量

### 🔄 质押赎回
- **赎回类型**: 支持即时赎回和标准赎回
- **进度追踪**: 实时跟踪赎回状态和剩余时间
- **到期提醒**: 邮件和站内通知双重提醒
- **一键到账**: 支持一键申请赎回资产到账

## 🛠️ 技术架构

### 前端技术栈
- **框架**: React 18.2.0 + TypeScript 4.9.5
- **状态管理**: Redux Toolkit 2.2.3
- **UI组件**: Ant Design 5.16.1
- **路由**: React Router DOM 6.22.3
- **图表**: ECharts 5.4.3
- **HTTP客户端**: Axios 1.6.8

### 区块链集成
- **Polkadot集成**: @polkadot/api 10.13.1
- **钱包连接**: @polkadot/extension-dapp 0.44.1
- **Bifrost SDK**: 集成Bifrost官方SDK

### 项目结构
```
src/
├── components/          # 可复用组件
│   ├── Layout.tsx       # 主布局组件
│   └── WalletConnect.tsx # 钱包连接组件
├── pages/               # 页面组件
│   ├── AssetOverview.tsx # 资产总览
│   ├── StakingMint.tsx   # 质押铸造
│   ├── RedemptionPage.tsx # 质押赎回
│   ├── HelpCenter.tsx    # 帮助中心
│   └── Settings.tsx      # 系统设置
├── redux/               # 状态管理
│   ├── slices/          # Redux 切片
│   ├── hooks.ts         # 类型安全的 hooks
│   └── store.ts         # Store 配置
├── services/            # 服务层
│   ├── bifrostSdk.ts    # Bifrost SDK 封装
│   ├── coinGecko.ts     # 价格数据服务
│   ├── polkadotApi.ts   # Polkadot API 封装
│   └── emailService.ts  # 邮件通知服务
├── types/               # TypeScript 类型定义
└── styles/              # 样式文件
```

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0
- 支持的浏览器：Chrome、Firefox、Safari、Edge

### 安装依赖
```bash
# 设置国内镜像源（可选）
npm config set registry https://registry.npmmirror.com

# 安装项目依赖
npm install
```

### 启动开发服务器
```bash
npm start
```

应用将在 http://localhost:3000 启动

### 构建生产版本
```bash
npm run build
```

### 代码质量检查
```bash
# 运行 ESLint 检查
npm run lint

# 自动修复可修复的问题
npm run lint:fix
```

## 📊 测试报告

项目已通过全面的UI/UX测试，详细报告请查看 [TESTING_REPORT.md](./TESTING_REPORT.md)

### 测试结果概要
- ✅ 所有页面正常渲染
- ✅ 响应式设计兼容性优秀
- ✅ 组件交互功能完善
- ✅ 跨浏览器兼容性良好
- ✅ 性能表现优秀

### 运行测试
```bash
# 运行单元测试
npm test

# 生成测试覆盖率报告
npm test -- --coverage
```

## 📦 部署指南

### Vercel 部署（推荐）
1. 连接 GitHub 仓库到 Vercel
2. 导入项目并配置构建命令：`npm run build`
3. 设置输出目录：`build`
4. 部署完成

### 传统服务器部署
```bash
# 构建项目
npm run build

# 将 build 目录上传到服务器
# 配置 Web 服务器指向 build 目录
```

### 环境变量配置
创建 `.env` 文件并配置以下变量：
```bash
# SendGrid 邮件服务 API Key
REACT_APP_SENDGRID_API_KEY=your_sendgrid_api_key

# CoinGecko API Key（可选）
REACT_APP_COINGECKO_API_KEY=your_coingecko_api_key

# Bifrost 节点 URL（可选）
REACT_APP_BIFROST_RPC_URL=wss://bifrost-rpc.dwellir.com
```

## 📄 许可证

本项目采用 MIT 许可证

---

**⚠️ 免责声明**: 本项目为演示目的，请在生产环境使用前进行充分测试。DeFi投资存在风险，请谨慎决策。