import yahooFinance from 'yahoo-finance2';
import { YahooFinanceData } from '../types/index.js';
import { toYahooSymbol } from '../utils/helpers.js';
import { CACHE_KEYS, getFromCache, setInCache } from '../utils/cache.js';

// Type for Yahoo Finance quote response
interface YahooQuoteResult {
  regularMarketPrice?: number;
  symbol?: string;
  [key: string]: unknown;
}

/**
 * Yahoo Finance Service
 * 
 * Fetches Current Market Price (CMP) using the unofficial yahoo-finance2 library.
 * 
 * IMPORTANT NOTES:
 * - yahoo-finance2 is an unofficial library that may break if Yahoo changes their API
 * - Rate limits apply; excessive requests may result in temporary blocks
 * - Data should be cached to minimize API calls
 */

/**
 * Fetch current market price for a single stock
 */
export async function fetchStockCMP(nseCode: string): Promise<YahooFinanceData> {
  const cacheKey = CACHE_KEYS.STOCK_CMP(nseCode);
  
  // Check cache first
  const cached = getFromCache<YahooFinanceData>(cacheKey);
  if (cached) {
    return cached;
  }
  
  const yahooSymbol = toYahooSymbol(nseCode);
  
  try {
    const quote = await yahooFinance.quote(yahooSymbol) as YahooQuoteResult;
    
    const result: YahooFinanceData = {
      symbol: nseCode,
      cmp: quote?.regularMarketPrice ?? null,
    };
    
    // Cache the result
    setInCache(cacheKey, result);
    
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Return partial data with error info
    return {
      symbol: nseCode,
      cmp: null,
      error: `Failed to fetch CMP: ${errorMessage}`,
    };
  }
}

/**
 * Fetch current market prices for multiple stocks in parallel
 * Implements batching to avoid rate limiting
 */
export async function fetchMultipleStocksCMP(
  nseCodes: string[]
): Promise<Map<string, YahooFinanceData>> {
  const results = new Map<string, YahooFinanceData>();
  
  // Process in batches of 5 to avoid rate limiting
  const batchSize = 5;
  const batches: string[][] = [];
  
  for (let i = 0; i < nseCodes.length; i += batchSize) {
    batches.push(nseCodes.slice(i, i + batchSize));
  }
  
  for (const batch of batches) {
    const batchPromises = batch.map((code) => fetchStockCMP(code));
    const batchResults = await Promise.all(batchPromises);
    
    batchResults.forEach((result) => {
      results.set(result.symbol, result);
    });
    
    // Small delay between batches to be respectful to the API
    if (batches.indexOf(batch) < batches.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  
  return results;
}

/**
 * Validate if a symbol exists on Yahoo Finance
 */
export async function validateSymbol(nseCode: string): Promise<boolean> {
  const yahooSymbol = toYahooSymbol(nseCode);
  
  try {
    const result = await yahooFinance.quote(yahooSymbol) as YahooQuoteResult | null;
    return result !== null && result !== undefined;
  } catch {
    return false;
  }
}
