import React, { useState } from 'react';
import { Card, Form, Select, InputNumber, Button, Typography, Space, Divider, Alert } from 'antd';
import { BankOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useAppSelector } from '../redux/hooks';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;
const { Option } = Select;

const StakingMint: React.FC = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [amount, setAmount] = useState<number | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<string>('');
  const [gasMode, setGasMode] = useState<'fast' | 'normal' | 'slow'>('normal');
  const [isLoading, setIsLoading] = useState(false);

  const { isConnected } = useAppSelector(state => state.wallet);
  
  // 模拟数据
  const nativeToken = 'DOT';

  // 模拟可质押的资产
  const stakableAssets = [
    { symbol: 'DOT', name: 'Polkadot', apy: 12.5, minAmount: 1 },
    { symbol: 'KSM', name: 'Kusama', apy: 15.2, minAmount: 0.1 },
    { symbol: 'BNC', name: 'Bifrost', apy: 18.7, minAmount: 10 }
  ];

  const selectedAssetInfo = stakableAssets.find(asset => asset.symbol === selectedAsset);
  
  // 计算预期获得的流动性代币数量
  const calculateLiquidTokens = () => {
    if (!amount || !selectedAssetInfo) return 0;
    // 简化计算：1:1 比例，实际应该根据当前汇率计算
    return amount * 0.98; // 扣除2%的手续费
  };

  // 计算手续费
  const calculateFee = () => {
    const fees = {
      fast: 0.005,
      normal: 0.003,
      slow: 0.001
    };
    return fees[gasMode];
  };

  const handleStake = async () => {
    if (!amount || !selectedAsset) return;
    
    setIsLoading(true);
    try {
      // 模拟质押操作
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 模拟成功后重置表单
      form.resetFields();
      setAmount(null);
      setSelectedAsset('');
      alert(t('staking.stakeSuccess'));
    } catch (error) {
      // Handle error silently in production
      alert(t('staking.stakeFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <Title level={3}>{t('staking.pleaseConnectWallet')}</Title>
        <Text type="secondary">
          {t('staking.needWalletToStake')}
        </Text>
      </div>
    );
  }

  return (
    <div>
      <Title level={2}>{t('staking.title')}</Title>
      <Text type="secondary">
        {t('staking.description')}
      </Text>

      <div style={{ marginTop: 24 }}>
        <Card title={t('staking.stakingConfig')} style={{ maxWidth: 600 }}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleStake}
          >
            <Form.Item
              label={t('staking.selectAssetToStake')}
              name="asset"
              rules={[{ required: true, message: t('staking.pleaseSelectAsset') }]}
            >
              <Select
                placeholder={t('staking.selectAssetToStake')}
                value={selectedAsset}
                onChange={setSelectedAsset}
                size="large"
              >
                {stakableAssets.map(asset => (
                  <Option key={asset.symbol} value={asset.symbol}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{asset.symbol} - {asset.name}</span>
                      <span style={{ color: '#52c41a' }}>APY: {asset.apy}%</span>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label={t('staking.stakingAmount')}
              name="amount"
              rules={[
                { required: true, message: t('staking.enterStakingAmount') },
                {
                  validator: (_, value) => {
                    if (selectedAssetInfo && value < selectedAssetInfo.minAmount) {
                      return Promise.reject(new Error(`${t('staking.minStakingAmount')} ${selectedAssetInfo.minAmount} ${selectedAsset}`));
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <InputNumber
                placeholder={t('staking.enterStakingAmount')}
                value={amount}
                onChange={setAmount}
                size="large"
                style={{ width: '100%' }}
                min={selectedAssetInfo?.minAmount || 0}
                max={1000000}
                precision={6}
                addonAfter={selectedAsset || t('staking.selectAssetToStake')}
              />
            </Form.Item>

            <Form.Item label={t('staking.gasSettings')} name="gasMode">
              <Select value={gasMode} onChange={setGasMode} size="large">
                <Option value="slow">{t('staking.economyMode')} - 0.001 {nativeToken}</Option>
                <Option value="normal">{t('staking.normalMode')} - 0.003 {nativeToken}</Option>
                <Option value="fast">{t('staking.fastMode')} - 0.005 {nativeToken}</Option>
              </Select>
            </Form.Item>

            {selectedAsset && amount && (
              <>
                <Divider />
                <div style={{ background: '#f6f8fa', padding: 16, borderRadius: 8, marginBottom: 16 }}>
                  <Title level={5}>{t('staking.transactionPreview')}</Title>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>{t('staking.stakingAmountLabel')}</Text>
                      <Text strong>{amount} {selectedAsset}</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>{t('staking.estimatedReceive')}</Text>
                      <Text strong>{calculateLiquidTokens().toFixed(6)} v{selectedAsset}</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>{t('staking.annualizedYield')}</Text>
                      <Text strong style={{ color: '#52c41a' }}>{selectedAssetInfo?.apy}%</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>{t('staking.networkFee')}</Text>
                      <Text>{calculateFee()} {nativeToken}</Text>
                    </div>
                  </Space>
                </div>

                <Alert
                  message={t('staking.tip')}
                  description={t('staking.stakeInfo', { asset: selectedAsset })}
                  type="info"
                  icon={<InfoCircleOutlined />}
                  style={{ marginBottom: 16 }}
                />
              </>
            )}

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                icon={<BankOutlined />}
                size="large"
                block
                loading={isLoading}
                disabled={!selectedAsset || !amount}
              >
                {isLoading ? t('staking.processing') : t('staking.confirmStake')}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default StakingMint;