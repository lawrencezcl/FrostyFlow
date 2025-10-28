import { configureStore } from '@reduxjs/toolkit';
import chainSlice from './slices/chainSlice';
import assetSlice from './slices/assetSlice';
import transactionSlice from './slices/transactionSlice';
import redeemSlice from './slices/redeemSlice';
import walletSlice from './slices/walletSlice';
import crossChainSlice from './slices/crossChainSlice';
import slpxSlice from './slices/slpxSlice';
import monitoringSlice from './slices/monitoringSlice';

export const store = configureStore({
  reducer: {
    chain: chainSlice,
    asset: assetSlice,
    transaction: transactionSlice,
    redeem: redeemSlice,
    wallet: walletSlice,
    crossChain: crossChainSlice,
    slpx: slpxSlice,
    monitoring: monitoringSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;