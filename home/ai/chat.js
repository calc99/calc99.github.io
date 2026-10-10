/* =================================================================
   CALC99 :: AI Chat client
   =================================================================
   Talks to a small backend (see ./server/api.js) that proxies
   z-ai-web-dev-sdk. The backend URL is configured below.

   If you haven't deployed the backend yet, set CHAT_ENDPOINT = ''
   and the chat will fall back to canned "demo mode" responses so
   you can still see the UI working.
   ================================================================= */

(function () {
  'use strict';

  // ⚠️ CHANGE THIS to your deployed backend URL.
  // Examples:
  //   'https://calc99-ai.vercel.app/api/chat'
  //   'https://calc99-ai.netlify.app/.netlify/functions/chat'
  //   'https://calc99-ai.onrender.com/chat'
  // Leave empty ('') to use demo mode (canned responses, no AI).
  const CHAT_ENDPOINT = '';

  // System prompt — tweak to your taste
  const SYSTEM_PROMPT = "You are Calc99 Assistant, a friendly and concise AI chatbot embedded in a stealthy school-bypass site. Keep answers short, useful, and slightly cheeky. If asked about homework, help with the concept but don't just hand over the answer.";

  // Conversation history (last 20 messages to keep payload small)
  const MAX_HISTORY = 20;
  let history = [];

  const chatLog    = document.getElementById('chat-log');
  const msgInput   = document.getElementById('msg-input');
  const sendBtn    = document.getElementById('send-btn');
  const clearBtn   = document.getElementById('clear-btn');
  const chatMeta   = document.getElementById('chat-meta');
  const chatStatus = document.getElementById('chat-status');

  function setStatus(state, text) {
    chatMeta.classList.remove('online', 'offline', 'connecting');
    chatMeta.classList.add(state);
    chatStatus.textContent = text;
  }

  // ----- Render helpers -----------------------------------------
  function addMessage(role, content) {
    history.push({ role, content });
    if (history.length > MAX_HISTORY) history = history.slice(-MAX_HISTORY);

    const wrap = document.createElement('div');
    wrap.className = 'msg ' + (role === 'user' ? 'user' : 'ai');

    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = role === 'user' ? 'YOU' : 'AI';

    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = content;

    wrap.appendChild(avatar);
    wrap.appendChild(bubble);
    chatLog.appendChild(wrap);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  function addTyping() {
    const wrap = document.createElement('div');
    wrap.className = 'msg ai';
    wrap.id = 'typing-msg';
    wrap.innerHTML = `
      <div class="avatar">AI</div>
      <div class="bubble" style="display:flex; gap:4px; align-items:center;">
        <span class="typing-dot" style="width:6px;height:6px;border-radius:50%;background:var(--cyan);animation:typingBounce 1s ease-in-out infinite;"></span>
        <span class="typing-dot" style="width:6px;height:6px;border-radius:50%;background:var(--cyan);animation:typingBounce 1s ease-in-out infinite 0.2s;"></span>
        <span class="typing-dot" style="width:6px;height:6px;border-radius:50%;background:var(--cyan);animation:typingBounce 1s ease-in-out infinite 0.4s;"></span>
      </div>
    `;
    // Inject keyframes once
    if (!document.getElementById('typing-keyframes')) {
      const s = document.createElement('style');
      s.id = 'typing-keyframes';
      s.textContent = `
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
      `;
      document.head.appendChild(s);
    }
    chatLog.appendChild(wrap);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  function removeTyping() {
    const el = document.getElementById('typing-msg');
    if (el) el.remove();
  }

  // ----- Send logic ---------------------------------------------
  async function send() {
    const text = msgInput.value.trim();
    if (!text) return;

    addMessage('user', text);
    msgInput.value = '';
    msgInput.style.height = 'auto';
    sendBtn.disabled = true;
    addTyping();

    try {
      const reply = await callBackend(text);
      removeTyping();
      addMessage('assistant', reply);
    } catch (err) {
      removeTyping();
      addMessage('assistant', '⚠ ' + (err.message || 'Something went wrong.'));
    } finally {
      sendBtn.disabled = false;
      msgInput.focus();
    }
  }

  async function callBackend(userText) {
    // DEMO MODE — no backend deployed yet
    if (!CHAT_ENDPOINT) {
      await new Promise(r => setTimeout(r, 700));
      return demoReply(userText);
    }

    const res = await fetch(CHAT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userText,
        history: history.slice(0, -1),   // exclude the just-added user msg
        system: SYSTEM_PROMPT,
      }),
    });

    if (!res.ok) {
      const t = await res.text().catch(() => '');
      throw new Error(`Backend ${res.status}: ${t.slice(0, 200)}`);
    }

    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data.reply || '(empty)';
  }

  // ----- Demo-mode canned responses (only when no backend) -------
  function demoReply(userText) {
    const t = userText.toLowerCase();
    if (t.includes('hello') || t.includes('hi') || t === 'hey') {
      return "Hey! I'm running in DEMO mode right now — the chat UI works but there's no real AI behind it yet. Edit /home/ai/chat.js and set CHAT_ENDPOINT to your deployed backend to make me real. (Deploy instructions are in /home/ai/server/README.md.)";
    }
    if (t.includes('how are you')) {
      return "I'm a pile of canned strings in DEMO mode. I'll be a real GLM model once you wire up the backend — see /home/ai/server/README.md.";
    }
    return "DEMO MODE: I can only echo back canned responses. To make me a real AI:\n\n1. Open /home/ai/server/README.md\n2. Deploy the Node function to Vercel/Netlify/Render\n3. Edit /home/ai/chat.js → set CHAT_ENDPOINT\n\nYour message was: \"" + userText + "\"";
  }

  // ----- Auto-resize textarea -----------------------------------
  msgInput.addEventListener('input', () => {
    msgInput.style.height = 'auto';
    msgInput.style.height = Math.min(msgInput.scrollHeight, 140) + 'px';
  });

  // Enter to send, Shift+Enter for newline
  msgInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });

  sendBtn.addEventListener('click', send);
  clearBtn.addEventListener('click', () => {
    history = [];
    chatLog.innerHTML = '';
    addMessage('assistant', 'Chat cleared. What would you like to talk about?');
  });

  // ----- Boot ---------------------------------------------------
  async function boot() {
    if (!CHAT_ENDPOINT) {
      setStatus('offline', 'DEMO MODE — no backend configured. See /home/ai/server/README.md.');
    } else {
      setStatus('connecting', 'Connecting to backend…');
      try {
        const r = await fetch(CHAT_ENDPOINT.replace(/\/chat.*$/, '/health') || CHAT_ENDPOINT, { method: 'GET' });
        if (r.ok) setStatus('online', 'Connected — AI is live.');
        else setStatus('offline', 'Backend responded ' + r.status);
      } catch {
        setStatus('offline', 'Backend unreachable. Will retry on send.');
      }
    }

    addMessage('assistant',
      CHAT_ENDPOINT
        ? "Hi! I'm Calc99 AI. Ask me anything — homework help, code, random trivia, whatever."
        : "👋 Hi! I'm Calc99 AI running in DEMO mode. The chat UI is fully working, but I'm not connected to a real model yet. Edit /home/ai/chat.js and set CHAT_ENDPOINT to your deployed backend to bring me online."
    );
    msgInput.focus();
  }

  boot();
})();
