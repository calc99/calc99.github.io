# Calc99 AI Backend

A tiny Node serverless function that powers the AI chat at `/home/ai/index.html`. It calls `z-ai-web-dev-sdk` (the GLM model) and returns plain JSON.

**Why a separate backend?** `z-ai-web-dev-sdk` is Node-only — it can't run in the browser, and GitHub Pages can only serve static files. So you deploy this 1-file backend on any free Node host and point the chat at it.

---

## Endpoints

| Method | Path     | Body                                                   | Response                              |
|--------|----------|--------------------------------------------------------|---------------------------------------|
| GET    | `/health`| —                                                      | `{ ok: true, ts: <ms> }`              |
| POST   | `/chat`  | `{ message, history?, system? }`                        | `{ reply: "..." }` or `{ error: "..." }` |

---

## Deploy (pick one — all are free)

### Option A · Vercel (recommended)

1. Push the **entire `/home/ai/server/`** folder to a new GitHub repo (e.g. `calc99-ai-backend`).
2. Go to [vercel.com/new](https://vercel.com/new), import the repo.
3. Framework preset: **Other**. Build command: _(none)_. Output dir: _(none)_.
4. Vercel auto-detects `api.js` as a serverless function → deployed at `https://YOUR-PROJECT.vercel.app/chat`.

### Option B · Render

1. Push `/home/ai/server/` to a new GitHub repo.
2. [render.com](https://render.com) → New → **Web Service** → pick the repo.
3. Build: `npm install` · Start: `npm start` · Plan: **Free**.
4. URL will be `https://YOUR-SERVICE.onrender.com/chat`.

### Option C · Netlify

1. Push `/home/ai/server/` to a new GitHub repo.
2. [netlify.com](https://app.netlify.com) → Add new site → import the repo.
3. Build: `npm install` · Publish dir: `.` · Functions dir: `.` (Netlify will pick up `api.js`).
4. URL will be `https://YOUR-SITE.netlify.app/.netlify/functions/api/chat`.

### Option D · Local-only for testing

```bash
cd /home/ai/server
npm install
npm start
# → http://localhost:8787/chat  (set CHAT_ENDPOINT in /home/ai/chat.js to this URL)
```

---

## Wire it up

After deploy, edit `/home/ai/chat.js` (on GitHub Pages) and set:

```js
const CHAT_ENDPOINT = 'https://YOUR-DEPLOYED-URL/chat';
```

Push, refresh the page, and the chat will go from DEMO mode to real AI.

---

## Local dev / debugging

```bash
# Health check
curl https://YOUR-URL/health

# Send a message
curl -X POST https://YOUR-URL/chat \
  -H 'Content-Type: application/json' \
  -d '{"message":"hi"}'
```

If you get an empty reply, the SDK is loading slowly on a cold start — wait ~10s and retry. If you get `{ error: "AI request failed: ..." }`, the SDK couldn't authenticate; check the platform's function logs.
