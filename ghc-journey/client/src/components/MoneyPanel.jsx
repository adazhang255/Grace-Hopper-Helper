import { useState } from 'react';
import { fmtMoney, moneyStats, uid } from '../lib.js';

const CHOICES = [
  ['undecided', 'Undecided'],
  ['credit', 'Credit'],
  ['donate', 'Donate'],
  ['refund', 'Refund'],
];

const LEAD_STATUS = {
  credit: 'Ready to pitch',
  undecided: 'Call first',
  donate: 'Thank and renew',
};

const today = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export default function MoneyPanel({ state, update, onAsk, onReset }) {
  const money = moneyStats(state);
  const reg = state.registration || {};
  const sponsors = state.sponsors || [];
  const bookings = state.bookings || [];

  const setReg = (p) => update((s) => ({ ...s, registration: { ...s.registration, ...p } }));
  const setSponsor = (id, p) => update((s) => ({ ...s, sponsors: s.sponsors.map((x) => (x.id === id ? { ...x, ...p } : x)) }));
  const num = (v) => Math.max(0, Number(v) || 0);

  const leads = sponsors
    .filter((s) => s.rolledOver >= 100000 && s.choice !== 'refund')
    .sort((a, b) => b.rolledOver - a.rolledOver);

  const [booking, setBooking] = useState({ date: today(), source: '', amount: '', note: '' });
  const canBook = booking.source.trim() && Number(booking.amount) > 0;
  const addBooking = (e) => {
    e.preventDefault();
    if (!canBook) return;
    update((s) => ({
      ...s,
      bookings: [{ id: uid(), date: booking.date, source: booking.source.trim(), amount: Number(booking.amount), note: booking.note.trim() }, ...s.bookings],
    }));
    setBooking({ date: today(), source: '', amount: '', note: '' });
  };

  return (
    <div className="panel money">
      {state.sampleData && (
        <p className="notice">
          The sponsors and registration figures below are sample data. Replace them with your real ledger.
        </p>
      )}

      <section>
        <h2>Money held for the canceled event</h2>
        <p className="muted">Treat this as owed until each payer chooses. Only credited or donated money can fund new programs.</p>
        <dl className="held">
          <div className="held-total">
            <dt>Total held</dt>
            <dd>{fmtMoney(money.totalHeld)}</dd>
          </div>
          <div>
            <dt>Kept as credit</dt>
            <dd>{fmtMoney(money.credit)}</dd>
          </div>
          <div>
            <dt>Donated</dt>
            <dd>{fmtMoney(money.donate)}</dd>
          </div>
          <div>
            <dt>Owed as refunds</dt>
            <dd>{fmtMoney(money.refund)}</dd>
          </div>
          <div>
            <dt>Undecided, hold</dt>
            <dd>{fmtMoney(money.undecided)}</dd>
          </div>
        </dl>
      </section>

      <section>
        <h2>Multi-year partnership leads</h2>
        <p className="muted">Sponsors with $100K or more rolled over, who have not asked for a refund.</p>
        {leads.length === 0 ? (
          <p className="empty">No leads yet. Sponsors with $100K or more who choose credit appear here.</p>
        ) : (
          <ul className="leads">
            {leads.map((s) => (
              <li key={s.id}>
                <div>
                  <strong>{s.name}</strong>
                  <span className="muted">{fmtMoney(s.rolledOver)} rolled over</span>
                  <span className="lead-status" data-s={s.choice}>
                    {LEAD_STATUS[s.choice] || 'Review'}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-small"
                  onClick={() =>
                    onAsk(
                      `Draft a short multi-year partnership pitch for ${s.name}. They have ${fmtMoney(s.rolledOver)} rolled over (${s.choice}). Use the credit as year one of a three-year package, and reference the January startup event, the hackathon, and the hiring fair.`
                    )
                  }
                >
                  Draft pitch
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>Sponsor ledger</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Sponsor</th>
                <th>Rolled over (USD)</th>
                <th>Choice</th>
                <th>
                  <span className="sr-only">Remove</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sponsors.map((s) => (
                <tr key={s.id}>
                  <td>
                    <input type="text" value={s.name} aria-label="Sponsor name" onChange={(e) => setSponsor(s.id, { name: e.target.value })} />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      step="5000"
                      value={s.rolledOver}
                      aria-label={`Rolled over amount for ${s.name}`}
                      onChange={(e) => setSponsor(s.id, { rolledOver: num(e.target.value) })}
                    />
                  </td>
                  <td>
                    <select value={s.choice} aria-label={`Choice for ${s.name}`} onChange={(e) => setSponsor(s.id, { choice: e.target.value })}>
                      {CHOICES.map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label={`Remove ${s.name}`}
                      onClick={() => update((st) => ({ ...st, sponsors: st.sponsors.filter((x) => x.id !== s.id) }))}
                    >
                      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                        <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          type="button"
          className="btn btn-small btn-ghost"
          onClick={() => update((s) => ({ ...s, sponsors: [...s.sponsors, { id: uid(), name: 'New sponsor', rolledOver: 0, choice: 'undecided' }] }))}
        >
          Add a sponsor
        </button>
      </section>

      <section>
        <h2>Registration fees</h2>
        <div className="reg-grid">
          <label>
            Registrants
            <input type="number" min="0" value={reg.registrants ?? 0} onChange={(e) => setReg({ registrants: num(e.target.value) })} />
          </label>
          <label>
            Fees held (USD)
            <input type="number" min="0" step="1000" value={reg.feesHeld ?? 0} onChange={(e) => setReg({ feesHeld: num(e.target.value) })} />
          </label>
          <label>
            Chose credit
            <input type="number" min="0" value={reg.credit ?? 0} onChange={(e) => setReg({ credit: num(e.target.value) })} />
          </label>
          <label>
            Chose refund
            <input type="number" min="0" value={reg.refund ?? 0} onChange={(e) => setReg({ refund: num(e.target.value) })} />
          </label>
          <label>
            Chose to donate
            <input type="number" min="0" value={reg.donate ?? 0} onChange={(e) => setReg({ donate: num(e.target.value) })} />
          </label>
        </div>
        <p className="muted">Average fee: {fmtMoney(money.avg)}. Registrants who have not chosen are counted as undecided.</p>
      </section>

      <section>
        <h2>Cash booked</h2>
        <p className="muted">Log real money: signed sponsorships, paid passes, gifts. This is the teal line on the status bar.</p>
        <form className="book-form" onSubmit={addBooking}>
          <label>
            Date
            <input type="date" value={booking.date} onChange={(e) => setBooking({ ...booking, date: e.target.value })} />
          </label>
          <label>
            Source
            <input type="text" value={booking.source} placeholder="Who paid or pledged" onChange={(e) => setBooking({ ...booking, source: e.target.value })} />
          </label>
          <label>
            Amount (USD)
            <input type="number" min="0" step="1000" value={booking.amount} onChange={(e) => setBooking({ ...booking, amount: e.target.value })} />
          </label>
          <label className="span-2">
            Note
            <input type="text" value={booking.note} placeholder="Optional" onChange={(e) => setBooking({ ...booking, note: e.target.value })} />
          </label>
          <button type="submit" className="btn btn-small" disabled={!canBook}>
            Add to ledger
          </button>
        </form>
        {bookings.length === 0 ? (
          <p className="empty">Nothing booked yet.</p>
        ) : (
          <ul className="bookings">
            {bookings.map((b) => (
              <li key={b.id}>
                <div>
                  <strong>{fmtMoney(b.amount)}</strong> from {b.source}
                  <span className="muted">
                    {b.date}
                    {b.note ? `, ${b.note}` : ''}
                  </span>
                </div>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={`Remove booking from ${b.source}`}
                  onClick={() => update((s) => ({ ...s, bookings: s.bookings.filter((x) => x.id !== b.id) }))}
                >
                  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <button
          type="button"
          className="btn btn-small btn-danger"
          onClick={() => {
            if (window.confirm('Reset everything to the starting plan and sample data? Your edits and checked items will be lost.')) onReset();
          }}
        >
          Reset to the starting plan
        </button>
      </section>
    </div>
  );
}
