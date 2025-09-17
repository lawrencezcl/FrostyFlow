# 🚀 FrostyFlow 测试网集成快速指南

## 🚀 快速开始

### 1. 自动化设置（推荐）

运行自动化设置脚本：

```bash
chmod +x setup-testnet.sh
./setup-testnet.sh
```

### 2. 手动设置

如果您偏好手动配置：

```bash
# 安装测试网依赖
npm install @polkadot/api@^10.13.1 @polkadot/extension-dapp@^0.47.1

# 创建环境配置
cp .env.example .env.local
# 编辑 .env.local 文件，配置测试网端点
```

## 📋 前置条件

1. **Node.js 14+** 和 **npm**
2. **钱包扩展**（选择一个）：
   - [Polkadot.js Extension](https://polkadot.js.org/extension/)
   - [Talisman](https://talisman.xyz/)
   - [SubWallet](https://subwallet.app/)

## 🧪 测试流程

### 连接测试
```bash
npm run test:connections    # 测试网络连接
npm run test:wallet        # 测试钱包连接
npm run test:testnet       # 完整测试
```

### 启动应用
```bash
npm run dev:testnet        # 测试网模式
```

## 💰 获取测试代币

- **Westend (WND)**: https://faucet.polkadot.io/
- **Kusama**: 通过官方水龙头
- **Bifrost**: 通过 Discord 社区

## 📁 关键文件

- `TESTNET_INTEGRATION_GUIDE.md` - 详细技术文档
- `src/services/testnetApiService.ts` - 测试网 API 服务
- `.env.local` - 环境配置
- `setup-testnet.sh` - 自动化设置脚本

## 🔧 集成检查清单

- [ ] 安装钱包扩展
- [ ] 创建测试账户
- [ ] 获取测试代币
- [ ] 运行连接测试
- [ ] 测试质押功能
- [ ] 验证交易结果

## ❓ 故障排除

### 连接失败
- 检查网络连接
- 验证端点 URL
- 确认防火墙设置

### 钱包问题
- 确认扩展已安装并启用
- 检查账户权限
- 重新连接钱包

### 交易失败
- 确认账户余额充足
- 检查网络状态
- 验证交易参数

## 📞 支持

如需帮助，请查看详细的 `TESTNET_INTEGRATION_GUIDE.md` 文档或联系开发团队。

---

**准备好了吗？** 运行 `./setup-testnet.sh` 开始您的测试网集成之旅！
