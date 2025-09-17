import 'styled-components';
import { Theme } from './theme';

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}

// Type declarations for Web3 wallet providers
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: Function) => void;
      removeListener: (event: string, callback: Function) => void;
    };
    talisman?: {
      ethereum?: {
        request: (args: { method: string; params?: any[] }) => Promise<any>;
      };
    };
  }
}