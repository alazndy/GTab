## 2023-10-27 - Preventing Unnecessary Re-renders in Interval Components
**Learning:** A `setInterval` that blindly updates state with `new Date()` causes full component re-renders every second, even if the displayed time (e.g., hours and minutes only) hasn't changed. In interval-based components, React will re-render if the state reference changes, wasting CPU cycles on unnecessary DOM diffing when the visual output remains identical.
**Action:** Use functional state updates (`setState(prev => ...)`) and return the exact `prev` state reference when the derived displayed value (minutes or seconds) remains the same to safely abort the React render cycle.

## 2025-03-09 - Replace .map() with point updates for React state arrays
**Learning:** For updating single items in small React state arrays (e.g., layout configurations or task lists), using `array.map()` introduces significant performance overhead by iterating through the entire array and calling the callback for every element. This causes unnecessary processing.
**Action:** Prefer "point updates" using `findIndex` and array spreading over `array.map()`. This minimizes object allocations and improves fluidity, especially on lower-power devices.

## 2025-03-10 - Consolidating derivations in useMemo hooks
**Learning:** When deriving multiple unique sets of data from a single large source array (like extracting both unique categories and unique profile names from a shortcuts list), using separate `useMemo` hooks with declarative methods like `.map()`, `.flatMap()`, and `Set` constructors causes multiple independent iterations over the entire list and creates numerous intermediate arrays.
**Action:** Consolidate derivations that depend on the same source data into a single `useMemo` block utilizing a single `for...of` loop. This avoids multiple iterations, minimizes intermediate array allocations, and reduces overall processing time, significantly improving performance when the source array grows.
