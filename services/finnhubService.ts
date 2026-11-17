import { StockQuote } from '../types';

/**
 * Fetches a quote from Alpha Vantage when the user set an API key, otherwise from Yahoo Finance.
 * Alpha Vantage free keys allow 25 requests per day; on limit or unknown symbol we fall back to Yahoo.
 */
export const fetchStockQuote = async (symbol: string, apiKey: string): Promise<StockQuote> => {
  const normalizedSymbol = symbol.trim().toUpperCase().replace('/', '');
  const key = apiKey.trim();
  if (!key) return fetchYahooQuote(normalizedSymbol);

  try {
    const params = new URLSearchParams({ function: 'GLOBAL_QUOTE', symbol: normalizedSymbol, apikey: key });
    const response = await fetch(`https://www.alphavantage.co/query?${params.toString()}`);
    if (!response.ok) throw new Error(`Alpha Vantage API Error for ${normalizedSymbol}`);

    const data = await response.json();
    const quote = data['Global Quote'];
    if (!quote || Object.keys(quote).length === 0) {
      return fetchYahooQuote(normalizedSymbol);
    }

    return {
      c: parseFloat(quote['05. price']),
      d: parseFloat(quote['09. change']),
      dp: parseFloat(String(quote['10. change percent']).replace('%', '')),
      h: parseFloat(quote['03. high']),
      l: parseFloat(quote['04. low']),
      o: parseFloat(quote['02. open']),
      pc: parseFloat(quote['08. previous close']),
      t: Math.floor(Date.now() / 1000),
      source: 'Alpha Vantage',
    };
  } catch (error) {
    console.error('Stock Fetch Error:', error);
    return fetchYahooQuote(normalizedSymbol);
  }
};

const fetchYahooQuote = async (symbol: string): Promise<StockQuote> => {
  const response = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=2d&interval=1d`
  );
  if (!response.ok) throw new Error(`Yahoo Finance error ${response.status} for ${symbol}`);
  const data = await response.json();
  const meta = data.chart?.result?.[0]?.meta;
  if (!meta || typeof meta.regularMarketPrice !== 'number') throw new Error(`Sembol bulunamadı: ${symbol}`);

  const currentPrice: number = meta.regularMarketPrice;
  const previousClose: number = meta.previousClose || meta.chartPreviousClose || currentPrice;

  return {
    c: currentPrice,
    d: currentPrice - previousClose,
    dp: previousClose ? ((currentPrice - previousClose) / previousClose) * 100 : 0,
    h: meta.regularMarketDayHigh || currentPrice,
    l: meta.regularMarketDayLow || currentPrice,
    o: currentPrice,
    pc: previousClose,
    t: Math.floor(Date.now() / 1000),
    source: 'Yahoo Finance',
  };
};
