
[3 lines collapsed]

const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const PORT = +process.env.PORT || 3000, HOST = process.env.HOST || '0.0.0.0';
const DATA = process.env.DATA_DIR || path.join(__dirname, 'data'), FILE = path.join(DATA, 'db.json');
const INVITE = process.env.INVITE_CODE || '', TRUST = process.env.TRUST_PROXY === '1';
const INVITE = process.env.INVITE_CODE || '', TRUST = process.env.TRUST_PROXY === '1' || !!process.env.RENDER;
const DAY = 864e5, SESS = 30 * DAY, NAME = /^[a-z0-9_]{3,16}$/;
const ACCENTS = ['ice', 'violet', 'mint', 'rose'];
const DEF = { accent: 'ice', snow: true, calm: false, sound: true, notify: false, showOnline: true };
const CSP = "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'";
const DEF = { accent: 'ice', snow: true, calm: false, sound: true, notify: false, showOnline: true, frutiger: false };
const GIPHY_KEY = process.env.GIPHY_API_KEY || '', GIPHY_BASE = process.env.GIPHY_BASE || 'https://api.giphy.com/v1/gifs/';
const GIF_RE = /^https:\/\/(media\d*|i)\.giphy\.com\//, clampN = v => Math.max(50, Math.min(600, Math.round(+v) || 200));
const CSP = "default-src 'self'; img-src 'self' data: https://*.giphy.com; media-src 'self' blob:; frame-src https://www.youtube.com https://www.youtube-nocookie.com; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'";
fs.mkdirSync(DATA, { recursive: true });
let db = { users: {}, msgs: {}, reads: {}, sessions: {}, seq: 0 };
let db = { users: {}, msgs: {}, reads: {}, sessions: {}, follows: {}, groups: {}, arch: {}, imgs: {}, seq: 0 };
try { db = Object.assign(db, JSON.parse(fs.readFileSync(FILE, 'utf8'))); } catch (e) { if (e.code !== 'ENOENT') throw e; }
let timer = null;
const flush = () => { clearTimeout(timer); timer = null; const t = FILE + '.tmp'; fs.writeFileSync(t, JSON.stringify(db)); fs.renameSync(t, FILE); };
const flushFile = () => { const t = FILE + '.tmp'; fs.writeFileSync(t, JSON.stringify(db)); fs.renameSync(t, FILE); };
// ---- isteğe bağlı uzak kayıt: Upstash Redis (ücretsiz plan) ----
const RURL = (process.env.UPSTASH_REDIS_REST_URL || '').replace(/\/$/, ''), RTOK = process.env.UPSTASH_REDIS_REST_TOKEN || '', REMOTE = !!(RURL && RTOK);
let ready = !REMOTE, remoteState = {};
async function rpipe(cmds) {
  const r = await fetch(RURL + '/pipeline', { method: 'POST', headers: { Authorization: 'Bearer ' + RTOK, 'Content-Type': 'application/json' }, body: JSON.stringify(cmds), signal: AbortSignal.timeout(15000) });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  const a = await r.json(), bad = a.find(x => x.error); if (bad) throw new Error(bad.error);
  return a.map(x => x.result);
}
const shards = () => {
  const out = {}, users = {};
  for (const u in db.users) { const { avatar, ...rest } = db.users[u]; users[u] = rest; if (avatar) out['fluid:av:' + u] = avatar; }
  out['fluid:core'] = JSON.stringify({ users, reads: db.reads, sessions: db.sessions, seq: db.seq, convs: Object.keys(db.msgs), imgs: Object.keys(db.imgs), follows: db.follows, groups: db.groups, arch: db.arch });
  for (const k in db.msgs) out['fluid:msg:' + k] = JSON.stringify(db.msgs[k]);
  for (const k in db.imgs) out['fluid:img:' + k] = db.imgs[k];
  return out;
};
async function pushRemote() {
  if (!ready) return;
  const sh = shards(), cmds = [];
  for (const k in sh) if (remoteState[k] !== sh[k]) cmds.push(['SET', k, sh[k]]);
  for (const k in remoteState) if (!(k in sh)) cmds.push(['DEL', k]);
  let batch = [], size = 0;
  const send = async () => { if (batch.length) { await rpipe(batch); batch = []; size = 0; } };
  for (const c of cmds) { const n = (c[2] || '').length; if (size + n > 4e5) await send(); batch.push(c); size += n; }
  await send(); remoteState = sh;
}
async function loadRemote() {
  const raw = (await rpipe([['GET', 'fluid:core']]))[0];
  if (raw) {
    const core = JSON.parse(raw), names = Object.keys(core.users || {}), convs = core.convs || [], res = [];
    const imgs = core.imgs || [], cmds = [...names.map(u => ['GET', 'fluid:av:' + u]), ...convs.map(k => ['GET', 'fluid:msg:' + k]), ...imgs.map(k => ['GET', 'fluid:img:' + k])];
    for (let i = 0; i < cmds.length; i += 50) res.push(...await rpipe(cmds.slice(i, i + 50)));
    db = { users: core.users || {}, reads: core.reads || {}, sessions: core.sessions || {}, follows: core.follows || {}, groups: core.groups || {}, arch: core.arch || {}, seq: core.seq || 0, msgs: {}, imgs: {} };
    names.forEach((u, i) => { db.users[u].avatar = res[i] || ''; });
    convs.forEach((k, i) => { db.msgs[k] = JSON.parse(res[names.length + i] || '[]'); });
    imgs.forEach((k, i) => { const v = res[names.length + convs.length + i]; if (v) db.imgs[k] = v; });
    remoteState = shards();
  } else console.log('Uzak veritabanı boş, mevcut veriyle başlanıyor.');
  ready = true;
}
let busy = false, again = false;
async function kick() {
  again = true; if (busy) return; busy = true;
  try { while (again) { again = false; try { await pushRemote(); } catch (e) { console.error('Uzak kayıt hatası:', e.message); setTimeout(() => { if (!timer) save(); }, 5000); } } } finally { busy = false; }
}
const flush = () => { clearTimeout(timer); timer = null; if (REMOTE) kick(); else flushFile(); };
const save = () => { if (!timer) timer = setTimeout(flush, 300); };
// ---- şifre & oturum ----

[9 lines collapsed]

const dropSessions = (u, keep) => { for (const k in db.sessions) if (db.sessions[k].u === u && k !== keep) delete db.sessions[k]; };
setInterval(() => { for (const k in db.sessions) if (db.sessions[k].exp < Date.now()) delete db.sessions[k]; save(); }, 36e5);
const tries = new Map();
const limited = ip => { const now = Date.now(), a = (tries.get(ip) || []).filter(t => now - t < 6e5); tries.set(ip, a); return a.length >= 10; };
const strike = ip => (tries.get(ip) || tries.set(ip, []).get(ip)).push(Date.now());
const tries = new Map(), WIN = 6e5;
const bucket = k => { const now = Date.now(), a = (tries.get(k) || []).filter(t => now - t < WIN); tries.set(k, a); return a; };
const wait = (...rules) => { let w = 0; for (const [k, max] of rules) { const a = bucket(k); if (a.length >= max) w = Math.max(w, Math.ceil((a[0] + WIN - Date.now()) / 6e4)); } return w; };
const strike = (...ks) => ks.forEach(k => bucket(k).push(Date.now()));
const tooMany = (res, w) => J(res, 429, { error: 'Çok fazla deneme, biraz bekle', wait: w });
setInterval(() => { for (const k of [...tries.keys()]) if (!bucket(k).length) tries.delete(k); }, WIN);
// ---- yardımcılar ----
const key = (a, b) => [a, b].sort().join('|');

[2 lines collapsed]

const isOnline = u => (clients.get(u) || { size: 0 }).size > 0 && db.users[u].settings?.showOnline !== false;
const meOf = u => { const o = db.users[u]; return { u, bio: o.bio, av: o.av, note: noteOf(o), settings: { ...DEF, ...o.settings } }; };
function listFor(me) {
  const r = (db.reads[me] || {});
  return Object.keys(db.users).filter(x => x !== me).map(x => {
    const o = db.users[x], m = db.msgs[key(me, x)] || [], l = m[m.length - 1], last = r[x] || 0;
    return { u: x, bio: o.bio, av: o.av, note: noteOf(o), online: isOnline(x), unread: m.filter(z => z.f === x && z.id > last).length, last: l ? { t: l.t, ts: l.ts, f: l.f } : null };
  });
  const r = db.reads[me] || {}, fol = new Set(db.follows[me] || []), out = [];
  for (const x of Object.keys(db.users)) {
    if (x === me) continue;
    const o = db.users[x], m = db.msgs[key(me, x)] || [];
    if (!fol.has(x) && !m.length) continue;
    const l = m[m.length - 1], last = r[x] || 0;
    out.push({ u: x, bio: o.bio, av: o.av, note: fol.has(x) ? noteOf(o) : null, online: isOnline(x), following: fol.has(x), arch: archOf(key(me, x), me), unread: m.filter(z => z.f === x && z.id > last && !z.d).length, last: l ? { t: l.d ? '' : l.t, ts: l.ts, f: l.f, g: !!l.g, i: !!l.i, d: !!l.d } : null });
  }
  return out;
}
const rmImgs = arr => { for (const x of arr || []) if (x.i) delete db.imgs[x.i]; };
const ARCH_N = +process.env.ARCHIVE_COUNT || 3000, ARCH_MS = (+process.env.ARCHIVE_DAYS || 3) * DAY;
const members = ck => ck.startsWith('g:') ? ((db.groups[ck.slice(2)] || {}).members || []) : ck.split('|');
const archOf = (ck, me) => { const a = db.arch[ck]; return a ? { n: a.n, deadline: a.at + ARCH_MS, done: a.dl.includes(me) } : null; };
function checkArchive(ck) {
  const l = db.msgs[ck]; if (!l || db.arch[ck]) return;
  if (l.length < ARCH_N && l.reduce((s, x) => s + x.t.length + 60, 0) < 6e5) return;
  const n = l.length >= ARCH_N ? ARCH_N : Math.ceil(l.length / 2);
  db.arch[ck] = { upto: l[n - 1].id, n, at: Date.now(), dl: [] };
  for (const u of members(ck)) push(u, { type: 'user' });
}
function sweepArchives() {
  let ch = false;
  for (const ck of Object.keys(db.arch)) {
    const a = db.arch[ck], mem = members(ck);
    if (mem.length && Date.now() - a.at < ARCH_MS && !mem.every(u => a.dl.includes(u) || !db.users[u])) continue;
    rmImgs((db.msgs[ck] || []).filter(x => x.id <= a.upto)); db.msgs[ck] = (db.msgs[ck] || []).filter(x => x.id > a.upto); delete db.arch[ck]; ch = true;
    checkArchive(ck); for (const u of mem) push(u, { type: 'user' });
  }
  if (ch) save();
}
setInterval(sweepArchives, 6e4);
const groupOf = (g, me) => { const k = 'g:' + g.id, m = db.msgs[k] || [], l = m[m.length - 1], last = (db.reads[me] || {})[k] || 0;
  return { id: g.id, name: g.name, owner: g.owner, members: g.members.map(u => ({ u, av: db.users[u] ? db.users[u].av : 0 })),
    unread: m.filter(z => z.f !== me && z.id > last && !z.d).length, last: l ? { t: l.d ? '' : l.t, ts: l.ts, f: l.f, g: !!l.g, i: !!l.i, d: !!l.d } : null, arch: archOf(k, me) }; };
const groupsFor = me => Object.values(db.groups).filter(g => g.members.includes(me)).map(g => groupOf(g, me));
function dropGroup(id) { rmImgs(db.msgs['g:' + id]); delete db.groups[id]; delete db.msgs['g:' + id]; delete db.arch['g:' + id]; for (const u in db.reads) delete db.reads[u]['g:' + id]; }
const push = (u, ev) => { for (const r of clients.get(u) || []) r.write(`data: ${JSON.stringify(ev)}\n\n`); };
const broadcast = ev => { for (const u of clients.keys()) push(u, ev); };
setInterval(() => { for (const s of clients.values()) for (const r of s) r.write(':\n\n'); }, 25000);
// ---- arama sinyali: medya tarayıcıda (WebRTC). sunucu yalnızca kimleri bağlayacağını taşır ----
function iceServers() {
  if (process.env.ICE_JSON) try { const a = JSON.parse(process.env.ICE_JSON); if (Array.isArray(a) && a.length) return a; } catch (e) {}
  return (process.env.ICE_SERVERS || 'stun:stun.l.google.com:19302').split(',').map(s => s.trim()).filter(Boolean).map(urls => ({ urls }));
