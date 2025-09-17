import React from 'react';
import { Card, Statistic, Row, Col, Table, Tag, Typography, Space, Button } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, EyeOutlined, SwapOutlined } from '@ant-design/icons';
import { useAppSelector } from '../redux/hooks';

const { Title, Text } = Typography;

const AssetOverview: React.FC = () => {
  const { assets, totalValue, totalEarnings } = useAppSelector(state => state.asset);
  const { isConnected } = useAppSelector(state => state.wallet);

  const columns = [
    {
      title: '资产',
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
      title: '数量',
      dataIndex: 'balance',
      key: 'balance',
      render: (balance: string) => `${parseFloat(balance || '0').toFixed(6)}`
    },
    {
      title: '价格 (USD)',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `$${(price || 0).toFixed(2)}`
    },
    {
      title: '价值 (USD)',
      key: 'value',
      render: (record: any) => {
        const balance = parseFloat(record?.balance || '0');
        const price = record?.price || 0;
        const value = balance * price;
        return `$${value.toFixed(2)}`;
      }
    },
    {
      title: '链',
      dataIndex: 'chain',
      key: 'chain',
      render: (chain: string) => (
        <Tag color="blue">{chain || 'Unknown'}</Tag>
      )
    },
    {
      title: '操作',
      key: 'actions',
      render: (record: any) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />}>详情</Button>
          <Button size="small" icon={<SwapOutlined />}>交换</Button>
        </Space>
      )
    }
  ];

  if (!isConnected) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <Title level={3}>欢迎来到 FrostyFlow</Title>
        <Text type="secondary">
          请先连接钱包以查看您的资产概览
        </Text>
      </div>
    );
  }

  return (
    <div>
      <Title level={2}>资产总览</Title>
      
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="总资产价值"
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
              title="累计收益"
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
              title="24小时变化"
              value={Math.random() * 10 - 5}
              precision={2}
              suffix="%"
              prefix={Math.random() > 0.5 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              valueStyle={{ color: Math.random() > 0.5 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="资产明细" style={{ marginTop: 16 }}>
        <Table
          columns={columns}
          dataSource={assets}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 项资产`
          }}
        />
      </Card>
    </div>
  );
};

export default AssetOverview;