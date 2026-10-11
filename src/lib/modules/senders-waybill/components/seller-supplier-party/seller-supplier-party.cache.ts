import { createLocalStorageCache } from '$lib/shared/utils/local-storage-cache.util';

export type SellerCacheData = {
  name: string;
};

const sellerCache = createLocalStorageCache<SellerCacheData>('sunat-seller-cache');

export function getSellerCache(numberDocument: string): SellerCacheData | null {
  return sellerCache.get(numberDocument);
}

export function setSellerCache(numberDocument: string, data: SellerCacheData): void {
  sellerCache.set(numberDocument, data);
}
