/**
 * Calc99 AI Backend (Groq edition)
 * Calls Groq's OpenAI-compatible API.
 *
 * Endpoints:
 *   GET  /health   → { ok: true, provider: "groq", model }
 *   POST /chat     → { reply: "..." }   body: { message, history?, system? }
 *
 * Required env var: GROQ_API_KEY (from https://console.groq.com/keys)
 * Optional env var: GROQ_MODEL (default: "llama-3.3-70b-versatile")
 */

import http from 'node:http';

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

async function callGroq(messages) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY environment variable is not set');

  const res = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Groq ${res.status}: ${txt.slice(0, 300)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '(empty)';
}

export async function handler(req, res) {
  const allowedOrigins = ['https://calc99.github.io', 'http://localhost:8787', 'http://127.0.0.1:8787'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin) || !origin) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return; }

  if (req.method === 'GET' && req.url.startsWith('/health')) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok: true, ts: Date.now(), provider: 'groq', model: GROQ_MODEL }));
    return;
  }

  if (req.method === 'POST' && req.url.startsWith('/chat')) {
    let body = '';
    for await (const chunk of req) body += chunk;
    let payload;
    try { payload = JSON.parse(body || '{}'); }
    catch { res.statusCode = 400; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ error: 'Invalid JSON body' })); return; }

    const userMessage = (payload.message || '').toString().trim();
    if (!userMessage) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'message is required' }));
      return;
    }

    const system = (payload.system || 'You are a helpful assistant.').toString();
    const history = Array.isArray(payload.history) ? payload.history : [];
    const trimmedHistory = history.slice(-20).map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content || ''),
    }));
    const messages = [
      { role: 'system', content: system },
      ...trimmedHistory,
      { role: 'user', content: userMessage },
    ];

    try {
      const reply = await callGroq(messages);
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ reply }));
    } catch (err) {
      console.error('Groq call failed:', err.message);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'AI request failed: ' + (err.message || 'unknown error') }));
    }
    return;
  }

  res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ error: 'Not found' }));
}

const isMain = process.env.NODE_ENV !== 'production' && !process.env.VERCEL && !process.env.NETLIFY;
if (isMain) {
  const port = Number(process.env.PORT) || 8787;
  http.createServer((req, res) => handler(req, res)).listen(port, () => {
    console.log(`Calc99 AI backend (Groq) running at http://localhost:${port}`);
    if (!process.env.GROQ_API_KEY) console.log(`  ⚠ GROQ_API_KEY not set. Get one at https://console.groq.com/keys`);
  });
}
