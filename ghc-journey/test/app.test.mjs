import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSeedState } from '../server/seed.js';
import { summarizeState, planStats as serverPlanStats } from '../server/summary.js';
import { planStats, moneyStats, milestoneStats, sortMilestones, groupByMonth, fmtMoney, monthLabel } from '../client/src/lib.js';

const NOW = new Date(2026, 9, 28); // Oct 28, 2026

test('seed: milestone targets add up to the $16M goal', () => {
  const s = buildSeedState();
  assert.equal(s.goal, 16_000_000);
  assert.equal(s.milestones.reduce((a, m) => a + m.target, 0), 16_000_000);
});

test('seed: ids are unique, every milestone has action items, tips and a plan', () => {
  const s = buildSeedState();
  const ids = new Set();
  for (const m of s.milestones) {
    assert.ok(!ids.has(m.id), `duplicate milestone id ${m.id}`);
    ids.add(m.id);
    assert.ok(m.checklist.length >= 4, `${m.id} has too few action items`);
    assert.ok(m.tips.length >= 2, `${m.id} has too few tips`);
    assert.ok(m.plan.length > 50, `${m.id} has no plan`);
    const itemIds = new Set(m.checklist.map((i) => i.id));
    assert.equal(itemIds.size, m.checklist.length, `${m.id} has duplicate item ids`);
  }
});

test('seed: covers every month from Oct 2026 to Oct 2027, January holds two milestones', () => {
  const s = buildSeedState();
  const groups = groupByMonth(sortMilestones(s.milestones));
  assert.deepEqual(
    groups.map((g) => g.month),
    ['2026-10', '2026-11', '2026-12', '2027-01', '2027-02', '2027-03', '2027-04', '2027-05', '2027-06', '2027-07', '2027-08', '2027-09', '2027-10']
  );
  assert.equal(groups.find((g) => g.month === '2027-01').items.length, 2);
});

test('seed: follows the sketch (credit option in Nov, free virtual registration in Dec, free event in Jan)', () => {
  const s = buildSeedState();
  const by = (id) => s.milestones.find((m) => m.id === id);
  assert.match(by('m-2026-11').title, /credit option/i);
  assert.match(by('m-2026-12').title, /free virtual registration/i);
  assert.match(by('m-2027-01-event').title, /free virtual event/i);
  assert.match(by('m-2027-01-paid').title, /non-ticket holders/i);
});

test('progress: starts at zero and unlocks in proportion to completed action items', () => {
  const s = buildSeedState();
  assert.equal(planStats(s, NOW).unlocked, 0);
  const m = s.milestones[0]; // 6 items, $500K
  m.checklist.slice(0, 3).forEach((i) => (i.done = true));
  assert.equal(planStats(s, NOW).unlocked, 250_000);
  assert.equal(milestoneStats(m).complete, false);
  m.checklist.forEach((i) => (i.done = true));
  assert.equal(planStats(s, NOW).unlocked, 500_000);
  assert.equal(milestoneStats(m).complete, true);
});

test('progress: finishing every action item reaches exactly the goal', () => {
  const s = buildSeedState();
  s.milestones.forEach((m) => m.checklist.forEach((i) => (i.done = true)));
  const p = planStats(s, NOW);
  assert.equal(p.unlocked, p.goal);
});

test('progress: a milestone with no action items unlocks nothing and does not divide by zero', () => {
  const s = buildSeedState();
  s.milestones.push({ id: 'x', month: '2027-03', title: 'Empty', tag: 'Event', target: 100000, checklist: [], tips: [], plan: '' });
  const p = planStats(s, NOW);
  assert.equal(p.unlocked, 0);
  assert.ok(Number.isFinite(p.unlocked));
});

test('progress: due-by-now counts milestones scheduled this month or earlier', () => {
  const s = buildSeedState();
  assert.equal(planStats(s, NOW).dueByNow, 500_000); // Oct 2026
  assert.equal(planStats(s, new Date(2027, 0, 15)).dueByNow, 500_000 + 1_500_000 + 500_000 + 1_500_000 + 500_000);
});

test('booked cash is summed from the ledger', () => {
  const s = buildSeedState();
  s.bookings.push({ id: 'b1', amount: 250000 }, { id: 'b2', amount: 100000 });
  assert.equal(planStats(s, NOW).booked, 350_000);
});

test('money: sample ledger splits held funds by what each payer chose', () => {
  const m = moneyStats(buildSeedState());
  assert.equal(m.sponsorHeld, 975_000);
  assert.equal(m.regHeld, 2_900_000);
  assert.equal(m.totalHeld, 3_875_000);
  assert.equal(m.credit, 625_000);
  assert.equal(m.donate, 40_000);
  assert.equal(m.refund, 60_000);
  assert.equal(Math.round(m.undecided), 3_150_000);
  assert.equal(Math.round(m.credit + m.donate + m.refund + m.undecided), m.totalHeld);
});

test('server summary for the advisor agrees with the client calculations', () => {
  const s = buildSeedState();
  s.milestones[0].checklist.forEach((i) => (i.done = true));
  s.bookings.push({ id: 'b1', amount: 125000 });
  const sum = summarizeState(s, NOW);
  const client = planStats(s, NOW);
  assert.equal(sum.plan.unlockedByCompletedActionsUSD, Math.round(client.unlocked));
  assert.equal(sum.cashBookedUSD, client.booked);
  assert.equal(sum.goalUSD, 16_000_000);
  assert.equal(sum.milestones.length, s.milestones.length);
  assert.equal(sum.sampleData, true);
  assert.equal(serverPlanStats(s).done, client.done);
});

test('formatting helpers', () => {
  assert.equal(fmtMoney(16_000_000, { compact: true }), '$16M');
  assert.equal(fmtMoney(1_500_000, { compact: true }), '$1.5M');
  assert.equal(fmtMoney(500_000, { compact: true }), '$500K');
  assert.equal(fmtMoney(3_875_000), '$3,875,000');
  assert.equal(monthLabel('2027-01'), 'Jan 2027');
  assert.equal(monthLabel(''), 'Unscheduled');
});
