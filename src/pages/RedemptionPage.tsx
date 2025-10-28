import React, { useState } from 'react';
import { Card, Table, Button, Progress, Tag, Typography, Space, Modal, Form, InputNumber, Alert } from 'antd';
import { SwapOutlined, ClockCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { initiateRedeem, claimRedeem } from '../redux/slices/redeemSlice';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

const RedemptionPage: React.FC = () => {
  const { t } = useTranslation();
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
      title: t('redemption.asset'),
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
      title: t('redemption.redeemAmountLabel'),
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `${(amount || 0).toFixed(6)}`
    },
    {
      title: t('redemption.type'),
      dataIndex: 'type',
      key: 'type',
      render: (type: 'instant' | 'standard') => (
        <Tag color={type === 'instant' ? 'orange' : 'blue'}>
          {(type || 'standard') === 'instant' ? t('redemption.instantRedeem') : t('redemption.standardRedeem')}
        </Tag>
      )
    },
    {
      title: t('redemption.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          pending: { color: 'orange', icon: <ClockCircleOutlined />, text: t('redemption.pending') },
          processing: { color: 'blue', icon: <ClockCircleOutlined />, text: t('redemption.processing') },
          ready: { color: 'green', icon: <CheckCircleOutlined />, text: t('redemption.ready') },
          completed: { color: 'green', icon: <CheckCircleOutlined />, text: t('redemption.completed') },
          failed: { color: 'red', icon: <ExclamationCircleOutlined />, text: t('redemption.failed') },
          unlocking: { color: 'purple', icon: <ClockCircleOutlined />, text: t('redemption.unlocking') }
        };
        const config = statusConfig[status as keyof typeof statusConfig] || {
          color: 'default',
          icon: <QuestionCircleOutlined />,
          text: status || 'Unknown'
        };
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      }
    },
    {
      title: t('redemption.progress'),
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
      title: t('redemption.remainingTime'),
      dataIndex: 'remainingTime',
      key: 'remainingTime',
      render: (time: string, record: any) => {
        if (record.status === 'completed' || record.status === 'ready') {
          return '-';
        }
        return time || t('redemption.calculating');
      }
    },
    {
      title: t('redemption.actions'),
      key: 'actions',
      render: (record: any) => (
        <Space>
          {record.status === 'ready' && (
            <Button
              type="primary"
              size="small"
              onClick={() => handleClaim(record.id)}
            >
              {t('redemption.claimAssets')}
            </Button>
          )}
          {record.status === 'processing' && (
            <Button size="small" disabled>
              {t('redemption.waiting')}
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
      alert(t('redemption.redeemApplicationSubmitted'));
    } catch (error) {
      // Handle error silently in production
      alert(t('redemption.redeemFailed'));
    }
  };

  const handleClaim = async (redeemId: string) => {
    try {
      await dispatch(claimRedeem(redeemId));
      alert(t('redemption.assetClaimSuccess'));
    } catch (error) {
      // Handle error silently in production
      alert(t('redemption.claimFailed'));
    }
  };

  const showRedeemModal = (asset: string) => {
    setSelectedAsset(asset);
    setIsModalVisible(true);
  };

  if (!isConnected) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <Title level={3}>{t('redemption.pleaseConnectWallet')}</Title>
        <Text type="secondary">
          {t('redemption.needWalletToRedeem')}
        </Text>
      </div>
    );
  }

  return (
    <div>
      <Title level={2}>{t('redemption.title')}</Title>
      <Text type="secondary">
        {t('redemption.description')}
      </Text>

      {liquidAssets.length > 0 && (
        <Card title={t('redemption.redeemableAssets')} style={{ marginTop: 24, marginBottom: 24 }}>
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
                    {t('redemption.redeem')}
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
                  <Text type="secondary">{t('redemption.balance')}: {parseFloat(asset?.balance || '0').toFixed(6)}</Text>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      <Card title={t('redemption.redeemRecords')}>
        <Table
          columns={columns}
          dataSource={redeems}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `${t('assets.total')} ${total} ${t('redemption.records')}`
          }}
        />
      </Card>

      <Modal
        title={t('redemption.redeemAsset', { asset: selectedAsset })}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form layout="vertical" onFinish={handleRedeem}>
          <Form.Item
            label={t('redemption.redeemAmountLabel')}
            name="amount"
            rules={[{ required: true, message: t('redemption.pleaseEnterRedeemAmount') }]}
          >
            <InputNumber
              placeholder={t('redemption.enterRedeemAmount')}
              value={redeemAmount}
              onChange={setRedeemAmount}
              style={{ width: '100%' }}
              min={0.000001}
              precision={6}
              addonAfter={selectedAsset}
            />
          </Form.Item>

          <Form.Item label={t('redemption.redeemType')} name="type">
            <div>
              <Button.Group style={{ width: '100%' }}>
                <Button
                  type={redeemType === 'standard' ? 'primary' : 'default'}
                  onClick={() => setRedeemType('standard')}
                  style={{ width: '50%' }}
                >
                  {t('redemption.standardRedeem')}
                </Button>
                <Button
                  type={redeemType === 'instant' ? 'primary' : 'default'}
                  onClick={() => setRedeemType('instant')}
                  style={{ width: '50%' }}
                >
                  {t('redemption.instantRedeem')}
                </Button>
              </Button.Group>

              <div style={{ marginTop: 12 }}>
                {redeemType === 'standard' ? (
                  <Alert
                    message={t('redemption.standardRedeem')}
                    description={t('redemption.standardRedeemInfo')}
                    type="info"
                    showIcon
                  />
                ) : (
                  <Alert
                    message={t('redemption.instantRedeem')}
                    description={t('redemption.instantRedeemInfo')}
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
                {t('redemption.cancel')}
              </Button>
              <Button type="primary" htmlType="submit">
                {t('redemption.confirmRedeem')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RedemptionPage;