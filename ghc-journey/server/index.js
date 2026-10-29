import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSeedState } from './seed.js';
import { summarizeState } from './summary.js';
import { SYSTEM_PROMPT } from './prompt.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'state.json');
const CLIENT_DIST = path.join(__dirname, '..', 'client', 'dist');
const PORT = Number(process.env.PORT) || 3001;

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const GEMINI_BASE_URL = (process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta').replace(/\/$/, '');

// ---------- state persistence ----------

function writeState(state) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = `${DATA_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
  fs.renameSync(tmp, DATA_FILE);
}

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    const seed = buildSeedState();
    writeState(seed);
    return seed;
  }
}

function isValidState(s) {
  return (
    s &&
    typeof s === 'object' &&
    Array.isArray(s.milestones) &&
    s.milestones.every((m) => m && typeof m.id === 'string' && Array.isArray(m.checklist)) &&
    Array.isArray(s.sponsors) &&
    Array.isArray(s.bookings) &&
    typeof s.goal === 'number'
  );
}

// ---------- app ----------

const app = express();
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, geminiConfigured: Boolean(process.env.GEMINI_API_KEY), model: GEMINI_MODEL });
});

app.get('/api/state', (_req, res) => {
  res.json(loadState());
});

app.put('/api/state', (req, res) => {
  if (!isValidState(req.body)) {
    return res.status(400).json({ error: 'Invalid state: expected goal, milestones, sponsors and bookings.' });
  }
  writeState(req.body);
  res.json({ ok: true });
});

app.post('/api/state/reset', (_req, res) => {
  const seed = buildSeedState();
  writeState(seed);
  res.json(seed);
});

app.post('/api/chat', async (req, res) => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return res.status(503).json({
      error: 'missing_key',
      message: 'The advisor needs a Gemini API key. Add GEMINI_API_KEY=your-key to server/.env and restart the server.',
    });
  }

  const raw = Array.isArray(req.body?.messages) ? req.body.messages : [];
  let messages = raw
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.text === 'string' && m.text.trim())
    .slice(-20)
    .map((m) => ({ role: m.role, text: m.text.trim().slice(0, 6000) }));
  while (messages.length && messages[0].role !== 'user') messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== 'user') {
    return res.status(400).json({ error: 'bad_request', message: 'Send at least one user message.' });
  }

  const state = isValidState(req.body?.state) ? req.body.state : loadState();
  const context = JSON.stringify(summarizeState(state));

  const body = {
    systemInstruction: { parts: [{ text: `${SYSTEM_PROMPT}\n\nCURRENT APP DATA (JSON):\n${context}` }] },
    contents: messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.text }] })),
    generationConfig: { temperature: 0.4, maxOutputTokens: 2048 },
  };

  try {
    const r = await fetch(`${GEMINI_BASE_URL}/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify(body),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      const msg = data?.error?.message || `Gemini returned status ${r.status}.`;
      return res.status(502).json({ error: 'gemini_error', message: msg });
    }
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const text = parts.map((p) => p.text || '').join('').trim();
    if (!text) {
      const reason = data?.promptFeedback?.blockReason || data?.candidates?.[0]?.finishReason || 'no text returned';
      return res.status(502).json({ error: 'empty_response', message: `Gemini returned no answer (${reason}). Try rephrasing the question.` });
    }
    res.json({ text });
  } catch (err) {
    res.status(502).json({ error: 'network', message: `Could not reach Gemini: ${err.message}` });
  }
});

// Serve the built React app in production.
if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  app.get(/^(?!\/api\/).*/, (_req, res) => res.sendFile(path.join(CLIENT_DIST, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`GHC journey server listening on http://localhost:${PORT}`);
  if (!process.env.GEMINI_API_KEY) console.log('Advisor is off: add GEMINI_API_KEY to server/.env to turn it on.');
});
