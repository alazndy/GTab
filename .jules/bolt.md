## 2023-10-27 - Memoize expensive calculations inside render helpers
**Learning:** React re-renders can be slow when complex array manipulations (like creating sets and filtering lists) are performed in the render phase, specially within helper functions called inside the render method.
**Action:** Extract these calculations to the top level of the functional component and wrap them in `useMemo` with appropriate dependencies to only recalculate when necessary.
