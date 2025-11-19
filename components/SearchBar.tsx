import React, { useState } from 'react';
import { Search } from 'lucide-react';

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-12 animate-slide-up group relative z-50">
      <form onSubmit={handleSearch} className="relative flex items-center">
        <Search className="absolute left-4 text-white/70 w-6 h-6 transition-colors group-focus-within:text-white" />
        
        <input
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