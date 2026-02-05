import { DataFetchError } from '../types/index.js';

/**
 * Create a standardized error object for data fetch failures
 */
export function createDataFetchError(
  source: 'yahoo' | 'google',
  field: string,
  message: string
): DataFetchError {
  return {
    source,
    field,
    message,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Sleep utility for rate limiting
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Format number to Indian currency format
 */
export function formatIndianCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Calculate percentage change
 */
export function calculatePercentChange(
  currentValue: number,
  originalValue: number
): number {
  if (originalValue === 0) return 0;
  return ((currentValue - originalValue) / originalValue) * 100;
}

/**
 * Round number to specified decimal places
 */
export function roundToDecimals(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Convert NSE symbol to Yahoo Finance format (add .NS suffix)
 */
export function toYahooSymbol(nseCode: string): string {
  return `${nseCode}.NS`;
}

/**
 * Extract numeric value from string (for parsing scraped data)
 */
export function extractNumber(str: string | null | undefined): number | null {
  if (!str) return null;
  
  // Remove common prefixes and suffixes
  const cleaned = str
    .replace(/[₹$€£]/g, '')
    .replace(/[,\s]/g, '')
    .replace(/[A-Za-z]/g, '')
    .trim();
  
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

/**
 * Safely parse JSON with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        await sleep(delay);
      }
    }
  }
  
  throw lastError;
}
