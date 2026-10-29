import { useState } from 'react';
import Milestone from './Milestone.jsx';
import { TAGS, currentMonthKey, fmtMoney, groupByMonth, milestoneStats, monthLabel, sortMilestones } from '../lib.js';

function AddMilestone({ onAdd, onCancel }) {
  const [title, setTitle] = useState('');
  const [month, setMonth] = useState(currentMonthKey());
  const [target, setTarget] = useState(0);
  const [tag, setTag] = useState('Event');
  const ok = title.trim() && month;

  return (
    <form
      className="add-ms"
      onSubmit={(e) => {
        e.preventDefault();
        if (ok) onAdd({ title: title.trim(), month, target: Math.max(0, Number(target) || 0), tag });
      }}
    >
      <h3>New milestone</h3>
      <div className="edit-grid">
        <label className="span-2">
          Title
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="For example: Sign the second hackathon sponsor" autoFocus />
        </label>
        <label>
          Month
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        </label>
        <label>
          Revenue target (USD)
          <input type="number" min="0" step="50000" value={target} onChange={(e) => setTarget(e.target.value)} />
        </label>
        <label>
          Type
          <select value={tag} onChange={(e) => setTag(e.target.value)}>
            {TAGS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="row-gap">
        <button type="submit" className="btn" disabled={!ok}>
          Add milestone
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function Timeline({ milestones, goal, expandedId, setExpandedId, onChange, onDelete, onAdd, onAsk }) {
  const [adding, setAdding] = useState(false);
  const groups = groupByMonth(sortMilestones(milestones));
  const nowKey = currentMonthKey();
  const allocated = milestones.reduce((s, m) => s + (Number(m.target) || 0), 0);
  const diff = goal - allocated;

  return (
    <div>
      <div className="tl-head">
        <div>
          <h2>Monthly commitments</h2>
          {diff === 0 ? (
            <p className="muted">Milestone targets add up to the {fmtMoney(goal, { compact: true })} goal.</p>
          ) : diff > 0 ? (
            <p className="muted warn-text">
              Targets cover {fmtMoney(allocated, { compact: true })}. Add or resize milestones to find the other {fmtMoney(diff, { compact: true })}.
            </p>
          ) : (
            <p className="muted">Targets total {fmtMoney(allocated, { compact: true })}, {fmtMoney(-diff, { compact: true })} above the goal.</p>
          )}
        </div>
        <button type="button" className="btn" onClick={() => setAdding(true)} disabled={adding}>
          Add milestone
        </button>
      </div>

      {adding && (
        <AddMilestone
          onCancel={() => setAdding(false)}
          onAdd={(v) => {
            const id = onAdd(v);
            setAdding(false);
            setExpandedId(id);
          }}
        />
      )}

      <ol className="timeline">
        {groups.map((g) => {
          const allDone = g.items.every((m) => milestoneStats(m).complete);
          const isNow = g.month === nowKey;
          return (
            <li key={g.month || 'none'} className="month" data-done={allDone} data-now={isNow}>
              <span className="node" aria-hidden="true">
                {allDone && (
                  <svg viewBox="0 0 16 16" width="12" height="12">
                    <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <h3 className="month-name">
                {monthLabel(g.month)}
                {isNow && <span className="now">This month</span>}
              </h3>
              <div className="cards">
                {g.items.map((m) => (
                  <Milestone
                    key={m.id}
                    m={m}
                    expanded={expandedId === m.id}
                    onToggle={() => setExpandedId(expandedId === m.id ? null : m.id)}
                    onChange={(next) => onChange(m.id, next)}
                    onDelete={() => onDelete(m.id)}
                    onAsk={onAsk}
                  />
                ))}
              </div>
            </li>
          );
        })}
      </ol>
      {groups.length === 0 && <p className="empty">The timeline is empty. Add the first milestone.</p>}
    </div>
  );
}
