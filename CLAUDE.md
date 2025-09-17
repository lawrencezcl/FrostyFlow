# FrostyFlow - Claude Code 开发指南

## 项目概述

FrostyFlow 是一个基于 Bifrost 协议的多链流动性质押平台，采用 React + TypeScript + Redux Toolkit 技术栈。用户可以通过平台质押基础资产（如 DOT、KSM）获得对应的流动性质押代币（如 vDOT、vKSM），在保持资产流动性的同时获得质押收益。

## 📁 项目结构

```
src/
├── components/          # 可复用组件
│   ├── Layout.tsx       # 主布局组件
│   ├── WalletConnect.tsx # 钱包连接组件
│   ├── CleanModernLayout.tsx # 现代化布局
│   └── ModernWalletConnect.tsx # 现代化钱包连接
├── pages/               # 页面组件
│   ├── AssetOverview.tsx # 资产总览
│   ├── StakingMint.tsx   # 质押铸造
│   ├── RedemptionPage.tsx # 质押赎回
│   ├── HelpCenter.tsx    # 帮助中心
│   └── Settings.tsx      # 系统设置
├── redux/               # 状态管理
│   ├── slices/          # Redux 切片
│   │   ├── chainSlice.ts     # 链管理
│   │   ├── assetSlice.ts     # 资产管理
│   │   ├── walletSlice.ts    # 钱包管理
│   │   ├── transactionSlice.ts # 交易管理
│   │   └── redeemSlice.ts    # 赎回管理
│   ├── hooks.ts         # 类型安全的 hooks
│   └── store.ts         # Store 配置
├── services/            # 服务层
│   ├── bifrostSdk.ts    # Bifrost SDK 封装
│   ├── coinGecko.ts     # 价格数据服务
│   ├── polkadotApi.ts   # Polkadot API 封装
│   ├── emailService.ts  # 邮件通知服务
│   └── testnetApiService.ts # 测试网 API 服务
├── styles/              # 样式系统
│   ├── theme.ts         # 主题配置
│   ├── components.ts    # 组件样式
│   ├── ThemeProvider.tsx # 主题上下文
│   └── styled.d.ts      # TypeScript 声明
└── types/               # TypeScript 类型定义
```

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

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
# 应用将在 http://localhost:3000 启动
```

### 构建生产版本
```bash
npm run build
```

## 🐳 Docker 部署

### 一键部署
```bash
# 开发环境
./deploy.sh dev

# 生产环境
./deploy.sh prod

# 测试网环境
./deploy.sh test
```

### 高级部署选项
```bash
# 强制重新构建
./deploy.sh prod --build --no-cache

# 查看日志
./deploy.sh --logs

# 停止所有服务
./deploy.sh --stop

# 清理所有资源
./deploy.sh --clean
```

## 🧪 测试网集成

### 自动化设置
```bash
chmod +x setup-testnet.sh
./setup-testnet.sh
```

### 测试命令
```bash
# 测试网络连接
npm run test:connections

# 测试钱包连接
npm run test:wallet

# 完整测试
npm run test:testnet
```

## 🔧 开发规范

### 代码质量
```bash
# 运行 ESLint 检查
npm run lint

# 自动修复可修复的问题
npm run lint:fix
```

### 状态管理
- 使用 Redux Toolkit 进行状态管理
- 所有状态切片放在 `src/redux/slices/` 目录
- 使用类型安全的 hooks：`useAppDispatch` 和 `useAppSelector`

### 组件开发
- 函数组件 + TypeScript
- 使用 styled-components 进行样式管理
- 遵循 Ant Design 设计规范

### 服务层
- 所有 API 调用封装在 `src/services/` 目录
- 统一的错误处理机制
- 支持模拟数据和真实数据切换

## 🎨 主题系统

### 主题配置
- 支持亮色/暗色主题切换
- 使用 styled-components 主题系统
- 主题配置在 `src/styles/theme.ts`

### 使用示例
```typescript
import styled from 'styled-components';

const Container = styled.div`
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
`;
```

## 🔗 区块链集成

### 支持的钱包
- Polkadot.js Extension
- MetaMask
- Talisman

### 支持的链
- Bifrost Polkadot
- Bifrost Kusama
- Moonbase Alpha（测试网）

### API 服务
- **PolkadotApi**: 区块链连接和交易
- **BifrostSdk**: Bifrost 协议接口
- **CoinGecko**: 价格数据获取
- **EmailService**: 邮件通知

## 📊 监控和日志

### 健康检查
```bash
# 应用健康检查
curl http://localhost:3000/health

# 服务状态检查
docker-compose ps
```

### 监控面板
- **Grafana**: http://localhost:3001 (admin/admin123)
- **Prometheus**: http://localhost:9090

### 查看日志
```bash
# 实时日志
docker-compose logs -f frostyflow-frontend

# 错误日志
docker-compose logs --tail=100 frostyflow-frontend | grep ERROR
```

## 🔒 安全配置

### 环境变量
创建 `.env` 文件：
```bash
# SendGrid 邮件服务 API Key
REACT_APP_SENDGRID_API_KEY=your_sendgrid_api_key

# CoinGecko API Key（可选）
REACT_APP_COINGECKO_API_KEY=your_coingecko_api_key

# Bifrost 节点 URL（可选）
REACT_APP_BIFROST_RPC_URL=wss://bifrost-rpc.dwellir.com
```

### 生产环境安全
- 修改默认密码
- 配置防火墙
- 启用 HTTPS
- 非 root 用户运行容器

## 🚨 常见问题

### 端口占用
```bash
# 查看端口占用
lsof -i :3000

# 停止占用进程
./deploy.sh --stop
```

### 内存不足
```bash
# 增加交换空间
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### 网络问题
```bash
# 重置 Docker 网络
docker network prune -f
./deploy.sh --clean
./deploy.sh prod --build
```

## 📚 相关文档

- [README.md](./README.md) - 项目主要文档
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - 项目开发完成报告
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Docker 部署指南
- [TESTNET_INTEGRATION_GUIDE.md](./TESTNET_INTEGRATION_GUIDE.md) - 测试网集成指南
- [INTEGRATION_README.md](./INTEGRATION_README.md) - 快速集成指南
- [TESTING_REPORT.md](./TESTING_REPORT.md) - UI/UX 测试报告
- [MODERNIZATION_REPORT.md](./MODERNIZATION_REPORT.md) - 现代化升级报告

## 🎯 开发建议

1. **组件优先**: 优先复用现有组件，保持代码一致性
2. **类型安全**: 充分利用 TypeScript 类型系统
3. **状态管理**: 合理使用 Redux，避免过度使用
4. **错误处理**: 完善的错误处理和用户反馈
5. **性能优化**: 注意组件渲染性能和内存使用
6. **测试覆盖**: 为核心功能编写单元测试

## 📞 支持

如遇问题：
1. 查看相关文档
2. 检查日志输出
3. 验证环境配置
4. 参考故障排除部分

---

**注意**: 这是一个 DeFi 项目，涉及真实的资金操作。在生产环境使用前，请确保进行充分的安全审计和测试。