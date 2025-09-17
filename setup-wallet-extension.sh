#!/bin/bash

# FrostyFlow Wallet Extension Setup Script
# This script automates the setup of wallet extensions for testing

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create extensions directory
EXTENSIONS_DIR="./extensions"
mkdir -p "$EXTENSIONS_DIR"

# Download Polkadot.js Extension
download_polkadot_extension() {
    log_info "Downloading Polkadot.js Extension..."
    
    # Get the latest version from Chrome Web Store (this is a simplified approach)
    # In a real scenario, you'd want to get the actual latest version URL
    EXTENSION_URL="https://github.com/polkadot-js/extension/releases/download/v0.47.1/polkadot-js-extension.zip"
    EXTENSION_FILE="$EXTENSIONS_DIR/polkadot-js-extension.zip"
    
    if command -v curl &> /dev/null; then
        curl -L -o "$EXTENSION_FILE" "$EXTENSION_URL" || log_warning "Could not download extension, will use local setup"
    elif command -v wget &> /dev/null; then
        wget -O "$EXTENSION_FILE" "$EXTENSION_URL" || log_warning "Could not download extension, will use local setup"
    else
        log_warning "Neither curl nor wget found, skipping extension download"
    fi
    
    # Extract if downloaded
    if [ -f "$EXTENSION_FILE" ]; then
        cd "$EXTENSIONS_DIR"
        unzip -o polkadot-js-extension.zip -d polkadot-js-extension || log_warning "Could not extract extension"
        rm polkadot-js-extension.zip
        cd ..
        log_success "Polkadot.js Extension downloaded and extracted"
    else
        log_warning "Extension file not found, manual setup required"
    fi
}

# Create test wallet account
create_test_wallet() {
    log_info "Creating test wallet configuration..."
    
    # Create a simple wallet config file for testing
    cat > "$EXTENSIONS_DIR/test-wallet-config.json" << 'EOF'
{
  "testnetAccounts": [
    {
      "name": "Test Account 1",
      "address": "15oF4uVJwmo4TdGW7VfQxNLavjCXviqxT9S1MgbjMNHr6Sp5",
      "network": "westend",
      "mnemonic": "bottom drive obey lake curtain smoke basket hold race lonely fit walk"
    },
    {
      "name": "Test Account 2", 
      "address": "14E5nqKAp3oAJcmgZhBM11NW7VgVZPgN1k7aYG1D1qZ7JfWx",
      "network": "kusama",
      "mnemonic": "legal winner thank year wave sausage worth useful legal winner thank yellow"
    }
  ],
  "testTokens": {
    "westend": "https://faucet.polkadot.io/",
    "kusama": "https://kusama.network/#/faucet"
  }
}
EOF
    
    log_success "Test wallet configuration created"
}

# Create manual setup instructions
create_setup_instructions() {
    log_info "Creating setup instructions..."
    
    cat > "$EXTENSIONS_DIR/SETUP.md" << 'EOF'
# Wallet Extension Setup Instructions

## Manual Setup

### 1. Install Polkadot.js Extension
- Chrome: https://chrome.google.com/webstore/detail/polkadot%7Bjs%7D-extension/mopnmbcafieddcagagdcbnhejhlodfdd
- Firefox: https://addons.mozilla.org/en-US/firefox/addon/polkadot-js-extension/

### 2. Create Test Accounts
Open the extension and create/import test accounts:

**Westend Test Account:**
- Name: FrostyFlow Test 1
- Mnemonic: `bottom drive obey lake curtain smoke basket hold race lonely fit walk`
- Address: `15oF4uVJwmo4TdGW7VfQxNLavjCXviqxT9S1MgbjMNHr6Sp5`

**Kusama Test Account:**
- Name: FrostyFlow Test 2  
- Mnemonic: `legal winner thank year wave sausage worth useful legal winner thank yellow`
- Address: `14E5nqKAp3oAJcmgZhBM11NW7VgVZPgN1k7aYG1D1qZ7JfWx`

### 3. Get Test Tokens
- **Westend (WND)**: https://faucet.polkadot.io/
- **Kusama (KSM)**: https://kusama.network/#/faucet

### 4. Configure Extension Settings
- Enable "Allow this extension to read and change site data"
- Enable "Allow in incognito"
- Add testnet networks if not automatically detected

### 5. Run Tests
```bash
npm run test:e2e
```

## Automated Testing

The test suite will:
1. Launch browser with extension loaded
2. Navigate to FrostyFlow app
3. Connect wallet automatically
4. Test network switching
5. Test basic functionality

## Troubleshooting

**Extension not detected:**
- Ensure extension is enabled in browser
- Check extension permissions
- Restart browser

**Network connection issues:**
- Verify RPC endpoints in .env.local
- Check internet connection
- Try different RPC endpoints

**Transaction failures:**
- Ensure sufficient test tokens
- Check network status
- Verify account permissions
EOF
    
    log_success "Setup instructions created"
}

# Main setup function
main() {
    log_info "Starting wallet extension setup..."
    
    download_polkadot_extension
    create_test_wallet
    create_setup_instructions
    
    echo ""
    log_success "Wallet extension setup completed!"
    echo ""
    log_info "Next steps:"
    echo "1. Install wallet extension manually (see $EXTENSIONS_DIR/SETUP.md)"
    echo "2. Create/import test accounts"
    echo "3. Get test tokens from faucets"
    echo "4. Run tests: npm run test:e2e"
    echo ""
}

# Run main function
main "$@"