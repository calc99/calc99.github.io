/* =================================================================
   CALC99 :: Shared site JS
   - Renders the navbar so we don't repeat HTML on every page
   - Panic button: back to the calculator disguise
   - Keyboard shortcut:  Ctrl+\  = instant panic
   ================================================================= */

(function () {
  'use strict';

  // ----- Config ---------------------------------------------------
  const PANIC_URL = '/';  // back to /index.html (calculator)
  const NAV_ITEMS = [
    { href: '/home/index.html',         label: 'Home',   key: 'home' },
    { href: '/home/games/index.html',   label: 'Games',  key: 'games' },
    { href: '/home/proxy/index.html',   label: 'Proxy',  key: 'proxy' },
    { href: '/home/ai/index.html',      label: 'AI',     key: 'ai' },
  ];

  // ----- Helpers --------------------------------------------------
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

  // ----- Navbar ---------------------------------------------------
  function buildNav(activeKey) {
    const links = NAV_ITEMS.map(item =>
      el('a', {
        href: item.href,
        class: 'nav-link' + (item.key === activeKey ? ' active' : ''),
      }, item.label)
    );

    const panic = el('button', {
      class: 'panic-btn',
      title: 'Back to calculator (Ctrl+\\)',
      onclick: () => { window.location.href = PANIC_URL; },
    }, 'Panic');

    const logo = el('a', {
      href: '/home/index.html',
      class: 'nav-logo',
      html: '<span class="dot"></span> CALC99',
    });

    const nav = el('nav', { class: 'nav', 'aria-label': 'main' }, logo, el('div', { class: 'nav-links' }, ...links), panic);
    return nav;
  }

  // ----- Panic ----------------------------------------------------
  function wirePanic() {
    document.addEventListener('keydown', (e) => {
      // Ctrl+\  →  panic
      if ((e.ctrlKey || e.metaKey) && e.key === '\\') {
        e.preventDefault();
        window.location.href = PANIC_URL;
      }
      // "panic word": type "calc" anywhere → panic
      // (kept simple & predictable; not enabled by default to avoid accidental triggers)
    });
  }

  // ----- Public API ----------------------------------------------
  window.Calc99 = {
    renderNav(activeKey) {
      const target = document.getElementById('nav-root') || document.body.firstElementChild;
      const nav = buildNav(activeKey);
      if (target && target.id === 'nav-root') {
        target.replaceWith(nav);
      } else {
        document.body.insertBefore(nav, document.body.firstChild);
      }
      wirePanic();
    },
    panic() { window.location.href = PANIC_URL; },
    el,
  };
})();
