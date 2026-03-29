## 2025-03-29 - [Optimized React derived state calculation]
**Learning:** Found that moving expensive array and mapping operations out of `renderWidgetContent` into unconditionally run `useMemo` hooks significantly optimizes rendering passes. Additionally, dragging and dropping callbacks inside deeply nested components needed `useCallback` to prevent frequent unneeded re-rendering.
**Action:** Apply `useMemo` at the top level of function components and `useCallback` for functions passed as props to avoid inline hook violations and unnecessary re-renders.
