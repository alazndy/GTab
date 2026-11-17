import React, { useState, useEffect, useCallback } from 'react';
import { ChartBarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { StockQuote } from '../types';
import { fetchStockQuote } from '../services/finnhubService';
import { useGTab } from '../context/GTabContext';

const CACHE_KEY = 'gtab_stocks_cache';
// Alpha Vantage free keys allow 25 requests per day, and every new tab mounts this widget.
const CACHE_TTL = 30 * 60 * 1000;

interface QuoteCache {
  key: string;
  at: number;
  quotes: Record<string, StockQuote>;
}

const readCache = (key: string): Record<string, StockQuote> | null => {
  try {
    const cache: QuoteCache = JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null');
    if (cache && cache.key === key && Date.now() - cache.at < CACHE_TTL) return cache.quotes;
  } catch {
    // Corrupt cache: fetch again.
  }
  return null;
};

const writeCache = (key: string, quotes: Record<string, StockQuote>) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ key, at: Date.now(), quotes }));
  } catch {
    // Storage full: the next tab fetches again.
  }
};

const StocksWidget: React.FC = () => {
  const { stocksConfig } = useGTab();
  const { apiKey, symbols } = stocksConfig;
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const symbolsKey = symbols.join(',');
  const cacheKey = `${symbolsKey}|${apiKey ? 'av' : 'yahoo'}`;

  const loadQuotes = useCallback(async (force = false) => {
    if (!force) {
      const cached = readCache(cacheKey);
      if (cached) {
        setQuotes(cached);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    setError(null);
    const results: Record<string, StockQuote> = {};
    await Promise.all(
      symbolsKey.split(',').filter(Boolean).map(async (symbol) => {
        try {
          results[symbol] = await fetchStockQuote(symbol, apiKey);
        } catch (e) {
          console.error(`Failed to fetch ${symbol}`, e);
        }
      })
    );
    if (symbolsKey && Object.keys(results).length === 0) {
      setError('Hisse bilgileri yüklenemedi.');
    } else {
      writeCache(cacheKey, results);
    }
    setQuotes(results);
    setLoading(false);
  }, [apiKey, symbolsKey, cacheKey]);

  useEffect(() => {
    // Settings update the symbol list on every keystroke; wait until typing stops before fetching.
    const delay = readCache(cacheKey) ? 0 : 800;
    const start = setTimeout(() => loadQuotes(), delay);
    const interval = setInterval(() => loadQuotes(), CACHE_TTL);
    return () => {
      clearTimeout(start);
      clearInterval(interval);
    };
  }, [loadQuotes, cacheKey]);

  return (
    <div className="w-full h-full animate-slide-up">
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2 text-white">
            <ChartBarIcon className="w-4 h-4 text-green-400" />
            <span className="font-medium text-sm">Borsa</span>
          </div>
          <button 
            onClick={() => loadQuotes(true)}
            className="text-white/30 hover:text-green-300 transition-colors"
            title="Yenile"
          >
            <ArrowPathIcon className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {error ? (
            <div className="text-center py-6 text-red-400/60 text-xs italic">
              {error}
            </div>
          ) : loading && Object.keys(quotes).length === 0 ? (
            <div className="text-center py-6 text-white/20 text-xs italic">
              Yükleniyor...
            </div>
          ) : symbols.length === 0 ? (
            <div className="text-center py-6 text-white/20 text-xs italic">
              Takip edilen hisse yok.
            </div>
          ) : (
            symbols.map(symbol => {
              const quote = quotes[symbol];
              if (!quote) return null;

              const isPositive = quote.d >= 0;

              return (
                <div 
                  key={symbol} 
                  className="group flex items-center justify-between p-2 rounded-md hover:bg-white/5 transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white/90">{symbol}</span>
                    <span className="text-[10px] text-white/40">{quote.source}</span>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-xs font-medium text-white">
                      ${quote.c.toFixed(2)}
                    </span>
                    <div className={`flex items-center gap-0.5 text-[10px] ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                      {isPositive ? <ArrowTrendingUpIcon className="w-2.5 h-2.5" /> : <ArrowTrendingDownIcon className="w-2.5 h-2.5" />}
                      <span>{isPositive ? '+' : ''}{quote.d.toFixed(2)} ({quote.dp.toFixed(2)}%)</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default StocksWidget;
