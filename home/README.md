# /home/ — CALC99 Web OS

This is the "secret" section of the site, reached from the calculator (`/index.html`) by pressing **2nd → =**, then typing `0000`.

The home page (`/home/index.html`) is a **Web OS desktop** — a minimal macOS/Linux-style environment with:
- Top bar (logo, running app name, clock, panic button)
- Desktop with double-click icons
- Dock at bottom with app launchers
- Draggable / focusable / closable / maximizable windows

## Apps

| Icon | App | What it does |
|------|-----|--------------|
| 🎮 | Games | Opens the games launcher in a window. Click any game to play in a sub-iframe. |
| 🛰 | Browser | URL bar + proxy dropdown + iframe. Points at public UV/Omega instances. |
| 🤖 | AI Chat | GLM-powered chat in demo mode by default. Deploy backend for real AI. |
| ℹ | About | Quick reference for keyboard shortcuts. |

## Layout

```
/home/
├── index.html              ← Web OS desktop (boot screen → topbar → desktop → dock)
├── assets/
│   ├── css/style.css       ← Base theme
│   ├── css/os.css          ← Desktop + window + dock styles
│   ├── js/main.js          ← Navbar (for /games/, /proxy/, /ai/ — NOT used by OS)
│   └── js/os.js            ← Window manager + app launcher
├── games/
│   ├── index.html          ← Games grid (loaded in OS window as iframe)
│   ├── play.html           ← Full-screen game player
│   ├── games.json          ← Game catalog
│   └── hosted/             ← Self-hosted game builds
│       ├── baldi/          ← 35MB Unity WebGL
│       ├── ddlc/           ← 107MB Ren'Py web build (optimized)
│       └── gd/             ← 82MB Web Dashers (GD fan mod)
├── proxy/index.html        ← Standalone proxy page (also reachable via OS Browser app)
└── ai/
    ├── index.html          ← Standalone AI page (also reachable via OS AI app)
    ├── chat.js             ← Front-end (set CHAT_ENDPOINT to enable real AI)
    └── server/             ← Node backend for z-ai-web-dev-sdk (deploy to Vercel/Render/Netlify)
```

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `2nd` then `=` then `0000` | On the calculator — unlocks this site |
| `Ctrl + \` | Anywhere — instant panic back to calculator |
| `Esc` | Closes the focused window (unless typing in input) |
| Double-click title bar | Maximize / restore window |
| Drag title bar | Move window |
| Double-click desktop | Open About |

## Self-hosted games (itch.io no longer required)

All 4 games are bundled locally so the site has zero itch.io / itch.zone dependencies:

| Game | Size | Source |
|------|------|--------|
| Baldi's Basics | 35MB | Unity WebGL build, downloaded from itch.zone |
| Doki Doki Literature Club | 107MB | Ren'Py web build from EmeraldGreenR/EmeraldGreenR.github.io |
| Geometry Dash (Web Dashers mod) | 82MB | Cloned from web-dashers/web-dashers.github.io |
| Chess | 0 (iframe) | lichess.org/training/frame — can't be self-hosted (lichess only) |

Total bundled: ~224MB. Well under GitHub Pages' 1GB limit.

### DDLC optimization notes

Original repo was 445MB. Optimized down to 107MB by:
- Dropping `game/` folder (129MB — duplicate of game.zip, only the zip is loaded at runtime)
- Dropping `renpy.wasm.map` (2.6MB — source map, debug only)
- Dropping `index.html.symbols` (1MB — debug symbols)
- Dropping `pwa_catalog.json` and `service-worker.js` (PWA files, not needed)

Further optimization possible: convert `game.zip`'s internal PNGs to WebP (could save ~30% / 23MB). Requires extracting → converting → re-zipping. Not done because game.zip is already at GitHub's 100MB per-file limit and adding/changing anything inside risks breaking Ren'Py's archive format.

## Wire up real AI

The AI app works in DEMO mode by default (canned responses, no backend). To make it real:

1. `cd home/ai/server && npm install && npm start` — verify locally
2. Deploy `server/` to Vercel / Render / Netlify (instructions in `home/ai/server/README.md`)
3. Edit `home/ai/chat.js`, set `CHAT_ENDPOINT = 'https://YOUR-DEPLOYED-URL/chat'`
4. Commit + push

## Browser compatibility

Tested on Chrome 120+, Firefox 121+, Safari 17+. WebGL games (Baldi) need WebGL 2.0 support. Backdrop-filter (dock blur) requires modern browser.

## Disclaimer

Open source under MIT. Use responsibly per your local AUP.
