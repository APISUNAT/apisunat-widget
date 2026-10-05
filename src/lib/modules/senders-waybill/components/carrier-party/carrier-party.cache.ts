const CARRIER_CACHE_KEY = 'sunat-carrier-cache'

const CACHE_TTL = 1000 * 60 * 60 * 24 // 24 horas

export type CarrierCacheData = {
  name: string
}

type CarrierCacheItem = CarrierCacheData & {
  timestamp: number
}

type CarrierCache = Record<string, CarrierCacheItem>

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

function readCache(): CarrierCache {
  if (!isBrowser()) return {}

  try {
    const raw = localStorage.getItem(CARRIER_CACHE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeCache(cache: CarrierCache): void {
  if (!isBrowser()) return

  localStorage.setItem(
    CARRIER_CACHE_KEY,
    JSON.stringify(cache)
  )
}

export function getCarrierCache(
  ruc: string
): CarrierCacheData | null {
  const cache = readCache()

  const item = cache[ruc]

  if (!item) return null

  const isExpired = Date.now() - item.timestamp > CACHE_TTL

  if (isExpired) {
    delete cache[ruc]
    writeCache(cache)
    return null
  }

  return {
    name: item.name
  }
}

export function setCarrierCache(
  ruc: string,
  data: CarrierCacheData
): void {
  const cache = readCache()

  cache[ruc] = {
    ...data,
    timestamp: Date.now()
  }

  writeCache(cache)
}
