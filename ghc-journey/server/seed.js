// Seed data for the AnitaB.org recovery planner.
// Milestones follow the "Journey to 16" sketch (Oct 2026 - Oct 2027) and fill in the
// empty months. Dollar targets add up to the $16M goal and are all editable in the app.
// Sponsor names, amounts and registration figures are SAMPLE placeholders: replace them
// with the real ledger in the Money tab.

const mk = (id, month, title, tag, target, summary, checklist, tips, plan) => ({
  id,
  month,
  title,
  tag,
  target,
  summary,
  checklist: checklist.map((text, i) => ({ id: `${id}-c${i + 1}`, text, done: false })),
  tips,
  plan,
});

export function buildSeedState() {
  const milestones = [
    mk(
      'm-2026-10',
      '2026-10',
      'Ring-fence the money and set the recovery plan',
      'Trust',
      500000,
      'Treat registration and sponsorship receipts as owed until each payer chooses. Stabilize cash, get counsel on obligations, and name who owns the recovery.',
      [
        'Move all 2026 registration and sponsorship receipts into a separate, insured holding account',
        'Build one ledger of every payer: amount, payment date, and refund / credit / donate status',
        'Meet counsel on what is refundable, restricted, or already spent on the Anaheim event',
        'Ask the venue, hotels and vendors in writing for rebooking credits and reduced cancellation fees',
        'Build a 13-week cash forecast and name its weekly owner',
        'Brief the board on the plan and the $16M target, and agree who can approve credits and contracts',
      ],
      [
        'Do not invest or lend money that may be owed back. Keep it in cash or short-term Treasuries until each payer chooses.',
        'Venue and hotel contracts often allow rebooking credits. Ask for them in writing before the cancellation fee is invoiced.',
        'Ask your auditor how credits should be recorded. They are generally treated as deferred until services are delivered, not as revenue on the day a payer elects them.',
        'Update the cash forecast every week. Funders ask for it first.',
      ],
      `**Goal:** make every dollar traceable before anyone is asked for anything.

**Week 1**
- Open a separate holding account for all 2026 registration and sponsorship receipts.
- Export every payment into one ledger (payer, amount, date, method, refund / credit / donate status).
- Pause non-essential spending and list every contract tied to the Anaheim event.

**Week 2**
- Meet counsel on what is refundable, what is restricted, and what has already been spent.
- Open conversations with the venue, hotels and vendors about rebooking credits.
- Build the 13-week cash forecast.

**Weeks 3 and 4**
- Present the recovery plan and the $16M target to the board.
- Agree decision rights: who can approve credits, discounts, and contracts.`
    ),

    mk(
      'm-2026-11',
      '2026-11',
      'Send the information update with the credit option',
      'Trust',
      1500000,
      'Tell registrants and sponsors what happened and what comes next, and give each of them three clear choices: refund, credit, or donation.',
      [
        'Draft the update: what happened, what is next, and the three choices',
        'Have counsel review the refund wording and the credit terms (expiry, transferability, what it can buy)',
        'Build a simple choice form with a deadline, with separate registrant and sponsor versions',
        'Call every sponsor who paid $100K or more before the email goes out',
        'Publish a FAQ and a dedicated contact address',
        'Track responses daily on the ledger and follow up with anyone undecided',
      ],
      [
        'Sponsors who hear from an executive before they read the email are far more likely to choose credit.',
        'Keep credit terms simple: one expiry date, transferable to a colleague, usable for any program in the plan.',
        'Give a firm deadline for choices (30 days is common) and say what happens if someone does not respond. Check that default with counsel.',
      ],
      `**Three choices for every payer:** refund, credit, or donation.

**Registrants**
- Credit valid for 24 months, usable for the virtual events, the hackathon, the hiring fair, or GHC 2027.
- Refund on request, with a clear date.
- Option to donate the fee.

**Sponsors**
- A personal call from an executive before the written update.
- Credit can be split across several programs or extended into a multi-year agreement.
- Consider a bonus (for example 10% extra credit) for sponsors that convert the credit into a multi-year commitment. Run the cost past counsel and finance first.

**Timeline**
- Week 1: sponsor calls, then registrant email.
- Weeks 2 to 4: follow-up and reminders, with the choice deadline at the end of the month.`
    ),

    mk(
      'm-2026-12',
      '2026-12',
      'Open free virtual registration',
      'Event',
      500000,
      'Registration for the virtual event opens, free for 2026 ticket holders. Sign-ups build the audience that sponsors and employers are paying to reach.',
      [
        'Launch the registration page, free for 2026 ticket holders, collecting skills, level, location and consent to share with employers',
        'Set a sign-up goal and a weekly pace tracker',
        'Announce the agenda: startup showcase, Shark Tank pitch, and hackathon preview',
        'Open sponsor and exhibitor packages, with credits redeemable at checkout',
        'Ask employee resource groups, universities and past attendees to spread the word',
        'Sign the virtual platform contract and complete a privacy and security review',
      ],
      [
        'Sponsors buy audience. Report sign-ups to them weekly, by role and seniority.',
        'Collect consent to share profiles with employers at sign-up. It is much harder to add later.',
        'Choose a platform that supports pitch sessions, breakout rooms and recruiter chat in one place.',
      ],
      `**Purpose:** turn goodwill into a measurable audience.

- **Week 1:** launch the page, send the announcement to every 2026 registrant and to the full email list.
- **Weeks 2 and 3:** partner outreach to universities, employee resource groups and community groups; sponsor calls using the sign-up count as proof.
- **Week 4:** agenda announcement and early reminders.

**Measure:** sign-ups per week, share who consent to employer sharing, sponsor packages sold.`
    ),

    mk(
      'm-2027-01-event',
      '2027-01',
      'Run the free virtual event with the startup showcase',
      'Event',
      1500000,
      'The comeback event: a free virtual gathering with a Shark Tank-style startup pitch and a partner such as Y Combinator. It rebuilds reputation and shows sponsors what the new format delivers.',
      [
        'Sign a headline partner (for example Y Combinator or another accelerator) with a written agreement',
        'Select 5 to 8 startups founded or led by women technologists for the pitch',
        'Recruit the panel of investors and sponsors, and agree prize terms with counsel',
        'Cross-promote with Grace Hopper Celebration India (Bangalore, January 20 to 22, 2027)',
        'Run a full rehearsal and tech check, and publish the run-of-show',
        'Send an impact report to attendees, sponsors and press within a week',
      ],
      [
        'Have the partner or the judges fund any prize money. AnitaB.org should not promise cash it has not raised.',
        'Get written contest rules (eligibility, judging, IP, who owns what is pitched) reviewed before applications open.',
        'Record every session. The recordings are content for sponsors and a reason for people to join the next event.',
      ],
      `**Purpose:** rebuild reputation and prove the new format.

**Format (suggested)**
- Opening session with a short, honest account of what happened and what is changing.
- Startup showcase with a Shark Tank-style pitch: 5 to 8 founders, each pitching to a panel.
- Career sessions and recruiter chat running alongside.

**Partner**
- Approach Y Combinator or a comparable accelerator to co-host the pitch, supply judges, and sponsor a prize.
- Offer them visibility to the audience and the founders in return.

**Follow-up**
- Impact report within a week: attendance, pitches, introductions made, and what comes next.
- Use the report in every sponsor conversation that follows.`
    ),

    mk(
      'm-2027-01-paid',
      '2027-01',
      'Start paid access for non-ticket holders',
      'Revenue',
      500000,
      'People who did not hold a 2026 ticket pay to join. Ticket and credit holders get a free pass, which keeps the credit option attractive.',
      [
        'Set price tiers for people without a 2026 ticket (student, professional, employer-paid)',
        'Add checkout and receipts, and check what tax and receipt rules apply',
        'Issue free pass codes to 2026 ticket holders and credit holders',
        'Offer employer bulk passes',
        'Review pricing and conversion after the first week',
      ],
      [
        'Keep student pricing low. Students are the pipeline that employers pay to reach.',
        'Employer bulk passes sell well when bundled with a recruiting package.',
        'Ask counsel whether any part of the pass price should be treated as a donation for receipts.',
      ],
      `**Principle:** free for people who already paid, paid for new attendees.

- Student and early-career tier, professional tier, and employer-paid tier.
- Pass codes for every 2026 ticket holder and every credit holder.
- Bulk employer passes, bundled with recruiting packages.

Review sales after week one and adjust price tiers, not the free pass for existing ticket holders.`
    ),

    mk(
      'm-2027-02',
      '2027-02',
      'Offer multi-year partnerships to sponsors with $100K or more rolled over',
      'Partnership',
      2000000,
      'Sponsors who chose credit are the warmest leads in the plan. The credit becomes year one of a longer partnership, backed by the January event results.',
      [
        'Rank sponsors by rolled-over amount and mark every $100K+ credit as a priority lead',
        'Prepare the three-year proposal: credit applied to year one, commitments for years two and three, talent-pipeline benefits',
        'Book executive-level meetings with each priority lead',
        'Offer tiered packages with a price lock for early signers',
        'Bring proof: sign-ups, startup pitches, hiring outcomes, and the January impact report',
        'Record each signed commitment with its payment schedule in the ledger',
      ],
      [
        'Lead with what the sponsor gets (hiring pipeline, brand, access to startups). Mention the credit as the reason to act now, not as the pitch.',
        'Price-lock the later years to reward early commitment, and keep the lock expiring so it creates urgency.',
        'Make the first ask a meeting, not a contract.',
      ],
      `**Pitch in one line:** your credit already pays for year one; sign three years and lock the price and the benefits.

**Package**
- Year one funded by the existing credit.
- Years two and three at a locked price, with payment schedules.
- Benefits: priority access to the hiring fair and hackathon talent, a startup showcase presence, and annual impact reporting.

**Process**
1. Rank the leads and assign an owner to each.
2. Executive meeting using the January results.
3. Written proposal within 48 hours.
4. Counsel-reviewed agreement, then record the pledge and payment dates.`
    ),

    mk(
      'm-2027-03',
      '2027-03',
      'Run the partner-sponsored hackathon',
      'Event',
      1500000,
      'A hackathon sponsored by a partner such as Y Combinator, with company-sponsored challenge tracks and a direct line into the April hiring fair.',
      [
        'Sign the sponsor agreement: prize pool, judges, challenge theme',
        'Open hackathon registration and recruit mentors',
        'Publish rules, IP terms and judging criteria after legal review',
        'Sell company-sponsored challenge tracks',
        'Run the hackathon and announce winners',
        'Invite participants into the hiring fair with their consent',
      ],
      [
        'Sell tracks, not just logos. A company that sets a challenge gets code, candidates and a story.',
        'Settle IP ownership in the rules. Participants normally keep their work unless they agree otherwise.',
        'Match mentors to teams early. Teams with a mentor finish more projects.',
      ],
      `**Format:** a weekend or week-long online hackathon with 3 to 5 company-sponsored tracks.

- Partner funds the prize pool and supplies judges.
- Each track sponsor sets a challenge, mentors a few teams, and gets first look at participants.
- Winners present at the April hiring fair.

**Revenue:** track sponsorships, partner sponsorship, and credit redemption by existing sponsors.`
    ),

    mk(
      'm-2027-04',
      '2027-04',
      'Host the virtual hiring fair',
      'Event',
      1500000,
      'The core revenue event: employers pay for booths, recruiter access and interview slots with candidates built up from the earlier events.',
      [
        'Sell employer booth and recruiter packages, applying credits first',
        'Build candidate profiles from earlier events, with consent, and set up matching',
        'Schedule interview slots for each employer',
        'Run the fair and track interviews and offers',
        'Send each employer a results report and open renewal conversations',
      ],
      [
        'Employers renew when they can see interviews and hires. Track both from the first day.',
        'Sell packages in tiers: booth only, booth plus interview slots, and booth plus a hackathon track.',
        'Use credits first. A sponsor who spends credit has a reason to buy more.',
      ],
      `**Revenue lines**
- Employer booth and recruiter packages
- Interview-slot bundles
- Candidate access subscriptions for employers who want year-round access

**Proof for renewals:** interviews scheduled, offers made, and hires reported by each employer.`
    ),

    mk(
      'm-2027-05',
      '2027-05',
      'Decide on GHC 2027 and sell early sponsors',
      'Partnership',
      1000000,
      'Use the sponsor and registration numbers so far to decide whether a large in-person GHC 2027 is safe to commit to, with the venue contract protected against another cancellation.',
      [
        'Set a go / no-go test: sponsor commitments and early-bird registrations needed before signing a venue',
        'Negotiate venue terms with cancellation protection and staged payments',
        'Open early-bird sponsorships to current partners',
        'Announce the decision and the plan to the community',
      ],
      [
        'Write the go / no-go test before looking at the numbers, so the decision is not bent by hope.',
        'Staged venue payments tied to sponsorship milestones limit the downside.',
        'A smaller or hybrid GHC is a legitimate outcome of the test.',
      ],
      `**Test:** commit to the venue only when sponsor commitments cover a set share of the event budget (the board should set the number) and early-bird registrations are on pace.

**If the test passes:** sign with staged payments and cancellation protection, open early-bird sponsorship, announce.

**If it does not:** announce a smaller or hybrid format and keep the credits working in the virtual programs.`
    ),

    mk(
      'm-2027-06',
      '2027-06',
      'Sell workforce programs to employers',
      'Programs',
      1000000,
      'Training and apprenticeship programs that employers fund, built on the community and the pipeline created by the earlier events.',
      [
        'Package technical apprenticeship and upskilling programs with clear per-seat pricing',
        'Pitch current sponsors and hiring-fair employers first',
        'Sign program contracts with delivery schedules',
        'Set outcome measures (placements, retention) to report back to funders',
      ],
      [
        'Program contracts are steadier than event revenue. Aim for annual terms.',
        'Report outcomes in plain numbers. Funders respond to placements and retention.',
      ],
      `**Offer:** employer-funded apprenticeship and upskilling cohorts, priced per seat.

**Who to ask first:** sponsors who bought hiring-fair packages and said they struggle to find qualified candidates.

**Proof:** cohort outcomes, with employer testimonials from the spring events.`
    ),

    mk(
      'm-2027-07',
      '2027-07',
      'Launch the donor campaign',
      'Giving',
      1500000,
      'A rebuild campaign aimed at foundations, major donors and alumni, with matching gifts to draw more in.',
      [
        'Write the case for support using the first six months of results',
        'Line up one or two matching-gift commitments before the public launch',
        'Approach foundations and major donors with specific asks',
        'Check charitable-solicitation registration and donor acknowledgment requirements with counsel',
        'Launch the community campaign and report progress weekly',
      ],
      [
        'A match makes every smaller gift go further. Secure it before launch.',
        'Give donors a concrete outcome for each gift level, for example a scholarship seat or a startup showcase slot.',
        'Send acknowledgment letters with the right wording promptly.',
      ],
      `**Audiences**
- Foundations focused on women in technology and workforce development
- Major donors and alumni
- Community donors through a public campaign with a matching gift

**Sequence:** quiet phase with major donors and matches first, public launch second.`
    ),

    mk(
      'm-2027-08',
      '2027-08',
      'Grow benchmarking and regional programs',
      'Programs',
      1000000,
      'Extend what already exists: company benchmarking, regional events and the India program, sold as year-round memberships rather than one-off tickets.',
      [
        'Package benchmarking and reporting for employers as an annual membership',
        'Sell regional and community event sponsorships',
        'Identify cross-sell opportunities with GHC India partners',
        'Renew or upgrade the first multi-year partners',
      ],
      [
        'Annual memberships smooth revenue between events.',
        'Offer existing partners a bundle of benchmarking, regional presence and hiring access.',
      ],
      `**Principle:** turn one-time buyers into annual members.

Bundle benchmarking, regional events and hiring access into membership tiers and offer them to every partner who bought at least one earlier package.`
    ),

    mk(
      'm-2027-09',
      '2027-09',
      'Close GHC 2027 sponsors and registration',
      'Event',
      1000000,
      'If the go / no-go test passed, close remaining sponsorships and push early registration. If not, apply the same push to the largest virtual program.',
      [
        'Close remaining sponsor packages and collect first payments',
        'Launch the early registration push with partner and employee-group promotion',
        'Confirm vendor and venue payments follow the staged schedule',
        'Publish a progress update to the community',
      ],
      [
        'Collect sponsor payments on a schedule that matches venue payments.',
        'Public progress updates rebuild trust and show registrants that the event is on solid ground.',
      ],
      `**Focus:** convert the pipeline built since January into signed, paid commitments, and keep the event budget funded ahead of every venue payment.`
    ),

    mk(
      'm-2027-10',
      '2027-10',
      'Year-end close: renewals and results report',
      'Finance',
      1000000,
      'Close the year, report results to funders and sponsors, and renew the partners who made it possible.',
      [
        'Reconcile the ledger: credits used, refunds paid, donations received, cash booked',
        'Publish a results report to the board, sponsors and the community',
        'Open renewal conversations with every partner',
        'Set the next 12-month plan and target',
      ],
      [
        'Reconcile credits carefully. Unused credit is a liability until it is used or expires.',
        'A clear results report is the best renewal pitch.',
      ],
      `**Deliverables:** reconciled ledger, results report, renewal pipeline, and the plan for the next twelve months.`
    ),
  ];

  return {
    version: 1,
    goal: 16000000,
    startDate: '2026-10',
    sampleData: true,
    milestones,
    registration: {
      registrants: 4200,
      feesHeld: 2900000,
      credit: 0,
      refund: 0,
      donate: 0,
    },
    sponsors: [
      { id: 's1', name: 'Sponsor A (sample)', rolledOver: 250000, choice: 'credit' },
      { id: 's2', name: 'Sponsor B (sample)', rolledOver: 180000, choice: 'credit' },
      { id: 's3', name: 'Sponsor C (sample)', rolledOver: 150000, choice: 'undecided' },
      { id: 's4', name: 'Sponsor D (sample)', rolledOver: 120000, choice: 'credit' },
      { id: 's5', name: 'Sponsor E (sample)', rolledOver: 100000, choice: 'undecided' },
      { id: 's6', name: 'Sponsor F (sample)', rolledOver: 75000, choice: 'credit' },
      { id: 's7', name: 'Sponsor G (sample)', rolledOver: 60000, choice: 'refund' },
      { id: 's8', name: 'Sponsor H (sample)', rolledOver: 40000, choice: 'donate' },
    ],
    bookings: [],
  };
}
