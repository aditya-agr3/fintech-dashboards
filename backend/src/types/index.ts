// ============================================
// Core Portfolio Types
// ============================================

export interface Stock {
  id: string;
  name: string;
  symbol: string;
  nseCode: string;
  bseCode: string;
  sector: string;
  purchasePrice: number;
  quantity: number;
}

export interface StockWithMarketData extends Stock {
  cmp: number | null;
  peRatio: number | null;
  latestEarnings: string | null;
  investment: number;
  presentValue: number | null;
  gainLoss: number | null;
  gainLossPercent: number | null;
  portfolioWeight: number;
  lastUpdated: string;
  errors: DataFetchError[];
}

export interface SectorSummary {
  sector: string;
  totalInvestment: number;
  totalPresentValue: number | null;
  gainLoss: number | null;
  gainLossPercent: number | null;
  stockCount: number;
}

export interface PortfolioResponse {
  stocks: StockWithMarketData[];
  sectors: SectorSummary[];
  totalInvestment: number;
  totalPresentValue: number | null;
  totalGainLoss: number | null;
  totalGainLossPercent: number | null;
  lastUpdated: string;
  cacheHit: boolean;
}

// ============================================
// Market Data Types
// ============================================

export interface YahooFinanceData {
  symbol: string;
  cmp: number | null;
  error?: string;
}

export interface GoogleFinanceData {
  symbol: string;
  peRatio: number | null;
  latestEarnings: string | null;
  error?: string;
}

export interface MarketData {
  cmp: number | null;
  peRatio: number | null;
  latestEarnings: string | null;
  errors: DataFetchError[];
}

// ============================================
// Error Types
// ============================================

export interface DataFetchError {
  source: 'yahoo' | 'google';
  field: string;
  message: string;
  timestamp: string;
}

export interface ApiError {
  status: number;
  message: string;
  details?: string;
}

// ============================================
// Cache Types
// ============================================

export interface CachedData<T> {
  data: T;
  timestamp: number;
  ttl: number;
}
