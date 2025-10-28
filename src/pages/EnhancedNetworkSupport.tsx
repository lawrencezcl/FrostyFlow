import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Table, Tag, Progress, Button, Space, Alert, Tabs, Modal, Form, Input, Select } from 'antd';
import { 
  GlobalOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  SettingOutlined,
  PlusOutlined,
  LineChartOutlined
} from '@ant-design/icons';
import { Line } from '@ant-design/plots';
import enhancedNetwork from '../services/enhancedNetworkService';
import { NetworkConfig, NetworkStatus, TestSuiteResult, NetworkPerformanceMetrics } from '../types/network';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const EnhancedNetworkSupport: React.FC = () => {
  const [networks, setNetworks] = useState<NetworkConfig[]>([]);
  const [networkStatus, setNetworkStatus] = useState<Map<string, NetworkStatus>>(new Map());
  const [testResults, setTestResults] = useState<Map<string, TestSuiteResult[]>>(new Map());
  const [performanceMetrics, setPerformanceMetrics] = useState<Map<string, NetworkPerformanceMetrics[]>>(new Map());
  const [loading, setLoading] = useState(false);
  const [showAddNetworkModal, setShowAddNetworkModal] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<string>('');

  useEffect(() => {
    loadNetworks();
    loadNetworkStatus();
    loadPerformanceMetrics();
  }, []);

  const loadNetworks = () => {
    const allNetworks = enhancedNetwork.getAllNetworks();
    setNetworks(allNetworks);
  };

  const loadNetworkStatus = () => {
    const statusMap = new Map<string, NetworkStatus>();
    networks.forEach(network => {
      const status = enhancedNetwork.getNetworkStatus(network.id);
      if (status) {
        statusMap.set(network.id, status);
      }
    });
    setNetworkStatus(statusMap);
  };

  const loadPerformanceMetrics = () => {
    const metricsMap = new Map<string, NetworkPerformanceMetrics[]>();
    networks.forEach(network => {
      const metrics = enhancedNetwork.getNetworkMetrics(network.id);
      metricsMap.set(network.id, metrics);
    });
    setPerformanceMetrics(metricsMap);
  };

  const runNetworkTests = async (networkId: string) => {
    setLoading(true);
    try {
      // Create test suite
      const testSuite = {
        id: `${networkId}_integration_test`,
        name: `${networkId} Integration Test`,
        description: `Integration tests for ${networkId} network`,
        networks: [networkId],
        tests: [
          {
            id: 'connection_test',
            name: 'Connection Test',
            description: 'Test network connection',
            category: 'connection' as const,
            priority: 'high' as const,
            timeout: 30000,
            retryCount: 3,
            prerequisites: [],
            steps: [],
            expectedResults: {}
          },
          {
            id: 'transaction_test',
            name: 'Transaction Test',
            description: 'Test transaction processing',
            category: 'transaction' as const,
            priority: 'high' as const,
            timeout: 60000,
            retryCount: 2,
            prerequisites: [],
            steps: [],
            expectedResults: {}
          }
        ],
        schedule: {
          type: 'manual' as const,
          timezone: 'UTC',
          isEnabled: true
        },
        results: []
      };

      enhancedNetwork.createTestSuite(testSuite);
      const result = await enhancedNetwork.runIntegrationTests(testSuite.id);
      
      const existingResults = testResults.get(networkId) || [];
      existingResults.push(result);
      setTestResults(new Map(testResults.set(networkId, existingResults)));
    } catch (error) {
      console.error('Failed to run tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status?: NetworkStatus) => {
    if (!status) return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
    
    if (status.isHealthy) {
      return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
    } else {
      return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
    }
  };

  const getStatusColor = (status?: NetworkStatus) => {
    if (!status) return 'red';
    return status.isHealthy ? 'green' : 'orange';
  };

  const getCongestionColor = (congestion: string) => {
    switch (congestion) {
      case 'low': return 'green';
      case 'medium': return 'orange';
      case 'high': return 'red';
      default: return 'default';
    }
  };

  const networkColumns = [
    {
      title: 'Network',
      dataIndex: 'displayName',
      key: 'displayName',
      render: (text: string, record: NetworkConfig) => (
        <Space>
          {record.iconUrl && <img src={record.iconUrl} alt={text} style={{ width: 24, height: 24 }} />}
          <span>{text}</span>
          {record.isTestnet && <Tag color="orange">Testnet</Tag>}
        </Space>
      )
    },
    {
      title: 'Status',
      key: 'status',
      render: (record: NetworkConfig) => {
        const status = networkStatus.get(record.id);
        return (
          <Space>
            {getStatusIcon(status)}
            <Tag color={getStatusColor(status)}>
              {status?.isHealthy ? 'Healthy' : 'Error'}
            </Tag>
          </Space>
        );
      }
    },
    {
      title: 'Congestion',
      key: 'congestion',
      render: (record: NetworkConfig) => {
        const status = networkStatus.get(record.id);
        return status ? (
          <Tag color={getCongestionColor(status.networkCongestion)}>
            {status.networkCongestion.toUpperCase()}
          </Tag>
        ) : '-';
      }
    },
    {
      title: 'Block Height',
      key: 'blockHeight',
      render: (record: NetworkConfig) => {
        const status = networkStatus.get(record.id);
        return status ? status.blockHeight.toLocaleString() : '-';
      }
    },
    {
      title: 'Gas Price',
      key: 'gasPrice',
      render: (record: NetworkConfig) => {
        const status = networkStatus.get(record.id);
        return status ? `${status.gasPrice.toFixed(2)} Gwei` : '-';
      }
    },
    {
      title: 'Latency',
      key: 'latency',
      render: (record: NetworkConfig) => {
        const status = networkStatus.get(record.id);
        return status ? `${status.rpcLatency}ms` : '-';
      }
    },
    {
      title: 'Features',
      key: 'features',
      render: (record: NetworkConfig) => (
        <Space wrap>
          {record.supportedFeatures.map(feature => 
            feature.isSupported && (
              <Tag key={feature.type} color="blue">
                {feature.type}
              </Tag>
            )
          )}
        </Space>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: NetworkConfig) => (
        <Space>
          <Button 
            size="small" 
            icon={<PlayCircleOutlined />}
            onClick={() => runNetworkTests(record.id)}
            loading={loading}
          >
            Test
          </Button>
          <Button 
            size="small" 
            icon={<LineChartOutlined />}
            onClick={() => setSelectedNetwork(record.id)}
          >
            Metrics
          </Button>
        </Space>
      )
    }
  ];

  const renderPerformanceChart = (networkId: string) => {
    const metrics = performanceMetrics.get(networkId) || [];
    if (metrics.length === 0) return <div>No data available</div>;

    const data = metrics.map(metric => ({
      timestamp: new Date(metric.timestamp),
      blockTime: metric.blockTime,
      gasPrice: metric.gasPrice.standard,
      successRate: metric.successRate * 100,
      latency: metric.networkLatency
    }));

    return (
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="Block Time" size="small">
            <Line
              data={data}
              xField="timestamp"
              yField="blockTime"
              height={200}
              smooth={true}
              color="#1890ff"
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Gas Price" size="small">
            <Line
              data={data}
              xField="timestamp"
              yField="gasPrice"
              height={200}
              smooth={true}
              color="#52c41a"
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Success Rate" size="small">
            <Line
              data={data}
              xField="timestamp"
              yField="successRate"
              height={200}
              smooth={true}
              color="#faad14"
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Network Latency" size="small">
            <Line
              data={data}
              xField="timestamp"
              yField="latency"
              height={200}
              smooth={true}
              color="#722ed1"
            />
          </Card>
        </Col>
      </Row>
    );
  };

  const renderTestResults = () => {
    const allResults: any[] = [];
    testResults.forEach((results, networkId) => {
      results.forEach(result => {
        allResults.push({
          ...result,
          networkId,
          networkName: networks.find(n => n.id === networkId)?.displayName || networkId
        });
      });
    });

    const testColumns = [
      {
        title: 'Network',
        dataIndex: 'networkName',
        key: 'networkName'
      },
      {
        title: 'Test Suite',
        dataIndex: 'suiteId',
        key: 'suiteId'
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status: string) => {
          const color = status === 'passed' ? 'green' : status === 'failed' ? 'red' : 'orange';
          return <Tag color={color}>{status.toUpperCase()}</Tag>;
        }
      },
      {
        title: 'Pass Rate',
        key: 'passRate',
        render: (record: any) => {
          const rate = (record.passedTests / record.totalTests) * 100;
          return (
            <div>
              <Progress percent={rate} size="small" />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {record.passedTests}/{record.totalTests}
              </Text>
            </div>
          );
        }
      },
      {
        title: 'Duration',
        dataIndex: 'duration',
        key: 'duration',
        render: (duration: number) => `${(duration / 1000).toFixed(2)}s`
      },
      {
        title: 'Start Time',
        dataIndex: 'startTime',
        key: 'startTime',
        render: (time: number) => new Date(time).toLocaleString()
      }
    ];

    return (
      <Table
        columns={testColumns}
        dataSource={allResults}
        rowKey="runId"
        size="small"
        pagination={{ pageSize: 10 }}
      />
    );
  };

  const renderAddNetworkModal = () => (
    <Modal
      title="Add Network"
      open={showAddNetworkModal}
      onCancel={() => setShowAddNetworkModal(false)}
      footer={null}
    >
      <Form layout="vertical">
        <Form.Item label="Network Name" required>
          <Input placeholder="Enter network name" />
        </Form.Item>
        <Form.Item label="Display Name" required>
          <Input placeholder="Enter display name" />
        </Form.Item>
        <Form.Item label="Chain ID" required>
          <Input type="number" placeholder="Enter Chain ID" />
        </Form.Item>
        <Form.Item label="RPC URL" required>
          <Input placeholder="Enter RPC URL" />
        </Form.Item>
        <Form.Item label="Block Explorer URL">
          <Input placeholder="Enter block explorer URL" />
        </Form.Item>
        <Form.Item label="Network Type" required>
          <Select placeholder="Select network type">
            <Select.Option value="mainnet">Mainnet</Select.Option>
            <Select.Option value="testnet">Testnet</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary">Add</Button>
            <Button onClick={() => setShowAddNetworkModal(false)}>Cancel</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2}>
            <GlobalOutlined style={{ color: '#1890ff', marginRight: 8 }} />
            Enhanced Network Support
          </Title>
          <Text type="secondary">
            Multi-chain network management, monitoring and integration testing
          </Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadNetworks}>
            Refresh
          </Button>
          <Button icon={<PlusOutlined />} onClick={() => setShowAddNetworkModal(true)}>
            Add Network
          </Button>
          <Button icon={<SettingOutlined />}>
            Settings
          </Button>
        </Space>
      </div>

      <Tabs defaultActiveKey="networks">
        <TabPane tab="Network Overview" key="networks">
          <Card>
            <Table
              columns={networkColumns}
              dataSource={networks}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </TabPane>

        <TabPane tab="Performance Monitoring" key="performance">
          {selectedNetwork ? (
            <Card title={`${networks.find(n => n.id === selectedNetwork)?.displayName} Performance Metrics`}>
              {renderPerformanceChart(selectedNetwork)}
            </Card>
          ) : (
            <Alert
              message="Please select a network"
              description="Click the 'Metrics' button in the network list to view performance data"
              type="info"
              showIcon
            />
          )}
        </TabPane>

        <TabPane tab="Integration Tests" key="tests">
          <Card title="Test Results">
            {renderTestResults()}
          </Card>
        </TabPane>
      </Tabs>

      {renderAddNetworkModal()}
    </div>
  );
};

export default EnhancedNetworkSupport;