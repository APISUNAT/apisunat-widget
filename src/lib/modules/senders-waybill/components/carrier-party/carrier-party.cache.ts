import { createLocalStorageCache } from '$lib/shared/utils/local-storage-cache.util';

export type CarrierCacheData = {
  name: string;
};

const carrierCache = createLocalStorageCache<CarrierCacheData>('sunat-carrier-cache');

export function getCarrierCache(ruc: string): CarrierCacheData | null {
  return carrierCache.get(ruc);
}

export function setCarrierCache(ruc: string, data: CarrierCacheData): void {
  carrierCache.set(ruc, data);
}
