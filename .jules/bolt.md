## 2023-10-27 - Preventing Unnecessary Re-renders in Interval Components
**Learning:** A `setInterval` that blindly updates state with `new Date()` causes full component re-renders every second, even if the displayed time (e.g., hours and minutes only) hasn't changed. In interval-based components, React will re-render if the state reference changes, wasting CPU cycles on unnecessary DOM diffing when the visual output remains identical.
**Action:** Use functional state updates (`setState(prev => ...)`) and return the exact `prev` state reference when the derived displayed value (minutes or seconds) remains the same to safely abort the React render cycle.

## 2025-03-09 - Replace .map() with point updates for React state arrays
**Learning:** For updating single items in small React state arrays (e.g., layout configurations or task lists), using `array.map()` introduces significant performance overhead by iterating through the entire array and calling the callback for every element. This causes unnecessary processing.
**Action:** Prefer "point updates" using `findIndex` and array spreading over `array.map()`. This minimizes object allocations and improves fluidity, especially on lower-power devices.

## 2025-03-10 - Consolidating derivations to minimize array iterations
**Learning:** Deriving multiple sets of data (like categories and profiles) from a single large array using chained declarative methods (`.map()`, `.flatMap()`, `Set`) inside multiple `useMemo` hooks introduces significant overhead due to multiple passes and intermediate allocations.
**Action:** Consolidate these calculations into a single `useMemo` hook using a single `for` or `for...of` loop. This minimizes iterations over the source data and avoids expensive intermediate object creation, improving render performance.
