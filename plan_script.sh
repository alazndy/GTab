#!/bin/bash
cat << 'PLAN' > plan.md
1. **Optimize `.map()` usage for React state arrays in `components/settings/WidgetsTab.tsx`**
   - In `components/settings/WidgetsTab.tsx`, `localLayout.map` is used multiple times (for updating `visible`, `showBorder`, `opacity`, and `borderOpacity`) when only a single widget item changes. This violates the performance learning logged in `.jules/bolt.md` about replacing `.map()` with point updates (using `findIndex` and array spreading) for single item updates.
   - I will replace the occurrences of `localLayout.map` in the `onClick` and `onChange` handlers with an optimized point update using `findIndex`.
2. **Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.**
   - I will check the build (`pnpm install && pnpm exec tsc --noEmit && pnpm run build && pnpm run build:store`) to verify no compilation regressions occur.
3. **Submit the PR**
   - Create a pull request using `⚡ Bolt: [performance improvement]` format as described in instructions.
PLAN
