import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { store } from './redux/store';
import { useAppDispatch } from './redux/hooks';
import { initializeChain } from './redux/slices/chainSlice';
import { initializeWalletFromSession } from './redux/slices/walletSlice';
import { loadTransactionsFromStorage } from './redux/slices/transactionSlice';
import { loadRedeemsFromStorage } from './redux/slices/redeemSlice';

// 导入页面组件（稍后创建）
import Layout from './components/Layout';
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
  }, [dispatch]);

  return null;
};

function App() {
  return (
    <Provider store={store}>
      <ConfigProvider locale={zhCN}>
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
            </Routes>
          </Layout>
        </Router>
      </ConfigProvider>
    </Provider>
  );
}

export default App;