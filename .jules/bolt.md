## 2023-10-27 - Preventing Unnecessary Re-renders in Interval Components
**Learning:** A `setInterval` that blindly updates state with `new Date()` causes full component re-renders every second, even if the displayed time (e.g., hours and minutes only) hasn't changed. In interval-based components, React will re-render if the state reference changes, wasting CPU cycles on unnecessary DOM diffing when the visual output remains identical.
**Action:** Use functional state updates (`setState(prev => ...)`) and return the exact `prev` state reference when the derived displayed value (minutes or seconds) remains the same to safely abort the React render cycle.

## 2025-03-09 - Replace .map() with point updates for React state arrays
**Learning:** For updating single items in small React state arrays (e.g., layout configurations or task lists), using `array.map()` introduces significant performance overhead by iterating through the entire array and calling the callback for every element. This causes unnecessary processing.
**Action:** Prefer "point updates" using `findIndex` and array spreading over `array.map()`. This minimizes object allocations and improves fluidity, especially on lower-power devices.

## 2025-03-09 - Combine array iterations when deriving multiple distinct sets of data
**Learning:** When deriving multiple distinct pieces of UI state (like active categories and unique profiles) from a single source array, using separate `useMemo` hooks with chained array methods (`.map`, `.flatMap`) iterates over the data multiple times, creating intermediate arrays and increasing time complexity.
**Action:** Consolidate these calculations into a single `useMemo` block that iterates over the source array precisely once using a `for...of` or standard `for` loop, updating all required `Set`s or accumulators simultaneously. This minimizes iterations and intermediate allocations.
