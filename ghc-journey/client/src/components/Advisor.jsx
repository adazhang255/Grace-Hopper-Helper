import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';

const STORE_KEY = 'ghc-advisor-chat-v1';

const SUGGESTIONS = [
  'Where do we stand against the $16M goal, and what is the biggest risk?',
  'How should we record sponsor credits in our books?',
  'What should the sponsor credit agreement say?',
  'What legal terms do we need for the Shark Tank pitch and the hackathon?',
];

function loadChat() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
    return Array.isArray(raw) ? raw.filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.text === 'string') : [];
  } catch {
    return [];
  }
}

export default function Advisor({ state, prompt, configured }) {
  const [messages, setMessages] = useState(loadChat);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const endRef = useRef(null);
  const lastNonce = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(messages.slice(-40)));
    } catch {
      /* storage can be unavailable; the chat still works in memory */
    }
    endRef.current?.scrollIntoView?.({ block: 'end' });
  }, [messages, busy, notice]);

  async function send(text) {
    const t = (text ?? input).trim();
    if (!t || busy) return;
    const next = [...messages, { role: 'user', text: t }];
    setMessages(next);
    setInput('');
    setNotice('');
    setBusy(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next, state }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNotice(data.message || `The advisor returned an error (status ${res.status}).`);
      } else {
        setMessages([...next, { role: 'assistant', text: data.text }]);
      }
    } catch {
      setNotice('Could not reach the server. Check that it is running, then try again.');
    } finally {
      setBusy(false);
    }
  }

  // A prompt sent from elsewhere in the app (for example "Draft the pitch").
  useEffect(() => {
    if (prompt && prompt.nonce !== lastNonce.current) {
      lastNonce.current = prompt.nonce;
      send(prompt.text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt?.nonce]);

  return (
    <div className="panel advisor">
      <div className="adv-head">
        <h2>Financial and legal advisor</h2>
        <p className="muted">
          Answers use the data in this app: money, timeline and events. General guidance only. Check high-stakes decisions with your counsel and auditors.
        </p>
        {configured === false && (
          <p className="notice">
            Advisor is off. Add <code>GEMINI_API_KEY=your-key</code> to <code>server/.env</code> and restart the server.
          </p>
        )}
      </div>

      <div className="chat" role="log" aria-live="polite" aria-label="Advisor conversation">
        {messages.length === 0 && (
          <div className="suggest">
            <p className="muted">Try one of these:</p>
            {SUGGESTIONS.map((s) => (
              <button key={s} type="button" className="chip-btn" onClick={() => send(s)} disabled={busy}>
                {s}
              </button>
            ))}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`msg msg-${m.role}`}>
            {m.role === 'assistant' ? (
              <div className="md">
                <ReactMarkdown>{m.text}</ReactMarkdown>
              </div>
            ) : (
              <p>{m.text}</p>
            )}
          </div>
        ))}
        {busy && <div className="msg msg-assistant typing">Thinking about it...</div>}
        {notice && <div className="msg msg-error">{notice}</div>}
        <div ref={endRef} />
      </div>

      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <textarea
          value={input}
          rows={2}
          placeholder="Ask about cash, credits, contracts, or the plan"
          aria-label="Message the advisor"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <div className="composer-row">
          {messages.length > 0 && (
            <button type="button" className="btn btn-small btn-ghost" onClick={() => { setMessages([]); setNotice(''); }}>
              Clear chat
            </button>
          )}
          <button type="submit" className="btn" disabled={busy || !input.trim()}>
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
