import React from 'react';
import { Card, Statistic, Row, Col, Table, Tag, Typography, Space, Button } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, EyeOutlined, SwapOutlined } from '@ant-design/icons';
import { useAppSelector } from '../redux/hooks';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

const AssetOverview: React.FC = () => {
  const { t } = useTranslation();
  const { assets, totalValue, totalEarnings } = useAppSelector(state => state.asset);
  const { isConnected } = useAppSelector(state => state.wallet);

  const columns = [
    {
      title: t('assets.asset'),
      dataIndex: 'symbol',
      key: 'symbol',
      render: (symbol: string, record: any) => (
        <Space>
          <div style={{ 
            width: 32, 
            height: 32, 
            borderRadius: '50%', 
            background: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
          }}>
            {symbol?.charAt(0) || '?'}
          </div>
          <div>
            <div style={{ fontWeight: 'bold' }}>{symbol || 'Unknown'}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record?.name || 'Unknown Asset'}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: t('assets.quantity'),
      dataIndex: 'balance',
      key: 'balance',
      render: (balance: string) => `${parseFloat(balance || '0').toFixed(6)}`
    },
    {
      title: t('assets.priceUsd'),
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `$${(price || 0).toFixed(2)}`
    },
    {
      title: t('assets.valueUsd'),
      key: 'value',
      render: (record: any) => {
        const balance = parseFloat(record?.balance || '0');
        const price = record?.price || 0;
        const value = balance * price;
        return `$${value.toFixed(2)}`;
      }
    },
    {
      title: t('assets.chain'),
      dataIndex: 'chain',
      key: 'chain',
      render: (chain: string) => (
        <Tag color="blue">{chain || 'Unknown'}</Tag>
      )
    },
    {
      title: t('assets.actions'),
      key: 'actions',
      render: (record: any) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />}>{t('assets.details')}</Button>
          <Button size="small" icon={<SwapOutlined />}>{t('assets.swap')}</Button>
        </Space>
      )
    }
  ];

  if (!isConnected) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <Title level={3}>{t('assets.welcomeToFrostyFlow')}</Title>
        <Text type="secondary">
          {t('assets.connectWalletToViewOverview')}
        </Text>
      </div>
    );
  }

  return (
    <div>
      <Title level={2}>{t('assets.assetOverview')}</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title={t('assets.totalAssetValue')}
              value={totalValue}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title={t('assets.totalEarnings')}
              value={totalEarnings}
              precision={2}
              prefix="$"
              suffix={
                <ArrowUpOutlined style={{ color: '#3f8600', fontSize: '14px' }} />
              }
              valueStyle={{ color: totalEarnings >= 0 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title={t('assets.change24hLabel')}
              value={Math.random() * 10 - 5}
              precision={2}
              suffix="%"
              prefix={Math.random() > 0.5 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              valueStyle={{ color: Math.random() > 0.5 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title={t('assets.assetDetailsTitle')} style={{ marginTop: 16 }}>
        <Table
          columns={columns}
          dataSource={assets}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `${t('assets.total')} ${total} ${t('assets.items')}`
          }}
        />
      </Card>
    </div>
  );
};

export default AssetOverview;