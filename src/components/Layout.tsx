import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Coins, 
  ArrowRightLeft, 
  HelpCircle, 
  Settings, 
  Wallet, 
  LogOut,
  Sun,
  Moon,
  Menu as MenuIcon,
  X
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { setWalletDisconnected } from '../redux/slices/walletSlice';
import { useTheme } from '../styles/ThemeProvider';
import { Container, Card, Button, Text, Flex, Badge } from '../styles/components';
import WalletConnect from './WalletConnect';

// Type definitions
interface LayoutProps {
  children: React.ReactNode;
}

interface NavItemType {
  key: string;
  icon: React.ReactNode;
  label: string;
}

// Styled Components
const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
`;

const Sidebar = styled(motion.nav)<{ isOpen: boolean }>`
  width: ${({ isOpen }) => isOpen ? '240px' : '80px'};
  background: ${({ theme }) => theme.colors.surface};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  transition: width ${({ theme }) => theme.animations.normal} ease;
  position: relative;
  z-index: 10;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    position: fixed;
    left: ${({ isOpen }) => isOpen ? '0' : '-240px'};
    width: 240px;
    height: 100vh;
    box-shadow: ${({ theme }) => theme.shadows.large};
  }
`;

const MainContent = styled.main<{ sidebarOpen: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: ${({ sidebarOpen }) => sidebarOpen ? '0' : '0'};
  transition: margin-left ${({ theme }) => theme.animations.normal} ease;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    margin-left: 0;
  }
`;

const Header = styled.header`
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 5;
`;

const Logo = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const LogoText = styled.h1<{ collapsed: boolean }>`
  background: ${({ theme }) => theme.colors.gradient.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  opacity: ${({ collapsed }) => collapsed ? 0 : 1};
  transition: opacity ${({ theme }) => theme.animations.normal} ease;
  white-space: nowrap;
`;

const Navigation = styled.nav`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md};
`;

const NavItem = styled(motion.div)<{ active: boolean; collapsed: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.radius.medium};
  cursor: pointer;
  transition: all ${({ theme }) => theme.animations.fast} ease;
  position: relative;
  overflow: hidden;
  justify-content: ${({ collapsed }) => collapsed ? 'center' : 'flex-start'};

  ${({ active, theme }) => active && `
    background: ${theme.colors.gradient.primary};
    color: ${theme.colors.text.inverse};
    box-shadow: ${theme.shadows.glow};
  `}

  &:hover {
    background: ${({ active, theme }) => 
      active ? theme.colors.gradient.primary : theme.colors.surfaceHover};
    transform: translateX(4px);
  }

  svg {
    min-width: 20px;
    height: 20px;
  }
`;

const NavText = styled.span<{ collapsed: boolean }>`
  font-weight: 500;
  opacity: ${({ collapsed }) => collapsed ? 0 : 1};
  transition: opacity ${({ theme }) => theme.animations.normal} ease;
  white-space: nowrap;
`;

const ContentArea = styled.div`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.lg};
  overflow-y: auto;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

const WalletInfo = styled(Card)`
  padding: ${({ theme }) => theme.spacing.sm};
  margin: ${({ theme }) => theme.spacing.sm};
`;

const ThemeToggle = styled(Button)`
  width: 40px;
  height: 40px;
  padding: 0;
  border-radius: 50%;
`;

const MobileMenuToggle = styled(Button)`
  display: none;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    display: flex;
  }
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 5;
  display: none;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    display: block;
  }
`;

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { theme, mode, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { isConnected, account } = useAppSelector(state => state.wallet);
  const { activeChain } = useAppSelector(state => state.chain);
  
  // 模拟数据
  const balance = isConnected ? '100.5' : '0';
  const chainName = activeChain?.chainName || activeChain?.name || '未连接';
  const nativeToken = 'DOT';

  const menuItems: NavItemType[] = [
    {
      key: '/',
      icon: <Home />,
      label: '资产总览'
    },
    {
      key: '/staking',
      icon: <Coins />,
      label: '质押铸造'
    },
    {
      key: '/redemption',
      icon: <ArrowRightLeft />,
      label: '质押赎回'
    },
    {
      key: '/help',
      icon: <HelpCircle />,
      label: '帮助中心'
    },
    {
      key: '/settings',
      icon: <Settings />,
      label: '系统设置'
    }
  ];

  const handleMenuClick = (key: string) => {
    navigate(key);
    setMobileMenuOpen(false);
  };

  const handleDisconnect = () => {
    dispatch(setWalletDisconnected());
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <LayoutContainer>
      <AnimatePresence>
        {mobileMenuOpen && (
          <Overlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>
      
      <Sidebar 
        isOpen={sidebarOpen || mobileMenuOpen}
        initial={false}
        animate={{ 
          width: sidebarOpen ? 240 : 80,
          left: mobileMenuOpen ? 0 : undefined
        }}
      >
        <Logo>
          <Flex justify="space-between" align="center">
            <LogoText collapsed={!sidebarOpen && !mobileMenuOpen}>
              FrostyFlow
            </LogoText>
            <Button 
              variant="ghost" 
              size="small"
              onClick={toggleSidebar}
              style={{ padding: '4px', minWidth: 'auto' }}
            >
              <MenuIcon size={16} />
            </Button>
          </Flex>
        </Logo>

        <Navigation>
          {menuItems.map((item) => (
            <NavItem
              key={item.key}
              active={location.pathname === item.key}
              collapsed={!sidebarOpen && !mobileMenuOpen}
              onClick={() => handleMenuClick(item.key)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {item.icon}
              <NavText collapsed={!sidebarOpen && !mobileMenuOpen}>
                {item.label}
              </NavText>
            </NavItem>
          ))}
        </Navigation>

        {isConnected && (
          <WalletInfo>
            <Flex direction="column" gap="8px">
              <Flex justify="space-between" align="center">
                <Text size="sm" color="secondary">钱包余额</Text>
                <Badge variant={activeChain ? 'success' : 'error'}>
                  {activeChain ? '已连接' : '未连接'}
                </Badge>
              </Flex>
              {!sidebarOpen && !mobileMenuOpen ? (
                <Wallet size={20} />
              ) : (
                <>
                  <Text size="sm" weight="medium">
                    {account?.address?.slice(0, 6)}...{account?.address?.slice(-4)}
                  </Text>
                  <Text weight="semibold">
                    {balance} {nativeToken}
                  </Text>
                  <Button
                    variant="outline"
                    size="small"
                    fullWidth
                    onClick={handleDisconnect}
                  >
                    <LogOut size={14} />
                    断开连接
                  </Button>
                </>
              )}
            </Flex>
          </WalletInfo>
        )}
      </Sidebar>
      
      <MainContent sidebarOpen={sidebarOpen}>
        <Header>
          <Container>
            <Flex justify="space-between" align="center">
              <Flex align="center" gap="16px">
                <MobileMenuToggle
                  variant="ghost"
                  onClick={toggleMobileMenu}
                >
                  {mobileMenuOpen ? <X /> : <MenuIcon />}
                </MobileMenuToggle>
                
                <Text size="lg" weight="semibold">
                  {chainName}
                </Text>
              </Flex>
              
              <Flex align="center" gap="12px">
                <ThemeToggle
                  variant="ghost"
                  onClick={toggleTheme}
                >
                  {mode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                </ThemeToggle>
                
                {!isConnected && <WalletConnect />}
              </Flex>
            </Flex>
          </Container>
        </Header>
        
        <ContentArea>
          <Container>
            {children}
          </Container>
        </ContentArea>
      </MainContent>
    </LayoutContainer>
  );
};

export default Layout;