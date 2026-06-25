import React, { useMemo } from 'react';
import { useGTab } from '../context/GTabContext';
import { Category } from '../types';
import { UsersIcon } from '@heroicons/react/24/outline';

export const CategoryFilterWidget: React.FC = () => {
  const { shortcuts, filterCategory, setFilterCategory, filterProfile, setFilterProfile } = useGTab();

  const { activeCategories, uniqueProfiles } = useMemo(() => {
    const categorySet = new Set(['All']);
    const profileSet = new Set<string>();

    for (const s of shortcuts) {
      if (s.category) {
        categorySet.add(s.category);
      }
      if (s.profiles) {
        for (const p of s.profiles) {
          if (p.name) {
            profileSet.add(p.name);
          }
        }
      }
    }

    return {
      activeCategories: Array.from(categorySet),
      uniqueProfiles: Array.from(profileSet).sort()
    };
  }, [shortcuts]);

  return (
    <div className="flex flex-col gap-4 w-full mb-8 animate-fade-in">
      <div className="flex flex-wrap justify-center gap-2">
        {activeCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat as Category | 'All')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all backdrop-blur-md border border-transparent ${
              filterCategory === cat ? 'bg-white/90 text-black shadow-lg scale-105' : 'bg-black/30 text-white/70 hover:bg-white/20 hover:text-white border-white/10'
            }`}
          >
            {cat === 'All' ? 'Tümü' : cat}
          </button>
        ))}
      </div>
      {uniqueProfiles.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 items-center bg-white/5 p-2 rounded-xl border border-white/5 mx-auto w-fit backdrop-blur-sm">
           <span className="text-xs text-white/40 font-semibold px-2 uppercase tracking-wider flex items-center gap-1">
             <UsersIcon className="w-3 h-3" /> Profil:
           </span>
           <button 
              onClick={() => setFilterProfile('All')} 
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${filterProfile === 'All' ? 'bg-blue-500 text-white shadow-md' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}
           >
             Tümü
           </button>
           {uniqueProfiles.map((profile) => (
              <button 
                key={profile} 
                onClick={() => setFilterProfile(profile)} 
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${filterProfile === profile ? 'bg-blue-500 text-white shadow-md' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}
              >
                {profile}
              </button>
           ))}
        </div>
      )}
    </div>
  );
};
