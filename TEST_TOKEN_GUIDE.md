# 🚰 FrostyFlow Test Token Guide

## 📋 Overview
To fully test the FrostyFlow application on testnet, you'll need test tokens for staking operations. This guide covers how to get test tokens for each supported network.

## 🔗 Test Token Faucets

### 1. Westend (WND) - Polkadot Testnet
**Primary Faucet**: https://faucet.polkadot.io/

**Steps:**
1. Visit https://faucet.polkadot.io/
2. Connect your Polkadot.js wallet (or paste your address)
3. Select "Westend" network
4. Click "Get tokens" or similar button
5. Wait for tokens to arrive (usually within seconds)

**Alternative Faucets:**
- https://westend.subscan.io/tools/faucet
- https://parachain.tools/westend-faucet

---

### 2. Kusama (KSM) - Kusama Network
**Official Faucet**: https://kusama.network/#/faucet

**Steps:**
1. Visit https://kusama.network/#/faucet
2. Connect your wallet or enter your address
3. Follow the faucet instructions
4. Complete any required verification (if applicable)
5. Wait for KSM tokens to arrive

**Alternative Options:**
- Join Kusama Discord and request tokens in #faucet channel
- Check Kusama community forums for faucet announcements

---

### 3. Bifrost (BNC) - Bifrost Testnet
**Bifrost Faucet**: https://bifrost-finance.vercel.app/faucet

**Steps:**
1. Visit the Bifrost faucet
2. Connect your wallet
3. Select the testnet network
4. Request BNC tokens
5. Wait for confirmation

**Alternative Methods:**
- Join Bifrost Discord and request in #faucet channel
- Check Bifrost community Telegram groups

---

## 💳 Test Wallet Setup

### Pre-configured Test Accounts

Your testnet setup includes these test accounts:

**Westend Test Account:**
- **Name**: FrostyFlow Test 1
- **Mnemonic**: `bottom drive obey lake curtain smoke basket hold race lonely fit walk`
- **Address**: `15oF4uVJwmo4TdGW7VfQxNLavjCXviqxT9S1MgbjMNHr6Sp5`
- **Network**: Westend Testnet
- **Token**: WND

**Kusama Test Account:**
- **Name**: FrostyFlow Test 2
- **Mnemonic**: `legal winner thank year wave sausage worth useful legal winner thank yellow`
- **Address**: `14E5nqKAp3oAJcmgZhBM11NW7VgVZPgN1k7aYG1D1qZ7JfWx`
- **Network**: Kusama
- **Token**: KSM

---

## 🛠️ Step-by-Step Token Acquisition Process

### Step 1: Install Wallet Extension
```bash
# Install one of these:
- Chrome: https://chrome.google.com/webstore/detail/polkadot%7Bjs%7D-extension/mopnmbcafieddcagagdcbnhejhlodfdd
- Firefox: https://addons.mozilla.org/en-US/firefox/addon/polkadot-js-extension/
```

### Step 2: Import/Create Test Accounts
1. Open Polkadot.js Extension
2. Click "+" to create new account or import existing
3. Use the mnemonics provided above
4. Save account names for easy identification

### Step 3: Get Westend (WND) Tokens
```bash
# 1. Visit faucet
open https://faucet.polkadot.io/

# 2. Connect wallet
# - Click "Connect wallet"
# - Select Polkadot.js extension
# - Authorize connection

# 3. Select Westend network
# - Choose "Westend" from network dropdown

# 4. Enter address or use connected wallet
# - Your Westend address: 15oF4uVJwmo4TdGW7VfQxNLavjCXviqxT9S1MgbjMNHr6Sp5

# 5. Request tokens
# - Click "Get tokens" or "Request WND"
# - Wait for confirmation (usually immediate)
```

### Step 4: Get Kusama (KSM) Tokens
```bash
# 1. Visit Kusama faucet
open https://kusama.network/#/faucet

# 2. Connect wallet
# - Authorize wallet connection

# 3. Enter address
# - Your Kusama address: 14E5nqKAp3oAJcmgZhBM11NW7VgVZPgN1k7aYG1D1qZ7JfWx

# 4. Follow faucet instructions
# - Complete any verification steps
# - Wait for KSM tokens (may take longer than WND)
```

### Step 5: Verify Token Receipt
```bash
# 1. Open FrostyFlow application
npm run dev:testnet

# 2. Connect your wallet
# - Click "Connect Wallet"
# - Select your test account

# 3. Check balance
# - Your WND/KSM tokens should appear in the asset list
# - Balances should update automatically
```

---

## 🔍 Troubleshooting

### Common Issues

**Tokens Not Arriving:**
- Wait 5-10 minutes for network confirmation
- Check if you're on the correct network
- Verify your address is correct
- Try a different faucet

**Wallet Connection Issues:**
- Ensure extension is properly installed
- Check browser permissions
- Refresh the page and try again
- Try a different browser

**Network Problems:**
- Verify you're connected to testnet, not mainnet
- Check if testnet networks are operational
- Try alternative RPC endpoints

**Faucet Limitations:**
- Most faucets have daily limits
- Some require social media verification
- Try again after 24 hours if needed

---

## 📱 Mobile Testing

For mobile testing, consider these wallet apps:

**Polkadot.js Mobile:**
- Available on iOS and Android
- Same mnemonic compatibility
- Testnet network support

**Talisman Mobile:**
- Good user interface
- Testnet support
- Easy account management

---

## ⚠️ Important Notes

### Security Considerations
- **Never use testnet mnemonics on mainnet**
- **Test tokens have no real value**
- **Testnet wallets are for testing only**
- **Do not store real assets in testnet wallets**

### Token Limitations
- **Test tokens cannot be converted to real tokens**
- **Testnet transactions are free**
- **Testnet may be reset periodically**
- **Token balances may be wiped during network upgrades**

### Best Practices
- **Use separate testnet and mainnet wallets**
- **Keep backup of test mnemonics**
- **Test with small amounts first**
- **Monitor testnet network status**

---

## 🎯 Quick Start Commands

```bash
# 1. Start application in testnet mode
npm run dev:testnet

# 2. Open faucets in browser
open https://faucet.polkadot.io/      # Westend WND
open https://kusama.network/#/faucet # Kusama KSM

# 3. Check your addresses
# Westend: 15oF4uVJwmo4TdGW7VfQxNLavjCXviqxT9S1MgbjMNHr6Sp5
# Kusama:   14E5nqKAp3oAJcmgZhBM11NW7VgVZPgN1k7aYG1D1qZ7JfWx

# 4. Run comprehensive tests
npm run test:full

# 5. View application
open http://localhost:3000
```

---

## 📞 Community Support

If you need additional test tokens or encounter issues:

**Discord Communities:**
- Polkadot: https://discord.gg/polkadot
- Kusama: https://discord.gg/kusama
- Bifrost: https://discord.gg/bifrost

**Support Channels:**
- #faucet channels for token requests
- #support for technical issues
- #testnet for testnet-specific help

---

## 🔄 Next Steps After Getting Tokens

Once you have test tokens:

1. **Connect Wallet**: Use Polkadot.js extension with FrostyFlow
2. **Switch Networks**: Test different testnet networks
3. **Check Balances**: Verify tokens appear in the app
4. **Test Staking**: Try small staking operations
5. **Test Redemption**: Redeem liquid tokens
6. **Run E2E Tests**: Execute full test suite

**Remember**: Test tokens are for testing purposes only and have no real monetary value!

---

**Happy Testing! 🚀**