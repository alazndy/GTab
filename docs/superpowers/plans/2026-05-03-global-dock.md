# Global Floating Dock Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans.

**Goal:** Transform the global status bar into a floating, collapsible mini-dock with configurable positions.

**Architecture:** 
- **Content Script:** Shadow DOM floating pill. 
- **State:** Sync dock position from GTab settings.
- **Action:** Open links in new tabs.

---

### Task 1: Update Types & Storage
**Files:**
- Modify: `types.ts`
- Modify: `services/storageService.ts`

- [ ] **Step 1:** Add `dockPosition: 'top-center' | 'bottom-center' | 'top-right'` to `AIConfig`.
- [ ] **Step 2:** Add default value `'top-center'` in `getAIConfig`.
- [ ] **Step 3:** Commit: `feat: add dock position types and defaults`

### Task 2: Settings UI for Dock Position
**Files:**
- Modify: `components/settings/DataTab.tsx`

- [ ] **Step 1:** Add a dropdown selector for "Dock Pozisyonu" in the Global/AI section.
- [ ] **Step 2:** Commit: `feat: add dock position setting to DataTab`

### Task 3: Content Script - Dock UI & Logic
**Files:**
- Modify: `src/content/index.ts`

- [ ] **Step 1:** Redesign the CSS and HTML structure to be a floating "pill" instead of a full-width bar.
- [ ] **Step 2:** Remove the "push content down" logic (no `margin-top` on body).
- [ ] **Step 3:** Implement the expansion logic (click to expand/collapse).
- [ ] **Step 4:** Implement position-based styles (Top/Bottom/Right).
- [ ] **Step 5:** Ensure links open with `window.open(url, '_blank')`.
- [ ] **Step 6:** Commit: `feat: implement floating collapsible dock in content script`

---

### Task 4: Final Polish
- [ ] **Step 1:** Build and verify on multiple websites.
- [ ] **Step 2:** Update memory.
- [ ] **Step 3:** Commit: `chore: final dock polish`
