import rateLimit from 'express-rate-limit';

/**
 * Rate limiter middleware to prevent abuse
 * 
 * Configuration:
 * - Window: 1 minute (configurable via env)
 * - Max requests: 100 per window (configurable via env)
 * 
 * This protects both our server and downstream APIs from excessive load.
 */

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10);

export const apiRateLimiter = rateLimit({
  windowMs,
  max: maxRequests,
  message: {
    status: 429,
    message: 'Too many requests. Please try again later.',
    retryAfter: Math.ceil(windowMs / 1000),
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for health check
  skip: (req) => req.path === '/health',
});

/**
 * Stricter rate limiter for portfolio endpoint
 * Since this endpoint makes external API calls, we limit it more aggressively
 */
export const portfolioRateLimiter = rateLimit({
  windowMs: 15000, // 15 seconds
  max: 2, // 2 requests per 15 seconds (aligns with our cache TTL)
  message: {
    status: 429,
    message: 'Portfolio data is cached for 15 seconds. Please wait before refreshing.',
    retryAfter: 15,
  },
  standardHeaders: true,
  legacyHeaders: false,
});
