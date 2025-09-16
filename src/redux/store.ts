import { configureStore } from '@reduxjs/toolkit';
import chainSlice from './slices/chainSlice';
import assetSlice from './slices/assetSlice';
import transactionSlice from './slices/transactionSlice';
import redeemSlice from './slices/redeemSlice';
import walletSlice from './slices/walletSlice';

export const store = configureStore({
  reducer: {
    chain: chainSlice,
    asset: assetSlice,
    transaction: transactionSlice,
    redeem: redeemSlice,
    wallet: walletSlice,
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