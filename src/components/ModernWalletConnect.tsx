import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, X, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { setWalletConnected, setWalletDisconnected } from '../redux/slices/walletSlice';
import { polkadotApiService } from '../services/polkadotApi';
import { WalletType, WalletAccount } from '../types';
import { Button, Text, Flex } from '../styles/components';

// Styled Components
const WalletButton = styled(Button)<{ connected: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  position: relative;
  overflow: hidden;
  
  ${({ connected, theme }) => connected && `
    background: ${theme.colors.success}20;
    color: ${theme.colors.success};
    border-color: ${theme.colors.success};
    
    &:hover {
      background: ${theme.colors.success}30;
      border-color: ${theme.colors.success};
    }
  `}
`;

const Modal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radius.large};
  padding: ${({ theme }) => theme.spacing.xl};
  width: 90%;
  max-width: 400px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.large};
  position: relative;
`;

const CloseButton = styled(Button)`
  position: absolute;
  top: ${({ theme }) => theme.spacing.md};
  right: ${({ theme }) => theme.spacing.md};
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 50%;
`;

const WalletOption = styled(motion.div)<{ disabled?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.medium};
  background: ${({ theme, disabled }) => disabled ? theme.colors.surfaceHover : theme.colors.background};
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  transition: all ${({ theme }) => theme.animations.fast} ease;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  opacity: ${({ disabled }) => disabled ? 0.6 : 1};
  
  &:hover {
    border-color: ${({ theme, disabled }) => disabled ? theme.colors.border : theme.colors.primary};
    background: ${({ theme, disabled }) => disabled ? theme.colors.surfaceHover : theme.colors.surfaceHover};
    transform: ${({ disabled }) => disabled ? 'none' : 'translateY(-2px)'};
    box-shadow: ${({ theme, disabled }) => disabled ? 'none' : theme.shadows.medium};
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const WalletIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.radius.medium};
  background: ${({ theme }) => theme.colors.gradient.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.inverse};
  font-weight: 600;
  font-size: 18px;
`;

const WalletInfo = styled.div`
  flex: 1;
`;

const ConnectedWallet = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.success}20;
  border: 1px solid ${({ theme }) => theme.colors.success};
  border-radius: ${({ theme }) => theme.radius.medium};
  position: relative;
  overflow: hidden;
`;

const StatusIndicator = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.success};
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

interface WalletOptionData {
  type: WalletType;
  name: string;
  description: string;
  icon: string;
  installUrl?: string;
  supportedChains: string[];
  isInstalled: boolean;
}

interface WalletDetection {
  polkadot: boolean;
  metamask: boolean;
  talisman: boolean;
}

export const ModernWalletConnect: React.FC = () => {
  const dispatch = useAppDispatch();
  const wallet = useAppSelector((state: any) => state.wallet);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [walletDetection, setWalletDetection] = useState<WalletDetection>({
    polkadot: false,
    metamask: false,
    talisman: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Detect available wallets on mount
  useEffect(() => {
    detectWallets();
  }, []);

  const detectWallets = async () => {
    try {
      // Detect Polkadot.js extension
      const polkadotResult = await polkadotApiService.enableExtension();
      const hasPolkadot = polkadotResult.success;

      // Detect MetaMask
      const hasMetaMask = typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;

      // Detect Talisman
      const hasTalisman = typeof window.talisman !== 'undefined';

      setWalletDetection({
        polkadot: !!hasPolkadot,
        metamask: !!hasMetaMask,
        talisman: !!hasTalisman,
      });
    } catch (error) {
      console.error('Wallet detection failed:', error);
    }
  };

  const wallets: WalletOptionData[] = [
    {
      type: 'polkadot' as WalletType,
      name: 'Polkadot.js',
      description: '适配Passet Hub链，推荐使用',
      icon: 'P',
      installUrl: 'https://polkadot.js.org/extension/',
      supportedChains: ['Bifrost Passet Hub', 'Westend', 'Kusama'],
      isInstalled: walletDetection.polkadot,
    },
    {
      type: 'metamask' as WalletType,
      name: 'MetaMask',
      description: '适配Moonbase Alpha链',
      icon: 'M',
      installUrl: 'https://metamask.io/download/',
      supportedChains: ['Moonbase Alpha', 'Ethereum'],
      isInstalled: walletDetection.metamask,
    },
    {
      type: 'talisman' as WalletType,
      name: 'Talisman',
      description: '兼容Polkadot生态多链',
      icon: 'T',
      installUrl: 'https://talisman.xyz/',
      supportedChains: ['Bifrost', 'Polkadot', 'Kusama'],
      isInstalled: walletDetection.talisman,
    },
  ];

  const handleConnect = async (walletType: WalletType) => {
    setIsLoading(true);
    
    try {
      let account: WalletAccount | null = null;

      switch (walletType) {
        case 'polkadot':
          // Enable Polkadot extension and get accounts
          const enableResult = await polkadotApiService.enableExtension();
          if (!enableResult.success) {
            throw new Error(enableResult.error || 'Failed to enable Polkadot extension');
          }

          const accountsResult = await polkadotApiService.getAccounts();
          if (!accountsResult.success) {
            throw new Error(accountsResult.error || 'Failed to get accounts');
          }

          // Use first account (in real implementation, should show account selector)
          if (!accountsResult.data || accountsResult.data.length === 0) {
            throw new Error('No accounts found in wallet');
          }
          const selectedAccount = accountsResult.data[0];
          account = {
            address: selectedAccount.address,
            name: selectedAccount.meta.name || 'Polkadot Account',
            source: 'polkadot',
          };
          break;

        case 'metamask':
          // MetaMask connection logic
          if (typeof window.ethereum !== 'undefined') {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            account = {
              address: accounts[0],
              name: 'MetaMask Account',
              source: 'metamask',
            };
          } else {
            throw new Error('MetaMask not installed');
          }
          break;

        case 'talisman':
          // Talisman connection logic
          if (typeof window.talisman !== 'undefined' && window.talisman.ethereum) {
            // Talisman uses similar API to Polkadot.js
            const accounts = await window.talisman.ethereum.request({ method: 'eth_requestAccounts' });
            if (!accounts || accounts.length === 0) {
              throw new Error('No accounts found in Talisman wallet');
            }
            account = {
              address: accounts[0],
              name: 'Talisman Account',
              source: 'talisman',
            };
          } else {
            throw new Error('Talisman not installed');
          }
          break;

        default:
          throw new Error('Unsupported wallet type');
      }

      if (account) {
        dispatch(setWalletConnected({
          account,
          walletType,
        }));

        toast.success('钱包连接成功', {
          icon: '👏',
          style: {
            background: 'var(--success-bg)',
            color: 'var(--success-text)',
          }
        });
        setIsModalVisible(false);
      }
    } catch (error: any) {
      console.error('Wallet connection failed:', error);
      
      let errorMessage = '钱包连接失败';
      if (error.message?.includes('not installed')) {
        errorMessage = '钱包未安装，请先安装钱包扩展';
      } else if (error.message?.includes('accounts')) {
        errorMessage = '未找到账户，请在钱包中创建或导入账户';
      } else if (error.message?.includes('enable')) {
        errorMessage = '请启用钱包扩展权限';
      }
      
      toast.error(errorMessage, {
        icon: '⚠️',
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    dispatch(setWalletDisconnected());
    toast.success('钱包已断开连接', {
      icon: '👋',
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (wallet.isConnected && wallet.account) {
    return (
      <ConnectedWallet
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <StatusIndicator />
        <Wallet size={16} />
        <Text size="sm" weight="medium">
          {formatAddress(wallet.account.address)}
        </Text>
        <Button
          variant="ghost"
          size="small"
          onClick={handleDisconnect}
          style={{ marginLeft: 'auto' }}
        >
          <X size={14} />
        </Button>
      </ConnectedWallet>
    );
  }

  return (
    <>
      <WalletButton
        connected={wallet.isConnected}
        onClick={() => setIsModalVisible(true)}
        disabled={isLoading}
      >
        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: 14, height: 14, border: '2px solid currentColor', borderTop: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            连接中...
          </div>
        ) : (
          <>
            <Wallet size={18} />
            连接钱包
          </>
        )}
      </WalletButton>

      <AnimatePresence>
        {isModalVisible && (
          <Modal
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalVisible(false)}
          >
            <ModalContent
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 500 }}
              onClick={(e) => e.stopPropagation()}
            >
              <CloseButton
                variant="ghost"
                onClick={() => setIsModalVisible(false)}
              >
                <X size={16} />
              </CloseButton>
              
              <Flex direction="column" gap="24px">
                <div>
                  <Text size="lg" weight="semibold">
                    选择钱包
                  </Text>
                  <Text size="sm" color="secondary" style={{ marginTop: '8px' }}>
                    请选择兼容的钱包类型进行连接
                  </Text>
                </div>
                
                <div>
                  {wallets.map((walletOption, index) => (
                    <WalletOption
                      key={walletOption.type}
                      disabled={!walletOption.isInstalled || isLoading}
                      onClick={() => walletOption.isInstalled && !isLoading && handleConnect(walletOption.type)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: walletOption.isInstalled && !isLoading ? 1.02 : 1 }}
                      whileTap={{ scale: walletOption.isInstalled && !isLoading ? 0.98 : 1 }}
                    >
                      <WalletIcon>
                        {walletOption.isInstalled ? (
                          <CheckCircle size={24} />
                        ) : (
                          <AlertCircle size={24} />
                        )}
                      </WalletIcon>
                      <WalletInfo>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Text weight="semibold">
                            {walletOption.name}
                          </Text>
                          {!walletOption.isInstalled && (
                            <Text size="xs" color="tertiary" weight="medium">
                              未安装
                            </Text>
                          )}
                        </div>
                        <Text size="sm" color="secondary" style={{ marginTop: '4px' }}>
                          {walletOption.description}
                        </Text>
                        <div style={{ marginTop: '8px' }}>
                          <Text size="xs" color="secondary">
                            支持链: {walletOption.supportedChains.join(', ')}
                          </Text>
                        </div>
                      </WalletInfo>
                      {!walletOption.isInstalled && walletOption.installUrl && (
                        <Button
                          variant="ghost"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(walletOption.installUrl, '_blank');
                          }}
                          style={{ marginLeft: 'auto' }}
                        >
                          <ExternalLink size={14} />
                        </Button>
                      )}
                    </WalletOption>
                  ))}
                </div>
              </Flex>
            </ModalContent>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
};

export default ModernWalletConnect;