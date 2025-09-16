#!/bin/bash

# FrostyFlow 项目快速启动脚本
# 此脚本将自动安装依赖并启动开发服务器

echo "🚀 欢迎使用 FrostyFlow - Bifrost多链流动性质押平台"
echo "================================================"

# 检查Node.js版本
node_version=$(node -v 2>/dev/null | cut -c2-)
if [ -z "$node_version" ]; then
    echo "❌ 错误: 未检测到Node.js，请先安装Node.js 16+"
    echo "📥 下载地址: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js版本: $node_version"

# 检查npm版本
npm_version=$(npm -v 2>/dev/null)
if [ -z "$npm_version" ]; then
    echo "❌ 错误: 未检测到npm"
    exit 1
fi

echo "✅ npm版本: $npm_version"

# 检查是否存在package.json
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 未找到package.json文件，请确保在项目根目录运行此脚本"
    exit 1
fi

echo "📦 开始安装项目依赖..."
echo "这可能需要几分钟时间，请耐心等待..."

# 安装依赖
npm install

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败，请检查网络连接或手动运行 npm install"
    exit 1
fi

echo "✅ 依赖安装完成！"

# 检查环境变量文件
if [ ! -f ".env" ]; then
    echo "⚙️  创建环境配置文件..."
    cp .env.example .env 2>/dev/null || {
        echo "# FrostyFlow 环境配置" > .env
        echo "REACT_APP_BIFROST_PASSET_HUB_RPC=wss://rpc.testnet.bifrost-para.liebi.com/ws" >> .env
        echo "REACT_APP_MOONBASE_ALPHA_RPC=wss://moonbase-alpha.public.blastapi.io" >> .env
        echo "REACT_APP_COINGECKO_API_URL=https://api.coingecko.com/api/v3" >> .env
        echo "REACT_APP_ENVIRONMENT=development" >> .env
    }
    echo "✅ 环境配置文件已创建"
else
    echo "✅ 环境配置文件已存在"
fi

echo ""
echo "🎉 FrostyFlow 项目准备完成！"
echo "================================================"
echo "📋 接下来你可以:"
echo "   1. 运行 'npm start' 启动开发服务器"
echo "   2. 访问 http://localhost:3000 查看应用"
echo "   3. 运行 'npm run lint' 检查代码质量"
echo "   4. 运行 'npm run build' 构建生产版本"
echo ""
echo "📚 更多信息请查看:"
echo "   - README.md: 项目说明文档"
echo "   - PROJECT_SUMMARY.md: 项目完成报告"
echo ""
echo "🔗 重要链接:"
echo "   - Bifrost官网: https://bifrost.finance/"
echo "   - Polkadot.js扩展: https://polkadot.js.org/extension/"
echo "   - 项目文档: ./README.md"
echo ""

# 询问是否立即启动开发服务器
read -p "🚀 是否现在启动开发服务器? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌟 启动开发服务器..."
    echo "⏰ 服务器启动后将自动打开浏览器"
    echo "🛑 按 Ctrl+C 停止服务器"
    echo ""
    npm start
else
    echo "👍 你可以稍后运行 'npm start' 启动开发服务器"
    echo "🎊 感谢使用 FrostyFlow！"
fi