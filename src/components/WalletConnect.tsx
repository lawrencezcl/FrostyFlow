import React, { useState } from 'react';
import { Button, Modal } from 'antd';
import { WalletOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { setWalletConnected, setWalletDisconnected } from '../redux/slices/walletSlice';
import { WalletType, WalletAccount } from '../types';

const WalletConnect: React.FC = () => {
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

      setIsModalVisible(false);
    } catch (error) {
      console.error('钱包连接失败:', error);
    }
  };

  const handleDisconnect = () => {
    dispatch(setWalletDisconnected());
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (wallet.isConnected && wallet.account) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <WalletOutlined />
        <span>{formatAddress(wallet.account.address)}</span>
        <Button 
          size="small" 
          onClick={handleDisconnect}
          style={{ marginLeft: '8px' }}
        >
          断开
        </Button>
      </div>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {wallets.map((walletOption) => (
            <Button
              key={walletOption.type}
              type="default"
              size="large"
              onClick={() => handleConnect(walletOption.type)}
              style={{ 
                textAlign: 'left', 
                height: 'auto', 
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start'
              }}
            >
              <div style={{ fontWeight: 'bold' }}>{walletOption.name}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {walletOption.description}
              </div>
            </Button>
          ))}
        </div>
      </Modal>
    </>
  );
};

export default WalletConnect;