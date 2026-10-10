/**
 * Calc99 AI Backend
 * =================
 * A minimal Node.js HTTP handler that proxies chat completions to
 * z-ai-web-dev-sdk. The same handler runs on:
 *
 *   - Vercel          (export as default from /api/chat.js)
 *   - Netlify         (export as handler from /netlify/functions/chat.js)
 *   - Render          (use server.js — boots Express on a port)
 *   - Cloudflare      (won't work — z-ai-web-dev-sdk is Node-only)
 *
 * Endpoints:
 *   GET  /health      → { ok: true }
 *   POST /chat        → { reply: "..." }   body: { message, history?, system? }
 *
 * Local dev:
 *   npm install
 *   npm start
 *   # then POST http://localhost:8787/chat with { "message": "hi" }
 *
 * Vercel deploy:
 *   npm i -g vercel && vercel --prod
 *
 * Netlify deploy:
 *   npm i -g netlify && netlify deploy --prod
 *
 * Render deploy:
 *   Create new "Web Service" → connect this folder → Start command: `npm start`
 */

import ZAI from 'z-ai-web-dev-sdk';
import http from 'node:http';

// Singleton — create the SDK instance once and reuse across requests
let _zai = null;
async function getZai() {
  if (!_zai) _zai = await ZAI.create();
  return _zai;
}

// ---- The handler itself --------------------------------------
export async function handler(req, res) {
  // CORS — allow your GitHub Pages origin (and localhost for dev)
  const allowedOrigins = [
    'https://calc99.github.io',
    'http://localhost:8787',
    'http://127.0.0.1:8787',
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin) || !origin) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // GET /health
  if (req.method === 'GET' && req.url.startsWith('/health')) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok: true, ts: Date.now() }));
    return;
  }

  // POST /chat
  if (req.method === 'POST' && req.url.startsWith('/chat')) {
    let body = '';
    for await (const chunk of req) body += chunk;
    let payload;
    try {
      payload = JSON.parse(body || '{}');
    } catch {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Invalid JSON body' }));
      return;
    }

    const userMessage = (payload.message || '').toString().trim();
    if (!userMessage) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'message is required' }));
      return;
    }

    // Build message array (z-ai-web-dev-sdk uses 'assistant' for system prompts)
    const system = (payload.system || 'You are a helpful assistant.').toString();
    const history = Array.isArray(payload.history) ? payload.history : [];

    // Cap history to last 20 messages to keep token count down
    const trimmedHistory = history.slice(-20).map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: String(m.content || ''),
    }));

    const messages = [
      { role: 'assistant', content: system },
      ...trimmedHistory,
      { role: 'user', content: userMessage },
    ];

    try {
      const zai = await getZai();
      const completion = await zai.chat.completions.create({
        messages,
        thinking: { type: 'disabled' },
      });
      const reply = completion.choices?.[0]?.message?.content || '(empty response)';
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ reply }));
    } catch (err) {
      console.error('AI error:', err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        error: 'AI request failed: ' + (err.message || 'unknown error'),
      }));
    }
    return;
  }

  // 404
  res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ error: 'Not found' }));
}

// ---- Boot a standalone server when run directly --------------
// (Vercel/Netlify skip this — they import `handler` as a serverless fn.)
const isMain = process.env.NODE_ENV !== 'production' && !process.env.VERCEL && !process.env.NETLIFY;
if (isMain) {
  const port = Number(process.env.PORT) || 8787;
  const server = http.createServer((req, res) => handler(req, res));
  server.listen(port, () => {
    console.log(`Calc99 AI backend running at http://localhost:${port}`);
    console.log(`  GET  /health`);
    console.log(`  POST /chat   body: { message, history?, system? }`);
  });
}
