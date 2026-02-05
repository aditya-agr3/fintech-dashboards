import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import portfolioRoutes from './routes/portfolioRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// Middleware
// ============================================

// CORS configuration - allow frontend origin
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parse JSON bodies
app.use(express.json());

// Global rate limiting
app.use(apiRateLimiter);

// Request logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// ============================================
// Routes
// ============================================

// API routes
app.use('/api', portfolioRoutes);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    message: 'Portfolio Dashboard API',
    version: '1.0.0',
    endpoints: {
      portfolio: 'GET /api/portfolio',
      health: 'GET /api/health',
      status: 'GET /api/status',
    },
  });
});

// ============================================
// Error Handling
// ============================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ============================================
// Server Startup
// ============================================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════╗
║       Portfolio Dashboard Backend API              ║
╠════════════════════════════════════════════════════╣
║  Server running on: http://localhost:${PORT}          ║
║  Environment: ${(process.env.NODE_ENV || 'development').padEnd(35)}║
║  Cache TTL: ${(process.env.CACHE_TTL || '15')} seconds                            ║
╚════════════════════════════════════════════════════╝
  `);
});

export default app;
