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
