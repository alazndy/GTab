const { performance } = require('perf_hooks');

// Mock data
const NUM_SHORTCUTS = 1000;
const shortcuts = Array.from({ length: NUM_SHORTCUTS }, (_, i) => ({
  id: `id-${i}`,
  category: `Category-${i % 20}`,
  profiles: [{ name: `Profile-${i % 5}` }],
  isFolder: false,
}));

const filterCategory = 'All';
const filterProfile = 'All';

function simulateRenderUnoptimized() {
  const activeCategories = ['All', ...new Set(shortcuts.map(s => s.category))];
  const uniqueProfiles = Array.from(new Set(shortcuts.flatMap(s => s.profiles?.map(p => p.name) || []))).sort();
  const filteredShortcuts = shortcuts.filter(s => {
      const matchesCategory = filterCategory === 'All' || s.category === filterCategory;
      const matchesProfile = filterProfile === 'All' || (s.profiles && s.profiles.some(p => p.name === filterProfile));
      return matchesCategory && matchesProfile;
  });
  return { activeCategories, uniqueProfiles, filteredShortcuts };
}

let memoizedResult = null;
function simulateRenderOptimized() {
  if (!memoizedResult) {
    const activeCategories = ['All', ...new Set(shortcuts.map(s => s.category))];
    const uniqueProfiles = Array.from(new Set(shortcuts.flatMap(s => s.profiles?.map(p => p.name) || []))).sort();
    const filteredShortcuts = shortcuts.filter(s => {
        const matchesCategory = filterCategory === 'All' || s.category === filterCategory;
        const matchesProfile = filterProfile === 'All' || (s.profiles && s.profiles.some(p => p.name === filterProfile));
        return matchesCategory && matchesProfile;
    });
    memoizedResult = { activeCategories, uniqueProfiles, filteredShortcuts };
  }
  return memoizedResult;
}

const ITERATIONS = 1000;

const startUnoptimized = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  simulateRenderUnoptimized();
}
const endUnoptimized = performance.now();

const startOptimized = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  simulateRenderOptimized();
}
const endOptimized = performance.now();

console.log(`Unoptimized Render Time (${ITERATIONS} iterations): ${(endUnoptimized - startUnoptimized).toFixed(2)} ms`);
console.log(`Optimized Render Time (${ITERATIONS} iterations): ${(endOptimized - startOptimized).toFixed(2)} ms`);
console.log(`Speedup: x${((endUnoptimized - startUnoptimized) / (endOptimized - startOptimized)).toFixed(2)}`);
