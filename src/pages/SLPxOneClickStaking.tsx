import React, { useState, useEffect } from 'react';
import { Card, Select, Input, Button, Row, Col, Typography, Space, Divider, Alert, Progress, Steps, Slider, Tooltip } from 'antd';
import { RocketOutlined, InfoCircleOutlined, SettingOutlined, TrophyOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import {
  setSourceChain,
  setSelectedAsset,
  setStakingAmount,
  setSlippage,
  addStakingRequest,
  setLoading,
  setError
} from '../redux/slices/slpxSlice';
import { slpx } from '../services';
import { SLPxQuote, SLPxStakingRequest } from '../types/slpx';

const { Title, Text } = Typography;
const { Option } = Select;

const SLPxOneClickStaking: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    supportedRoutes,
    selectedSourceChain,
    selectedAsset,
    stakingAmount,
    slippage,
    isLoading,
    error
  } = useAppSelector(state => state.slpx);
  
  const { account, isConnected } = useAppSelector(state => state.wallet);

  const [quote, setQuote] = useState<SLPxQuote | null>(null);
  const [isGettingQuote, setIsGettingQuote] = useState(false);
  const [activeStakingRequest, setActiveStakingRequest] = useState<SLPxStakingRequest | null>(null);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // 支持的资产列表
  const supportedAssets = [
    { symbol: 'DOT', name: 'Polkadot', apy: 12.5, icon: '🔴' },
    { symbol: 'ETH', name: 'Ethereum', apy: 8.2, icon: '⚪' },
    { symbol: 'KSM', name: 'Kusama', apy: 15.8, icon: '🟡' },
    { symbol: 'GLMR', name: 'Moonbeam', apy: 18.3, icon: '🌙' },
  ];

  // 支持的源链
  const supportedChains = [
    { id: 'polkadot', name: 'Polkadot', icon: '🔴' },
    { id: 'ethereum', name: 'Ethereum', icon: '⚪' },
    { id: 'moonbeam', name: 'Moonbeam', icon: '🌙' },
    { id: 'base', name: 'Base', icon: '🔵' },
    { id: 'arbitrum', name: 'Arbitrum', icon: '🔷' },
  ];

  // 获取SLPx报价
  const getQuote = async () => {
    if (!selectedSourceChain || !selectedAsset || !stakingAmount) {
      return;
    }

    const amount = parseFloat(stakingAmount);
    if (isNaN(amount) || amount <= 0) {
      return;
    }

    setIsGettingQuote(true);
    try {
      const quoteResult = await slpx.getQuote(
        selectedSourceChain,
        selectedAsset,
        amount,
        {
          prioritize: 'yield',
          maxSlippage: slippage,
          maxBridgeTime: 600000,
          preferredBridges: [],
          avoidBridges: []
        }
      );
      setQuote(quoteResult);
    } catch (error) {
      console.error('Failed to get SLPx quote:', error);
      dispatch(setError('获取报价失败'));
    } finally {
      setIsGettingQuote(false);
    }
  };

  // 执行一键质押
  const executeOneClickStaking = async () => {
    if (!selectedSourceChain || !selectedAsset || !stakingAmount || !account) {
      return;
    }

    const amount = parseFloat(stakingAmount);
    if (isNaN(amount) || amount <= 0) {
      dispatch(setError('请输入有效的金额'));
      return;
    }

    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const request = await slpx.executeOneClickStaking(
        selectedSourceChain,
        selectedAsset,
        amount,
        account.address,
        account.address,
        {
          prioritize: 'yield',
          maxSlippage: slippage,
          maxBridgeTime: 600000,
          preferredBridges: [],
          avoidBridges: []
        }
      );

      dispatch(addStakingRequest(request));
      setActiveStakingRequest(request);
      
      // 监听质押状态更新
      slpx.addEventListener('step_updated', (updatedRequest: SLPxStakingRequest) => {
        if (updatedRequest.id === request.id) {
          setActiveStakingRequest(updatedRequest);
        }
      });

      slpx.addEventListener('slpx_completed', (completedRequest: SLPxStakingRequest) => {
        if (completedRequest.id === request.id) {
          setActiveStakingRequest(completedRequest);
        }
      });

    } catch (error: any) {
      dispatch(setError(error.message || '一键质押执行失败'));
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
  }, [selectedSourceChain, selectedAsset, stakingAmount, slippage]);

  // 获取可用的资产（基于选中的源链）
  const getAvailableAssets = () => {
    if (!selectedSourceChain) return supportedAssets;
    
    // 根据源链过滤可用资产
    const chainAssetMap: { [key: string]: string[] } = {
      'polkadot': ['DOT'],
      'ethereum': ['ETH'],
      'moonbeam': ['DOT', 'ETH', 'GLMR'],
      'base': ['ETH'],
      'arbitrum': ['ETH'],
    };

    const availableAssetSymbols = chainAssetMap[selectedSourceChain] || [];
    return supportedAssets.filter(asset => availableAssetSymbols.includes(asset.symbol));
  };

  // 渲染质押进度
  const renderStakingProgress = () => {
    if (!activeStakingRequest) return null;

    const currentStepIndex = activeStakingRequest.steps.findIndex(step => step.status === 'active');

    return (
      <Card title="一键质押进度" style={{ marginTop: 16 }}>
        <Progress 
          percent={activeStakingRequest.progress} 
          status={activeStakingRequest.status === 'failed' ? 'exception' : 'active'}
          strokeColor={{
            '0%': '#722ed1',
            '100%': '#52c41a',
          }}
        />
        
        <Steps
          current={currentStepIndex}
          status={activeStakingRequest.status === 'failed' ? 'error' : 'process'}
          direction="vertical"
          size="small"
          style={{ marginTop: 16 }}
        >
          {activeStakingRequest.steps.map((step, index) => (
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

        {activeStakingRequest.status === 'completed' && activeStakingRequest.vTokenReceived && (
          <Alert
            message="质押成功！"
            description={`您已成功获得 ${activeStakingRequest.vTokenReceived.toFixed(6)} v${selectedAsset}`}
            type="success"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}
      </Card>
    );
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <Title level={2}>
          <RocketOutlined style={{ color: '#722ed1', marginRight: 8 }} />
          SLPx 一键跨链质押
        </Title>
        <Text type="secondary">
          在任意支持的链上一键质押，自动跨链到 Bifrost 并获得流动性质押代币
        </Text>
      </div>

      <Card>
        <Row gutter={[16, 16]}>
          {/* 源链选择 */}
          <Col span={12}>
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
                    <Space>
                      <span>{chain.icon}</span>
                      <span>{chain.name}</span>
                    </Space>
                  </Option>
                ))}
              </Select>
            </div>
          </Col>

          {/* 资产选择 */}
          <Col span={12}>
            <div>
              <Text strong>质押资产</Text>
              <Select
                style={{ width: '100%', marginTop: 8 }}
                placeholder="选择资产"
                value={selectedAsset}
                onChange={(value) => dispatch(setSelectedAsset(value))}
                disabled={!selectedSourceChain}
              >
                {getAvailableAssets().map(asset => (
                  <Option key={asset.symbol} value={asset.symbol}>
                    <Space>
                      <span>{asset.icon}</span>
                      <span>{asset.symbol}</span>
                      <Tooltip title={`当前APY: ${asset.apy}%`}>
                        <TrophyOutlined style={{ color: '#faad14' }} />
                      </Tooltip>
                    </Space>
                  </Option>
                ))}
              </Select>
            </div>
          </Col>
        </Row>

        <Divider />

        <Row gutter={[16, 16]}>
          {/* 质押金额 */}
          <Col span={18}>
            <div>
              <Text strong>质押金额</Text>
              <Input
                style={{ marginTop: 8 }}
                placeholder="输入质押金额"
                value={stakingAmount}
                onChange={(e) => dispatch(setStakingAmount(e.target.value))}
                suffix={selectedAsset}
                size="large"
              />
            </div>
          </Col>

          {/* 高级设置 */}
          <Col span={6}>
            <div style={{ marginTop: 32 }}>
              <Button
                type="text"
                icon={<SettingOutlined />}
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              >
                高级设置
              </Button>
            </div>
          </Col>
        </Row>

        {/* 高级设置面板 */}
        {showAdvancedSettings && (
          <Card size="small" style={{ marginTop: 16, backgroundColor: '#fafafa' }}>
            <div>
              <Text strong>滑点容忍度: {slippage}%</Text>
              <Slider
                style={{ marginTop: 8 }}
                min={0.1}
                max={5}
                step={0.1}
                value={slippage}
                onChange={(value) => dispatch(setSlippage(value))}
                marks={{
                  0.5: '0.5%',
                  1: '1%',
                  2: '2%',
                  5: '5%'
                }}
              />
            </div>
          </Card>
        )}

        {/* 报价信息 */}
        {quote && (
          <Card size="small" style={{ marginTop: 16, backgroundColor: '#f6ffed' }}>
            <Row gutter={16}>
              <Col span={6}>
                <Text type="secondary">预计获得</Text>
                <div>
                  <Text strong>{quote.expectedVTokens.toFixed(6)} v{selectedAsset}</Text>
                </div>
              </Col>
              <Col span={6}>
                <Text type="secondary">总费用</Text>
                <div>
                  <Text strong>{quote.totalFee.toFixed(6)} {selectedAsset}</Text>
                </div>
              </Col>
              <Col span={6}>
                <Text type="secondary">预计时间</Text>
                <div>
                  <Text strong>{Math.round(quote.estimatedTime / 60000)} 分钟</Text>
                </div>
              </Col>
              <Col span={6}>
                <Text type="secondary">年化收益</Text>
                <div>
                  <Text strong style={{ color: '#52c41a' }}>{quote.route.apy.toFixed(2)}%</Text>
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
              onClick={executeOneClickStaking}
              icon={<RocketOutlined />}
              style={{ 
                background: 'linear-gradient(135deg, #722ed1 0%, #eb2f96 100%)',
                border: 'none',
                height: '48px',
                padding: '0 32px'
              }}
       >
              {isLoading ? '执行中...' : '一键质押'}
            </Button>
            
            {!isConnected && (
              <Text type="secondary">
                <InfoCircleOutlined /> 请先连接钱包
              </Text>
            )}
          </Space>
        </div>

        {/* 提示信息 */}
        <Alert
          message="什么是一键跨链质押？"
          description="SLPx 一键跨链质押允许您在任意支持的链上直接质押资产，系统会自动处理跨链桥接和质押流程，最终您将在 Bifrost 上收到相应的流动性质押代币（vToken）。"
          type="info"
          showIcon
          style={{ marginTop: 16 }}
        />
      </Card>

      {/* 质押进度 */}
      {renderStakingProgress()}
    </div>
  );
};

export default SLPxOneClickStaking;