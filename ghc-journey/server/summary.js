// Shared calculations used to ground the advisor in the app's data.

export function planStats(state) {
  const goal = Number(state?.goal) || 0;
  let unlocked = 0;
  let done = 0;
  let total = 0;
  for (const m of state?.milestones || []) {
    const items = m.checklist || [];
    const d = items.filter((i) => i.done).length;
    done += d;
    total += items.length;
    if (items.length) unlocked += ((Number(m.target) || 0) * d) / items.length;
  }
  const booked = (state?.bookings || []).reduce((s, b) => s + (Number(b.amount) || 0), 0);
  return { goal, unlocked: Math.round(unlocked), booked, done, total };
}

const localDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function summarizeState(state, today = new Date()) {
  const stats = planStats(state);
  const reg = state?.registration || {};
  const avg = reg.registrants > 0 ? reg.feesHeld / reg.registrants : 0;
  return {
    today: localDate(today),
    goalUSD: stats.goal,
    plan: {
      unlockedByCompletedActionsUSD: stats.unlocked,
      percentOfGoal: stats.goal ? Math.round((stats.unlocked / stats.goal) * 1000) / 10 : 0,
      actionItemsDone: stats.done,
      actionItemsTotal: stats.total,
      note: 'Unlocked = sum over milestones of (milestone target x share of its checklist completed). It is plan progress, not cash.',
    },
    cashBookedUSD: stats.booked,
    bookings: state?.bookings || [],
    registration: { ...reg, averageFeeUSD: Math.round(avg) },
    sponsors: state?.sponsors || [],
    sampleData: !!state?.sampleData,
    milestones: (state?.milestones || []).map((m) => ({
      title: m.title,
      month: m.month,
      tag: m.tag,
      targetUSD: m.target,
      summary: m.summary,
      checklist: (m.checklist || []).map((i) => ({ item: i.text, done: !!i.done })),
    })),
  };
}
