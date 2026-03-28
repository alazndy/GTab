## 2024-05-18 - [ShortcutCard Re-renders Fixed]
**Learning:** Even if `ShortcutCard` uses `React.memo`, passing inline arrow functions for callbacks (like `onEdit={(s) => setEditingShortcut(s)}`) causes `ShortcutCard` to re-render whenever its parent (`App`) renders, which scales poorly when mapping over a large number of shortcuts.
**Action:** Always wrap event handlers passed to memoized components in lists with `React.useCallback` or pass stable references (like `setEditingShortcut` directly) to maintain referential equality.
