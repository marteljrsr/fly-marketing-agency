/* Mock data for the Fly Marketing client dashboard.
 * Shapes follow the data model (Client, FunnelMetrics, Creative, Lead, PipelineDeal).
 * api.js reads from this object; swap api.js internals for real Meta/GHL calls later. */
window.FLY_MOCK = (function () {
  // Deterministic RNG so generated clients look the same on every load.
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const clients = [
    {
      id: 'riverstone', practiceName: 'Riverstone Chiropractic', ownerName: 'Dr. Daniel Reyes', location: 'Sacramento, CA',
      carePlanValue: 1400, monthlyRetainer: 2400, monthlyAdSpend: 1200,
      kpiTargets: { costPerLead: 30, costPerSchedule: 60 }, shareToken: 'rc-demo',
    },
    {
      id: 'summit', practiceName: 'Summit Spine & Wellness', ownerName: 'Dr. Elena Ruiz', location: 'Roseville, CA',
      carePlanValue: 1800, monthlyRetainer: 2500, monthlyAdSpend: 1500,
      kpiTargets: { costPerLead: 32, costPerSchedule: 65 }, shareToken: 'ss-2m8x4d',
    },
    {
      id: 'golden', practiceName: 'Golden State Decompression', ownerName: 'Dr. Kevin Park', location: 'Folsom, CA',
      carePlanValue: 2200, monthlyRetainer: 3000, monthlyAdSpend: 2000,
      kpiTargets: { costPerLead: 40, costPerSchedule: 80 }, shareToken: 'gs-5r1w6n',
    },
  ];

  // ---------- Riverstone (demo): hand-written, matches the brief ----------
  const rsMonthly = [
    { period: '2026-05', adSpend: 1200, impressions: 78000, clicks: 1150, leads: 28, booked: 11, showed: 7,  converted: 2, revenue: 2800 },
    { period: '2026-06', adSpend: 1200, impressions: 80500, clicks: 1240, leads: 33, booked: 14, showed: 9,  converted: 3, revenue: 4200 },
    { period: '2026-07', adSpend: 1200, impressions: 82000, clicks: 1320, leads: 36, booked: 16, showed: 11, converted: 4, revenue: 5600 },
    { period: '2026-08', adSpend: 1200, impressions: 84500, clicks: 1405, leads: 41, booked: 18, showed: 12, converted: 4, revenue: 5600 },
    { period: '2026-09', adSpend: 1200, impressions: 86000, clicks: 1480, leads: 44, booked: 20, showed: 13, converted: 5, revenue: 7000 },
    { period: '2026-10', adSpend: 1200, impressions: 88400, clicks: 1562, leads: 48, booked: 22, showed: 15, converted: 6, revenue: 8400 },
  ];

  const W = (period, start, adSpend, impressions, clicks, leads, booked, showed, converted, revenue) =>
    ({ period, start, adSpend, impressions, clicks, leads, booked, showed, converted, revenue });
  const rsWeekly = [
    W('2026-W30', '2026-07-20', 270, 18900, 302,  8, 3, 2, 1, 1400),
    W('2026-W31', '2026-07-27', 275, 19400, 318,  9, 4, 3, 1, 1400),
    W('2026-W32', '2026-08-03', 272, 19100, 310,  9, 4, 3, 1, 1400),
    W('2026-W33', '2026-08-10', 280, 19800, 335, 10, 4, 3, 1, 1400),
    W('2026-W34', '2026-08-17', 276, 19500, 329, 10, 5, 3, 1, 1400),
    W('2026-W35', '2026-08-24', 279, 19900, 342, 11, 5, 3, 1, 1400),
    W('2026-W36', '2026-08-31', 281, 20100, 356, 10, 4, 3, 1, 1400),
    W('2026-W37', '2026-09-07', 278, 19800, 348, 11, 5, 3, 1, 1400),
    W('2026-W38', '2026-09-14', 282, 20400, 371, 11, 5, 4, 2, 2800),
    W('2026-W39', '2026-09-21', 285, 20700, 388, 12, 5, 3, 1, 1400),
    W('2026-W40', '2026-09-28', 280, 20300, 380, 12, 6, 4, 1, 1400),
    W('2026-W41', '2026-10-05', 285, 21000, 402, 13, 6, 4, 2, 2800),
  ];

  const C = (id, name, format, spend, results, status, launchedDate) =>
    ({ id, name, format, spend, results, costPerResult: results ? +(spend / results).toFixed(2) : 0, status, launchedDate });
  const rsCreatives = [
    C('cr1',  'Decompression: Patient Story (Linda)', 'video', 312, 18, 'active',    '2026-09-18'),
    C('cr2',  'Sciatica Relief: Dr. Talking Head',     'video', 268, 13, 'active',    '2026-09-22'),
    C('cr3',  '$49 New Patient Special Carousel',      'image', 196,  9, 'active',    '2026-09-29'),
    C('cr4',  'Back Pain Quiz Static',                 'image', 154,  6, 'active',    '2026-10-02'),
    C('cr5',  'Google Reviews Montage',                'video',  96,  4, 'active',    '2026-10-05'),
    C('cr6',  'Headache Relief UGC Selfie',            'video',  74,  3, 'active',    '2026-10-07'),
    C('cr7',  'Neck Pain: Desk Worker Hook',           'video', 141,  5, 'fatiguing', '2026-08-30'),
    C('cr8',  'Before/After Posture Scan',             'image', 122,  4, 'fatiguing', '2026-08-21'),
    C('cr9',  'Spinal Decompression Explainer',        'video', 188,  6, 'fatiguing', '2026-08-12'),
    C('cr10', 'Free Consult: Generic Stock Photo',     'image', 118,  2, 'dead',      '2026-07-15'),
    C('cr11', 'Herniated Disc Myth vs Fact',           'image',  84,  1, 'dead',      '2026-07-28'),
    C('cr12', 'Summer Wellness Promo',                 'image',  62,  1, 'dead',      '2026-07-02'),
  ];

  const L = (id, name, phone, email, source, date, status) =>
    ({ id, name, phone, email, source, date, status, practiceName: 'Riverstone Chiropractic' });
  const rsLeads = [
    L('l1',  'Maria Gonzalez',   '(916) 555-0142', 'maria.gonzalez@gmail.com',  'meta_ads',     '2026-10-11', 'new'),
    L('l2',  'James Whitaker',   '(916) 555-0187', 'jwhitaker@yahoo.com',       'meta_ads',     '2026-10-10', 'new'),
    L('l3',  'Priya Nair',       '(916) 555-0113', 'priya.nair@outlook.com',    'organic',      '2026-10-10', 'new'),
    L('l4',  'Derek Holloway',   '(916) 555-0164', 'dholloway@gmail.com',       'meta_ads',     '2026-10-09', 'new'),
    L('l5',  'Susan Lee',        '(916) 555-0129', 'susanlee88@gmail.com',      'meta_ads',     '2026-10-08', 'contacted'),
    L('l6',  'Robert Chen',      '(916) 555-0176', 'rchen@icloud.com',          'referral',     '2026-10-08', 'contacted'),
    L('l7',  'Ashley Brooks',    '(916) 555-0158', 'ashbrooks@gmail.com',       'meta_ads',     '2026-10-07', 'contacted'),
    L('l8',  'Tom Fischer',      '(916) 555-0191', 'tfischer@comcast.net',      'reactivation', '2026-10-06', 'contacted'),
    L('l9',  'Linda Morales',    '(916) 555-0135', 'lmorales@gmail.com',        'meta_ads',     '2026-10-05', 'booked'),
    L('l10', 'Kevin O\'Brien',   '(916) 555-0122', 'kobrien@gmail.com',         'meta_ads',     '2026-10-04', 'booked'),
    L('l11', 'Hannah Kim',       '(916) 555-0148', 'hannah.kim@gmail.com',      'organic',      '2026-10-03', 'booked'),
    L('l12', 'Marcus Johnson',   '(916) 555-0170', 'mjohnson@yahoo.com',        'meta_ads',     '2026-10-02', 'booked'),
    L('l13', 'Rachel Adams',     '(916) 555-0117', 'radams@gmail.com',          'referral',     '2026-09-30', 'showed'),
    L('l14', 'Carlos Rivera',    '(916) 555-0183', 'crivera@gmail.com',         'meta_ads',     '2026-09-28', 'showed'),
    L('l15', 'Jennifer Walsh',   '(916) 555-0109', 'jwalsh@outlook.com',        'meta_ads',     '2026-09-27', 'converted'),
    L('l16', 'Brian Patel',      '(916) 555-0151', 'bpatel@gmail.com',          'meta_ads',     '2026-09-25', 'converted'),
    L('l17', 'Nicole Turner',    '(916) 555-0166', 'nturner@icloud.com',        'referral',     '2026-09-24', 'converted'),
    L('l18', 'Steven Wright',    '(916) 555-0138', 'swright@gmail.com',         'meta_ads',     '2026-09-22', 'converted'),
    L('l19', 'Amanda Foster',    '(916) 555-0194', 'afoster@yahoo.com',         'meta_ads',     '2026-09-21', 'lost'),
    L('l20', 'Greg Hamilton',    '(916) 555-0125', 'ghamilton@gmail.com',       'organic',      '2026-09-20', 'lost'),
  ];

  // ---------- Generated data for the other demo clients ----------
  const FIRST = ['Emily','Michael','Sarah','David','Jessica','Chris','Laura','Daniel','Megan','Jason','Olivia','Ryan','Sophia','Eric','Grace','Tyler','Natalie','Andrew','Chloe','Victor'];
  const LAST  = ['Martinez','Nguyen','Thompson','Garcia','Clark','Lewis','Walker','Hall','Young','King','Scott','Green','Baker','Nelson','Carter','Mitchell','Perez','Roberts','Turner','Phillips'];
  const SOURCES = ['meta_ads','meta_ads','meta_ads','meta_ads','organic','referral','reactivation'];
  const STATUSES = ['new','new','new','contacted','contacted','contacted','booked','booked','booked','booked','showed','showed','converted','converted','converted','lost','lost','new','contacted','booked'];

  function generate(client, scale, seed) {
    const r = rng(seed);
    const monthly = rsMonthly.map((m, i) => {
      const j = 0.9 + r() * 0.2;
      const leads = Math.round(m.leads * scale * j);
      const booked = Math.round(leads * (0.4 + r() * 0.1));
      const showed = Math.round(booked * (0.62 + r() * 0.1));
      const converted = Math.max(1, Math.round(showed * (0.33 + r() * 0.1)));
      return {
        period: m.period, adSpend: client.monthlyAdSpend,
        impressions: Math.round(m.impressions * scale * j), clicks: Math.round(m.clicks * scale * j),
        leads, booked, showed, converted, revenue: converted * client.carePlanValue,
      };
    });
    const weekly = rsWeekly.map((w) => {
      const leads = Math.max(1, Math.round(w.leads * scale * (0.85 + r() * 0.3)));
      const booked = Math.round(leads * (0.4 + r() * 0.12));
      const showed = Math.round(booked * (0.6 + r() * 0.15));
      const converted = Math.round(showed * (0.3 + r() * 0.15));
      return {
        period: w.period, start: w.start, adSpend: Math.round(client.monthlyAdSpend / 4.3 + r() * 20),
        impressions: Math.round(w.impressions * scale), clicks: Math.round(w.clicks * scale),
        leads, booked, showed, converted, revenue: converted * client.carePlanValue,
      };
    });
    const creatives = rsCreatives.map((c) => {
      const spend = Math.round(c.spend * scale * (0.8 + r() * 0.4));
      const results = Math.max(1, Math.round(c.results * (0.7 + r() * 0.5)));
      return { ...c, spend, results, costPerResult: +(spend / results).toFixed(2) };
    });
    const leads = STATUSES.map((status, i) => {
      const fn = FIRST[(i * 7 + seed) % FIRST.length], ln = LAST[(i * 3 + seed) % LAST.length];
      const d = new Date(Date.UTC(2026, 9, 11 - Math.floor(i * 1.1)));
      return {
        id: client.id + '-l' + (i + 1), name: fn + ' ' + ln,
        phone: '(916) 555-0' + String(100 + ((i * 37 + seed) % 99)).padStart(3, '0'),
        email: (fn[0] + ln).toLowerCase() + '@gmail.com',
        source: SOURCES[Math.floor(r() * SOURCES.length)], date: d.toISOString().slice(0, 10),
        status, practiceName: client.practiceName,
      };
    });
    return { monthly, weekly, creatives, leads };
  }

  const summit = generate(clients[1], 1.15, 11);
  const golden = generate(clients[2], 1.3, 23);

  const metrics = {
    riverstone: { monthly: rsMonthly, weekly: rsWeekly },
    summit:   { monthly: summit.monthly,  weekly: summit.weekly },
    golden:   { monthly: golden.monthly,  weekly: golden.weekly },
  };

  // Ad-account health inputs (would come from Meta Insights API).
  const health = {
    riverstone: { frequency: 2.1, cpm7: 14.2, cpmPrev7: 13.1, spentToDate: 465, monthDay: 11, daysInMonth: 31 },
    summit:   { frequency: 3.1, cpm7: 19.8, cpmPrev7: 15.4, spentToDate: 720, monthDay: 11, daysInMonth: 31 },
    golden:   { frequency: 1.8, cpm7: 16.5, cpmPrev7: 16.9, spentToDate: 690, monthDay: 11, daysInMonth: 31 },
  };

  // Manually-flagged / integration alerts the metrics alone cannot detect.
  const flags = {
    riverstone: [
      { level: 'red', title: 'Ad rejected', body: '"Before/After Posture Scan" was rejected for personal health attributes. Revised copy is in review.' },
    ],
    summit: [
      { level: 'red', title: 'Pixel not firing', body: 'No Lead events from /thank-you since Oct 9. Check the GHL funnel tracking code.' },
    ],
    golden: [],
  };

  const updates = {
    riverstone: [
      { id: 'u1', text: 'Launched 3 new ad creatives', date: '2026-10-09' },
      { id: 'u2', text: 'Optimized targeting for decompression campaign', date: '2026-10-08' },
      { id: 'u3', text: 'Set up appointment reminder sequence', date: '2026-10-06' },
    ],
    summit: [
      { id: 'u1', text: 'Launched 3 new ad creatives', date: '2026-10-09' },
      { id: 'u2', text: 'Optimized targeting for decompression campaign', date: '2026-10-07' },
      { id: 'u3', text: 'Set up appointment reminder sequence', date: '2026-10-06' },
    ],
    golden: [
      { id: 'u1', text: 'Launched 3 new ad creatives', date: '2026-10-08' },
      { id: 'u2', text: 'Optimized targeting for decompression campaign', date: '2026-10-07' },
      { id: 'u3', text: 'Set up appointment reminder sequence', date: '2026-10-05' },
    ],
  };

  // Fly Marketing's own sales pipeline (prospective practices).
  const pipeline = [
    { id: 'd1', practiceName: 'Align Spine Center',          contactName: 'Dr. Rachel Kim',  stage: 'new',         estimatedValue: 28800, nextAction: 'Send intro DM + case study',  nextActionDate: '2026-10-13' },
    { id: 'd2', practiceName: 'Elk Grove Family Chiropractic', contactName: 'Dr. Marcus Lee', stage: 'contacted',   estimatedValue: 30000, nextAction: 'Follow-up call',              nextActionDate: '2026-10-14' },
    { id: 'd3', practiceName: 'Natomas Wellness & Chiro',    contactName: 'Dr. Priya Shah',  stage: 'scheduled',   estimatedValue: 36000, nextAction: 'Strategy call at 2:00 PM',    nextActionDate: '2026-10-15' },
    { id: 'd4', practiceName: 'Davis Decompression Clinic',  contactName: 'Dr. Tom Alvarez', stage: 'negotiating', estimatedValue: 42000, nextAction: 'Send revised proposal',       nextActionDate: '2026-10-12' },
    { id: 'd5', practiceName: 'Roseville Spine & Sport',     contactName: 'Dr. Amy Chen',    stage: 'closed',      estimatedValue: 36000, nextAction: 'Kickoff call + ad account access', nextActionDate: '2026-10-16', closedDate: '2026-10-06' },
  ];

  const reports = {
    riverstone: [
      { id: 'r38', period: '2026-W38', sentAt: '2026-09-21', plan: 'Scale the Linda patient story, test a sciatica hook.' },
      { id: 'r39', period: '2026-W39', sentAt: '2026-09-28', plan: 'Launch $49 special carousel, refresh decompression audience.' },
      { id: 'r40', period: '2026-W40', sentAt: '2026-10-05', plan: 'Add Google reviews montage, pause fatiguing posture ad.' },
    ],
    summit: [], golden: [],
  };

  // "Marty's take": a short personal note from the account manager, shown at the top of the client's overview.
  const notes = {
    riverstone: { date: '2026-10-10', text: "Strongest month since we started. The Linda patient-story ad is bringing in leads at $17 each, so this week I'm moving more of the budget behind it.\n\nThe one lever left is speed: your team books 46% of leads, and if callbacks happen inside 5 minutes I expect November to land around 8 new patients." },
    summit: { date: '2026-10-09', text: "Leads are steady, but Meta is showing the same ads to the same people too often. New creatives go live Monday to bring costs back down." },
    golden: { date: '2026-10-08', text: "Decompression demand is strong in Folsom. We're testing a second offer this week to see if we can lower the cost per booked consult." },
  };

  return {
    clients, metrics, health, flags, updates, pipeline, reports, notes,
    creatives: { riverstone: rsCreatives, summit: summit.creatives, golden: golden.creatives },
    leads: { riverstone: rsLeads, summit: summit.leads, golden: golden.leads },
    connections: { metaApiKey: '', ghlApiKey: '' },
  };
})();
