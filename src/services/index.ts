// 导入服务实例
import polkadotApiService from './polkadotApi';
import bifrostSdkService from './bifrostSdk';
import coinGeckoService from './coinGecko';
import emailService from './emailService';

// 统一导出所有服务
export { default as polkadotApiService } from './polkadotApi';
export { default as bifrostSdkService } from './bifrostSdk';
export { default as coinGeckoService } from './coinGecko';
export { default as emailService } from './emailService';

// 重新导出服务实例（使用简化的名称）
export const polkadotApi = polkadotApiService;
export const bifrostSdk = bifrostSdkService;
export const coinGecko = coinGeckoService;
export const email = emailService;