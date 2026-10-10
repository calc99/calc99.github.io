/* =================================================================
   CALC99 :: Web OS
   A minimal desktop environment that wraps the existing pages
   (Games, Proxy, AI) in draggable windows.

   Architecture:
   - Desktop (#desktop) is the full-screen container with wallpaper
   - Top bar (#topbar) shows logo, running app name, clock, panic
   - Dock (#dock) at bottom-center shows app launcher icons
   - Each app opens in a .window (draggable, focusable, closable)
   - Single global WM (WindowManager) handles all window ops

   Apps:
   - Games   → loads /home/games/index.html in an iframe
   - Browser → proxy URL bar + iframe
   - AI      → loads /home/ai/index.html in an iframe
   - About   → small inline window
   ================================================================= */

(function () {
  'use strict';

  // ─── App registry ──────────────────────────────────────────────
  const APPS = [
    {
      id: 'games',
      name: 'Games',
      icon: '🎮',
      type: 'iframe',
      src: '/home/games/index.html',
      width: 980, height: 640, minWidth: 480, minHeight: 360,
    },
    {
      id: 'browser',
      name: 'Browser',
      icon: '🛰',
      type: 'browser',
      width: 1080, height: 680, minWidth: 480, minHeight: 360,
    },
    {
      id: 'ai',
      name: 'AI Chat',
      icon: '🤖',
      type: 'iframe',
      src: '/home/ai/index.html',
      width: 720, height: 680, minWidth: 360, minHeight: 400,
    },
    {
      id: 'about',
      name: 'About',
      icon: 'ℹ',
      type: 'inline',
      width: 460, height: 380, minWidth: 320, minHeight: 240,
      html: `
        <div style="padding:24px; color:var(--text); line-height:1.6;">
          <h2 style="margin:0 0 12px; font-size:1.3rem;">CALC99 OS</h2>
          <p style="color:var(--text-3); font-size:0.9rem; margin:0 0 16px;">
            A web-based desktop environment disguised as a calculator.
            Built with vanilla HTML/CSS/JS. Open source on GitHub.
          </p>
          <p style="font-size:0.82rem; color:var(--text-3); margin:0 0 6px;">
            <b>Panic:</b> top-right button or <kbd>Ctrl+\\</kbd>
          </p>
          <p style="font-size:0.82rem; color:var(--text-3); margin:0 0 6px;">
            <b>Close window:</b> click × or <kbd>Esc</kbd> when focused
          </p>
          <p style="font-size:0.82rem; color:var(--text-3); margin:0 0 6px;">
            <b>Maximize:</b> double-click title bar
          </p>
          <p style="font-size:0.82rem; color:var(--text-3); margin:0;">
            <b>Move window:</b> drag title bar
          </p>
        </div>
      `,
    },
  ];

  // ─── Public UV/Omega instances (same as proxy page) ────────────
  const PROXY_INSTANCES = [
    { label: 'Incognito',       base: 'https://incognito.in/' },
    { label: 'UV Static',       base: 'https://uv-static.netlify.app/' },
    { label: 'Mercury',         base: 'https://mercury-network.pages.dev/' },
    { label: 'Open UB',         base: 'https://open-ub.pages.dev/' },
    { label: 'Holy Unblocker',  base: 'https://holyubofficial.net/' },
    { label: 'Telarithub',      base: 'https://telarithub.pages.dev/' },
  ];

  // ─── Element factory ───────────────────────────────────────────
  function el(tag, attrs, ...kids) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === 'class') e.className = v;
      else if (k === 'text') e.textContent = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k.startsWith('on') && typeof v === 'function') {
        e.addEventListener(k.slice(2).toLowerCase(), v);
      } else if (v !== null && v !== undefined) {
        e.setAttribute(k, v);
      }
    }
    for (const kid of kids) {
      if (kid == null) continue;
      if (typeof kid === 'string') e.appendChild(document.createTextNode(kid));
      else e.appendChild(kid);
    }
    return e;
  }

  // ─── Window Manager ────────────────────────────────────────────
  class WM {
    constructor() {
      this.windows = new Map();    // id → { el, app, state }
      this.zCounter = 100;
      this.focused = null;
      this.nextId = 1;
      this.desktop = document.getElementById('desktop');
      this.topbarApp = document.getElementById('topbar-app');
    }

    open(appId) {
      // If app is already open, just focus it
      for (const [id, w] of this.windows) {
        if (w.app.id === appId) {
          if (w.minimized) this.restore(id);
          this.focus(id);
          return id;
        }
      }

      const app = APPS.find(a => a.id === appId);
      if (!app) return null;

      const id = 'win-' + this.nextId++;
      const w = this.buildWindow(id, app);
      this.desktop.appendChild(w.el);
      this.windows.set(id, w);
      this.focus(id);
      return id;
    }

    buildWindow(id, app) {
      const wrap = el('div', { class: 'window', 'data-app': app.id });
      wrap.style.width = app.width + 'px';
      wrap.style.height = app.height + 'px';
      wrap.style.minWidth = app.minWidth + 'px';
      wrap.style.minHeight = app.minHeight + 'px';

      // Center-ish with slight cascade
      const offset = (this.windows.size % 6) * 28;
      wrap.style.left = `calc(50% - ${app.width/2}px + ${offset}px)`;
      wrap.style.top  = `calc(50% - ${app.height/2}px + ${offset}px - 30px)`;

      // Title bar
      const titlebar = el('div', { class: 'win-titlebar' },
        el('div', { class: 'win-title' },
          el('span', { class: 'win-title-icon' }, app.icon),
          el('span', { class: 'win-title-text' }, app.name)
        ),
        el('div', { class: 'win-controls' },
          el('button', { class: 'win-btn win-min',  title: 'Minimize', onclick: () => this.minimize(id) }, '–'),
          el('button', { class: 'win-btn win-max',  title: 'Maximize', onclick: () => this.toggleMax(id) }, '☐'),
          el('button', { class: 'win-btn win-close', title: 'Close',    onclick: () => this.close(id) }, '×'),
        )
      );

      // Body
      const body = el('div', { class: 'win-body' });
      let content;
      if (app.type === 'iframe') {
        content = el('iframe', {
          src: app.src,
          class: 'win-iframe',
          allow: 'autoplay; fullscreen; gamepad; accelerometer; gyroscope; clipboard-write; encrypted-media',
          allowfullscreen: 'true',
        });
      } else if (app.type === 'browser') {
        content = this.buildBrowserBody(id);
      } else if (app.type === 'inline') {
        content = el('div', { class: 'win-inline', html: app.html });
      }
      body.appendChild(content);

      wrap.appendChild(titlebar);
      wrap.appendChild(body);

      const state = { app, minimized: false, maximized: false, restoreRect: null };

      // Drag
      this.makeDraggable(wrap, titlebar, state);
      // Double-click titlebar = maximize
      titlebar.addEventListener('dblclick', (e) => {
        if (e.target.closest('.win-controls')) return;
        this.toggleMax(id);
      });
      // Click anywhere = focus
      wrap.addEventListener('pointerdown', () => this.focus(id), true);

      return { el: wrap, app, state, iframeRef: app.type === 'iframe' ? content : (app.type === 'browser' ? content.querySelector('iframe') : null) };
    }

    buildBrowserBody(winId) {
      const bar = el('div', { class: 'browser-bar' });
      const input = el('input', {
        type: 'text',
        class: 'browser-url',
        placeholder: 'Search Google or type a URL (e.g. youtube.com)',
      });
      const goBtn = el('button', { class: 'btn btn-primary', text: 'Go' });
      const newBtn = el('button', { class: 'btn btn-ghost', title: 'Open in new tab', text: '↗' });
      const instSel = el('select', { class: 'browser-instance' });
      PROXY_INSTANCES.forEach((it, i) => {
        const opt = el('option', { value: String(i) }, `${it.label}`);
        if (i === 0) opt.selected = true;
        instSel.appendChild(opt);
      });

      bar.appendChild(input);
      bar.appendChild(goBtn);
      bar.appendChild(instSel);
      bar.appendChild(newBtn);

      const frameWrap = el('div', { class: 'win-browser-frame' });
      const iframe = el('iframe', {
        src: PROXY_INSTANCES[0].base,
        class: 'win-iframe',
        referrerpolicy: 'no-referrer',
        allow: 'fullscreen; clipboard-write; encrypted-media',
        allowfullscreen: 'true',
      });
      frameWrap.appendChild(iframe);

      function normalize(q) {
        q = q.trim();
        if (!q) return '';
        if (/^https?:\/\//i.test(q)) return q;
        if (/^[\w-]+(\.[\w-]+)+/.test(q) && !q.includes(' ')) return 'https://' + q;
        return 'https://www.google.com/search?q=' + encodeURIComponent(q);
      }
      function launch(q) {
        const target = normalize(q);
        if (!target) return;
        const inst = PROXY_INSTANCES[parseInt(instSel.value, 10) || 0];
        const full = new URL('uv/service/' + encodeURIComponent(target), inst.base).href;
        iframe.src = full;
      }
      goBtn.addEventListener('click', () => launch(input.value));
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') launch(input.value); });
      newBtn.addEventListener('click', () => {
        const target = normalize(input.value);
        if (!target) return;
        const inst = PROXY_INSTANCES[parseInt(instSel.value, 10) || 0];
        const full = new URL('uv/service/' + encodeURIComponent(target), inst.base).href;
        window.open(full, '_blank', 'noopener,noreferrer');
      });

      const root = el('div', { class: 'win-browser' });
      root.appendChild(bar);
      root.appendChild(frameWrap);
      return root;
    }

    makeDraggable(wrap, handle, state) {
      let dragging = false;
      let sx = 0, sy = 0, ox = 0, oy = 0;
      handle.addEventListener('pointerdown', (e) => {
        if (e.target.closest('.win-controls')) return;
        if (state.maximized) return;
        dragging = true;
        handle.setPointerCapture(e.pointerId);
        sx = e.clientX; sy = e.clientY;
        const r = wrap.getBoundingClientRect();
        ox = r.left; oy = r.top;
        wrap.classList.add('dragging');
      });
      handle.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        const dx = e.clientX - sx;
        const dy = e.clientY - sy;
        const newL = Math.max(0, Math.min(window.innerWidth - 80, ox + dx));
        const newT = Math.max(36, Math.min(window.innerHeight - 60, oy + dy));
        wrap.style.left = newL + 'px';
        wrap.style.top  = newT + 'px';
        wrap.style.right  = 'auto';
        wrap.style.bottom = 'auto';
      });
      handle.addEventListener('pointerup', (e) => {
        if (!dragging) return;
        dragging = false;
        handle.releasePointerCapture(e.pointerId);
        wrap.classList.remove('dragging');
      });
    }

    focus(id) {
      const w = this.windows.get(id);
      if (!w) return;
      w.el.style.zIndex = ++this.zCounter;
      w.el.classList.add('focused');
      this.windows.forEach((other, oid) => {
        if (oid !== id) other.el.classList.remove('focused');
      });
      this.focused = id;
      if (this.topbarApp) this.topbarApp.textContent = w.app.name;
    }

    close(id) {
      const w = this.windows.get(id);
      if (!w) return;
      w.el.remove();
      this.windows.delete(id);
      if (this.focused === id) {
        this.focused = null;
        if (this.topbarApp) this.topbarApp.textContent = '';
      }
    }

    minimize(id) {
      const w = this.windows.get(id);
      if (!w) return;
      w.minimized = true;
      w.el.classList.add('minimized');
    }

    restore(id) {
      const w = this.windows.get(id);
      if (!w) return;
      w.minimized = false;
      w.el.classList.remove('minimized');
      this.focus(id);
    }

    toggleMax(id) {
      const w = this.windows.get(id);
      if (!w) return;
      if (w.maximized) {
        w.maximized = false;
        w.el.classList.remove('maximized');
        if (w.state.restoreRect) {
          w.el.style.left = w.state.restoreRect.left;
          w.el.style.top = w.state.restoreRect.top;
          w.el.style.width = w.state.restoreRect.width;
          w.el.style.height = w.state.restoreRect.height;
        }
      } else {
        w.state.restoreRect = {
          left: w.el.style.left,
          top: w.el.style.top,
          width: w.el.style.width,
          height: w.el.style.height,
        };
        w.maximized = true;
        w.el.classList.add('maximized');
      }
    }
  }

  // ─── Boot the OS ───────────────────────────────────────────────
  function boot() {
    // Skip boot screen after first paint
    const bootScreen = document.getElementById('boot-screen');
    if (bootScreen) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          bootScreen.classList.add('hidden');
          setTimeout(() => bootScreen.remove(), 400);
        }, 900);
      });
    }

    const wm = new WM();
    window.Calc99OS = wm;

    // Dock click → open app
    document.querySelectorAll('.dock-icon').forEach(btn => {
      btn.addEventListener('click', () => {
        const appId = btn.dataset.app;
        wm.open(appId);
      });
    });

    // Desktop double-click → open About (easter egg)
    const desktop = document.getElementById('desktop');
    desktop.addEventListener('dblclick', (e) => {
      if (e.target === desktop) wm.open('about');
    });

    // Clock
    const clock = document.getElementById('topbar-clock');
    function tick() {
      const d = new Date();
      const h = d.getHours();
      const m = d.getMinutes().toString().padStart(2, '0');
      clock.textContent = `${h}:${m}`;
    }
    tick();
    setInterval(tick, 30000);

    // Panic button + Ctrl+\ shortcut
    const goPanic = () => { window.location.href = '/'; };
    document.getElementById('topbar-panic').addEventListener('click', goPanic);
    document.addEventListener('keydown', (e) => {
      // Ctrl+\ → panic
      if ((e.ctrlKey || e.metaKey) && e.key === '\\') {
        e.preventDefault();
        goPanic();
      }
    });

    // Esc closes focused window
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && wm.focused) {
        const active = document.activeElement;
        if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return;
        wm.close(wm.focused);
      }
    });

    // Dock icons also work from desktop icons
    document.querySelectorAll('.desktop-icon').forEach(btn => {
      btn.addEventListener('click', () => {
        const appId = btn.dataset.app;
        wm.open(appId);
      });
      btn.addEventListener('dblclick', (e) => e.preventDefault());
    });
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
