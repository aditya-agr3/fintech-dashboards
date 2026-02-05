# Dynamic Portfolio Dashboard

A production-ready portfolio tracking dashboard built with Next.js, Express.js, and TypeScript. Features real-time market data from Yahoo Finance and Google Finance with automatic refresh, sector-based grouping, and responsive fintech-style UI.

![Portfolio Dashboard](https://img.shields.io/badge/Status-Production%20Ready-success)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Next.js](https://img.shields.io/badge/Next.js-14.1-black)
![Express](https://img.shields.io/badge/Express-4.18-green)

## Features

- **Real-time Market Data**: Live CMP from Yahoo Finance, P/E ratios from Google Finance
- **Auto-refresh**: Data refreshes every 15 seconds automatically
- **Sector Grouping**: Stocks grouped by sector with aggregated summaries
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Error Resilience**: Graceful handling of partial data failures
- **Caching**: 15-second cache to minimize API calls
- **Rate Limiting**: Protection against API abuse

## Architecture

```
portfolio-dashboard/
├── backend/                 # Express.js API server
│   └── src/
│       ├── controllers/     # Request handlers
│       ├── services/        # Business logic & data fetching
│       ├── routes/          # API route definitions
│       ├── middleware/      # Rate limiting, error handling
│       ├── utils/           # Helpers, cache management
│       ├── types/           # TypeScript interfaces
│       └── data/            # Sample portfolio data
│
└── frontend/                # Next.js application
    └── src/
        ├── app/             # Next.js App Router pages
        ├── components/      # React components
        │   ├── portfolio/   # Portfolio-specific components
        │   └── ui/          # Reusable UI components
        ├── hooks/           # Custom React hooks
        ├── lib/             # API client, formatters
        └── types/           # TypeScript interfaces
```

## Tech Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **@tanstack/react-table** for data tables
- **recharts** (optional) for visualizations

### Backend
- **Node.js** runtime
- **Express.js** framework
- **TypeScript** for type safety
- **yahoo-finance2** for stock prices
- **cheerio** for web scraping
- **node-cache** for in-memory caching

## Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone and setup backend:**
```bash
cd portfolio-dashboard/backend
cp .env.example .env
npm install
npm run dev
```

2. **Setup frontend (new terminal):**
```bash
cd portfolio-dashboard/frontend
npm install
npm run dev
```

3. **Open browser:**
Navigate to http://localhost:3000

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/portfolio` | GET | Full portfolio with market data |
| `/api/health` | GET | Health check with cache stats |
| `/api/status` | GET | Server configuration info |

### Example Response

```json
{
  "success": true,
  "data": {
    "stocks": [
      {
        "id": "1",
        "name": "Tata Consultancy Services",
        "symbol": "TCS",
        "nseCode": "TCS",
        "sector": "Technology",
        "purchasePrice": 3200,
        "quantity": 10,
        "cmp": 3450.50,
        "investment": 32000,
        "presentValue": 34505,
        "gainLoss": 2505,
        "gainLossPercent": 7.83,
        "portfolioWeight": 8.5,
        "peRatio": 28.5,
        "latestEarnings": "EPS: 120.5"
      }
    ],
    "sectors": [...],
    "totalInvestment": 375000,
    "totalPresentValue": 412500,
    "totalGainLoss": 37500,
    "totalGainLossPercent": 10.0,
    "lastUpdated": "2026-02-05T10:30:00.000Z",
    "cacheHit": false
  }
}
```

## Configuration

### Backend Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3001 | API server port |
| `NODE_ENV` | development | Environment mode |
| `CACHE_TTL` | 15 | Cache duration in seconds |
| `RATE_LIMIT_WINDOW_MS` | 60000 | Rate limit window |
| `RATE_LIMIT_MAX_REQUESTS` | 100 | Max requests per window |
| `FRONTEND_URL` | http://localhost:3000 | CORS allowed origin |

## Data Sources

### Yahoo Finance (CMP)
- Uses unofficial `yahoo-finance2` library
- Provides current market prices
- May be rate limited under heavy use
- No official API; use responsibly

### Google Finance (P/E & Earnings)
- Web scraping via cheerio
- HTML structure may change without notice
- Implements retry with exponential backoff
- More aggressive rate limiting applied

## Error Handling

The system handles partial failures gracefully:

| Scenario | Behavior |
|----------|----------|
| Yahoo API fails | CMP shows "Error", other data displayed |
| Google scraping fails | P/E shows "N/A", other data displayed |
| Complete API failure | Shows cached data with warning banner |
| Rate limited | Returns cached data, retries later |

## Performance Optimizations

1. **Caching**: 15-second cache reduces API calls
2. **Parallel fetching**: Yahoo and Google requests run concurrently
3. **Memoization**: React components use `memo` and `useMemo`
4. **Debounced refresh**: Prevents duplicate simultaneous requests
5. **Batched requests**: Yahoo Finance requests batched in groups of 5

## Customization

### Adding Stocks

Edit `backend/src/data/portfolio.ts`:

```typescript
{
  id: '13',
  name: 'New Stock',
  symbol: 'NEWSYM',
  nseCode: 'NEWSYM',
  bseCode: '123456',
  sector: 'Technology',
  purchasePrice: 1000,
  quantity: 20,
}
```

### Changing Refresh Interval

- **Backend**: Update `CACHE_TTL` in `.env`
- **Frontend**: Update `REFRESH_INTERVAL` in `hooks/usePortfolio.ts`

## Known Limitations

1. **No official APIs**: Yahoo and Google don't provide official free APIs
2. **Scraping fragility**: Google Finance HTML may change
3. **Rate limits**: External APIs may temporarily block requests
4. **Market hours**: Data only updates during trading hours
5. **No authentication**: Sample app, no user management

## Future Improvements

- [ ] Database integration for persistent portfolio storage
- [ ] User authentication and multi-portfolio support
- [ ] Historical price charts with recharts
- [ ] Price alerts and notifications
- [ ] Export to CSV/PDF
- [ ] Mobile app with React Native
- [ ] WebSocket for push updates
- [ ] More data sources (BSE API, Alpha Vantage)

## License

MIT License - feel free to use for personal/educational purposes.

## Disclaimer

This is a demonstration project. Financial data may be delayed or inaccurate. Do not use for actual trading decisions. Yahoo Finance and Google Finance terms of service apply.
