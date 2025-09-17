# ✅ FrostyFlow Test Token Acquisition Checklist

## 🎯 **QUICK START** - 5 Steps to Testing

### **Step 1️⃣: Install Wallet Extension** ✅
- [ ] **Chrome**: Install from [Chrome Web Store](https://chrome.google.com/webstore/detail/polkadot%7Bjs%7D-extension/mopnmbcafieddcagagdcbnhejhlodfdd)
- [ ] **Firefox**: Install from [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/polkadot-js-extension/)
- [ ] **Extension Setup**: Pin extension to toolbar for easy access

### **Step 2️⃣: Import Test Accounts** ✅
- [ ] **Westend Account**:
  - [ ] Open Polkadot.js extension
  - [ ] Click "+" → "Import from seed"
  - [ ] Use mnemonic: `bottom drive obey lake curtain smoke basket hold race lonely fit walk`
  - [ ] Name: `FrostyFlow Test 1`
  - [ ] Save password securely

- [ ] **Kusama Account**:
  - [ ] Click "+" → "Import from seed"
  - [ ] Use mnemonic: `legal winner thank year wave sausage worth useful legal winner thank yellow`
  - [ ] Name: `FrostyFlow Test 2`
  - [ ] Save password securely

### **Step 3️⃣: Get Westend (WND) Tokens** ✅
- [ ] **Primary Faucet**: [https://faucet.polkadot.io/](https://faucet.polkadot.io/)
  - [ ] Connect wallet (should open automatically)
  - [ ] Select "Westend" network
  - [ ] Use address: `15oF4uVJwmo4TdGW7VfQxNLavjCXviqxT9S1MgbjMNHr6Sp5`
  - [ ] Click "Get tokens"
  - [ ] Wait for confirmation (usually immediate)

- [ ] **Backup Faucet** (if primary fails): [https://westend.subscan.io/tools/faucet](https://westend.subscan.io/tools/faucet)
  - [ ] Enter address manually
  - [ ] Complete captcha if required
  - [ ] Wait for tokens

### **Step 4️⃣: Get Kusama (KSM) Tokens** ✅
- [ ] **Primary Faucet**: [https://kusama.network/#/faucet](https://kusama.network/#/faucet)
  - [ ] Connect wallet
  - [ ] Use address: `14E5nqKAp3oAJcmgZhBM11NW7VgVZPgN1k7aYG1D1qZ7JfWx`
  - [ ] Follow any verification steps
  - [ ] Wait for KSM tokens (may take longer)

- [ ] **Alternative Methods** (if faucet doesn't work):
  - [ ] Join Kusama Discord #faucet channel
  - [ ] Request tokens from community members
  - [ ] Check community forums

### **Step 5️⃣: Test with FrostyFlow** ✅
- [ ] **Start Application**: `npm run dev:testnet`
- [ ] **Open Browser**: Go to `http://localhost:3000`
- [ ] **Connect Wallet**: Click "Connect Wallet" → Select Polkadot.js
- [ ] **Select Account**: Choose your test account
- [ ] **Verify Tokens**: Check that WND/KSM appear in asset list
- [ ] **Test Networks**: Switch between different testnets
- [ ] **Try Operations**: Test staking with small amounts

---

## 📋 **DETAILED SETUP GUIDE**

### **🔑 Account Information**

| Network | Account Name | Address | Token | Mnemonic |
|---------|-------------|---------|-------|-----------|
| **Westend** | FrostyFlow Test 1 | `15oF4uVJwmo4TdGW7VfQxNLavjCXviqxT9S1MgbjMNHr6Sp5` | WND | `bottom drive obey lake curtain smoke basket hold race lonely fit walk` |
| **Kusama** | FrostyFlow Test 2 | `14E5nqKAp3oAJcmgZhBM11NW7VgVZPgN1k7aYG1D1qZ7JfWx` | KSM | `legal winner thank year wave sausage worth useful legal winner thank yellow` |

### **🌐 Faucet Links**

| Network | Primary Faucet | Backup Faucet | Community Support |
|---------|---------------|---------------|------------------|
| **Westend** | [faucet.polkadot.io](https://faucet.polkadot.io/) | [westend.subscan.io](https://westend.subscan.io/tools/faucet) | [Polkadot Discord](https://discord.gg/polkadot) |
| **Kusama** | [kusama.network/#/faucet](https://kusama.network/#/faucet) | *Community-based* | [Kusama Discord](https://discord.gg/kusama) |
| **Bifrost** | [bifrost-finance.vercel.app/faucet](https://bifrost-finance.vercel.app/faucet) | *Community-based* | [Bifrost Discord](https://discord.gg/bifrost) |

---

## ⚠️ **IMPORTANT WARNINGS**

### **🔒 Security**
- [ ] **NEVER** use testnet mnemonics on mainnet
- [ ] **NEVER** store real assets in testnet wallets
- [ ] **ALWAYS** keep test and mainnet wallets separate
- [ ] **BEWARE** of phishing sites - only use official faucets

### **💰 Token Information**
- [ ] Test tokens have **NO real value**
- [ ] Test tokens **CANNOT** be converted to real tokens
- [ ] Testnet transactions are **FREE**
- [ ] Testnet may be **RESET** periodically

### **⏱️ Timing Expectations**
- [ ] **WND tokens**: Usually arrive within seconds
- [ ] **KSM tokens**: May take 5-30 minutes
- [ ] **Network sync**: Allow 1-2 minutes for balance updates
- [ ] **Faucet limits**: Most have daily limits per address

---

## 🛠️ **TROUBLESHOOTING**

### **❌ Tokens Not Arriving**
- [ ] Wait 10-15 minutes for network confirmation
- [ ] Check if you're on the correct network
- [ ] Verify your address is correct
- [ ] Try alternative faucet
- [ ] Check if you've hit daily limits

### **🔗 Wallet Connection Issues**
- [ ] Refresh the browser page
- [ ] Check extension permissions
- [ ] Try a different browser
- [ ] Restart the browser
- [ ] Re-import the account

### **🌐 Network Problems**
- [ ] Check testnet status online
- [ ] Try alternative RPC endpoints
- [ ] Wait for network to stabilize
- [ ] Check your internet connection

### **📱 Balance Not Showing**
- [ ] Ensure wallet is connected to FrostyFlow
- [ ] Switch to the correct network in the app
- [ ] Refresh the application
- [ ] Wait for balance sync (1-2 minutes)

---

## 🎯 **SUCCESS CRITERIA**

### **✅ Setup Complete When:**
- [ ] Wallet extension is installed and working
- [ ] Both test accounts are imported successfully
- [ ] You have received WND tokens in Westend account
- [ ] You have received KSM tokens in Kusama account
- [ ] FrostyFlow application shows your token balances
- [ ] You can switch between networks successfully

### **✅ Testing Complete When:**
- [ ] You can perform small staking operations
- [ ] You can switch between different testnets
- [ ] All balances update correctly
- [ ] No errors in browser console
- [ ] Application responds to user interactions

---

## 📞 **SUPPORT & COMMUNITY**

### **Discord Servers**
- **Polkadot**: https://discord.gg/polkadot
- **Kusama**: https://discord.gg/kusama
- **Bifrost**: https://discord.gg/bifrost

### **Helpful Channels**
- `#faucet` - Token requests
- `#support` - Technical issues
- `#testnet` - Testnet-specific help
- `#polkadot-js` - Wallet extension help

### **Documentation**
- **Polkadot.js**: https://polkadot.js.org/docs/
- **Westend**: https://wiki.polkadot.io/docs/learn-wasm/#westend-test-network
- **Kusama**: https://wiki.polkadot.io/docs/learn-kusama/

---

## 🚀 **NEXT STEPS AFTER SETUP**

### **Immediate Testing**
- [ ] Test small staking operations (0.1-1 WND)
- [ ] Test network switching
- [ ] Test wallet disconnection/reconnection
- [ ] Verify all UI elements work correctly

### **Advanced Testing**
- [ ] Run complete test suite: `npm run test:complete`
- [ ] Test edge cases and error handling
- [ ] Verify transaction history
- [ ] Test with multiple accounts

### **Production Preparation**
- [ ] Document any issues found
- [ ] Prepare for mainnet deployment
- [ ] Create comprehensive test reports
- [ ] Plan security audit

---

## 📝 **FINAL CHECKLIST**

**Before Testing:**
- [ ] Wallet extension installed ✅
- [ ] Test accounts imported ✅
- [ ] Test tokens received ✅
- [ ] FrostyFlow running ✅
- [ ] Wallet connected ✅

**Ready to Test:**
- [ ] Can see token balances ✅
- [ ] Can switch networks ✅
- [ ] Can perform basic operations ✅
- [ ] No major errors ✅

**🎉 CONGRATULATIONS! You're ready to test FrostyFlow on testnet!**

---

*Remember: Test tokens are for testing purposes only and have no real monetary value!*