# Journey to $16M

A planning app for AnitaB.org's recovery after the 2026 Grace Hopper Celebration cancellation. It turns registration and sponsorship credits into revenue through a smaller virtual hiring event (a startup Shark Tank pitch and a partner-sponsored hackathon), and tracks progress toward $16M.

React front end, Node/Express back end, Gemini-powered advisor.

## Run it

You need Node 18 or newer.

```bash
npm run setup          # installs root, server and client packages
cp server/.env.example server/.env
# open server/.env and add your key:  GEMINI_API_KEY=...
npm run dev            # server on :3001, app on http://localhost:5173
```

For a single-process production run: `npm start` builds the client and serves everything from http://localhost:3001.

The advisor stays off until `GEMINI_API_KEY` is set. Everything else works without it. `GEMINI_MODEL` defaults to `gemini-2.5-flash` and can be changed in `server/.env`.

Run the checks with `npm test`.

## What is in it

**Status bar (always visible).** Dollars unlocked toward $16M, a bar with one tick per milestone (click a tick to jump to it), action items done, and how far ahead or behind the plan is for today's date. A thin teal line under the bar shows cash actually booked.

**Timeline (vertical, editable).** One month at a time, Oct 2026 to Oct 2027, following your sketch: information update with the credit option (Nov), free virtual registration (Dec), free virtual event with startups and paid access for non-ticket holders (Jan), then partnerships, hackathon, hiring fair, and the months after. Each milestone has:
- a checklist you can tick off, edit, add to and delete from
- a draft plan (markdown, editable)
- tips (editable)
- editable month, revenue target and type, and a delete button
- "Ask the advisor about this", which sends the milestone to the chat

Use **Add milestone** to put a new one on any month.

**How the status bar is calculated.** Each milestone has a revenue target. Ticking an action item unlocks that milestone's target in proportion: 3 of 6 items done on a $500K milestone unlocks $250K. This measures plan progress, not cash. Real money goes in the **Cash booked** ledger, which is shown separately so the two are never confused. If your milestone targets stop adding up to $16M, the timeline header says by how much.

**Money tab.**
- Money held for the canceled event, split into kept as credit, donated, owed as refunds, and undecided
- Multi-year partnership leads: sponsors with $100K or more rolled over, with a "Draft pitch" button that sends the sponsor's details to the advisor
- Editable sponsor ledger and registration figures
- Cash booked ledger

**Advisor tab.** A chat that answers as a financial and legal advisor, grounded in whatever is in the app at the moment you ask (milestones, which items are done, sponsors, registration funds, bookings). The key stays on the server and is never sent to the browser.

## Important notes

- **The sponsor names, amounts and registration figures are sample data.** Replace them in the Money tab. The advisor is told when data is marked as sample.
- **Milestone dollar targets and the month plan are suggestions.** They add up to $16M but are starting points to edit, not forecasts.
- **Held money is treated as owed until each payer chooses.** The app and the advisor both assume refundable money must not be invested. Confirm what is refundable, restricted or already spent with counsel.
- **The advisor is general guidance.** It is not a lawyer, CPA or financial advisor. Use it to prepare questions for your counsel and auditors.
- Edits save automatically to `server/data/state.json`. "Reset to the starting plan" at the bottom of the Money tab restores the seed.

## Layout

```
server/
  index.js      Express API: state, reset, health, advisor chat (Gemini)
  seed.js       the starting plan: 14 milestones with checklists, tips, drafts
  summary.js    app data summary that grounds the advisor
  prompt.js     the advisor's instructions
client/src/
  App.jsx       state, autosave, layout
  lib.js        progress and money calculations
  components/   ProgressBar, Timeline, Milestone, MoneyPanel, Advisor
test/           unit tests (node --test)
```
