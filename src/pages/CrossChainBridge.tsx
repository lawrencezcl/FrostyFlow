import React, { useState, useEffect } from 'react';
import { Card, Select, Input, Button, Row, Col, Typography, Space, Divider, Alert, Progress, Steps } from 'antd';
import { SwapOutlined, ArrowRightOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import {
  setSourceChain,
  setTargetChain,
  setSelectedAsset,
  setBridgeAmount,
  swapChains,
  addBridgeTransaction,
  setLoading,
  setError
} from '../redux/slices/crossChainSlice';
import { crossChainBridge } from '../services';
import { BridgeQuote, BridgeTransaction } from '../types/bridge';

const { Title, Text } = Typography;
const { Option } = Select;

const CrossChainBridge: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    supportedChains,
    selectedSourceChain,
    selectedTargetChain,
    selectedAsset,
    bridgeAmount,
    isLoading,
    error
  } = useAppSelector(state => state.crossChain);
  
  const { account, isConnected } = useAppSelector(state => state.wallet);

  const [quote, setQuote] = useState<BridgeQuote | null>(null);
  const [isGettingQuote, setIsGettingQuote] = useState(false);
  const [activeBridgeTransaction, setActiveBridgeTransaction] = useState<BridgeTransaction | null>(null);

  // 支持的资产列表
  const supportedAssets = [
    { symbol: 'DOT', name: 'Polkadot', decimals: 10 },
    { symbol: 'ETH', name: 'Ethereum', decimals: 18 },
    { symbol: 'USDC', name: 'USD Coin', decimals: 6 },
    { symbol: 'GLMR', name: 'Moonbeam', decimals: 18 },
  ];

  // 获取报价
  const getQuote = async () => {
    if (!selectedSourceChain || !selectedTargetChain || !selectedAsset || !bridgeAmount) {
      return;
    }

    const amount = parseFloat(bridgeAmount);
    if (isNaN(amount) || amount <= 0) {
      return;
    }

    setIsGettingQuote(true);
    try {
      const quoteResult = await crossChainBridge.getBestQuote(
        selectedSourceChain,
        selectedTargetChain,
        selectedAsset,
        amount
      );
      setQuote(quoteResult);
    } catch (error) {
      console.error('Failed to get quote:', error);
      dispatch(setError('获取报价失败'));
    } finally {
      setIsGettingQuote(false);
    }
  };

  // 执行桥接
  const executeBridge = async () => {
    if (!selectedSourceChain || !selectedTargetChain || !selectedAsset || !bridgeAmount || !account) {
      return;
    }

    const amount = parseFloat(bridgeAmount);
    if (isNaN(amount) || amount <= 0) {
      dispatch(setError('请输入有效的金额'));
      return;
    }

    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const transaction = await crossChainBridge.executeBridge(
        selectedSourceChain,
        selectedTargetChain,
        selectedAsset,
        amount,
        account.address,
        account.address
      );

      dispatch(addBridgeTransaction(transaction));
      setActiveBridgeTransaction(transaction);
      
      // 监听交易状态更新
      crossChainBridge.addEventListener('status_update', (updatedTransaction: BridgeTransaction) => {
        if (updatedTransaction.id === transaction.id) {
          setActiveBridgeTransaction(updatedTransaction);
        }
      });

    } catch (error: any) {
      dispatch(setError(error.message || '桥接执行失败'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  // 当参数变化时自动获取报价
  useEffect(() => {
    const timer = setTimeout(() => {
      getQuote();
    }, 500);

    return () => clearTimeout(timer);
  }, [selectedSourceChain, selectedTargetChain, selectedAsset, bridgeAmount]);

  // 获取可用的目标链
  const getAvailableTargetChains = () => {
    if (!selectedSourceChain) return supportedChains;
    return supportedChains.filter(chain => chain.id !== selectedSourceChain);
  };

  // 渲染交易进度
  const renderTransactionProgress = () => {
    if (!activeBridgeTransaction) return null;

    const currentStepIndex = activeBridgeTransaction.steps.findIndex(step => step.status === 'active');
    const completedSteps = activeBridgeTransaction.steps.filter(step => step.status === 'completed').length;

    return (
      <Card title="桥接进度" style={{ marginTop: 16 }}>
        <Progress 
          percent={activeBridgeTransaction.progress} 
          status={activeBridgeTransaction.status === 'failed' ? 'exception' : 'active'}
          strokeColor={{
            '0%': '#108ee9',
            '100%': '#87d068',
          }}
        />
        
        <Steps
          current={currentStepIndex}
          status={activeBridgeTransaction.status === 'failed' ? 'error' : 'process'}
          direction="vertical"
          size="small"
          style={{ marginTop: 16 }}
        >
          {activeBridgeTransaction.steps.map((step, index) => (
            <Steps.Step
              key={step.id}
              title={step.name}
              description={step.description}
              status={
                step.status === 'completed' ? 'finish' :
                step.status === 'active' ? 'process' :
                step.status === 'failed' ? 'error' : 'wait'
              }
            />
          ))}
        </Steps>

        {activeBridgeTransaction.txHash && (
          <Alert
            message="交易哈希"
            description={activeBridgeTransaction.txHash}
            type="info"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}
      </Card>
    );
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2}>跨链桥接</Title>
      <Text type="secondary">在不同区块链网络之间安全转移资产</Text>

      <Card style={{ marginTop: 24 }}>
        <Row gutter={[16, 16]}>
          {/* 源链选择 */}
          <Col span={11}>
            <div>
              <Text strong>源链</Text>
              <Select
                style={{ width: '100%', marginTop: 8 }}
                placeholder="选择源链"
                value={selectedSourceChain}
                onChange={(value) => dispatch(setSourceChain(value))}
              >
                {supportedChains.map(chain => (
                  <Option key={chain.id} value={chain.id}>
                    {chain.displayName}
                  </Option>
                ))}
              </Select>
            </div>
          </Col>

          {/* 交换按钮 */}
          <Col span={2} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Button
              type="text"
              icon={<SwapOutlined />}
              onClick={() => dispatch(swapChains())}
              disabled={!selectedSourceChain || !selectedTargetChain}
            />
          </Col>

          {/* 目标链选择 */}
          <Col span={11}>
            <div>
              <Text strong>目标链</Text>
              <Select
                style={{ width: '100%', marginTop: 8 }}
                placeholder="选择目标链"
                value={selectedTargetChain}
                onChange={(value) => dispatch(setTargetChain(value))}
              >
                {getAvailableTargetChains().map(chain => (
                  <Option key={chain.id} value={chain.id}>
                    {chain.displayName}
                  </Option>
                ))}
              </Select>
            </div>
          </Col>
        </Row>

        <Divider />

        <Row gutter={[16, 16]}>
          {/* 资产选择 */}
          <Col span={12}>
            <div>
              <Text strong>资产</Text>
              <Select
                style={{ width: '100%', marginTop: 8 }}
                placeholder="选择资产"
                value={selectedAsset}
                onChange={(value) => dispatch(setSelectedAsset(value))}
              >
                {supportedAssets.map(asset => (
                  <Option key={asset.symbol} value={asset.symbol}>
                    {asset.symbol} - {asset.name}
                  </Option>
                ))}
              </Select>
            </div>
          </Col>

          {/* 金额输入 */}
          <Col span={12}>
            <div>
              <Text strong>金额</Text>
              <Input
                style={{ marginTop: 8 }}
                placeholder="输入金额"
                value={bridgeAmount}
                onChange={(e) => dispatch(setBridgeAmount(e.target.value))}
                suffix={selectedAsset}
              />
            </div>
          </Col>
        </Row>

        {/* 报价信息 */}
        {quote && (
          <Card size="small" style={{ marginTop: 16, backgroundColor: '#f6ffed' }}>
            <Row gutter={16}>
              <Col span={8}>
                <Text type="secondary">预计接收</Text>
                <div>
                  <Text strong>{quote.outputAmount.toFixed(6)} {selectedAsset}</Text>
                </div>
              </Col>
              <Col span={8}>
                <Text type="secondary">桥接费用</Text>
                <div>
                  <Text strong>{quote.fee.toFixed(6)} {quote.route.fee.asset}</Text>
                </div>
              </Col>
              <Col span={8}>
                <Text type="secondary">预计时间</Text>
                <div>
                  <Text strong>{Math.round(quote.estimatedTime / 60000)} 分钟</Text>
                </div>
              </Col>
            </Row>
          </Card>
        )}

        {/* 错误信息 */}
        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            closable
            onClose={() => dispatch(setError(null))}
            style={{ marginTop: 16 }}
          />
        )}

        {/* 操作按钮 */}
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Space>
            <Button
              type="primary"
              size="large"
              loading={isLoading || isGettingQuote}
              disabled={!isConnected || !quote}
              onClick={executeBridge}
              icon={<ArrowRightOutlined />}
            >
              {isLoading ? '执行中...' : '开始桥接'}
            </Button>
            
            {!isConnected && (
              <Text type="secondary">
                <InfoCircleOutlined /> 请先连接钱包
              </Text>
            )}
          </Space>
        </div>
      </Card>

      {/* 交易进度 */}
      {renderTransactionProgress()}
    </div>
  );
};

export default CrossChainBridge;