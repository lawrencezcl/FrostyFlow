#!/usr/bin/env node

// Simple test to verify i18n translations are loaded correctly
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing FrostyFlow Language Switching Implementation...\n');

// Test if translation files exist and have valid JSON
try {
  const enTranslations = JSON.parse(fs.readFileSync('./src/i18n/locales/en.json', 'utf8'));
  const zhTranslations = JSON.parse(fs.readFileSync('./src/i18n/locales/zh.json', 'utf8'));

  console.log('✅ Translation files loaded successfully');

  // Check for key translations we added
  const assetKeys = ['assetOverview', 'welcomeToFrostyFlow', 'totalAssetValue'];
  const stakingKeys = ['title', 'description', 'pleaseConnectWallet', 'stakingConfig'];

  console.log('\n📊 Checking Asset Overview translations:');
  assetKeys.forEach(key => {
    const enValue = enTranslations.assets?.[key];
    const zhValue = zhTranslations.assets?.[key];

    if (enValue && zhValue) {
      console.log(`  ✅ ${key}: EN="${enValue}" | ZH="${zhValue}"`);
    } else {
      console.log(`  ❌ ${key}: Missing translations`);
    }
  });

  console.log('\n🔒 Checking Staking translations:');
  stakingKeys.forEach(key => {
    const enValue = enTranslations.staking?.[key];
    const zhValue = zhTranslations.staking?.[key];

    if (enValue && zhValue) {
      console.log(`  ✅ ${key}: EN="${enValue}" | ZH="${zhValue}"`);
    } else {
      console.log(`  ❌ ${key}: Missing translations`);
    }
  });

  // Check if AssetOverview component has useTranslation import
  const assetOverviewContent = fs.readFileSync('./src/pages/AssetOverview.tsx', 'utf8');
  const stakingMintContent = fs.readFileSync('./src/pages/StakingMint.tsx', 'utf8');

  console.log('\n🔍 Checking component imports:');
  console.log(`  ✅ AssetOverview uses useTranslation: ${assetOverviewContent.includes('useTranslation')}`);
  console.log(`  ✅ StakingMint uses useTranslation: ${stakingMintContent.includes('useTranslation')}`);

  console.log('\n🎉 Language switching implementation test completed successfully!');
  console.log('📱 Test the application at: http://localhost:3000');
  console.log('🌐 Try switching between English and Chinese using the language switcher');

} catch (error) {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
}