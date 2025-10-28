import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Table, Tag, Progress, Button, Select, Switch, Space, Statistic, Alert, Tooltip } from 'antd';
import { 
  DashboardOutlined, 
  ReloadOutlined, 
  FilterOutlined, 
  TrophyOutlined,
  RiseOutlined,
  FallOutlined,
  EyeOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import {
  setAssets,
  setPortfolioSummary,
  setSupportedChains,
  toggleChainSelection,
  updateAssetFilter,
  setLoading,
  setRealtimeEnabled,
  setError
} from '../redux/slices/monitoringSlice';
import { multiChainMonitoring } from '../services';
import { MultiChainAsset, ChainInfo } from '../types/monitoring';

const { Title, Text } = Typography;
const { Option } = Select;

const MultiChainAssetMonitoring: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    assets,
    portfolioSummary,
    supportedChains,
    selectedChains,
    assetFilter,
    isLoading,
    isRealtimeEnabled,
    lastUpdateTime,
    error
  } = useAppSelector(state => state.monitoring);
  
  const { account, isConnected } = useAppSelector(state => state.wallet);

  const [refreshing, setRefreshing] = useState(false);

  // 初始化数据
  useEffect(() => {
    initializeData();
  }, []);

  // 监听钱包连接状态
  useEffect(() => {
    if (isConnected && account) {
      loadUserAssets();
    }
  }, [isConnected, account, selectedChains, assetFilter]);

  // 实时监控
  useEffect(() => {
    if (isRealtimeEnabled && isConnected) {
      startRealtimeMonitoring();
    } else {
      stopRealtimeMonitoring();
    }

    return () => stopRealtimeMonitoring();
  }, [isRealtimeEnabled, isConnected]);

  const initializeData = async () => {
    try {
      const chains = multiChainMonitoring.getSupportedChains();
      dispatch(setSupportedChains(chains));
    } catch (error) {
      console.error('Failed to initialize data:', error);
    }
  };

  const loadUserAssets = async () => {
    if (!account) return;

    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const [userAssets, summary] = await Promise.all([
        multiChainMonitoring.getUserAssets(account.address, assetFilter),
        multiChainMonitoring.getPortfolioSummary(account.address)
      ]);

      dispatch(setAssets(userAssets));
      dispatch(setPortfolioSummary(summary));
    } catch (error: any) {
      dispatch(setError(error.message || '加载资产数据失败'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUserAssets();
    setRefreshing(false);
  };

  const startRealtimeMonitoring = () => {
    multiChainMonitoring.startRealtimeMonitoring({
      refreshInterval: 30000, // 30秒
      priceAlerts: { enabled: true, thresholds: {} },
      balanceAlerts: { enabled: true, minBalance: {} },
      rewardNotifications: { enabled: true, minAmount: 0.01 },
      autoRefresh: true,
      enableNotifications: true
    });

    multiChainMonitoring.addEventListener('data_refresh', () => {
      if (account) {
        loadUserAssets();
      }
    });
  };

  const stopRealtimeMonitoring = () => {
    multiChainMonitoring.stopRealtimeMonitoring();
  };

  // 表格列定义
  const columns = [
    {
      title: '资产',
      dataIndex: 'symbol',
      key: 'symbol',
      render: (symbol: string, record: MultiChainAsset) => (
        <Space>
          <Text strong>{symbol}</Text>
          <Text type="secondary">{record.name}</Text>
        </Space>
      ),
    },
    {
      title: '总余额',
      dataIndex: 'totalBalance',
      key: 'totalBalance',
      render: (balance: number, record: MultiChainAsset) => (
        <div>
          <div>{balance.toFixed(6)} {record.symbol}</div>
          <Text type="secondary">${record.totalValue.toFixed(2)}</Text>
        </div>
      ),
    },
    {
      title: '链分布',
      dataIndex: 'distributions',
      key: 'distributions',
      render: (distributions: any[]) => (
        <Space wrap>
          {distributions.map(dist => (
            <Tooltip key={dist.chainId} title={`${dist.balance.toFixed(4)} ${dist.chainName}`}>
              <Tag color={dist.isStaked ? 'green' : 'blue'}>
                {dist.chainIcon} {dist.percentage.toFixed(1)}%
              </Tag>
            </Tooltip>
          ))}
        </Space>
      ),
    },
    {
      title: '24h变化',
      dataIndex: 'priceChange24h',
      key: 'priceChange24h',
      render: (change: number) => (
        <Space>
          {change >= 0 ? (
            <RiseOutlined style={{ color: '#52c41a' }} />
          ) : (
            <FallOutlined style={{ color: '#ff4d4f' }} />
          )}
          <Text style={{ color: change >= 0 ? '#52c41a' : '#ff4d4f' }}>
            {change >= 0 ? '+' : ''}{change.toFixed(2)}%
          </Text>
        </Space>
      ),
    },
    {
      title: 'APY',
      dataIndex: 'apy',
      key: 'apy',
      render: (apy: number) => (
        <Space>
          <TrophyOutlined style={{ color: '#faad14' }} />
          <Text strong style={{ color: '#52c41a' }}>{apy.toFixed(2)}%</Text>
        </Space>
      ),
    },
  ];

  const renderPortfolioSummary = () => {
    if (!portfolioSummary) return null;

    return (
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总资产价值"
              value={portfolioSummary.totalValue}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="质押资产"
              value={portfolioSummary.totalStaked}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="累计收益"
              value={portfolioSummary.totalRewards}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="支持链数"
              value={portfolioSummary.totalChains}
              suffix={`/ ${supportedChains.length}`}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  const renderChainFilter = () => (
    <Card size="small" style={{ marginBottom: 16 }}>
      <Row align="middle" justify="space-between">
        <Col>
          <Space>
            <Text strong>链过滤:</Text>
            {supportedChains.map(chain => (
              <Tag.CheckableTag
                key={chain.id}
                checked={selectedChains.includes(chain.id)}
                onChange={() => dispatch(toggleChainSelection(chain.id))}
              >
                {chain.icon} {chain.displayName}
              </Tag.CheckableTag>
            ))}
          </Space>
        </Col>
        <Col>
          <Space>
            <Text>实时监控:</Text>
            <Switch
              checked={isRealtimeEnabled}
              onChange={(checked) => dispatch(setRealtimeEnabled(checked))}
              disabled={!isConnected}
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={refreshing}
              disabled={!isConnected}
            >
              刷新
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  );

  const renderFilterControls = () => (
    <Card size="small" style={{ marginBottom: 16 }}>
      <Row gutter={16} align="middle">
        <Col span={4}>
          <Text strong>排序:</Text>
          <Select
            style={{ width: '100%', marginTop: 4 }}
            value={assetFilter.sortBy}
            onChange={(value) => dispatch(updateAssetFilter({ sortBy: value }))}
          >
            <Option value="value">按价值</Option>
            <Option value="balance">按余额</Option>
            <Option value="change">按涨跌</Option>
            <Option value="apy">按收益率</Option>
          </Select>
        </Col>
        <Col span={4}>
          <Text strong>顺序:</Text>
          <Select
            style={{ width: '100%', marginTop: 4 }}
            value={assetFilter.sortOrder}
            onChange={(value) => dispatch(updateAssetFilter({ sortOrder: value }))}
          >
            <Option value="desc">降序</Option>
            <Option value="asc">升序</Option>
          </Select>
        </Col>
        <Col span={4}>
          <Text strong>只显示质押:</Text>
          <Switch
            style={{ marginTop: 4 }}
            checked={assetFilter.showStakedOnly}
            onChange={(checked) => dispatch(updateAssetFilter({ showStakedOnly: checked }))}
          />
        </Col>
        <Col span={4}>
          <Text strong>显示零余额:</Text>
          <Switch
            style={{ marginTop: 4 }}
            checked={assetFilter.showZeroBalance}
            onChange={(checked) => dispatch(updateAssetFilter({ showZeroBalance: checked }))}
          />
        </Col>
        <Col span={8}>
          <Text type="secondary">
            最后更新: {lastUpdateTime ? new Date(lastUpdateTime).toLocaleTimeString() : '未更新'}
          </Text>
        </Col>
      </Row>
    </Card>
  );

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <DashboardOutlined style={{ color: '#1890ff', marginRight: 8 }} />
          多链资产监控
        </Title>
        <Text type="secondary">
          实时监控和管理您在所有支持链上的流动性质押资产
        </Text>
      </div>

      {!isConnected && (
        <Alert
          message="请连接钱包"
          description="连接钱包后即可查看您的多链资产分布和收益情况"
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          closable
          onClose={() => dispatch(setError(null))}
          style={{ marginBottom: 24 }}
        />
      )}

      {isConnected && (
        <>
          {renderPortfolioSummary()}
          {renderChainFilter()}
          {renderFilterControls()}

          <Card
            title="资产详情"
            extra={
              <Space>
                <Button icon={<FilterOutlined />} type="text">
                  高级过滤
                </Button>
                <Button icon={<SettingOutlined />} type="text">
                  设置
                </Button>
              </Space>
            }
            loading={isLoading}
          >
            <Table
              columns={columns}
              dataSource={assets}
              rowKey="symbol"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 项资产`,
              }}
              locale={{
                emptyText: '暂无资产数据'
              }}
            />
          </Card>
        </>
      )}
    </div>
  );
};

export default MultiChainAssetMonitoring;