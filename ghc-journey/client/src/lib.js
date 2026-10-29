// Shared calculations and helpers.

export const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function monthLabel(key) {
  const [y, m] = String(key || '').split('-');
  const idx = Number(m) - 1;
  if (!y || !(idx >= 0 && idx <= 11)) return 'Unscheduled';
  return `${MONTHS[idx]} ${y}`;
}

export const currentMonthKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

export function fmtMoney(n, { compact = false } = {}) {
  const v = Number(n) || 0;
  if (compact) {
    if (Math.abs(v) >= 1e6) return `$${+(v / 1e6).toFixed(2)}M`;
    if (Math.abs(v) >= 1e3) return `$${Math.round(v / 1e3)}K`;
    return `$${Math.round(v)}`;
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
}

export function milestoneStats(m) {
  const items = m?.checklist || [];
  const done = items.filter((i) => i.done).length;
  const total = items.length;
  const fraction = total ? done / total : 0;
  return { done, total, fraction, unlocked: (Number(m?.target) || 0) * fraction, complete: total > 0 && done === total };
}

// Plan progress: each milestone unlocks its dollar target in proportion to the share of its checklist completed.
export function planStats(state, now = new Date()) {
  const goal = Number(state?.goal) || 0;
  const nowKey = currentMonthKey(now);
  let unlocked = 0;
  let done = 0;
  let total = 0;
  let allocated = 0;
  let dueByNow = 0;
  for (const m of state?.milestones || []) {
    const s = milestoneStats(m);
    unlocked += s.unlocked;
    done += s.done;
    total += s.total;
    allocated += Number(m.target) || 0;
    if (m.month && m.month <= nowKey) dueByNow += Number(m.target) || 0;
  }
  const booked = (state?.bookings || []).reduce((s, b) => s + (Number(b.amount) || 0), 0);
  return { goal, unlocked, booked, done, total, allocated, dueByNow };
}

export function sortMilestones(ms) {
  return ms
    .map((m, i) => ({ m, i }))
    .sort((a, b) => {
      const am = a.m.month || '9999-99';
      const bm = b.m.month || '9999-99';
      return am < bm ? -1 : am > bm ? 1 : a.i - b.i;
    })
    .map((x) => x.m);
}

export function groupByMonth(sorted) {
  const groups = [];
  for (const m of sorted) {
    const key = m.month || '';
    const last = groups[groups.length - 1];
    if (last && last.month === key) last.items.push(m);
    else groups.push({ month: key, items: [m] });
  }
  return groups;
}

// How the held registration and sponsorship money splits by what each payer chose.
export function moneyStats(state) {
  const sponsors = state?.sponsors || [];
  const reg = state?.registration || {};
  const avg = reg.registrants > 0 ? (Number(reg.feesHeld) || 0) / reg.registrants : 0;
  const sumBy = (c) => sponsors.filter((s) => s.choice === c).reduce((a, s) => a + (Number(s.rolledOver) || 0), 0);
  const sponsorHeld = sponsors.reduce((a, s) => a + (Number(s.rolledOver) || 0), 0);
  const regHeld = Number(reg.feesHeld) || 0;
  const decided = (Number(reg.credit) || 0) + (Number(reg.refund) || 0) + (Number(reg.donate) || 0);
  const regUndecided = Math.max(0, (Number(reg.registrants) || 0) - decided);
  const credit = sumBy('credit') + (Number(reg.credit) || 0) * avg;
  const donate = sumBy('donate') + (Number(reg.donate) || 0) * avg;
  const refund = sumBy('refund') + (Number(reg.refund) || 0) * avg;
  const undecided = sumBy('undecided') + regUndecided * avg;
  return { sponsorHeld, regHeld, totalHeld: sponsorHeld + regHeld, credit, donate, refund, undecided, avg };
}

export const TAGS = ['Trust', 'Event', 'Partnership', 'Revenue', 'Programs', 'Giving', 'Finance'];
