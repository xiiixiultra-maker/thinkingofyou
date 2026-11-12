

(function () {
'use strict';
const Q = new URLSearchParams(location.search);
const FILM_DIR = 'audio/film/';
const ORDER = ['act1', 'bed', 'find', 'pick', 'bagged', 'act3', 'home'];
const LVL = window.__FILM_LVL != null ? +window.__FILM_LVL : 1.0;
const TOL = 0.012;
const F = window.MusicFilm = {
  on: (Q.get('music') || window.LTWH_MUSIC || 'film') === 'film',
  transpose: 2, log: [],

  sfxLevel: 0.12,
  stingLevel: 0.25,
  pickStingLevel: 1.15,

  pluckLevel: 0.55,
  muffleFloor: 3500,

  boostDb: 2,
  perfNeutral: 0.35,
  streakDb: 4,
  floorDb: -22,
  dimLp: 1200,
  perfTc: 0.3,
};
if (!F.on) return;

let man = null, C = null, H = null, cur = null, sec = null, cueEnd = 0, lastBeat = -9, relocks = 0, mb = 0;
const raw = {}, buf = {};
const say = (...a) => { F.log.push([C ? +C.currentTime.toFixed(3) : 0, ...a]); if (F.log.length > 400) F.log.shift(); };

const loaded = fetch(FILM_DIR + 'film.json')
  .then(r => { if (!r.ok) throw new Error('film.json ' + r.status); return r.json(); })
  .then(m => {
    man = m; if (m.transpose != null) F.transpose = m.transpose;
    if (m.files.pick && m.files.pick.iv) F.pickIv = +m.files.pick.iv;

    return Promise.all(ORDER.map(k => fetch(FILM_DIR + m.files[k].src)
      .then(r => { if (!r.ok) throw new Error(k + ' ' + r.status); return r.arrayBuffer(); })
      .then(ab => { raw[k] = ab; })));
  })
  .catch(e => { F.failed = true; console.warn('Film score could not load, so the game plays with its sound effects only:', (e && e.message) || e); });

let DEC = null;
function decode(ab) {
  return new Promise((res, rej) => {
    let p; try { p = DEC.decodeAudioData(ab, res, rej); } catch (e) { rej(e); return; }
    if (p && typeof p.then === 'function') p.then(res, rej);
  });
}

function clickAt(b) {
  const d = b.getChannelData(0), n = Math.min(d.length, Math.round((man.markAt + 0.15) * b.sampleRate));
  let k = -1, m = 0;
  for (let i = 0; i < n; i++) { const v = Math.abs(d[i]); if (v > m) { m = v; k = i; } }
  return (m > 0.3 ? k / b.sampleRate : man.markAt) + man.lead;
}

function decodeAll() {
  if (F._dec) return;
  let done; F._first = new Promise(r => { done = r; });
  F._dec = loaded.then(() => {
    if (F.failed) return;
    let p = Promise.resolve();
    for (const k of ORDER) {
      p = p.then(() => raw[k] && decode(raw[k]).then(b => {
        buf[k] = { b, a0: clickAt(b), f: man.files[k] }; raw[k] = null;
        mb += b.length * b.numberOfChannels * 4 / 1048576;
        say('decoded', k, +b.duration.toFixed(2));
      })).catch(e => console.warn('Film score: could not decode ' + k, e));
      if (k === 'bed') p = p.then(done);
    }
    return p;
  }).then(done, done);
}

const UA = navigator.userAgent || '';
const PRE = (/Chrome\/\d+/.test(UA) && !/iPad|iPhone|iPod/.test(UA)) || Q.has('predecode');
try {
  const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  if (PRE && OAC) { DEC = new OAC(2, 1, 48000); decodeAll(); }
} catch (e) { DEC = null; }
F.early = !!DEC;
F.init = function (ctx, hooks) {
  C = ctx; H = hooks;
  if (!DEC) DEC = ctx;
  decodeAll();
  return F._first;
};

const OPEN = 22000;
let pdb = null, plp = OPEN;
function perfDb(p) {
  if (!(p >= 0)) return F.boostDb;
  const N = F.perfNeutral;
  if (p >= N) return F.boostDb + F.streakDb * Math.min(1, (p - N) / (1 - N));
  return F.boostDb + (F.floorDb - F.boostDb) * Math.pow((N - p) / N, 1.6);
}
function perfLp(p) { return !(p >= 0) || p >= 0.2 ? OPEN : F.dimLp * Math.pow(OPEN / F.dimLp, p / 0.2); }
function setPerf(at, p) {
  const d = perfDb(p), f = perfLp(p);
  if (F.perfLogged == null || Math.abs(d - F.perfLogged) >= 3) { F.perfLogged = d; say('level dB', +d.toFixed(1), 'pace', p >= 0 ? +(+p).toFixed(2) : null); }
  pdb = d; plp = f;
  if (cur && cur.pg && C && (Math.abs(cur.pgDb - d) > 0.05 || cur.lpHz !== f)) {
    const t = Math.max(C.currentTime, H.T(at));
    cur.pg.gain.setTargetAtTime(Math.pow(10, d / 20), t, F.perfTc);
    cur.lp.frequency.setTargetAtTime(f, t, F.perfTc);
    cur.pgDb = d; cur.lpHz = f;
  }
}

function start(name, kind, at, off, loop, fadeIn, fadeOld) {
  const f = buf[name], s = C.createBufferSource(), g = C.createGain(), pg = C.createGain(), lp = C.createBiquadFilter();
  g.gain.value = 0;
  pg.gain.value = Math.pow(10, (pdb == null ? F.boostDb : pdb) / 20);
  lp.type = 'lowpass'; lp.frequency.value = plp; lp.Q.value = 0.707;
  s.buffer = f.b;
  if (loop) { s.loop = true; s.loopStart = f.a0 + loop[0]; s.loopEnd = f.a0 + loop[1]; }
  const want = H.T(at), late = Math.max(0, C.currentTime - want), t0 = want + late;
  const lvl = LVL * Math.pow(10, (f.f.db || 0) / 20);
  g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(lvl, t0 + fadeIn);
  s.connect(g); g.connect(pg); pg.connect(lp); lp.connect(H.out());
  s.start(t0, f.a0 + off + late);
  if (cur) stop(cur, at, fadeOld);
  cur = { name, kind, s, g, pg, lp, pgDb: pdb == null ? F.boostDb : pdb, lpHz: plp, at, off, loop, fin: t0 + fadeIn };
}
function stop(v, at, fade) {
  const t = Math.max(C.currentTime, H.T(at), v.fin), f = Math.max(0.005, fade || 0.03);
  try { v.g.gain.setTargetAtTime(0, t, f / 3); v.s.stop(t + f * 2.5); } catch (e) {}
}
function fileTime(v, at) {
  let t = v.off + (at - v.at);
  if (v.loop && t >= v.loop[1]) t = v.loop[0] + ((t - v.loop[0]) % (v.loop[1] - v.loop[0]));
  return t;
}
function lock(at, want, k) {
  let d = fileTime(cur, at) - want;
  if (cur.loop) { const len = cur.loop[1] - cur.loop[0]; d -= Math.round(d / len) * len; }
  if (Math.abs(d) <= TOL) return;
  relocks++; say('re-lock', cur.name, 'beat', k, 'drift ms', +(d * 1000).toFixed(1));
  start(cur.name, cur.kind, at, want, cur.loop, 0.02, 0.02);
}

const isAct = s => s === 'count' || s === 'run' || s === 'home';
function actName(s, iv) {
  if (s === 'home') return 'act3';
  if (s === 'run') return 'act1';
  const a = man.files.act1.iv[0], b = man.files.act3.iv[0];
  return Math.abs(iv - b) < Math.abs(iv - a) ? 'act3' : 'act1';
}
function actTime(f, k) {
  const B = f.f.beats, L = B.length - 1;
  if (k <= L) return B[k];
  let l0 = B.indexOf(f.f.loop[0]); if (l0 < 0 || l0 >= L) l0 = L - 16;
  return B[l0 + ((k - l0) % (L - l0))];
}
function actBeat(at, n, iv, s) {
  const want = actName(s, iv);
  if (s !== 'count' && want !== sec.name && buf[want]) { sec.name = want; say('act file corrected to', want); }
  const f = buf[sec.name], k = n - sec.n0, t = actTime(f, k);
  if (!cur || cur.name !== sec.name) { start(sec.name, 'act', at, t, f.f.loop, k > 0 ? 0.25 : 0.01, 0.12); say('start', sec.name, 'beat', k); return true; }
  lock(at, t, k);
  return true;
}
function pickBeat(at, n) {
  const f = buf.pick, B = f.f.beats, N = B.length - 1, k = n - sec.n0, j = ((f.f.startBeat || 0) + k) % N;
  if (!cur || cur.name !== 'pick') { start('pick', 'pick', at, B[j], f.f.loop, k > 0 ? 0.25 : 0.01, 0.15); say('start pick, loop beat', j); return true; }
  lock(at, B[j], k);
  return true;
}
function cineBeat(at) {
  if (at < cueEnd - 0.05) return true;
  if (!buf.bed) return false;
  if (!cur || cur.name !== 'bed') { start('bed', 'bed', at, 0, buf.bed.f.loop, 0.8, 0.3); say('start bed'); }
  return true;
}

F.beat = function (at, n, iv, s, perf) {
  if (!F.on || !C) return false;
  setPerf(at, s === 'pick' || isAct(s) ? perf : undefined);
  const key = isAct(s) ? 'act' : s === 'pick' ? 'pick' : 'cine';
  if (!sec || sec.key !== key || n < sec.last || (s === 'count' && sec.ran))
    sec = { key, name: null, n0: n, last: n, ran: false };
  sec.last = n; lastBeat = at;
  if (s === 'run' || s === 'home') sec.ran = true;
  if (!man) return false;
  if (!sec.name) sec.name = key === 'act' ? actName(s, iv) : key === 'pick' ? 'pick' : 'bed';
  if (key !== 'cine' && !buf[sec.name]) return false;
  return key === 'act' ? actBeat(at, n, iv, s) : key === 'pick' ? pickBeat(at, n) : cineBeat(at);
};
F.cue = function (name, at) {
  if (!F.on || !C || !buf[name]) return 0;
  setPerf(at);
  start(name, 'cue', at, 0, null, 0.01, 0.25);
  cueEnd = at + buf[name].f.len;
  say('cue', name);
  return buf[name].f.len;
};
F.hush = function (at, fade) {
  if (cur && C) { stop(cur, at, fade || 0.3); say('hush', cur.name); }
  cur = null; cueEnd = 0;
};

setInterval(() => {
  if (!C || !cur || cur.kind === 'cue' || C.state !== 'running') return;
  if (C.currentTime > lastBeat + 1.5) { say('no beats: fade', cur.name); stop(cur, C.currentTime + 0.05, 0.6); cur = null; sec = null; }
}, 500);
F.stats = () => ({ on: F.on, failed: !!F.failed, decoded: Object.keys(buf), playing: cur ? cur.name : null, relocks, mb: +mb.toFixed(1),
  levelDb: pdb == null ? null : +pdb.toFixed(1) });
})();
