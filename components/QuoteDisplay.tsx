import React, { useEffect, useState } from 'react';
import { getDailyQuote } from '../services/quoteService';
import { Quote } from '../types';

const QuoteDisplay: React.FC = () => {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const q = await getDailyQuote();
        setQuote(q);
      } catch (error) {
        console.error('QuoteDisplay error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuote();
  }, []);

  if (loading || !quote) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[40] pointer-events-auto">
      <div 
        className="group relative px-6 py-2.5 rounded-full transition-all duration-500
                   bg-white/[0.03] backdrop-blur-[2px] border border-white/[0.05]
                   hover:bg-white/[0.08] hover:backdrop-blur-md hover:border-white/[0.12]
                   opacity-40 hover:opacity-100 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]
                   cursor-default select-none flex items-center gap-2 max-w-[90vw]"
      >
        <p className="text-[13px] font-light tracking-wide text-white/90 italic truncate">
          "{quote.q}"
        </p>
        <span className="w-0 overflow-hidden whitespace-nowrap opacity-0 group-hover:w-auto group-hover:opacity-100 transition-all duration-500 text-[11px] font-medium uppercase tracking-[0.1em] text-white/50 not-italic">
          — {quote.a}
        </span>
      </div>
    </div>
  );
};

export default QuoteDisplay;
