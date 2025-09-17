import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { Toaster } from 'react-hot-toast';
import { store } from './redux/store';
import { useAppDispatch } from './redux/hooks';
import { initializeChain } from './redux/slices/chainSlice';
import { initializeWalletFromSession } from './redux/slices/walletSlice';
import { loadTransactionsFromStorage } from './redux/slices/transactionSlice';
import { loadRedeemsFromStorage } from './redux/slices/redeemSlice';
import { initializeMockAssets } from './redux/slices/assetSlice';
import { priceUpdateService } from './services/priceUpdateService';
import { ThemeProvider } from './styles/ThemeProvider';

// 导入页面组件
import CleanModernLayout from './components/CleanModernLayout';
import AssetOverview from './pages/AssetOverview';
import StakingMint from './pages/StakingMint';
import RedemptionPage from './pages/RedemptionPage';
import HelpCenter from './pages/HelpCenter';
import Settings from './pages/Settings';

// 应用程序初始化组件
const AppInitializer: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // 初始化应用程序状态
    dispatch(initializeChain());
    dispatch(initializeWalletFromSession());
    dispatch(loadTransactionsFromStorage());
    dispatch(loadRedeemsFromStorage());
    dispatch(initializeMockAssets());
    
    // 启动价格更新服务
    priceUpdateService.start();
    
    // 组件卸载时清理
    return () => {
      priceUpdateService.stop();
    };
  }, [dispatch]);

  return null;
};

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <ConfigProvider locale={zhCN}>
          <Router>
            <AppInitializer />
            <CleanModernLayout>
              <Routes>
                <Route path="/" element={<AssetOverview />} />
                <Route path="/overview" element={<AssetOverview />} />
                <Route path="/staking" element={<StakingMint />} />
                <Route path="/redemption" element={<RedemptionPage />} />
                <Route path="/help" element={<HelpCenter />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </CleanModernLayout>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--surface)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                },
              }}
            />
          </Router>
        </ConfigProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;