// Chain related types
export interface Chain {
  chainId: string;
  chainName: string;
  name?: string;  // 添加name属性以兼容组件
  rpc: string;
  icon: string;
  blockExplorer: string;
  nativeToken?: string;  // 添加原生代币名称
  decimals?: number;     // 添加decimals属性
  supportedAssets?: string[]; // 添加支持的资产列表
}

export interface ChainState {
  activeChain: Chain | null;
  supportedChains: Chain[];
  isLoading: boolean;
}

// Asset related types
export interface Asset {
  id: string;             // 添加id属性
  assetId: string;        // Asset ID (e.g., "vDOT")
  baseAssetId: string;    // Base asset ID (e.g., "DOT")
  symbol: string;         // 添加symbol属性
  name: string;           // 添加name属性
  balance: string;        // Balance (改为string类型)
  price: number;          // 添加price属性
  usdValue: number;       // USD value
  chain: string;          // 添加chain属性
  apy: number;            // Annual percentage yield
  rate: number;           // Exchange rate (e.g., 1 DOT = 1.002 vDOT)
  minMintAmount: number;  // Minimum staking amount
  change24h?: number;    // 24小时价格变化百分比
}

export interface AssetState {
  assets: Asset[];  // 改为数组类型
  totalValue: number;     // 添加totalValue属性
  totalEarnings: number;  // 添加totalEarnings属性
  totalUsdValue: number;  // Total asset USD value
  totalProfit: number;    // Total profit in USD
  isLoading: boolean;     // Asset data loading state
}

// Transaction related types
export type TransactionType = 'mint' | 'redeem';
export type TransactionStatus = 'pending' | 'success' | 'failed';

export interface Transaction {
  txHash: string;
  type: TransactionType;
  status: TransactionStatus;
  chainId: string;
  assetId: string;
  amount: number;
  timestamp: number;
}

export interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
}

// Redemption related types
export type RedeemType = 'instant' | 'standard';
export type RedeemStatus = 'unlocking' | 'completed' | 'failed';

export interface Redeem {
  redeemId: string;
  type: RedeemType;
  assetId: string;
  amount: number;
  status: RedeemStatus;
  expireTime: number;
  createdTime: number;
  chainId: string;
}

export interface RedeemState {
  redeems: Redeem[];
  isLoading: boolean;
}

// Wallet related types
export type WalletType = 'polkadot' | 'metamask' | 'talisman';

export interface WalletAccount {
  address: string;
  name?: string;
  source: string;
}

export interface WalletState {
  isConnected: boolean;
  account: WalletAccount | null;
  walletType: WalletType | null;
  balance?: string;  // 添加balance属性
  isLoading: boolean;
}

// Gas mode types
export type GasMode = 'fast' | 'normal' | 'slow';

export interface GasEstimate {
  fast: number;
  normal: number;
  slow: number;
}

// Mint form types
export interface MintParams {
  chainId: string;
  assetId: string;
  amount: number;
  gasMode: GasMode;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface EstimateMintResponse {
  vAssetAmount: number;
  rate: number;
}

export interface ApyResponse {
  apy: number;
  updateTime: number;
}

// User preferences types
export interface NotifySettings {
  stakingSuccess: boolean;
  redeemExpiry: boolean;
  assetReceived: boolean;
  emailEnabled: boolean;
}

export interface UserPreferences {
  defaultChainId: string;
  email: string;
  notifySettings: NotifySettings;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: string;
}

// Component prop types
export interface AssetCardProps {
  chain: Chain;
  assets: Asset[];
  totalProfit: number;
  onViewDetail: (chainId: string) => void;
  isLoading?: boolean;
}

export interface MintFormProps {
  chainId: string;
  onSubmit: (params: MintParams) => Promise<void>;
}

// Hook return types
export interface UseWalletReturn {
  isConnected: boolean;
  account: WalletAccount | null;
  connect: (walletType: WalletType) => Promise<void>;
  disconnect: () => void;
  isLoading: boolean;
  error: string | null;
  walletType: WalletType | null;
  checkConnection: () => Promise<boolean>;
  getSupportedWallets: () => { type: WalletType; name: string; available: boolean; downloadUrl: string }[];
  clearError: () => void;
}

export interface UseAssetReturn {
  assets: Record<string, Asset>;
  totalValue: number;
  totalProfit: number;
  refreshAssets: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

// Environment configuration types
export interface EnvironmentConfig {
  REACT_APP_BIFROST_PASSET_HUB_RPC: string;
  REACT_APP_MOONBASE_ALPHA_RPC: string;
  REACT_APP_COINGECKO_API_URL: string;
  REACT_APP_SENDGRID_API_KEY: string;
  REACT_APP_SENTRY_DSN: string;
}