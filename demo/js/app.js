(function () {
  'use strict';
  const api = window.FlyAPI;

  // Mock data is anchored to this date. Once live data is connected, use today's date instead.
  const AS_OF = '2026-10-11';
  // Shows a "Demo account" marker. Set to false once real client data is connected.
  const DEMO = true;

  // ---------------------------------------------------------------- helpers
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = (n, d = 0) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  const int = (n) => Math.round(n).toLocaleString('en-US');
  const pct = (n, d = 0) => (isFinite(n) ? (n * 100).toFixed(d) : '0') + '%';
  const div = (a, b) => (b ? a / b : 0);
  const parseDate = (s) => new Date(s + 'T12:00:00');
  const fmtDate = (s, opts) => parseDate(s).toLocaleDateString('en-US', opts || { month: 'short', day: 'numeric' });
  const daysBetween = (a, b) => Math.round((parseDate(b) - parseDate(a)) / 86400000);
  const addDays = (s, n) => { const d = parseDate(s); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
  const monthLabel = (p, long) => new Date(p + '-15T12:00:00').toLocaleDateString('en-US', long ? { month: 'long', year: 'numeric' } : { month: 'short' });
  const weekLabel = (w) => { const end = addDays(w.start, 6); return fmtDate(w.start) + ' – ' + fmtDate(end, { month: parseDate(end).getMonth() === parseDate(w.start).getMonth() ? undefined : 'short', day: 'numeric' }) + ', ' + w.start.slice(0, 4); };
  const sum = (rows, k) => rows.reduce((a, r) => a + (r[k] || 0), 0);
  const change = (cur, prev) => (prev ? (cur - prev) / prev : 0);

  const P = {
    grid: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
    funnel: '<path d="M3 4h18l-7 8.5V19l-4 2v-8.5z"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    kanban: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 7v7M12 7v4M16 7v9"/>',
    file: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
    settings: '<path d="M12.2 2h-.4a2 2 0 0 0-2 2v.2a2 2 0 0 1-1 1.7l-.4.3a2 2 0 0 1-2 0l-.2-.1a2 2 0 0 0-2.7.7l-.2.4a2 2 0 0 0 .7 2.7l.2.1a2 2 0 0 1 1 1.7v.5a2 2 0 0 1-1 1.7l-.2.1a2 2 0 0 0-.7 2.7l.2.4a2 2 0 0 0 2.7.7l.2-.1a2 2 0 0 1 2 0l.4.3a2 2 0 0 1 1 1.7v.2a2 2 0 0 0 2 2h.4a2 2 0 0 0 2-2v-.2a2 2 0 0 1 1-1.7l.4-.3a2 2 0 0 1 2 0l.2.1a2 2 0 0 0 2.7-.7l.2-.4a2 2 0 0 0-.7-2.7l-.2-.1a2 2 0 0 1-1-1.7v-.5a2 2 0 0 1 1-1.7l.2-.1a2 2 0 0 0 .7-2.7l-.2-.4a2 2 0 0 0-2.7-.7l-.2.1a2 2 0 0 1-2 0l-.4-.3a2 2 0 0 1-1-1.7V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    up: '<path d="m7 17 10-10M8 7h9v9"/>',
    down: '<path d="m7 7 10 10M17 8v9H8"/>',
    flat: '<path d="M5 12h14"/>',
    patient: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="m16 11 2 2 4-4"/>',
    dollar: '<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
    wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    edit: '<path d="M12 20h9M16.4 3.6a2 2 0 0 1 2.9 2.9L7 18.8l-4 1 1-4z"/>',
    trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    alert: '<path d="m21.7 18-8-14a2 2 0 0 0-3.5 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3"/><path d="M12 9v4M12 17h.01"/>',
    xcircle: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>',
    okcircle: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    send: '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12"/><circle cx="12" cy="12" r="3"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    play: '<path d="M7 4v16l13-8z" fill="currentColor"/>',
    chev: '<path d="m9 18 6-6-6-6"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    sparkle: '<path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 15.5-6.2L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.5 6.2L3 16M8 16H3v5"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
    mouse: '<path d="M9 9l5 12 1.8-5.2L21 14z"/><path d="M7.2 2.2 8 5.1M5.1 8l-2.9-.8M14 4.1 12 6.2M6.2 12l-2.1 2"/>',
    inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1"/>',
  };
  const icon = (n, cls) => `<svg ${cls ? `class="${cls}"` : ''} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n] || ''}</svg>`;

  const NAV = [
    { id: 'overview',  label: 'Overview',  icon: 'grid' },
    { id: 'funnel',    label: 'Funnel',    icon: 'funnel' },
    { id: 'creatives', label: 'Creatives', icon: 'image' },
    { id: 'leads',     label: 'Leads',     icon: 'users' },
    { id: 'pipeline',  label: 'Pipeline',  icon: 'kanban', internal: true },
    { id: 'reports',   label: 'Reports',   icon: 'file' },
    { id: 'settings',  label: 'Settings',  icon: 'settings', internal: true },
  ];

  const LEAD_STATUSES = ['new', 'contacted', 'booked', 'showed', 'converted', 'lost'];
  const SOURCES = { meta_ads: 'Meta Ads', organic: 'Organic', referral: 'Referral', reactivation: 'Reactivation' };
  const STAGES = [
    { id: 'new', label: 'New Lead', color: '#60A5FA' },
    { id: 'contacted', label: 'Contacted', color: '#F59E0B' },
    { id: 'scheduled', label: 'Call Scheduled', color: '#6EE7B7' },
    { id: 'held', label: 'Call Held', color: '#34D399' },
    { id: 'negotiating', label: 'Negotiating', color: '#10B981' },
    { id: 'closed', label: 'Closed', color: '#059669' },
    { id: 'lost', label: 'Lost', color: '#EF4444' },
  ];
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  // ---------------------------------------------------------------- state
  const store = {
    get(k, d) { try { const v = localStorage.getItem('fly-ui-' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('fly-ui-' + k, JSON.stringify(v)); } catch (e) { /* ignore */ } },
  };
  const state = {
    clients: [], clientId: null, mode: store.get('mode', 'operator'), locked: false, token: null,
    route: 'overview', param: null, charts: [], renderId: 0,
    ui: {
      range: '30d', from: addDays(AS_OF, -30), to: AS_OF, openStages: {},
      cFormat: 'all', cStatus: 'all', cDate: 'all', cSort: 'cpr',
      lStatus: 'all', lSource: 'all', lDate: 'all', lQuery: '',
      tSort: 'costPerResult', tDir: 1, reportWeek: null,
    },
  };
  const client = () => state.clients.find((c) => c.id === state.clientId) || state.clients[0];
  const isOperator = () => state.mode === 'operator' && !state.locked;
  const navItems = () => NAV.filter((n) => isOperator() || !n.internal);

  // ---------------------------------------------------------------- shell
  // Fly Marketing wordmark, same artwork as flymarketing.agency. Each copy gets its own gradient id:
  // a gradient defined inside a hidden (display:none) SVG would not paint in the visible one.
  let logoSeq = 0;
  function logoSvg(ink) {
    const id = 'flyArrow' + ++logoSeq;
    return `<svg class="logo-svg" viewBox="-3 -1 120 58" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#0fb872"/><stop offset="1" stop-color="#a8f05c"/></linearGradient></defs><g fill="${ink}"><rect x="0" y="8" width="11.5" height="46"/><rect x="0" y="8" width="34" height="11.5"/><rect x="0" y="27" width="29" height="11"/><rect x="40" y="8" width="11.5" height="46"/><rect x="40" y="42.5" width="31" height="11.5"/></g><path d="M68.5 9 L87 31.5 V54" fill="none" stroke="${ink}" stroke-width="11.5" stroke-linejoin="round"/><path d="M87 31.5 L109 6.5" fill="none" stroke="url(#${id})" stroke-width="11.5" stroke-linecap="round"/><path d="M95 5 H110 V20" fill="none" stroke="url(#${id})" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }
  function brand() {
    return `<a class="brand" href="${href('overview')}" aria-label="Fly Marketing home">${logoSvg('#f2f5f3')}<span class="brand-sub">Marketing</span></a>`;
  }
  function href(route, param) {
    const base = state.locked ? '#/c/' + state.token + '/' : '#/';
    return base + route + (param ? '/' + param : '');
  }
  function clientPicker() {
    if (!isOperator()) {
      const c = client();
      return `<div class="client-static"><strong>${esc(c.practiceName)}</strong><span>${esc(c.location)}</span></div>`;
    }
    return `<div class="client-select"><select data-change="client" aria-label="Select client">${state.clients
      .map((c) => `<option value="${esc(c.id)}" ${c.id === state.clientId ? 'selected' : ''}>${esc(c.practiceName)}</option>`)
      .join('')}</select></div>`;
  }
  function renderShell() {
    const items = navItems();
    $('#sidebar').innerHTML = `
      ${brand()}
      <div><span class="field-label">${isOperator() ? 'Client' : 'Practice'}</span>${clientPicker()}</div>
      <nav class="nav" aria-label="Primary">${items.map((n) => `
        <a href="${href(n.id)}" class="${state.route === n.id ? 'active' : ''}" ${state.route === n.id ? 'aria-current="page"' : ''}>
          ${icon(n.icon)}<span>${n.label}</span>${n.internal ? '<span class="tag">Internal</span>' : ''}
        </a>`).join('')}
      </nav>
      <div class="sidebar-foot">
        ${DEMO ? '<div class="demo-tag"><span class="dot green"></span>Demo account</div>' : ''}
        ${state.locked ? `<div class="foot-note">Your growth dashboard, managed by Fly Marketing.</div>` : `
          <span class="field-label">View as</span>
          <div class="view-toggle" role="group" aria-label="View mode">
            <button data-action="mode" data-mode="operator" class="${state.mode === 'operator' ? 'on' : ''}">Operator</button>
            <button data-action="mode" data-mode="client" class="${state.mode === 'client' ? 'on' : ''}">Client</button>
          </div>
          <div class="foot-note">${state.mode === 'client' ? 'Previewing exactly what the client sees.' : 'Internal metrics are visible.'}</div>`}
      </div>`;
    $('#topbar').innerHTML = `${brand()}<div class="topbar-right">${isOperator() ? clientPicker() : ''}${!state.locked ? `<button class="btn sm" data-action="mode" data-mode="${state.mode === 'operator' ? 'client' : 'operator'}">${icon('eye')}${state.mode === 'operator' ? 'Client' : 'Operator'}</button>` : ''}</div>`;
    $('#bottom-nav').innerHTML = items
      .map((n) => `<a href="${href(n.id)}" class="${state.route === n.id ? 'active' : ''}">${icon(n.icon)}<span>${n.label}</span></a>`)
      .join('');
  }

  // ---------------------------------------------------------------- routing
  function parseHash() {
    const parts = (location.hash || '#/overview').replace(/^#\/?/, '').split('/').filter(Boolean);
    if (parts[0] === 'c' && parts[1]) return { token: parts[1], route: parts[2] || 'overview', param: parts[3] || null };
    return { token: null, route: parts[0] || 'overview', param: parts[1] || null };
  }

  async function onRoute() {
    const r = parseHash();
    if (r.token) {
      if (r.token !== state.token) {
        const c = await api.getClientByToken(r.token);
        if (!c) { renderInvalidLink(); return; }
        state.clients = [c]; state.clientId = c.id; state.locked = true; state.token = r.token; state.mode = 'client';
      }
    } else if (state.locked) {
      // Left a share link for the operator dashboard: reload the full client list.
      state.locked = false; state.token = null; state.mode = store.get('mode', 'operator');
      state.clients = await api.getClients();
      state.clientId = store.get('client', state.clients[0].id);
    }
    const allowed = navItems().map((n) => n.id);
    state.route = allowed.includes(r.route) ? r.route : 'overview';
    state.param = r.param;
    if (state.route === 'reports' && r.param) state.ui.reportWeek = r.param;
    renderShell();
    renderPage();
  }

  function renderInvalidLink() {
    $('#sidebar').innerHTML = brand(); $('#topbar').innerHTML = brand(); $('#bottom-nav').innerHTML = '';
    $('#main').innerHTML = `<div class="page"><div class="card empty" style="max-width:520px;margin:10vh auto">
      <h2 style="color:var(--text);margin-bottom:8px">This link has expired</h2>
      <p>Ask your Fly Marketing account manager for a new dashboard link.</p></div></div>`;
  }

  // ---------------------------------------------------------------- page rendering
  const PAGES = {};
  function destroyCharts() { state.charts.forEach((c) => c.destroy()); state.charts = []; }

  async function renderPage(quiet) {
    const id = ++state.renderId;
    const main = $('#main');
    if (!quiet) { main.innerHTML = skeleton(state.route); window.scrollTo({ top: 0 }); }
    const out = await PAGES[state.route]();
    if (id !== state.renderId) return; // a newer render started
    destroyCharts();
    main.innerHTML = `<div class="page${quiet ? '" style="animation:none' : ''}">${out.html}</div>`;
    if (out.mount) out.mount(main);
    if (!quiet) countUp(main);
  }

  function skeleton(route) {
    const head = `<div style="margin-bottom:28px"><div class="skel" style="width:120px;height:12px;margin-bottom:12px"></div><div class="skel" style="width:280px;height:28px"></div></div>`;
    if (route === 'overview') {
      return `<div class="page">${head}<div class="grid g-4">${'<div class="skel skel-card"></div>'.repeat(4)}</div>
        <div class="skel" style="height:230px;margin-top:24px;border-radius:12px"></div>
        <div class="grid g-main section"><div class="skel" style="height:360px;border-radius:12px"></div><div class="skel" style="height:360px;border-radius:12px"></div></div></div>`;
    }
    if (route === 'creatives') return `<div class="page">${head}<div class="creative-grid">${'<div class="skel" style="height:290px;border-radius:12px"></div>'.repeat(6)}</div></div>`;
    return `<div class="page">${head}<div class="skel" style="height:56px;border-radius:12px;margin-bottom:16px"></div>${'<div class="skel" style="height:64px;border-radius:12px;margin-bottom:10px"></div>'.repeat(6)}</div>`;
  }

  function countUp(root) {
    const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    $$('[data-count]', root).forEach((el) => {
      const target = parseFloat(el.dataset.count), kind = el.dataset.kind;
      const f = (v) => (kind === 'money' ? money(v) : kind === 'x' ? v.toFixed(2) + 'x' : int(v));
      if (reduce) { el.textContent = f(target); return; }
      const t0 = performance.now(), dur = 900;
      const step = (t) => {
        const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = f(kind === 'x' ? target * e : Math.round(target * e));
        if (p < 1) requestAnimationFrame(step); else el.textContent = f(target);
      };
      requestAnimationFrame(step);
      setTimeout(() => (el.textContent = f(target)), dur + 150); // rAF pauses in background tabs
    });
  }

  // ---------------------------------------------------------------- shared calculations
  function monthStats(m, c) {
    const investment = c.monthlyRetainer + m.adSpend;
    return {
      ...m, investment, roas: div(m.revenue, investment),
      cpl: div(m.adSpend, m.leads), cps: div(m.adSpend, m.booked), cpp: div(m.adSpend, m.converted),
      bookRate: div(m.booked, m.leads), showRate: div(m.showed, m.booked), closeRate: div(m.converted, m.showed),
    };
  }
  // Within 20% of target = green, 20-50% over = yellow, 50%+ over = red.
  const targetLevel = (actual, target) => { const r = div(actual, target); return r < 1.2 ? 'green' : r < 1.5 ? 'yellow' : 'red'; };
  const freqLevel = (f) => (f < 2.5 ? 'green' : f <= 3.5 ? 'yellow' : 'red');
  const cpmLevel = (ch) => (ch <= 0.1 ? 'green' : ch <= 0.25 ? 'yellow' : 'red');
  const LEVEL_TEXT = { green: 'On target', yellow: 'Watch', red: 'Action needed' };
  const LEVEL_COLOR = { green: 'var(--success)', yellow: 'var(--warning)', red: 'var(--danger)' };

  function sourceBreakdown(m) {
    const shares = { // share of each stage by source; referrals/organic convert better than cold traffic
      organic: [0.125, 0.14, 0.14, 0.17], referral: [0.105, 0.14, 0.14, 0.17], reactivation: [0.0625, 0.05, 0.07, 0],
    };
    const keys = ['leads', 'booked', 'showed', 'converted'];
    const rows = { meta_ads: {}, organic: {}, referral: {}, reactivation: {} };
    keys.forEach((k, i) => {
      let rest = m[k];
      ['organic', 'referral', 'reactivation'].forEach((s) => { const v = Math.round(m[k] * shares[s][i]); rows[s][k] = v; rest -= v; });
      rows.meta_ads[k] = Math.max(0, rest);
    });
    return Object.keys(rows).map((s) => ({ source: s, ...rows[s] }));
  }

  function computeAlerts(c, cur, health, flags, creatives) {
    const out = flags.map((f) => ({ ...f }));
    const t = c.kpiTargets;
    if (cur && cur.cpl >= 2 * t.costPerLead) out.push({ level: 'red', title: 'Cost per lead is 2x+ target', body: `${money(cur.cpl, 2)} vs ${money(t.costPerLead)} target this month.` });
    creatives.filter((x) => x.status !== 'dead' && x.costPerResult >= 2 * t.costPerLead).forEach((x) =>
      out.push({ level: 'red', title: 'Creative at 2x+ target cost', body: `"${x.name}" is at ${money(x.costPerResult, 2)} per lead. Pause or replace it.` }));
    if (health) {
      if (health.frequency > 2.5) out.push({ level: health.frequency > 3.5 ? 'red' : 'yellow', title: `Frequency at ${health.frequency.toFixed(1)}`, body: 'The audience is seeing ads too often. Rotate creatives or widen targeting.' });
      const cpmCh = change(health.cpm7, health.cpmPrev7);
      if (cpmCh > 0.15) out.push({ level: 'yellow', title: `CPM up ${(cpmCh * 100).toFixed(0)}%`, body: `7-day CPM ${money(health.cpm7, 2)} vs ${money(health.cpmPrev7, 2)} the week before.` });
      const expected = c.monthlyAdSpend * health.monthDay / health.daysInMonth;
      const pace = change(health.spentToDate, expected);
      if (Math.abs(pace) > 0.08) out.push({ level: 'yellow', title: `Budget pacing ${Math.abs(pace * 100).toFixed(0)}% ${pace > 0 ? 'ahead' : 'behind'}`, body: `${money(health.spentToDate)} spent vs ${money(expected)} expected by day ${health.monthDay}.` });
    }
    const fatiguing = creatives.filter((x) => x.status === 'fatiguing');
    if (fatiguing.length) out.push({ level: 'yellow', title: `${fatiguing.length} creative${fatiguing.length > 1 ? 's' : ''} fatiguing`, body: 'Queue refreshed versions before results drop.' });
    if (cur && cur.cpl < t.costPerLead * 1.2 && !out.some((a) => a.level === 'red' && a.title.startsWith('Cost'))) {
      out.push({ level: 'green', title: 'Campaign stable', body: `Cost per lead ${money(cur.cpl, 2)} is inside the ${money(t.costPerLead)} target.` });
    }
    const recent = creatives.filter((x) => x.status === 'active' && daysBetween(x.launchedDate, AS_OF) <= 14 && x.costPerResult <= t.costPerLead)
      .sort((a, b) => a.costPerResult - b.costPerResult)[0];
    if (recent) out.push({ level: 'green', title: 'New creative performing well', body: `"${recent.name}" is at ${money(recent.costPerResult, 2)} per lead after ${daysBetween(recent.launchedDate, AS_OF)} days.` });
    const order = { red: 0, yellow: 1, green: 2 };
    return out.sort((a, b) => order[a.level] - order[b.level]);
  }

  // ---------------------------------------------------------------- chart theme
  const INK = { text: '#f2f5f3', muted: '#93a29b', line: 'rgba(242,245,243,.07)', green: '#22e584', greenSoft: '#174a33', lime: '#a8f05c' };
  if (window.Chart) {
    Chart.defaults.color = INK.muted;
    Chart.defaults.font.family = "'Inter', system-ui, sans-serif";
    Chart.defaults.font.size = 11.5;
    Chart.defaults.borderColor = INK.line;
    Object.assign(Chart.defaults.plugins.tooltip, {
      backgroundColor: '#101516', borderColor: 'rgba(242,245,243,.12)', borderWidth: 1, padding: 12, cornerRadius: 6,
      titleColor: INK.text, bodyColor: '#C9CCC4', titleFont: { weight: '500' }, boxPadding: 5, usePointStyle: true,
    });
  }
  function addChart(canvas, cfg) {
    if (!window.Chart || !canvas) return;
    state.charts.push(new Chart(canvas, cfg));
  }

  // ================================================================ OVERVIEW
  PAGES.overview = async function () {
    const c = client();
    const [monthly, health, flags, creatives, updates, note] = await Promise.all([
      api.getMonthly(c.id), api.getHealth(c.id), api.getFlags(c.id), api.getCreatives(c.id), api.getUpdates(c.id), api.getNote(c.id),
    ]);
    if (!monthly.length) return { html: headerBlock(c) + noData() };
    const stats = monthly.map((m) => monthStats(m, c));
    const cur = stats[stats.length - 1], prev = stats[stats.length - 2];
    const op = isOperator();

    let html = headerBlock(c, cur, prev) + kpiStrip(c, cur, prev) + noteCard(note, op) + `
      <section class="panel section">
        <div class="panel-head">
          <h2>Patient journey</h2>
          <span class="panel-note">${cur.leads} leads became ${cur.converted} patients · ${pct(div(cur.converted, cur.leads), 1)} overall</span>
        </div>
        ${funnelViz(cur)}
        <dl class="facts">
          <div><dt>Cost per lead</dt><dd>${money(cur.cpl, 2)}</dd></div>
          <div><dt>Cost per new patient</dt><dd>${money(cur.cpp)}</dd></div>
          <div><dt>Average care plan</dt><dd>${money(c.carePlanValue)}</dd></div>
          <div><dt>Ad spend</dt><dd>${money(cur.adSpend)}</dd></div>
        </dl>
      </section>
      <div class="split section">
        <section class="panel">
          <div class="panel-head">
            <h2>Six-month trend</h2>
            <div class="legend"><span><i class="sw-bar"></i>New patients</span><span><i class="sw-line"></i>Revenue</span></div>
          </div>
          <div class="chart-box"><canvas id="trend" aria-label="New patients and revenue by month" role="img"></canvas></div>
        </section>
        ${updatesCard(updates, op)}
      </div>`;

    if (op) {
      const alerts = computeAlerts(c, cur, health, flags, creatives);
      html += `<div class="internal-rule"><span>Fly Marketing only</span><span>Everything below is hidden from the client</span></div>
        ${healthRow(c, cur, health)}
        <div class="split section">
          ${leadQuality(cur)}
          ${alertsCard(alerts)}
        </div>
        <div class="section">${creativeTable(creatives)}</div>`;
    }

    return { html, mount(root) { trendChart($('#trend', root), stats); } };
  };

  function headerBlock(c, cur, prev) {
    const period = cur ? monthLabel(cur.period, true) : '';
    const actions = isOperator() ? `<div class="head-actions">
        <button class="btn" data-action="copy-link">${icon('link')}Copy client link</button>
        <button class="btn primary" data-action="mode" data-mode="client">Preview as client</button></div>` : '';
    if (!cur) return `<header class="ov-head"><div class="ov-meta"><span>${esc(c.practiceName)}</span></div>${actions}</header>`;
    const patients = cur.converted === 1 ? '1 new patient' : `${cur.converted} new patients`;
    let lede = '';
    if (prev) {
      const dir = cur.converted > prev.converted ? 'Up from' : cur.converted < prev.converted ? 'Down from' : 'Level with';
      lede = `${dir} ${prev.converted} in ${monthLabel(prev.period, true).split(' ')[0]}. `;
    }
    lede += cur.roas >= 1
      ? `Every dollar invested returned ${money(cur.roas, 2)}.`
      : `Revenue covers ${pct(cur.roas)} of this month's investment so far.`;
    return `<header class="ov-head">
      <div class="ov-top">
        <div class="ov-meta"><span>${esc(c.practiceName)}</span><span>${period} · month to date</span>${!isOperator() ? `<span>Updated ${fmtDate(AS_OF)}</span>` : ''}</div>
        ${actions}
      </div>
      <h1 class="headline">${patients} this month, worth <em>${money(cur.revenue)}</em> in care plans.</h1>
      <p class="lede">${lede}</p>
    </header>`;
  }
  const noData = () => `<div class="panel empty"><p>No performance data yet for this client.<br>Connect Meta Ads and GoHighLevel in Settings to start tracking.</p></div>`;

  function deltaText(cur, prev, label, invert) {
    if (!prev) return `<span class="delta">First month</span>`;
    const ch = change(cur, prev);
    if (Math.abs(ch) < 0.005) return `<span class="delta">Flat ${label}</span>`;
    const good = invert ? ch < 0 : ch > 0;
    return `<span class="delta ${good ? 'pos' : 'neg'}">${ch > 0 ? '+' : '−'}${Math.abs(ch * 100).toFixed(0)}% ${label}</span>`;
  }

  function kpiStrip(c, cur, prev) {
    const vs = prev ? 'vs ' + monthLabel(prev.period) : '';
    return `<section class="kpis">
      <div class="kpi"><div class="kpi-label">New patients</div>
        <div class="kpi-value accent" data-count="${cur.converted}">${int(cur.converted)}</div>${deltaText(cur.converted, prev && prev.converted, vs)}</div>
      <div class="kpi"><div class="kpi-label">Revenue from new patients</div>
        <div class="kpi-value accent" data-count="${cur.revenue}" data-kind="money">${money(cur.revenue)}</div>${deltaText(cur.revenue, prev && prev.revenue, vs)}</div>
      <div class="kpi"><div class="kpi-label">Total investment</div>
        <div class="kpi-value" data-count="${cur.investment}" data-kind="money">${money(cur.investment)}</div><span class="delta">${money(c.monthlyRetainer)} retainer · ${money(cur.adSpend)} ads</span></div>
      <div class="kpi"><div class="kpi-label">Return on investment</div>
        <div class="kpi-value ${cur.roas >= 1 ? 'accent' : 'neg'}" data-count="${cur.roas.toFixed(2)}" data-kind="x">${cur.roas.toFixed(2)}x</div>${deltaText(cur.roas, prev && prev.roas, vs)}</div>
    </section>`;
  }

  // Proportional funnel: one column per stage, bars scaled to leads, joined by tapered bands.
  function funnelViz(m) {
    const stages = [
      { label: 'Leads', count: m.leads, note: `${money(div(m.adSpend, m.leads), 2)} each` },
      { label: 'Booked', count: m.booked, note: `${pct(div(m.booked, m.leads))} of leads` },
      { label: 'Showed', count: m.showed, note: `${pct(div(m.showed, m.booked))} show rate` },
      { label: 'Patients', count: m.converted, note: `${pct(div(m.converted, m.showed))} close rate` },
    ];
    const H = 140, colW = 100, barX = 2, barW = 40;
    const fills = ['#1a4732', '#17643f', '#10985c', '#22e584'];
    const geo = stages.map((s) => { const h = Math.max(4, H * div(s.count, m.leads)); return { h, y: (H - h) / 2 }; });
    let svg = '';
    stages.forEach((s, i) => {
      const x = i * colW + barX, g = geo[i];
      if (i < stages.length - 1) {
        const n = geo[i + 1], x1 = x + barW, x2 = (i + 1) * colW + barX;
        svg += `<polygon points="${x1},${g.y} ${x2},${n.y} ${x2},${n.y + n.h} ${x1},${g.y + g.h}" fill="${fills[i + 1]}" opacity=".32"/>`;
      }
      svg += `<rect x="${x}" y="${g.y}" width="${barW}" height="${g.h}" fill="${fills[i]}"/>`;
    });
    return `<div class="fun">
      <div class="fun-cols">${stages.map((s, i) => `<div class="fun-col">
        <div class="fun-name">${s.label}</div>
        <div class="fun-num ${i === 3 ? 'accent' : ''}" data-count="${s.count}">${int(s.count)}</div>
        <div class="fun-note">${s.note}</div></div>`).join('')}</div>
      <svg class="fun-svg" viewBox="0 0 ${colW * stages.length} ${H}" preserveAspectRatio="none" aria-hidden="true">${svg}</svg>
    </div>`;
  }

  // A personal note from the account manager. This is what makes the dashboard feel like a service, not software.
  function noteCard(note, editable) {
    if (!note && !editable) return '';
    const paras = note ? note.text.split(/\n+/).filter(Boolean).map((p) => `<p>${esc(p)}</p>`).join('') : '<p class="faint">No note yet this month.</p>';
    return `<section class="note section">
      <div class="note-label"><span>Marty's take</span>${note ? `<time datetime="${note.date}">${fmtDate(note.date, { month: 'long', day: 'numeric' })}</time>` : ''}</div>
      <div class="note-body">${paras}</div>
      <div class="note-sign">
        <img src="assets/marty.jpg" alt="" width="40" height="40">
        <div><b>Marty Fowler</b><span>Founder, Fly Marketing</span></div>
        ${editable ? `<button class="btn sm" data-action="edit-note">${icon('edit')}${note ? 'Edit note' : 'Write note'}</button>` : ''}
      </div>
    </section>`;
  }

  function updatesCard(updates, editable) {
    return `<section class="panel">
      <div class="panel-head"><h2>This week on your account</h2></div>
      ${updates.length ? `<ol class="updates">${updates.map((u) => `
        <li><time datetime="${u.date}">${fmtDate(u.date)}</time>
          <div class="u-text">${esc(u.text)}</div>
          ${editable ? `<div class="u-actions"><button class="icon-btn" data-action="edit-update" data-id="${u.id}" aria-label="Edit">${icon('edit')}</button><button class="icon-btn" data-action="delete-update" data-id="${u.id}" aria-label="Delete">${icon('trash')}</button></div>` : ''}
        </li>`).join('')}</ol>` : '<div class="empty">Nothing logged yet this week.</div>'}
      ${editable ? `<form class="add-row" data-form="add-update">
        <input class="input" type="text" name="text" placeholder="Log what you did…" required maxlength="140" aria-label="Update">
        <input class="input" type="date" name="date" value="${AS_OF}" aria-label="Date">
        <button class="btn" aria-label="Add update">Add</button></form>` : ''}
    </section>`;
  }

  function healthRow(c, cur, h) {
    const t = c.kpiTargets;
    const cplL = targetLevel(cur.cpl, t.costPerLead), cpsL = targetLevel(cur.cps, t.costPerSchedule);
    const fL = freqLevel(h.frequency), cpmCh = change(h.cpm7, h.cpmPrev7), cpmL = cpmLevel(cpmCh);
    const vsTarget = (a, b) => `${pct(Math.abs(div(a, b) - 1))} ${a > b ? 'over' : 'under'} ${money(b)} target`;
    const tile = (label, val, level, meterPct, foot) => `
      <div class="kpi">
        <div class="kpi-label"><span class="dot ${level}" title="${LEVEL_TEXT[level]}"></span>${label}</div>
        <div class="kpi-value sm">${val}</div>
        <div class="meter"><i style="width:${Math.max(2, Math.min(100, meterPct)).toFixed(0)}%" class="${level}"></i></div>
        <span class="delta">${foot}</span>
      </div>`;
    return `<section class="kpis">
      ${tile('Cost per lead', money(cur.cpl, 2), cplL, div(cur.cpl, t.costPerLead * 1.5) * 100, vsTarget(cur.cpl, t.costPerLead))}
      ${tile('Cost per schedule', money(cur.cps, 2), cpsL, div(cur.cps, t.costPerSchedule * 1.5) * 100, vsTarget(cur.cps, t.costPerSchedule))}
      ${tile('Frequency, 7 days', h.frequency.toFixed(2), fL, div(h.frequency, 4.5) * 100, 'Healthy below 2.5')}
      ${tile('CPM, 7-day average', money(h.cpm7, 2), cpmL, 50 + cpmCh * 200, `${cpmCh >= 0 ? '+' : '−'}${Math.abs(cpmCh * 100).toFixed(1)}% vs prior week`)}
    </section>`;
  }

  function sortCreatives(list) {
    const k = state.ui.tSort, d = state.ui.tDir;
    return list.slice().sort((a, b) => {
      if (k === 'costPerResult') { // zero-result ads always sink to the bottom
        const av = a.results ? a.costPerResult : Infinity, bv = b.results ? b.costPerResult : Infinity;
        return (av - bv) * d;
      }
      return (typeof a[k] === 'string' ? a[k].localeCompare(b[k]) : a[k] - b[k]) * d;
    });
  }
  function creativeTable(creatives) {
    const rows = sortCreatives(creatives);
    const maxSpend = Math.max(...creatives.map((c) => c.spend), 1);
    const total = sum(creatives, 'spend');
    const best = creatives.filter((c) => c.status !== 'dead' && c.results).sort((a, b) => a.costPerResult - b.costPerResult).slice(0, 3).map((c) => c.id);
    const th = (k, label, cls) => {
      const on = state.ui.tSort === k;
      return `<th class="sortable ${cls || ''} ${on ? 'sorted' : ''}" data-action="tsort" data-key="${k}" aria-sort="${on ? (state.ui.tDir > 0 ? 'ascending' : 'descending') : 'none'}">${label}<span class="arr">${on ? (state.ui.tDir > 0 ? '↑' : '↓') : ''}</span></th>`;
    };
    return `<section class="panel">
      <div class="panel-head"><h2>Creative performance</h2>
        <span class="panel-note">${creatives.length} ads · ${money(total)} spent · <a href="${href('creatives')}">Open gallery</a></span></div>
      <div class="table-wrap"><table>
        <thead><tr><th class="rank-col">#</th>${th('name', 'Ad')}${th('format', 'Format')}${th('spend', 'Spend')}${th('results', 'Leads', 'r')}${th('costPerResult', 'Cost per lead', 'r')}${th('status', 'Status')}</tr></thead>
        <tbody>${rows.map((c) => {
          const rank = best.indexOf(c.id);
          return `<tr class="${rank >= 0 ? 'winner' : ''} ${c.status === 'dead' ? 'retired' : ''}">
            <td class="rank-col">${rank >= 0 ? `<span class="rank">${rank + 1}</span>` : ''}</td>
            <td class="name-cell"><div class="cell-name">${esc(c.name)}</div><div class="cell-sub">Since ${fmtDate(c.launchedDate)}</div></td>
            <td class="muted">${cap(c.format)}</td>
            <td class="spend-cell num">${money(c.spend)}<div class="spend-bar"><i style="width:${(c.spend / maxSpend * 100).toFixed(0)}%"></i></div></td>
            <td class="r num">${c.results}</td>
            <td class="r num cpr c-${c.results ? targetLevel(c.costPerResult, client().kpiTargets.costPerLead) : 'red'}">${c.results ? money(c.costPerResult, 2) : '—'}</td>
            <td><span class="badge b-${c.status}">${cap(c.status)}</span></td></tr>`;
        }).join('')}</tbody></table></div></section>`;
  }

  function alertsCard(alerts) {
    const n = (l) => alerts.filter((a) => a.level === l).length;
    const summary = [n('red') && `${n('red')} urgent`, n('yellow') && `${n('yellow')} to watch`, n('green') && `${n('green')} good`].filter(Boolean).join(' · ');
    return `<section class="panel">
      <div class="panel-head"><h2>Alerts</h2><span class="panel-note">${summary}</span></div>
      <ul class="alerts">${alerts.map((a) => `<li class="alert ${a.level}"><b>${esc(a.title)}</b><span>${esc(a.body)}</span></li>`).join('') || '<li class="empty">All clear.</li>'}</ul>
    </section>`;
  }

  const SOURCE_COLORS = ['#22e584', '#0fb872', '#a8f05c', '#5f6d67'];
  function leadQuality(cur) {
    const rows = sourceBreakdown(cur);
    return `<section class="panel">
      <div class="panel-head"><h2>Lead quality by source</h2><span class="panel-note">${monthLabel(cur.period, true)}</span></div>
      <div class="share-bar" role="img" aria-label="Share of leads by source">${rows.map((r, i) => `<i style="width:${pct(div(r.leads, cur.leads), 2)};background:${SOURCE_COLORS[i]}" title="${SOURCES[r.source]}: ${r.leads}"></i>`).join('')}</div>
      <div class="table-wrap"><table class="compact">
        <thead><tr><th>Source</th><th class="r">Leads</th><th class="r">Booked</th><th class="r">Showed</th><th class="r">Patients</th><th class="r">Conversion</th></tr></thead>
        <tbody>${rows.map((r, i) => `<tr><td><span class="sw" style="background:${SOURCE_COLORS[i]}"></span>${SOURCES[r.source]}</td>
          <td class="r num">${r.leads}</td><td class="r num">${r.booked}</td><td class="r num">${r.showed}</td><td class="r num strong">${r.converted}</td>
          <td class="r num">${pct(div(r.converted, r.leads))}</td></tr>`).join('')}</tbody>
        <tfoot><tr><td>Total</td><td class="r num">${cur.leads}</td><td class="r num">${cur.booked}</td><td class="r num">${cur.showed}</td><td class="r num strong">${cur.converted}</td><td class="r num">${pct(div(cur.converted, cur.leads))}</td></tr></tfoot>
      </table></div></section>`;
  }

  function trendChart(canvas, stats) {
    if (!canvas) return;
    addChart(canvas, {
      data: {
        labels: stats.map((s) => monthLabel(s.period)),
        datasets: [
          { type: 'line', label: 'Revenue', data: stats.map((s) => s.revenue), yAxisID: 'y1', borderColor: INK.lime, borderWidth: 1.5, tension: 0.3,
            pointRadius: 0, pointHoverRadius: 4, pointBackgroundColor: INK.lime, order: 0 },
          { type: 'bar', label: 'New patients', data: stats.map((s) => s.converted), yAxisID: 'y',
            backgroundColor: stats.map((_, i) => (i === stats.length - 1 ? INK.green : INK.greenSoft)), borderRadius: 2, barPercentage: 0.55, order: 1 },
        ],
      },
      options: {
        maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (i) => ` ${i.dataset.label}: ${i.dataset.yAxisID === 'y1' ? money(i.raw) : i.raw}` } } },
        scales: {
          x: { grid: { display: false }, border: { display: false } },
          y: { beginAtZero: true, border: { display: false }, ticks: { precision: 0, maxTicksLimit: 5 } },
          y1: { position: 'right', beginAtZero: true, grid: { display: false }, border: { display: false }, ticks: { maxTicksLimit: 5, callback: (v) => '$' + (v / 1000) + 'k' } },
        },
      },
    });
  }

  // ================================================================ FUNNEL
  function rangeBounds() {
    const r = state.ui.range;
    if (r === 'custom') return [state.ui.from, state.ui.to];
    const days = { '7d': 7, '30d': 30, '90d': 90 }[r];
    return [addDays(AS_OF, -days + 1), AS_OF];
  }
  function rangeMetrics(monthly, weekly) {
    const r = state.ui.range;
    if (r === '7d') return weekly.slice(-1);
    if (r === '30d') return monthly.slice(-1);
    if (r === '90d') return monthly.slice(-3);
    const [from, to] = rangeBounds();
    return weekly.filter((w) => w.start >= from && w.start <= to);
  }
  function aggregate(rows) {
    const keys = ['adSpend', 'impressions', 'clicks', 'leads', 'booked', 'showed', 'converted', 'revenue'];
    const o = {}; keys.forEach((k) => (o[k] = sum(rows, k))); return o;
  }
  const STAGE_LEADS = { leads: null, booked: ['booked', 'showed', 'converted'], showed: ['showed', 'converted'], converted: ['converted'] };

  PAGES.funnel = async function () {
    const c = client();
    const [monthly, weekly, leads] = await Promise.all([api.getMonthly(c.id), api.getWeekly(c.id), api.getLeads(c.id)]);
    const m = aggregate(rangeMetrics(monthly, weekly));
    const [from, to] = rangeBounds();
    const inRange = leads.filter((l) => l.date >= from && l.date <= to);
    const stages = [
      { id: 'impressions', label: 'Impressions', icon: 'eye', count: m.impressions },
      { id: 'clicks', label: 'Link clicks', icon: 'mouse', count: m.clicks, conv: div(m.clicks, m.impressions), convLabel: 'CTR' },
      { id: 'leads', label: 'Leads', icon: 'users', count: m.leads, conv: div(m.leads, m.clicks), convLabel: 'opt-in' },
      { id: 'booked', label: 'Booked', icon: 'calendar', count: m.booked, conv: div(m.booked, m.leads), convLabel: 'booked' },
      { id: 'showed', label: 'Showed', icon: 'check', count: m.showed, conv: div(m.showed, m.booked), convLabel: 'show rate' },
      { id: 'converted', label: 'Became patients', icon: 'patient', count: m.converted, conv: div(m.converted, m.showed), convLabel: 'close rate' },
    ];
    const greens = ['#2a3431', '#3a4743', '#134a31', '#0f8a55', '#0fb872', '#22e584'];
    state._funnelExport = { m, stages, leads: inRange, from, to };
    const rangeLabel = state.ui.range === 'custom' ? `${fmtDate(from)} – ${fmtDate(to)}` : { '7d': 'Last 7 days', '30d': 'Last 30 days', '90d': 'Last 90 days' }[state.ui.range];

    const html = `
      <div class="page-head">
        <div><div class="eyebrow">Funnel</div><h1>From first click to new patient</h1><p>${rangeLabel} · open any stage to see the people in it</p></div>
        <div class="head-actions">
          <div class="seg" role="group" aria-label="Date range">${['7d', '30d', '90d', 'custom'].map((r) => `<button data-action="range" data-range="${r}" class="${state.ui.range === r ? 'on' : ''}">${r === 'custom' ? 'Custom' : r}</button>`).join('')}</div>
          <button class="btn" data-action="export-funnel">${icon('download')}Export CSV</button>
        </div>
      </div>
      ${state.ui.range === 'custom' ? `<div class="filters"><label class="muted">From <input class="input" type="date" data-change="from" value="${from}"></label><label class="muted">To <input class="input" type="date" data-change="to" value="${to}"></label><span class="faint">Custom ranges sum whole weeks that start inside the range.</span></div>` : ''}
      <section class="kpis">
        ${miniStat('Ad spend', money(m.adSpend))}
        ${miniStat('Cost per lead', money(div(m.adSpend, m.leads), 2))}
        ${miniStat('Cost per patient', m.converted ? money(div(m.adSpend, m.converted)) : '—')}
        ${miniStat('Patient revenue', money(m.revenue), true)}
      </section>
      <section class="panel section">
        <div class="panel-head"><h2>Patient journey</h2><span class="panel-note">${m.leads} leads became ${m.converted} patients · ${pct(div(m.converted, m.leads), 1)} overall</span></div>
        ${m.leads ? funnelViz(m) : '<div class="empty">No leads in this range.</div>'}
      </section>
      <section class="panel section">
        <div class="panel-head"><h2>Stage by stage</h2><span class="panel-note">Bars use a log scale so every stage stays visible</span></div>
        <div class="stage-list">${stages.map((s, i) => {
          const hasLeads = s.id in STAGE_LEADS;
          const people = hasLeads ? inRange.filter((l) => !STAGE_LEADS[s.id] || STAGE_LEADS[s.id].includes(l.status)) : [];
          const open = !!state.ui.openStages[s.id];
          const w = Math.max(2, div(Math.log10(s.count + 1), Math.log10(stages[0].count + 1)) * 100);
          return `<div class="stage-row ${open ? 'open' : ''}">
            <button class="stage-btn" data-action="toggle-stage" data-id="${s.id}" aria-expanded="${open}">
              <span class="stage-idx">${String(i + 1).padStart(2, "0")}</span>
              <span class="stage-name">${s.label}</span>
              <span class="stage-track"><i style="width:${w.toFixed(1)}%;background:${greens[i]}"></i></span>
              <span class="stage-count">${int(s.count)}</span>
              <span class="stage-conv">${s.conv != null ? `<b>${pct(s.conv, s.id === 'clicks' ? 2 : 0)}</b> ${s.convLabel}` : 'top of funnel'}</span>
              ${icon('chev', 'chev')}
            </button>
            <div class="stage-body">${hasLeads ? (people.length ? `<div class="mini-leads">${people.map((l) => `
                <div class="mini-lead"><span class="cell-name">${esc(l.name)}</span><span class="muted hide-sm">${esc(l.phone)}</span><span class="faint hide-sm">${SOURCES[l.source]} · ${fmtDate(l.date)}</span><span class="badge b-${l.status}">${cap(l.status)}</span></div>`).join('')}</div>
                <div class="hint">Showing ${people.length} tracked lead${people.length === 1 ? '' : 's'} from the CRM for this range.</div>`
              : '<div class="empty">No CRM records in this range yet.</div>')
              : `<div class="empty">Ad-level stage. See <a href="${href('creatives')}">Creatives</a> for the ads behind these numbers.</div>`}</div>
          </div>`;
        }).join('')}</div>
      </section>`;
    return { html };
  };
  const miniStat = (label, val, accent) => `<div class="kpi"><div class="kpi-label">${label}</div><div class="kpi-value sm ${accent ? 'accent' : ''}">${val}</div></div>`;

  // ================================================================ CREATIVES

  PAGES.creatives = async function () {
    const c = client();
    const all = await api.getCreatives(c.id);
    const u = state.ui;
    let list = all.filter((x) =>
      (u.cFormat === 'all' || x.format === u.cFormat) &&
      (u.cStatus === 'all' || x.status === u.cStatus) &&
      (u.cDate === 'all' || daysBetween(x.launchedDate, AS_OF) <= +u.cDate));
    const sorters = {
      cpr: (a, b) => (a.results ? a.costPerResult : 1e9) - (b.results ? b.costPerResult : 1e9),
      spend: (a, b) => b.spend - a.spend,
      newest: (a, b) => b.launchedDate.localeCompare(a.launchedDate),
    };
    list = list.slice().sort(sorters[u.cSort]);
    const counts = { active: 0, fatiguing: 0, dead: 0 };
    all.forEach((x) => counts[x.status]++);
    const t = c.kpiTargets.costPerLead;

    const html = `
      <div class="page-head">
        <div><div class="eyebrow">Creatives</div><h1>Ad creatives</h1><p>${counts.active} active · ${counts.fatiguing} fatiguing · ${counts.dead} retired · target ${money(t)} per lead</p></div>
        ${isOperator() ? `<div class="head-actions"><button class="btn primary" data-action="add-creative">${icon('plus')}Add creative</button></div>` : ''}
      </div>
      <div class="filters">
        <div class="seg" role="group" aria-label="Format">${['all', 'video', 'image'].map((f) => `<button data-action="cfmt" data-v="${f}" class="${u.cFormat === f ? 'on' : ''}">${f === 'all' ? 'All formats' : cap(f)}</button>`).join('')}</div>
        <select class="select" data-change="cStatus" aria-label="Status"><option value="all">All statuses</option>${['active', 'fatiguing', 'dead'].map((s) => `<option value="${s}" ${u.cStatus === s ? 'selected' : ''}>${cap(s)}</option>`).join('')}</select>
        <select class="select" data-change="cDate" aria-label="Launch date"><option value="all">Any launch date</option><option value="14" ${u.cDate === '14' ? 'selected' : ''}>Last 14 days</option><option value="30" ${u.cDate === '30' ? 'selected' : ''}>Last 30 days</option><option value="90" ${u.cDate === '90' ? 'selected' : ''}>Last 90 days</option></select>
        <select class="select" data-change="cSort" aria-label="Sort"><option value="cpr" ${u.cSort === 'cpr' ? 'selected' : ''}>Best cost per result</option><option value="spend" ${u.cSort === 'spend' ? 'selected' : ''}>Highest spend</option><option value="newest" ${u.cSort === 'newest' ? 'selected' : ''}>Newest</option></select>
      </div>
      ${list.length ? `<div class="creative-grid">${list.map((x) => {
        const lvl = x.results ? targetLevel(x.costPerResult, t) : 'red';
        return `<article class="creative ${x.status === 'dead' ? 'retired' : ''}">
          <div class="thumb">
            ${x.thumbnailUrl ? `<img src="${esc(x.thumbnailUrl)}" alt="" loading="lazy">` : `<span class="thumb-ph">${icon(x.format === 'video' ? 'play' : 'image')}<span>${x.format === 'video' ? 'Video' : 'Image'}</span></span>`}
            <span class="badge b-${x.status}">${cap(x.status)}</span>
          </div>
          <div class="creative-body">
            <div class="cell-name">${esc(x.name)}</div>
            <div class="cell-sub">Since ${fmtDate(x.launchedDate, { month: 'short', day: 'numeric' })} · ${daysBetween(x.launchedDate, AS_OF)} days</div>
            <dl class="cstats">
              <div><dt>Spend</dt><dd>${money(x.spend)}</dd></div>
              <div><dt>Leads</dt><dd>${x.results}</dd></div>
              <div><dt>Per lead</dt><dd class="c-${lvl}">${x.results ? money(x.costPerResult, 2) : '—'}</dd></div>
            </dl>
          </div>
        </article>`;
      }).join('')}</div>` : '<div class="panel empty">No creatives match these filters.</div>'}`;
    return { html };
  };

  // ================================================================ LEADS
  PAGES.leads = async function () {
    const c = client();
    const all = await api.getLeads(c.id);
    const u = state.ui, q = u.lQuery.trim().toLowerCase(), qDigits = q.replace(/\D/g, '');
    const list = all.filter((l) =>
      (u.lStatus === 'all' || l.status === u.lStatus) &&
      (u.lSource === 'all' || l.source === u.lSource) &&
      (u.lDate === 'all' || daysBetween(l.date, AS_OF) < +u.lDate) &&
      (!q || l.name.toLowerCase().includes(q) || (qDigits && l.phone.replace(/\D/g, '').includes(qDigits))))
      .sort((a, b) => b.date.localeCompare(a.date));
    const counts = {}; LEAD_STATUSES.forEach((s) => (counts[s] = 0)); all.forEach((l) => counts[l.status]++);
    const op = isOperator();
    const statusCell = (l) => op
      ? `<select class="badge b-${l.status} status-select" data-change="lead-status" data-id="${l.id}" aria-label="Status for ${esc(l.name)}">${LEAD_STATUSES.map((s) => `<option value="${s}" ${s === l.status ? 'selected' : ''}>${cap(s)}</option>`).join('')}</select>`
      : `<span class="badge b-${l.status}">${cap(l.status)}</span>`;

    const html = `
      <div class="page-head">
        <div><div class="eyebrow">Leads</div><h1>Lead tracker</h1><p>${all.length} leads · ${counts.converted} converted to patients</p></div>
        <div class="head-actions"><button class="btn" data-action="export-leads">${icon('download')}Export CSV</button></div>
      </div>
      <div class="count-pills">
        <button class="count-pill ${u.lStatus === 'all' ? 'on' : ''}" data-action="lstatus" data-v="all">All <b>${all.length}</b></button>
        ${LEAD_STATUSES.map((s) => `<button class="count-pill ${u.lStatus === s ? 'on' : ''}" data-action="lstatus" data-v="${s}"><span class="badge b-${s}" style="padding:0 8px">${cap(s)}</span><b>${counts[s]}</b></button>`).join('')}
      </div>
      <div class="filters">
        <div class="search">${icon('search')}<input class="input" type="search" placeholder="Search name or phone" value="${esc(u.lQuery)}" data-input="lQuery" aria-label="Search leads"></div>
        <select class="select" data-change="lSource" aria-label="Source"><option value="all">All sources</option>${Object.keys(SOURCES).map((s) => `<option value="${s}" ${u.lSource === s ? 'selected' : ''}>${SOURCES[s]}</option>`).join('')}</select>
        <select class="select" data-change="lDate" aria-label="Date"><option value="all">All dates</option><option value="7" ${u.lDate === '7' ? 'selected' : ''}>Last 7 days</option><option value="14" ${u.lDate === '14' ? 'selected' : ''}>Last 14 days</option><option value="30" ${u.lDate === '30' ? 'selected' : ''}>Last 30 days</option></select>
      </div>
      <div class="card" id="lead-results">
        ${list.length ? `
        <div class="table-wrap lead-table"><table>
          <thead><tr><th>Name</th><th>Phone</th><th>Email</th><th>Source</th><th>Date</th><th>Status</th></tr></thead>
          <tbody>${list.map((l) => `<tr>
            <td class="cell-name">${esc(l.name)}</td>
            <td class="num"><a href="tel:${esc(l.phone.replace(/\D/g, ''))}" style="color:inherit;text-decoration:none">${esc(l.phone)}</a></td>
            <td class="muted">${esc(l.email)}</td>
            <td>${SOURCES[l.source]}</td>
            <td class="muted">${fmtDate(l.date)}</td>
            <td>${statusCell(l)}</td></tr>`).join('')}</tbody></table></div>
        <div class="lead-cards">${list.map((l) => `<div class="lead-card">
            <div class="cell-name">${esc(l.name)}</div><div>${statusCell(l)}</div>
            <a href="tel:${esc(l.phone.replace(/\D/g, ''))}">${esc(l.phone)}</a><span class="faint" style="font-size:12px;text-align:right">${SOURCES[l.source]} · ${fmtDate(l.date)}</span>
            <span class="faint" style="font-size:12px;grid-column:1/-1">${esc(l.email)}</span></div>`).join('')}</div>`
        : '<div class="empty">No leads match these filters.</div>'}
      </div>`;
    return { html };
  };

  // ================================================================ PIPELINE
  PAGES.pipeline = async function () {
    const deals = await api.getPipeline();
    const open = deals.filter((d) => d.stage !== 'closed' && d.stage !== 'lost');
    const closed = deals.filter((d) => d.stage === 'closed');
    const month = AS_OF.slice(0, 7);
    const closedThisMonth = closed.filter((d) => (d.closedDate || '').startsWith(month));
    const html = `
      <div class="page-head">
        <div><div class="eyebrow">Pipeline · internal</div><h1>Sales pipeline</h1><p>Prospective practices for Fly Marketing. Drag cards between stages.</p></div>
        <div class="head-actions"><button class="btn primary" data-action="add-deal">${icon('plus')}Add deal</button></div>
      </div>
      <section class="kpis kpis-3">
        <div class="kpi"><div class="kpi-label">Open pipeline</div><div class="kpi-value accent" data-count="${sum(open, 'estimatedValue')}" data-kind="money">${money(sum(open, 'estimatedValue'))}</div><span class="delta">${open.length} open deal${open.length === 1 ? '' : 's'}</span></div>
        <div class="kpi"><div class="kpi-label">Closed this month</div><div class="kpi-value" data-count="${closedThisMonth.length}">${closedThisMonth.length}</div><span class="delta">${money(sum(closedThisMonth, 'estimatedValue'))} contracted</span></div>
        <div class="kpi"><div class="kpi-label">Average deal size</div><div class="kpi-value" data-count="${Math.round(div(sum(closed, 'estimatedValue'), closed.length))}" data-kind="money">${money(div(sum(closed, 'estimatedValue'), closed.length))}</div><span class="delta">across ${closed.length} closed deal${closed.length === 1 ? '' : 's'}</span></div>
      </section>
      <div class="board section">${STAGES.map((s) => {
        const items = deals.filter((d) => d.stage === s.id);
        return `<section class="col" data-stage="${s.id}" aria-label="${s.label}">
          <div class="col-head"><h3>${s.label}</h3><span class="cnt">${items.length}</span></div>
          <div class="col-value">${money(sum(items, 'estimatedValue'))}</div>
          ${items.map((d) => `<article class="deal" draggable="true" data-deal="${d.id}">
            <h4>${esc(d.practiceName)}</h4><div class="who">${esc(d.contactName)}</div>
            <div class="val">${money(d.estimatedValue)}<span> / yr</span></div>
            <div class="next"><div><div>${esc(d.nextAction)}</div><div class="faint">${fmtDate(d.nextActionDate, { weekday: 'short', month: 'short', day: 'numeric' })}</div></div></div>
            <select class="select move" data-change="move-deal" data-id="${d.id}" aria-label="Move ${esc(d.practiceName)}">${STAGES.map((x) => `<option value="${x.id}" ${x.id === d.stage ? 'selected' : ''}>Move to: ${x.label}</option>`).join('')}</select>
          </article>`).join('') || '<div class="faint" style="font-size:12px;padding:8px 4px">Drop deals here</div>'}
        </section>`;
      }).join('')}</div>`;
    return { html, mount: mountBoard };
  };

  function mountBoard(root) {
    let dragId = null;
    $$('.deal', root).forEach((el) => {
      el.addEventListener('dragstart', (e) => { dragId = el.dataset.deal; el.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', dragId); });
      el.addEventListener('dragend', () => { el.classList.remove('dragging'); $$('.col', root).forEach((c) => c.classList.remove('drop')); });
    });
    $$('.col', root).forEach((col) => {
      col.addEventListener('dragover', (e) => { e.preventDefault(); col.classList.add('drop'); });
      col.addEventListener('dragleave', (e) => { if (!col.contains(e.relatedTarget)) col.classList.remove('drop'); });
      col.addEventListener('drop', async (e) => {
        e.preventDefault(); col.classList.remove('drop');
        const id = e.dataTransfer.getData('text/plain') || dragId;
        const card = root.querySelector(`[data-deal="${id}"]`);
        if (card && card.closest('.col') !== col) {
          col.appendChild(card); // optimistic move
          await api.moveDeal(id, col.dataset.stage);
          toast(`Moved to ${STAGES.find((s) => s.id === col.dataset.stage).label}`);
          renderPage(true);
        }
      });
    });
  }

  // ================================================================ REPORTS
  PAGES.reports = async function () {
    const c = client();
    const [weekly, reports, updates, creatives] = await Promise.all([api.getWeekly(c.id), api.getReports(c.id), api.getUpdates(c.id), api.getCreatives(c.id)]);
    if (!weekly.length) return { html: `<div class="page-head"><div><div class="eyebrow">Reports</div><h1>Weekly reports</h1></div></div>` + noData() };
    const op = isOperator();
    const periods = weekly.map((w) => w.period);
    if (!state.ui.reportWeek || !periods.includes(state.ui.reportWeek)) state.ui.reportWeek = periods[periods.length - 1];
    const idx = periods.indexOf(state.ui.reportWeek);
    const w = weekly[idx], pw = weekly[idx - 1];
    const saved = reports.find((r) => r.period === w.period);
    const report = buildReport(c, w, pw, updates, creatives, saved);
    // Clients see only reports that were sent; the operator can generate any week.
    const visibleWeeks = op ? weekly.slice().reverse() : weekly.filter((x) => reports.some((r) => r.period === x.period)).reverse();

    const html = `
      <div class="page-head no-print">
        <div><div class="eyebrow">Reports</div><h1>Weekly reports</h1><p>${op ? 'Auto-built from the week\'s data. Add next week\'s plan, then send.' : 'Your weekly performance summaries from Fly Marketing.'}</p></div>
        <div class="head-actions">
          ${op ? `<select class="select" data-change="reportWeek" aria-label="Week">${weekly.slice().reverse().map((x) => `<option value="${x.period}" ${x.period === w.period ? 'selected' : ''}>Week of ${fmtDate(x.start)}</option>`).join('')}</select>` : ''}
          <button class="btn" data-action="print-report">${icon('download')}PDF</button>
          ${op ? `<button class="btn primary" data-action="send-report">${icon('send')}Send report</button>` : ''}
        </div>
      </div>
      <div class="grid g-main" style="align-items:start">
        <div class="report-print-area">
          ${!op && !saved ? '<div class="card empty">No reports have been sent yet.</div>' : report.html}
          ${op ? `<div class="card section no-print">
            <div class="card-head"><div><h2>Next week's plan</h2><div class="sub">Shown in the report. Saved when you send it.</div></div></div>
            <textarea class="input" id="plan" data-input="plan" rows="4">${esc(report.plan)}</textarea>
          </div>` : ''}
        </div>
        <div class="card no-print">
          <div class="card-head"><div><h2>Report history</h2><div class="sub">${reports.length} sent</div></div></div>
          <div class="report-list">${visibleWeeks.map((x) => {
            const r = reports.find((y) => y.period === x.period);
            if (!op && !r) return '';
            return `<button class="report-item ${x.period === w.period ? 'on' : ''}" data-action="pick-report" data-v="${x.period}">
              <span class="ri-ico">${icon('file')}</span>
              <span style="flex:1;min-width:0"><span class="cell-name" style="display:block">Week of ${fmtDate(x.start)}</span><span class="cell-sub">${x.leads} leads · ${x.converted} patient${x.converted === 1 ? "" : "s"} · ${money(x.adSpend)} spend</span></span>
              ${r ? `<span class="badge b-active">Sent ${fmtDate(r.sentAt)}</span>` : '<span class="badge b-neutral">Draft</span>'}
            </button>`;
          }).join('')}</div>
        </div>
      </div>`;
    state._report = { client: c, week: w, plan: report.plan };
    return { html };
  };

  function buildReport(c, w, pw, updates, creatives, saved) {
    const cpl = div(w.adSpend, w.leads), pcpl = pw ? div(pw.adSpend, pw.leads) : 0;
    const end = addDays(w.start, 6);
    const delta = (cur, prev, invert, isMoney) => {
      if (!pw) return '';
      const ch = change(cur, prev); if (Math.abs(ch) < 0.005) return '<em class="faint">no change</em>';
      const good = invert ? ch < 0 : ch > 0;
      return `<em class="${good ? 'r-up' : 'r-down'}">${ch > 0 ? '▲' : '▼'} ${Math.abs(ch * 100).toFixed(0)}%</em>`;
    };
    const changed = [];
    if (pw) {
      changed.push(`Leads ${w.leads >= pw.leads ? 'up' : 'down'} from ${pw.leads} to ${w.leads}; cost per lead ${cpl <= pcpl ? 'improved' : 'rose'} from ${money(pcpl, 2)} to ${money(cpl, 2)}.`);
      changed.push(`${w.booked} appointments booked (${pct(div(w.booked, w.leads))} of leads) and ${w.showed} showed (${pct(div(w.showed, w.booked))} show rate).`);
    }
    creatives.filter((x) => x.launchedDate >= w.start && x.launchedDate <= end).forEach((x) => changed.push(`Launched new ${x.format} ad "${x.name}".`));
    updates.filter((u) => u.date >= w.start && u.date <= end).forEach((u) => changed.push(u.text + '.'));
    const winner = creatives.filter((x) => x.status === 'active' && x.results).sort((a, b) => a.costPerResult - b.costPerResult)[0];
    const tired = creatives.filter((x) => x.status === 'fatiguing');
    const defaultPlan = [
      winner && `Scale "${winner.name}" (best cost per lead at ${money(winner.costPerResult, 2)}).`,
      tired.length && `Refresh ${tired.length} fatiguing creative${tired.length > 1 ? 's' : ''} with new hooks.`,
      `Keep booking rate above 45% with same-day text follow-up on new leads.`,
    ].filter(Boolean).join('\n');
    const plan = state._planDraft && state._planDraft.period === w.period ? state._planDraft.text : saved ? saved.plan : defaultPlan;
    const planLines = plan.split(/\n+/).map((s) => s.trim()).filter(Boolean);

    const html = `<article class="report">
      <div class="r-head">
        <div><div class="r-brand">${logoSvg('#07090a')}<small>Marketing</small></div><h2>Weekly performance report</h2><div style="color:#475569;margin-top:2px">${esc(c.practiceName)}</div></div>
        <div class="r-meta"><b style="color:#07090a">${weekLabel(w)}</b><br>${w.period.replace('-', ' · ')}${saved ? `<br>Sent ${fmtDate(saved.sentAt, { month: 'short', day: 'numeric', year: 'numeric' })}` : ''}</div>
      </div>
      <div class="r-kpis">
        <div class="r-kpi"><span>Ad spend</span><b>${money(w.adSpend)}</b>${delta(w.adSpend, pw && pw.adSpend, true)}</div>
        <div class="r-kpi"><span>Leads (results)</span><b>${w.leads}</b>${delta(w.leads, pw && pw.leads)}</div>
        <div class="r-kpi"><span>Cost per result</span><b>${money(cpl, 2)}</b>${delta(cpl, pcpl, true)}</div>
        <div class="r-kpi"><span>Booked</span><b>${w.booked}</b>${delta(w.booked, pw && pw.booked)}</div>
        <div class="r-kpi"><span>Showed</span><b>${w.showed}</b>${delta(w.showed, pw && pw.showed)}</div>
        <div class="r-kpi hl"><span>New patients</span><b>${w.converted}</b>${delta(w.converted, pw && pw.converted)}</div>
        <div class="r-kpi hl"><span>Patient revenue</span><b>${money(w.revenue)}</b>${delta(w.revenue, pw && pw.revenue)}</div>
        <div class="r-kpi"><span>Return on ad spend</span><b>${div(w.revenue, w.adSpend).toFixed(1)}x</b></div>
      </div>
      <h3>What changed</h3>
      <ul>${changed.map((s) => `<li>${esc(s)}</li>`).join('') || '<li>Steady week with no major changes.</li>'}</ul>
      <h3>Next week's plan</h3>
      <ul>${planLines.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
      <div class="r-foot"><span>Prepared by Fly Marketing · flymarketing.agency</span><span>Questions? Reply to this report anytime.</span></div>
    </article>`;
    return { html, plan };
  }

  // ================================================================ SETTINGS
  PAGES.settings = async function () {
    const [clients, conn] = await Promise.all([api.getClients(), api.getConnections()]);
    state.clients = clients;
    const base = location.href.split('#')[0];
    const html = `
      <div class="page-head">
        <div><div class="eyebrow">Settings · internal</div><h1>Settings</h1><p>Clients, targets, data connections and client access.</p></div>
      </div>
      <section class="set-sec">
        <div class="set-intro"><h2>Clients</h2><p>Practice profile, economics and the KPI targets that drive the green, amber and red health signals.</p>
          <button class="btn primary sm" data-action="edit-client">${icon('plus')}Add client</button></div>
        <div class="set-body">${clients.map((c) => `<div class="client-row">
          <div><div class="cell-name">${esc(c.practiceName)}</div><div class="cell-sub">${esc(c.ownerName)} · ${esc(c.location)}</div></div>
          <div class="kv hide-sm hide-md"><span>Care plan</span><b>${money(c.carePlanValue)}</b></div>
          <div class="kv hide-sm hide-md"><span>Monthly</span><b>${money(c.monthlyRetainer + c.monthlyAdSpend)}</b></div>
          <div class="kv hide-sm"><span>Target CPL</span><b>${money(c.kpiTargets.costPerLead)}</b></div>
          <div class="kv hide-sm"><span>Target CPS</span><b>${money(c.kpiTargets.costPerSchedule)}</b></div>
          <button class="btn sm ghost" data-action="edit-client" data-id="${c.id}">Edit</button>
        </div>`).join('')}</div>
      </section>
      <section class="set-sec">
        <div class="set-intro"><h2>Client access</h2><p>Each practice gets a private link to its own dashboard. Regenerating a link switches the old one off.</p></div>
        <div class="set-body">${clients.map((c) => {
          const url = base + '#/c/' + c.shareToken + '/overview';
          return `<div class="access-row"><div class="cell-name">${esc(c.practiceName)}</div>
            <div class="link-box"><code>${esc(url)}</code>
              <button class="btn sm" data-action="copy" data-text="${esc(url)}">Copy</button>
              <a class="icon-btn" href="${esc(url)}" target="_blank" rel="noopener" aria-label="Open client view">${icon('eye')}</a>
              <button class="icon-btn" data-action="regen" data-id="${c.id}" aria-label="Regenerate link">${icon('refresh')}</button></div></div>`;
        }).join('')}</div>
      </section>
      <section class="set-sec">
        <div class="set-intro"><h2>Data connections</h2><p>Once connected, spend, leads, appointments and patients sync automatically every night, with live lead updates from GoHighLevel.</p></div>
        <form class="set-body conns" data-form="connections">
          ${connField('meta', 'Meta Ads Manager', 'metaApiKey', 'System user access token', conn.metaApiKey, 'Spend, reach, leads and per-ad results with creative thumbnails.')}
          ${connField('ghl', 'GoHighLevel', 'ghlApiKey', 'Private integration token', conn.ghlApiKey, 'Leads, sources, booked and showed appointments, and won patients.')}
          <div class="conn-foot"><span class="hint" style="margin:0">Tokens entered here stay in this browser until the secure backend is set up.</span>
            <button class="btn">Save</button></div>
        </form>
      </section>
      ${DEMO ? `<section class="set-sec">
        <div class="set-intro"><h2>Demo data</h2><p>Restore the sample accounts and clear any edits made in this browser.</p></div>
        <div class="set-body"><button class="btn" data-action="reset">${icon('refresh')}Reset demo data</button></div>
      </section>` : ''}`;
    return { html };
  };
  function connField(id, name, key, label, val, desc) {
    return `<div class="conn">
      <div class="conn-top"><div><b>${name}</b><p>${desc}</p></div>${val ? '<span class="badge b-active">Token saved</span>' : '<span class="badge b-neutral">Not connected</span>'}</div>
      <input class="input" type="password" name="${key}" value="${esc(val)}" placeholder="${label}" autocomplete="off" aria-label="${name} ${label}">
    </div>`;
  }

  // ---------------------------------------------------------------- modal / toast
  function toast(msg) {
    const el = document.createElement('div');
    el.className = 'toast'; el.innerHTML = icon('check') + `<span>${esc(msg)}</span>`;
    $('#toast-root').appendChild(el);
    setTimeout(() => { el.style.transition = 'opacity .3s'; el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 2600);
  }
  function openModal(title, sub, body, onSubmit, submitLabel) {
    const root = $('#modal-root');
    root.innerHTML = `<div class="modal-bg" data-action="close-modal"><form class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}">
      <h2>${esc(title)}</h2><div class="sub">${sub}</div>${body}
      <div class="modal-actions"><button type="button" class="btn ghost" data-action="close-modal">Cancel</button>${onSubmit ? `<button class="btn primary">${submitLabel || 'Save'}</button>` : ''}</div>
    </form></div>`;
    const form = $('.modal', root);
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      if (onSubmit && (await onSubmit(data, form)) !== false) closeModal();
    });
    const first = $('input, select, textarea', form); if (first) first.focus();
  }
  const closeModal = () => ($('#modal-root').innerHTML = '');
  const field = (name, label, type, val, extra) => `<div class="form-field ${extra && extra.full ? 'full' : ''}"><label for="f-${name}">${label}</label>
    <input class="input" id="f-${name}" name="${name}" type="${type || 'text'}" value="${esc(val == null ? '' : val)}" ${extra && extra.attrs ? extra.attrs : ''} required></div>`;
  const selectField = (name, label, opts, val) => `<div class="form-field"><label for="f-${name}">${label}</label>
    <select class="select" id="f-${name}" name="${name}">${opts.map(([v, l]) => `<option value="${v}" ${v === val ? 'selected' : ''}>${l}</option>`).join('')}</select></div>`;

  async function copyText(text, msg) {
    try { await navigator.clipboard.writeText(text); toast(msg || 'Copied to clipboard'); }
    catch (e) { openModal('Copy this link', 'Clipboard access was blocked. Copy it manually:', `<input class="input" style="width:100%" value="${esc(text)}" readonly onfocus="this.select()">`); }
  }

  function downloadCSV(name, rows) {
    const csv = rows.map((r) => r.map((v) => { const s = String(v == null ? '' : v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }).join(',')).join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  // ---------------------------------------------------------------- actions
  const actions = {
    mode(el) { state.mode = el.dataset.mode; store.set('mode', state.mode); onRoute(); },
    'copy-link'() { const c = client(); copyText(location.href.split('#')[0] + '#/c/' + c.shareToken + '/overview', 'Client link copied'); },
    copy(el) { copyText(el.dataset.text, 'Link copied'); },
    async regen(el) { await api.regenerateToken(el.dataset.id); state.clients = await api.getClients(); toast('New link generated. The old one no longer works.'); renderPage(true); },
    async 'delete-update'(el) { await api.deleteUpdate(state.clientId, el.dataset.id); toast('Update removed'); renderPage(true); },
    async 'edit-update'(el) {
      const u = (await api.getUpdates(state.clientId)).find((x) => x.id === el.dataset.id);
      openModal('Edit update', 'Visible to the client on their dashboard.', `<div class="form-grid">${field('text', 'Update', 'text', u.text, { full: true, attrs: 'maxlength="140"' })}${field('date', 'Date', 'date', u.date)}</div>`,
        async (d) => { await api.editUpdate(state.clientId, u.id, { text: d.text.trim(), date: d.date }); toast('Update saved'); renderPage(true); });
    },
    tsort(el) {
      const k = el.dataset.key;
      if (state.ui.tSort === k) state.ui.tDir *= -1; else { state.ui.tSort = k; state.ui.tDir = k === 'spend' || k === 'results' ? -1 : 1; }
      renderPage(true);
    },
    range(el) { state.ui.range = el.dataset.range; renderPage(true); },
    'toggle-stage'(el) {
      const id = el.dataset.id; state.ui.openStages[id] = !state.ui.openStages[id];
      const row = el.closest('.stage-row'); row.classList.toggle('open'); el.setAttribute('aria-expanded', row.classList.contains('open'));
    },
    'export-funnel'() {
      const x = state._funnelExport; if (!x) return;
      const rows = [['Fly Marketing funnel export', client().practiceName], ['Range', x.from, x.to], [], ['Stage', 'Count', 'Conversion from previous']];
      x.stages.forEach((s) => rows.push([s.label, s.count, s.conv != null ? (s.conv * 100).toFixed(1) + '%' : '']));
      rows.push([], ['Ad spend', x.m.adSpend], ['Revenue', x.m.revenue], [], ['Lead', 'Phone', 'Email', 'Source', 'Date', 'Status']);
      x.leads.forEach((l) => rows.push([l.name, l.phone, l.email, SOURCES[l.source], l.date, l.status]));
      downloadCSV(`${slug(client().practiceName)}-funnel-${x.from}-to-${x.to}.csv`, rows);
      toast('CSV downloaded');
    },
    async 'export-leads'() {
      const leads = await api.getLeads(state.clientId);
      downloadCSV(`${slug(client().practiceName)}-leads-${AS_OF}.csv`, [['Name', 'Phone', 'Email', 'Source', 'Date', 'Status'], ...leads.map((l) => [l.name, l.phone, l.email, SOURCES[l.source], l.date, l.status])]);
      toast('CSV downloaded');
    },
    cfmt(el) { state.ui.cFormat = el.dataset.v; renderPage(true); },
    lstatus(el) { state.ui.lStatus = el.dataset.v; renderPage(true); },
    'add-creative'() {
      openModal('Add creative', 'Log an ad manually while the Meta API is not connected.', `<div class="form-grid">
        ${field('name', 'Ad name', 'text', '', { full: true, attrs: 'maxlength="80" placeholder="e.g. Sciatica: Patient Story (Mike)"' })}
        ${selectField('format', 'Format', [['video', 'Video'], ['image', 'Image']], 'video')}
        ${selectField('status', 'Status', [['active', 'Active'], ['fatiguing', 'Fatiguing'], ['dead', 'Dead']], 'active')}
        ${field('spend', 'Spend ($)', 'number', '', { attrs: 'min="0" step="0.01"' })}
        ${field('results', 'Results (leads)', 'number', '', { attrs: 'min="0" step="1"' })}
        ${field('launchedDate', 'Launch date', 'date', AS_OF)}</div>`,
        async (d) => {
          await api.addCreative(state.clientId, { name: d.name.trim(), format: d.format, status: d.status, spend: +d.spend, results: +d.results, launchedDate: d.launchedDate });
          toast('Creative added'); renderPage(true);
        }, 'Add creative');
    },
    'add-deal'() {
      openModal('Add deal', 'A prospective practice for the Fly Marketing pipeline.', `<div class="form-grid">
        ${field('practiceName', 'Practice name', 'text', '', { full: true })}
        ${field('contactName', 'Contact name', 'text', '')}
        ${field('estimatedValue', 'Est. value ($/yr)', 'number', '', { attrs: 'min="0" step="100"' })}
        ${field('nextAction', 'Next action', 'text', '')}
        ${field('nextActionDate', 'Next action date', 'date', addDays(AS_OF, 1))}
        ${selectField('stage', 'Stage', STAGES.map((s) => [s.id, s.label]), 'new')}</div>`,
        async (d) => { await api.addDeal({ ...d, estimatedValue: +d.estimatedValue }); toast('Deal added'); renderPage(true); }, 'Add deal');
    },
    async 'edit-note'() {
      const note = await api.getNote(state.clientId);
      openModal("Marty's take", "A short personal note at the top of the client's overview. Two or three sentences reads best.",
        `<div class="form-field"><label for="f-note">Note</label><textarea class="input" id="f-note" name="text" rows="7" required maxlength="700">${esc(note ? note.text : '')}</textarea></div>`,
        async (d) => { await api.saveNote(state.clientId, d.text.trim(), AS_OF); toast('Note saved'); renderPage(true); }, 'Save note');
    },
    'pick-report'(el) { state.ui.reportWeek = el.dataset.v; state._planDraft = null; renderPage(true); },
    'print-report'() {
      const main = $('#main'); main.classList.add('print-only-report');
      const done = () => { main.classList.remove('print-only-report'); window.removeEventListener('afterprint', done); };
      window.addEventListener('afterprint', done); window.print(); setTimeout(done, 1500);
    },
    async 'send-report'() {
      const r = state._report; if (!r) return;
      await api.saveReport(r.client.id, { period: r.week.period, sentAt: AS_OF, plan: r.plan });
      state._planDraft = null;
      const url = location.href.split('#')[0] + '#/c/' + r.client.shareToken + '/reports/' + r.week.period;
      openModal('Report ready to send', `Week of ${fmtDate(r.week.start)} for ${esc(r.client.practiceName)} is saved to the report history.`, `
        <div class="link-box"><code>${esc(url)}</code><button type="button" class="btn sm" data-action="copy" data-text="${esc(url)}">${icon('copy')}Copy</button></div>
        <p class="hint">Paste this link into a text or email to ${esc(r.client.ownerName)}, or use PDF to download the report.</p>`);
      renderPage(true);
    },
    'edit-client'(el) {
      const c = el.dataset.id ? state.clients.find((x) => x.id === el.dataset.id) : { practiceName: '', ownerName: '', location: '', carePlanValue: 1400, monthlyRetainer: 2400, monthlyAdSpend: 1200, kpiTargets: { costPerLead: 30, costPerSchedule: 60 } };
      openModal(c.id ? 'Edit client' : 'Add client', 'Profile, economics and KPI targets.', `<div class="form-grid">
        ${field('practiceName', 'Practice name', 'text', c.practiceName, { full: true })}
        ${field('ownerName', 'Owner', 'text', c.ownerName)}
        ${field('location', 'Location', 'text', c.location)}
        ${field('carePlanValue', 'Avg care plan value ($)', 'number', c.carePlanValue, { attrs: 'min="0"' })}
        ${field('monthlyRetainer', 'Monthly retainer ($)', 'number', c.monthlyRetainer, { attrs: 'min="0"' })}
        ${field('monthlyAdSpend', 'Monthly ad spend ($)', 'number', c.monthlyAdSpend, { attrs: 'min="0"' })}
        ${field('costPerLead', 'Target cost per lead ($)', 'number', c.kpiTargets.costPerLead, { attrs: 'min="0" step="0.5"' })}
        ${field('costPerSchedule', 'Target cost per schedule ($)', 'number', c.kpiTargets.costPerSchedule, { attrs: 'min="0" step="0.5"' })}</div>`,
        async (d) => {
          const saved = await api.saveClient({
            id: c.id, practiceName: d.practiceName.trim(), ownerName: d.ownerName.trim(), location: d.location.trim(),
            carePlanValue: +d.carePlanValue, monthlyRetainer: +d.monthlyRetainer, monthlyAdSpend: +d.monthlyAdSpend,
            kpiTargets: { costPerLead: +d.costPerLead, costPerSchedule: +d.costPerSchedule },
          });
          state.clients = await api.getClients();
          toast(c.id ? 'Client updated' : `${saved.practiceName} added`);
          renderShell(); renderPage(true);
        }, c.id ? 'Save changes' : 'Add client');
    },
    async reset() {
      if (!confirm('Reset all demo data? Your edits will be lost.')) return;
      await api.resetDemo(); state.clients = await api.getClients(); state.clientId = state.clients[0].id; store.set('client', state.clientId);
      toast('Demo data restored'); renderShell(); renderPage();
    },
    'close-modal'(el, e) { if (e.target === el) closeModal(); },
  };

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el || !actions[el.dataset.action]) return;
    if (el.dataset.action === 'close-modal' && e.target !== el) return;
    e.preventDefault();
    actions[el.dataset.action](el, e);
  });

  document.addEventListener('change', async (e) => {
    const el = e.target, k = el.dataset.change;
    if (!k) return;
    if (k === 'client') { state.clientId = el.value; store.set('client', el.value); state.ui.reportWeek = null; renderShell(); renderPage(); return; }
    if (k === 'lead-status') {
      el.className = `badge b-${el.value} status-select`;
      await api.setLeadStatus(state.clientId, el.dataset.id, el.value); toast(`Marked ${cap(el.value)}`); renderPage(true); return;
    }
    if (k === 'move-deal') { await api.moveDeal(el.dataset.id, el.value); toast('Deal moved'); renderPage(true); return; }
    if (k === 'reportWeek') { state.ui.reportWeek = el.value; state._planDraft = null; renderPage(true); return; }
    if (k === 'from' || k === 'to') { state.ui[k] = el.value; renderPage(true); return; }
    if (k in state.ui) { state.ui[k] = el.value; renderPage(true); }
  });

  let searchTimer;
  document.addEventListener('input', (e) => {
    const el = e.target, k = el.dataset.input;
    if (k === 'plan' && state._report) {
      state._report.plan = el.value; state._planDraft = { period: state._report.week.period, text: el.value };
      // Refresh just the plan list in the preview without re-rendering the textarea.
      const ul = $$('.report ul')[1];
      if (ul) ul.innerHTML = el.value.split(/\n+/).map((s) => s.trim()).filter(Boolean).map((s) => `<li>${esc(s)}</li>`).join('');
      return;
    }
    if (k === 'lQuery') {
      state.ui.lQuery = el.value;
      clearTimeout(searchTimer);
      searchTimer = setTimeout(async () => {
        const pos = el.selectionStart;
        await renderPage(true);
        const input = $('[data-input="lQuery"]'); if (input) { input.focus(); input.setSelectionRange(pos, pos); }
      }, 180);
    }
  });

  document.addEventListener('submit', async (e) => {
    const f = e.target.dataset.form;
    if (!f) return;
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target).entries());
    if (f === 'add-update') {
      if (!d.text.trim()) return;
      await api.addUpdate(state.clientId, d.text.trim(), d.date || AS_OF); toast('Update added'); renderPage(true);
    }
    if (f === 'connections') { await api.saveConnections(d); toast('Connections saved'); renderPage(true); }
  });

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  // ---------------------------------------------------------------- boot
  async function boot() {
    const r = parseHash();
    if (!r.token) {
      state.clients = await api.getClients();
      const saved = store.get('client', null);
      state.clientId = state.clients.some((c) => c.id === saved) ? saved : state.clients[0].id;
    }
    window.addEventListener('hashchange', onRoute);
    onRoute();
  }
  boot();
})();
