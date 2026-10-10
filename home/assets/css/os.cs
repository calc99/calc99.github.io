/* =================================================================
   CALC99 :: Web OS desktop styles
   Layer on top of style.css. Hide the .nav, show the desktop chrome.
   ================================================================= */

body { overflow: hidden; }

/* Hide the regular nav when in OS mode (we have our own topbar) */
.nav { display: none !important; }

/* ─── Boot screen ─────────────────────────────────────────────── */
#boot-screen {
  position: fixed; inset: 0;
  background: var(--bg);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 20px;
  z-index: 9999;
  transition: opacity 0.4s var(--ease);
}
#boot-screen.hidden { opacity: 0; pointer-events: none; }
.boot-logo {
  font-family: var(--font-sans);
  font-weight: 800;
  font-size: 3.2rem;
  letter-spacing: -0.03em;
  background: linear-gradient(180deg, var(--text) 0%, var(--text-3) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.boot-spinner {
  width: 32px; height: 32px;
  border: 2px solid var(--surface-3);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.boot-status {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--text-4);
  letter-spacing: 0.05em;
}

/* ─── Top bar ─────────────────────────────────────────────────── */
#topbar {
  position: fixed; top: 0; left: 0; right: 0;
  height: 36px;
  background: rgba(8, 8, 12, 0.78);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 16px;
  z-index: 200;
  font-size: 0.82rem;
}
.topbar-left { display: flex; align-items: center; gap: 8px; }
.topbar-right { display: flex; align-items: center; gap: 12px; }
.topbar-logo {
  font-family: var(--font-sans);
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: -0.01em;
  color: var(--text);
}
.topbar-sep { color: var(--text-4); }
.topbar-app {
  font-family: var(--font-mono);
  color: var(--text-3);
  font-size: 0.78rem;
  letter-spacing: 0.04em;
  text-transform: lowercase;
}
.topbar-status {
  font-size: 0.65rem;
  color: var(--ok);
  text-shadow: 0 0 8px rgba(74, 222, 128, 0.6);
}
.topbar-clock {
  font-family: var(--font-mono);
  color: var(--text-2);
  font-size: 0.78rem;
  letter-spacing: 0.02em;
  font-variant-numeric: tabular-nums;
}
.topbar-panic {
  font-family: var(--font-sans);
  font-weight: 700;
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  background: linear-gradient(135deg, var(--danger), #b91c1c);
  color: white;
  padding: 4px 10px;
  border-radius: var(--r-sm);
  border: 1px solid rgba(248, 113, 113, 0.4);
  cursor: pointer;
  transition: all var(--dur-fast) var(--ease);
}
.topbar-panic:hover {
  box-shadow: 0 0 0 1px rgba(248, 113, 113, 0.4), 0 0 16px rgba(248, 113, 113, 0.35);
}
.topbar-panic:active { transform: scale(0.96); }

/* ─── Desktop ─────────────────────────────────────────────────── */
#desktop {
  position: fixed;
  top: 36px; left: 0; right: 0; bottom: 80px;
  overflow: hidden;
  background:
    radial-gradient(ellipse 100% 60% at 50% -10%, rgba(110, 231, 255, 0.06), transparent 70%),
    radial-gradient(ellipse 80% 50% at 100% 100%, rgba(192, 132, 252, 0.04), transparent 70%),
    var(--bg);
}
#desktop::before {
  content: "";
  position: absolute; inset: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px);
  background-size: 24px 24px;
  pointer-events: none;
}

/* ─── Desktop icons (top-left corner) ────────────────────────── */
.desktop-icons {
  position: absolute;
  top: 16px; left: 16px;
  display: grid;
  grid-template-columns: repeat(auto-fill, 88px);
  gap: 6px;
  z-index: 1;
}
.desktop-icon {
  display: flex; flex-direction: column;
  align-items: center; gap: 6px;
  padding: 10px 6px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--r-md);
  cursor: pointer;
  transition: all var(--dur-fast) var(--ease);
  font-family: var(--font-sans);
  color: var(--text-2);
  text-align: center;
}
.desktop-icon:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: var(--border-strong);
  color: var(--text);
}
.desktop-icon .di-icon {
  font-size: 2rem;
  line-height: 1;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4));
}
.desktop-icon .di-label {
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
}

/* Hint at bottom-right of desktop */
.desktop-hint {
  position: absolute;
  bottom: 12px; right: 16px;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--text-4);
  letter-spacing: 0.02em;
  z-index: 1;
  pointer-events: none;
}

/* ─── Windows ────────────────────────────────────────────────── */
.window {
  position: absolute;
  background: var(--surface-1);
  border: 1px solid var(--border-strong);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: opacity var(--dur) var(--ease), transform var(--dur) var(--ease);
  animation: winOpen 0.22s var(--ease);
  opacity: 1;
}
@keyframes winOpen {
  from { opacity: 0; transform: scale(0.96) translateY(8px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
.window.dragging { transition: none; }
.window.focused {
  border-color: rgba(255, 255, 255, 0.18);
  box-shadow: var(--shadow-lg), 0 0 0 1px rgba(110, 231, 255, 0.15);
}
.window.minimized {
  opacity: 0;
  transform: scale(0.85) translateY(40px);
  pointer-events: none;
}
.window.maximized {
  left: 0 !important; top: 0 !important;
  width: 100% !important; height: 100% !important;
  border-radius: 0;
  border-color: var(--border-strong);
}

.win-titlebar {
  height: 36px;
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 8px 0 12px;
  background: var(--surface-2);
  border-bottom: 1px solid var(--border);
  user-select: none;
  cursor: default;
}
.window.focused .win-titlebar {
  background: var(--surface-3);
}
.win-title {
  display: flex; align-items: center; gap: 8px;
  font-family: var(--font-sans);
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-2);
  letter-spacing: 0.01em;
}
.window.focused .win-title { color: var(--text); }
.win-title-icon { font-size: 0.95rem; }
.win-controls { display: flex; gap: 6px; }
.win-btn {
  width: 22px; height: 22px;
  border-radius: var(--r-sm);
  border: 1px solid var(--border);
  background: var(--surface-1);
  color: var(--text-3);
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  line-height: 1;
  padding: 0;
  transition: all var(--dur-fast) var(--ease);
}
.win-btn:hover {
  background: var(--surface-2);
  color: var(--text);
  border-color: var(--border-strong);
}
.win-btn.win-close:hover {
  background: var(--danger);
  color: white;
  border-color: var(--danger);
}
.win-btn.win-max:hover {
  background: var(--accent);
  color: #001017;
  border-color: var(--accent);
}

.win-body {
  flex: 1;
  overflow: hidden;
  position: relative;
  background: var(--bg);
  display: flex;
}
.win-iframe {
  width: 100%; height: 100%;
  border: 0;
  display: block;
}
.win-inline {
  width: 100%; height: 100%;
  overflow-y: auto;
}

/* ─── Browser window ──────────────────────────────────────────── */
.win-browser { width: 100%; height: 100%; display: flex; flex-direction: column; }
.browser-bar {
  display: flex; gap: 8px;
  padding: 8px;
  background: var(--surface-2);
  border-bottom: 1px solid var(--border);
  align-items: center;
}
.browser-url {
  flex: 1;
  background: var(--surface-1);
  border: 1px solid var(--border);
  border-radius: var(--r-sm);
  padding: 7px 11px;
  color: var(--text);
  font-family: var(--font-sans);
  font-size: 0.85rem;
  outline: none;
  transition: all var(--dur-fast) var(--ease);
}
.browser-url:focus {
  border-color: var(--accent);
  background: var(--surface-2);
  box-shadow: 0 0 0 3px var(--accent-glow);
}
.browser-instance {
  background: var(--surface-1);
  border: 1px solid var(--border);
  border-radius: var(--r-sm);
  color: var(--text-2);
  font-family: var(--font-sans);
  font-size: 0.78rem;
  padding: 6px 10px;
  cursor: pointer;
  outline: none;
  max-width: 130px;
}
.win-browser-frame {
  flex: 1;
  background: #000;
  position: relative;
}
.win-browser-frame iframe {
  width: 100%; height: 100%;
  border: 0;
  display: block;
}

/* ─── Dock ───────────────────────────────────────────────────── */
#dock {
  position: fixed;
  bottom: 14px; left: 50%;
  transform: translateX(-50%);
  display: flex; align-items: center; gap: 4px;
  padding: 8px 10px;
  background: rgba(20, 20, 30, 0.65);
  backdrop-filter: saturate(180%) blur(24px);
  -webkit-backdrop-filter: saturate(180%) blur(24px);
  border: 1px solid var(--border-strong);
  border-radius: var(--r-xl);
  box-shadow: var(--shadow-lg);
  z-index: 200;
}
.dock-icon {
  width: 44px; height: 44px;
  border: 0;
  background: transparent;
  font-size: 1.6rem;
  line-height: 1;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  border-radius: var(--r-md);
  transition: all var(--dur-fast) var(--ease);
  filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.3));
}
.dock-icon:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-6px) scale(1.12);
}
.dock-icon:active { transform: translateY(-2px) scale(1); }
.dock-sep {
  width: 1px;
  height: 26px;
  background: var(--border-strong);
  margin: 0 4px;
}

/* ─── Mobile ──────────────────────────────────────────────────── */
@media (max-width: 720px) {
  .desktop-icons {
    grid-template-columns: repeat(auto-fill, 70px);
    gap: 4px;
  }
  .desktop-icon .di-icon { font-size: 1.5rem; }
  .desktop-icon .di-label { font-size: 0.65rem; }
  .desktop-hint { display: none; }
  #dock { padding: 6px 8px; }
  .dock-icon { width: 38px; height: 38px; font-size: 1.3rem; }
  .window { left: 0 !important; right: 0 !important; width: auto !important; }
  .topbar-app { display: none; }
}
