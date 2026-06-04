## 2023-10-27 - Preventing Unnecessary Re-renders in Interval Components
**Learning:** A `setInterval` that blindly updates state with `new Date()` causes full component re-renders every second, even if the displayed time (e.g., hours and minutes only) hasn't changed. In interval-based components, React will re-render if the state reference changes, wasting CPU cycles on unnecessary DOM diffing when the visual output remains identical.
**Action:** Use functional state updates (`setState(prev => ...)`) and return the exact `prev` state reference when the derived displayed value (minutes or seconds) remains the same to safely abort the React render cycle.

## 2025-03-09 - Replace .map() with point updates for React state arrays
**Learning:** For updating single items in small React state arrays (e.g., layout configurations or task lists), using `array.map()` introduces significant performance overhead by iterating through the entire array and calling the callback for every element. This causes unnecessary processing.
**Action:** Prefer "point updates" using `findIndex` and array spreading over `array.map()`. This minimizes object allocations and improves fluidity, especially on lower-power devices.

## 2025-03-09 - Consolidate Multiple Computations on the Same Array
**Learning:** When multiple unique data sets (e.g., categories and profiles) need to be derived from the same source array (e.g., `shortcuts`), using separate `useMemo` hooks with declarative operations (`map`, `flatMap`, `Set`) results in multiple iterations over the same data. This redundant processing scales poorly as array size increases and generates excessive intermediate allocations.
**Action:** Use a single `useMemo` block with a consolidated `for...of` loop to extract all necessary data in a single pass. This dramatically reduces execution time (measured ~54% faster on large arrays) and cuts down on intermediate object creation.
