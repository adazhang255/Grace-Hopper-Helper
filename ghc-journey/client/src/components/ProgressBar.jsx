import { fmtMoney, milestoneStats, monthLabel } from '../lib.js';

const SAVE_TEXT = { saved: 'All changes saved', saving: 'Saving...', error: 'Could not save. Retrying on your next change.' };

export default function ProgressBar({ stats, ordered, onJump, saveStatus }) {
  const { goal, unlocked, booked, done, total, dueByNow } = stats;
  const pct = goal ? Math.min(100, (unlocked / goal) * 100) : 0;
  const bookedPct = goal ? Math.min(100, (booked / goal) * 100) : 0;
  const gap = unlocked - dueByNow;

  let cum = 0;
  const ticks = ordered.map((m) => {
    cum += Number(m.target) || 0;
    return {
      id: m.id,
      pos: goal ? Math.min(100, (cum / goal) * 100) : 0,
      complete: milestoneStats(m).complete,
      label: `${monthLabel(m.month)}: ${m.title} (${fmtMoney(m.target, { compact: true })})`,
    };
  });

  return (
    <div className="status">
      <div className="status-top">
        <div className="status-title">
          <h1>Journey to {fmtMoney(goal, { compact: true })}</h1>
          <p>AnitaB.org recovery plan, October 2026 to October 2027</p>
        </div>

        <div className="status-figure" aria-live="polite">
          <span className="big">{fmtMoney(unlocked, { compact: true })}</span>
          <span className="of">
            unlocked of {fmtMoney(goal, { compact: true })} ({Math.round(pct)}%)
          </span>
        </div>

        <dl className="status-stats">
          <div>
            <dt>Cash booked</dt>
            <dd>{fmtMoney(booked, { compact: true })}</dd>
          </div>
          <div>
            <dt>Action items</dt>
            <dd>
              {done} of {total}
            </dd>
          </div>
          <div>
            <dt>Against plan</dt>
            <dd className={gap >= 0 ? 'good' : 'warn'}>
              {gap >= 0 ? 'On or ahead' : `${fmtMoney(-gap, { compact: true })} behind`}
            </dd>
          </div>
        </dl>
      </div>

      <div
        className="bar"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
        aria-label={`${fmtMoney(unlocked)} unlocked of ${fmtMoney(goal)} goal`}
      >
        <div className="bar-track">
          <div className="bar-fill" style={{ width: `${pct}%` }} />
          <div className="bar-booked" style={{ width: `${bookedPct}%` }} />
        </div>
        {ticks.map((t) => (
          <button
            key={t.id}
            type="button"
            className="tick"
            data-complete={t.complete}
            style={{ left: `${t.pos}%` }}
            title={t.label}
            aria-label={`Go to ${t.label}`}
            onClick={() => onJump(t.id)}
          />
        ))}
      </div>

      <div className="status-foot">
        <span className="legend">
          <i className="sw sw-plan" /> Unlocked by completed action items
        </span>
        <span className="legend">
          <i className="sw sw-cash" /> Cash booked in the ledger
        </span>
        <span className={`save save-${saveStatus}`}>{SAVE_TEXT[saveStatus]}</span>
      </div>
    </div>
  );
}
