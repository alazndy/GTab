import { StockQuote } from '../types';

export const fetchStockQuote = async (symbol: string, apiKey: string): Promise<StockQuote> => {
  if (!apiKey) throw new Error('Finnhub API key is required');
  
  const normalizedSymbol = symbol.toUpperCase();
  const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${normalizedSymbol}&token=${apiKey}`);
  
  if (!response.ok) {
    throw new Error(`Finnhub API Error for ${normalizedSymbol}: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Finnhub returns 0s for invalid symbols instead of 404/Error
  if (data.c === 0 && data.t === 0) {
    throw new Error(`Invalid stock symbol: ${normalizedSymbol}`);
  }
  
  return data;
};
