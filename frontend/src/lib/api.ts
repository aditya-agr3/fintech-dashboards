import { ApiResponse, PortfolioData } from '@/types';

/**
 * API Client for Portfolio Dashboard
 * 
 * All API calls go through the Next.js API proxy to the backend.
 * This ensures CORS is handled and API URLs are consistent.
 */

const API_BASE = '/api';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchApi<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    // Handle rate limiting
    if (response.status === 429) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Rate limit exceeded. Please wait before refreshing.');
    }
    
    // Handle other errors
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data;
}

/**
 * Fetch complete portfolio data
 */
export async function fetchPortfolio(): Promise<PortfolioData> {
  const response = await fetchApi<ApiResponse<PortfolioData>>('/portfolio');
  
  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch portfolio data');
  }
  
  return response.data;
}

/**
 * Check API health
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetchApi<{ success: boolean }>('/health');
    return response.success;
  } catch {
    return false;
  }
}

/**
 * Get API status and configuration
 */
export async function getApiStatus(): Promise<{
  version: string;
  refreshInterval: number;
}> {
  const response = await fetchApi<ApiResponse<{
    version: string;
    refreshInterval: number;
  }>>('/status');
  
  return response.data;
}
