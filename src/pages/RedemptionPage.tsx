import React, { useState } from 'react';
import { Card, Table, Button, Progress, Tag, Typography, Space, Modal, Form, InputNumber, Alert } from 'antd';
import { SwapOutlined, ClockCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { initiateRedeem, claimRedeem } from '../redux/slices/redeemSlice';

const { Title, Text } = Typography;

const RedemptionPage: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<string>('');
  const [redeemAmount, setRedeemAmount] = useState<number | null>(null);
  const [redeemType, setRedeemType] = useState<'instant' | 'standard'>('standard');
  
  const dispatch = useAppDispatch();
  const { redeems } = useAppSelector(state => state.redeem);
  const { isConnected } = useAppSelector(state => state.wallet);
  const { assets } = useAppSelector(state => state.asset);

  // 可赎回的流动性代币
  const liquidAssets = assets.filter((asset: any) => asset.symbol.startsWith('v'));

  const columns = [
    {
      title: '资产',
      dataIndex: 'asset',
      key: 'asset',
      render: (asset: string) => (
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
            {asset?.charAt(0) || '?'}
          </div>
          <Text strong>{asset || 'Unknown'}</Text>
        </Space>
      )
    },
    {
      title: '赎回数量',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `${(amount || 0).toFixed(6)}`
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: 'instant' | 'standard') => (
        <Tag color={type === 'instant' ? 'orange' : 'blue'}>
          {(type || 'standard') === 'instant' ? '即时赎回' : '标准赎回'}
        </Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          pending: { color: 'orange', icon: <ClockCircleOutlined />, text: '处理中' },
          processing: { color: 'blue', icon: <ClockCircleOutlined />, text: '赎回中' },
          ready: { color: 'green', icon: <CheckCircleOutlined />, text: '可提取' },
          completed: { color: 'green', icon: <CheckCircleOutlined />, text: '已完成' },
          failed: { color: 'red', icon: <ExclamationCircleOutlined />, text: '失败' },
          unlocking: { color: 'purple', icon: <ClockCircleOutlined />, text: '解锁中' }
        };
        const config = statusConfig[status as keyof typeof statusConfig] || { 
          color: 'default', 
          icon: <QuestionCircleOutlined />, 
          text: status || '未知' 
        };
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      }
    },
    {
      title: '进度',
      key: 'progress',
      render: (record: any) => {
        const progressMap = {
          pending: 0,
          processing: 50,
          ready: 100,
          completed: 100,
          failed: 0
        };
        return (
          <Progress 
            percent={progressMap[record.status as keyof typeof progressMap]} 
            size="small"
            status={record.status === 'failed' ? 'exception' : 'normal'}
          />
        );
      }
    },
    {
      title: '剩余时间',
      dataIndex: 'remainingTime',
      key: 'remainingTime',
      render: (time: string, record: any) => {
        if (record.status === 'completed' || record.status === 'ready') {
          return '-';
        }
        return time || '计算中...';
      }
    },
    {
      title: '操作',
      key: 'actions',
      render: (record: any) => (
        <Space>
          {record.status === 'ready' && (
            <Button 
              type="primary" 
              size="small"
              onClick={() => handleClaim(record.id)}
            >
              提取资产
            </Button>
          )}
          {record.status === 'processing' && (
            <Button size="small" disabled>
              等待中
            </Button>
          )}
        </Space>
      )
    }
  ];

  const handleRedeem = async () => {
    if (!selectedAsset || !redeemAmount) return;
    
    try {
      await dispatch(initiateRedeem({
        asset: selectedAsset,
        amount: redeemAmount,
        type: redeemType
      }));
      
      setIsModalVisible(false);
      setSelectedAsset('');
      setRedeemAmount(null);
      alert('赎回申请已提交！');
    } catch (error) {
      // Handle error silently in production
      alert('赎回失败，请重试');
    }
  };

  const handleClaim = async (redeemId: string) => {
    try {
      await dispatch(claimRedeem(redeemId));
      alert('资产提取成功！');
    } catch (error) {
      // Handle error silently in production
      alert('提取失败，请重试');
    }
  };

  const showRedeemModal = (asset: string) => {
    setSelectedAsset(asset);
    setIsModalVisible(true);
  };

  if (!isConnected) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <Title level={3}>请先连接钱包</Title>
        <Text type="secondary">
          您需要连接钱包才能进行赎回操作
        </Text>
      </div>
    );
  }

  return (
    <div>
      <Title level={2}>质押赎回</Title>
      <Text type="secondary">
        赎回您的流动性质押代币并获得原始资产
      </Text>

      {liquidAssets.length > 0 && (
        <Card title="可赎回资产" style={{ marginTop: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {liquidAssets.map((asset: any) => (
              <Card 
                key={asset.id}
                style={{ width: 200 }}
                actions={[
                  <Button 
                    type="primary" 
                    icon={<SwapOutlined />}
                    onClick={() => showRedeemModal(asset.symbol)}
                  >
                    赎回
                  </Button>
                ]}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: '50%', 
                    background: '#f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                    fontWeight: 'bold',
                    fontSize: '18px'
                  }}>
                    {asset?.symbol?.charAt(0) || '?'}
                  </div>
                  <Title level={5} style={{ margin: '8px 0' }}>{asset?.symbol || 'Unknown'}</Title>
                  <Text type="secondary">余额: {parseFloat(asset?.balance || '0').toFixed(6)}</Text>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      <Card title="赎回记录">
        <Table
          columns={columns}
          dataSource={redeems}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
        />
      </Card>

      <Modal
        title={`赎回 ${selectedAsset}`}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form layout="vertical" onFinish={handleRedeem}>
          <Form.Item
            label="赎回数量"
            name="amount"
            rules={[{ required: true, message: '请输入赎回数量' }]}
          >
            <InputNumber
              placeholder="输入赎回数量"
              value={redeemAmount}
              onChange={setRedeemAmount}
              style={{ width: '100%' }}
              min={0.000001}
              precision={6}
              addonAfter={selectedAsset}
            />
          </Form.Item>

          <Form.Item label="赎回类型" name="type">
            <div>
              <Button.Group style={{ width: '100%' }}>
                <Button 
                  type={redeemType === 'standard' ? 'primary' : 'default'}
                  onClick={() => setRedeemType('standard')}
                  style={{ width: '50%' }}
                >
                  标准赎回
                </Button>
                <Button 
                  type={redeemType === 'instant' ? 'primary' : 'default'}
                  onClick={() => setRedeemType('instant')}
                  style={{ width: '50%' }}
                >
                  即时赎回
                </Button>
              </Button.Group>
              
              <div style={{ marginTop: 12 }}>
                {redeemType === 'standard' ? (
                  <Alert
                    message="标准赎回"
                    description="等待期: 7-28天，无额外费用，按市场汇率兑换"
                    type="info"
                    showIcon
                  />
                ) : (
                  <Alert
                    message="即时赎回"
                    description="立即到账，收取3-5%手续费，按当前汇率兑换"
                    type="warning"
                    showIcon
                  />
                )}
              </div>
            </div>
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setIsModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                确认赎回
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RedemptionPage;