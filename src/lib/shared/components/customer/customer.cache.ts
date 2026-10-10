import { createLocalStorageCache } from '$lib/shared/utils/local-storage-cache.util';

export type CustomerCacheData = {
  name: string;
  address: string;
};

const customerCache = createLocalStorageCache<CustomerCacheData>('sunat-customer-cache');

export function getCustomerCache(numberDocument: string): CustomerCacheData | null {
  return customerCache.get(numberDocument);
}

export function setCustomerCache(numberDocument: string, data: CustomerCacheData): void {
  customerCache.set(numberDocument, data);
}