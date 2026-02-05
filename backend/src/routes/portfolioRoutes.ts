import { Router } from 'express';
import {
  getPortfolio,
  getHealth,
  getStatus,
} from '../controllers/portfolioController.js';
import { portfolioRateLimiter } from '../middleware/rateLimiter.js';

/**
 * Portfolio API Routes
 * 
 * All routes are prefixed with /api
 */
const router = Router();

/**
 * GET /api/portfolio
 * Main endpoint to fetch complete portfolio data with market information
 * Rate limited to 2 requests per 15 seconds
 */
router.get('/portfolio', portfolioRateLimiter, getPortfolio);

/**
 * GET /api/health
 * Health check endpoint (not rate limited)
 */
router.get('/health', getHealth);

/**
 * GET /api/status
 * Server status and configuration
 */
router.get('/status', getStatus);

export default router;
