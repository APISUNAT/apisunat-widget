const CUSTOMER_CACHE_KEY = 'sunat-customer-cache'

const CACHE_TTL = 1000 * 60 * 60 * 24 

export type CustomerCacheData = {
  name: string
  address: string
}

type CustomerCacheItem = CustomerCacheData & {
  timestamp: number
}

type CustomerCache = Record<string, CustomerCacheItem>

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

function readCache(): CustomerCache {
  if (!isBrowser()) return {}

  try {
    const raw = localStorage.getItem(CUSTOMER_CACHE_KEY)

    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeCache(cache: CustomerCache): void {
  if (!isBrowser()) return

  localStorage.setItem(
    CUSTOMER_CACHE_KEY,
    JSON.stringify(cache)
  )
}

export function getCustomerCache(
  numberDocument: string
): CustomerCacheData | null {
  const cache = readCache()

  const item = cache[numberDocument]

  if (!item) return null

  const isExpired =
    Date.now() - item.timestamp > CACHE_TTL

  if (isExpired) {
    delete cache[numberDocument]
    writeCache(cache)

    return null
  }

  return {
    name: item.name,
    address: item.address
  }
}

export function setCustomerCache(
  numberDocument: string,
  data: CustomerCacheData
): void {
  const cache = readCache()

  cache[numberDocument] = {
    ...data,
    timestamp: Date.now()
  }

  writeCache(cache)
}