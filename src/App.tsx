import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import { Toaster } from 'react-hot-toast';
import { store } from './redux/store';
import { useAppDispatch, useAppSelector } from './redux/hooks';
import { useTranslation } from 'react-i18next';
import { initializeChain } from './redux/slices/chainSlice';
import { initializeWalletFromSession } from './redux/slices/walletSlice';
import { loadTransactionsFromStorage } from './redux/slices/transactionSlice';
import { loadRedeemsFromStorage } from './redux/slices/redeemSlice';
import { fetchInitialData } from './redux/slices/assetSlice';
import { priceUpdateService } from './services/priceUpdateService';
import { ThemeProvider } from './styles/ThemeProvider';
import './i18n';

// 导入页面组件
import Layout from './components/Layout';
import AssetOverview from './pages/AssetOverview';
import StakingMint from './pages/StakingMint';
import RedemptionPage from './pages/RedemptionPage';
import HelpCenter from './pages/HelpCenter';
import Settings from './pages/Settings';
import AdvancedAnalyticsDashboard from './pages/AdvancedAnalyticsDashboard';
import CrossChainBridge from './pages/CrossChainBridge';
import EnhancedNetworkSupport from './pages/EnhancedNetworkSupport';
import MultiChainAssetMonitoring from './pages/MultiChainAssetMonitoring';
import RealtimeStatusTracking from './pages/RealtimeStatusTracking';
import SLPxOneClickStaking from './pages/SLPxOneClickStaking';
import SmartRecommendationEngine from './pages/SmartRecommendationEngine';

// 应用程序初始化组件
const AppInitializer: React.FC = () => {
  const dispatch = useAppDispatch();
  const { account } = useAppSelector((state) => state.wallet);

  useEffect(() => {
    // 初始化应用程序状态
    dispatch(initializeChain());
    dispatch(initializeWalletFromSession());
    dispatch(loadTransactionsFromStorage());
    dispatch(loadRedeemsFromStorage());

    // 初始化价格更新服务
    priceUpdateService.setStore(store);
    priceUpdateService.start();

    // 组件卸载时清理
    return () => {
      priceUpdateService.stop();
    };
  }, [dispatch]);

  useEffect(() => {
    if (account?.address) {
      dispatch(fetchInitialData());
    }
  }, [account, dispatch]);

  return null;
};

function App() {
  const { i18n } = useTranslation();

  // Determine Ant Design locale based on current language
  const getAntdLocale = () => {
    switch (i18n.language) {
      case 'zh':
        return zhCN;
      case 'en':
      default:
        return enUS;
    }
  };

  return (
    <Provider store={store}>
      <ThemeProvider>
        <ConfigProvider locale={getAntdLocale()}>
          <Router>
            <AppInitializer />
            <Layout>
              <Routes>
                <Route path="/" element={<AssetOverview />} />
                <Route path="/overview" element={<AssetOverview />} />
                <Route path="/staking" element={<StakingMint />} />
                <Route path="/redemption" element={<RedemptionPage />} />
                <Route path="/help" element={<HelpCenter />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/analytics" element={<AdvancedAnalyticsDashboard />} />
                <Route path="/bridge" element={<CrossChainBridge />} />
                <Route path="/network" element={<EnhancedNetworkSupport />} />
                <Route path="/monitoring" element={<MultiChainAssetMonitoring />} />
                <Route path="/status" element={<RealtimeStatusTracking />} />
                <Route path="/slpx" element={<SLPxOneClickStaking />} />
                <Route path="/recommendations" element={<SmartRecommendationEngine />} />
              </Routes>
            </Layout>
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