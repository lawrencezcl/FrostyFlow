#!/bin/bash

# FrostyFlow Test Token Quick Start Script

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_step() {
    echo -e "${CYAN}[STEP]${NC} $1"
}

log_faucet() {
    echo -e "${PURPLE}[FAUCET]${NC} $1"
}

echo ""
echo "🚰 ==============================================================="
echo "💧   FrostyFlow Test Token Quick Start Guide"
echo "🚰 ==============================================================="
echo ""

log_info "This guide will help you get test tokens for FrostyFlow testing"
echo ""

log_step "1. 📋 Test Account Information"
echo ""
log_info "Your pre-configured test accounts:"
echo ""
echo "${GREEN}Westend Test Account:${NC}"
echo "  📝 Name: FrostyFlow Test 1"
echo "  🔑 Mnemonic: bottom drive obey lake curtain smoke basket hold race lonely fit walk"
echo "  📍 Address: 15oF4uVJwmo4TdGW7VfQxNLavjCXviqxT9S1MgbjMNHr6Sp5"
echo "  💰 Token: WND (Westend)"
echo ""
echo "${GREEN}Kusama Test Account:${NC}"
echo "  📝 Name: FrostyFlow Test 2"
echo "  🔑 Mnemonic: legal winner thank year wave sausage worth useful legal winner thank yellow"
echo "  📍 Address: 14E5nqKAp3oAJcmgZhBM11NW7VgVZPgN1k7aYG1D1qZ7JfWx"
echo "  💰 Token: KSM (Kusama)"
echo ""

log_step "2. 🌐 Test Token Faucets"
echo ""
log_faucet "Westend (WND) Faucet:"
echo "  🔗 Primary: https://faucet.polkadot.io/"
echo "  🔗 Backup: https://westend.subscan.io/tools/faucet"
echo ""
log_faucet "Kusama (KSM) Faucet:"
echo "  🔗 Primary: https://kusama.network/#/faucet"
echo "  💬 Community: Join Kusama Discord #faucet channel"
echo ""
log_faucet "Bifrost (BNC) Faucet:"
echo "  🔗 Primary: https://bifrost-finance.vercel.app/faucet"
echo "  💬 Community: Join Bifrost Discord #faucet channel"
echo ""

log_step "3. 🛠️ Quick Setup Process"
echo ""
echo "${CYAN}Step 3.1: Install Wallet Extension${NC}"
echo "  📥 Chrome: https://chrome.google.com/webstore/detail/polkadot%7Bjs%7D-extension/mopnmbcafieddcagagdcbnhejhlodfdd"
echo "  📥 Firefox: https://addons.mozilla.org/en-US/firefox/addon/polkadot-js-extension/"
echo ""
echo "${CYAN}Step 3.2: Import Test Accounts${NC}"
echo "  1. Open Polkadot.js Extension"
echo "  2. Click '+' to add account"
echo "  3. Choose 'Import from seed'"
echo "  4. Use the mnemonics above"
echo "  5. Save with the suggested names"
echo ""
echo "${CYAN}Step 3.3: Get Westend (WND) Tokens${NC}"
echo "  1. Visit: https://faucet.polkadot.io/"
echo "  2. Connect your wallet"
echo "  3. Select 'Westend' network"
echo "  4. Enter your Westend address"
echo "  5. Click 'Get tokens'"
echo "  6. Wait for confirmation (usually immediate)"
echo ""
echo "${CYAN}Step 3.4: Get Kusama (KSM) Tokens${NC}"
echo "  1. Visit: https://kusama.network/#/faucet"
echo "  2. Connect your wallet"
echo "  3. Enter your Kusama address"
echo "  4. Follow faucet instructions"
echo "  5. Wait for KSM tokens (may take longer)"
echo ""

log_step "4. 🧪 Test with FrostyFlow"
echo ""
echo "${CYAN}Start Application:${NC}"
echo "  💻 Command: npm run dev:testnet"
echo "  🌐 URL: http://localhost:3000"
echo ""
echo "${CYAN}Connect Wallet:${NC}"
echo "  1. Open http://localhost:3000"
echo "  2. Click 'Connect Wallet' button"
echo "  3. Select Polkadot.js extension"
echo "  4. Authorize connection"
echo "  5. Select your test account"
echo ""
echo "${CYAN}Verify Tokens:${NC}"
echo "  1. Check that WND/KSM appear in asset list"
echo "  2. Verify balances are displayed"
echo "  3. Try switching between networks"
echo ""

log_step "5. ⚡ Quick Commands"
echo ""
echo "${GREEN}Start Application:${NC}"
echo "  npm run dev:testnet"
echo ""
echo "${GREEN}Open Faucets:${NC}"
echo "  open https://faucet.polkadot.io/      # Westend"
echo "  open https://kusama.network/#/faucet # Kusama"
echo ""
echo "${GREEN}Run Tests:${NC}"
echo "  npm run test:full     # Complete test suite"
echo "  npm run test:e2e       # End-to-end tests"
echo ""
echo "${GREEN}View Guide:${NC}"
echo "  cat TEST_TOKEN_GUIDE.md"
echo ""

log_step "6. ⚠️ Important Reminders"
echo ""
log_warning "• Test tokens have NO real value"
log_warning "• Never use test mnemonics on mainnet"
log_warning "• Testnet may be reset periodically"
log_warning "• Keep test and mainnet wallets separate"
log_warning "• Tokens may take 5-10 minutes to appear"
echo ""

log_step "7. 🆘 Troubleshooting"
echo ""
echo "${YELLOW}Tokens not arriving?${NC}"
echo "  • Wait 10-15 minutes for network confirmation"
echo "  • Check if you're on correct network"
echo "  • Verify your address is correct"
echo "  • Try alternative faucet"
echo ""
echo "${YELLOW}Wallet connection issues?${NC}"
echo "  • Refresh the page"
echo "  • Check extension permissions"
echo "  • Try different browser"
echo "  • Restart browser"
echo ""
echo "${YELLOW}Network problems?${NC}"
echo "  • Check testnet status online"
echo "  • Try alternative RPC endpoints"
echo "  • Wait for network to stabilize"
echo ""

echo ""
echo "🎉 ==============================================================="
echo "✅   Ready to Get Test Tokens!"
echo "🎉 ==============================================================="
echo ""
log_success "Quick start guide complete!"
echo ""
log_info "Next steps:"
echo "  1. 📥 Install wallet extension"
echo "  2. 🏷️  Import test accounts"
echo "  3. 🚰 Get test tokens from faucets"
echo "  4. 🧪 Test with FrostyFlow application"
echo "  5. 🔬 Run comprehensive tests"
echo ""
log_info "For detailed guide: cat TEST_TOKEN_GUIDE.md"
echo "🚰 ==============================================================="
echo ""