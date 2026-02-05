'use client';

import { memo } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatRelativeTime } from '@/lib/formatters';
import { useRefreshCountdown } from '@/hooks/usePortfolio';

interface RefreshIndicatorProps {
  lastRefresh: Date | null;
  cacheHit: boolean;
  onRefresh: () => void;
  isLoading?: boolean;
}

export const RefreshIndicator = memo(function RefreshIndicator({
  lastRefresh,
  cacheHit,
  onRefresh,
  isLoading = false,
}: RefreshIndicatorProps) {
  const secondsUntilRefresh = useRefreshCountdown(lastRefresh);
  
  return (
    <div className="flex items-center gap-4 text-sm">
      {/* Last updated */}
      <div className="flex items-center gap-2 text-slate-500">
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" />
            <span>Refreshing...</span>
          </>
        ) : (
          <>
            <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
            <span>
              Updated {lastRefresh ? formatRelativeTime(lastRefresh.toISOString()) : 'never'}
            </span>
            {cacheHit && (
              <span className="text-xs text-slate-400">(cached)</span>
            )}
          </>
        )}
      </div>
      
      {/* Next refresh countdown */}
      <div className="hidden sm:flex items-center gap-2 text-slate-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>Next in {secondsUntilRefresh}s</span>
      </div>
      
      {/* Manual refresh button */}
      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="flex items-center gap-1 px-3 py-1.5 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg
          className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        <span className="hidden sm:inline">Refresh</span>
      </button>
    </div>
  );
});
