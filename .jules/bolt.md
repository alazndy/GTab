## 2024-05-20 - [Optimize render paths by caching directly in App component]
**Learning:** Using `useMemo` for array operations inside the component body, such as filtering, finding elements or making map lookups can measurably speed up React renders when dependencies don't change frequently.
**Action:** When finding optimization opportunities, look for array filter/find logic in the component body that can be memoized using `useMemo`.
