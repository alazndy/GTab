## 2024-05-24 - [Intl.DateTimeFormat in React Render Loop]
**Learning:** `toLocaleTimeString` and `toLocaleDateString` re-instantiate `Intl.DateTimeFormat` internally on every call. In a component like a ticking `Clock` that renders every second, this leads to significant performance overhead (over 60x slower in tight loops).
**Action:** Always cache `Intl.DateTimeFormat` instances using `useMemo` in React components that format dates/times frequently, instead of using the inline `toLocaleTimeString` and `toLocaleDateString` methods.
