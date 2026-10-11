/* Data layer. Every read/write goes through FlyAPI so the mock store can be replaced
 * with real endpoints (Meta Marketing API, GoHighLevel, your own backend) without
 * touching the UI. Each method returns a Promise, the same as a fetch() would.
 *
 * NOTE: the mock store persists edits in this browser's localStorage only. A client
 * opening their share link on their own phone sees the mock data, not your edits,
 * until a real backend is wired in. */
window.FlyAPI = (function () {
  const KEY = 'fly-dashboard-v2';
  const LATENCY = 320;
  const clone = (o) => JSON.parse(JSON.stringify(o));

  let db;
  try { db = JSON.parse(localStorage.getItem(KEY)); } catch (e) { db = null; }
  if (!db || !db.clients) db = clone(window.FLY_MOCK);

  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { /* storage unavailable */ }
  }
  function delay(value, ms) {
    return new Promise((res) => setTimeout(() => res(clone(value)), ms == null ? LATENCY : ms));
  }
  const uid = (p) => p + Math.random().toString(36).slice(2, 9);
  const forClient = (table, id) => (db[table][id] = db[table][id] || []);

  return {
    // ---- reads ----
    getClients:   () => delay(db.clients, 120),
    getClientByToken: (token) => delay(db.clients.find((c) => c.shareToken === token) || null, 120),
    getMonthly:   (id) => delay(db.metrics[id] ? db.metrics[id].monthly : []),
    getWeekly:    (id) => delay(db.metrics[id] ? db.metrics[id].weekly : []),
    getHealth:    (id) => delay(db.health[id] || null),
    getFlags:     (id) => delay(db.flags[id] || []),
    getCreatives: (id) => delay(forClient('creatives', id)),
    getLeads:     (id) => delay(forClient('leads', id)),
    getUpdates:   (id) => delay(forClient('updates', id)),
    getReports:   (id) => delay(forClient('reports', id)),
    getPipeline:  () => delay(db.pipeline),
    getConnections: () => delay(db.connections, 60),
    getNote:      (id) => delay((db.notes || {})[id] || null, 80),

    // ---- writes ----
    addUpdate(id, text, date) {
      const item = { id: uid('u'), text, date };
      forClient('updates', id).unshift(item); persist(); return delay(item, 80);
    },
    editUpdate(id, updateId, patch) {
      const it = forClient('updates', id).find((u) => u.id === updateId);
      Object.assign(it, patch); persist(); return delay(it, 80);
    },
    deleteUpdate(id, updateId) {
      db.updates[id] = forClient('updates', id).filter((u) => u.id !== updateId); persist(); return delay(true, 80);
    },
    addCreative(id, c) {
      const item = { id: uid('cr'), ...c, costPerResult: c.results ? +(c.spend / c.results).toFixed(2) : 0 };
      forClient('creatives', id).unshift(item); persist(); return delay(item, 120);
    },
    setLeadStatus(id, leadId, status) {
      const l = forClient('leads', id).find((x) => x.id === leadId);
      l.status = status; persist(); return delay(l, 60);
    },
    moveDeal(dealId, stage) {
      const d = db.pipeline.find((x) => x.id === dealId);
      d.stage = stage;
      if (stage === 'closed' && !d.closedDate) d.closedDate = new Date().toISOString().slice(0, 10);
      persist(); return delay(d, 60);
    },
    addDeal(deal) {
      const item = { id: uid('d'), ...deal }; db.pipeline.push(item); persist(); return delay(item, 100);
    },
    saveClient(client) {
      const i = db.clients.findIndex((c) => c.id === client.id);
      if (i >= 0) db.clients[i] = { ...db.clients[i], ...client };
      else {
        client.id = client.id || uid('c');
        client.shareToken = uid('');
        db.clients.push(client);
        db.metrics[client.id] = { monthly: [], weekly: [] };
      }
      persist(); return delay(db.clients.find((c) => c.id === client.id), 120);
    },
    regenerateToken(id) {
      const c = db.clients.find((x) => x.id === id);
      c.shareToken = id.slice(0, 2) + '-' + Math.random().toString(36).slice(2, 8);
      persist(); return delay(c, 80);
    },
    saveReport(id, report) {
      const list = forClient('reports', id).filter((r) => r.period !== report.period);
      list.push({ id: uid('r'), ...report }); list.sort((a, b) => a.period.localeCompare(b.period));
      db.reports[id] = list; persist(); return delay(report, 120);
    },
    saveNote(id, text, date) { db.notes = db.notes || {}; db.notes[id] = { text, date }; persist(); return delay(db.notes[id], 80); },
    saveConnections(conn) { db.connections = { ...db.connections, ...conn }; persist(); return delay(db.connections, 120); },
    resetDemo() { db = clone(window.FLY_MOCK); persist(); return delay(true, 60); },
  };
})();
