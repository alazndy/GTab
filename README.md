# GTAB - Customizable New Tab Page

<div align="center">

![GTAB Logo](public/icons/icon128.png)

**A fast, minimal, and fully customizable new tab experience for Chrome**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Chrome Web Store](https://img.shields.io/badge/Chrome-Extension-green.svg)](https://chrome.google.com/webstore)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg)](https://react.dev/)

</div>

---

## ✨ Features

### 🕐 Elegant Clock Widget

- Large, readable digital clock
- Turkish date display
- 12/24 hour format support
- Show/hide seconds option

### 🔍 Quick Search

- Instant Google search
- Clean, minimal design
- Just type and press Enter

### 📌 Smart Shortcuts

- One-click access to your favorite sites
- Category-based filtering (Social, Work, Dev, Entertainment, Apps)
- Organize with folders
- Drag-and-drop reordering
- Multi-profile support (Work/Personal accounts)

### ✅ Task Widget

- Simple and effective todo list
- Quickly add and complete tasks
- Persistent across sessions

### 🎨 Customization

- Pre-built background themes
- Solid color options
- Custom image URL support
- Widget visibility controls

## 🚀 Installation

### From Chrome Web Store

_(Coming soon)_

### Manual Installation (Developer Mode)

1. Clone the repository:

```bash
git clone https://github.com/alazndy/GTab.git
cd GTab
```

2. Install dependencies:

```bash
pnpm install
```

3. Build the extension:

```bash
pnpm build
```

4. Load in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `dist` folder

## 🛠️ Development

### Prerequisites

- Node.js 18+
- pnpm

### Commands

| Command        | Description              |
| -------------- | ------------------------ |
| `pnpm dev`     | Start development server |
| `pnpm build`   | Build for production     |
| `pnpm preview` | Preview production build |

### Project Structure

```
GTAB/
├── components/          # React components
│   ├── AddModal.tsx           # Add shortcut/folder modal
│   ├── BackgroundSettingsModal.tsx
│   ├── Clock.tsx              # Clock widget
│   ├── ClockSettingsModal.tsx
│   ├── FolderViewModal.tsx
│   ├── SearchBar.tsx          # Search component
│   ├── ShortcutCard.tsx       # Shortcut/folder card
│   ├── ShortcutSettingsModal.tsx
│   └── TasksWidget.tsx        # Todo list widget
├── services/
│   └── storageService.ts      # LocalStorage persistence
├── public/
│   ├── manifest.json          # Chrome extension manifest
│   └── icons/                 # Extension icons
├── App.tsx                    # Main application
├── types.ts                   # TypeScript definitions
├── index.tsx                  # Entry point
└── index.css                  # Global styles
```

## 🔧 Tech Stack

- **Framework:** React 19 with TypeScript
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS 3
- **Icons:** Heroicons
- **Storage:** localStorage

## 📦 Bundle Size

| Metric      | Size   |
| ----------- | ------ |
| Main Bundle | 236 KB |
| Gzipped     | 72 KB  |
| Build Time  | ~3s    |

## 🔒 Privacy

- **All data stored locally** - No server communication
- **No analytics or tracking**
- **No ads**
- **Open source**

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Heroicons](https://heroicons.com/) for the beautiful icons
- [Unsplash](https://unsplash.com/) for the background images
- [Tailwind CSS](https://tailwindcss.com/) for the styling framework

---

<div align="center">
Made with ❤️ by <a href="https://github.com/alazndy">alazndy</a>
</div>
