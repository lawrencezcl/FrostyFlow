// Import service instances
import polkadotApiService from './polkadotApi';
import bifrostSdkService from './bifrostSdk';
import { bifrostSdkSimpleService } from './bifrostSdkSimple';
import coinGeckoService from './coinGecko';
import emailService from './emailService';
import crossChainBridgeService from './crossChainBridgeService';
import snowbridgeService from './snowbridgeService';
import hyperbridgeService from './hyperbridgeService';
import slpxService from './slpxService';
import multiChainMonitoringService from './multiChainMonitoringService';
import realtimeStatusTrackingService from './realtimeStatusTrackingService';
import advancedAnalyticsService from './advancedAnalyticsService';
import smartRecommendationService from './smartRecommendationService';
import enhancedNetworkService from './enhancedNetworkService';

// Export all services
export { default as polkadotApiService } from './polkadotApi';
export { default as bifrostSdkService } from './bifrostSdk';
export { default as coinGeckoService } from './coinGecko';
export { default as emailService } from './emailService';
export { default as crossChainBridgeService } from './crossChainBridgeService';
export { default as snowbridgeService } from './snowbridgeService';
export { default as hyperbridgeService } from './hyperbridgeService';
export { default as multiChainMonitoringService } from './multiChainMonitoringService';
export { default as realtimeStatusTrackingService } from './realtimeStatusTrackingService';
export { default as advancedAnalyticsService } from './advancedAnalyticsService';
export { default as slpxService } from './slpxService';
export { default as smartRecommendationService } from './smartRecommendationService';
export { default as enhancedNetworkService } from './enhancedNetworkService';

// 重新导出服务实例（使用简化的名称）
export const polkadotApi = polkadotApiService;
export const bifrostSdk = process.env.REACT_APP_ENVIRONMENT === 'testnet' ? bifrostSdkSimpleService : bifrostSdkService;
export const coinGecko = coinGeckoService;
export const email = emailService;
export const crossChainBridge = crossChainBridgeService;
export const snowbridge = snowbridgeService;
export const hyperbridge = hyperbridgeService;
export const slpx = slpxService;
export const multiChainMonitoring = multiChainMonitoringService;
export const realtimeStatusTracking = realtimeStatusTrackingService;
export const advancedAnalytics = advancedAnalyticsService;
export const smartRecommendation = smartRecommendationService;
export const enhancedNetwork = enhancedNetworkService;