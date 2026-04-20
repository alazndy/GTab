## 2024-06-25 - Cache Intl.DateTimeFormat in Ticking Clocks
**Learning:** Calling `toLocaleTimeString` or `toLocaleDateString` inside a 1000ms `setInterval` render loop introduces huge performance overhead because it re-instantiates `Intl.DateTimeFormat` on every single tick. Benchmarks show this creates a ~44x slowdown compared to caching the formatter.
**Action:** Always use `useMemo` to cache `Intl.DateTimeFormat` instances in React components that re-render frequently, especially for real-time updating components like clocks.
