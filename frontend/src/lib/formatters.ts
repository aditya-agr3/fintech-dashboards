/**
 * Formatting utilities for the portfolio dashboard
 */

/**
 * Format number as Indian currency (INR)
 */
export function formatCurrency(
  value: number | null | undefined,
  showSymbol: boolean = true
): string {
  if (value === null || value === undefined) return '—';
  
  const formatted = new Intl.NumberFormat('en-IN', {
    style: showSymbol ? 'currency' : 'decimal',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  
  return formatted;
}

/**
 * Format number as compact currency (e.g., 1.2L, 15K)
 */
export function formatCompactCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  
  const absValue = Math.abs(value);
  
  if (absValue >= 10000000) {
    // Crores
    return `₹${(value / 10000000).toFixed(2)}Cr`;
  } else if (absValue >= 100000) {
    // Lakhs
    return `₹${(value / 100000).toFixed(2)}L`;
  } else if (absValue >= 1000) {
    // Thousands
    return `₹${(value / 1000).toFixed(2)}K`;
  }
  
  return formatCurrency(value);
}

/**
 * Format percentage
 */
export function formatPercent(
  value: number | null | undefined,
  decimals: number = 2
): string {
  if (value === null || value === undefined) return '—';
  
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Format number with appropriate decimal places
 */
export function formatNumber(
  value: number | null | undefined,
  decimals: number = 2
): string {
  if (value === null || value === undefined) return '—';
  
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format date/time for display
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(date);
}

/**
 * Format relative time (e.g., "2 seconds ago")
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  
  if (diffSecs < 5) return 'Just now';
  if (diffSecs < 60) return `${diffSecs}s ago`;
  if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
  
  return formatDateTime(dateString);
}

/**
 * Get CSS class for gain/loss coloring
 */
export function getGainLossClass(value: number | null): string {
  if (value === null) return 'text-slate-400';
  if (value > 0) return 'text-success-500';
  if (value < 0) return 'text-danger-500';
  return 'text-slate-400';
}

/**
 * Get background class for gain/loss
 */
export function getGainLossBgClass(value: number | null): string {
  if (value === null) return 'bg-slate-100';
  if (value > 0) return 'bg-success-50';
  if (value < 0) return 'bg-danger-50';
  return 'bg-slate-100';
}
