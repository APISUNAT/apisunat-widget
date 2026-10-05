const SELLER_CACHE_KEY = 'sunat-seller-cache'

const CACHE_TTL = 1000 * 60 * 60 * 24 // 24 horas

export type SellerCacheData = {
  name: string
}

type SellerCacheItem = SellerCacheData & {
  timestamp: number
}

type SellerCache = Record<string, SellerCacheItem>

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

function readCache(): SellerCache {
  if (!isBrowser()) return {}

  try {
    const raw = localStorage.getItem(SELLER_CACHE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeCache(cache: SellerCache): void {
  if (!isBrowser()) return

  localStorage.setItem(
    SELLER_CACHE_KEY,
    JSON.stringify(cache)
  )
}

export function getSellerCache(
  numberDocument: string
): SellerCacheData | null {
  const cache = readCache()

  const item = cache[numberDocument]

  if (!item) return null

  const isExpired = Date.now() - item.timestamp > CACHE_TTL

  if (isExpired) {
    delete cache[numberDocument]
    writeCache(cache)
    return null
  }

  return {
    name: item.name
  }
}

export function setSellerCache(
  numberDocument: string,
  data: SellerCacheData
): void {
  const cache = readCache()

  cache[numberDocument] = {
    ...data,
    timestamp: Date.now()
  }

  writeCache(cache)
}
