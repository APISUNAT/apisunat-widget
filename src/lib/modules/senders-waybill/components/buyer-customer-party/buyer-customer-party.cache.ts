import { createLocalStorageCache } from '$lib/shared/utils/local-storage-cache.util';

export type BuyerCacheData = {
  name: string;
};

const buyerCache = createLocalStorageCache<BuyerCacheData>('sunat-buyer-cache');

export function getBuyerCache(numberDocument: string): BuyerCacheData | null {
  return buyerCache.get(numberDocument);
}

export function setBuyerCache(numberDocument: string, data: BuyerCacheData): void {
  buyerCache.set(numberDocument, data);
}
