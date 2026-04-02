const { performance } = require('perf_hooks');

// Generate mock data
const NUM_SHORTCUTS = 1000;
const shortcuts = Array.from({ length: NUM_SHORTCUTS }, (_, i) => ({
    id: `shortcut-${i}`,
    category: `Category-${i % 10}`,
    profiles: Array.from({ length: 3 }, (_, j) => ({ name: `Profile-${(i + j) % 20}` })),
    isFolder: i % 10 === 0
}));

const layout = [
    { id: 'clock', visible: true, order: 0 },
    { id: 'search', visible: true, order: 1 },
    { id: 'tasks', visible: true, order: 2 },
    { id: 'categories', visible: true, order: 3 },
    { id: 'shortcuts', visible: true, order: 4 },
];

const filterCategory = 'Category-5';
const filterProfile = 'Profile-10';
const activeFolderId = 'shortcut-50';

const NUM_RENDERS = 1000;

function runBaseline() {
    const start = performance.now();

    for (let i = 0; i < NUM_RENDERS; i++) {
        const activeCategories = ['All', ...new Set(shortcuts.map(s => s.category))];
        const uniqueProfiles = Array.from(new Set(shortcuts.flatMap(s => s.profiles?.map(p => p.name) || []))).sort();

        const filteredShortcuts = shortcuts.filter(s => {
            const matchesCategory = filterCategory === 'All' || s.category === filterCategory;
            const matchesProfile = filterProfile === 'All' || (s.profiles && s.profiles.some(p => p.name === filterProfile));
            return matchesCategory && matchesProfile;
        });

        const tasksConfig = layout.find(w => w.id === 'tasks');
        const mainWidgets = layout.filter(w => w.id !== 'tasks');
        const activeFolder = shortcuts.find(s => s.id === activeFolderId);
    }

    const end = performance.now();
    console.log(`Baseline (unmemoized) for ${NUM_RENDERS} renders: ${(end - start).toFixed(2)} ms`);
}

function runOptimized() {
    const start = performance.now();

    // Simulate useMemo by evaluating once outside the render loop
    const activeCategories = ['All', ...new Set(shortcuts.map(s => s.category))];
    const uniqueProfiles = Array.from(new Set(shortcuts.flatMap(s => s.profiles?.map(p => p.name) || []))).sort();

    const filteredShortcuts = shortcuts.filter(s => {
        const matchesCategory = filterCategory === 'All' || s.category === filterCategory;
        const matchesProfile = filterProfile === 'All' || (s.profiles && s.profiles.some(p => p.name === filterProfile));
        return matchesCategory && matchesProfile;
    });

    const tasksConfig = layout.find(w => w.id === 'tasks');
    const mainWidgets = layout.filter(w => w.id !== 'tasks');
    const activeFolder = shortcuts.find(s => s.id === activeFolderId);

    for (let i = 0; i < NUM_RENDERS; i++) {
        // Render loop uses the memoized values
        const a = activeCategories;
        const b = uniqueProfiles;
        const c = filteredShortcuts;
        const d = tasksConfig;
        const e = mainWidgets;
        const f = activeFolder;
    }

    const end = performance.now();
    console.log(`Optimized (memoized) for ${NUM_RENDERS} renders: ${(end - start).toFixed(2)} ms`);
}

runBaseline();
runOptimized();
