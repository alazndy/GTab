## 2024-05-20 - [Optimize render paths by caching directly in App component]
**Learning:** Using `useMemo` for array operations inside the component body, such as filtering, finding elements or making map lookups can measurably speed up React renders when dependencies don't change frequently.
**Action:** When finding optimization opportunities, look for array filter/find logic in the component body that can be memoized using `useMemo`.

## 2024-05-24 - Expensive Array Manipulations Inside Render Maps
**Learning:** In `App.tsx`, performing O(N) array operations (like mapping to a Set, sorting, and complex filtering on user shortcuts and profiles) directly inside the `renderWidgetContent` switch statement means these operations run on *every* single app state change (such as dragging widgets, opening modals, or changing the clock). This causes significant, unnecessary re-renders in a complex UI mapping setup.
**Action:** Extract expensive list computations (categories, profiles, filtering) to the component root and wrap them in `React.useMemo` to ensure they only recalculate when their specific dependencies (`shortcuts`, `filterCategory`, `filterProfile`) actually change.
