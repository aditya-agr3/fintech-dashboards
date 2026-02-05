import { Request, Response } from 'express';
import { getPortfolioData } from '../services/portfolioService.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { getCacheStats } from '../utils/cache.js';

/**
 * Portfolio Controller
 * 
 * Handles HTTP requests related to portfolio data.
 * All business logic is delegated to services.
 */

/**
 * GET /api/portfolio
 * 
 * Returns complete portfolio data including:
 * - All stocks with market data
 * - Sector summaries
 * - Portfolio totals
 */
export const getPortfolio = asyncHandler(async (_req: Request, res: Response) => {
  try {
    const portfolioData = await getPortfolioData();
    
    res.json({
      success: true,
      data: portfolioData,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new AppError(500, 'Failed to fetch portfolio data', message);
  }
});

/**
 * GET /api/portfolio/health
 * 
 * Health check endpoint that also returns cache statistics
 */
export const getHealth = asyncHandler(async (_req: Request, res: Response) => {
  const cacheStats = getCacheStats();
  
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    cache: {
      hits: cacheStats.hits,
      misses: cacheStats.misses,
      keys: cacheStats.keys,
    },
  });
});

/**
 * GET /api/portfolio/status
 * 
 * Returns current server status and configuration (non-sensitive)
 */
export const getStatus = asyncHandler(async (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      cacheTTL: parseInt(process.env.CACHE_TTL || '15', 10),
      refreshInterval: 15, // Recommended frontend refresh interval in seconds
      features: {
        yahooFinance: true,
        googleFinance: true,
        sectorGrouping: true,
      },
    },
  });
});
