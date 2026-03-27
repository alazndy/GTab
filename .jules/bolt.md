## 2025-03-27 - Memoize Favicon URLs in ShortcutCard
**Learning:** Calling `new URL()` repeatedly inside a React component's render function (like `ShortcutCard`) is an expensive operation that degrades performance, especially with many items or frequent re-renders.
**Action:** Extract expensive string-parsing and URL-parsing operations into a module-level cache (e.g., `new Map()`) so results are computed once per unique input.
