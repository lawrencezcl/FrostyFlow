import React from 'react';
import { Card, Collapse, Typography, List, Tag, Divider } from 'antd';
import { QuestionCircleOutlined, BookOutlined, SafetyCertificateOutlined, CustomerServiceOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const HelpCenter: React.FC = () => {
  const { t } = useTranslation();

  const faqData = [
    {
      key: '1',
      question: t('help.faqs.whatIsLiquidStaking.question'),
      answer: t('help.faqs.whatIsLiquidStaking.answer')
    },
    {
      key: '2',
      question: t('help.faqs.howToConnectWallet.question'),
      answer: t('help.faqs.howToConnectWallet.answer')
    },
    {
      key: '3',
      question: t('help.faqs.stakingRisks.question'),
      answer: t('help.faqs.stakingRisks.answer')
    },
    {
      key: '4',
      question: t('help.faqs.howToRedeem.question'),
      answer: t('help.faqs.howToRedeem.answer')
    },
    {
      key: '5',
      question: t('help.faqs.howEarningsCalculated.question'),
      answer: t('help.faqs.howEarningsCalculated.answer')
    },
    {
      key: '6',
      question: t('help.faqs.supportedChains.question'),
      answer: t('help.faqs.supportedChains.answer')
    }
  ];

  const guideData = [
    {
      title: t('help.guides.beginnerGuide.title'),
      icon: <BookOutlined />,
      items: t('help.guides.beginnerGuide.items', { returnObjects: true }) as string[]
    },
    {
      title: t('help.guides.securityTips.title'),
      icon: <SafetyCertificateOutlined />,
      items: t('help.guides.securityTips.items', { returnObjects: true }) as string[]
    },
    {
      title: t('help.guides.troubleshooting.title'),
      icon: <CustomerServiceOutlined />,
      items: t('help.guides.troubleshooting.items', { returnObjects: true }) as string[]
    }
  ];

  return (
    <div>
      <Title level={2}>{t('help.helpCenter')}</Title>
      <Text type="secondary">
        {t('help.subtitle')}
      </Text>

      <div style={{ marginTop: 24 }}>
        <Card title={<><QuestionCircleOutlined /> {t('help.frequentlyAskedQuestions')}</>} style={{ marginBottom: 24 }}>
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

        <Card title={t('help.support.technicalSupport')} style={{ marginTop: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
            <div>
              <Title level={5}>{t('help.support.contactUs')}</Title>
              <Paragraph>
                <Text>{t('help.support.email')}</Text><br />
                <Text>{t('help.support.telegram')}</Text><br />
                <Text>{t('help.support.discord')}</Text>
              </Paragraph>
            </div>

            <div>
              <Title level={5}>{t('help.support.documentationResources')}</Title>
              <Paragraph>
                <Text>• {t('help.support.userManual')}</Text><br />
                <Text>• {t('help.support.apiDocs')}</Text><br />
                <Text>• {t('help.support.smartContractSource')}</Text><br />
                <Text>• {t('help.support.securityAuditReport')}</Text>
              </Paragraph>
            </div>

            <div>
              <Title level={5}>{t('help.support.communitySection')}</Title>
              <Paragraph>
                <Text>• {t('help.support.githubRepo')}</Text><br />
                <Text>• {t('help.support.officialBlog')}</Text><br />
                <Text>• {t('help.support.twitter')}</Text><br />
                <Text>• {t('help.support.mediumTechSharing')}</Text>
              </Paragraph>
            </div>
          </div>

          <Divider />

          <div style={{ textAlign: 'center' }}>
            <Tag color="blue">{t('help.support.version')}</Tag>
            <Tag color="green">{t('help.support.lastUpdated')}</Tag>
            <Tag color="orange">{t('help.support.bifrostEcosystemSupport')}</Tag>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default HelpCenter;