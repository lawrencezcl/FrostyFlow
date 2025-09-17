import React, { useState } from 'react';
import { Card, Form, Select, InputNumber, Button, Typography, Space, Divider, Alert } from 'antd';
import { BankOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useAppSelector } from '../redux/hooks';

const { Title, Text } = Typography;
const { Option } = Select;

const StakingMint: React.FC = () => {
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
      alert('质押成功！');
    } catch (error) {
      // Handle error silently in production
      alert('质押失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <Title level={3}>请先连接钱包</Title>
        <Text type="secondary">
          您需要连接钱包才能进行质押操作
        </Text>
      </div>
    );
  }

  return (
    <div>
      <Title level={2}>质押铸造</Title>
      <Text type="secondary">
        质押您的资产以获得流动性代币，同时获得质押收益
      </Text>

      <div style={{ marginTop: 24 }}>
        <Card title="质押配置" style={{ maxWidth: 600 }}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleStake}
          >
            <Form.Item
              label="选择资产"
              name="asset"
              rules={[{ required: true, message: '请选择要质押的资产' }]}
            >
              <Select
                placeholder="选择要质押的资产"
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
              label="质押数量"
              name="amount"
              rules={[
                { required: true, message: '请输入质押数量' },
                { 
                  validator: (_, value) => {
                    if (selectedAssetInfo && value < selectedAssetInfo.minAmount) {
                      return Promise.reject(new Error(`最小质押数量为 ${selectedAssetInfo.minAmount} ${selectedAsset}`));
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <InputNumber
                placeholder="输入质押数量"
                value={amount}
                onChange={setAmount}
                size="large"
                style={{ width: '100%' }}
                min={selectedAssetInfo?.minAmount || 0}
                max={1000000}
                precision={6}
                addonAfter={selectedAsset || '选择资产'}
              />
            </Form.Item>

            <Form.Item label="Gas 设置" name="gasMode">
              <Select value={gasMode} onChange={setGasMode} size="large">
                <Option value="slow">经济模式 (约30秒) - 0.001 {nativeToken}</Option>
                <Option value="normal">普通模式 (约15秒) - 0.003 {nativeToken}</Option>
                <Option value="fast">快速模式 (约5秒) - 0.005 {nativeToken}</Option>
              </Select>
            </Form.Item>

            {selectedAsset && amount && (
              <>
                <Divider />
                <div style={{ background: '#f6f8fa', padding: 16, borderRadius: 8, marginBottom: 16 }}>
                  <Title level={5}>交易预览</Title>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>质押数量:</Text>
                      <Text strong>{amount} {selectedAsset}</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>预计获得:</Text>
                      <Text strong>{calculateLiquidTokens().toFixed(6)} v{selectedAsset}</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>年化收益率:</Text>
                      <Text strong style={{ color: '#52c41a' }}>{selectedAssetInfo?.apy}%</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>网络费用:</Text>
                      <Text>{calculateFee()} {nativeToken}</Text>
                    </div>
                  </Space>
                </div>

                <Alert
                  message="提示"
                  description={`质押后您将收到 v${selectedAsset} 代币，这些代币代表您的质押份额并可以自由转移和交易。质押收益将自动复投。`}
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
                {isLoading ? '处理中...' : '确认质押'}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default StakingMint;