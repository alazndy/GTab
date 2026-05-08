## 2023-10-27 - Preventing Unnecessary Re-renders in Interval Components
**Learning:** A `setInterval` that blindly updates state with `new Date()` causes full component re-renders every second, even if the displayed time (e.g., hours and minutes only) hasn't changed. In interval-based components, React will re-render if the state reference changes, wasting CPU cycles on unnecessary DOM diffing when the visual output remains identical.
**Action:** Use functional state updates (`setState(prev => ...)`) and return the exact `prev` state reference when the derived displayed value (minutes or seconds) remains the same to safely abort the React render cycle.

## 2025-03-09 - Replace .map() with point updates for React state arrays
**Learning:** For updating single items in small React state arrays (e.g., layout configurations or task lists), using `array.map()` introduces significant performance overhead by iterating through the entire array and calling the callback for every element. This causes unnecessary processing.
**Action:** Prefer "point updates" using `findIndex` and array spreading over `array.map()`. This minimizes object allocations and improves fluidity, especially on lower-power devices.

## 2025-03-09 - Adding comments to React.memo
**Learning:** Adding comments *within* the code (e.g. above `React.memo`) explaining *why* an optimization is made is a strict requirement for the 'Bolt' persona. Merely returning a `displayName` isn't enough context for future maintainers as to *why* the component was memoized in the first place (e.g. "To prevent re-rendering during drag-and-drop global state changes").
**Action:** Always add an explanatory block comment directly above the `React.memo` or memoized function detailing the specific performance problem it solves.

## 2025-03-09 - Node TS Runner and TSX
**Learning:** Node's `--experimental-transform-types` flag currently only handles stripping types from `.ts` files natively. It does not support `.tsx` (JSX) syntax out of the box and throws an `ERR_UNKNOWN_FILE_EXTENSION`.
**Action:** When trying to mock or render React components for isolated benchmarks, either compile them first, or use a mocked `.cjs` file that just increments counters, instead of relying on Node's experimental loader to parse JSX.
