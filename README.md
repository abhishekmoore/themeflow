# ThemeFlow

ThemeFlow reads a block of customer feedback and groups it into 3–6 themes. Each theme comes with supporting quotes taken from the paste and one suggested product action.

It is a small TypeScript MERN app: React, Express, MongoDB, and an OpenAI-compatible model. If you do not set a model key, it still runs. The screen is labeled as offline clustering, not as a model judgment.

This is a product **aid**. It does not decide the roadmap.

## What you can do

- Paste several feedback lines (or a block of text).
- Get 3–6 themes, each with quotes and one action.
- Save the analysis and reopen it later.
- Delete an analysis you do not want to keep.

Quotes are only allowed to come from the pasted text. The model prompt forbids invented customers, metrics, and features. The offline checker does not invent quotes either.

## Stack

| Piece | Choice |
| --- | --- |
| UI | React 19, TypeScript, Vite, Tailwind CSS |
| Data fetching | TanStack Query, axios |
| Dates | date-fns |
| API | Express 4, TypeScript, Zod, helmet, cors |
| Data | MongoDB via Mongoose, or an in-memory store |
| Model | `openai` SDK against any compatible base URL |
| Tests | `node:test` through `tsx` |

## Run it

Node 20 or newer.

```bash
cp .env.example .env
npm install
npm run dev
```

Open the Vite URL printed in the terminal (port 5173). The API is on port 4000. Vite proxies `/api` to it.

Production-style, one process:

```bash
npm run build
npm start
```

Then open port 4000. Express serves the built React app.

## Environment

| Variable | Required | Purpose |
| --- | --- |
| `PORT` | No | API port. Default `4000`. |
| `MONGO_URI` | No | Example: `mongodb://127.0.0.1:27017/themeflow`. If empty, analyses live in memory and vanish when the process stops. |
| `OPENAI_API_KEY` | No | If empty, ThemeFlow uses the offline clustering. |
| `OPENAI_BASE_URL` | No | Use this for xAI, Groq, OpenRouter, or a local server. |
| `OPENAI_MODEL` | No | Default `gpt-4o-mini`. |

Do not commit `.env`.

## API

`GET /api/health` — `{ ok, store: "memory" \| "mongo", ai: "model" \| "heuristic", model }`

`GET /api/analyses?limit=20` — newest first, limit 1–50.

`POST /api/analyses` — body `{ feedbackText, title? }`. Text must be 40–20,000 characters. Returns the saved analysis.

`GET /api/analyses/:id`

`DELETE /api/analyses/:id` — `204` when removed.

## Scripts

```bash
npm test
npm run typecheck
npm run build
```

GitHub Actions runs those three on every push.

## Limits

- The offline clustering is a simple bucketing of lines. It does not understand nuance.
- The model can still be wrong. Read the feedback yourself before you trust a theme.
- There is no login. Anyone who can reach the server can read saved feedback. Do not point this at the public internet with real customer data.

Design notes for someone changing the code are in [DEVELOPER.md](DEVELOPER.md).
