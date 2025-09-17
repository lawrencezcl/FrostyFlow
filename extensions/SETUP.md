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
