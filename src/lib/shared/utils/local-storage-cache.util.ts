const DEFAULT_CACHE_TTL = 1000 * 60 * 60 * 24; // 24 horas

type CacheItem<T> = T & {
  timestamp: number;
};

type Cache<T> = Record<string, CacheItem<T>>;

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Crea un sistema de caché en localStorage con TTL
 * @param cacheKey - Clave única para el caché en localStorage
 * @param ttl - Tiempo de vida del caché en milisegundos (por defecto 24 horas)
 * @returns Objeto con métodos get y set para manejar el caché
 */
export function createLocalStorageCache<T extends object>(
  cacheKey: string,
  ttl: number = DEFAULT_CACHE_TTL
) {
  function readCache(): Cache<T> {
    if (!isBrowser()) return {};

    try {
      const raw = localStorage.getItem(cacheKey);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  function writeCache(cache: Cache<T>): void {
    if (!isBrowser()) return;

    localStorage.setItem(cacheKey, JSON.stringify(cache));
  }

  return {
    /**
     * Obtiene un elemento del caché por su ID
     * @param id - Identificador único del elemento
     * @returns Los datos del caché o null si no existe o expiró
     */
    get(id: string): T | null {
      const cache = readCache();
      const item = cache[id];

      if (!item) return null;

      const isExpired = Date.now() - item.timestamp > ttl;

      if (isExpired) {
        delete cache[id];
        writeCache(cache);
        return null;
      }

      const { timestamp, ...data } = item;
      return data as T;
    },

    /**
     * Guarda un elemento en el caché
     * @param id - Identificador único del elemento
     * @param data - Datos a guardar en el caché
     */
    set(id: string, data: T): void {
      const cache = readCache();

      cache[id] = {
        ...data,
        timestamp: Date.now(),
      } as CacheItem<T>;

      writeCache(cache);
    },
  };
}
