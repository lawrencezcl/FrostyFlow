import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Chain, ChainState } from '@/types';

// Testnet configurations - dynamically load based on environment
const getTestnetChains = (): Chain[] => {
  if (process.env.REACT_APP_ENVIRONMENT === 'testnet') {
    return [
      {
        chainId: 'bifrost',
        chainName: 'Bifrost Testnet',
        rpc: process.env.REACT_APP_BIFROST_TESTNET_WS || 'wss://bifrost-testnet.liebi.com/ws',
        icon: '/icons/bifrost.svg',
        blockExplorer: 'https://bifrost.subscan.io',
        nativeToken: 'BNC',
        decimals: 12,
        supportedAssets: ['DOT', 'KSM', 'ETH', 'GLMR']
      },
      {
        chainId: 'polkadot',
        chainName: 'Westend Testnet',
        rpc: process.env.REACT_APP_POLKADOT_TESTNET_WS || 'wss://westend-rpc.polkadot.io',
        icon: '/icons/polkadot.svg',
        blockExplorer: 'https://westend.subscan.io',
        nativeToken: 'WND',
        decimals: 12,
        supportedAssets: ['WND']
      },
      {
        chainId: 'kusama',
        chainName: 'Kusama Testnet',
        rpc: process.env.REACT_APP_KUSAMA_TESTNET_WS || 'wss://kusama-rpc.polkadot.io',
        icon: '/icons/kusama.svg',
        blockExplorer: 'https://kusama.subscan.io',
        nativeToken: 'KSM',
        decimals: 12,
        supportedAssets: ['KSM']
      }
    ];
  }
  
  // Default/mainnet chains
  return [
    {
      chainId: 'bifrost-passet-hub',
      chainName: 'Bifrost Passet Hub',
      rpc: process.env.REACT_APP_BIFROST_PASSET_HUB_RPC || 'wss://rpc.testnet.bifrost-para.liebi.com/ws',
      icon: '/icons/bifrost.svg',
      blockExplorer: 'https://bifrost.subscan.io',
    },
    {
      chainId: 'moonbase-alpha',
      chainName: 'Moonbase Alpha',
      rpc: process.env.REACT_APP_MOONBASE_ALPHA_RPC || 'wss://moonbase-alpha.public.blastapi.io',
      icon: '/icons/moonbeam.svg',
      blockExplorer: 'https://moonbase.moonscan.io',
    },
  ];
};

const SUPPORTED_CHAINS: Chain[] = getTestnetChains();

const initialState: ChainState = {
  activeChain: null,
  supportedChains: SUPPORTED_CHAINS,
  isLoading: false,
};

const chainSlice = createSlice({
  name: 'chain',
  initialState,
  reducers: {
    setActiveChain: (state, action: PayloadAction<Chain>) => {
      state.activeChain = action.payload;
      // Save to localStorage for persistence
      localStorage.setItem('activeChain', JSON.stringify(action.payload));
    },
    setChainLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    addSupportedChain: (state, action: PayloadAction<Chain>) => {
      const existingChain = state.supportedChains.find(
        (chain) => chain.chainId === action.payload.chainId,
      );
      if (!existingChain) {
        state.supportedChains.push(action.payload);
      }
    },
    initializeChain: (state) => {
      // Load active chain from localStorage
      const savedChain = localStorage.getItem('activeChain');
      if (savedChain) {
        try {
          const parsedChain = JSON.parse(savedChain);
          const validChain = state.supportedChains.find(
            (chain) => chain.chainId === parsedChain.chainId,
          );
          if (validChain) {
            state.activeChain = validChain;
          } else {
            // Default to first supported chain if saved chain is not valid
            state.activeChain = state.supportedChains[0];
          }
        } catch {
          // Default to first supported chain if parsing fails
          state.activeChain = state.supportedChains[0];
        }
      } else {
        // Default to first supported chain
        state.activeChain = state.supportedChains[0];
      }
    },
  },
});

export const {
  setActiveChain,
  setChainLoading,
  addSupportedChain,
  initializeChain,
} = chainSlice.actions;

export default chainSlice.reducer;