import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import AutoText from './AutoText.jsx';
import { TAGS, fmtMoney, milestoneStats, uid } from '../lib.js';

function AddRow({ placeholder, buttonLabel, onAdd }) {
  const [text, setText] = useState('');
  const submit = () => {
    const t = text.trim();
    if (!t) return;
    onAdd(t);
    setText('');
  };
  return (
    <div className="add-row">
      <input
        type="text"
        value={text}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
      />
      <button type="button" className="btn btn-small" onClick={submit} disabled={!text.trim()}>
        {buttonLabel}
      </button>
    </div>
  );
}

export default function Milestone({ m, expanded, onToggle, onChange, onDelete, onAsk }) {
  const [tab, setTab] = useState('plan');
  const [editing, setEditing] = useState(false);
  const [editPlan, setEditPlan] = useState(false);
  const { done, total, fraction, complete } = milestoneStats(m);

  const patch = (p) => onChange({ ...m, ...p });
  const setItems = (checklist) => patch({ checklist });
  const toggleItem = (id) => setItems(m.checklist.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));
  const editItem = (id, text) => setItems(m.checklist.map((i) => (i.id === id ? { ...i, text } : i)));
  const removeItem = (id) => setItems(m.checklist.filter((i) => i.id !== id));
  const addItem = (text) => setItems([...m.checklist, { id: uid(), text, done: false }]);

  const tips = m.tips || [];
  const setTips = (next) => patch({ tips: next });

  return (
    <article id={`ms-${m.id}`} className={`ms${expanded ? ' open' : ''}${complete ? ' complete' : ''}`}>
      <button
        type="button"
        className="ms-head"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={`msb-${m.id}`}
      >
        <span className="ms-main">
          <span className="ms-title">{m.title}</span>
          <span className="chip" data-tag={m.tag}>
            {m.tag}
          </span>
        </span>
        <span className="ms-side">
          <span className="ms-money">{fmtMoney(m.target, { compact: true })}</span>
          <span className="ms-count">
            {done} of {total} done
          </span>
        </span>
        <span className="ms-mini" aria-hidden="true">
          <i style={{ width: `${fraction * 100}%` }} />
        </span>
        <svg className="chev" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {expanded && (
        <div id={`msb-${m.id}`} className="ms-body">
          {editing ? (
            <div className="edit-grid">
              <label>
                Title
                <input type="text" value={m.title} onChange={(e) => patch({ title: e.target.value })} />
              </label>
              <label>
                Month
                <input type="month" value={m.month} onChange={(e) => patch({ month: e.target.value })} />
              </label>
              <label>
                Revenue target (USD)
                <input
                  type="number"
                  min="0"
                  step="50000"
                  value={m.target}
                  onChange={(e) => patch({ target: Math.max(0, Number(e.target.value) || 0) })}
                />
              </label>
              <label>
                Type
                <select value={m.tag} onChange={(e) => patch({ tag: e.target.value })}>
                  {TAGS.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
              <label className="span-2">
                Summary
                <AutoText className="plain-area" value={m.summary || ''} onChange={(v) => patch({ summary: v })} onEnter={() => {}} />
              </label>
            </div>
          ) : (
            m.summary && <p className="ms-summary">{m.summary}</p>
          )}

          <h3 className="sub">Action items</h3>
          {m.checklist.length === 0 && <p className="empty">No action items yet. Add the first step below.</p>}
          <ul className="checklist">
            {m.checklist.map((it) => (
              <li key={it.id} className={it.done ? 'item done' : 'item'}>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={it.done}
                    onChange={() => toggleItem(it.id)}
                    aria-label={`Mark done: ${it.text}`}
                  />
                  <span className="box" aria-hidden="true">
                    <svg viewBox="0 0 16 16" width="12" height="12">
                      <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </label>
                <AutoText
                  className="item-text"
                  value={it.text}
                  onChange={(v) => editItem(it.id, v)}
                  aria-label="Action item"
                />
                <button type="button" className="icon-btn" onClick={() => removeItem(it.id)} aria-label={`Delete action item: ${it.text}`}>
                  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
          <AddRow placeholder="Add an action item" buttonLabel="Add item" onAdd={addItem} />

          <div className="seg" role="tablist" aria-label="Plan and tips">
            <button type="button" role="tab" aria-selected={tab === 'plan'} className={tab === 'plan' ? 'on' : ''} onClick={() => setTab('plan')}>
              Draft plan
            </button>
            <button type="button" role="tab" aria-selected={tab === 'tips'} className={tab === 'tips' ? 'on' : ''} onClick={() => setTab('tips')}>
              Tips ({tips.length})
            </button>
          </div>

          {tab === 'plan' && (
            <div className="plan" role="tabpanel">
              {editPlan ? (
                <>
                  <AutoText
                    className="plan-area"
                    value={m.plan || ''}
                    onChange={(v) => patch({ plan: v })}
                    onEnter={() => {}}
                    aria-label="Draft plan (supports markdown)"
                  />
                  <button type="button" className="btn btn-small" onClick={() => setEditPlan(false)}>
                    Done editing
                  </button>
                </>
              ) : m.plan ? (
                <>
                  <div className="md">
                    <ReactMarkdown>{m.plan}</ReactMarkdown>
                  </div>
                  <button type="button" className="btn btn-small btn-ghost" onClick={() => setEditPlan(true)}>
                    Edit plan
                  </button>
                </>
              ) : (
                <>
                  <p className="empty">No draft plan yet. Write one, or ask the advisor to draft it from the action items.</p>
                  <div className="row-gap">
                    <button type="button" className="btn btn-small" onClick={() => setEditPlan(true)}>
                      Write a plan
                    </button>
                    <button
                      type="button"
                      className="btn btn-small btn-ghost"
                      onClick={() => onAsk(`Draft a plan for the milestone "${m.title}" (${m.month}) using its action items. Include owners, a week-by-week sequence, and the risks to watch.`)}
                    >
                      Ask the advisor to draft it
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {tab === 'tips' && (
            <div className="tips" role="tabpanel">
              {tips.length === 0 && <p className="empty">No tips yet. Add one below.</p>}
              <ul>
                {tips.map((t, idx) => (
                  <li key={idx}>
                    <AutoText
                      className="item-text"
                      value={t}
                      onChange={(v) => setTips(tips.map((x, i) => (i === idx ? v : x)))}
                      aria-label="Tip"
                    />
                    <button type="button" className="icon-btn" onClick={() => setTips(tips.filter((_, i) => i !== idx))} aria-label={`Delete tip: ${t}`}>
                      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                        <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
              <AddRow placeholder="Add a tip" buttonLabel="Add tip" onAdd={(t) => setTips([...tips, t])} />
            </div>
          )}

          <div className="ms-actions">
            <button
              type="button"
              className="btn btn-small"
              onClick={() => onAsk(`Give me advice on the milestone "${m.title}" (${m.month}, target ${fmtMoney(m.target)}). What are the financial and legal risks, and what should we do first?`)}
            >
              Ask the advisor about this
            </button>
            <button type="button" className="btn btn-small btn-ghost" onClick={() => setEditing((e) => !e)}>
              {editing ? 'Done editing details' : 'Edit details'}
            </button>
            <button
              type="button"
              className="btn btn-small btn-danger"
              onClick={() => {
                if (window.confirm(`Delete the milestone "${m.title}" and its ${m.checklist.length} action items?`)) onDelete();
              }}
            >
              Delete milestone
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
