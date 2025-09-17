import React from 'react';
import { Card, Collapse, Typography, List, Tag, Divider } from 'antd';
import { QuestionCircleOutlined, BookOutlined, SafetyCertificateOutlined, CustomerServiceOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const HelpCenter: React.FC = () => {
  const faqData = [
    {
      key: '1',
      question: '什么是流动性质押？',
      answer: '流动性质押是一种创新的DeFi机制，允许用户质押基础资产（如DOT、KSM）获得对应的流动性代币（如vDOT、vKSM）。这些流动性代币可以自由转移和交易，同时继续获得质押收益。'
    },
    {
      key: '2',
      question: '如何连接钱包？',
      answer: 'FrostyFlow支持多种钱包：Polkadot.js、MetaMask、Talisman。点击右上角的"连接钱包"按钮，选择您已安装的钱包扩展，按照提示完成连接即可。'
    },
    {
      key: '3',
      question: '质押有什么风险？',
      answer: '质押风险包括：1) 智能合约风险 2) 验证者作恶风险 3) 网络风险 4) 流动性风险。请确保您充分理解这些风险后再进行质押操作。'
    },
    {
      key: '4',
      question: '如何赎回质押的资产？',
      answer: '您可以选择两种赎回方式：1) 标准赎回：等待期7-28天，无额外费用 2) 即时赎回：立即到账，收取3-5%手续费。在"质押赎回"页面选择相应的流动性代币进行操作。'
    },
    {
      key: '5',
      question: '收益如何计算？',
      answer: '收益基于验证者的实际表现和网络参数动态计算。收益会自动复投到您的流动性代币中，您可以在资产总览页面查看实时收益情况。'
    },
    {
      key: '6',
      question: '支持哪些链？',
      answer: 'FrostyFlow支持Bifrost生态的多条链，包括Bifrost Polkadot、Bifrost Kusama、Moonbeam、Moonriver等。系统会自动识别兼容的链网络。'
    }
  ];

  const guideData = [
    {
      title: '新手指南',
      icon: <BookOutlined />,
      items: [
        '1. 安装并设置钱包扩展',
        '2. 连接钱包到FrostyFlow',
        '3. 选择要质押的资产和数量',
        '4. 确认交易并等待确认',
        '5. 查看收到的流动性代币'
      ]
    },
    {
      title: '安全须知',
      icon: <SafetyCertificateOutlined />,
      items: [
        '务必验证网站URL的正确性',
        '不要分享您的私钥或助记词',
        '使用硬件钱包增强安全性',
        '小额测试后再进行大额操作',
        '定期备份钱包信息'
      ]
    },
    {
      title: '常见问题解决',
      icon: <CustomerServiceOutlined />,
      items: [
        '钱包连接失败：检查扩展是否安装和启用',
        '交易失败：检查余额和网络状态',
        '收益显示异常：刷新页面或等待数据同步',
        '赎回卡住：联系客服获得帮助',
        '网络切换问题：手动添加网络配置'
      ]
    }
  ];

  return (
    <div>
      <Title level={2}>帮助中心</Title>
      <Text type="secondary">
        查找常见问题的答案，了解平台使用方法
      </Text>

      <div style={{ marginTop: 24 }}>
        <Card title={<><QuestionCircleOutlined /> 常见问题</>} style={{ marginBottom: 24 }}>
          <Collapse>
            {faqData.map(item => (
              <Panel header={item.question} key={item.key}>
                <Paragraph>{item.answer}</Paragraph>
              </Panel>
            ))}
          </Collapse>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {guideData.map((guide, index) => (
            <Card 
              key={index}
              title={<>{guide.icon} {guide.title}</>}
              style={{ height: 'fit-content' }}
            >
              <List
                dataSource={guide.items}
                renderItem={(item) => (
                  <List.Item>
                    <Text>{item}</Text>
                  </List.Item>
                )}
              />
            </Card>
          ))}
        </div>

        <Card title="技术支持" style={{ marginTop: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
            <div>
              <Title level={5}>联系我们</Title>
              <Paragraph>
                <Text>邮箱: support@frostyflow.com</Text><br />
                <Text>Telegram: @FrostyFlowSupport</Text><br />
                <Text>Discord: FrostyFlow Community</Text>
              </Paragraph>
            </div>
            
            <div>
              <Title level={5}>文档资源</Title>
              <Paragraph>
                <Text>• 用户手册</Text><br />
                <Text>• API 文档</Text><br />
                <Text>• 智能合约源码</Text><br />
                <Text>• 安全审计报告</Text>
              </Paragraph>
            </div>
            
            <div>
              <Title level={5}>社区</Title>
              <Paragraph>
                <Text>• GitHub Repository</Text><br />
                <Text>• 官方博客</Text><br />
                <Text>• Twitter @FrostyFlow</Text><br />
                <Text>• Medium 技术分享</Text>
              </Paragraph>
            </div>
          </div>

          <Divider />
          
          <div style={{ textAlign: 'center' }}>
            <Tag color="blue">版本 1.0.0</Tag>
            <Tag color="green">最后更新: 2024-01-15</Tag>
            <Tag color="orange">Bifrost 生态支持</Tag>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default HelpCenter;