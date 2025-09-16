import React, { useState } from 'react';
import { Button, Modal, Card, Space, Typography, message } from 'antd';
import { WalletOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setWalletConnected, setWalletDisconnected } from '@/redux/slices/walletSlice';
import { WalletType, WalletAccount } from '@/types';

const { Text } = Typography;

export const WalletConnect: React.FC = () => {
  const dispatch = useAppDispatch();
  const wallet = useAppSelector((state: any) => state.wallet);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const wallets = [
    {
      type: 'polkadot' as WalletType,
      name: 'Polkadot.js',
      description: '适配Passet Hub链，推荐使用',
    },
    {
      type: 'metamask' as WalletType,
      name: 'MetaMask',
      description: '适配Moonbase Alpha链',
    },
    {
      type: 'talisman' as WalletType,
      name: 'Talisman',
      description: '兼容Polkadot生态多链',
    },
  ];

  const handleConnect = async (walletType: WalletType) => {
    try {
      const mockAccount: WalletAccount = {
        address: walletType === 'metamask' 
          ? '0x742d35Cc6334C532C3096d5D6f7a5203543a1234'
          : '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        name: 'Test Account',
        source: walletType,
      };

      dispatch(setWalletConnected({
        account: mockAccount,
        walletType,
      }));

      message.success('钱包连接成功');
      setIsModalVisible(false);
    } catch (error) {
      message.error('钱包连接失败');
    }
  };

  const handleDisconnect = () => {
    dispatch(setWalletDisconnected());
    message.info('钱包已断开连接');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (wallet.isConnected && wallet.account) {
    return (
      <Space>
        <Text>{formatAddress(wallet.account.address)}</Text>
        <Button size="small" onClick={handleDisconnect}>
          断开连接
        </Button>
      </Space>
    );
  }

  return (
    <>
      <Button
        type="primary"
        icon={<WalletOutlined />}
        onClick={() => setIsModalVisible(true)}
      >
        连接钱包
      </Button>

      <Modal
        title="选择钱包"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={400}
      >
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">
            请选择兼容的钱包类型进行连接
          </Text>
        </div>
        
        {wallets.map((walletOption) => (
          <Card
            key={walletOption.type}
            hoverable
            onClick={() => handleConnect(walletOption.type)}
            style={{ marginBottom: 16, cursor: 'pointer' }}
          >
            <div>
              <h4>{walletOption.name}</h4>
              <Text type="secondary">{walletOption.description}</Text>
            </div>
          </Card>
        ))}
      </Modal>
    </>
  );
};

export default WalletConnect;