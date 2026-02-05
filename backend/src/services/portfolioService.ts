import {
  Stock,
  StockWithMarketData,
  SectorSummary,
  PortfolioResponse,
  MarketData,
  DataFetchError,
} from '../types/index.js';
import { portfolioData } from '../data/portfolio.js';
import { fetchMultipleStocksCMP } from './yahooFinanceService.js';
import { fetchMultipleStocksPEAndEarnings } from './googleFinanceService.js';
import { CACHE_KEYS, getFromCache, setInCache } from '../utils/cache.js';
import { roundToDecimals, calculatePercentChange, createDataFetchError } from '../utils/helpers.js';

/**
 * Portfolio Service
 * 
 * Orchestrates data fetching from multiple sources and computes portfolio metrics.
 * Handles partial failures gracefully - if CMP is available but P/E is not,
 * the stock is still displayed with available data.
 */

/**
 * Fetch market data for all stocks in the portfolio
 */
async function fetchAllMarketData(
  stocks: Stock[]
): Promise<Map<string, MarketData>> {
  const nseCodes = stocks.map((s) => s.nseCode);
  const marketDataMap = new Map<string, MarketData>();
  
  // Fetch CMP from Yahoo Finance and P/E from Google Finance in parallel
  const [cmpResults, peResults] = await Promise.all([
    fetchMultipleStocksCMP(nseCodes),
    fetchMultipleStocksPEAndEarnings(nseCodes),
  ]);
  
  // Combine results for each stock
  for (const code of nseCodes) {
    const yahooData = cmpResults.get(code);
    const googleData = peResults.get(code);
    
    const errors: DataFetchError[] = [];
    
    // Track errors for each data source
    if (yahooData?.error) {
      errors.push(createDataFetchError('yahoo', 'CMP', yahooData.error));
    }
    if (googleData?.error) {
      errors.push(createDataFetchError('google', 'P/E & Earnings', googleData.error));
    }
    
    marketDataMap.set(code, {
      cmp: yahooData?.cmp ?? null,
      peRatio: googleData?.peRatio ?? null,
      latestEarnings: googleData?.latestEarnings ?? null,
      errors,
    });
  }
  
  return marketDataMap;
}

/**
 * Calculate total investment across all stocks
 */
function calculateTotalInvestment(stocks: Stock[]): number {
  return stocks.reduce((sum, stock) => sum + stock.purchasePrice * stock.quantity, 0);
}

/**
 * Enrich stock with market data and calculated fields
 */
function enrichStockWithMarketData(
  stock: Stock,
  marketData: MarketData,
  totalInvestment: number
): StockWithMarketData {
  const investment = stock.purchasePrice * stock.quantity;
  const presentValue = marketData.cmp !== null ? marketData.cmp * stock.quantity : null;
  const gainLoss = presentValue !== null ? presentValue - investment : null;
  const gainLossPercent = gainLoss !== null 
    ? calculatePercentChange(presentValue!, investment) 
    : null;
  const portfolioWeight = (investment / totalInvestment) * 100;
  
  return {
    ...stock,
    cmp: marketData.cmp !== null ? roundToDecimals(marketData.cmp) : null,
    peRatio: marketData.peRatio !== null ? roundToDecimals(marketData.peRatio) : null,
    latestEarnings: marketData.latestEarnings,
    investment: roundToDecimals(investment),
    presentValue: presentValue !== null ? roundToDecimals(presentValue) : null,
    gainLoss: gainLoss !== null ? roundToDecimals(gainLoss) : null,
    gainLossPercent: gainLossPercent !== null ? roundToDecimals(gainLossPercent) : null,
    portfolioWeight: roundToDecimals(portfolioWeight),
    lastUpdated: new Date().toISOString(),
    errors: marketData.errors,
  };
}

/**
 * Calculate sector-level summaries
 */
function calculateSectorSummaries(stocks: StockWithMarketData[]): SectorSummary[] {
  const sectorMap = new Map<string, StockWithMarketData[]>();
  
  // Group stocks by sector
  for (const stock of stocks) {
    const existing = sectorMap.get(stock.sector) || [];
    existing.push(stock);
    sectorMap.set(stock.sector, existing);
  }
  
  // Calculate summaries for each sector
  const summaries: SectorSummary[] = [];
  
  for (const [sector, sectorStocks] of sectorMap) {
    const totalInvestment = sectorStocks.reduce((sum, s) => sum + s.investment, 0);
    
    // Calculate total present value (only if all stocks have CMP)
    const allHavePresentValue = sectorStocks.every((s) => s.presentValue !== null);
    const totalPresentValue = allHavePresentValue
      ? sectorStocks.reduce((sum, s) => sum + (s.presentValue || 0), 0)
      : null;
    
    const gainLoss = totalPresentValue !== null ? totalPresentValue - totalInvestment : null;
    const gainLossPercent = gainLoss !== null
      ? calculatePercentChange(totalPresentValue!, totalInvestment)
      : null;
    
    summaries.push({
      sector,
      totalInvestment: roundToDecimals(totalInvestment),
      totalPresentValue: totalPresentValue !== null ? roundToDecimals(totalPresentValue) : null,
      gainLoss: gainLoss !== null ? roundToDecimals(gainLoss) : null,
      gainLossPercent: gainLossPercent !== null ? roundToDecimals(gainLossPercent) : null,
      stockCount: sectorStocks.length,
    });
  }
  
  // Sort by total investment descending
  return summaries.sort((a, b) => b.totalInvestment - a.totalInvestment);
}

/**
 * Get complete portfolio data with market information
 * This is the main entry point for the portfolio service
 */
export async function getPortfolioData(): Promise<PortfolioResponse> {
  const cacheKey = CACHE_KEYS.PORTFOLIO;
  
  // Check cache first
  const cached = getFromCache<PortfolioResponse>(cacheKey);
  if (cached) {
    return { ...cached, cacheHit: true };
  }
  
  // Fetch fresh data
  const stocks = portfolioData;
  const totalInvestment = calculateTotalInvestment(stocks);
  
  // Fetch all market data
  const marketDataMap = await fetchAllMarketData(stocks);
  
  // Enrich stocks with market data
  const enrichedStocks = stocks.map((stock) => {
    const marketData = marketDataMap.get(stock.nseCode) || {
      cmp: null,
      peRatio: null,
      latestEarnings: null,
      errors: [],
    };
    return enrichStockWithMarketData(stock, marketData, totalInvestment);
  });
  
  // Calculate sector summaries
  const sectors = calculateSectorSummaries(enrichedStocks);
  
  // Calculate portfolio totals
  const allHavePresentValue = enrichedStocks.every((s) => s.presentValue !== null);
  const totalPresentValue = allHavePresentValue
    ? enrichedStocks.reduce((sum, s) => sum + (s.presentValue || 0), 0)
    : null;
  
  const totalGainLoss = totalPresentValue !== null
    ? totalPresentValue - totalInvestment
    : null;
  
  const totalGainLossPercent = totalGainLoss !== null
    ? calculatePercentChange(totalPresentValue!, totalInvestment)
    : null;
  
  const response: PortfolioResponse = {
    stocks: enrichedStocks,
    sectors,
    totalInvestment: roundToDecimals(totalInvestment),
    totalPresentValue: totalPresentValue !== null ? roundToDecimals(totalPresentValue) : null,
    totalGainLoss: totalGainLoss !== null ? roundToDecimals(totalGainLoss) : null,
    totalGainLossPercent: totalGainLossPercent !== null ? roundToDecimals(totalGainLossPercent) : null,
    lastUpdated: new Date().toISOString(),
    cacheHit: false,
  };
  
  // Cache the response
  setInCache(cacheKey, response);
  
  return response;
}

/**
 * Get raw portfolio stocks without market data (for testing)
 */
export function getRawPortfolioStocks(): Stock[] {
  return portfolioData;
}
