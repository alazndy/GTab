import React, { useState, useEffect } from 'react';
import { ChartBarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { StockQuote } from '../types';
import { fetchStockQuote } from '../services/finnhubService';
import { getStocksConfig } from '../services/storageService';

const StocksWidget: React.FC = () => {
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { apiKey, symbols } = getStocksConfig();

  const loadQuotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const results: Record<string, StockQuote> = {};
      await Promise.all(
        symbols.map(async (symbol) => {
          try {
            const quote = await fetchStockQuote(symbol, apiKey);
            results[symbol] = quote;
          } catch (e) {
            console.error(`Failed to fetch ${symbol}`, e);
          }
        })
      );
      setQuotes(results);
    } catch (err) {
      setError('Hisse bilgileri yüklenemedi.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuotes();
    // Refresh every 30 minutes (Alpha Vantage limit is 25 per day)
    const interval = setInterval(loadQuotes, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [symbols.join(','), apiKey]);

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
            onClick={loadQuotes}
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
                    <span className="text-[10px] text-white/40">Yahoo Finance</span>
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
