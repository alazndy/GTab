# Command & Focus Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform GTab with a Command Palette (AI + Actions), Daily Quotes, and Ambient Focus Sounds.

**Architecture:** 
- **Services:** `quoteService` (ZenQuotes API) and `aiService` (Gemini API).
- **Hooks:** `useAmbientAudio` (Web Audio API management).
- **Components:** Global overlays for `CommandPalette` and `QuoteDisplay` in the root `App.tsx`.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Web Audio API, Gemini API, ZenQuotes API.

---

### Phase 1: Daily Quotes (The Inspiration)

#### Task 1: Create Quote Service
**Files:**
- Create: `services/quoteService.ts`

- [ ] **Step 1: Define Quote Service logic**
Write service to fetch from `https://zenquotes.io/api/today` and handle 24h caching in `localStorage`.
- [ ] **Step 2: Commit**
`git add services/quoteService.ts && git commit -m "feat: add daily quote service with caching"`

#### Task 2: Create QuoteDisplay Component
**Files:**
- Create: `components/QuoteDisplay.tsx`
- Modify: `App.tsx`

- [ ] **Step 1: Build UI**
Create a minimalist, low-opacity text component that renders at the bottom center.
- [ ] **Step 2: Integrate into App.tsx**
Add `<QuoteDisplay />` to the main layout.
- [ ] **Step 3: Commit**
`git add components/QuoteDisplay.tsx App.tsx && git commit -m "feat: add QuoteDisplay component to footer"`

---

### Phase 2: Ambient Sounds (The Focus)

#### Task 3: Ambient Audio Hook
**Files:**
- Create: `hooks/useAmbientAudio.ts`

- [ ] **Step 1: Implement Audio Engine**
Use `Audio` objects with `loop = true`. Manage `play`, `pause`, `stop`, and `setVolume`.
- [ ] **Step 2: Commit**
`git add hooks/useAmbientAudio.ts && git commit -m "feat: add useAmbientAudio hook for seamless looping"`

#### Task 4: Integrate Ambient into Pomodoro
**Files:**
- Modify: `components/PomodoroWidget.tsx`

- [ ] **Step 1: Add UI Controls**
Add sound selector icons (Rain, Coffee, etc.) and volume slider inside the widget.
- [ ] **Step 2: Auto-play Logic**
Trigger ambient sound when Pomodoro focus session starts.
- [ ] **Step 3: Commit**
`git add components/PomodoroWidget.tsx && git commit -m "feat: integrate ambient sounds into Pomodoro widget"`

---

### Phase 3: Command Palette (The Command)

#### Task 5: AI Service (Gemini)
**Files:**
- Create: `services/aiService.ts`
- Modify: `components/settings/DataTab.tsx`

- [ ] **Step 1: Implement Gemini Client**
Create a service to call Google Gemini API.
- [ ] **Step 2: Add API Key Setting**
Add a field in `DataTab.tsx` to save the Gemini API key to storage.
- [ ] **Step 3: Commit**
`git add services/aiService.ts components/settings/DataTab.tsx && git commit -m "feat: add Gemini AI service and API key configuration"`

#### Task 6: Command Palette UI & Logic
**Files:**
- Create: `components/CommandPalette.tsx`
- Modify: `App.tsx`

- [ ] **Step 1: Build Overlay UI**
Create the glassmorphic centered bar with `Ctrl+K` listener.
- [ ] **Step 2: Action Parsing**
Implement basic command parsing (e.g., "start pomodoro") to trigger app actions via context.
- [ ] **Step 3: AI Chat Integration**
Connect the palette to `aiService` for general questions.
- [ ] **Step 4: Commit**
`git add components/CommandPalette.tsx App.tsx && git commit -m "feat: implement global Command Palette with AI and actions"`

---

### Phase 4: Final Polish

#### Task 7: Assets & Verification
- [ ] **Step 1: Download Sound Assets**
Add small (under 500kb) loopable audio files to `public/sounds/`.
- [ ] **Step 2: Final Test**
Verify Pomodoro triggers sound, `Ctrl+K` opens palette, and quotes update daily.
- [ ] **Step 3: Update Memory**
Update `memory.md` with v5.0 progress.
- [ ] **Step 4: Commit**
`git commit -m "chore: final polish and assets for v5.0"`
