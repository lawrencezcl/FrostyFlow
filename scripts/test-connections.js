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
