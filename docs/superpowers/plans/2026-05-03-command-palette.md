# Command Palette UI & Logic Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a global Command Palette that combines AI chat and app actions triggered by `Ctrl+K`.

**Architecture:** A React portal component (`CommandPalette.tsx`) integrated into `App.tsx` that manages its own state for input, loading, and results. It uses the `aiService` for chat and `GTabContext` for app actions.

**Tech Stack:** React, TypeScript, Tailwind CSS, Framer Motion, Lucide React icons.

---

### Task 1: Research & Project Structure

**Files:**
- Modify: `App.tsx` (to see where to inject the palette)
- Modify: `context/GTabContext.tsx` (to identify available actions)
- Modify: `services/aiService.ts` (to verify `generateResponse` signature)

- [ ] **Step 1: Inspect `GTabContext.tsx` for actions**
Verify how to trigger pomodoro, tasks, and settings.
- [ ] **Step 2: Inspect `aiService.ts`**
Verify the signature of `generateResponse`.
- [ ] **Step 3: Check `package.json` for dependencies**
Ensure `framer-motion` and `lucide-react` are available.

---

### Task 2: Implement CommandPalette UI Skeleton (TDD)

**Files:**
- Create: `components/CommandPalette.tsx`
- Create: `components/CommandPalette.test.tsx`

- [ ] **Step 1: Write failing test for basic render**
```typescript
import { render, screen } from '@testing-library/react';
import CommandPalette from './CommandPalette';

test('renders command palette when open', () => {
  render(<CommandPalette isOpen={true} onClose={() => {}} />);
  expect(screen.getByPlaceholderText(/Type a command or ask AI/i)).toBeInTheDocument();
});
```
- [ ] **Step 2: Run test and verify failure**
- [ ] **Step 3: Implement minimal UI**
Use Tailwind for glassmorphism and Framer Motion for entry.
- [ ] **Step 4: Verify test passes**
- [ ] **Step 5: Commit**
`git add components/CommandPalette.tsx && git commit -m "feat: add CommandPalette skeleton"`

---

### Task 3: Keyboard Trigger & Focus Management

**Files:**
- Modify: `App.tsx`
- Modify: `components/CommandPalette.tsx`

- [ ] **Step 1: Implement `Ctrl+K` listener in `App.tsx`**
- [ ] **Step 2: Implement auto-focus in `CommandPalette.tsx` using `useEffect`**
- [ ] **Step 3: Implement `Esc` key to close**
- [ ] **Step 4: Commit**
`git add App.tsx components/CommandPalette.tsx && git commit -m "feat: implement CommandPalette trigger and focus"`

---

### Task 4: Command Parsing & App Actions

**Files:**
- Modify: `components/CommandPalette.tsx`

- [ ] **Step 1: Write test for "pomodoro start" command**
```typescript
// Mock useGTab
test('executes pomodoro start action', () => {
  const mockStart = jest.fn();
  // ... render with mocked context
  // simulate input "pomodoro start" and Enter
  expect(mockStart).toHaveBeenCalled();
});
```
- [ ] **Step 2: Implement command parsing logic**
Pattern match: "pomodoro start/stop", "add task [text]", "open settings".
- [ ] **Step 3: Verify test passes**
- [ ] **Step 4: Commit**
`git add components/CommandPalette.tsx && git commit -m "feat: implement app actions in CommandPalette"`

---

### Task 5: AI Integration (generateResponse)

**Files:**
- Modify: `components/CommandPalette.tsx`

- [ ] **Step 1: Implement AI call if no command matches**
- [ ] **Step 2: Add loading state (spinner/dots)**
- [ ] **Step 3: Display AI response in a scrollable area**
- [ ] **Step 4: Commit**
`git add components/CommandPalette.tsx && git commit -m "feat: integrate AI chat into CommandPalette"`

---

### Task 6: Final Polish & Verification

**Files:**
- Modify: `components/CommandPalette.tsx`

- [ ] **Step 1: Ensure glassmorphic styling matches "Portal" theme**
- [ ] **Step 2: Test accessibility (focus trapping)**
- [ ] **Step 3: Run final verification**
- [ ] **Step 4: Commit and finalize**
`git add components/CommandPalette.tsx App.tsx && git commit -m "feat: implement global Command Palette with AI and actions"`
