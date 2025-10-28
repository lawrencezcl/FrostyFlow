import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Button, List, Tag, Progress, Space, Alert, Modal, Tooltip } from 'antd';
import { 
  BulbOutlined, 
  TrophyOutlined, 
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FireOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
  ReloadOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useAppSelector } from '../redux/hooks';
import smartRecommendation from '../services/smartRecommendationService';
import { Recommendation, MarketInsight } from '../types/recommendation';

const { Title, Text, Paragraph } = Typography;

const SmartRecommendationEngine: React.FC = () => {
  const { account, isConnected } = useAppSelector(state => state.wallet);
  
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [marketInsights, setMarketInsights] = useState<MarketInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  const [showExecuteModal, setShowExecuteModal] = useState(false);

  useEffect(() => {
    if (isConnected && account) {
      loadRecommendations();
      loadMarketInsights();
    }
  }, [isConnected, account]);

  const loadRecommendations = async () => {
    if (!account) return;

    setLoading(true);
    try {
      const recs = await smartRecommendation.getUserRecommendations(account.address, 20);
      setRecommendations(recs);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMarketInsights = async () => {
    try {
      const insights = await smartRecommendation.getMarketInsights();
      setMarketInsights(insights);
    } catch (error) {
      console.error('Failed to load market insights:', error);
    }
  };

  const handleExecuteRecommendation = async (recommendation: Recommendation) => {
    if (!account) return;

    try {
      const success = await smartRecommendation.executeRecommendation(recommendation.id, account.address);
      if (success) {
        // 更新推荐状态
        setRecommendations(prev => 
          prev.map(rec => 
            rec.id === recommendation.id 
              ? { ...rec, isExecuted: true, executedAt: Date.now() }
              : rec
          )
        );
        setShowExecuteModal(false);
      }
    } catch (error) {
      console.error('Failed to execute recommendation:', error);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <FireOutlined style={{ color: '#ff4d4f' }} />;
      case 'high':
        return <ExclamationCircleOutlined style={{ color: '#fa8c16' }} />;
      case 'medium':
        return <ClockCircleOutlined style={{ color: '#faad14' }} />;
      case 'low':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      default:
        return <BulbOutlined />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'gold';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'green';
      case 'medium': return 'orange';
      case 'high': return 'red';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'stake':
        return <TrophyOutlined style={{ color: '#52c41a' }} />;
      case 'rebalance':
        return <ThunderboltOutlined style={{ color: '#1890ff' }} />;
      case 'unstake':
        return <SafetyOutlined style={{ color: '#faad14' }} />;
      default:
        return <BulbOutlined />;
    }
  };

  const renderRecommendationCard = (recommendation: Recommendation) => (
    <Card
      key={recommendation.id}
      size="small"
      style={{ marginBottom: 16 }}
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            {getTypeIcon(recommendation.type)}
            <span>{recommendation.title}</span>
          </Space>
          <Space>
            <Tag color={getPriorityColor(recommendation.priority)}>
              {getPriorityIcon(recommendation.priority)}
              {recommendation.priority.toUpperCase()}
            </Tag>
            <Tag color={getRiskColor(recommendation.riskLevel)}>
              风险: {recommendation.riskLevel.toUpperCase()}
            </Tag>
          </Space>
        </div>
      }
      extra={
        <Space>
          <Text type="secondary">
            置信度: {(recommendation.confidence * 100).toFixed(0)}%
          </Text>
          {!recommendation.isExecuted && (
            <Button 
              type="primary" 
              size="small"
              onClick={() => {
                setSelectedRecommendation(recommendation);
                setShowExecuteModal(true);
              }}
            >
              执行
            </Button>
          )}
          {recommendation.isExecuted && (
            <Tag color="green">已执行</Tag>
          )}
        </Space>
      }
    >
      <Row gutter={16}>
        <Col span={16}>
          <Paragraph style={{ marginBottom: 8 }}>
            {recommendation.description}
          </Paragraph>
          
          <div style={{ marginBottom: 12 }}>
            <Text strong>分析原因:</Text>
            <ul style={{ marginTop: 4, marginBottom: 0, paddingLeft: 20 }}>
              {recommendation.reasoning.map((reason, index) => (
                <li key={index}>{reason}</li>
              ))}
            </ul>
          </div>

          {recommendation.expectedOutcome && (
            <div style={{ marginBottom: 8 }}>
              <Text strong>预期效果:</Text>
              <div style={{ marginTop: 4 }}>
                {recommendation.expectedOutcome.apyIncrease && (
                  <Tag color="green">
                    APY提升: +{recommendation.expectedOutcome.apyIncrease.toFixed(2)}%
                  </Tag>
                )}
                {recommendation.expectedOutcome.projectedReturn && (
                  <Tag color="blue">
                    预期收益: ${recommendation.expectedOutcome.projectedReturn.toFixed(2)}
                  </Tag>
                )}
                {recommendation.expectedOutcome.riskReduction && (
                  <Tag color="orange">
                    风险降低: {recommendation.expectedOutcome.riskReduction.toFixed(1)}%
                  </Tag>
                )}
              </div>
            </div>
          )}
        </Col>
        
        <Col span={8}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ marginBottom: 8 }}>
              <Text type="secondary">置信度</Text>
              <Progress 
                percent={recommendation.confidence * 100} 
                size="small" 
                strokeColor="#52c41a"
                showInfo={false}
              />
            </div>
            
            <div style={{ marginBottom: 8 }}>
              <Text type="secondary">预估Gas费用</Text>
              <div>
                <Text strong>${recommendation.estimatedGasCost.toFixed(2)}</Text>
              </div>
            </div>
            
            {recommendation.potentialReward > 0 && (
              <div style={{ marginBottom: 8 }}>
                <Text type="secondary">潜在收益</Text>
                <div>
                  <Text strong style={{ color: '#52c41a' }}>
                    ${recommendation.potentialReward.toFixed(2)}
                  </Text>
                </div>
              </div>
            )}
            
            <div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {new Date(recommendation.createdAt).toLocaleString()}
              </Text>
            </div>
          </div>
        </Col>
      </Row>
    </Card>
  );

  const renderMarketInsights = () => (
    <Card title="市场洞察" style={{ marginBottom: 24 }}>
      <List
        dataSource={marketInsights}
        renderItem={(insight) => (
          <List.Item>
            <List.Item.Meta
              avatar={
                <div style={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: '50%', 
                  backgroundColor: insight.impact === 'positive' ? '#f6ffed' : '#fff2e8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {insight.impact === 'positive' ? 
                    <TrophyOutlined style={{ color: '#52c41a' }} /> :
                    <ExclamationCircleOutlined style={{ color: '#fa8c16' }} />
                  }
                </div>
              }
              title={
                <Space>
                  <span>{insight.title}</span>
                  <Tag color={insight.impact === 'positive' ? 'green' : 'orange'}>
                    {insight.impact === 'positive' ? '机会' : '风险'}
                  </Tag>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    置信度: {(insight.confidence * 100).toFixed(0)}%
                  </Text>
                </Space>
              }
              description={
                <div>
                  <div>{insight.description}</div>
                  <div style={{ marginTop: 4 }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      影响资产: {insight.affectedAssets.join(', ')} | 
                      时间范围: {insight.timeframe} | 
                      来源: {insight.source}
                    </Text>
                  </div>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );

  const renderExecuteModal = () => (
    <Modal
      title="执行推荐"
      open={showExecuteModal}
      onOk={() => selectedRecommendation && handleExecuteRecommendation(selectedRecommendation)}
      onCancel={() => setShowExecuteModal(false)}
      okText="确认执行"
      cancelText="取消"
    >
      {selectedRecommendation && (
        <div>
          <Title level={4}>{selectedRecommendation.title}</Title>
          <Paragraph>{selectedRecommendation.description}</Paragraph>
          
          <div style={{ marginBottom: 16 }}>
            <Text strong>预估费用:</Text>
            <div>Gas费用: ${selectedRecommendation.estimatedGasCost.toFixed(2)}</div>
          </div>
          
          {selectedRecommendation.potentialReward > 0 && (
            <div style={{ marginBottom: 16 }}>
              <Text strong>预期收益:</Text>
              <div style={{ color: '#52c41a' }}>
                ${selectedRecommendation.potentialReward.toFixed(2)}
              </div>
            </div>
          )}
          
          <Alert
            message="风险提示"
            description={`此操作风险等级为${selectedRecommendation.riskLevel}，请确认您了解相关风险后再执行。`}
            type="warning"
            showIcon
          />
        </div>
      )}
    </Modal>
  );

  if (!isConnected) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Alert
          message="请连接钱包"
          description="连接钱包后即可获得个性化投资建议"
          type="info"
          showIcon
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2}>
            <BulbOutlined style={{ color: '#1890ff', marginRight: 8 }} />
            智能推荐引擎
          </Title>
          <Text type="secondary">
            基于AI分析为您提供个性化投资建议和优化方案
          </Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadRecommendations} loading={loading}>
            刷新推荐
          </Button>
          <Button icon={<SettingOutlined />}>
            偏好设置
          </Button>
        </Space>
      </div>

      {renderMarketInsights()}

      <Card 
        title={`个性化推荐 (${recommendations.length})`}
        extra={
          <Space>
            <Text type="secondary">
              未执行: {recommendations.filter(r => !r.isExecuted).length}
            </Text>
          </Space>
        }
      >
        {recommendations.length > 0 ? (
          recommendations.map(renderRecommendationCard)
        ) : (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <BulbOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: 16 }} />
            <div>
              <Text type="secondary">暂无推荐建议</Text>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                系统正在分析您的投资组合，请稍后查看
              </Text>
            </div>
          </div>
        )}
      </Card>

      {renderExecuteModal()}
    </div>
  );
};

export default SmartRecommendationEngine;