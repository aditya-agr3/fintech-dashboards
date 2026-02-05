'use client';

import { usePortfolio } from '@/hooks/usePortfolio';
import { LoadingOverlay } from '@/components/ui/LoadingSpinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { PortfolioSummary } from './PortfolioSummary';
import { SectorSummaryComponent } from './SectorSummary';
import { PortfolioTable } from './PortfolioTable';
import { RefreshIndicator } from './RefreshIndicator';

export function Dashboard() {
  const { data, isLoading, isError, error, lastRefresh, cacheHit, refresh } = usePortfolio();
  
  // Initial loading state
  if (isLoading && !data) {
    return <LoadingOverlay message="Fetching portfolio data from market..." />;
  }
  
  // Error state (no data available)
  if (isError && !data) {
    return (
      <ErrorState
        message={error || 'Failed to load portfolio data. Please try again.'}
        onRetry={refresh}
      />
    );
  }
  
  // No data
  if (!data) {
    return <LoadingOverlay message="Initializing dashboard..." />;
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with refresh indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Portfolio Dashboard
          </h1>
          <p className="text-slate-500 mt-1">
            Real-time portfolio tracking with live market data
          </p>
        </div>
        <RefreshIndicator
          lastRefresh={lastRefresh}
          cacheHit={cacheHit}
          onRefresh={refresh}
          isLoading={isLoading}
        />
      </div>
      
      {/* Error banner (when data exists but refresh failed) */}
      {error && data && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <svg
            className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <p className="text-sm font-medium text-amber-800">
              Refresh failed: {error}
            </p>
            <p className="text-xs text-amber-600 mt-1">
              Showing last successful data. Will retry automatically.
            </p>
          </div>
        </div>
      )}
      
      {/* Portfolio Summary Cards */}
      <PortfolioSummary data={data} />
      
      {/* Main Portfolio Table */}
      <PortfolioTable stocks={data.stocks} />
      
      {/* Sector Summary */}
      <SectorSummaryComponent sectors={data.sectors} />
      
      {/* Footer with data source info */}
      <div className="text-center text-xs text-slate-400 py-4">
        <p>
          Market data: Yahoo Finance (CMP) & Google Finance (P/E, Earnings)
        </p>
        <p className="mt-1">
          Data refreshes automatically every 15 seconds. Prices may be delayed.
        </p>
      </div>
    </div>
  );
}
