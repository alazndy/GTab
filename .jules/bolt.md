## 2023-10-27 - Preventing Unnecessary Re-renders in Interval Components
**Learning:** A `setInterval` that blindly updates state with `new Date()` causes full component re-renders every second, even if the displayed time (e.g., hours and minutes only) hasn't changed. In interval-based components, React will re-render if the state reference changes, wasting CPU cycles on unnecessary DOM diffing when the visual output remains identical.
**Action:** Use functional state updates (`setState(prev => ...)`) and return the exact `prev` state reference when the derived displayed value (minutes or seconds) remains the same to safely abort the React render cycle.

## 2025-03-09 - Replace .map() with point updates for React state arrays
**Learning:** For updating single items in small React state arrays (e.g., layout configurations or task lists), using `array.map()` introduces significant performance overhead by iterating through the entire array and calling the callback for every element. This causes unnecessary processing.
**Action:** Prefer "point updates" using `findIndex` and array spreading over `array.map()`. This minimizes object allocations and improves fluidity, especially on lower-power devices.

## 2025-03-09 - Memoizing AppBackground for global state updates
**Learning:** During frequent global state updates like drag-and-drop interactions or opening/closing modals, the top-level application component (`App.tsx`) re-renders repeatedly. Large, relatively static background components like `AppBackground` will re-render alongside it, causing expensive DOM diffing and potentially jank.
**Action:** Wrap large, visually complex background or layout components in `React.memo` to prevent re-renders when their props haven't changed, freeing up CPU cycles for the core interaction (like drag and drop). Assign a `displayName` when using inline arrow functions.
