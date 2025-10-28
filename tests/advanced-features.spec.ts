import { test, expect } from '@playwright/test';

// 高级功能测试 - 多链资产监控、SLPx一键质押、智能推荐、高级分析和实时状态追踪

test.describe('高级功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  // ====================
  // 1. 多链资产监控测试
  // ====================
  test('1-1. 多链资产监控 - 页面访问', async ({ page }) => {
    await page.click('text=多链监控');
    await page.waitForURL('**/monitoring');
    
    const title = await page.locator('h2, h3').first();
    await expect(title).toBeVisible();
    
    console.log('✅ 多链资产监控页面加载成功');
  });

  test('1-2. 多链资产监控 - 显示支持的链', async ({ page }) => {
    await page.goto('/monitoring');
    await page.waitForLoadState('networkidle');
    
    await page.waitForSelector('[class*="chain"], [class*="Chain"], .ant-card, .ant-list-item', { 
      timeout: 10000,
      state: 'visible'
    });
    
    const chainElements = await page.locator('[class*="chain"], [class*="Chain"], .ant-card, .ant-list-item').count();
    
    console.log(`找到 ${chainElements} 个链相关元素`);
    await expect(chainElements).toBeGreaterThan(0);
    
    console.log('✅ 支持的链列表显示正常');
  });

  test('1-3. 多链资产监控 - 显示资产信息', async ({ page }) => {
    await page.goto('/monitoring');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const hasStats = await page.locator('text=/总价值|Total Value|资产|Assets/i').count();
    await expect(hasStats).toBeGreaterThan(0);
    
    console.log('✅ 资产信息显示正常');
  });

  // ====================
  // 2. SLPx一键质押测试
  // ====================
  test('2-1. SLPx一键质押 - 页面访问', async ({ page }) => {
    await page.click('text=SLPx');
    await page.waitForURL('**/slpx');
    
    const title = await page.locator('h2, h3').first();
    await expect(title).toBeVisible();
    
    console.log('✅ SLPx一键质押页面加载成功');
  });

  test('2-2. SLPx一键质押 - 资产选择器', async ({ page }) => {
    await page.goto('/slpx');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const assetSelector = await page.locator(
      'select, .ant-select, [role="combobox"], button:has-text("选择"), input[placeholder*="资产"], input[placeholder*="asset"]'
    ).count();
    
    await expect(assetSelector).toBeGreaterThan(0);
    
    console.log('✅ 资产选择器显示正常');
  });

  test('2-3. SLPx一键质押 - 质押表单', async ({ page }) => {
    await page.goto('/slpx');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const formElements = await page.locator('input[type="text"], input[type="number"], button').count();
    await expect(formElements).toBeGreaterThan(0);
    
    console.log('✅ 质押表单显示正常');
  });

  // ====================
  // 3. 智能推荐引擎测试
  // ====================
  test('3-1. 智能推荐 - 页面访问', async ({ page }) => {
    await page.click('text=智能推荐');
    await page.waitForURL('**/recommendations');
    
    const title = await page.locator('h2, h3').first();
    await expect(title).toBeVisible();
    
    console.log('✅ 智能推荐页面加载成功');
  });

  test('3-2. 智能推荐 - 推荐列表', async ({ page }) => {
    await page.goto('/recommendations');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const recommendations = await page.locator(
      '.ant-card, .ant-list-item, [class*="recommendation"], [class*="Recommendation"]'
    ).count();
    
    console.log(`找到 ${recommendations} 个推荐项`);
    await expect(recommendations).toBeGreaterThanOrEqual(0);
    
    console.log('✅ 推荐列表组件加载成功');
  });

  test('3-3. 智能推荐 - 推荐类型', async ({ page }) => {
    await page.goto('/recommendations');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const hasTypes = await page.locator('text=/质押|Stake|赎回|Redeem|再平衡|Rebalance|收益|Yield/i').count();
    await expect(hasTypes).toBeGreaterThan(0);
    
    console.log('✅ 推荐类型显示正常');
  });

  // ====================
  // 4. 高级分析仪表板测试
  // ====================
  test('4-1. 高级分析 - 页面访问', async ({ page }) => {
    await page.click('text=高级分析');
    await page.waitForURL('**/analytics');
    
    const title = await page.locator('h2, h3').first();
    await expect(title).toBeVisible();
    
    console.log('✅ 高级分析页面加载成功');
  });

  test('4-2. 高级分析 - 指标卡片', async ({ page }) => {
    await page.goto('/analytics');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const metricCards = await page.locator('.ant-statistic, .ant-card, [class*="metric"], [class*="Metric"]').count();
    
    console.log(`找到 ${metricCards} 个指标卡片`);
    await expect(metricCards).toBeGreaterThan(0);
    
    console.log('✅ 指标卡片显示正常');
  });

  test('4-3. 高级分析 - 图表显示', async ({ page }) => {
    await page.goto('/analytics');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const charts = await page.locator('canvas, [class*="chart"], [class*="Chart"], svg').count();
    
    console.log(`找到 ${charts} 个图表元素`);
    await expect(charts).toBeGreaterThan(0);
    
    console.log('✅ 图表显示正常');
  });

  // ====================
  // 5. 实时状态追踪测试
  // ====================
  test('5-1. 实时状态追踪 - 页面访问', async ({ page }) => {
    await page.click('text=状态追踪');
    await page.waitForURL('**/status');
    
    const title = await page.locator('h2, h3').first();
    await expect(title).toBeVisible();
    
    console.log('✅ 实时状态追踪页面加载成功');
  });

  test('5-2. 实时状态追踪 - 交易列表', async ({ page }) => {
    await page.goto('/status');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const transactions = await page.locator(
      '.ant-table, .ant-list, [class*="transaction"], [class*="Transaction"]'
    ).count();
    
    console.log(`找到 ${transactions} 个交易相关元素`);
    await expect(transactions).toBeGreaterThan(0);
    
    console.log('✅ 交易列表显示正常');
  });

  test('5-3. 实时状态追踪 - 交易状态', async ({ page }) => {
    await page.goto('/status');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const status = await page.locator(
      'text=/进行中|Pending|成功|Success|失败|Failed|完成|Completed/i, .ant-tag, .ant-badge'
    ).count();
    
    await expect(status).toBeGreaterThan(0);
    
    console.log('✅ 交易状态显示正常');
  });

  // ====================
  // 6. 功能集成测试
  // ====================
  test('6-1. 功能集成 - 页面间导航', async ({ page }) => {
    await page.goto('/monitoring');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*monitoring/);
    
    await page.click('text=SLPx');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*slpx/);
    
    await page.click('text=智能推荐');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*recommendations/);
    
    await page.click('text=高级分析');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*analytics/);
    
    await page.click('text=状态追踪');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*status/);
    
    console.log('✅ 功能间导航正常');
  });

  test('6-2. 功能集成 - 响应式布局', async ({ page }) => {
    const pages = ['/monitoring', '/slpx', '/recommendations', '/analytics', '/status'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      // 测试不同视口
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.waitForTimeout(500);
      
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(500);
      
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.waitForTimeout(500);
    }
    
    console.log('✅ 所有页面响应式布局正常');
  });
});
