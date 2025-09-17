import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Globe, Plus, ExternalLink, Check, AlertCircle } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { setActiveChain, addSupportedChain } from '../redux/slices/chainSlice';
import { polkadotApiService } from '../services/polkadotApi';
import { Chain } from '../types';
import { Button, Text, Flex, Card } from '../styles/components';
import toast from 'react-hot-toast';

// Styled Components
const ChainSelectorContainer = styled.div`
  position: relative;
`;

const ChainButton = styled(Button)<{ isActive?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 200px;
  justify-content: space-between;
  
  ${({ isActive, theme }) => isActive && `
    background: ${theme.colors.success}20;
    color: ${theme.colors.success};
    border-color: ${theme.colors.success};
    
    &:hover {
      background: ${theme.colors.success}30;
      border-color: ${theme.colors.success};
    }
  `}
`;

const ChainDropdown = styled(motion.div)`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  min-width: 320px;
  max-width: 400px;
  max-height: 500px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.large};
  box-shadow: ${({ theme }) => theme.shadows.large};
  z-index: 1000;
  overflow: hidden;
`;

const ChainHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
`;

const ChainList = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

const ChainItem = styled(motion.div)<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  cursor: pointer;
  transition: all ${({ theme }) => theme.animations.fast} ease;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  
  ${({ active, theme }) => active && `
    background: ${theme.colors.primary}10;
    color: ${theme.colors.primary};
  `}
  
  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const ChainIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.radius.medium};
  background: ${({ theme }) => theme.colors.gradient.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.inverse};
  font-weight: 600;
  font-size: 12px;
`;

const ChainInfo = styled.div`
  flex: 1;
`;

const ChainStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const AddChainSection = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
`;

const AddChainButton = styled(Button)`
  width: 100%;
  justify-content: center;
  gap: 8px;
`;

const AddChainForm = styled(motion.div)`
  padding: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

interface ChainSelectorProps {
  variant?: 'button' | 'compact';
}

const ChainSelector: React.FC<ChainSelectorProps> = ({ variant = 'button' }) => {
  const dispatch = useAppDispatch();
  const { activeChain, supportedChains, isLoading } = useAppSelector(state => state.chain);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showAddChainForm, setShowAddChainForm] = useState(false);
  const [chainStatus, setChainStatus] = useState<Record<string, 'connected' | 'error' | 'connecting'>>({});

  // Check chain connectivity
  useEffect(() => {
    const checkChainStatus = async () => {
      const status: Record<string, 'connected' | 'error' | 'connecting'> = {};
      
      for (const chain of supportedChains) {
        try {
          const result = await polkadotApiService.connect(chain.rpc);
          status[chain.chainId] = result.success ? 'connected' : 'error';
          await polkadotApiService.disconnect();
        } catch {
          status[chain.chainId] = 'error';
        }
      }
      
      setChainStatus(status);
    };

    if (supportedChains.length > 0) {
      checkChainStatus();
    }
  }, [supportedChains]);

  const handleChainSelect = async (chain: Chain) => {
    try {
      setChainStatus(prev => ({ ...prev, [chain.chainId]: 'connecting' }));
      
      // Connect to the selected chain
      const result = await polkadotApiService.connect(chain.rpc);
      
      if (result.success) {
        dispatch(setActiveChain(chain));
        toast.success(`已切换到 ${chain.chainName}`, {
          icon: '🔗',
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('Chain switch failed:', error);
      toast.error(`切换到 ${chain.chainName} 失败: ${error.message}`, {
        icon: '⚠️',
      });
      setChainStatus(prev => ({ ...prev, [chain.chainId]: 'error' }));
    } finally {
      setIsDropdownOpen(false);
    }
  };

  const handleAddCustomChain = async (chainData: {
    chainId: string;
    chainName: string;
    rpc: string;
    nativeToken: string;
    decimals: number;
  }) => {
    try {
      // Test the RPC connection
      const result = await polkadotApiService.connect(chainData.rpc);
      
      if (!result.success) {
        throw new Error('RPC 节点连接失败');
      }

      const newChain: Chain = {
        chainId: chainData.chainId,
        chainName: chainData.chainName,
        rpc: chainData.rpc,
        icon: '/icons/custom.svg',
        blockExplorer: '',
        nativeToken: chainData.nativeToken,
        decimals: chainData.decimals,
        supportedAssets: [chainData.nativeToken],
      };

      dispatch(addSupportedChain(newChain));
      setShowAddChainForm(false);
      toast.success('成功添加自定义链', {
        icon: '✅',
      });
      
      await polkadotApiService.disconnect();
    } catch (error: any) {
      toast.error(`添加链失败: ${error.message}`, {
        icon: '⚠️',
      });
    }
  };

  const getStatusIcon = (chainId: string) => {
    const status = chainStatus[chainId];
    switch (status) {
      case 'connected':
        return <Check size={16} />;
      case 'error':
        return <AlertCircle size={16} />;
      case 'connecting':
        return <div style={{ width: 14, height: 14, border: '2px solid currentColor', borderTop: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />;
      default:
        return null;
    }
  };

  const getStatusColor = (chainId: string): "primary" | "secondary" | "tertiary" | "inverse" => {
    const status = chainStatus[chainId];
    switch (status) {
      case 'connected':
        return 'secondary';
      case 'error':
        return 'tertiary';
      case 'connecting':
        return 'primary';
      default:
        return 'secondary';
    }
  };

  if (variant === 'compact') {
    return (
      <ChainSelectorContainer>
        <ChainButton
          variant="outline"
          size="small"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          isActive={!!activeChain}
        >
          <Globe size={16} />
          <Text size="sm" weight="medium">
            {activeChain?.chainName || '选择链'}
          </Text>
          <ChevronDown size={16} />
        </ChainButton>

        <AnimatePresence>
          {isDropdownOpen && (
            <>
              <ChainDropdown
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <ChainHeader>
                  <Text weight="semibold">选择链</Text>
                </ChainHeader>
                
                <ChainList>
                  {supportedChains.map((chain) => (
                    <ChainItem
                      key={chain.chainId}
                      active={activeChain?.chainId === chain.chainId}
                      onClick={() => handleChainSelect(chain)}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: supportedChains.indexOf(chain) * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <ChainIcon>
                        {chain.chainName.charAt(0)}
                      </ChainIcon>
                      <ChainInfo>
                        <Text weight="medium">{chain.chainName}</Text>
                        <Text size="xs" color="secondary">
                          {chain.nativeToken} • {chain.supportedAssets?.join(', ') || 'N/A'}
                        </Text>
                      </ChainInfo>
                      <ChainStatus>
                        {getStatusIcon(chain.chainId)}
                      </ChainStatus>
                    </ChainItem>
                  ))}
                </ChainList>

                <AddChainSection>
                  <AddChainButton
                    variant="outline"
                    onClick={() => setShowAddChainForm(true)}
                  >
                    <Plus size={16} />
                    添加自定义链
                  </AddChainButton>
                </AddChainSection>
              </ChainDropdown>
            </>
          )}
        </AnimatePresence>
      </ChainSelectorContainer>
    );
  }

  return (
    <ChainSelectorContainer>
      <ChainButton
        variant="outline"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        isActive={!!activeChain}
      >
        <Globe size={18} />
        <Flex direction="column" align="flex-start">
          <Text size="sm" weight="medium">
            {activeChain?.chainName || '选择链'}
          </Text>
          <Text size="xs" color="secondary">
            {activeChain?.nativeToken || '未连接'}
          </Text>
        </Flex>
        <ChevronDown size={18} />
      </ChainButton>

      <AnimatePresence>
        {isDropdownOpen && (
          <>
            <ChainDropdown
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <ChainHeader>
                <Text weight="semibold">选择链</Text>
                <Text size="sm" color="secondary">
                  点击切换到不同的区块链网络
                </Text>
              </ChainHeader>
              
              <ChainList>
                {supportedChains.map((chain) => (
                  <ChainItem
                    key={chain.chainId}
                    active={activeChain?.chainId === chain.chainId}
                    onClick={() => handleChainSelect(chain)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: supportedChains.indexOf(chain) * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <ChainIcon>
                      {chain.chainName.charAt(0)}
                    </ChainIcon>
                    <ChainInfo>
                      <Text weight="medium">{chain.chainName}</Text>
                      <Text size="xs" color="secondary">
                        {chain.nativeToken} • 支持: {chain.supportedAssets?.join(', ') || 'N/A'}
                      </Text>
                      <Text size="xs" color={getStatusColor(chain.chainId)}>
                        {chainStatus[chain.chainId] === 'connected' && '已连接'}
                        {chainStatus[chain.chainId] === 'error' && '连接失败'}
                        {chainStatus[chain.chainId] === 'connecting' && '连接中...'}
                        {!chainStatus[chain.chainId] && '未检测'}
                      </Text>
                    </ChainInfo>
                    <ChainStatus>
                      {getStatusIcon(chain.chainId)}
                    </ChainStatus>
                  </ChainItem>
                ))}
              </ChainList>

              <AddChainSection>
                <AddChainButton
                  variant="outline"
                  onClick={() => setShowAddChainForm(true)}
                >
                  <Plus size={16} />
                  添加自定义链
                </AddChainButton>
              </AddChainSection>

              {showAddChainForm && (
                <AddChainForm
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <CustomChainForm onSubmit={handleAddCustomChain} />
                </AddChainForm>
              )}
            </ChainDropdown>
          </>
        )}
      </AnimatePresence>
    </ChainSelectorContainer>
  );
};

// Custom Chain Form Component
interface CustomChainFormProps {
  onSubmit: (chainData: {
    chainId: string;
    chainName: string;
    rpc: string;
    nativeToken: string;
    decimals: number;
  }) => void;
}

const CustomChainForm: React.FC<CustomChainFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    chainId: '',
    chainName: '',
    rpc: '',
    nativeToken: '',
    decimals: 12,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.chainId && formData.chainName && formData.rpc && formData.nativeToken) {
      onSubmit(formData);
      setFormData({
        chainId: '',
        chainName: '',
        rpc: '',
        nativeToken: '',
        decimals: 12,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap="12px">
        <Text size="sm" weight="medium">添加自定义链</Text>
        
        <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>
            <Text size="xs" color="secondary">链名称</Text>
          </label>
          <input
            type="text"
            value={formData.chainName}
            onChange={(e) => setFormData(prev => ({ ...prev, chainName: e.target.value }))}
            placeholder="例如: My Custom Chain"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              background: 'var(--background)',
              color: 'var(--text-primary)',
            }}
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>
            <Text size="xs" color="secondary">链ID</Text>
          </label>
          <input
            type="text"
            value={formData.chainId}
            onChange={(e) => setFormData(prev => ({ ...prev, chainId: e.target.value }))}
            placeholder="例如: my-custom-chain"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              background: 'var(--background)',
              color: 'var(--text-primary)',
            }}
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>
            <Text size="xs" color="secondary">RPC 节点</Text>
          </label>
          <input
            type="url"
            value={formData.rpc}
            onChange={(e) => setFormData(prev => ({ ...prev, rpc: e.target.value }))}
            placeholder="wss://..."
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              background: 'var(--background)',
              color: 'var(--text-primary)',
            }}
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>
            <Text size="xs" color="secondary">原生代币</Text>
          </label>
          <input
            type="text"
            value={formData.nativeToken}
            onChange={(e) => setFormData(prev => ({ ...prev, nativeToken: e.target.value }))}
            placeholder="例如: TOKEN"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              background: 'var(--background)',
              color: 'var(--text-primary)',
            }}
            required
          />
        </div>

        <Flex gap="8px">
          <Button type="button" variant="outline" onClick={() => onSubmit(formData)}>
            取消
          </Button>
          <Button type="submit" disabled={!formData.chainName || !formData.rpc}>
            添加链
          </Button>
        </Flex>
      </Flex>
    </form>
  );
};

export default ChainSelector;