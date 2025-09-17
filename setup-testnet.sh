#!/bin/bash

# FrostyFlow 测试网自动化设置脚本
# 这个脚本将帮助您快速配置测试网环境

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查依赖
check_dependencies() {
    log_info "检查系统依赖..."
    
    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装。请安装 Node.js 14 或更高版本。"
        exit 1
    fi
    
    # 检查 npm
    if ! command -v npm &> /dev/null; then
        log_error "npm 未安装。请安装 npm。"
        exit 1
    fi
    
    # 检查 Node.js 版本
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    REQUIRED_VERSION="14.0.0"
    
    if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
        log_error "Node.js 版本过低。当前版本: $NODE_VERSION，需要版本: $REQUIRED_VERSION 或更高。"
        exit 1
    fi
    
    log_success "依赖检查通过"
}

# 安装项目依赖
install_dependencies() {
    log_info "安装项目依赖..."
    
    # 配置淘宝镜像源（适用于中国大陆用户）
    log_info "配置 npm 镜像源..."
    npm config set registry https://registry.npmmirror.com/
    
    # 安装基本依赖
    npm install
    
    # 安装测试网相关的额外依赖
    log_info "安装测试网相关依赖..."
    npm install @polkadot/api@^10.13.1 @polkadot/extension-dapp@^0.47.1 @polkadot/keyring@^12.6.2 @polkadot/util@^12.6.2 @polkadot/util-crypto@^12.6.2 @polkadot/types@^10.13.1 @polkadot/api-contract@^10.13.1
    
    log_success "依赖安装完成"
}

# 创建环境配置文件
create_env_config() {
    log_info "创建环境配置文件..."
    
    # 创建 .env.local 文件
    cat > .env.local << EOF
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
EOF
    
    log_success "环境配置文件创建完成"
}

# 创建测试工具
create_test_tools() {
    log_info "创建测试工具..."
    
    # 创建连接测试脚本
    mkdir -p scripts
    
    cat > scripts/test-connections.js << 'EOF'
const { ApiPromise, WsProvider } = require('@polkadot/api');

const ENDPOINTS = {
    bifrost: 'wss://bifrost-testnet.liebi.com/ws',
    westend: 'wss://westend-rpc.polkadot.io',
    kusama: 'wss://kusama-rpc.polkadot.io'
};

async function testConnection(name, endpoint) {
    try {
        console.log(`测试连接到 ${name}...`);
        const provider = new WsProvider(endpoint);
        const api = await ApiPromise.create({ provider });
        await api.isReady;
        
        const chain = await api.rpc.system.chain();
        const version = await api.rpc.system.version();
        
        console.log(`✅ ${name} 连接成功`);
        console.log(`   链名称: ${chain}`);
        console.log(`   版本: ${version}`);
        
        await api.disconnect();
        return true;
    } catch (error) {
        console.log(`❌ ${name} 连接失败: ${error.message}`);
        return false;
    }
}

async function testAllConnections() {
    console.log('开始测试网络连接...\n');
    
    const results = [];
    for (const [name, endpoint] of Object.entries(ENDPOINTS)) {
        const success = await testConnection(name, endpoint);
        results.push({ name, success });
        console.log('');
    }
    
    console.log('测试结果汇总:');
    results.forEach(({ name, success }) => {
        console.log(`${success ? '✅' : '❌'} ${name}`);
    });
    
    const successCount = results.filter(r => r.success).length;
    console.log(`\n${successCount}/${results.length} 个网络连接成功`);
}

testAllConnections().catch(console.error);
EOF
    
    # 创建钱包测试脚本
    cat > scripts/test-wallet.js << 'EOF'
const { web3Enable, web3Accounts } = require('@polkadot/extension-dapp');

async function testWalletExtension() {
    console.log('测试钱包扩展连接...\n');
    
    try {
        // 启用扩展
        const extensions = await web3Enable('FrostyFlow Test');
        
        if (extensions.length === 0) {
            console.log('❌ 未发现钱包扩展');
            console.log('请安装以下钱包扩展之一:');
            console.log('- Polkadot.js Extension');
            console.log('- Talisman');
            console.log('- SubWallet');
            return;
        }
        
        console.log(`✅ 发现 ${extensions.length} 个钱包扩展:`);
        extensions.forEach(ext => {
            console.log(`   - ${ext.name} (${ext.version})`);
        });
        
        // 获取账户
        const accounts = await web3Accounts();
        
        if (accounts.length === 0) {
            console.log('⚠️  未发现钱包账户');
            console.log('请在钱包扩展中创建或导入账户');
            return;
        }
        
        console.log(`\n✅ 发现 ${accounts.length} 个账户:`);
        accounts.forEach((account, index) => {
            console.log(`   ${index + 1}. ${account.meta.name || '未命名'}`);
            console.log(`      地址: ${account.address.slice(0, 8)}...${account.address.slice(-8)}`);
            console.log(`      来源: ${account.meta.source}`);
        });
        
        console.log('\n✅ 钱包连接测试成功');
        
    } catch (error) {
        console.log(`❌ 钱包连接测试失败: ${error.message}`);
    }
}

testWalletExtension().catch(console.error);
EOF
    
    # 添加 package.json 脚本
    log_info "添加测试脚本到 package.json..."
    
    # 使用 Node.js 来修改 package.json
    node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    pkg.scripts = pkg.scripts || {};
    pkg.scripts['test:connections'] = 'node scripts/test-connections.js';
    pkg.scripts['test:wallet'] = 'node scripts/test-wallet.js';
    pkg.scripts['test:testnet'] = 'npm run test:connections && npm run test:wallet';
    pkg.scripts['dev:testnet'] = 'REACT_APP_ENVIRONMENT=testnet npm start';
    
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
    "
    
    log_success "测试工具创建完成"
}

# 验证设置
verify_setup() {
    log_info "验证设置..."
    
    # 检查文件是否存在
    if [ ! -f ".env.local" ]; then
        log_error ".env.local 文件未找到"
        return 1
    fi
    
    if [ ! -f "scripts/test-connections.js" ]; then
        log_error "测试脚本未找到"
        return 1
    fi
    
    # 检查依赖是否安装
    if [ ! -d "node_modules/@polkadot/api" ]; then
        log_error "@polkadot/api 依赖未安装"
        return 1
    fi
    
    log_success "设置验证通过"
}

# 显示下一步指引
show_next_steps() {
    log_info "设置完成！下一步操作指引:"
    echo ""
    echo "1. 安装钱包扩展（选择以下之一）:"
    echo "   - Polkadot.js Extension: https://polkadot.js.org/extension/"
    echo "   - Talisman: https://talisman.xyz/"
    echo "   - SubWallet: https://subwallet.app/"
    echo ""
    echo "2. 在钱包中创建或导入测试账户"
    echo ""
    echo "3. 获取测试代币:"
    echo "   - Westend (WND): https://faucet.polkadot.io/"
    echo "   - Kusama: 通过官方水龙头获取"
    echo ""
    echo "4. 运行测试:"
    echo "   npm run test:testnet          # 完整测试"
    echo "   npm run test:connections      # 仅测试网络连接"
    echo "   npm run test:wallet           # 仅测试钱包连接"
    echo ""
    echo "5. 启动开发服务器:"
    echo "   npm run dev:testnet           # 测试网模式启动"
    echo ""
    echo "6. 查看详细集成指南:"
    echo "   cat TESTNET_INTEGRATION_GUIDE.md"
    echo ""
}

# 主函数
main() {
    echo ""
    log_info "开始 FrostyFlow 测试网环境设置..."
    echo ""
    
    check_dependencies
    install_dependencies
    create_env_config
    create_test_tools
    verify_setup
    
    echo ""
    log_success "测试网环境设置完成！"
    echo ""
    
    show_next_steps
}

# 运行主函数
main "$@"