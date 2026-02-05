import { Stock } from '../types/index.js';

/**
 * Sample portfolio data for demonstration.
 * In production, this would come from a database.
 */
export const portfolioData: Stock[] = [
  // Technology Sector
  {
    id: '1',
    name: 'Tata Consultancy Services',
    symbol: 'TCS',
    nseCode: 'TCS',
    bseCode: '532540',
    sector: 'Technology',
    purchasePrice: 3200,
    quantity: 10,
  },
  {
    id: '2',
    name: 'Infosys Ltd',
    symbol: 'INFY',
    nseCode: 'INFY',
    bseCode: '500209',
    sector: 'Technology',
    purchasePrice: 1450,
    quantity: 25,
  },
  {
    id: '3',
    name: 'Wipro Ltd',
    symbol: 'WIPRO',
    nseCode: 'WIPRO',
    bseCode: '507685',
    sector: 'Technology',
    purchasePrice: 420,
    quantity: 50,
  },
  
  // Banking Sector
  {
    id: '4',
    name: 'HDFC Bank',
    symbol: 'HDFCBANK',
    nseCode: 'HDFCBANK',
    bseCode: '500180',
    sector: 'Banking',
    purchasePrice: 1580,
    quantity: 15,
  },
  {
    id: '5',
    name: 'ICICI Bank',
    symbol: 'ICICIBANK',
    nseCode: 'ICICIBANK',
    bseCode: '532174',
    sector: 'Banking',
    purchasePrice: 920,
    quantity: 30,
  },
  {
    id: '6',
    name: 'State Bank of India',
    symbol: 'SBIN',
    nseCode: 'SBIN',
    bseCode: '500112',
    sector: 'Banking',
    purchasePrice: 580,
    quantity: 40,
  },
  
  // Pharma Sector
  {
    id: '7',
    name: 'Sun Pharmaceutical',
    symbol: 'SUNPHARMA',
    nseCode: 'SUNPHARMA',
    bseCode: '524715',
    sector: 'Pharmaceuticals',
    purchasePrice: 1120,
    quantity: 20,
  },
  {
    id: '8',
    name: 'Dr. Reddy\'s Laboratories',
    symbol: 'DRREDDY',
    nseCode: 'DRREDDY',
    bseCode: '500124',
    sector: 'Pharmaceuticals',
    purchasePrice: 5200,
    quantity: 5,
  },
  
  // Energy Sector
  {
    id: '9',
    name: 'Reliance Industries',
    symbol: 'RELIANCE',
    nseCode: 'RELIANCE',
    bseCode: '500325',
    sector: 'Energy',
    purchasePrice: 2450,
    quantity: 12,
  },
  {
    id: '10',
    name: 'ONGC',
    symbol: 'ONGC',
    nseCode: 'ONGC',
    bseCode: '500312',
    sector: 'Energy',
    purchasePrice: 165,
    quantity: 100,
  },
  
  // Consumer Goods
  {
    id: '11',
    name: 'Hindustan Unilever',
    symbol: 'HINDUNILVR',
    nseCode: 'HINDUNILVR',
    bseCode: '500696',
    sector: 'Consumer Goods',
    purchasePrice: 2580,
    quantity: 8,
  },
  {
    id: '12',
    name: 'ITC Ltd',
    symbol: 'ITC',
    nseCode: 'ITC',
    bseCode: '500875',
    sector: 'Consumer Goods',
    purchasePrice: 420,
    quantity: 60,
  },
];
