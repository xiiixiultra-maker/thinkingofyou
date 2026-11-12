

(function () {
'use strict';
const GROUND = 420, H = 540, TAU = Math.PI * 2;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const eout = k => 1 - Math.pow(1 - clamp(k, 0, 1), 3);
const eback = k => { k = clamp(k, 0, 1) - 1; return 1 + 2.7 * k * k * k + 1.7 * k * k; };
function hash(i) { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
function rng(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const base = () => (window.PICK_BASE || '');
const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

 const GROVE = {"TW": 1800, "MANGO_SCALE": 1.8, "TIER_GAP": 76, "UNDER": 84, "sprites": {"canopy": [0, -520, 1800, 600], "fringe": [0, -110, 1800, 190], "bough_verde_0": [-170, -336, 300, 346], "bough_verde_1": [-170, -336, 300, 346], "bough_verde_2": [-170, -336, 300, 346], "bough_erizo_0": [-170, -260, 300, 270], "bough_erizo_1": [-170, -260, 300, 270], "bough_erizo_2": [-170, -260, 300, 270], "bough_mangonada_0": [-170, -184, 300, 194], "bough_mangonada_1": [-170, -184, 300, 194], "bough_mangonada_2": [-170, -184, 300, 194], "trunk_0": [-240, -1050, 480, 1090], "trunk_1": [-240, -1050, 480, 1090], "trunk_2": [-240, -1050, 480, 1090]}};

const K = {
  V0: 280, V1: 335, RAMP: 0.9,

  STEP: 0.34,
  G: 2400, HANG: 0.5, HANG_V: 200,
  LIFT: [45, 45 + GROVE.TIER_GAP, 45 + 2 * GROVE.TIER_GAP],
  CHARGE_T: 0.6, PLATEAU: 0.6,
  BUFFER: 0.15,
  PERF: [0.10, 0.08], GOOD: [0.30, 0.24],

  HERO_GAP: 4.0, HERO_MAX: 2,

  MS: GROVE.MANGO_SCALE, GAP: GROVE.TIER_GAP, UNDER: GROVE.UNDER,
  FRUIT_DY: 10,
  LOOK: 520,
  FIRST: 2.5,
  END_HOLD: { full: 2.0, time: 1.5 },
};
const RIPE = ['verde', 'erizo', 'mangonada'];
const PAL = {
  verde: { name: 'VERDE', c: '#A6D23E', ink: '#4F7A1C', glow: '#B6F04E', pts: 10 },
  erizo: { name: 'ERIZO', c: '#FFB12E', ink: '#C75A12', glow: '#FFB834', pts: 20 },
  mangonada: { name: 'MANGONADA', c: '#FF5B3B', ink: '#A41E1A', glow: '#FF4A30', pts: 30 },
  gold: { name: 'GOLD', c: '#FFD45A', ink: '#B98514', glow: '#FFE07A', pts: 100 },
};
const CREAM = '#FFF6E5', CORAL = '#FF9A86', INK = '#15130F';

function stepJump(st, dt) {
  const n = 4, d = dt / n;
  for (let i = 0; i < n; i++) {
    const g = K.G * (Math.abs(st.vy) < K.HANG_V ? K.HANG : 1);
    st.vy -= g * d; st.h += st.vy * d;
  }
}
function simulate(v0) {
  const st = { h: 0, vy: v0 }; let t = 0, apexT = 0, apexH = 0;
  while (t < 3) { stepJump(st, 1 / 240); t += 1 / 240; if (st.h > apexH) { apexH = st.h; apexT = t; } if (st.h <= 0 && t > 0.02) break; }
  return { apexT, apexH, air: t };
}

K.LIFT_FULL = K.LIFT[2] + 34;
const V0 = [], TAPEX = [], AIR = [];
for (let k = 0; k < 4; k++) {
  const lift = k < 3 ? K.LIFT[k] : K.LIFT_FULL;
  let lo = 200, hi = 2400;
  for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (simulate(m).apexH < lift) lo = m; else hi = m; }
  const s = simulate(hi); V0[k] = hi; TAPEX[k] = s.apexT; AIR[k] = s.air;
}
function chargeAt(hold) {
  const u = clamp(hold / K.CHARGE_T, 0, 1);
  return clamp(u + K.PLATEAU * Math.sin(6 * Math.PI * u) / (6 * Math.PI), 0, 1);
}
const tierOf = c => c < 1 / 3 ? 0 : c < 2 / 3 ? 1 : 2;
const FULL = 0.985;
const HOLD_MID = [0.09, 0.3, 0.52, 0.68];

const A = { shoeHi: null, shoeLo: null, midLo: null, veilLo: null, tintLo: {}, glowRun: {}, midBox: null, sheen: null,
  grove: {}, res: 1, errors: [], ready: false };
function loadImg(src) {
  return new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => rej(new Error('pick: could not load ' + src)); im.src = src; });
}
function canvas(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; }
function tint(src, color, alpha) {
  const c = canvas(src.width, src.height), x = c.getContext('2d');
  x.drawImage(src, 0, 0); x.globalCompositeOperation = 'source-in'; x.globalAlpha = alpha == null ? 1 : alpha;
  x.fillStyle = color; x.fillRect(0, 0, c.width, c.height); return c;
}
function softBlur(src, k) {
  const w = Math.max(2, Math.round(src.width / k)), h = Math.max(2, Math.round(src.height / k));
  const a = canvas(w, h), ax = a.getContext('2d'); ax.imageSmoothingQuality = 'high'; ax.drawImage(src, 0, 0, w, h);
  const b = canvas(src.width, src.height), bx = b.getContext('2d'); bx.imageSmoothingQuality = 'high'; bx.drawImage(a, 0, 0, b.width, b.height);
  return b;
}
function guessScale() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  return Math.min((innerHeight || 620) * dpr / 620, (innerWidth || 600) * dpr / 600) || 1.2;
}
async function svgVariant(text, hide) {
  const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
  for (const id of hide) { const el = doc.querySelector('[id="' + id + '"]'); if (el) el.setAttribute('display', 'none'); }
  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(doc)], { type: 'image/svg+xml' }));
  try { return await loadImg(url); } finally { setTimeout(() => URL.revokeObjectURL(url), 2000); }
}
async function bakeShoe() {
  const src = base() + 'shoe.svg';
  let text = null, full;
  try { const r = await fetch(src); if (r.ok) text = await r.text(); } catch (e) { text = null; }
  full = text ? await svgVariant(text, []) : await loadImg(src);
  const R = 740 / 1180, sc = guessScale();
  const wHi = Math.round(clamp(560 * sc, 900, 1500)), wLo = Math.round(clamp(260 * sc, 360, 640));
  const draw = (im, w) => { const c = canvas(w, w * R); const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(im, 0, 0, c.width, c.height); return c; };
  A.shoeHi = draw(full, wHi); A.shoeLo = draw(full, wLo);

  A.sheen = tint(A.shoeHi, '#FFF8E8');
  if (!text) return;

  const mid = await svgVariant(text, ['upper', 'stripes']);
  const str = await svgVariant(text, ['upper', 'midsole']);
  const mk = w => { const c = draw(mid, w), x = c.getContext('2d'); x.globalCompositeOperation = 'destination-out'; x.drawImage(str, 0, 0, c.width, c.height); return c; };
  A.midLo = mk(wLo);
  A.midHi = mk(wHi);
  A.veilLo = tint(A.midLo, 'rgba(24,16,34,1)', 0.62);
  for (const k of ['verde', 'erizo', 'mangonada', 'gold']) {
    A.tintLo[k] = tint(A.midLo, PAL[k].glow);

    const pad = 0.18, w = 220, ox = w * pad, oy = w * R * pad + w * pad * 0.3;
    const g = canvas(w * (1 + 2 * pad), w * R * (1 + 2 * pad) + w * pad * 0.6), gx = g.getContext('2d');
    gx.drawImage(A.midLo, ox, oy, w, w * R);
    const blurred = softBlur(tint(g, PAL[k].glow), 5);
    const crisp = canvas(g.width, g.height), cx = crisp.getContext('2d');
    cx.drawImage(blurred, 0, 0); cx.drawImage(blurred, 0, 0); cx.globalAlpha = 0.85; cx.drawImage(tint(g, PAL[k].glow), 0, 0);
    A.glowRun[k] = { c: crisp, w, ox, oy };
  }

  try {
    const d = A.midLo.getContext('2d').getImageData(0, 0, A.midLo.width, A.midLo.height).data, W = A.midLo.width, Hh = A.midLo.height;
    let x0 = W, x1 = 0, y0 = Hh, y1 = 0;
    for (let y = 0; y < Hh; y += 2) for (let x = 0; x < W; x += 2) if (d[(y * W + x) * 4 + 3] > 40) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    A.midBox = { x0, x1, y0, y1, W, H: Hh };
  } catch (e) { A.midBox = { x0: A.midLo.width * 0.06, x1: A.midLo.width * 0.975, y0: A.midLo.height * 0.62, y1: A.midLo.height * 0.97, W: A.midLo.width, H: A.midLo.height }; }
}
async function bakeGrove() {
  const sc = guessScale();
  A.res = clamp(sc * 0.78 * 1.1, 0.75, 1.6);
  const jobs = [];
  for (const name in GROVE.sprites) {
    const vb = GROVE.sprites[name];
    const r = A.res * (name.startsWith('trunk') ? 0.7 : name.startsWith('bough') ? 1.25 : 1);
    for (const kind of ['day', 'dusk']) {
      jobs.push(loadImg(base() + 'pick/art/' + name + '.' + kind + '.svg').then(im => {
        const c = canvas(vb[2] * r, vb[3] * r);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        (A.grove[name] = A.grove[name] || { vb })[kind] = c;
      }, e => { A.errors.push(name + '.' + kind); }));
    }
  }
  await Promise.all(jobs);

  for (const name in A.grove) trimSprite(A.grove[name], !(name === 'canopy' || name === 'fringe'));
}
function trimSprite(spr, horiz) {
  const c = spr.day; if (!c) return;
  const W = c.width, Hh = c.height;
  let d; try { d = c.getContext('2d').getImageData(0, 0, W, Hh).data; } catch (e) { return; }
  let x0 = W, x1 = -1, y0 = Hh, y1 = -1;
  for (let y = 0; y < Hh; y++) {
    const row = y * W * 4;
    for (let x = 0; x < W; x += 2) if (d[row + x * 4 + 3] > 2) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; y1 = y; }
  }
  if (x1 < 0) return;
  if (!horiz) { x0 = 0; x1 = W - 1; } else { x0 = Math.max(0, x0 - 2); x1 = Math.min(W - 1, x1 + 2); }
  y0 = Math.max(0, y0 - 1); y1 = Math.min(Hh - 1, y1 + 1);
  const k = W / spr.vb[2], w = x1 - x0 + 1, h = y1 - y0 + 1;
  for (const kind of ['day', 'dusk']) {
    const src = spr[kind]; if (!src) continue;
    const o = canvas(w, h); o.getContext('2d').drawImage(src, -x0, -y0); spr[kind] = o;
  }
  spr.vb = [spr.vb[0] + x0 / k, spr.vb[1] + y0 / k, w / k, h / k];
}
function makeHalos() {
  A.halo = {};
  for (const k of ['verde', 'erizo', 'mangonada', 'gold']) {
    const c = canvas(96, 96), x = c.getContext('2d'), g = x.createRadialGradient(48, 48, 0, 48, 48, 48);
    g.addColorStop(0, hexA(PAL[k].glow, 0.75)); g.addColorStop(0.35, hexA(PAL[k].glow, 0.3)); g.addColorStop(1, hexA(PAL[k].glow, 0));
    x.fillStyle = g; x.fillRect(0, 0, 96, 96); A.halo[k] = c;
  }
  const c = canvas(96, 96), x = c.getContext('2d'), g = x.createRadialGradient(48, 48, 0, 48, 48, 48);
  g.addColorStop(0, 'rgba(255,250,232,0.95)'); g.addColorStop(0.3, 'rgba(255,236,190,0.45)'); g.addColorStop(1, 'rgba(255,220,160,0)');
  x.fillStyle = g; x.fillRect(0, 0, 96, 96); A.halo.white = c;
}
makeHalos();
const ready = (async () => {
  const t0 = performance.now();
  await Promise.all([bakeShoe().catch(e => { A.errors.push('shoe: ' + e.message); }), bakeGrove().catch(e => { A.errors.push('grove: ' + e.message); })]);
  A.ready = true; A.bakeMs = Math.round(performance.now() - t0);
  return true;
})();

function features() {
  const R = window.Runner, f = (R && R.features) || {};
  return { runner: !!(R && R.draw && R.parts && R.parts.shoe), crouch: !!f.crouch,
    catchPose: !!(f.poses && f.poses.indexOf('catch') >= 0), anchors: !!f.anchors };
}
function handFromLast(L) {
  const A2 = L && L.armNear; if (!A2) return null;
  const c = Math.cos(L.lean), s = Math.sin(L.lean);
  const sx = L.hipX + 3 * c + 110 * s + 2.4 * (A2.sw || 0), sy = L.hipY + 3 * s - 110 * c;
  const ex = sx + Math.sin(A2.a) * 66, ey = sy + Math.cos(A2.a) * 66, fa = A2.a + A2.e;
  const wx = ex + Math.sin(fa) * 56, wy = ey + Math.cos(fa) * 56, ha = fa + (A2.w || 0);
  return { x: wx + Math.sin(ha) * 9, y: wy + Math.cos(ha) * 9 };
}
function shoesFromLast(L) {
  if (!L || !L.legs) return null;
  return L.legs.map(g => ({ x: g.ax, y: g.ay, angle: g.tilt, far: g.far }));
}
let REACH = null;
function measureReach() {
  const f = features();
  if (!f.runner) return { dx: 62, dy: 372, measured: false };
  try {
    const c = canvas(4, 4), x = c.getContext('2d');
    const s = { x: 0, ground: 0, h: 200, phase: 0, pace: 0.5, speed: 0, beatInterval: K.STEP, air: true, vy: 0, stumble: 0, t: 0, static: true };
    if (f.catchPose) { s.pose = 'catch'; s.poseT = 0.4; }
    const an = window.Runner.draw(x, s);
    const hand = (an && an.nearHand) || handFromLast(window.Runner.last);
    if (hand && isFinite(hand.x) && isFinite(hand.y)) return { dx: hand.x, dy: -200 - hand.y, measured: true };
  } catch (e) {   }
  return { dx: 62, dy: 372, measured: false };
}

function speedAt(t, dur) {
  if (t < K.RAMP) return K.V0 * sstep(0, K.RAMP, t);
  return lerp(K.V0, K.V1, clamp((t - K.RAMP) / Math.max(1, dur - K.RAMP), 0, 1));
}
function buildCourse(seed, dur, reach) {
  const r = rng(seed || 1);

  const N = Math.ceil((dur + 3) * 120), X = new Float64Array(N + 1);
  for (let i = 1; i <= N; i++) X[i] = X[i - 1] + speedAt((i - 0.5) / 120, dur) / 120;
  const xAt = t => { const f = clamp(t * 120, 0, N - 1), i = Math.floor(f); return lerp(X[i], X[i + 1], f - i); };
  const slots = [{ t: K.FIRST, tier: 0, coach: 'TAP ON THE LIGHT' }, { t: K.FIRST + 1.75, tier: 1, coach: 'HOLD TO ORANGE' },
    { t: K.FIRST + 3.75, tier: 2, coach: 'HOLD TO RED' }];
  const golds = [dur * 0.47, dur * 0.79];
  let t = slots[2].t, prev = 2, run = 0;
  for (;;) {
    const p = t / dur;
    let gap = lerp(1.72, 1.2, p) + (r() - 0.5) * 0.16;
    gap = Math.max(gap, AIR[prev] + 0.3);
    t += gap;
    if (t > dur - 0.6) break;
    let tier, kind = 'single';
    if (golds.length && t >= golds[0] - 0.4) { tier = 2; kind = 'gold'; golds.shift(); }
    else {
      const w = [0.36, 0.36, 0.28];
      tier = r() < w[0] ? 0 : r() < 0.56 ? 1 : 2;
      if (tier === prev && ++run >= 2) { tier = (tier + 1 + (r() < 0.5 ? 1 : 0)) % 3; run = 0; } else if (tier !== prev) run = 0;
      if (t > 8.5 && r() < 0.18) kind = 'double';
    }
    slots.push({ t, tier, kind });
    prev = tier;
  }
  const mangoes = [];
  let id = 0;
  for (const s of slots) {
    const hx = xAt(s.t) + reach.dx;
    const hgt = reach.dy + (s.kind === 'gold' ? K.LIFT_FULL : K.LIFT[s.tier]) + K.FRUIT_DY;
    const ripe = s.kind === 'gold' ? 'gold' : RIPE[s.tier];
    const xs = s.kind === 'double' ? [hx - 24, hx + 24] : [hx];
    for (let i = 0; i < xs.length; i++) {
      mangoes.push({ id: id++, x: xs[i], hgt, tier: s.tier, ripe, slotT: s.t, coach: s.coach || null, pair: xs.length > 1 ? i : -1,
        v: Math.floor(hash(id * 3.7 + seed) * 3), seed: (seed % 997) + id * 13.1, state: 'hang', swing: 0, swingT: 0, judged: false });
    }
  }

  const trunks = [];
  let tx = -420 + r() * 200;
  const end = xAt(dur + 2) + 2400;
  while (tx < end) { trunks.push({ x: tx, v: Math.floor(r() * 3) }); tx += 720 + r() * 420; }
  return { mangoes, trunks, xAt };
}

function create(opts) { return new Game(opts || {}); }
class Game {
  constructor(o) {
    this.seed = o.seed == null ? 20261114 : o.seed;
    this.dur = o.duration || 25; this.target = o.target || 12;
    this.t0 = o.now || 0; this.lastT = this.t0;
    this.at = 0; this.rt = 0; this.ts = 1;
    if (!REACH || !REACH.measured) REACH = measureReach();
    this.reach = REACH;
    const c = buildCourse(this.seed, this.dur, this.reach);
    this.mangoes = c.mangoes; this.trunks = c.trunks; this.xAt = c.xAt;
    this.dist = 0; this.v = 0; this.phase = 0;
    this.h = 0; this.vy = 0; this.air = false; this.jumpTier = -1; this.apexT = 0; this.takeoffT = -9; this.landT = -9;
    this.holding = false; this.holdT0 = 0; this.c = 0; this.buffer = null; this.crouch = 0;
    this.pose = null; this.poseT0 = 0;
    this.bag = 0; this.bagShown = 0; this.caught = { verde: 0, erizo: 0, mangonada: 0, gold: 0 };
    this.score = 0; this.streak = 0; this.bestStreak = 0; this.perfects = 0; this.misses = 0; this.catches = 0;
    this.hero = null; this.heroCount = 0; this.goldHeroes = 0; this.lastHero = -99; this.hitStop = 0;
    this.fx = []; this.texts = []; this.flyers = []; this.held = [];
    this.events = [];
    this.endReason = null; this.endRt = 0; this.done = false; this.bonus = 0;
    this.firstPress = false; this.meterFlash = -9; this.bagBump = -9; this.shake = 0;
    this.hints = { low: 0, high: 0 };
    this.botS = { rng: rng((this.seed ^ 0x5bd1e995) >>> 0), plan: null, skill: 0.8 };
    this.cam = { fy: 0, hk: 0, z0: 1, gb: 470 };
    this.feat = features();
  }
  get charge() { return this.holding ? this.c : -1; }
  get timeScale() { return this.ts; }
  get result() {
    return { done: this.done, caught: Object.assign({}, this.caught), bag: this.bag, perfects: this.perfects, score: Math.round(this.score),
      bestStreak: this.bestStreak, misses: this.misses, endReason: this.endReason, timeLeft: Math.max(0, this.dur - this.at), bonus: this.bonus,
      heroes: this.heroCount };
  }
  actNow(t) { return this.at + clamp((t == null ? this.lastT : t) - this.lastT, 0, 0.1) * this.ts; }
  emit(type, extra) { const e = { type, t: this.lastT }; if (extra) Object.assign(e, extra); this.events.push(e); if (this.events.length > 64) this.events.shift(); }
  say(tx) {
    for (const o of this.texts) if (o.world && Math.abs(o.x - tx.x) < 110 && this.rt - o.rt < 0.7 && Math.abs(o.y - tx.y) < 50) tx.y = o.y - 56;
    this.texts.push(tx);
  }

  input(type, t) {
    if (this.endReason) return;
    const at = this.actNow(t);
    if (type === 'step') { this.stepHint = this.rt; return; }
    if (type === 'down') {
      if (this.holding) return;
      this.holding = true; this.holdT0 = at; this.c = 0; this.firstPress = true;
      this.emit('charge');
    } else if (type === 'up') {
      if (!this.holding) return;
      this.holding = false;
      const c = chargeAt(at - this.holdT0), tier = tierOf(c), full = c >= FULL;
      this.c = c; this.meterFlash = this.rt; this.releaseC = c;
      if (!this.air) this.takeoff(tier, at, full);
      else this.buffer = { tier, at, full };
    }
  }

  aimFruit(at, j) {
    const hx = this.dist + this.reach.dx, v = Math.max(60, this.v), tA = at + TAPEX[j];
    let best = null, bd = 0.45;
    for (const m of this.mangoes) {
      if (m.judged || m.x < hx) continue;
      const tp = at + (m.x - hx) / v;
      if (tp - tA > 0.6) break;
      const d = Math.abs(tp - tA);
      if (d < bd) { bd = d; best = m; }
    }
    return best;
  }
  takeoff(tier, at, full) {

    let assist = false;
    const tgt = this.aimFruit(at, full ? 3 : tier);
    if (tgt) {
      const gold = tgt.ripe === 'gold';
      if (gold ? tier === 2 && !full : Math.abs(tier - tgt.tier) === 1) { tier = tgt.tier; full = gold; assist = true; }
    }
    const j = full ? 3 : tier;
    this.jumpAssist = assist;
    this.air = true; this.vy = V0[j]; this.h = 0.01; this.jumpTier = tier; this.jumpFull = !!full; this.takeoffT = at;
    this.apexT = at + TAPEX[j]; this.buffer = null; this.crouch = 0;
    this.pose = 'catch'; this.poseT0 = at;
    this.emit('release', { tier: RIPE[tier], full: !!full, charge: this.c });
    const sx = this.dist;
    this.fx.push({ k: 'launch', x: sx, at, ripe: RIPE[tier] });
    for (let i = 0; i < 7; i++) this.fx.push({ k: 'dust', x: sx + (hash(at * 31 + i) - 0.6) * 40, y: GROUND - 2, at, vx: -60 - hash(i + at) * 120, vy: -30 - hash(i * 3 + at) * 70, s: 6 + hash(i * 7) * 8 });
  }

  bot(t) {
    if (this.endReason) return;
    const B = this.botS, at = this.actNow(t);
    const hx = this.dist + this.reach.dx;

    let tgt = null;
    for (const m of this.mangoes) {
      if (m.judged || m.x < hx + 4) continue;
      if (m.pair === 1 && B.plan && B.plan.id === m.id - 1) continue;
      tgt = m; break;
    }
    if (!tgt) { if (this.holding) this.input('up', t); return; }
    let aimX = tgt.x;
    if (tgt.pair === 0) { const m2 = this.mangoes[this.mangoes.indexOf(tgt) + 1]; if (m2) aimX = (tgt.x + m2.x) / 2; }
    if (!B.plan || B.plan.id !== tgt.id) {
      const r = B.rng(), sk = B.skill;
      let err;
      if (B.sigma) err = (B.rng() + B.rng() + B.rng() - 1.5) * 2 * B.sigma;
      else if (tgt.ripe === 'gold' || r < 0.42 * sk + 0.08) err = (B.rng() - 0.5) * 0.05;
      else if (r < 0.92) err = (B.rng() < 0.5 ? -1 : 1) * (0.07 + B.rng() * 0.09);
      else err = (B.rng() < 0.5 ? -1 : 1) * (0.2 + B.rng() * 0.12);
      let tier = tgt.tier;
      const wrong = B.wrong != null ? B.wrong : 0.07 - 0.06 * sk;
      if (tgt.ripe !== 'gold' && B.rng() < wrong) tier = clamp(tier + (B.rng() < 0.5 ? -1 : 1), 0, 2);
      B.plan = { id: tgt.id, err, tier, j: tgt.ripe === 'gold' ? 3 : tier, pressed: false, released: false };
    }
    const P = B.plan;
    const v = Math.max(60, this.v);
    const tPass = at + (aimX - hx) / v;
    const tRel = tPass - TAPEX[P.j] + P.err;
    const tPress = tRel - HOLD_MID[P.j];
    if (!P.pressed && tRel < at - 0.04) { P.pressed = P.released = true; return; }
    if (!P.pressed && at >= tPress) {
      if (this.air && this.landT0Est(at) > tRel + K.BUFFER * 0.6) { P.pressed = P.released = true; return; }
      if (!this.holding) this.input('down', t);
      P.pressed = true;
    }
    if (P.pressed && !P.released && this.holding && at >= tRel) { this.input('up', t); P.released = true; }
  }
  landT0Est(at) {
    if (!this.air) return at;
    const st = { h: this.h, vy: this.vy }; let t = at;
    while (st.h > 0 && t < at + 2) { stepJump(st, 1 / 240); t += 1 / 240; }
    return t;
  }

  update(t, dt) {
    dt = clamp(dt || 0, 0, 0.05);
    this.lastT = t; this.rt += dt;

    let ts = 1;
    if (this.hero) {
      const k = this.rt - this.hero.rt0;
      if (k < 0.06) ts = 0.03; else if (k < 0.74) ts = 0.13; else if (k < 0.96) ts = lerp(0.13, 1, sstep(0.74, 0.96, k));
      else { this.hero = null; ts = 1; }
    }
    if (this.hitStop > 0) { this.hitStop -= dt; ts = Math.min(ts, 0.05); }
    this.ts = ts;
    const adt = dt * ts;
    this.at += adt;
    const at = this.at;

    this.v = this.endReason === 'full' ? lerp(this.v, K.V0 * 0.8, 1 - Math.exp(-dt * 2)) : speedAt(at, this.dur);
    this.dist += this.v * adt;
    this.phase += Math.PI * adt / K.STEP * clamp(this.v / K.V0, 0.35, 1.2);

    if (this.holding) this.c = chargeAt(at - this.holdT0);
    const crouchTo = this.holding && !this.air ? this.c : 0;
    this.crouch = lerp(this.crouch, crouchTo, 1 - Math.exp(-adt * (crouchTo > this.crouch ? 14 : 30)));

    if (this.air) {
      const st = { h: this.h, vy: this.vy };
      stepJump(st, adt);
      this.h = st.h; this.vy = st.vy;
      if (this.h <= 0 && this.vy < 0) {
        this.h = 0; this.vy = 0; this.air = false; this.jumpTier = -1; this.landT = at; this.pose = null;
        for (let i = 0; i < 6; i++) this.fx.push({ k: 'dust', x: this.dist + (hash(at * 17 + i) - 0.5) * 50, y: GROUND - 2, at, vx: -40 - hash(i + at * 3) * 140, vy: -20 - hash(i * 5 + at) * 50, s: 5 + hash(i * 9) * 7 });
        if (this.buffer && at - this.buffer.at <= K.BUFFER) this.takeoff(this.buffer.tier, at, this.buffer.full);
        this.buffer = null;
      }
    }
    if (this.pose && at - this.apexT > 0.18) this.pose = null;

    const hx = this.dist + this.reach.dx;
    if (!this.endReason) for (const m of this.mangoes) {
      if (m.judged) continue;
      if (m.x > hx) break;
      this.judge(m, at - (hx - m.x) / Math.max(1, this.v));
    }

    for (const hd of this.held) if (!hd.thrown && at - hd.at > (this.hero && this.hero.m === hd.m ? 0.12 : 0.09)) {
      hd.thrown = true;
      this.flyers.push({ ripe: hd.m.ripe, from: hd.lastBand || null, rt0: this.rt, dur: 0.62, seed: hd.m.seed, landed: false });
    }
    this.held = this.held.filter(hd => !hd.thrown);

    this.fx = this.fx.filter(f => at - f.at < 1.4);
    this.texts = this.texts.filter(x => this.rt - x.rt < 1.3);
    for (const fl of this.flyers) if (!fl.landed && this.rt - fl.rt0 >= fl.dur) {
      fl.landed = true; this.bagShown = Math.min(this.bag, this.bagShown + 1); this.bagBump = this.rt;
    }
    this.flyers = this.flyers.filter(f => !f.landed || this.rt - f.rt0 < f.dur + 0.3);

    if (!this.endReason) {
      if (this.bag >= this.target) {
        this.endReason = 'full'; this.endRt = this.rt; this.holding = false;
        const left = Math.max(0, this.dur - at);
        this.bonus = Math.round(left * 20) + 100; this.score += this.bonus;
        this.emit('full', { timeLeft: left, bonus: this.bonus });
      } else if (at >= this.dur) {
        this.endReason = 'time'; this.endRt = this.rt; this.holding = false;
        this.emit('time');
      }
    } else if (!this.done) {
      const hold = K.END_HOLD[this.endReason] || 1.5;
      if (this.rt - this.endRt >= hold && this.bagShown >= this.bag) this.done = true;
      if (this.rt - this.endRt >= hold + 1.5) this.done = true;
    }
  }
  judge(m, tc) {
    m.judged = true;
    let verdict, perfect = false;
    const p = clamp(this.at / this.dur, 0, 1), pw = lerp(K.PERF[0], K.PERF[1], p), gw = lerp(K.GOOD[0], K.GOOD[1], p);
    if (!this.air || this.jumpTier < 0) {
      verdict = this.holding ? 'LATE' : (tc - this.landT < 0.45 && this.landT > 0) ? 'EARLY' : 'MISSED';
    } else {
      const d = tc - this.apexT;
      const gold = m.ripe === 'gold';
      if (this.jumpTier < m.tier || (gold && !this.jumpFull)) verdict = 'TOO LOW';
      else if (this.jumpTier > m.tier) verdict = 'TOO HIGH';
      else if (Math.abs(d) <= pw && !this.jumpAssist) { verdict = 'PERFECT'; perfect = true; }
      else if (Math.abs(d) <= gw) verdict = 'NICE';
      else verdict = d > 0 ? 'EARLY' : 'LATE';
    }
    const caught = verdict === 'PERFECT' || verdict === 'NICE';
    const wy = GROUND - m.hgt;
    if (!caught) {
      m.state = 'miss'; m.swing = verdict === 'TOO LOW' || verdict === 'TOO HIGH' ? 1 : 0.4; m.swingT = this.at;
      this.misses++; this.streak = 0;
      let sub = null;
      if (verdict === 'TOO LOW' && m.ripe === 'gold') sub = 'gold needs a red charge';
      else if (verdict === 'TOO LOW' && this.hints.low++ < 2) sub = 'hold longer';
      if (verdict === 'TOO HIGH' && this.hints.high++ < 2) sub = 'let go sooner';
      this.say({ s: verdict, sub, x: m.x, y: wy - 40, col: CORAL, size: 26, rt: this.rt, world: true });
      if (verdict === 'TOO LOW' || verdict === 'TOO HIGH') for (let i = 0; i < 5; i++) this.fx.push({ k: 'leaf', x: m.x - 20 + hash(m.id + i) * 40, y: wy - 70 - hash(i * 3 + m.id) * 40, at: this.at, vx: -30 + hash(i + m.id * 7) * 60, s: 0.8 + hash(i * 5) * 0.5, r0: hash(i * 11) * 6 });
      this.emit('miss', { why: verdict, ripe: m.ripe });
      return;
    }

    m.state = 'got'; m.gotAt = this.at;
    this.catches++; this.streak++; this.bestStreak = Math.max(this.bestStreak, this.streak);
    if (this.bag < this.target) { this.bag++; this.caught[m.ripe]++; }
    const mult = 1 + 0.1 * Math.min(10, this.streak - 1);
    let pts = PAL[m.ripe].pts * (perfect ? 1.5 : 1) * mult;
    if (m.pair === 1) { const m0 = this.mangoes[this.mangoes.indexOf(m) - 1]; if (m0 && m0.state === 'got') { pts += 20; this.say({ s: 'DOUBLE', x: m.x + 30, y: wy - 120, col: PAL[m.ripe].c, size: 24, rt: this.rt + 0.1, world: true }); } }
    pts = Math.round(pts); this.score += pts;
    this.held.push({ m, at: this.at, rt: this.rt, thrown: false });
    this.fx.push({ k: 'burst', x: m.x, y: wy, at: this.at, ripe: m.ripe });
    this.shake = Math.max(this.shake, perfect ? 0.6 : 0.3);
    this.emit('catch', { ripe: m.ripe, perfect, pts, bag: this.bag });
    if (m.ripe === 'gold') this.emit('gold', { pts });
    const goldGot = m.ripe === 'gold';
    if (perfect || goldGot) {
      if (perfect) { this.perfects++; this.emit('perfect', { ripe: m.ripe }); }
      const hero = goldGot || (this.heroCount - this.goldHeroes < K.HERO_MAX && this.rt - this.lastHero >= K.HERO_GAP && this.at > K.FIRST + 1);
      if (hero && !this.hero) {
        this.hero = { rt0: this.rt, m, ripe: m.ripe, pts }; this.heroCount++; this.lastHero = this.rt;
        if (m.ripe === 'gold') this.goldHeroes++;
        this.emit('hero', { ripe: m.ripe, slowmo: 0.96 });
      } else {
        this.hitStop = 0.07;
        this.say({ s: m.ripe === 'gold' ? 'GOLD!' : 'PERFECT', x: m.x, y: wy - 46, col: PAL.gold.c, size: 34, rt: this.rt, world: true, big: true, pts });
      }
    } else {
      this.say({ s: '+' + pts, x: m.x, y: wy - 40, col: CREAM, size: 26, rt: this.rt, world: true });
    }
  }

  layout(v) {
    const W = v.W, VH = v.VH, OY = v.OY;
    const portrait = W / VH < 1.15;
    const topNeed = GROUND - (this.reach.dy + K.LIFT[2] + K.FRUIT_DY) - K.UNDER - (portrait ? 170 : 140);
    const botNeed = GROUND + 76;
    const zFit = VH / (botNeed - topNeed), zLook = 0.72 * W / K.LOOK;
    const z0 = Math.min(zFit, zLook, 1.05);
    const gb = H - (botNeed - GROUND) * z0;
    return { W, VH, OY, portrait, z0, gb, Wv: W / z0, Rv: 0.28 * W / z0 };
  }

  warm(ctx) {
    if (this._warm) return; this._warm = true;
    try {
      const list = [A.shoeHi, A.sheen];
      if (A.halo) list.push(A.halo.shadow || (A.halo.shadow = shadowSprite()));
      if (A.midHi) { const T = A.tintHiBy || (A.tintHiBy = {}); for (const r of ['gold'].concat(RIPE)) list.push(T[r] || (T[r] = tint(A.midHi, PAL[r].glow))); }
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 0.01;
      for (const c of list) if (c) ctx.drawImage(c, 0, 0, 2, 2);
      ctx.restore();
    } catch (e) {   }
  }
  draw(ctx, v) {
    const L = this.layout(v);
    this.warm(ctx);
    ctx.save();
    try {
      ctx.save();
      try { this.drawWorld(ctx, v, L); } finally { ctx.restore(); }
      ctx.translate(0, -v.OY);
      if (!(this.skip && this.skip.hud)) this.drawHUD(ctx, v, L);
    } finally { ctx.restore(); }
  }
  canopyY() { return GROUND - (this.reach.dy + K.LIFT[2] + K.FRUIT_DY) - K.UNDER; }
  drawWorld(ctx, v, L) {
    const at = this.at, z0 = L.z0, cam = this.cam;
    const Sc = window.Scene, Pr = window.Props, Ru = window.Runner, X = this.skip || {};

    cam.fy = lerp(cam.fy, this.h * 0.32, 0.18);
    const hk = this.hero ? eout((this.rt - this.hero.rt0) / 0.22) * (1 - sstep(0.7, 0.95, this.rt - this.hero.rt0)) : 0;
    cam.hk = hk;
    let fx = L.Rv, fy = GROUND - cam.fy, bx = 0.28 * L.W, by = L.gb, z = z0;
    if (hk > 0 && this.heroFocus) {
      const zh = 1 + 0.45 * hk;
      z = z0 * zh;
      fx = lerp(fx, this.heroFocus.x, hk); fy = lerp(fy, this.heroFocus.y, hk);
      bx = lerp(bx, L.portrait ? 0.42 * L.W : 0.3 * L.W, hk); by = lerp(by, L.portrait ? -L.OY + L.VH * 0.62 : -L.OY + L.VH * 0.5, hk);
    }
    let sh = 0;
    if (this.shake > 0) { this.shake = Math.max(0, this.shake - 0.06); sh = this.shake; }
    ctx.translate(bx + (sh ? (hash(this.rt * 97) - 0.5) * 6 * sh : 0), by + (sh ? (hash(this.rt * 61) - 0.5) * 6 * sh : 0));
    ctx.scale(z, z);
    ctx.translate(-fx, -fy);

    const top = fy - (by + L.OY) / z, bottom = fy + (H - by) / z, left = fx - bx / z, right = fx + (L.W - bx) / z;
    const p = lerp(0.35, 0.55, clamp(at / this.dur, 0, 1)), m = sstep(0.22, 0.86, p);

    const top0 = GROUND - (L.gb + L.OY) / z0;
    const sc = { dist: this.dist, W: L.Wv + 10, OY: Math.max(80, Math.ceil(-top0 + 4)), t: at, progress: p };
    if (top < -sc.OY) { ctx.fillStyle = '#2A2650'; ctx.fillRect(left - 10, top - 4, right - left + 20, -sc.OY - top + 6); }

    ctx.fillStyle = '#2A2632'; ctx.fillRect(left - 10, H - 6, right - left + 20, Math.max(0, bottom - H + 20));
    if (X.scene) { ctx.fillStyle = '#C9A08A'; ctx.fillRect(left, top, right - left, H - top); }
    else if (Sc && Sc.drawBackground) Sc.drawBackground(ctx, sc);
    else { const g = ctx.createLinearGradient(0, top, 0, GROUND); g.addColorStop(0, '#3A3263'); g.addColorStop(0.6, '#C9787A'); g.addColorStop(1, '#F6C98C');
      ctx.fillStyle = g; ctx.fillRect(left, top, right - left, GROUND - top); ctx.fillStyle = '#D9CDB6'; ctx.fillRect(left, GROUND, right - left, 44); ctx.fillStyle = '#34303A'; ctx.fillRect(left, GROUND + 44, right - left, H - GROUND - 44); }
    const ox = L.Rv - this.dist;
    const G = A.grove, cy = this.canopyY();
    this.camTop = top; this.camLeft = left; this.camRight = right;
    const blitDN = (spr, x, y, alpha) => {
      if (!spr) return;
      const vb = spr.vb; if (alpha == null) alpha = 1;
      if (m < 0.999 && spr.day) { ctx.globalAlpha = alpha; ctx.drawImage(spr.day, x + vb[0], y + vb[1], vb[2], vb[3]); }
      if (m > 0.001 && spr.dusk) { ctx.globalAlpha = alpha * m; ctx.drawImage(spr.dusk, x + vb[0], y + vb[1], vb[2], vb[3]); }
      ctx.globalAlpha = 1;
    };

    if (!X.haze) {
      if (!A.air) {
        A.air = canvas(2, 128); const x = A.air.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 128);
        g.addColorStop(0, 'rgba(34,20,46,0.5)'); g.addColorStop(0.42, 'rgba(150,96,98,0.16)'); g.addColorStop(1, 'rgba(244,184,140,0.13)');
        x.fillStyle = g; x.fillRect(0, 0, 2, 128);
      }
      const y0 = Math.max(top, cy - 10), k0 = (y0 - (cy - 10)) / (GROUND - cy + 10) * 128;
      ctx.drawImage(A.air, 0, k0, 2, 128 - k0, left, y0, right - left, GROUND - y0);
    }

    if (!X.trunks) for (const tr of this.trunks) {
      const spr = G['trunk_' + tr.v]; if (!spr || !spr.day) continue;
      const x = tr.x + ox, vb = spr.vb;
      if (x + vb[0] + vb[2] < left || x + vb[0] > right) continue;
      const by0 = GROUND - 2, yMin = Math.max(cy - 70, top) - by0;
      const ly0 = Math.max(vb[1], yMin), lh = vb[1] + vb[3] - ly0; if (lh <= 0) continue;
      const k = spr.day.width / vb[2], sy = (ly0 - vb[1]) * k;
      if (m < 0.999) { ctx.globalAlpha = 1; ctx.drawImage(spr.day, 0, sy, spr.day.width, lh * k, x + vb[0], by0 + ly0, vb[2], lh); }
      if (m > 0.001 && spr.dusk) { ctx.globalAlpha = m; ctx.drawImage(spr.dusk, 0, sy, spr.dusk.width, lh * k, x + vb[0], by0 + ly0, vb[2], lh); }
      ctx.globalAlpha = 1;
    }

    const can = G.canopy;
    const tileX = (sprName, yOff) => {
      const spr = G[sprName]; if (!spr || !spr.day) return;
      const TW = GROVE.TW, vb = spr.vb, k = spr.day.width / vb[2];
      const yTop = Math.max(cy + vb[1], top - 2), y0 = (yTop - cy - vb[1]);
      const hh = vb[3] - y0; if (hh <= 0) return;
      let x0 = ((left - ox) % TW + TW) % TW;
      for (let x = left - x0; x < right; x += TW) {
        const a = Math.max(left, x), b = Math.min(right, x + TW); if (b <= a) continue;
        const sx = (a - x) * k, sw = (b - a) * k, sy = y0 * k, shh = hh * k;
        if (m < 0.999) { ctx.globalAlpha = 1; ctx.drawImage(spr.day, sx, sy, sw, shh, a, yTop, b - a, hh); }
        if (m > 0.001 && spr.dusk) { ctx.globalAlpha = m; ctx.drawImage(spr.dusk, sx, sy, sw, shh, a, yTop, b - a, hh); }
      }
      ctx.globalAlpha = 1;
    };
    if (X.canopy) {} else if (can) tileX('canopy');
    else { ctx.fillStyle = '#163222'; ctx.fillRect(left, top, right - left, cy - top + 10); }

    const vis = [];
    for (const mg of this.mangoes) {
      const x = mg.x + ox; if (x < left - 200 || x > right + 200) continue;
      vis.push(mg);
      if (!X.boughs && mg.ripe !== 'gold') blitDN(G['bough_' + RIPE[mg.tier] + '_' + mg.v], x, GROUND - mg.hgt);
    }
    if (G.fringe && !X.fringe) tileX('fringe');

    const target = this.nextTarget();
    if (!X.fruit) for (const mg of vis) {
      const x = mg.x + ox, y = GROUND - mg.hgt;
      if (mg.state === 'got') { this.drawTwig(ctx, mg, x, y); continue; }
      let ang = 0;
      if (mg.swing > 0) { const k = at - mg.swingT; ang = mg.swing * 0.32 * Math.exp(-k * 2.2) * Math.sin(k * 11); }

      if (A.halo[mg.ripe]) {
        const R = (mg.ripe === 'gold' ? 64 : 50) * (1 + 0.06 * Math.sin(at * 2.4 + mg.id));
        ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = mg.ripe === 'gold' ? 0.75 : 0.5;
        ctx.drawImage(A.halo[mg.ripe], x - R, y + 4 - R, R * 2, R * 2);
        ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      }
      if (ang) { const py = y - 37 * K.MS; ctx.save(); ctx.translate(x, py); ctx.rotate(ang); ctx.translate(-x, -py); }
      this.drawMango(ctx, x, y, mg.ripe, { t: at, hanging: true, scale: K.MS, seed: mg.seed });
      if (ang) ctx.restore();
    }
    if (target && !this.endReason && hk < 0.05) this.drawTarget(ctx, target, target.x + ox, GROUND - target.hgt, at, L);

    for (const f of this.fx) {
      if (f.k === 'launch') {
        const k = (at - f.at) / 0.45; if (k > 1) continue;
        const x = f.x + ox, col = PAL[f.ripe].glow;
        ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = (1 - k) * 0.85; ctx.strokeStyle = col; ctx.lineWidth = 4 * (1 - k) + 1;
        ctx.beginPath(); ctx.ellipse(x + 10, GROUND + 2, 30 + 90 * eout(k), 6 + 14 * eout(k), 0, 0, TAU); ctx.stroke();
        ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      }
    }

    if (!X.runner) this.drawRunner(ctx, L, at);

    for (const hd of this.held) {
      if (hd.thrown) continue;
      const hp = this.anch && this.anch.hand;
      if (!hp) continue;
      this.drawMango(ctx, hp.x + 4, hp.y - 14, hd.m.ripe, { t: at, scale: K.MS * 1.05, seed: hd.m.seed });

      const tm = ctx.getTransform(), px = hp.x + 4, py = hp.y - 14, S = v.S || 1;
      hd.lastBand = { x: (tm.a * px + tm.c * py + tm.e) / S, y: (tm.b * px + tm.d * py + tm.f) / S };
    }

    if (!X.fx) for (const f of this.fx) {
      const k = at - f.at;
      if (f.k === 'burst') {
        const q = k / 0.45; if (q > 1) continue;
        const hp = this.anch && this.anch.hand, x = hp ? hp.x + 4 : f.x + ox, y = hp ? hp.y - 14 : GROUND - 300;
        if (Pr && Pr.drawPickup) { ctx.save(); ctx.translate(x, y); ctx.scale(1.5, 1.5); Pr.drawPickup(ctx, 0, 0, f.ripe, q); ctx.restore(); }
      } else if (f.k === 'dust') {
        const q = k / 0.6; if (q > 1) continue;
        const x = f.x + ox + f.vx * k, y = f.y + f.vy * k + 60 * k * k;
        ctx.globalAlpha = (1 - q) * 0.5; ctx.fillStyle = '#EADBC0';
        ctx.beginPath(); ctx.arc(x, y, f.s * (0.6 + q), 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
      } else if (f.k === 'leaf') {
        const q = k / 1.3; if (q > 1) continue;
        const x = f.x + ox + f.vx * k + Math.sin(k * 5 + f.r0) * 12, y = f.y + 120 * k + 40 * k * k;
        ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(k * 4 + f.r0) * 1.2); ctx.globalAlpha = 1 - q * q;
        ctx.fillStyle = '#3E7A3A'; ctx.beginPath(); ctx.ellipse(0, 0, 9 * f.s, 2.6 * f.s, 0, 0, TAU); ctx.fill(); ctx.restore();
      } else if (f.k === 'spark') {
        const q = k / f.life; if (q > 1) continue;
        const x = f.x + ox + f.vx * k, y = f.y + f.vy * k + 120 * k * k;
        ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = (1 - q) * 0.9; ctx.fillStyle = PAL[f.ripe].glow;
        ctx.beginPath(); ctx.arc(x, y, f.s * (1 - q * 0.5), 0, TAU); ctx.fill();
        ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      }
    }

    if (Sc && Sc.drawForeground && !X.fg) {
      const cfg = Sc.config, keep = cfg ? [cfg.vignette, cfg.fgTrunk] : null;
      if (cfg) { cfg.vignette = false; cfg.fgTrunk = false; }
      try { Sc.drawForeground(ctx, sc); } finally { if (cfg) { cfg.vignette = keep[0]; cfg.fgTrunk = keep[1]; } }
    }

    for (const tx of this.texts) {
      if (!tx.world) continue;
      const k = (this.rt - tx.rt) / (tx.big ? 1.1 : 0.9); if (k < 0 || k > 1) continue;
      const x = clamp(tx.x + ox, left + 84 / z, right - 84 / z), y = Math.max(tx.y - eout(k) * 40, top + 150 / z);
      const a = k < 0.75 ? 1 : 1 - (k - 0.75) / 0.25, sc2 = tx.big ? (k < 0.12 ? eback(k / 0.12) : 1) : 1;
      ctx.save(); ctx.translate(x, y); ctx.scale(sc2 / z0 * 0.9, sc2 / z0 * 0.9); ctx.globalAlpha = a;
      text(ctx, tx.s, 0, 0, tx.size, tx.col, 'center', 900, 2, true);
      if (tx.sub) text(ctx, tx.sub, 0, 22, 15, CREAM, 'center', 700, 1, true);
      if (tx.pts) text(ctx, '+' + tx.pts, 0, 30, 20, CREAM, 'center', 800, 1, true);
      ctx.restore();
    }

    this.viewToBand = (x, y) => ({ x: (x - fx) * z + bx, y: (y - fy) * z + by });
  }
  nextTarget() {
    const hx = this.dist + this.reach.dx;
    for (const m of this.mangoes) if (!m.judged && m.x > hx) return m;
    return null;
  }
  drawMango(ctx, x, y, ripe, o) {
    const Pr = window.Props;
    if (Pr && Pr.drawMango) { Pr.drawMango(ctx, x, y, ripe, o); return; }
    const s = o.scale || 1, P = PAL[ripe];
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    if (o.hanging) { ctx.strokeStyle = '#4A3A22'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-20, -35); ctx.quadraticCurveTo(0, -38, 0, -16); ctx.stroke(); }
    const g = ctx.createLinearGradient(-12, -14, 12, 16); g.addColorStop(0, P.c); g.addColorStop(1, P.ink);
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, 11, 15, -0.3, 0, TAU); ctx.fill(); ctx.restore();
  }
  drawTwig(ctx, mg, x, y) {
    const Pr = window.Props; if (!(Pr && Pr.drawMango)) return;
    ctx.save(); ctx.beginPath(); ctx.rect(x - 60, y - 120, 120, 120 - 33 * K.MS); ctx.clip();
    Pr.drawMango(ctx, x, y, mg.ripe === 'gold' ? 'mangonada' : mg.ripe, { t: this.at, hanging: true, scale: K.MS, seed: mg.seed });
    ctx.restore();
  }
  drawTarget(ctx, m, x, y, at, L) {

    const P = PAL[m.ripe], need = m.tier;
    const cur = this.holding ? tierOf(this.c) : -1;
    const match = cur === need && (m.ripe !== 'gold' || this.c >= FULL), over = cur - need >= 2;
    const pulse = 0.5 + 0.5 * Math.sin(this.rt * 7);
    const R = 46 + (match ? 5 + 3 * pulse : 0);

    let rx = R;
    if (m.pair === 0) { const m2 = this.mangoes[this.mangoes.indexOf(m) + 1]; if (m2) { const d = m2.x - m.x; x += d / 2; rx = R + d / 2; } }
    const ring = (a0, a1) => { ctx.beginPath(); ctx.ellipse(x, y + 4, rx, R, 0, a0, a1); ctx.stroke(); };
    ctx.save();

    ctx.lineWidth = match ? 9 : 7; ctx.strokeStyle = 'rgba(14,10,24,0.35)';
    ring(0, TAU);
    ctx.lineWidth = match ? 5 : 3.2;
    ctx.strokeStyle = P.c; ctx.globalAlpha = match ? 1 : this.holding ? 0.5 : 0.9;
    if (!match) {
      const a0 = this.rt * 1.2;
      for (let i = 0; i < 4; i++) ring(a0 + i * TAU / 4, a0 + i * TAU / 4 + TAU / 4 - 0.5);
    } else ring(0, TAU);
    if (match) {
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.35 + 0.25 * pulse; ctx.lineWidth = 14;
      ring(0, TAU); ctx.globalCompositeOperation = 'source-over';
    }
    ctx.globalAlpha = 1;
    const committed = this.air && this.jumpTier >= 0 && this.apexT > at - 0.05;

    const tutor = !!(m.coach && this.bag < 3);
    const relX = m.x - this.reach.dx - this.v * TAPEX[m.ripe === 'gold' ? 3 : m.tier] + (L.Rv - this.dist) + 26;
    if (!committed && relX > L.Rv - 30 && A.halo[m.ripe]) {
      const near = clamp(1 - (relX - L.Rv) / 700, 0, 1), a = (tutor ? 0.45 + 0.5 * near : 0.2 + 0.4 * near) * (0.85 + 0.15 * pulse);
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a;
      ctx.drawImage(A.halo[m.ripe], relX - 48, GROUND - 4, 96, 22);
      ctx.drawImage(A.halo.white, relX - 26, GROUND, 52, 12);
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    }

    let word = null, bg = 'rgba(14,10,24,0.72)', fg = P.c;
    if (!committed && tutor) { word = match ? 'LET GO ON THE LIGHT' : over ? 'TOO MUCH' : m.coach; if (match) { bg = P.c; fg = INK; } }
    else if (!committed && m.ripe === 'gold') word = 'GOLD · HOLD TO RED';
    if (word) {
      const s = 1 / L.z0;
      ctx.font = '900 16px ' + FONT;
      const pw = (ctx.measureText(word).width + 16 * 1.6 + 1.5 * word.length) * s;
      const px = clamp(x, (this.camLeft || -1e9) + pw / 2 + 10 * s, (this.camRight || 1e9) - pw / 2 - 10 * s);
      ctx.save(); ctx.translate(px, y - R - 30); ctx.scale(s, s);
      pill(ctx, 0, 0, word, 16, bg, fg);
      ctx.restore();
    }
    ctx.restore();
  }
  drawRunner(ctx, L, at) {
    const Ru = window.Runner, f = this.feat;
    const x = L.Rv;
    const s = { x, ground: GROUND, h: this.h, phase: this.phase, pace: 0.5, speed: this.v, beatInterval: K.STEP / clamp(this.v / K.V0, 0.35, 1.2),
      air: this.air, vy: this.vy, stumble: 0, t: at, key: 'pick' };
    if (f.crouch) s.crouch = this.crouch;
    if (f.catchPose && this.pose === 'catch') { s.pose = 'catch'; s.poseT = at - this.poseT0; }
    let an = null, squash = !f.crouch && this.crouch > 0.01;
    if (this.holding && !this.air) {
      const rp = RIPE[tierOf(this.c)], k = this.c, pu = 0.85 + 0.15 * Math.sin(this.rt * 16);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = (0.3 + 0.45 * k) * pu;
      ctx.drawImage(A.halo[rp], x - 80 - 50 * k, GROUND - 12 - 4 * k, 170 + 100 * k, 26 + 8 * k);
      ctx.restore();
    }

    const glowK = this.holding ? 0.35 + 0.65 * this.c : Math.max(0, 1 - (at - this.takeoffT) / 0.35) * 0.9;
    const ripe = this.holding ? RIPE[tierOf(this.c)] : this.jumpTier >= 0 ? RIPE[this.jumpTier] : null;
    const fullNow = this.holding && this.c >= FULL;
    if (glowK > 0.02 && ripe && this.anch && this.anch.shoes) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (const sh of this.anch.shoes) {
        if (!sh) continue;
        const c0 = Math.cos(sh.angle || 0), s0 = Math.sin(sh.angle || 0), cx = sh.x + 24 * c0 - 12 * s0, cyy = sh.y + 24 * s0 + 12 * c0;
        const R = (46 + 26 * glowK) * (fullNow ? 1 + 0.12 * Math.sin(this.rt * 22) : 1);
        ctx.globalAlpha = glowK * (sh.far ? 0.5 : 0.9);
        ctx.drawImage(A.halo[ripe], cx - R, cyy - R * 0.62, R * 2, R * 1.24);
      }
      ctx.restore();
    }
    if (f.runner) {
      if (squash) { ctx.save(); ctx.translate(x, GROUND); ctx.scale(1 + 0.04 * this.crouch, 1 - 0.07 * this.crouch); ctx.translate(-x, -GROUND); }
      an = Ru.draw(ctx, s);
      if (squash) ctx.restore();
      const last = Ru.last;
      let hand = an && an.nearHand, shoes = null;
      if (an && an.nearShoe) shoes = [Object.assign({ far: true }, an.farShoe), Object.assign({ far: false }, an.nearShoe)];
      if (!hand) hand = handFromLast(last);
      if (!shoes) shoes = shoesFromLast(last);
      if (squash) {
        const sq = p => p && ({ x: x + (p.x - x) * (1 + 0.04 * this.crouch), y: GROUND + (p.y - GROUND) * (1 - 0.07 * this.crouch), angle: p.angle, far: p.far });
        hand = sq(hand); shoes = shoes && shoes.map(sq);
      }
      this.anch = { hand, shoes };
    } else {
      this.drawStandIn(ctx, x, at);
    }
    if (glowK > 0.02 && ripe && this.anch && this.anch.shoes && A.glowRun[ripe]) {
      const g = A.glowRun[ripe], Wd = 90, Hd = 90 * 740 / 1180;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (const sh of this.anch.shoes) {
        if (!sh) continue;
        ctx.save(); ctx.translate(sh.x, sh.y); ctx.rotate(sh.angle || 0);
        ctx.globalAlpha = glowK * (sh.far ? 0.3 : 0.55) * (fullNow ? 0.75 + 0.25 * Math.sin(this.rt * 22) : 1);
        const k = Wd / g.w;
        ctx.drawImage(g.c, -0.233 * Wd - g.ox * k, -0.419 * Hd - g.oy * k, g.c.width * k, g.c.height * k);
        ctx.restore();
      }
      ctx.restore();

      if (this.holding && hash(this.rt * 53.1) < 0.3 + 0.5 * this.c) {
        const sh = this.anch.shoes[1] || this.anch.shoes[0];
        if (sh) this.fx.push({ k: 'spark', x: sh.x - L.Rv + this.dist + (hash(this.rt * 7) - 0.3) * 50, y: sh.y + 14, at, vx: -40 - hash(this.rt * 3) * 80, vy: -80 - hash(this.rt * 9) * 140 * (0.5 + this.c), s: 2 + hash(this.rt * 13) * 2.5, life: 0.5, ripe });
      }
    }

    const nearShoe = this.anch && this.anch.shoes && this.anch.shoes[1];
    if (!this.trail) this.trail = [];
    if (nearShoe && this.air && this.streak >= 3) {
      const c0 = Math.cos(nearShoe.angle || 0), s0 = Math.sin(nearShoe.angle || 0);
      this.trail.push({ x: nearShoe.x + 24 * c0 - L.Rv + this.dist, y: nearShoe.y + 20 * c0, at });
    }
    this.trail = this.trail.filter(p => at - p.at < 0.22);
    if (this.trail.length > 2 && this.jumpTier >= 0) {
      const col = PAL[this.jumpFull ? 'gold' : RIPE[this.jumpTier]].glow, ox2 = L.Rv - this.dist;
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.strokeStyle = col;
      for (let i = 1; i < this.trail.length; i++) {
        const a = this.trail[i - 1], b = this.trail[i], k = 1 - (at - b.at) / 0.22;
        ctx.globalAlpha = 0.55 * k * k; ctx.lineWidth = 3 + 13 * k;
        ctx.beginPath(); ctx.moveTo(a.x + ox2, a.y); ctx.lineTo(b.x + ox2, b.y); ctx.stroke();
      }
      ctx.restore();
    }
    if (this.hero && !this.heroFocus && this.anch && this.anch.hand) {

      const sh = this.anch.shoes && this.anch.shoes[1];
      this.heroFocus = { x: lerp(this.anch.hand.x, sh ? sh.x : this.anch.hand.x, 0.5), y: lerp(this.anch.hand.y, sh ? sh.y : GROUND, 0.5) };
    }
    if (!this.hero) this.heroFocus = null;
  }
  drawStandIn(ctx, x, at) {
    const y = GROUND - this.h;
    ctx.fillStyle = '#2A2238';
    ctx.beginPath(); ctx.arc(x + 6, y - 335, 22, 0, TAU); ctx.fill();
    ctx.fillRect(x - 22, y - 310, 44, 130);
    const ph = this.phase;
    for (const k of [0, 1]) {
      const sw = Math.sin(ph + k * Math.PI) * (this.air ? 0.2 : 0.6);
      ctx.save(); ctx.translate(x, y - 185); ctx.rotate(sw); ctx.fillRect(-9, 0, 18, 160);
      if (A.shoeLo) ctx.drawImage(A.shoeLo, -0.233 * 90, 150, 90, 90 * 740 / 1180);
      ctx.restore();
    }
    this.anch = { hand: { x: x + 60, y: y - 372 }, shoes: [{ x: x - 10, y: y - 30, angle: 0, far: true }, { x: x + 10, y: y - 30, angle: 0, far: false }] };
  }

  drawHUD(ctx, v, L) {
    const W = v.W, VH = v.VH, rt = this.rt;
    const heroK = this.hero ? eout((rt - this.hero.rt0) / 0.2) * (1 - sstep(0.72, 0.95, rt - this.hero.rt0)) : 0;
    const hudA = 1 - heroK;
    const pad = 22;
    ctx.save();

    const g = ctx.createLinearGradient(0, 0, 0, 120); g.addColorStop(0, 'rgba(10,8,20,0.42)'); g.addColorStop(1, 'rgba(10,8,20,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, 120);
    ctx.globalAlpha = hudA;

    const bump = clamp(1 - (rt - this.bagBump) / 0.3, 0, 1), bs = 1.55 * (1 + 0.18 * Math.sin(bump * Math.PI));
    const bx = pad + 34, by = pad + 36;
    this.bagPos = { x: bx, y: by };
    this.drawBag(ctx, bx, by, this.bagShown, this.target, bs);
    text(ctx, String(this.bagShown), bx + 44, by + 14, 40, CREAM, 'left', 900, 0, true);
    const nw = measure(ctx, String(this.bagShown), 40, 900);
    text(ctx, '/' + this.target, bx + 48 + nw, by + 14, 22, 'rgba(255,246,229,0.7)', 'left', 800, 0, true);
    text(ctx, 'THE PICK', bx + 46, by - 22, 11, PAL.gold.c, 'left', 800, 3, true);
    if (this.streak >= 2) text(ctx, 'STREAK ' + this.streak, bx - 34, by + 46, 12, this.streak >= 5 ? PAL.gold.c : 'rgba(255,246,229,0.85)', 'left', 800, 2, true);

    const left = Math.max(0, this.dur - this.at), secs = Math.ceil(left - 1e-6);
    const warn = left < 5 && !this.endReason;
    const tp = warn ? 1 + 0.08 * Math.max(0, Math.sin(rt * 9)) : 1;
    ctx.save(); ctx.translate(W - pad, by + 14); ctx.scale(tp, tp);
    text(ctx, '0:' + String(secs).padStart(2, '0'), 0, 0, 36, warn ? CORAL : CREAM, 'right', 900, 0, true);
    ctx.restore();
    ctx.fillStyle = 'rgba(255,246,229,0.22)'; rr(ctx, W - pad - 120, by + 26, 120, 5, 2.5); ctx.fill();
    ctx.fillStyle = warn ? CORAL : PAL.erizo.c; rr(ctx, W - pad - 120 * (left / this.dur), by + 26, 120 * (left / this.dur), 5, 2.5); ctx.fill();
    text(ctx, Math.round(this.score) + ' PTS', W - pad, by + 50, 12, 'rgba(255,246,229,0.8)', 'right', 800, 2, true);

    const mw = L.portrait ? clamp(W * 0.42, 210, 300) : clamp(W * 0.16, 165, 220);
    const mh = mw * 740 / 1180 + 44;
    const mtop = L.portrait ? by + 62 : VH - 10 - mh, mcx = L.portrait ? W / 2 : W * 0.6;
    this.drawMeter(ctx, mcx, mtop, mw, L, hudA);
    ctx.globalAlpha = 1;

    if (this.stepHint != null && rt - this.stepHint < 1.4 && !this.endReason) {
      const touch = (navigator.maxTouchPoints || 0) > 0 || 'ontouchstart' in window;
      const a = Math.min(1, (1.4 - (rt - this.stepHint)) / 0.3) * hudA;
      const hy = L.portrait ? mtop + mh + 58 : mtop - 58;
      ctx.globalAlpha = a;
      pill(ctx, mcx, hy, touch ? 'HOLD THE RIGHT SIDE TO JUMP' : 'HOLD SPACE TO JUMP', 14, 'rgba(14,10,24,0.78)', PAL.gold.c);
      ctx.globalAlpha = 1;
    }

    if (!this.firstPress && this.at < 9 && !this.endReason) {
      const a = clamp(this.at / 0.4, 0, 1) * (0.8 + 0.2 * Math.sin(rt * 4)) * hudA;
      const hy = L.portrait ? mtop + mh + 24 : mtop - 24;
      ctx.globalAlpha = a;
      pill(ctx, mcx, hy, 'HOLD TO RIPEN  ·  LET GO TO JUMP', 15, 'rgba(14,10,24,0.72)', CREAM);
      ctx.globalAlpha = 1;
    }

    for (const fl of this.flyers) {
      const k = clamp((rt - fl.rt0) / fl.dur, 0, 1); if (fl.landed) continue;
      const f0 = fl.from || { x: W * 0.32, y: VH * 0.3 };
      const e = k * k * (3 - 2 * k);
      const cx = lerp(f0.x, bx, e), cyy = lerp(f0.y, by, e) - Math.sin(e * Math.PI) * 120;
      const s = lerp(1.3, 0.7, e);
      this.drawMango(ctx, cx, cyy, fl.ripe, { t: rt, scale: s, seed: fl.seed });
    }

    if (this.hero) this.drawHero(ctx, v, L, rt - this.hero.rt0);

    if (this.endReason) this.drawEnd(ctx, v, L, rt - this.endRt);
    ctx.restore();
  }
  drawBag(ctx, x, y, fill, cap, s) {
    const Pr = window.Props;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    if (Pr && typeof Pr.drawBagIcon === 'function') Pr.drawBagIcon(ctx, 0, 0, fill, cap);
    else {

      const n = Math.min(fill, 6);
      for (let i = 0; i < n; i++) {
        const fx = -9 + (i % 3) * 9, fy = -17 - Math.floor(i / 3) * 6;
        ctx.fillStyle = ['#A6D23E', '#FFB12E', '#FF5B3B'][i % 3]; ctx.beginPath(); ctx.ellipse(fx, fy, 5.5, 6.5, -0.3, 0, TAU); ctx.fill();
      }
      const g = ctx.createLinearGradient(-14, 0, 14, 0); g.addColorStop(0, '#9C7448'); g.addColorStop(0.6, '#C99A64'); g.addColorStop(1, '#E2B884');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-14, -14); ctx.lineTo(14, -14); ctx.lineTo(16, 18); ctx.lineTo(-16, 18); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(60,36,20,0.35)'; ctx.fillRect(-14, -14, 28, 3);
      ctx.fillStyle = 'rgba(255,240,210,0.35)'; ctx.fillRect(-15, 18 - 34 * Math.min(1, fill / cap), 2, 34 * Math.min(1, fill / cap));
    }
    ctx.restore();
  }
  drawMeter(ctx, cx, top, w, L, alpha) {

    const h = w * 740 / 1180, rt = this.rt, a0 = alpha == null ? 1 : alpha;
    const c = this.holding ? this.c : 0, tier = this.holding ? tierOf(c) : -1;
    const ripe = tier >= 0 ? RIPE[tier] : null;
    const flash = clamp(1 - (rt - this.meterFlash) / 0.35, 0, 1);
    const cw = w * 1.16, ch = h + 44, x = cx - w / 2, y = top + 2;
    ctx.save();
    ctx.globalAlpha = a0;

    const live = ripe || (flash > 0 ? RIPE[tierOf(this.releaseC || 0)] : null);
    ctx.fillStyle = 'rgba(14,10,24,0.6)'; rr(ctx, cx - cw / 2, top, cw, ch, 18); ctx.fill();
    ctx.lineWidth = live ? 2 : 1; ctx.strokeStyle = live ? hexA(PAL[live].c, 0.55 + 0.45 * Math.max(c, flash)) : 'rgba(255,246,229,0.14)';
    rr(ctx, cx - cw / 2, top, cw, ch, 18); ctx.stroke();
    if (this.holding && c >= FULL) {
      const pu = 0.5 + 0.5 * Math.sin(rt * 14);
      ctx.lineWidth = 3 + 2 * pu; ctx.strokeStyle = hexA(PAL.gold.c, 0.5 + 0.4 * pu);
      rr(ctx, cx - cw / 2 - 3, top - 3, cw + 6, ch + 6, 21); ctx.stroke();
    }
    if (live) {
      const gg = ctx.createRadialGradient(cx, y + h * 0.62, 2, cx, y + h * 0.62, w * 0.62);
      gg.addColorStop(0, hexA(PAL[live].glow, 0.5 * Math.max(c, flash))); gg.addColorStop(1, hexA(PAL[live].glow, 0));
      ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = gg; ctx.fillRect(cx - cw / 2, top, cw, ch);
      ctx.globalCompositeOperation = 'source-over';
    }
    if (A.shoeLo) {
      const bob = this.holding ? Math.sin(rt * 30) * c * 0.8 : 0;
      ctx.translate(0, bob);
      ctx.drawImage(A.shoeLo, x, y, w, h);
      const MB = A.midBox;
      if (A.midLo && MB) {
        const kx = w / MB.W;
        const fillPx = MB.x1 - c * (MB.x1 - MB.x0);
        if (this.holding) {
          if (fillPx > 1) ctx.drawImage(A.veilLo, 0, 0, fillPx, MB.H, x, y, fillPx * kx, h);
          ctx.globalCompositeOperation = 'lighter';
          const full = c >= 0.999;
          ctx.globalAlpha = a0 * (0.42 + 0.2 * Math.sin(rt * (full ? 24 : 9))) * (full ? 1.25 : 1);
          const sx = Math.max(0, fillPx);
          ctx.drawImage(A.tintLo[ripe], sx, 0, MB.W - sx, MB.H, x + sx * kx, y, (MB.W - sx) * kx, h);

          ctx.globalAlpha = a0 * (full ? 0.35 : 0.6);
          const fxp = x + fillPx * kx, fyp = y + (MB.y0 + MB.y1) / 2 * kx, rr2 = h * 0.24;
          ctx.drawImage(A.halo.white, fxp - rr2, fyp - rr2, rr2 * 2, rr2 * 2);
          ctx.drawImage(A.halo[ripe], fxp - rr2 * 1.4, fyp - rr2 * 1.4, rr2 * 2.8, rr2 * 2.8);
          ctx.globalAlpha = a0; ctx.globalCompositeOperation = 'source-over';
        } else if (flash > 0) {
          ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a0 * flash * 0.8;
          ctx.drawImage(A.tintLo[RIPE[tierOf(this.releaseC || 0)]], x, y, w, h);
          ctx.globalAlpha = a0; ctx.globalCompositeOperation = 'source-over';
        }

        ctx.fillStyle = 'rgba(255,246,229,0.7)';
        for (const q of [1 / 3, 2 / 3]) {
          const tx = x + (MB.x1 - q * (MB.x1 - MB.x0)) * kx;
          ctx.fillRect(tx - 1, y + MB.y1 * kx + 1, 2, 6);
        }
      } else if (this.holding) {

        const gr = ctx.createLinearGradient(x, 0, x + w, 0);
        gr.addColorStop(0, PAL.mangonada.c); gr.addColorStop(0.5, PAL.erizo.c); gr.addColorStop(1, PAL.verde.c);
        ctx.fillStyle = 'rgba(0,0,0,0.4)'; rr(ctx, x + w * 0.05, y + h - 2, w * 0.9, 7, 3.5); ctx.fill();
        ctx.fillStyle = gr; rr(ctx, x + w * 0.95 - w * 0.9 * c, y + h - 2, w * 0.9 * c, 7, 3.5); ctx.fill();
      }
      ctx.translate(0, -bob);
    }

    const ly = top + ch - 13;
    const words = ['VERDE', 'ERIZO', 'MANGONADA'];
    const sz = 12;
    const sizes = words.map(wd => measure(ctx, wd, sz, 900, 1.2) + 4);
    const gap = 14, total = sizes.reduce((p, q) => p + q, 0) + gap * 2;
    const f = Math.min(1, (cw - 18) / total);
    ctx.save(); ctx.translate(cx, ly); ctx.scale(f, f);
    let wx = -total / 2;
    for (let i = 0; i < 3; i++) {
      const on = i === tier;
      if (on) {
        ctx.fillStyle = hexA(PAL[RIPE[i]].c, 0.22); rr(ctx, wx - 6, -sz - 4, sizes[i] + 12, sz + 9, (sz + 9) / 2); ctx.fill();
      }
      text(ctx, words[i], wx + sizes[i] / 2, 0, sz, on ? PAL[RIPE[i]].c : 'rgba(255,246,229,0.5)', 'center', 900, 1.2, false);
      wx += sizes[i] + gap;
    }
    ctx.restore();
    ctx.restore();
  }
  drawHero(ctx, v, L, k) {

    const W = v.W, VH = v.VH, ripe = this.hero.ripe, P = PAL[ripe];
    const kin = eout(k / 0.24), kout = sstep(0.7, 0.93, k), a = kin * (1 - kout);
    ctx.save();
    ctx.fillStyle = 'rgba(12,8,22,' + (0.42 * a) + ')'; ctx.fillRect(0, 0, W, VH);
    if (k < 0.18) { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,236,190,' + (0.28 * (1 - k / 0.18)) + ')'; ctx.fillRect(0, 0, W, VH); ctx.globalCompositeOperation = 'source-over'; }
    const bh = VH * 0.08 * a;
    ctx.fillStyle = '#0B0910'; ctx.fillRect(0, 0, W, bh); ctx.fillRect(0, VH - bh, W, bh);
    if (!A.shoeHi) { ctx.restore(); return; }
    const sw = L.portrait ? Math.min(W * 0.84, 520) : Math.min(W * 0.4, 520), sh = sw * 740 / 1180;
    const cx = L.portrait ? W * 0.5 : W * 0.68, cy = L.portrait ? VH * 0.3 : VH * 0.5;
    const ein = eout((k - 0.03) / 0.28);
    const dx = L.portrait ? 0 : (1 - ein) * W * 0.3 + kout * W * 0.2, sc = L.portrait ? lerp(0.7, 1, eback((k - 0.03) / 0.3)) : 1;
    ctx.globalAlpha = a;
    ctx.translate(cx + dx, cy); ctx.scale(sc, sc);

    ctx.globalCompositeOperation = 'lighter';
    const R0 = sw * 0.78;
    ctx.globalAlpha = a * 0.85; ctx.drawImage(A.halo[ripe], -R0, -R0 * 0.8, R0 * 2, R0 * 1.6);
    ctx.globalAlpha = a * 0.35; ctx.drawImage(A.halo.white, -R0 * 0.6, -R0 * 0.45, R0 * 1.2, R0 * 0.9);
    ctx.globalAlpha = a;
    ctx.save(); ctx.rotate(k * 0.2);
    const rayG = ctx.createRadialGradient(0, 0, sw * 0.1, 0, 0, sw * 0.9);
    rayG.addColorStop(0, 'rgba(255,236,190,0.16)'); rayG.addColorStop(1, 'rgba(255,236,190,0)');
    ctx.fillStyle = rayG;
    ctx.beginPath();
    for (let i = 0; i < 12; i++) {
      const an = i / 12 * TAU + hash(i) * 0.2, wd = 0.04 + hash(i * 3) * 0.04;
      ctx.moveTo(0, 0); ctx.lineTo(Math.cos(an - wd) * sw * 0.9, Math.sin(an - wd) * sw * 0.9); ctx.lineTo(Math.cos(an + wd) * sw * 0.9, Math.sin(an + wd) * sw * 0.9); ctx.closePath();
    }
    ctx.fill();
    ctx.restore();
    ctx.globalCompositeOperation = 'source-over';

    const tilt = -0.06 + Math.sin(k * 3) * 0.012;
    ctx.globalAlpha = a * 0.55; ctx.fillStyle = 'rgba(10,6,20,1)';
    ctx.drawImage(A.halo.shadow || (A.halo.shadow = shadowSprite()), -sw * 0.5, sh * 0.32, sw, sh * 0.32);
    ctx.globalAlpha = a;
    ctx.save(); ctx.rotate(tilt);
    ctx.drawImage(A.shoeHi, -sw / 2, -sh / 2, sw, sh);
    if (A.midHi) {

      const th = (A.tintHiBy || (A.tintHiBy = {}))[ripe] || (A.tintHiBy[ripe] = tint(A.midHi, P.glow));
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a * (0.26 + 0.12 * Math.sin(k * 14));
      ctx.drawImage(th, -sw / 2, -sh / 2, sw, sh);
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = a;
    }

    if (A.sheen) {
      const sx = lerp(sw * 0.75, -sw * 0.75, clamp((k - 0.1) / 0.55, 0, 1));
      ctx.globalCompositeOperation = 'lighter';
      const prof = [0.06, 0.12, 0.2, 0.26, 0.2, 0.12, 0.06];
      for (let i = 0; i < prof.length; i++) {
        const o = sx + (i - 3) * 9;
        ctx.save(); ctx.beginPath(); ctx.moveTo(o, -sh); ctx.lineTo(o + 9, -sh); ctx.lineTo(o - 51, sh); ctx.lineTo(o - 60, sh); ctx.clip();
        ctx.globalAlpha = a * prof[i]; ctx.drawImage(A.sheen, -sw / 2, -sh / 2, sw, sh);
        ctx.restore();
      }
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = a;
    }
    ctx.restore();

    const fk = eout((k - 0.05) / 0.32);
    const fx = sw * 0.3, fy = lerp(-sh * 1.05, -sh * 0.42, fk);
    if (window.Props && Props.drawPickup && k > 0.34 && k < 0.8) { ctx.save(); ctx.translate(fx - sw * 0.02, fy + sh * 0.2); ctx.scale(sw / 210, sw / 210); Props.drawPickup(ctx, 0, 0, ripe, (k - 0.34) / 0.46); ctx.restore(); }
    this.drawMango(ctx, fx, fy, ripe, { t: this.rt, scale: sw / 100, seed: this.hero.m.seed });

    const ts = Math.round(sw / 11.5);
    text(ctx, ripe === 'gold' ? 'GOLD PICK' : 'PERFECT PICK', 0, -sh * 0.62 - ts * 0.5, ts, PAL.gold.c, 'center', 900, 3, true);
    text(ctx, '+' + this.hero.pts, 0, -sh * 0.62 + ts * 0.5, Math.round(ts * 0.5), CREAM, 'center', 800, 2, true);
    text(ctx, 'ADIZERO Evo SL', 0, sh * 0.5 + Math.round(sw / 24) + 14, Math.round(sw / 26) + 4, CREAM, 'center', 800, 4, true);
    ctx.restore();
  }
  drawEnd(ctx, v, L, k) {
    const W = v.W, VH = v.VH, full = this.endReason === 'full';
    const hold = K.END_HOLD[this.endReason] || 1.5;
    const a = eout(k / 0.3) * (1 - sstep(hold - 0.35, hold, k));
    if (a <= 0.001) return;
    ctx.save(); ctx.globalAlpha = a;
    const y = L.portrait ? VH * 0.42 : VH * 0.4;
    const sc = eback(k / 0.35);
    ctx.translate(W / 2, y); ctx.scale(sc, sc);
    text(ctx, full ? 'BAG FULL' : 'TIME', 0, 0, 58, full ? PAL.gold.c : CREAM, 'center', 900, 4, true);
    const sub = full ? 'Time bonus +' + this.bonus : this.bag + ' of ' + this.target + ' in the bag';
    text(ctx, sub, 0, 34, 18, CREAM, 'center', 800, 1, true);
    ctx.restore();
  }
}

function hexA(h, a) { const n = parseInt(h.slice(1), 16); return 'rgba(' + (n >> 16) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')'; }
function rr(ctx, x, y, w, h, r) { ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h); }
function measure(ctx, s, size, weight, spacing) {
  ctx.font = (weight || 800) + ' ' + size + 'px ' + FONT;
  return ctx.measureText(s).width + (spacing || 0) * s.length;
}
function shadowSprite() {
  const c = canvas(128, 40), x = c.getContext('2d');
  x.translate(64, 20); x.scale(1, 0.3);
  const g = x.createRadialGradient(0, 0, 2, 0, 0, 64); g.addColorStop(0, 'rgba(10,6,20,0.9)'); g.addColorStop(1, 'rgba(10,6,20,0)');
  x.fillStyle = g; x.beginPath(); x.arc(0, 0, 64, 0, TAU); x.fill();
  return c;
}
function text(ctx, s, x, y, size, color, align, weight, spacing, shadow) {
  ctx.font = (weight || 800) + ' ' + size + 'px ' + FONT;
  const ls = 'letterSpacing' in ctx;
  if (ls) ctx.letterSpacing = (spacing || 0) + 'px';
  ctx.textAlign = align || 'left'; ctx.textBaseline = 'alphabetic';
  if (shadow) { ctx.fillStyle = 'rgba(12,8,24,0.55)'; ctx.fillText(s, x + 1, y + 2); }
  ctx.fillStyle = color; ctx.fillText(s, x, y);
  if (ls) ctx.letterSpacing = '0px';
}
function pill(ctx, cx, cy, s, size, bg, fg) {
  ctx.font = '900 ' + size + 'px ' + FONT;
  if ('letterSpacing' in ctx) ctx.letterSpacing = '1.5px';
  const w = ctx.measureText(s).width + size * 1.6, h = size * 1.75;
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  ctx.fillStyle = bg || 'rgba(14,10,24,0.62)'; rr(ctx, cx - w / 2, cy - h / 2, w, h, h / 2); ctx.fill();
  text(ctx, s, cx, cy + size * 0.36, size, fg || CREAM, 'center', 900, 1.5, false);
}

function memoryMB() {
  let px = 0;
  const add = c => { if (c && c.width) px += c.width * c.height; };
  for (const k of ['shoeHi', 'shoeLo', 'midLo', 'midHi', 'veilLo', 'sheen', 'air']) add(A[k]);
  for (const k in A.tintLo) add(A.tintLo[k]);
  for (const k in (A.tintHiBy || {})) add(A.tintHiBy[k]);
  for (const k in A.glowRun) add(A.glowRun[k].c);
  for (const k in A.grove) { add(A.grove[k].day); add(A.grove[k].dusk); }
  return +(px * 4 / 1048576).toFixed(1);
}
window.Pick = { ready, create, K, PAL, TAPEX, V0, AIR, chargeAt, memoryMB, get assets() { return A; }, get reach() { return REACH; }, features };
})();
