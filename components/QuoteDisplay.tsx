import React, { useEffect, useState } from 'react';
import { getDailyQuote, FALLBACK_QUOTE } from '../services/quoteService';
import { Quote } from '../types';

const QuoteDisplay: React.FC = () => {
  const [quote, setQuote] = useState<Quote>(FALLBACK_QUOTE);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const q = await getDailyQuote();
        setQuote(q);
      } catch (error) {
        console.error('QuoteDisplay error:', error);
      }
    };
    fetchQuote();
  }, []);

  if (!quote) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[40] pointer-events-auto">
      <div 
        className="group relative px-6 py-2 rounded-full transition-all duration-700
                   bg-white/[0.02] backdrop-blur-[1px] border border-white/[0.03]
                   hover:bg-white/[0.08] hover:backdrop-blur-md hover:border-white/[0.12]
                   opacity-30 hover:opacity-100 hover:shadow-[0_0_25px_rgba(255,255,255,0.04)]
                   cursor-default select-none flex items-center gap-2 max-w-[90vw]"
      >
        <p className="text-[12px] font-light tracking-wide text-white/80 italic truncate">
          "{quote.q}"
        </p>
        <span className="w-0 overflow-hidden whitespace-nowrap opacity-0 group-hover:w-auto group-hover:opacity-100 transition-all duration-500 text-[10px] font-medium uppercase tracking-[0.15em] text-white/40 not-italic">
          — {quote.a}
        </span>
      </div>
    </div>
  );
};

export default QuoteDisplay;
