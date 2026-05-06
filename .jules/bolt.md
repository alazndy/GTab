## 2023-10-27 - Preventing Unnecessary Re-renders in Interval Components
**Learning:** A `setInterval` that blindly updates state with `new Date()` causes full component re-renders every second, even if the displayed time (e.g., hours and minutes only) hasn't changed. In interval-based components, React will re-render if the state reference changes, wasting CPU cycles on unnecessary DOM diffing when the visual output remains identical.
**Action:** Use functional state updates (`setState(prev => ...)`) and return the exact `prev` state reference when the derived displayed value (minutes or seconds) remains the same to safely abort the React render cycle.

## 2025-03-09 - Pointless Micro-optimizations for Small Arrays
**Learning:** Replacing declarative `Array.map()` calls with imperative array spreading and `findIndex` updates for small React state arrays (e.g., < 15 items like layout configurations) provides zero measurable performance benefit. It actively worsens code readability and violates optimization philosophies. Speed without correctness and readability is useless.
**Action:** Do not micro-optimize array operations unless they are proven bottlenecks by profiling, and the arrays contain hundreds or thousands of elements. For small arrays, prefer concise, readable code.
