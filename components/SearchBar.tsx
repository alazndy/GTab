
import React, { useState, useRef } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    // Create a temporary link and click it for better extension compatibility
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    const link = document.createElement('a');
    link.href = searchUrl;
    link.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-12 animate-slide-up group relative z-50">
      <form ref={formRef} onSubmit={handleSubmit} className="relative flex items-center">
        <MagnifyingGlassIcon className="absolute left-4 w-6 h-6 text-white/70 transition-colors group-focus-within:text-white" />
        
        <input
          id="search-query"
          name="q"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Web'de ara..."
          autoComplete="off"
          className="w-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-lg placeholder-white/60 py-4 pl-14 pr-6 outline-none focus:bg-white/20 focus:border-white/40 transition-all shadow-lg rounded-full"
        />
      </form>
    </div>
  );
};

export default SearchBar;