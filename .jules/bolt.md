## 2024-04-17 - [Intl.DateTimeFormat Caching in Ticking Components]
**Learning:** [Inline `toLocaleTimeString` or `toLocaleDateString` re-instantiates formatters repeatedly, causing a significant performance overhead (up to ~60x slower in microbenchmarks) in components like `Clock` that have a tight, high-frequency render loop (e.g., 1-second interval).]
**Action:** [When formatting dates or times frequently in React components, especially in a tight render loop, cache `Intl.DateTimeFormat` instances using `useMemo` instead of relying on inline string methods.]
