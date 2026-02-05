'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { PortfolioData, PortfolioState, LoadingState } from '@/types';
import { fetchPortfolio } from '@/lib/api';

const REFRESH_INTERVAL = 15000; // 15 seconds

/**
 * Custom hook for managing portfolio data with auto-refresh
 * 
 * Features:
 * - Automatic refresh every 15 seconds
 * - Loading and error state management
 * - Manual refresh capability
 * - Prevents redundant fetches
 */
export function usePortfolio() {
  const [state, setState] = useState<PortfolioState>({
    data: null,
    loadingState: 'idle',
    error: null,
    lastRefresh: null,
  });
  
  const isFetchingRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const updateState = useCallback((updates: Partial<PortfolioState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);
  
  const fetchData = useCallback(async (isInitial = false) => {
    // Prevent concurrent fetches
    if (isFetchingRef.current) return;
    
    isFetchingRef.current = true;
    
    // Only show loading state on initial fetch
    if (isInitial) {
      updateState({ loadingState: 'loading', error: null });
    }
    
    try {
      const data = await fetchPortfolio();
      
      updateState({
        data,
        loadingState: 'success',
        error: null,
        lastRefresh: new Date(),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch data';
      
      // Don't clear existing data on refresh errors
      updateState({
        loadingState: state.data ? 'success' : 'error',
        error: message,
      });
      
      console.error('[Portfolio] Fetch error:', message);
    } finally {
      isFetchingRef.current = false;
    }
  }, [updateState, state.data]);
  
  // Manual refresh function
  const refresh = useCallback(() => {
    fetchData(false);
  }, [fetchData]);
  
  // Initial fetch and auto-refresh setup
  useEffect(() => {
    // Initial fetch
    fetchData(true);
    
    // Set up auto-refresh interval
    intervalRef.current = setInterval(() => {
      fetchData(false);
    }, REFRESH_INTERVAL);
    
    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData]);
  
  return {
    data: state.data,
    isLoading: state.loadingState === 'loading',
    isError: state.loadingState === 'error',
    error: state.error,
    lastRefresh: state.lastRefresh,
    cacheHit: state.data?.cacheHit ?? false,
    refresh,
  };
}

/**
 * Hook for countdown timer until next refresh
 */
export function useRefreshCountdown(lastRefresh: Date | null) {
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(REFRESH_INTERVAL / 1000);
  
  useEffect(() => {
    if (!lastRefresh) return;
    
    const updateCountdown = () => {
      const elapsed = Date.now() - lastRefresh.getTime();
      const remaining = Math.max(0, Math.ceil((REFRESH_INTERVAL - elapsed) / 1000));
      setSecondsUntilRefresh(remaining);
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, [lastRefresh]);
  
  return secondsUntilRefresh;
}
