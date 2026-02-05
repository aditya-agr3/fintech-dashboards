import axios from 'axios';
import * as cheerio from 'cheerio';
import { GoogleFinanceData } from '../types/index.js';
import { CACHE_KEYS, getFromCache, setInCache } from '../utils/cache.js';
import { extractNumber, retryWithBackoff } from '../utils/helpers.js';

/**
 * Google Finance Scraping Service
 * 
 * Scrapes P/E Ratio and Latest Earnings from Google Finance.
 * 
 * IMPORTANT DISCLAIMERS:
 * - Web scraping is fragile and may break when Google updates their UI
 * - Google may block IPs that make too many requests
 * - This is for educational/personal use; commercial use may violate ToS
 * - Always implement caching and rate limiting
 * - Selectors may need periodic updates as Google changes their HTML structure
 */

const GOOGLE_FINANCE_BASE_URL = 'https://www.google.com/finance/quote';

// User agent to avoid being blocked
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/**
 * Build Google Finance URL for NSE stocks
 */
function buildGoogleFinanceUrl(nseCode: string): string {
  return `${GOOGLE_FINANCE_BASE_URL}/${nseCode}:NSE`;
}

/**
 * Extract P/E ratio from Google Finance page
 * 
 * Note: Google Finance HTML structure changes frequently.
 * The selectors below are based on the current structure and may need updates.
 */
function extractPERatio($: cheerio.CheerioAPI): number | null {
  try {
    // Look for P/E ratio in the key statistics section
    // Google Finance uses data attributes and specific class patterns
    const statsRows = $('[data-source="key_stats"] .P6K39c, .gyFHrc .P6K39c');
    
    let peRatio: number | null = null;
    
    statsRows.each((_, element) => {
      const label = $(element).find('.mfs7Fc').text().trim();
      const value = $(element).find('.P6K39c').text().trim();
      
      if (label.toLowerCase().includes('p/e ratio') || label.toLowerCase().includes('pe ratio')) {
        peRatio = extractNumber(value);
      }
    });
    
    // Alternative selector patterns
    if (peRatio === null) {
      $('div').each((_, element) => {
        const text = $(element).text();
        if (text.includes('P/E ratio') && !text.includes('Forward')) {
          const parent = $(element).parent();
          const valueElement = parent.find('div').last();
          const value = valueElement.text().trim();
          const num = extractNumber(value);
          if (num !== null && num > 0 && num < 1000) {
            peRatio = num;
            return false; // Break the loop
          }
        }
      });
    }
    
    return peRatio;
  } catch {
    return null;
  }
}

/**
 * Extract latest earnings information from Google Finance page
 */
function extractLatestEarnings($: cheerio.CheerioAPI): string | null {
  try {
    // Look for earnings information in the financials section
    const earningsSection = $('[data-source="earnings"], .AzFOnd');
    
    if (earningsSection.length > 0) {
      // Try to extract the most recent earnings figure
      const earningsText = earningsSection.first().text().trim();
      if (earningsText) {
        return earningsText;
      }
    }
    
    // Alternative: Look for EPS data
    let epsValue: string | null = null;
    
    $('div').each((_, element) => {
      const text = $(element).text();
      if (text.includes('EPS') && !text.includes('estimate')) {
        const parent = $(element).parent();
        const valueElement = parent.find('div').last();
        const value = valueElement.text().trim();
        if (value && value !== 'EPS' && value.match(/[\d.]+/)) {
          epsValue = `EPS: ${value}`;
          return false; // Break the loop
        }
      }
    });
    
    return epsValue;
  } catch {
    return null;
  }
}

/**
 * Fetch P/E ratio and latest earnings for a single stock
 */
export async function fetchStockPEAndEarnings(
  nseCode: string
): Promise<GoogleFinanceData> {
  const cacheKey = CACHE_KEYS.STOCK_PE(nseCode);
  
  // Check cache first
  const cached = getFromCache<GoogleFinanceData>(cacheKey);
  if (cached) {
    return cached;
  }
  
  const url = buildGoogleFinanceUrl(nseCode);
  
  try {
    const result = await retryWithBackoff(async () => {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
        },
        timeout: 10000,
      });
      
      return response.data;
    }, 2, 500);
    
    const $ = cheerio.load(result);
    
    const peRatio = extractPERatio($);
    const latestEarnings = extractLatestEarnings($);
    
    const data: GoogleFinanceData = {
      symbol: nseCode,
      peRatio,
      latestEarnings,
    };
    
    // Cache the result
    setInCache(cacheKey, data);
    
    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      symbol: nseCode,
      peRatio: null,
      latestEarnings: null,
      error: `Failed to fetch from Google Finance: ${errorMessage}`,
    };
  }
}

/**
 * Fetch P/E ratios and earnings for multiple stocks
 * Implements sequential fetching with delays to avoid rate limiting
 */
export async function fetchMultipleStocksPEAndEarnings(
  nseCodes: string[]
): Promise<Map<string, GoogleFinanceData>> {
  const results = new Map<string, GoogleFinanceData>();
  
  // Process one at a time with delay to avoid rate limiting
  // Google is more aggressive with rate limiting than Yahoo
  for (let i = 0; i < nseCodes.length; i++) {
    const code = nseCodes[i];
    const data = await fetchStockPEAndEarnings(code);
    results.set(code, data);
    
    // Add delay between requests (300ms)
    if (i < nseCodes.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }
  
  return results;
}
