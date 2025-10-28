import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Select, Button, Spin, Alert, Space } from 'antd';
import { 
  BarChartOutlined, 
  LineChartOutlined, 
  PieChartOutlined,
  RiseOutlined,
  BulbOutlined,
  ReloadOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { Line, Bar, Pie, Area } from '@ant-design/plots';
import { useAppSelector } from '../redux/hooks';
import advancedAnalytics from '../services/advancedAnalyticsService';
import { AnalyticsData, TimeRange, ChartData } from '../types/analytics';

const { Title, Text } = Typography;

const AdvancedAnalyticsDashboard: React.FC = () => {
  const { account, isConnected } = useAppSelector(state => state.wallet);
  
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>({
    start: Date.now() - 30 * 24 * 60 * 60 * 1000,
    end: Date.now(),
    period: '30d',
    granularity: 'day'
  });

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange, account]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await advancedAnalytics.getAnalyticsData(
        timeRange,
        isConnected ? account?.address : undefined
      );
      setAnalyticsData(data);
    } catch (error: any) {
      setError(error.message || '加载分析数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeRangeChange = (period: string) => {
    const now = Date.now();
    let start = now;
    let granularity: 'minute' | 'hour' | 'day' | 'week' | 'month' = 'day';

    switch (period) {
      case '1h':
        start = now - 60 * 60 * 1000;
        granularity = 'minute';
        break;
      case '24h':
        start = now - 24 * 60 * 60 * 1000;
        granularity = 'hour';
        break;
      case '7d':
        start = now - 7 * 24 * 60 * 60 * 1000;
        granularity = 'day';
        break;
      case '30d':
        start = now - 30 * 24 * 60 * 60 * 1000;
        granularity = 'day';
        break;
      case '90d':
        start = now - 90 * 24 * 60 * 60 * 1000;
        granularity = 'week';
        break;
      case '1y':
        start = now - 365 * 24 * 60 * 60 * 1000;
        granularity = 'month';
        break;
    }

    setTimeRange({
      start,
      end: now,
      period: period as any,
      granularity
    });
  };

  const renderMetricsCards = () => {
    if (!analyticsData) return null;

    const { metrics } = analyticsData;
    
    return (
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary">总锁定价值</Text>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                ${metrics.totalValueLocked.current.toLocaleString()}
              </div>
              <div style={{ 
                color: metrics.totalValueLocked.trend === 'up' ? '#52c41a' : '#ff4d4f',
                fontSize: '14px'
              }}>
                {metrics.totalValueLocked.trend === 'up' ? '↗' : '↘'} 
                {metrics.totalValueLocked.changePercent.toFixed(2)}%
              </div>
            </div>
          </Card>
        </Col>
        
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary">总收益</Text>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                ${metrics.totalRewards.current.toLocaleString()}
              </div>
              <div style={{ 
                color: metrics.totalRewards.trend === 'up' ? '#52c41a' : '#ff4d4f',
                fontSize: '14px'
              }}>
                {metrics.totalRewards.trend === 'up' ? '↗' : '↘'} 
                {metrics.totalRewards.changePercent.toFixed(2)}%
              </div>
            </div>
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary">平均APY</Text>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
                {metrics.averageAPY.current.toFixed(2)}%
              </div>
              <div style={{ 
                color: metrics.averageAPY.trend === 'up' ? '#52c41a' : '#ff4d4f',
                fontSize: '14px'
              }}>
                {metrics.averageAPY.trend === 'up' ? '↗' : '↘'} 
                {metrics.averageAPY.changePercent.toFixed(2)}%
              </div>
            </div>
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary">成功率</Text>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>
                {metrics.successRate.current.toFixed(1)}%
              </div>
              <div style={{ 
                color: metrics.successRate.trend === 'up' ? '#52c41a' : '#ff4d4f',
                fontSize: '14px'
              }}>
                {metrics.successRate.trend === 'up' ? '↗' : '↘'} 
                {metrics.successRate.changePercent.toFixed(2)}%
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    );
  };

  const renderChart = (chart: ChartData) => {
    const commonConfig = {
      data: chart.data.map(point => ({
        ...point,
        x: chart.config.xAxis.type === 'time' ? new Date(point.x as number) : point.x
      })),
      xField: 'x',
      yField: 'y',
      smooth: true,
      animation: chart.config.animation,
      color: chart.config.colors[0]
    };

    switch (chart.type) {
      case 'line':
        return <Line {...commonConfig} />;
      case 'area':
        return <Area {...commonConfig} />;
      case 'bar':
        return <Bar {...commonConfig} />;
      case 'pie':
        return (
          <Pie
            data={chart.data}
            angleField="y"
            colorField="x"
            radius={0.8}
            label={{
              type: 'outer',
              content: '{name} {percentage}'
            }}
          />
        );
      default:
        return <div>不支持的图表类型</div>;
    }
  };

  const renderCharts = () => {
    if (!analyticsData) return null;

    return (
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {analyticsData.charts.map(chart => (
          <Col span={12} key={chart.id}>
            <Card title={chart.title}>
              <div style={{ height: '300px' }}>
                {renderChart(chart)}
              </div>
              {chart.insights.length > 0 && (
                <div style={{ marginTop: 16, padding: '8px', backgroundColor: '#f6ffed', borderRadius: '4px' }}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    <BulbOutlined style={{ marginRight: 4, color: '#faad14' }} />
                    {chart.insights[0]}
                  </Text>
                </div>
              )}
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  const renderInsights = () => {
    if (!analyticsData) return null;

    return (
      <Card title="数据洞察" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          {analyticsData.insights.map(insight => (
            <Col span={24} key={insight.id}>
              <Alert
                message={insight.title}
                description={
                  <div>
                    <div>{insight.description}</div>
                    {insight.suggestedActions && insight.suggestedActions.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <Text strong>建议操作:</Text>
                        <ul style={{ marginTop: 4, marginBottom: 0 }}>
                          {insight.suggestedActions.map((action, index) => (
                            <li key={index}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        置信度: {(insight.confidence * 100).toFixed(1)}% | 
                        影响: {insight.impact === 'positive' ? '正面' : insight.impact === 'negative' ? '负面' : '中性'}
                      </Text>
                    </div>
                  </div>
                }
                type={
                  insight.impact === 'positive' ? 'success' :
                  insight.impact === 'negative' ? 'warning' : 'info'
                }
                showIcon
                style={{ marginBottom: 8 }}
              />
            </Col>
          ))}
        </Row>
      </Card>
    );
  };

  if (!isConnected) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Alert
          message="请连接钱包"
          description="连接钱包后即可查看个人分析数据"
          type="info"
          showIcon
        />
      </div>
    );
  }

  return (
    <Spin spinning={loading}>
      <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2}>
              <RiseOutlined style={{ color: '#1890ff', marginRight: 8 }} />
              高级数据分析
            </Title>
            <Text type="secondary">
              深度分析您的投资表现和市场趋势
            </Text>
          </div>
          <Space>
            <Select
              value={timeRange.period}
              onChange={handleTimeRangeChange}
              style={{ width: 120 }}
            >
              <Select.Option value="1h">1小时</Select.Option>
              <Select.Option value="24h">24小时</Select.Option>
              <Select.Option value="7d">7天</Select.Option>
              <Select.Option value="30d">30天</Select.Option>
              <Select.Option value="90d">90天</Select.Option>
              <Select.Option value="1y">1年</Select.Option>
            </Select>
            <Button icon={<ReloadOutlined />} onClick={loadAnalyticsData}>
              刷新
            </Button>
            <Button icon={<DownloadOutlined />}>
              导出
            </Button>
          </Space>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
            style={{ marginBottom: 24 }}
          />
        )}

        {analyticsData && (
          <>
            {renderMetricsCards()}
            {renderCharts()}
            {renderInsights()}
          </>
        )}
      </div>
    </Spin>
  );
};

export default AdvancedAnalyticsDashboard;