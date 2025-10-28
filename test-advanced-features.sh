#!/bin/bash

# FrostyFlow 高级功能手动测试脚本
# 通过浏览器快速验证所有功能页面

echo "======================================"
echo "FrostyFlow 高级功能测试"
echo "======================================"
echo ""

# 检查服务是否运行
echo "检查开发服务器状态..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ 开发服务器正在运行"
else
    echo "❌ 开发服务器未运行，请先执行 'npm start'"
    exit 1
fi

echo ""
echo "======================================"
echo "开始功能测试"
echo "======================================"
echo ""

# 测试页面列表
declare -A pages
pages["/"]="首页"
pages["/monitoring"]="多链资产监控"
pages["/slpx"]="SLPx一键质押"
pages["/recommendations"]="智能推荐引擎"
pages["/analytics"]="高级分析仪表板"
pages["/status"]="实时状态追踪"

# 测试计数
total=0
passed=0
failed=0

# 测试每个页面
for path in "${!pages[@]}"; do
    total=$((total + 1))
    name="${pages[$path]}"
    
    echo "测试 ${total}: ${name}"
    echo "URL: http://localhost:3000${path}"
    
    # 发送请求并检查响应
    response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000${path}")
    
    if [ "$response" == "200" ]; then
        echo "✅ 状态码: $response - 通过"
        passed=$((passed + 1))
        
        # 检查页面内容
        content=$(curl -s "http://localhost:3000${path}")
        if echo "$content" | grep -q "FrostyFlow"; then
            echo "   ✓ 页面包含FrostyFlow标识"
        fi
        if echo "$content" | grep -q "react"; then
            echo "   ✓ React应用正常加载"
        fi
    else
        echo "❌ 状态码: $response - 失败"
        failed=$((failed + 1))
    fi
    
    echo ""
done

echo "======================================"
echo "测试结果汇总"
echo "======================================"
echo "总计: $total"
echo "通过: $passed"
echo "失败: $failed"
echo "通过率: $(awk "BEGIN {printf \"%.1f\", ($passed/$total)*100}")%"
echo ""

# 详细功能检查
echo "======================================"
echo "功能组件检查"
echo "======================================"
echo ""

echo "1. 多链资产监控 (/monitoring)"
echo "   - 页面文件: src/pages/MultiChainAssetMonitoring.tsx"
echo "   - 服务文件: src/services/multiChainMonitoringService.ts"
if [ -f "src/pages/MultiChainAssetMonitoring.tsx" ]; then
    echo "   ✅ 页面文件存在"
else
    echo "   ❌ 页面文件不存在"
fi
if [ -f "src/services/multiChainMonitoringService.ts" ]; then
    echo "   ✅ 服务文件存在"
else
    echo "   ❌ 服务文件不存在"
fi
echo ""

echo "2. SLPx一键质押 (/slpx)"
echo "   - 页面文件: src/pages/SLPxOneClickStaking.tsx"
echo "   - 服务文件: src/services/slpxService.ts"
if [ -f "src/pages/SLPxOneClickStaking.tsx" ]; then
    echo "   ✅ 页面文件存在"
else
    echo "   ❌ 页面文件不存在"
fi
if [ -f "src/services/slpxService.ts" ]; then
    echo "   ✅ 服务文件存在"
else
    echo "   ❌ 服务文件不存在"
fi
echo ""

echo "3. 智能推荐引擎 (/recommendations)"
echo "   - 页面文件: src/pages/SmartRecommendationEngine.tsx"
echo "   - 服务文件: src/services/smartRecommendationService.ts"
if [ -f "src/pages/SmartRecommendationEngine.tsx" ]; then
    echo "   ✅ 页面文件存在"
else
    echo "   ❌ 页面文件不存在"
fi
if [ -f "src/services/smartRecommendationService.ts" ]; then
    echo "   ✅ 服务文件存在"
else
    echo "   ❌ 服务文件不存在"
fi
echo ""

echo "4. 高级分析仪表板 (/analytics)"
echo "   - 页面文件: src/pages/AdvancedAnalyticsDashboard.tsx"
echo "   - 服务文件: src/services/advancedAnalyticsService.ts"
if [ -f "src/pages/AdvancedAnalyticsDashboard.tsx" ]; then
    echo "   ✅ 页面文件存在"
else
    echo "   ❌ 页面文件不存在"
fi
if [ -f "src/services/advancedAnalyticsService.ts" ]; then
    echo "   ✅ 服务文件存在"
else
    echo "   ❌ 服务文件不存在"
fi
echo ""

echo "5. 实时状态追踪 (/status)"
echo "   - 页面文件: src/pages/RealtimeStatusTracking.tsx"
echo "   - 服务文件: src/services/realtimeStatusTrackingService.ts"
if [ -f "src/pages/RealtimeStatusTracking.tsx" ]; then
    echo "   ✅ 页面文件存在"
else
    echo "   ❌ 页面文件不存在"
fi
if [ -f "src/services/realtimeStatusTrackingService.ts" ]; then
    echo "   ✅ 服务文件存在"
else
    echo "   ❌ 服务文件不存在"
fi
echo ""

echo "======================================"
echo "浏览器测试提示"
echo "======================================"
echo ""
echo "请在浏览器中手动验证以下功能："
echo ""
echo "1. 多链资产监控 (http://localhost:3000/monitoring)"
echo "   □ 显示支持的区块链网络"
echo "   □ 显示资产列表和总价值"
echo "   □ 链分布可视化正常"
echo ""
echo "2. SLPx一键质押 (http://localhost:3000/slpx)"
echo "   □ 资产选择器正常工作"
echo "   □ 金额输入和验证正常"
echo "   □ 路由和费用信息显示"
echo ""
echo "3. 智能推荐引擎 (http://localhost:3000/recommendations)"
echo "   □ 推荐卡片列表显示"
echo "   □ 推荐类型和优先级正确"
echo "   □ 操作按钮可用"
echo ""
echo "4. 高级分析仪表板 (http://localhost:3000/analytics)"
echo "   □ 关键指标卡片显示"
echo "   □ 图表正确渲染"
echo "   □ 时间范围选择器工作"
echo ""
echo "5. 实时状态追踪 (http://localhost:3000/status)"
echo "   □ 交易列表/表格显示"
echo "   □ 状态标签正确"
echo "   □ 过滤和搜索功能正常"
echo ""

echo "======================================"
echo "测试完成"
echo "======================================"

# 根据结果返回退出码
if [ $failed -eq 0 ]; then
    exit 0
else
    exit 1
fi
