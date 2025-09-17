import React, { useState } from 'react';
import { Card, Form, Switch, Select, Button, Divider, Typography, Space, Input, message } from 'antd';
import { SettingOutlined, NotificationOutlined, SecurityScanOutlined, GlobalOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const Settings: React.FC = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [redeemReminders, setRedeemReminders] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(false);
  const [language, setLanguage] = useState('zh-CN');
  const [currency, setCurrency] = useState('USD');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [emailAddress, setEmailAddress] = useState('');

  const handleSaveSettings = () => {
    // 这里应该调用API保存设置
    message.success('设置已保存');
  };

  const handleResetSettings = () => {
    setEmailNotifications(true);
    setPushNotifications(false);
    setRedeemReminders(true);
    setPriceAlerts(false);
    setLanguage('zh-CN');
    setCurrency('USD');
    setAutoRefresh(true);
    setEmailAddress('');
    message.info('设置已重置为默认值');
  };

  return (
    <div>
      <Title level={2}>系统设置</Title>
      <Text type="secondary">
        个性化您的FrostyFlow使用体验
      </Text>

      <div style={{ marginTop: 24 }}>
        <Card title={<><NotificationOutlined /> 通知设置</>} style={{ marginBottom: 24 }}>
          <Form layout="vertical">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
              <div>
                <Title level={5}>邮件通知</Title>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text>启用邮件通知</Text>
                    <Switch checked={emailNotifications} onChange={setEmailNotifications} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text>赎回到期提醒</Text>
                    <Switch checked={redeemReminders} onChange={setRedeemReminders} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text>价格异常提醒</Text>
                    <Switch checked={priceAlerts} onChange={setPriceAlerts} />
                  </div>
                </Space>
                
                {emailNotifications && (
                  <div style={{ marginTop: 16 }}>
                    <Text>邮箱地址:</Text>
                    <Input 
                      placeholder="请输入邮箱地址"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      style={{ marginTop: 8 }}
                    />
                  </div>
                )}
              </div>

              <div>
                <Title level={5}>浏览器通知</Title>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text>启用推送通知</Text>
                    <Switch checked={pushNotifications} onChange={setPushNotifications} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text>交易状态通知</Text>
                    <Switch checked={pushNotifications} disabled={!pushNotifications} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text>收益更新通知</Text>
                    <Switch checked={false} disabled={!pushNotifications} />
                  </div>
                </Space>
              </div>
            </div>
          </Form>
        </Card>

        <Card title={<><GlobalOutlined /> 显示设置</>} style={{ marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            <div>
              <Title level={5}>语言和地区</Title>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text>显示语言:</Text>
                  <Select value={language} onChange={setLanguage} style={{ width: '100%', marginTop: 8 }}>
                    <Option value="zh-CN">简体中文</Option>
                    <Option value="zh-TW">繁體中文</Option>
                    <Option value="en-US">English</Option>
                    <Option value="ja-JP">日本語</Option>
                    <Option value="ko-KR">한국어</Option>
                  </Select>
                </div>
                <div>
                  <Text>计价货币:</Text>
                  <Select value={currency} onChange={setCurrency} style={{ width: '100%', marginTop: 8 }}>
                    <Option value="USD">美元 (USD)</Option>
                    <Option value="EUR">欧元 (EUR)</Option>
                    <Option value="CNY">人民币 (CNY)</Option>
                    <Option value="JPY">日元 (JPY)</Option>
                    <Option value="KRW">韩元 (KRW)</Option>
                  </Select>
                </div>
              </Space>
            </div>

            <div>
              <Title level={5}>数据设置</Title>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>自动刷新数据</Text>
                  <Switch checked={autoRefresh} onChange={setAutoRefresh} />
                </div>
                <div>
                  <Text>刷新间隔:</Text>
                  <Select defaultValue="30" style={{ width: '100%', marginTop: 8 }} disabled={!autoRefresh}>
                    <Option value="10">10秒</Option>
                    <Option value="30">30秒</Option>
                    <Option value="60">1分钟</Option>
                    <Option value="300">5分钟</Option>
                  </Select>
                </div>
              </Space>
            </div>
          </div>
        </Card>

        <Card title={<><SecurityScanOutlined /> 安全设置</>} style={{ marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            <div>
              <Title level={5}>钱包安全</Title>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>自动断开连接</Text>
                  <Switch defaultChecked />
                </div>
                <div>
                  <Text>超时时间:</Text>
                  <Select defaultValue="30" style={{ width: '100%', marginTop: 8 }}>
                    <Option value="15">15分钟</Option>
                    <Option value="30">30分钟</Option>
                    <Option value="60">1小时</Option>
                    <Option value="never">永不超时</Option>
                  </Select>
                </div>
              </Space>
            </div>

            <div>
              <Title level={5}>交易确认</Title>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>大额交易二次确认</Text>
                  <Switch defaultChecked />
                </div>
                <div>
                  <Text>大额阈值 (USD):</Text>
                  <Input placeholder="1000" style={{ marginTop: 8 }} />
                </div>
              </Space>
            </div>
          </div>
        </Card>

        <Card title={<><SettingOutlined /> 其他设置</>}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text>显示测试网络</Text>
              <Switch />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text>启用调试模式</Text>
              <Switch />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text>性能监控</Text>
              <Switch defaultChecked />
            </div>
          </Space>

          <Divider />

          <div style={{ textAlign: 'center' }}>
            <Space>
              <Button onClick={handleResetSettings}>
                重置设置
              </Button>
              <Button type="primary" onClick={handleSaveSettings}>
                保存设置
              </Button>
            </Space>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;