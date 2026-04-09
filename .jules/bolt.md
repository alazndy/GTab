## 2024-05-20 - Array operations in render scope
**Learning:** Performing O(N) array operations (like filtering, mapping, and Set creation) directly inside `renderWidgetContent` or the render loop causes excessive recalculations on every single render, which is particularly problematic for drag-and-drop operations where re-renders happen rapidly.
**Action:** Always move derived state computations (like unique categories, profiles, and filtered lists) to the top level of the component and wrap them in `useMemo` so they only recalculate when their dependencies change.
