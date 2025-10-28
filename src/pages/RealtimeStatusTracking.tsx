import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Timeline, Progress, Tag, Button, List, Badge, Drawer, Statistic, Alert } from 'antd';
import { 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined, 
  CloseCircleOutlined,
  ReloadOutlined,
  BellOutlined,
  EyeOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import realtimeStatusTracking from '../services/realtimeStatusTrackingService';
import { TransactionStatus, StatusNotification, StatusStatistics } from '../types/statusTracking';

const { Title, Text } = Typography;

const RealtimeStatusTracking: React.FC = () => {
  const { account, isConnected } = useAppSelector(state => state.wallet);
  
  const [activeTransactions, setActiveTransactions] = useState<TransactionStatus[]>([]);
  const [transactionHistory, setTransactionHistory] = useState<TransactionStatus[]>([]);
  const [notifications, setNotifications] = useState<StatusNotification[]>([]);
  const [statistics, setStatistics] = useState<StatusStatistics | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionStatus | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (isConnected) {
      initializeTracking();
      loadData();
    }

    return () => {
      realtimeStatusTracking.stopRealtimeUpdates();
    };
  }, [isConnected]);

  const initializeTracking = () => {
    // Start real-time updates
    realtimeStatusTracking.startRealtimeUpdates();

    // Listen for events
    realtimeStatusTracking.addEventListener('transaction_updated', handleTransactionUpdate);
    realtimeStatusTracking.addEventListener('transaction_completed', handleTransactionComplete);
    realtimeStatusTracking.addEventListener('transaction_failed', handleTransactionFailed);
    realtimeStatusTracking.addEventListener('notification_created', handleNotificationCreated);
  };

  const loadData = () => {
    setActiveTransactions(realtimeStatusTracking.getActiveTransactions());
    setTransactionHistory(realtimeStatusTracking.getTransactionHistory());
    setNotifications(realtimeStatusTracking.getNotifications());
    setStatistics(realtimeStatusTracking.getStatistics());
  };

  const handleTransactionUpdate = (transaction: TransactionStatus) => {
    setActiveTransactions(prev => {
      const index = prev.findIndex(tx => tx.id === transaction.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = transaction;
        return updated;
      }
      return prev;
    });
  };

  const handleTransactionComplete = (transaction: TransactionStatus) => {
    setActiveTransactions(prev => prev.filter(tx => tx.id !== transaction.id));
    setTransactionHistory(prev => [transaction, ...prev.slice(0, 49)]);
  };

  const handleTransactionFailed = (transaction: TransactionStatus) => {
    setActiveTransactions(prev => prev.filter(tx => tx.id !== transaction.id));
    setTransactionHistory(prev => [transaction, ...prev.slice(0, 49)]);
  };

  const handleNotificationCreated = (notification: StatusNotification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 99)]);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockCircleOutlined style={{ color: '#faad14' }} />;
      case 'processing':
        return <ClockCircleOutlined style={{ color: '#1890ff' }} />;
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'failed':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <ExclamationCircleOutlined style={{ color: '#d9d9d9' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'processing': return 'blue';
      case 'completed': return 'green';
      case 'failed': return 'red';
      default: return 'default';
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'stake': 'Stake',
      'redeem': 'Redeem',
      'bridge': 'Cross-Chain Bridge',
      'slpx': 'SLPx Stake',
      'swap': 'Token Swap'
    };
    return labels[type] || type;
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const renderTransactionCard = (transaction: TransactionStatus) => (
    <Card 
      key={transaction.id}
      size="small" 
      style={{ marginBottom: 16 }}
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>
            {getStatusIcon(transaction.status)}
            <span style={{ marginLeft: 8 }}>
              {getTransactionTypeLabel(transaction.type)}
            </span>
          </span>
          <Tag color={getStatusColor(transaction.status)}>
            {transaction.status.toUpperCase()}
          </Tag>
        </div>
      }
      extra={
        <Button 
          type="text" 
          icon={<EyeOutlined />}
          onClick={() => setSelectedTransaction(transaction)}
        >
          Details
        </Button>
      }
    >
      <Row gutter={16}>
        <Col span={12}>
          <Progress 
            percent={transaction.progress} 
            status={transaction.status === 'failed' ? 'exception' : 'active'}
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
          />
        </Col>
        <Col span={12}>
          <Text type="secondary">
            Step {transaction.currentStep + 1} / {transaction.totalSteps}
          </Text>
        </Col>
      </Row>
      
      {transaction.metadata.amount && (
        <div style={{ marginTop: 8 }}>
          <Text strong>
            {transaction.metadata.amount} {transaction.metadata.asset}
          </Text>
          {transaction.metadata.sourceChain && transaction.metadata.targetChain && (
            <Text type="secondary" style={{ marginLeft: 8 }}>
              {transaction.metadata.sourceChain} → {transaction.metadata.targetChain}
            </Text>
          )}
        </div>
      )}

      {transaction.remainingTime > 0 && (
        <div style={{ marginTop: 8 }}>
          <Text type="secondary">
            Estimated time remaining: {formatDuration(transaction.remainingTime)}
          </Text>
        </div>
      )}
    </Card>
  );

  const renderTransactionDetails = () => {
    if (!selectedTransaction) return null;

    return (
      <Drawer
        title="Transaction Details"
        placement="right"
        width={600}
        open={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      >
        <div style={{ marginBottom: 24 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Statistic 
                title="Transaction ID" 
                value={selectedTransaction.id.slice(0, 8) + '...'} 
              />
            </Col>
            <Col span={12}>
              <Statistic 
                title="Status" 
                value={selectedTransaction.status.toUpperCase()}
                valueStyle={{ color: getStatusColor(selectedTransaction.status) === 'green' ? '#52c41a' : '#ff4d4f' }}
              />
            </Col>
          </Row>
        </div>

        <div style={{ marginBottom: 24 }}>
          <Title level={5}>Progress Details</Title>
          <Progress 
            percent={selectedTransaction.progress} 
            status={selectedTransaction.status === 'failed' ? 'exception' : 'active'}
          />
          <Text type="secondary">
            Step {selectedTransaction.currentStep + 1} / {selectedTransaction.totalSteps}
          </Text>
        </div>

        <div style={{ marginBottom: 24 }}>
          <Title level={5}>Execution Steps</Title>
          <Timeline>
            {selectedTransaction.steps.map((step, index) => (
              <Timeline.Item
                key={step.id}
                dot={getStatusIcon(step.status)}
                color={getStatusColor(step.status)}
              >
                <div>
                  <Text strong>{step.name}</Text>
                  <div>
                    <Text type="secondary">{step.description}</Text>
                  </div>
                  {step.duration && (
                    <div>
                      <Text type="secondary">
                        Duration: {formatDuration(step.duration)}
                      </Text>
                    </div>
                  )}
                  {step.txHash && (
                    <div>
                      <Text type="secondary">
                        Transaction Hash: {step.txHash.slice(0, 10)}...
                      </Text>
                    </div>
                  )}
                  {step.errorMessage && (
                    <Alert
                      message={step.errorMessage}
                      type="error"
                      style={{ marginTop: 8 }}
                    />
                  )}
                </div>
              </Timeline.Item>
            ))}
          </Timeline>
        </div>

        {selectedTransaction.metadata && (
          <div>
            <Title level={5}>Transaction Information</Title>
            <Row gutter={[16, 8]}>
              {selectedTransaction.metadata.amount && (
                <Col span={12}>
                  <Text type="secondary">Amount:</Text>
                  <div>
                    <Text strong>
                      {selectedTransaction.metadata.amount} {selectedTransaction.metadata.asset}
                    </Text>
                  </div>
                </Col>
              )}
              {selectedTransaction.metadata.sourceChain && (
                <Col span={12}>
                  <Text type="secondary">Source Chain:</Text>
                  <div><Text>{selectedTransaction.metadata.sourceChain}</Text></div>
                </Col>
              )}
              {selectedTransaction.metadata.targetChain && (
                <Col span={12}>
                  <Text type="secondary">Target Chain:</Text>
                  <div><Text>{selectedTransaction.metadata.targetChain}</Text></div>
                </Col>
              )}
              {selectedTransaction.metadata.slippage && (
                <Col span={12}>
                  <Text type="secondary">Slippage:</Text>
                  <div><Text>{selectedTransaction.metadata.slippage}%</Text></div>
                </Col>
              )}
            </Row>
          </div>
        )}
      </Drawer>
    );
  };

  const renderNotifications = () => (
    <Drawer
      title="Notification Center"
      placement="right"
      width={400}
      open={showNotifications}
      onClose={() => setShowNotifications(false)}
      extra={
        <Button 
          type="text" 
          onClick={() => {
            realtimeStatusTracking.clearAllNotifications();
            setNotifications([]);
          }}
        >
          Clear All
        </Button>
      }
    >
      <List
        dataSource={notifications}
        renderItem={(notification) => (
          <List.Item
            style={{ 
              opacity: notification.isRead ? 0.6 : 1,
              borderLeft: `3px solid ${
                notification.type === 'success' ? '#52c41a' :
                notification.type === 'error' ? '#ff4d4f' :
                notification.type === 'warning' ? '#faad14' : '#1890ff'
              }`
            }}
            onClick={() => {
              if (!notification.isRead) {
                realtimeStatusTracking.markNotificationAsRead(notification.id);
                setNotifications(prev => 
                  prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
                );
              }
            }}
          >
            <List.Item.Meta
              title={notification.title}
              description={
                <div>
                  <div>{notification.message}</div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {new Date(notification.timestamp).toLocaleString()}
                  </Text>
                </div>
              }
            />
          </List.Item>
        )}
        locale={{ emptyText: 'No notifications' }}
      />
    </Drawer>
  );

  const renderStatistics = () => {
    if (!statistics) return null;

    return (
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Transactions"
              value={statistics.totalTransactions}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="In Progress"
              value={statistics.pendingTransactions}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Success Rate"
              value={statistics.successRate}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Avg. Completion Time"
              value={formatDuration(statistics.averageCompletionTime)}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  if (!isConnected) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Alert
          message="Please connect your wallet"
          description="Connect your wallet to view real-time transaction status"
          type="info"
          showIcon
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2}>
            <ClockCircleOutlined style={{ color: '#1890ff', marginRight: 8 }} />
            Real-time Status Tracking
          </Title>
          <Text type="secondary">
            Real-time monitoring of the execution status and progress of all transactions
          </Text>
        </div>
        <div>
          <Button 
            icon={<BellOutlined />}
            onClick={() => setShowNotifications(true)}
            style={{ marginRight: 8 }}
          >
            <Badge count={notifications.filter(n => !n.isRead).length} size="small">
              Notifications
            </Badge>
          </Button>
          <Button 
            icon={<HistoryOutlined />}
            onClick={() => setShowHistory(true)}
            style={{ marginRight: 8 }}
          >
            History
          </Button>
          <Button 
            icon={<ReloadOutlined />}
            onClick={loadData}
          >
            Refresh
          </Button>
        </div>
      </div>

      {renderStatistics()}

      <Row gutter={24}>
        <Col span={24}>
          <Card title="Active Transactions" style={{ minHeight: '400px' }}>
            {activeTransactions.length > 0 ? (
              activeTransactions.map(renderTransactionCard)
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Text type="secondary">No active transactions</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {renderTransactionDetails()}
      {renderNotifications()}
    </div>
  );
};

export default RealtimeStatusTracking;