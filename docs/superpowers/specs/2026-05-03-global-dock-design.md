# GTab v5.2 - Global Floating Dock Spec

> **Date:** 2026-05-03
> **Status:** Draft
> **Topic:** Floating Dock, Collapsible UI, Configurable Position

## 1. Goal
Convert the full-width Status Bar into a compact, floating "Mini Dock" that is globally accessible on all web pages. It should be collapsible, support multiple screen positions, and open shortcuts in new tabs with profile support.

## 2. Features

### 2.1. Floating Pill Dock
- **UI:** A rounded "pill" container with high backdrop blur and subtle glow.
- **Modes:**
    - **Collapsed:** Shows only a minimal indicator (e.g., active Pomodoro timer or a GTab icon).
    - **Expanded:** On click/hover, it expands to reveal icons for shortcuts in the "Status Bar" category.
- **Positioning:** Configurable via settings. Options:
    - `top-center` (Floating at the top middle)
    - `bottom-center` (Floating at the bottom middle)
    - `top-right` (Floating at the top right corner)
- **Navigation:** Clicking an icon opens the resolved URL (with profile/authuser) in a **new tab**.

### 2.2. Keyboard & Visibility
- Toggles visibility with the configured shortcut (default `Alt+S`).
- Remembers collapsed/expanded state (optional) or defaults to collapsed.

## 3. Architecture & Components

### 3.1. Config Updates (`types.ts`)
- Add `dockPosition: 'top-center' | 'bottom-center' | 'top-right'` to `AIConfig`.
- Add `dockCollapsed: boolean` to `GlobalStatus`.

### 3.2. Content Script (`src/content/index.ts`)
- **Redesign:** Change from a full-width bar that pushes content to a floating container.
- **Animations:** Use CSS transitions or simple JS-driven width/height changes for the expansion effect.
- **Position Logic:** Dynamically apply styles based on the selected `dockPosition`.

### 3.3. Settings (`components/settings/DataTab.tsx`)
- Add a dropdown for "Dock Pozisyonu".

## 4. User Experience (UX)
- The dock feels like a native productivity tool.
- Smooth animations for opening/closing.
- Minimal screen real estate usage when collapsed.
