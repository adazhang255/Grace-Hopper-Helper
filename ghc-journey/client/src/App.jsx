import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import ProgressBar from './components/ProgressBar.jsx';
import Timeline from './components/Timeline.jsx';
import MoneyPanel from './components/MoneyPanel.jsx';
import Advisor from './components/Advisor.jsx';
import { milestoneStats, planStats, sortMilestones, uid } from './lib.js';

export default function App() {
  const [state, setState] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [saveStatus, setSaveStatus] = useState('saved');
  const [expandedId, setExpandedId] = useState(null);
  const [panel, setPanel] = useState('money');
  const [prompt, setPrompt] = useState(null);
  const [configured, setConfigured] = useState(null);

  const latest = useRef(null);
  const timer = useRef(null);
  const headerRef = useRef(null);

  const load = useCallback(async () => {
    setLoadError('');
    try {
      const [s, h] = await Promise.all([fetch('/api/state'), fetch('/api/health')]);
      if (!s.ok) throw new Error(`status ${s.status}`);
      const data = await s.json();
      latest.current = data;
      setState(data);
      const first = sortMilestones(data.milestones).find((m) => !milestoneStats(m).complete);
      setExpandedId(first ? first.id : null);
      if (h.ok) setConfigured((await h.json()).geminiConfigured);
    } catch (err) {
      setLoadError(`Could not load the plan from the server (${err.message}). Make sure the server is running.`);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = useCallback(async (keepalive = false) => {
    timer.current = null;
    try {
      const res = await fetch('/api/state', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(latest.current),
        keepalive,
      });
      setSaveStatus(res.ok ? 'saved' : 'error');
    } catch {
      setSaveStatus('error');
    }
  }, []);

  const update = useCallback(
    (fn) => {
      const next = fn(latest.current);
      latest.current = next;
      setState(next);
      setSaveStatus('saving');
      clearTimeout(timer.current);
      timer.current = setTimeout(() => save(), 500);
    },
    [save]
  );

  // Flush any pending save when the tab closes.
  useEffect(() => {
    const flush = () => {
      if (timer.current) {
        clearTimeout(timer.current);
        save(true);
      }
    };
    window.addEventListener('beforeunload', flush);
    return () => window.removeEventListener('beforeunload', flush);
  }, [save]);

  // Keep the sticky header height available to CSS (for the side panel and scroll offsets).
  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return undefined;
    const set = () => document.documentElement.style.setProperty('--header-h', `${el.offsetHeight}px`);
    set();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, [state === null]);

  const jumpTo = (id) => {
    setExpandedId(id);
    setTimeout(() => {
      const el = document.getElementById(`ms-${id}`);
      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      el?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }, 30);
  };

  const isNarrow = () => window.matchMedia?.('(max-width: 1020px)').matches;
  const scrollToSide = () => setTimeout(() => document.querySelector('.side')?.scrollIntoView({ block: 'start' }), 30);

  const askAdvisor = (text) => {
    setPanel('advisor');
    setPrompt({ text, nonce: uid() });
    if (isNarrow()) scrollToSide();
  };

  // Bottom navigation on narrow screens: the side panel sits below the timeline there.
  const goTo = (target) => {
    if (target === 'timeline') {
      document.querySelector('.journey')?.scrollIntoView({ block: 'start' });
    } else {
      setPanel(target);
      scrollToSide();
    }
  };

  const changeMilestone = (id, next) =>
    update((s) => ({ ...s, milestones: s.milestones.map((m) => (m.id === id ? next : m)) }));

  const deleteMilestone = (id) => {
    update((s) => ({ ...s, milestones: s.milestones.filter((m) => m.id !== id) }));
    if (expandedId === id) setExpandedId(null);
  };

  const addMilestone = ({ title, month, target, tag }) => {
    const id = `m-${uid()}`;
    update((s) => ({
      ...s,
      milestones: [...s.milestones, { id, month, title, tag, target, summary: '', checklist: [], tips: [], plan: '' }],
    }));
    setTimeout(() => jumpTo(id), 0);
    return id;
  };

  const reset = async () => {
    try {
      const res = await fetch('/api/state/reset', { method: 'POST' });
      if (!res.ok) throw new Error();
      const data = await res.json();
      latest.current = data;
      setState(data);
      setSaveStatus('saved');
      const first = sortMilestones(data.milestones)[0];
      setExpandedId(first ? first.id : null);
    } catch {
      setSaveStatus('error');
    }
  };

  if (loadError) {
    return (
      <div className="boot">
        <h1>Journey to $16M</h1>
        <p>{loadError}</p>
        <button type="button" className="btn" onClick={load}>
          Try again
        </button>
      </div>
    );
  }
  if (!state) {
    return (
      <div className="boot">
        <h1>Journey to $16M</h1>
        <p>Loading the plan...</p>
      </div>
    );
  }

  const stats = planStats(state);
  const ordered = sortMilestones(state.milestones);

  return (
    <div className="app">
      <header ref={headerRef} className="top">
        <ProgressBar stats={stats} ordered={ordered} onJump={jumpTo} saveStatus={saveStatus} />
      </header>

      <main className="layout">
        <section className="journey" aria-label="Timeline">
          <Timeline
            milestones={state.milestones}
            goal={state.goal}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
            onChange={changeMilestone}
            onDelete={deleteMilestone}
            onAdd={addMilestone}
            onAsk={askAdvisor}
          />
        </section>

        <aside className="side" aria-label="Money and advisor">
          <div className="tabs" role="tablist">
            <button type="button" role="tab" aria-selected={panel === 'money'} className={panel === 'money' ? 'on' : ''} onClick={() => setPanel('money')}>
              Money
            </button>
            <button type="button" role="tab" aria-selected={panel === 'advisor'} className={panel === 'advisor' ? 'on' : ''} onClick={() => setPanel('advisor')}>
              Advisor
            </button>
          </div>
          <div hidden={panel !== 'money'}>
            <MoneyPanel state={state} update={update} onAsk={askAdvisor} onReset={reset} />
          </div>
          <div hidden={panel !== 'advisor'}>
            <Advisor state={state} prompt={prompt} configured={configured} />
          </div>
        </aside>
      </main>

      <nav className="mobile-nav" aria-label="Sections">
        <button type="button" onClick={() => goTo('timeline')}>
          Timeline
        </button>
        <button type="button" className={panel === 'money' ? 'on' : ''} onClick={() => goTo('money')}>
          Money
        </button>
        <button type="button" className={panel === 'advisor' ? 'on' : ''} onClick={() => goTo('advisor')}>
          Advisor
        </button>
      </nav>
    </div>
  );
}
