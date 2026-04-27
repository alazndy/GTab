export const fetchStockQuote = async (symbol: string, apiKey: string) => {
  if (!apiKey) throw new Error('No API key');
  const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`);
  if (!response.ok) throw new Error(`Failed to fetch ${symbol}`);
  return response.json();
};
