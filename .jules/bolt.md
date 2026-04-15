## 2024-05-14 - Expensive Array Operations Inside Switch Cases
**Learning:** Found array operations inside a render switch-case (`renderWidgetContent`). Because it's within a function called during render, moving these specific computations out and using `React.useMemo` significantly reduces unnecessary recalcs, especially when they rely on complex iterative updates.
**Action:** When inspecting generic top-level component functions returning JSX (like `renderWidgetContent`), extract iterative computations to the top level and strictly memoize them with correct dependencies.
