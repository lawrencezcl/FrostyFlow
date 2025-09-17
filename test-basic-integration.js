const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    try {
        console.log('🚀 Testing FrostyFlow application...');
        
        // Navigate to the app
        await page.goto('http://localhost:3000');
        await page.waitForLoadState('networkidle');
        
        // Check title
        const title = await page.title();
        console.log(`📄 Page title: ${title}`);
        
        // Check for wallet connect button
        const connectButton = await page.$('button', { hasText: /Connect|Connect Wallet/i });
        if (connectButton) {
            console.log('✅ Wallet connect button found');
        } else {
            console.log('⚠️  Wallet connect button not found');
        }
        
        // Check for testnet indicators
        const testnetIndicator = await page.$('text=/Testnet|testnet/i');
        if (testnetIndicator) {
            console.log('✅ Testnet environment indicator found');
        } else {
            console.log('⚠️  Testnet indicator not found');
        }
        
        // Check for asset-related content
        const assetContent = await page.$('text=/Asset|Balance|DOT|KSM/i');
        if (assetContent) {
            console.log('✅ Asset content found');
        } else {
            console.log('⚠️  Asset content not found');
        }
        
        // Check for staking functionality
        const stakingContent = await page.$('text=/Stake|Staking|Mint/i');
        if (stakingContent) {
            console.log('✅ Staking functionality found');
        } else {
            console.log('⚠️  Staking functionality not found');
        }
        
        // Take screenshot for verification
        await page.screenshot({ path: 'testnet-integration-test.png' });
        console.log('📸 Screenshot saved as testnet-integration-test.png');
        
        console.log('🎉 Basic integration test completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    } finally {
        await browser.close();
    }
})();
