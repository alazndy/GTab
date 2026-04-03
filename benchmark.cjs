const { performance } = require('perf_hooks');

// Mock data
const generateShortcuts = (count) => {
    return Array.from({ length: count }, (_, i) => ({
        id: `shortcut-${i}`,
        category: `Category-${i % 5}`,
        profiles: [{ name: `Profile-${i % 3}` }, { name: `Profile-${(i+1) % 3}` }],
        title: `Shortcut ${i}`
    }));
};

const layout = [
    { id: 'clock', visible: true, order: 0 },
    { id: 'search', visible: true, order: 1 },
    { id: 'tasks', visible: true, order: 2 },
    { id: 'categories', visible: true, order: 3 },
    { id: 'shortcuts', visible: true, order: 4 },
];

const shortcuts = generateShortcuts(1000); // simulate 1000 shortcuts
const filterCategory = 'Category-1';
const filterProfile = 'Profile-2';

const iterations = 1000; // 1000 renders

// Baseline (every render)
const startBaseline = performance.now();
for (let i = 0; i < iterations; i++) {
    const tasksConfig = layout.find(w => w.id === 'tasks');
    const mainWidgets = layout.filter(w => w.id !== 'tasks');
    const activeCategories = ['All', ...new Set(shortcuts.map(s => s.category))];
    const uniqueProfiles = Array.from(new Set(shortcuts.flatMap(s => s.profiles?.map(p => p.name) || []))).sort();
    const filteredShortcuts = shortcuts.filter(s => {
        const matchesCategory = filterCategory === 'All' || s.category === filterCategory;
        const matchesProfile = filterProfile === 'All' || (s.profiles && s.profiles.some(p => p.name === filterProfile));
        return matchesCategory && matchesProfile;
    });
}
const endBaseline = performance.now();

// Optimized (memoized)
const startOptimized = performance.now();
let cachedTasksConfig = null;
let cachedMainWidgets = null;
let cachedActiveCategories = null;
let cachedUniqueProfiles = null;
let cachedFilteredShortcuts = null;

for (let i = 0; i < iterations; i++) {
    if (i === 0) { // simulate first render
        cachedTasksConfig = layout.find(w => w.id === 'tasks');
        cachedMainWidgets = layout.filter(w => w.id !== 'tasks');
        cachedActiveCategories = ['All', ...new Set(shortcuts.map(s => s.category))];
        cachedUniqueProfiles = Array.from(new Set(shortcuts.flatMap(s => s.profiles?.map(p => p.name) || []))).sort();
        cachedFilteredShortcuts = shortcuts.filter(s => {
            const matchesCategory = filterCategory === 'All' || s.category === filterCategory;
            const matchesProfile = filterProfile === 'All' || (s.profiles && s.profiles.some(p => p.name === filterProfile));
            return matchesCategory && matchesProfile;
        });
    }
    const tasksConfig = cachedTasksConfig;
    const mainWidgets = cachedMainWidgets;
    const activeCategories = cachedActiveCategories;
    const uniqueProfiles = cachedUniqueProfiles;
    const filteredShortcuts = cachedFilteredShortcuts;
}
const endOptimized = performance.now();

console.log(`Baseline (no memo): ${(endBaseline - startBaseline).toFixed(2)}ms`);
console.log(`Optimized (memo): ${(endOptimized - startOptimized).toFixed(2)}ms`);
console.log(`Improvement: ${(((endBaseline - startBaseline) - (endOptimized - startOptimized)) / (endBaseline - startBaseline) * 100).toFixed(2)}%`);