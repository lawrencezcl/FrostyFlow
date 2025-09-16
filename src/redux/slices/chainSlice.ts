import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Chain, ChainState } from '@/types';

// Predefined supported chains
const SUPPORTED_CHAINS: Chain[] = [
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