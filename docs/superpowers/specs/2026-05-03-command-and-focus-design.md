# GTab v5.0 - Command & Focus Design Spec

> **Date:** 2026-05-03
> **Status:** Draft
> **Topic:** Command Palette, Daily Quotes, Ambient Sounds

## 1. Goal
Transform GTab into a power-user productivity dashboard by adding an AI-driven command interface and deep focus tools (ambient sounds, daily inspiration).

## 2. Features

### 2.1. Command Palette (The Brain)
- **Shortcut:** `Ctrl+K` or `Cmd+K`.
- **UI:** A centered, glassmorphic search bar with an overlay that dims the background.
- **AI Integration:** 
    - Uses Gemini API (Google).
    - Supports natural language queries (e.g., "What's on my schedule?", "How do I stay productive?").
    - **Actions:** Supports direct commands to control the app:
        - `pomodoro start` / `stop`
        - `add task [title]`
        - `open settings`
- **Configuration:** Users must provide their own Gemini API Key in the Settings -> Data tab.

### 2.2. Daily Quotes
- **Service:** Fetches from ZenQuotes API (`https://zenquotes.io/api/today`).
- **Caching:** Stores the daily quote in `localStorage` for 24 hours to avoid API limits and enable offline access.
- **UI:** A subtle, low-opacity text at the bottom center of the dashboard. Glows on hover.

### 2.3. Ambient Sounds (Focus Engine)
- **Engine:** `useAmbientAudio` custom hook using Web Audio API for seamless looping.
- **Assets:** Small, optimized audio loops (Rain, Coffee Shop, Forest, White Noise) stored in `public/sounds/`.
- **Integration:** 
    - Controlled via the Pomodoro Widget.
    - Option to "Auto-play on Pomodoro start".
    - Volume slider and sound selector within the Pomodoro UI.

## 3. Architecture & Components

### 3.1. New Components
- `components/CommandPalette.tsx`: Global overlay for AI and commands.
- `components/QuoteDisplay.tsx`: Minimalist footer component for daily quotes.
- `services/quoteService.ts`: Handles fetching and caching logic.
- `hooks/useAmbientAudio.ts`: Manages audio state, volume, and looping.

### 3.2. Modified Components
- `App.tsx`: Include `CommandPalette` and `QuoteDisplay`.
- `PomodoroWidget.tsx`: Add ambient sound controls (icons, menu, volume).
- `settings/DataTab.tsx`: Add field for "Gemini API Key".
- `types.ts`: Add types for Quotes and Ambient settings.

## 4. User Experience (UX)
- **Focus Mode:** When Pomodoro starts, the selected ambient sound fades in.
- **Speed:** Command Palette allows keyboard-only navigation for common tasks.
- **Visuals:** Maintain the "Glassmorphism" and "Portal" theme aesthetics with consistent blurs and glow effects.

## 5. Security & Privacy
- **API Keys:** Stored only in `chrome.storage.local`. Never synced or logged.
- **AI Context:** Only sends the user's prompt to Gemini. Future versions may include local context (tasks/calendar) with explicit user permission.
