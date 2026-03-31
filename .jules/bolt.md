
## 2024-05-20 - Memoizing Render Computations
**Learning:** In complex React components, expensive array iterations (like mappings or filtering) inside `switch-case` rendering helpers run on *every* render, significantly impacting performance when the application state updates frequently.
**Action:** Extract heavy derivations to the top-level of the component and wrap them in `useMemo` hooks, ensuring the dependencies are accurate and that the component leverages memoization optimally instead of recalculating on every layout iteration.
