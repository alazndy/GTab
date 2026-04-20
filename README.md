# GTab: Elite Personal Productivity Dashboard

![GTab Logo](public/icons/icon128.png)

[![Release](https://img.shields.io/github/v/release/alazndy/GTab?color=blue&style=for-the-badge)](https://github.com/alazndy/GTab/releases)
[![Tech](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Performance](https://img.shields.io/badge/Performance-Elite-blueviolet?style=for-the-badge)](https://github.com/alazndy/GTab)
[![Design](https://img.shields.io/badge/Design-Glassmorphism-purple?style=for-the-badge)](https://github.com/alazndy/GTab)

**GTab** is a premium, high-performance "New Tab" browser extension designed for power users who demand speed, aesthetics, and total control over their digital workspace.

---

## 🚀 What's New in v2.0.0 (Major Release)

- **🎨 Settings Redesign:** Completely overhauled settings interface with a sidebar, categorized navigation (Layout, Appearance, Typography), and enhanced glassmorphic details.
- **📐 Dynamic Grid Control:** Precision control over your dashboard layout with adjustable horizontal/vertical gaps and 2-12 column grid density.
- **👤 Elite Profile Menu:** Fixed-width, readable profile menu independent of card sizes, featuring customizable opacity and border styling.
- **✨ Portal Theme 2.0:** Enhanced sci-fi aesthetics with improved glow effects and refined animations.
- **➕ Minimalist Add Card:** Redesigned "Add New" card with a more transparent, non-intrusive aesthetic.
- **🖱️ Context Menu Magic:** Right-click any page to instantly save links to GTab via the background service worker.
- **🎛️ Extension Popup:** Quickly add the current tab, toggle dashboard visibility, or navigate to your profiles directly from the extension bar.

---

## 🌟 Core Features

### 🧩 Pro Widget Suite
*   **Dynamic Clock:** Ultra-customizable glassmorphic time/date display with precision layout controls.
*   **Tasks Sidebar:** A minimalist, high-velocity To-Do engine integrated directly into your workspace.
*   **Omni-Search:** Unified search bar supporting global engines with instant keyboard-shortcut access.
*   **Grid Engine:** Reorder and resize widgets using our advanced drag-and-drop layout manager.

### 🔗 Advanced Shortcut Management
*   **Intelligent Grouping:** Organize your digital universe with nested folders and visual category grouping.
*   **Multi-Profile Aware:** Deep support for profile-specific URLs (e.g., automated `authuser` management for Google/YouTube accounts).
*   **Elite Favicon Caching:** Instant shortcut loading via an optimized visual asset layer.
*   **Dynamic Filtering:** Find what you need instantly with a real-time, fuzzy-search filter bar.

### 🎨 Design & Personalization (Glassmorphism First)
*   **Aperture (Portal) Theme:** Premium theme inspired by modern sci-fi aesthetics.
*   **Dynamic Backgrounds:** High-resolution presets, solid minimalist colors, or daily random high-fidelity imagery.
*   **Premium Typography:** Utilizing Geist Sans and modern font stacks for maximum readability.
*   **Interactive Micro-Animations:** Fluid transitions and hover effects powered by Framer Motion.

---

## ⚡ Engineering & Performance

GTab is zero-compromise on speed. We've optimized the rendering pipeline to handle thousands of items with sub-millisecond lag.

-   **React 19 Concurrent Mode:** Leveraging the latest React features for non-blocking UI updates.
-   **Atomic State Management:** Efficient data flow that prevents unnecessary re-renders in deep component trees.
-   **Zero-Overhead Favicons:** Background pre-fetching and module-level Map caching.
-   **Vite 6 Build Pipeline:** Optimized chunking for near-instant extension loading.

---

## 🛠 Tech Stack

- **Framework:** React 19 (TypeScript)
- **Styling:** Tailwind CSS v4 (Alpha/v3 compatible) + Custom CSS Variables
- **Icons:** Heroicons (Customized for premium interaction)
- **Build Tool:** Vite 6
- **Runtime:** Chrome/WebExtension APIs (Manifest V3)

---

## 📦 Getting Started

### Installation
1. Download the latest release from the [Releases](https://github.com/alazndy/GTab/releases) page.
2. Open Chrome/Edge and navigate to `chrome://extensions`.
3. Enable **Developer Mode** (top right).
4. Drag and drop the `.zip` file into the extensions page OR extract and use "Load unpacked".

### Development
```bash
# Clone the repository
git clone https://github.com/alazndy/GTab.git

# Install dependencies using pnpm
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

---

## 💎 Support & Contribution

GTab is an open-source project aimed at creating the ultimate productivity dashboard. 

* **Contribute:** Pull requests are welcome! 
* **Support:** [Buy Me A Coffee](https://www.buymeacoffee.com/alazndy)

---
*Developed with ❤️ by **Antigravity** & **Jules***
