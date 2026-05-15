## 2023-10-27 - Preventing Unnecessary Re-renders in Interval Components
**Learning:** A `setInterval` that blindly updates state with `new Date()` causes full component re-renders every second, even if the displayed time (e.g., hours and minutes only) hasn't changed. In interval-based components, React will re-render if the state reference changes, wasting CPU cycles on unnecessary DOM diffing when the visual output remains identical.
**Action:** Use functional state updates (`setState(prev => ...)`) and return the exact `prev` state reference when the derived displayed value (minutes or seconds) remains the same to safely abort the React render cycle.

## 2025-03-09 - Replace .map() with point updates for React state arrays
**Learning:** For updating single items in small React state arrays (e.g., layout configurations or task lists), using `array.map()` introduces significant performance overhead by iterating through the entire array and calling the callback for every element. This causes unnecessary processing.
**Action:** Prefer "point updates" using `findIndex` and array spreading over `array.map()`. This minimizes object allocations and improves fluidity, especially on lower-power devices.

## 2025-03-09 - Consolidate Multiple Array Iterations into Single Loop for Derived React State
**Learning:** When deriving multiple unique sets of data from a single large source array (like categories and profiles from a shortcuts list), using separate `useMemo` hooks with chained declarative array methods (`map`, `flatMap`, `Set`) results in multiple unnecessary iterations over the entire dataset and intermediate array allocations. This scales poorly with large arrays.
**Action:** Consolidate the calculations into a single `useMemo` hook and use a single imperative `for` loop to populate multiple `Set`s simultaneously. This reduces iteration count and memory overhead, yielding significant performance gains on large datasets.
