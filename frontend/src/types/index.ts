// ============================================
// Portfolio Types (matching backend)
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

export interface DataFetchError {
  source: 'yahoo' | 'google';
  field: string;
  message: string;
  timestamp: string;
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

export interface PortfolioData {
  stocks: StockWithMarketData[];
  sectors: SectorSummary[];
  totalInvestment: number;
  totalPresentValue: number | null;
  totalGainLoss: number | null;
  totalGainLossPercent: number | null;
  lastUpdated: string;
  cacheHit: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// ============================================
// UI State Types
// ============================================

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface PortfolioState {
  data: PortfolioData | null;
  loadingState: LoadingState;
  error: string | null;
  lastRefresh: Date | null;
}

// ============================================
// Table Column Types
// ============================================

export type SortDirection = 'asc' | 'desc' | false;

export interface ColumnSort {
  id: string;
  desc: boolean;
}
