import { polkadotApiService } from './polkadotApi';
import { bifrostSdkService } from './bifrostSdk';
import { Asset } from '../types';
import { coinGeckoService } from './coinGecko';

class BifrostService {
  async getBalances(address: string, chainId: string): Promise<Asset[]> {
    try {
      const balanceResponse = await polkadotApiService.getAccountBalance(address);
      if (!balanceResponse.success) {
        throw new Error('Failed to fetch balance');
      }

      const supportedAssetsResponse = await bifrostSdkService.getSupportedAssets(chainId);
      if (!supportedAssetsResponse.success) {
        throw new Error('Failed to fetch supported assets');
      }

      const assets: Asset[] = [];
      for (const assetId of supportedAssetsResponse.data!) {
        const apyResponse = await bifrostSdkService.getAPY(chainId, `v${assetId}`);
        const priceResponse = await coinGeckoService.getMultipleAssetUsdPrices([coinGeckoService.getAssetCoinGeckoId(assetId)]);

        assets.push({
          id: `${assetId.toLowerCase()}_1`,
          assetId: assetId,
          baseAssetId: assetId,
          symbol: assetId,
          name: assetId,
          balance: balanceResponse.data.free.toString(),
          price: priceResponse.success ? priceResponse.data![coinGeckoService.getAssetCoinGeckoId(assetId)].price : 0,
          usdValue: balanceResponse.data.free * (priceResponse.success ? priceResponse.data![coinGeckoService.getAssetCoinGeckoId(assetId)].price : 0),
          chain: chainId,
          apy: apyResponse.success ? apyResponse.data!.apy : 0,
          rate: 1,
          minMintAmount: 1,
        });
      }

      return assets;
    } catch (error) {
      console.error('Error in getBalances:', error);
      return [];
    }
  }
  async stake(address: string, assetId: string, amount: number) {
    const tx = await bifrostSdkService.createMintTransaction('bifrost', assetId, amount, address);
    return await polkadotApiService.signAndSendTx(tx.data, address, () => {});
  }

  async redeem(address: string, assetId: string, amount: number) {
    const tx = await bifrostSdkService.createRedeemTransaction('bifrost', assetId, amount, 'standard', address);
    return await polkadotApiService.signAndSendTx(tx.data, address, () => {});
  }
}

export const bifrostService = new BifrostService();