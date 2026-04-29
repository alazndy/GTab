import { StockQuote } from '../types';

export const fetchStockQuote = async (symbol: string, apiKey: string): Promise<StockQuote> => {
  // Use Alpha Vantage GLOBAL_QUOTE API for high reliability
  const normalizedSymbol = symbol.toUpperCase().replace('/', '');
  const key = apiKey || '4QO8AQO0Y6B6NIPI'; // Use provided key as default
  
  try {
    const response = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${normalizedSymbol}&apikey=${key}`);
    
    if (!response.ok) {
      throw new Error(`Alpha Vantage API Error for ${normalizedSymbol}`);
    }
    
    const data = await response.json();
    const quote = data['Global Quote'];
    
    if (!quote || Object.keys(quote).length === 0) {
      // Fallback to Yahoo if Alpha Vantage fails (limit reached or invalid symbol)
      console.warn(`Alpha Vantage failed for ${normalizedSymbol}, trying Yahoo fallback...`);
      return fetchYahooFallback(normalizedSymbol);
    }

    return {
      c: parseFloat(quote['05. price']),
      d: parseFloat(quote['09. change']),
      dp: parseFloat(quote['10. change percent'].replace('%', '')),
      h: parseFloat(quote['03. high']),
      l: parseFloat(quote['04. low']),
      o: parseFloat(quote['02. open']),
      pc: parseFloat(quote['08. previous close']),
      t: Math.floor(Date.now() / 1000)
    };
  } catch (error) {
    console.error('Stock Fetch Error:', error);
    return fetchYahooFallback(normalizedSymbol);
  }
};

const fetchYahooFallback = async (symbol: string): Promise<StockQuote> => {
  const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=2d&interval=1d`);
  const data = await response.json();
  const result = data.chart?.result?.[0];
  if (!result || !result.meta) throw new Error(`Sembol bulunamadı: ${symbol}`);
  
  const meta = result.meta;
  const currentPrice = meta.regularMarketPrice;
  const previousClose = meta.previousClose || currentPrice;
  
  return {
    c: currentPrice,
    d: currentPrice - previousClose,
    dp: ((currentPrice - previousClose) / previousClose) * 100,
    h: meta.regularMarketDayHigh || currentPrice,
    l: meta.regularMarketDayLow || currentPrice,
    o: currentPrice,
    pc: previousClose,
    t: Math.floor(Date.now() / 1000)
  };
};
