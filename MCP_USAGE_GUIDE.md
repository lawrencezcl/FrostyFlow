# FrostyFlow UI/UX MCP Usage Guide

## 🎯 Overview

Successfully installed and configured UI/UX MCPs for FrostyFlow testing:

### Installed MCPs:
- **@playwright/mcp** - UI automation testing
- **figma-developer-mcp** - Design system integration  
- **@antv/mcp-server-chart** - Data visualization
- **@modelcontextprotocol/sdk** - TypeScript MCP support

## 🚀 Usage Examples

### 1. UI Testing with Playwright MCP
```bash
# Test wallet connection flow
npx @playwright/mcp --headless --device="iPhone 15"

# Test responsive design
npx @playwright/mcp --viewport-size="1280,720"
```

### 2. Figma Design Integration
```bash
# Set up Figma token
export FIGMA_API_TOKEN="your_figma_token_here"

# Run Figma MCP
npx figma-developer-mcp
```

### 3. Chart Generation
```bash
# Start chart MCP server
npx @antv/mcp-server-chart --transport=sse --port=1122
```

## 🧪 Test Scripts

- `test-mcp.js` - Basic MCP functionality test
- `test-ui-mcp.js` - Component-specific integration test
- `mcp-config.json` - MCP server configuration

## 📊 Testing Coverage

### UI Components:
- WalletConnect (wallet connection flows)
- Layout (responsive design)
- ModernWalletConnect (modern UI interactions)
- CleanModernLayout (design system)

### Capabilities:
- Automated UI testing
- Design-to-code generation
- Data visualization
- Responsive design validation
- Cross-browser testing

## 🔧 Configuration

Edit `mcp-config.json` to customize MCP settings:
- Add API tokens
- Configure server ports
- Set up allowed origins

## 🎨 Next Steps

1. **Design Integration**: Connect Figma to sync designs
2. **UI Testing**: Write Playwright tests for key flows
3. **Data Viz**: Add charts to asset overview pages
4. **Automation**: Set up CI/CD with MCP testing

---

**Status**: ✅ All MCPs installed and tested successfully
**Components**: 4 React components ready for MCP testing
**Next**: Integrate with your development workflow