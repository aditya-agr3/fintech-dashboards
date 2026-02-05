import NodeCache from 'node-cache';

/**
 * In-memory cache for storing market data.
 * TTL is set via environment variable, defaults to 15 seconds.
 */
const cacheTTL = parseInt(process.env.CACHE_TTL || '15', 10);

export const cache = new NodeCache({
  stdTTL: cacheTTL,
  checkperiod: cacheTTL * 0.2,
  useClones: true,
});

/**
 * Cache keys for different data types
 */
export const CACHE_KEYS = {
  PORTFOLIO: 'portfolio_data',
  STOCK_CMP: (symbol: string) => `cmp_${symbol}`,
  STOCK_PE: (symbol: string) => `pe_${symbol}`,
  MARKET_DATA: (symbol: string) => `market_${symbol}`,
} as const;

/**
 * Get data from cache with type safety
 */
export function getFromCache<T>(key: string): T | undefined {
  return cache.get<T>(key);
}

/**
 * Set data in cache with optional custom TTL
 */
export function setInCache<T>(key: string, value: T, ttl?: number): boolean {
  if (ttl !== undefined) {
    return cache.set(key, value, ttl);
  }
  return cache.set(key, value);
}

/**
 * Check if key exists in cache
 */
export function hasInCache(key: string): boolean {
  return cache.has(key);
}

/**
 * Delete key from cache
 */
export function deleteFromCache(key: string): number {
  return cache.del(key);
}

/**
 * Flush all cache data
 */
export function flushCache(): void {
  cache.flushAll();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): NodeCache.Stats {
  return cache.getStats();
}
