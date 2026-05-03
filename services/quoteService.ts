import { Quote, QuoteCache } from '../types';

const QUOTE_CACHE_KEY = 'gtab_daily_quote';
export const FALLBACK_QUOTE: Quote = {
  q: "The only way to do great work is to love what you do.",
  a: "Steve Jobs",
  h: "<blockquote>&ldquo;The only way to do great work is to love what you do.&rdquo; &mdash; <cite>Steve Jobs</cite></blockquote>"
};

const isToday = (dateString: string): boolean => {
  const today = new Date().toISOString().split('T')[0];
  const cachedDate = dateString.split('T')[0];
  return today === cachedDate;
};

export const getDailyQuote = async (): Promise<Quote> => {
  try {
    // 1. Check Cache
    const cached = localStorage.getItem(QUOTE_CACHE_KEY);
    if (cached) {
      const parsed: QuoteCache = JSON.parse(cached);
      if (isToday(parsed.lastFetched)) {
        return parsed.quote;
      }
    }

    // 2. Fetch New
    const response = await fetch('https://zenquotes.io/api/today');
    
    if (!response.ok) {
      throw new Error(`ZenQuotes API error: ${response.status}`);
    }

    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      const quote = data[0] as Quote;
      
      // 3. Update Cache
      const newCache: QuoteCache = {
        quote,
        lastFetched: new Date().toISOString()
      };
      localStorage.setItem(QUOTE_CACHE_KEY, JSON.stringify(newCache));
      
      return quote;
    }

    throw new Error('Invalid response format from ZenQuotes');
  } catch (error) {
    console.error('Failed to fetch daily quote:', error);
    
    // Return cached quote even if expired if we can't fetch new
    const cached = localStorage.getItem(QUOTE_CACHE_KEY);
    if (cached) {
      try {
        return JSON.parse(cached).quote;
      } catch (e) {
        // Ignore parse error
      }
    }
    
    return FALLBACK_QUOTE;
  }
};
