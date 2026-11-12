

(function () {
'use strict';
const TAU = Math.PI * 2;
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const mod = (a, b) => ((a % b) + b) % b;
const lay = (e, th, w) => clamp((e - th) / (w || 0.15), 0, 1);
const hsh = i => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
function prng(seed) { let a = seed | 0; return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

function bqc(type, f, q, sr, db) {
  const w = TAU * Math.min(f, sr * 0.49) / sr, cw = Math.cos(w), al = Math.sin(w) / (2 * q);
  let b0, b1, b2, a0 = 1 + al, a1 = -2 * cw, a2 = 1 - al;
  if (type === 'lp') { b1 = 1 - cw; b0 = b2 = b1 / 2; }
  else if (type === 'hp') { b1 = -(1 + cw); b0 = b2 = (1 + cw) / 2; }
  else if (type === 'bp') { b0 = al; b1 = 0; b2 = -al; }
  else { const A = Math.pow(10, (db || 0) / 40); b0 = 1 + al * A; b1 = a1; b2 = 1 - al * A; a0 = 1 + al / A; a2 = 1 - al / A; }
  return [b0 / a0, b1 / a0, b2 / a0, a1 / a0, a2 / a0];
}
function biq(x, type, f, q, sr, db) {
  const [b0, b1, b2, a1, a2] = bqc(type, f, q, sr, db); let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) { const x0 = x[i], y0 = b0 * x0 + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1; x1 = x0; y2 = y1; y1 = y0; x[i] = y0; }
  return x;
}
function lp1(x, f, sr) { const a = 1 - Math.exp(-TAU * f / sr); let y = 0; for (let i = 0; i < x.length; i++) { y += a * (x[i] - y); x[i] = y; } return x; }
function hp1(x, f, sr) { const a = 1 - Math.exp(-TAU * f / sr); let y = 0; for (let i = 0; i < x.length; i++) { y += a * (x[i] - y); x[i] -= y; } return x; }
function noise(n, seed) { const r = prng(seed), x = new Float32Array(n); for (let i = 0; i < n; i++) x[i] = r() * 2 - 1; return x; }
function addPartials(x, sr, parts) {
  for (const [f, a, tau] of parts) {
    if (!(f > 0) || f > sr * 0.45 || !a) continue;
    const w = TAU * f / sr, cw = Math.cos(w), sw = Math.sin(w), dk = Math.exp(-1 / (tau * sr));
    const lim = Math.min(x.length, Math.ceil(tau * sr * 8));
    let c = 1, s = 0, e = a;
    for (let i = 0; i < lim; i++) { x[i] += e * s; const c2 = c * cw - s * sw; s = c * sw + s * cw; c = c2; e *= dk; }
  }
  return x;
}
function blep(p, dt) { if (p < dt) { p /= dt; return p + p - p * p - 1; } if (p > 1 - dt) { p = (p - 1) / dt; return p * p + p + p + 1; } return 0; }
function metal(n, sr, fs) {
  const x = new Float32Array(n), ph = fs.map((f, i) => i * 0.137);
  for (let i = 0; i < n; i++) { let s = 0; for (let k = 0; k < fs.length; k++) { ph[k] += fs[k] / sr; s += (ph[k] % 1) < 0.5 ? 1 : -1; } x[i] = s / fs.length; }
  return x;
}
function ks(x, sr, f, o) {
  const n = x.length, c = o.bright, w = TAU * f / sr;
  const pd = Math.atan2((1 - c) * Math.sin(w), 1 - (1 - c) * Math.cos(w)) / w;
  const D = sr / f - pd, Di = Math.floor(D), fr = D - Di;
  const H = c / Math.sqrt(1 - 2 * (1 - c) * Math.cos(w) + (1 - c) * (1 - c));
  const g = Math.min(0.9999, Math.pow(10, -3 / (f * o.decay)) / H);
  const L = Math.max(2, Math.round(sr / f)), ex = noise(L, Math.round(f * 13) + (o.seed || 0));
  if (o.shape) for (let i = 0; i < L; i++) { const u = i / L, tri = u < 0.3 ? u / 0.3 : (1 - u) / 0.7; ex[i] = ex[i] * (1 - o.shape) + (tri * 2 - 1) * o.shape * 1.4; }
  lp1(ex, o.pick || 3000, sr);
  let m = 0; for (let i = 0; i < L; i++) m += ex[i]; m /= L; for (let i = 0; i < L; i++) ex[i] -= m;
  const P = Math.round((o.pos || 0.15) * L); if (P > 0) for (let i = L - 1; i >= P; i--) ex[i] -= ex[i - P];
  const y = new Float32Array(n), amp = o.amp == null ? 1 : o.amp; let s = 0;
  for (let i = 0; i < n; i++) {
    const a = i - Di, d = a >= 1 ? (1 - fr) * y[a] + fr * y[a - 1] : a === 0 ? (1 - fr) * y[0] : 0;
    s = c * d + (1 - c) * s;
    y[i] = (i < L ? ex[i] : 0) + g * s;
  }
  for (let i = 0; i < n; i++) x[i] += y[i] * amp;
  return x;
}

let C = null, SR = 48000, SRL = 24000;

const FILM = () => (window.MusicFilm && window.MusicFilm.on ? window.MusicFilm : null);
const FILM_MUSIC = { go: 1, find: 1, bagged: 1, home: 1 };
let TRANS = 0;
let STING_BASE = 1;
const BUF = new Map();
let BYTES = 0;
function mkBuf(key, sr, secs, chans, fill, peak) {
  const id = key + '@' + sr; let b = BUF.get(id); if (b) return b;
  const n = Math.max(32, Math.round(secs * sr)), ch = [];
  for (let c = 0; c < chans; c++) ch.push(new Float32Array(n));
  fill(ch, sr, n);
  if (peak) { let mx = 0; for (const d of ch) for (let i = 0; i < n; i++) { const v = Math.abs(d[i]); if (v > mx) mx = v; }
    if (mx > 0) { const g = peak / mx; for (const d of ch) for (let i = 0; i < n; i++) d[i] *= g; } }
  const f = Math.min(n, Math.round(sr * (key.startsWith('d') ? Math.min(0.03, secs * 0.05) : secs * 0.15)));
  for (const d of ch) for (let i = 0; i < f; i++) d[n - 1 - i] *= 0.5 - 0.5 * Math.cos(Math.PI * i / f);
  b = C.createBuffer(chans, n, sr);
  ch.forEach((d, c) => b.getChannelData(c).set(d));
  BUF.set(id, b); BYTES += n * chans * 4; return b;
}
function clipCurve() {
  const N = 4096, c = new Float32Array(N), k = 0.6, top = 0.85;
  for (let i = 0; i < N; i++) {
    const s = (i / (N - 1) * 2 - 1) * 2, a = Math.abs(s);
    c[i] = Math.sign(s) * (a <= k ? a : k + (top - k) * Math.tanh((a - k) / (top - k)));
  }
  return c;
}
function irBuf() {
  return mkBuf('ir', SR, 1.8, 2, (ch, sr, n) => {
    for (let c = 0; c < 2; c++) {
      const x = ch[c], r = prng(101 + c * 7); let y = 0;
      for (let i = 0; i < n; i++) { const t = i / sr, a = 0.07 + 0.5 * Math.exp(-t / 0.35);
        y += a * ((r() * 2 - 1) - y); x[i] = y * Math.exp(-t / 0.3) * Math.min(1, t / 0.006); }
      [[0.009, 0.5], [0.017, 0.38], [0.023, 0.3], [0.031, 0.26], [0.043, 0.2], [0.057, 0.15]].forEach(([tt, a], k) => {
        const i = Math.round((tt + 0.002 + (c ? 0.0021 : -0.0013) * (k % 2 ? 1 : -1)) * sr); if (i < n) x[i] += a * (k % 2 ? -0.35 : 0.35); });
    }
  });
}

const HATF = [271, 403, 466, 587, 697, 913];
function hatFill(x, sr, n, dk) {
  const m = metal(n, sr, HATF), z = noise(n, 51);
  for (let i = 0; i < n; i++) m[i] = m[i] * 0.8 + z[i] * 0.35;
  biq(m, 'hp', 7200, 0.7, sr); biq(m, 'hp', 7200, 0.7, sr); biq(m, 'pk', 10500, 1, sr, 4);
  for (let i = 0; i < n; i++) { const t = i / sr; x[i] = m[i] * Math.min(1, t / 0.0006) * Math.exp(-t / dk); }
}
function scrape(x, sr, n, o) {
  const z = noise(n, o.seed);
  for (let i = 0; i < n; i++) { const ph = (i / sr * o.rate) % 1; z[i] *= 0.25 + 0.75 * Math.pow(1 - ph, 3); }
  biq(z, 'bp', o.f, o.q, sr); biq(z, 'hp', o.hp, 0.7, sr);
  const len = n / sr;
  for (let i = 0; i < n; i++) { const t = i / sr; x[i] = z[i] * Math.min(1, t / o.rise) * clamp((len - t) / o.fall, 0, 1); }
}
function skin(x, sr, n, f, tau, slap, seed) {
  addPartials(x, sr, [[f, 1, tau], [f * 1.52, 0.3 + slap * 0.3, tau * 0.4], [f * 2.07, 0.12 + slap * 0.4, tau * 0.3], [f * 2.9, slap * 0.35, tau * 0.2]]);
  const z = noise(Math.round(sr * 0.03), seed); biq(z, 'bp', 1400 + slap * 1800, 0.8, sr);
  for (let i = 0; i < z.length; i++) x[i] += z[i] * (0.25 + slap * 0.9) * Math.exp(-i / sr / (0.003 + slap * 0.008));
  for (let i = 0; i < n; i++) x[i] = Math.tanh(1.2 * x[i]);
}
function timbal(x, sr, n, f, seed) {
  addPartials(x, sr, [[f, 0.8, 0.2], [f * 1.59, 0.35, 0.11], [f * 2.14, 0.25, 0.08], [f * 2.65, 0.18, 0.06], [f * 3.16, 0.1, 0.12], [f * 4.83, 0.06, 0.09]]);
  const z = noise(Math.round(sr * 0.012), seed); biq(z, 'bp', 4200, 1, sr);
  for (let i = 0; i < z.length; i++) x[i] += z[i] * 0.8 * Math.exp(-i / sr / 0.0025);
  for (let i = 0; i < n; i++) x[i] = Math.tanh(1.3 * x[i]);
}
function cowbell(x, sr, n, dk) {
  let p1 = 0, p2 = 0;
  for (let i = 0; i < n; i++) { const t = i / sr; p1 = (p1 + 554.4 / sr) % 1; p2 = (p2 + 830.6 / sr) % 1;
    x[i] = ((p1 < 0.5 ? 1 : -1) + (p2 < 0.5 ? 1 : -1)) * (0.6 * Math.exp(-t / 0.006) + 0.4 * Math.exp(-t / dk)); }
  biq(x, 'bp', 1650, 1.1, sr); biq(x, 'hp', 520, 0.7, sr);
}
function kickFill(x, sr, n, o) {
  let ph = 0; const z = noise(Math.round(sr * 0.02), 3); biq(z, 'bp', 3000, 0.9, sr);
  for (let i = 0; i < n; i++) {
    const t = i / sr, f = 43.65 + o.sweep * Math.exp(-t / 0.028) + 60 * Math.exp(-t / 0.0035);
    ph += TAU * f / sr;
    x[i] = Math.tanh(o.drive * Math.sin(ph) * Math.exp(-t / o.tau))
      + o.knock * Math.sin(TAU * 1396.9 * t) * Math.exp(-t / 0.0045)
      + (i < z.length ? z[i] * o.click * Math.exp(-t / 0.003) : 0);
  }
}
const DR = {
  kick: [0.42, 1, (c, sr, n) => kickFill(c[0], sr, n, { sweep: 175, drive: 2.2, tau: 0.13, knock: 0.55, click: 1.1 })],
  kickS: [0.42, 1, (c, sr, n) => { kickFill(c[0], sr, n, { sweep: 120, drive: 1.3, tau: 0.17, knock: 0.12, click: 0.15 }); lp1(c[0], 2500, sr); }],
  snare: [0.3, 1, (c, sr, n) => { const x = c[0], z = noise(n, 21); biq(z, 'hp', 1400, 0.7, sr); biq(z, 'pk', 4500, 1.2, sr, 5);
    let p1 = 0, p2 = 0;
    for (let i = 0; i < n; i++) { const t = i / sr; p1 += TAU * (174.6 + 40 * Math.exp(-t / 0.004)) / sr; p2 += TAU * 349.2 / sr;
      const tone = 0.5 * Math.sin(p1) * Math.exp(-t / 0.05) + 0.22 * Math.sin(p2) * Math.exp(-t / 0.03);
      x[i] = Math.tanh(1.6 * (tone + z[i] * (0.45 * Math.exp(-t / 0.065) + 0.5 * Math.exp(-t / 0.007)))); } }],
  clap: [0.38, 1, (c, sr, n) => { const x = c[0], z = noise(n, 31); biq(z, 'bp', 1350, 0.9, sr); biq(z, 'hp', 650, 0.7, sr);
    for (let i = 0; i < n; i++) { const t = i / sr; let e = 0;
      for (const s of [0, 0.0085, 0.017]) if (t >= s) e += Math.exp(-(t - s) / 0.0032);
      if (t >= 0.026) e += 0.85 * Math.exp(-(t - 0.026) / 0.1) * Math.min(1, (t - 0.026) / 0.001);
      x[i] = z[i] * e; } }],
  rim: [0.14, 1, (c, sr, n) => { const x = c[0], z = noise(n, 41); biq(z, 'bp', 3200, 1.5, sr);
    for (let i = 0; i < n; i++) { const t = i / sr;
      x[i] = Math.tanh(1.3 * (0.6 * Math.sin(TAU * 1661.2 * t) * Math.exp(-t / 0.011) + 0.45 * Math.sin(TAU * 523.3 * t) * Math.exp(-t / 0.02)
        + 0.7 * z[i] * Math.exp(-t / 0.004))); } }],
  hat: [0.09, 1, (c, sr, n) => hatFill(c[0], sr, n, 0.016)],
  hatO: [0.5, 1, (c, sr, n) => hatFill(c[0], sr, n, 0.14)],
  shaker: [0.12, 1, (c, sr, n) => { const x = c[0], z = noise(n, 61); biq(z, 'bp', 6200, 0.8, sr); biq(z, 'hp', 2800, 0.7, sr);
    for (let i = 0; i < n; i++) { const t = i / sr; x[i] = z[i] * (t < 0.006 ? 0.5 - 0.5 * Math.cos(Math.PI * t / 0.006) : Math.exp(-(t - 0.006) / 0.03)); } }],
  guiraL: [0.16, 1, (c, sr, n) => scrape(c[0], sr, n, { seed: 71, rate: 235, f: 5600, q: 1.3, hp: 2600, rise: 0.018, fall: 0.07 })],
  guiraS: [0.055, 1, (c, sr, n) => scrape(c[0], sr, n, { seed: 73, rate: 235, f: 5600, q: 1.3, hp: 2600, rise: 0.004, fall: 0.035 })],
  guiroL: [0.19, 1, (c, sr, n) => scrape(c[0], sr, n, { seed: 75, rate: 88, f: 2300, q: 1.8, hp: 800, rise: 0.02, fall: 0.08 })],
  guiroS: [0.07, 1, (c, sr, n) => scrape(c[0], sr, n, { seed: 77, rate: 88, f: 2300, q: 1.8, hp: 800, rise: 0.005, fall: 0.04 })],
  timbHi: [0.55, 1, (c, sr, n) => timbal(c[0], sr, n, 415.3, 81)],
  timbLo: [0.6, 1, (c, sr, n) => timbal(c[0], sr, n, 311.1, 83)],
  paila: [0.13, 1, (c, sr, n) => { const x = c[0], z = noise(n, 91); biq(z, 'bp', 3600, 2.5, sr);
    addPartials(x, sr, [[1396.9, 0.4, 0.012], [2093, 0.3, 0.01], [3136, 0.15, 0.008]]);
    for (let i = 0; i < n; i++) x[i] += z[i] * 1.2 * Math.exp(-i / sr / 0.018); }],
  bellM: [0.42, 1, (c, sr, n) => cowbell(c[0], sr, n, 0.13)],
  bellH: [0.16, 1, (c, sr, n) => cowbell(c[0], sr, n, 0.035)],
  congaO: [0.5, 1, (c, sr, n) => skin(c[0], sr, n, 207.7, 0.16, 0, 101)],
  congaL: [0.55, 1, (c, sr, n) => skin(c[0], sr, n, 155.6, 0.2, 0, 103)],
  congaS: [0.25, 1, (c, sr, n) => skin(c[0], sr, n, 261.6, 0.045, 1, 105)],
  congaT: [0.1, 1, (c, sr, n) => skin(c[0], sr, n, 311.1, 0.025, 0.3, 109)],
  congaH: [0.2, 1, (c, sr, n) => { const x = c[0]; addPartials(x, sr, [[103.8, 1, 0.045], [174.6, 0.3, 0.02]]);
    const z = noise(Math.round(sr * 0.02), 107); lp1(z, 500, sr); for (let i = 0; i < z.length; i++) x[i] += z[i] * 1.2 * Math.exp(-i / sr / 0.006); }],
  clave: [0.18, 1, (c, sr, n) => addPartials(c[0], sr, [[2489, 1, 0.045], [4186, 0.25, 0.018], [6272, 0.08, 0.008]])],
  crash: [1.9, 2, (c, sr, n) => { for (let k = 0; k < 2; k++) {
    const x = c[k], z = noise(n, 111 + k), m = metal(n, sr, [341, 457, 523, 689, 811, 1063].map(f => f * (1 + k * 0.013)));
    for (let i = 0; i < n; i++) z[i] = z[i] * 0.7 + m[i] * 0.5;
    biq(z, 'hp', 3200, 0.7, sr); biq(z, 'pk', 7000, 0.7, sr, 4);
    let y = 0;
    for (let i = 0; i < n; i++) { const t = i / sr, a = 0.12 + 0.75 * Math.exp(-t / 0.5); y += a * (z[i] - y);
      x[i] = y * Math.min(1, t / 0.0015) * (0.7 * Math.exp(-t / 0.55) + 0.3 * Math.exp(-t / 0.08)); } } }],
  swell: [1.0, 2, (c, sr, n) => { for (let k = 0; k < 2; k++) {
    const x = c[k], z = noise(n, 121 + k); let y = 0;
    for (let i = 0; i < n; i++) { const u = i / n, a = 0.02 + 0.5 * u * u; y += a * (z[i] - y); x[i] = y * Math.pow(u, 2.2); }
    hp1(x, 400, sr); } }],
  thud: [0.4, 1, (c, sr, n) => { const x = c[0], z = noise(n, 131); lp1(z, 700, sr); lp1(z, 700, sr); let ph = 0;
    for (let i = 0; i < n; i++) { const t = i / sr; ph += TAU * (62 + 90 * Math.exp(-t / 0.02)) / sr;
      x[i] = Math.tanh(1.6 * Math.sin(ph) * Math.exp(-t / 0.09)) * 0.8 + z[i] * 2.5 * Math.exp(-t / 0.03); } }],
  crinkle: [0.7, 2, (c, sr, n) => { const r = prng(141); for (let k = 0; k < 2; k++) {
    const x = c[k];
    for (let j = 0; j < 90; j++) { const t0 = Math.pow(r(), 0.8) * 0.6, i0 = Math.round(t0 * sr), a = (0.3 + r() * 0.7) * (1 - t0 / 0.7),
      L = Math.round(sr * (0.001 + r() * 0.004));
      for (let i = 0; i < L && i0 + i < n; i++) x[i0 + i] += (r() * 2 - 1) * a * Math.exp(-i / L * 3); }
    biq(x, 'bp', 3000, 0.6, sr); biq(x, 'hp', 1200, 0.7, sr); } }],
  noise: [1.0, 1, (c, sr, n) => c[0].set(noise(n, 151))],
};
function db(name) { const d = DR[name]; return mkBuf('dr:' + name, SR, d[0], d[1], d[2], name === 'noise' ? 0 : 0.9); }

const INST = {
  bass: ['lo', 1.6, (x, sr, f) => {
    let ph = 0; const g = new Float32Array(x.length);
    for (let i = 0; i < x.length; i++) { const t = i / sr; ph += TAU * f * (1 + 0.4 * Math.exp(-t / 0.011)) / sr;
      const e = Math.min(1, t / 0.004) * (0.72 * Math.exp(-t / 1.5) + 0.28 * Math.exp(-t / 0.1));
      x[i] = e * Math.tanh(2.0 * Math.sin(ph) + 0.4 * Math.sin(2 * ph + 0.4));
      g[i] = e * Math.tanh(7 * Math.sin(ph) + 1.5 * Math.sin(2 * ph)); }
    lp1(x, 1200, sr); biq(g, 'hp', 280, 0.7, sr); biq(g, 'lp', 1400, 0.7, sr);
    for (let i = 0; i < x.length; i++) x[i] += 0.8 * g[i];
  }],
  tumbao: ['lo', 1.6, (x, sr, f) => {
    addPartials(x, sr, [[f, 1, 0.8], [2 * f, 0.45, 0.32], [3 * f, 0.2, 0.17], [4 * f, 0.1, 0.1], [5 * f, 0.05, 0.06]]);
    const z = noise(Math.round(sr * 0.02), 7); lp1(z, 900, sr);
    for (let i = 0; i < z.length; i++) x[i] += z[i] * 0.25 * Math.exp(-i / sr / 0.004);
    const g = new Float32Array(x.length); let ph = 0;
    for (let i = 0; i < x.length; i++) { ph += TAU * f / sr; g[i] = Math.tanh(5 * Math.sin(ph)) * Math.exp(-i / sr / 0.25); }
    biq(g, 'hp', 300, 0.7, sr); biq(g, 'lp', 1300, 0.7, sr);
    for (let i = 0; i < x.length; i++) x[i] = Math.tanh(1.5 * x[i] * Math.min(1, i / (sr * 0.002))) + 0.7 * g[i];
  }],
  rhodes: ['lo', 2.4, (x, sr, f, m) => {
    const tau = clamp(2.6 - (m - 48) * 0.05, 0.7, 2.8), tine = f * 13 < sr * 0.4; let pc = 0;
    for (let i = 0; i < x.length; i++) { const t = i / sr; pc += TAU * f / sr;
      let s = Math.sin(pc + (1.35 * Math.exp(-t / 0.2) + 0.25) * Math.sin(pc));
      if (tine) s += 0.22 * Math.sin(13 * pc) * Math.exp(-t / 0.01);
      x[i] = Math.tanh(1.25 * s * Math.min(1, t / 0.0015) * Math.exp(-t / tau)); }
  }],
  piano: ['lo', 1.4, (x, sr, f, m) => {
    const base = clamp(1.25 - (m - 60) * 0.025, 0.3, 1.6), P = [];
    for (let k = 1; k <= 14; k++) { const fk = k * f * Math.sqrt(1 + 0.00035 * k * k); if (fk > sr * 0.43) break;
      const a = k === 1 ? 1 : 0.9 / Math.pow(k, 1.1), d = base / (1 + 0.5 * (k - 1));
      P.push([fk, a * 0.65, d * 0.5], [fk * 1.0007, a * 0.35, d * 1.6]); }
    addPartials(x, sr, P);
    const z = noise(Math.round(sr * 0.012), m); lp1(z, 2500, sr);
    for (let i = 0; i < z.length; i++) x[i] += z[i] * 0.2 * Math.exp(-i / sr / 0.003);
    for (let i = 0, a = Math.round(sr * 0.0015); i < a; i++) x[i] *= i / a;
  }],
  nylon: ['lo', 2.2, (x, sr, f, m) => {
    ks(x, sr, f, { bright: 0.5, decay: clamp(3.2 - (m - 52) * 0.06, 1.2, 3.4), pick: 2600, pos: 0.18, shape: 0.6 });
    biq(x, 'pk', 115, 1.4, sr, 4); biq(x, 'pk', 240, 2, sr, 2.5); biq(x, 'lp', 5200, 0.7, sr);
  }],
  tres: ['lo', 1.6, (x, sr, f) => {
    ks(x, sr, f, { bright: 0.8, decay: 1.6, pick: 6500, pos: 0.12 });
    ks(x, sr, f * 1.0035, { bright: 0.8, decay: 1.4, pick: 6500, pos: 0.12, seed: 3, amp: 0.8 });
    biq(x, 'pk', 420, 1.2, sr, 3); biq(x, 'hp', 120, 0.7, sr);
  }],
  brass: ['lo', 0.9, (x, sr, f) => {
    let p1 = 0, p2 = 0, i1 = 0, i2 = 0, a1 = 0, a2 = 0, a3 = 0; const k = 1.2;
    for (let i = 0; i < x.length; i++) {
      const t = i / sr, sc = 1 - 0.04 * Math.exp(-t / 0.03), d1 = f * sc * 1.0042 / sr, d2 = f * sc * 0.9958 / sr;
      p1 += d1; if (p1 >= 1) p1 -= 1; p2 += d2; if (p2 >= 1) p2 -= 1;
      const s = (2 * p1 - 1 - blep(p1, d1) + 2 * p2 - 1 - blep(p2, d2)) * 0.5;
      if ((i & 15) === 0) { const fc = Math.min(sr * 0.42, f * 1.3 + 260 + 3400 * Math.min(1, t / 0.015) * Math.exp(-t / 0.12)),
        g = Math.tan(Math.PI * fc / sr); a1 = 1 / (1 + g * (g + k)); a2 = g * a1; a3 = g * a2; }
      const v3 = s - i2, v1 = a1 * i1 + a2 * v3, v2 = i2 + a2 * i1 + a3 * v3; i1 = 2 * v1 - i1; i2 = 2 * v2 - i2;
      x[i] = v2 * Math.min(1, t / 0.008) * (0.75 + 0.25 * Math.exp(-t / 0.15));
    }
  }],
  vibe: ['lo', 1.8, (x, sr, f) => {
    addPartials(x, sr, [[f, 1, 1.5], [f * 3.98, 0.32, 0.3], [f * 9.95, 0.08, 0.07]]);
    const z = noise(Math.round(sr * 0.01), 5); lp1(z, 3500, sr);
    for (let i = 0; i < z.length; i++) x[i] += z[i] * 0.12 * Math.exp(-i / sr / 0.0015);
  }],
  glass: ['hi', 1.4, (x, sr, f) => {
    let pc = 0, pm = 0;
    for (let i = 0; i < x.length; i++) { const t = i / sr; pc += TAU * f / sr; pm += TAU * f * 3.5 / sr;
      x[i] = Math.sin(pc + (1.8 * Math.exp(-t / 0.25) + 0.08) * Math.sin(pm)) * Math.min(1, t / 0.001) * Math.exp(-t / 0.9); }
  }],
  juicy: ['hi', 0.6, (x, sr, f) => {
    ks(x, sr, f, { bright: 0.88, decay: 0.45, pick: 7000, pos: 0.22, amp: 0.8 });
    let ph = 0; const z = noise(Math.round(sr * 0.05), 9); biq(z, 'bp', 1300, 2.2, sr);
    for (let i = 0; i < x.length; i++) { const t = i / sr; ph += TAU * f * (1 + 1.1 * Math.exp(-t / 0.012)) / sr;
      x[i] += 0.7 * Math.sin(ph) * Math.exp(-t / 0.07) + (i < z.length ? z[i] * 0.5 * Math.exp(-t / 0.01) : 0); }
  }],
};
function soft(x) {
  for (let i = 0; i < x.length; i++) { const v = x[i], a = Math.abs(v); if (a > 0.6) x[i] = Math.sign(v) * (0.6 + 0.35 * Math.tanh((a - 0.6) / 0.35)); }
  return x;
}
function tnorm(x, sr) {
  const a = Math.min(x.length, Math.round(sr * 0.25)); let s = 0; for (let i = 0; i < a; i++) s += x[i] * x[i];
  const g = 0.2 / Math.max(1e-9, Math.sqrt(s / a)); for (let i = 0; i < x.length; i++) x[i] *= g;
  return soft(x);
}
function nb(inst, m) { const I = INST[inst]; return mkBuf(inst + m, I[0] === 'hi' ? SR : SRL, I[1], 1, (c, sr) => tnorm(I[2](c[0], sr, mtof(m), m) || c[0], sr)); }
function cb(inst, notes, spread) {
  spread = spread || 0;
  const bs = notes.map(m => nb(inst, m)), sr = bs[0].sampleRate, k = 1 / Math.sqrt(notes.length);
  return mkBuf(inst + '[' + notes.join(',') + ']' + spread, sr, bs[0].duration + spread * notes.length, 1, c => {
    const x = c[0];
    bs.forEach((b, j) => { const d = b.getChannelData(0), o = Math.round(spread * j * sr); for (let i = 0; i < d.length && o + i < x.length; i++) x[o + i] += d[i] * k; });
    soft(x);
  });
}

const PRE = 1.0, MAKEUP = 1.18;
let G = null, LAT = 0.006, NODES = 0, VOL = 1;
function makeComp(ctx) {
  const c = ctx.createDynamicsCompressor();
  c.threshold.value = -20; c.knee.value = 10; c.ratio.value = 3; c.attack.value = 0.005; c.release.value = 0.2;
  return c;
}
function build(ctx, dest) {
  const gain = (v, to) => { const n = ctx.createGain(); n.gain.value = v; if (to) n.connect(to); return n; };
  const g = {};
  g.vol = gain(VOL, dest);
  g.clip = ctx.createWaveShaper(); g.clip.curve = clipCurve(); g.clip.oversample = 'none'; g.clip.connect(g.vol);
  g.half = gain(0.5, g.clip);
  g.makeup = gain(MAKEUP, g.half);
  g.comp = makeComp(ctx); g.comp.connect(g.makeup);
  const eqLo = ctx.createBiquadFilter(), eqHi = ctx.createBiquadFilter();
  eqLo.type = 'lowshelf'; eqLo.frequency.value = 70; eqLo.gain.value = -2;
  eqHi.type = 'peaking'; eqHi.frequency.value = 2800; eqHi.Q.value = 0.7; eqHi.gain.value = 2;
  eqLo.connect(eqHi); eqHi.connect(g.comp);
  g.pre = gain(PRE, eqLo);
  g.sfx = gain(1, g.pre);
  g.revIn = gain(1);
  const rhp = ctx.createBiquadFilter(); rhp.type = 'highpass'; rhp.frequency.value = 220;
  g.rev = ctx.createConvolver(); g.rev.normalize = true; g.rev.buffer = irBuf();
  g.revIn.connect(rhp); rhp.connect(g.rev); g.rev.connect(gain(0.9, g.pre));
  g.dlyIn = gain(1);
  g.dL = ctx.createDelay(2); g.dR = ctx.createDelay(2); g.dL.delayTime.value = g.dR.delayTime.value = 0.36;
  const dlp = ctx.createBiquadFilter(); dlp.type = 'lowpass'; dlp.frequency.value = 2600; g.fb = gain(0.33);
  g.dlyIn.connect(g.dL); g.dL.connect(g.dR); g.dR.connect(dlp); dlp.connect(g.fb); g.fb.connect(g.dL);
  const mg = ctx.createChannelMerger(2); g.dL.connect(mg, 0, 0); g.dR.connect(mg, 0, 1);
  mg.connect(gain(0.5, g.pre)); mg.connect(gain(0.2, g.revIn));
  g.stings = gain(1, g.pre);
  const ST = g.stings, R = g.revIn, D = g.dlyIn;
  g.s = {
    drum: bus(ctx, ST, R, D, 0.8, 0, 0.1, 0), keys: bus(ctx, ST, R, D, 0.32, -0.05, 0.22, 0.06), pluck: bus(ctx, ST, R, D, 0.45, 0.06, 0.22, 0.12),
    bell: bus(ctx, ST, R, D, 0.24, 0.12, 0.35, 0.14), fx: bus(ctx, ST, R, D, 0.5, 0, 0.18, 0), pad: bus(ctx, ST, R, D, 0.08, 0, 0.35, 0),
    brass: bus(ctx, ST, R, D, 0.28, 0, 0.16, 0), bass: bus(ctx, ST, R, D, 0.45, 0, 0, 0),
  };
  grooveChain(ctx, g);
  return g;
}
function bus(ctx, to, rev, dly, lvl, pan, rs, ds) {
  const b = ctx.createGain(); b.gain.value = lvl; let out = b;
  if (pan && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = pan; b.connect(p); out = p; b.panner = p; }
  out.connect(to);
  if (rs) { const s = ctx.createGain(); s.gain.value = rs; out.connect(s); s.connect(rev); }
  if (ds) { const s = ctx.createGain(); s.gain.value = ds; out.connect(s); s.connect(dly); }
  return b;
}
function grooveChain(ctx, g) {
  const gain = (v, to) => { const n = ctx.createGain(); n.gain.value = v; if (to) n.connect(to); return n; };
  const ch = {};
  ch.hush = gain(1, g.pre); ch.rev = gain(1, g.revIn); ch.dly = gain(1, g.dlyIn);
  ch.hitLP = ctx.createBiquadFilter(); ch.hitLP.type = 'lowpass'; ch.hitLP.frequency.value = 18000; ch.hitLP.Q.value = 0.9; ch.hitLP.connect(ch.hush);
  const GR = ch.groove = gain(1, ch.hitLP);
  const DK = ch.duck = gain(1, GR);
  ch.b = {};
  for (const k in BUSES) { const [to, l, p, r, d] = BUSES[k], m = MIX[S.sec] || {};
    ch.b[k] = bus(ctx, to === 'g' ? GR : DK, ch.rev, ch.dly, k in m ? m[k] : l, p, r, d); }
  const kp = ch.b.keys.panner;
  if (kp) { ch.lfo = ctx.createOscillator(); ch.lfo.frequency.value = 4.2; ch.lfo.connect(gain(0.32, kp.pan)); ch.lfo.start(); }
  g.ch = ch; g.b = ch.b; g.duck = ch.duck; g.hitLP = ch.hitLP;
  return ch;
}

const BUSES = {
  kick: ['g', 0.9, 0, 0, 0], snare: ['g', 0.4, 0.04, 0.12, 0], hat: ['g', 0.17, 0.2, 0.03, 0], shaker: ['g', 0.12, -0.32, 0.05, 0],
  guira: ['g', 0.12, 0.36, 0.04, 0], perc: ['g', 0.2, -0.16, 0.1, 0], conga: ['g', 0.3, -0.12, 0.08, 0], clave: ['g', 0.15, 0.3, 0.1, 0],
  crash: ['g', 0.12, 0.001, 0.15, 0], bass: ['d', 0.5, 0, 0, 0], keys: ['d', 0.3, 0.001, 0.16, 0.05], piano: ['d', 0.3, 0.1, 0.1, 0],
  pluck: ['d', 0.42, 0.1, 0.16, 0.2], pluck2: ['d', 0.22, -0.25, 0.14, 0.1], brass: ['d', 0.22, -0.05, 0.14, 0], pad: ['d', 0.07, 0, 0.3, 0],
  bell: ['d', 0.2, 0.18, 0.28, 0.14],
};

const MIX = {
"run": {"kick": 0.473, "snare": 0.274, "hat": 0.247, "shaker": 0.128, "guira": 0.145, "perc": 0.239, "crash": 0.074, "bass": 0.381, "keys": 0.39, "brass": 0.319, "bell": 0.214},
"pick": {"bell": 0.196, "kick": 0.419, "piano": 0.364, "bass": 0.328, "conga": 0.171, "clave": 0.132, "guira": 0.123, "shaker": 0.177, "perc": 0.247, "brass": 0.33},
"home": {"kick": 0.448, "pad": 0.027, "pluck": 0.577, "pluck2": 0.419, "bass": 0.308, "snare": 0.298, "hat": 0.322, "shaker": 0.151, "keys": 0.602, "crash": 0.094},
"title": {"keys": 0.521, "kick": 0.254, "snare": 0.749, "shaker": 0.234, "bass": 0.561, "bell": 0.386, "crash": 0.12},
"cine": {"pad": 0.059, "bell": 0.684},
"count": {"kick": 0.415, "snare": 0.3, "perc": 0.232, "crash": 0.12}
};
function applyMix(sec, at, now) {
  if (DRY || !G) return;
  const m = MIX[sec] || {}, t0 = Math.max(0, T(at) - 0.03);
  for (const k in G.b) { const v = G.soloed && !G.soloed.includes(k) ? 0 : k in m ? m[k] : BUSES[k][1], p = G.b[k].gain;
    if (now) { p.cancelScheduledValues(0); p.value = v; } else p.setTargetAtTime(v, t0, 0.015); }
}

const T = at => Math.max(0, at - LAT);
let DRY = false;
const DUMMY = { playbackRate: { setValueAtTime() {}, exponentialRampToValueAtTime() {} } };
function play(b, at, bus, vel, rate, dur, rel) {
  if (DRY) return DUMMY;
  const s = C.createBufferSource(); s.buffer = b; NODES++;
  if (rate && rate !== 1) s.playbackRate.value = rate;
  const t0 = T(at); let out = s, end = 0;
  if (vel !== 1 || dur != null) {
    const g = C.createGain(); NODES++; g.gain.value = vel; s.connect(g); out = g;
    if (dur != null) { const r = rel || 0.05; g.gain.setValueAtTime(vel, t0 + dur); g.gain.linearRampToValueAtTime(0, t0 + dur + r); end = t0 + dur + r + 0.02; }
  }
  out.connect(bus); s.start(t0);
  if (end) s.stop(end);
  return s;
}

const BAKE = new Set(['hat', 'shaker', 'guiraL', 'guiraS', 'guiroL', 'guiroS', 'clave', 'congaO', 'congaL', 'congaS', 'congaT', 'congaH',
  'bellH', 'rim', 'paila']);
function dbv(name, q) {
  const src = db(name);
  return q === 10 ? src : mkBuf('dv:' + name + ':' + q, SR, src.duration, src.numberOfChannels, ch => ch.forEach((d, c) => {
    const s = src.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] = s[i] * q / 10; }));
}
function drum(name, at, bus, vel, rate) {
  vel = vel == null ? 1 : vel;
  if (vel < 0.02) return DUMMY;
  if (vel !== 1 && BAKE.has(name)) return play(dbv(name, Math.max(1, Math.round(vel * 10))), at, bus, 1, rate);
  return play(db(name), at, bus, vel, rate);
}
const note = (inst, m, at, bus, vel, dur, rel) => play(nb(inst, m + TRANS), at, bus, vel == null ? 1 : vel, 1, dur, rel);
const stab = (inst, notes, at, bus, vel, dur, rel, spread) =>
  play(cb(inst, TRANS ? notes.map(m => m + TRANS) : notes, spread), at, bus, vel == null ? 1 : vel, 1, dur, rel);
const jit = (n, k) => (hsh(n * 7.3 + k * 1.7) - 0.5) * 0.004;
function glide(src, at, dur, ratio) { const t0 = T(at); src.playbackRate.setValueAtTime(1, t0 + dur * 0.35); src.playbackRate.exponentialRampToValueAtTime(ratio, t0 + dur); }
function duck(at, depth, rec) {
  if (DRY) return;
  const p = G.duck.gain, t0 = T(at);
  p.cancelScheduledValues(t0); p.setValueAtTime(1, t0); p.linearRampToValueAtTime(1 - depth, t0 + 0.012); p.setTargetAtTime(1, t0 + 0.02, rec);
}
function muffle(at, dur, lo) {
  if (DRY) return;
  const p = G.hitLP.frequency, t0 = T(at); lo = lo || 600;
  const F = FILM(); if (F && F.muffleFloor) lo = Math.max(lo, F.muffleFloor);
  p.cancelScheduledValues(t0); p.setValueAtTime(18000, t0); p.exponentialRampToValueAtTime(lo, t0 + 0.06);
  p.setValueAtTime(lo, t0 + dur * 0.4); p.exponentialRampToValueAtTime(18000, t0 + dur);
}
function pad(notes, at, dur, o) {
  if (DRY) return;
  const t0 = T(at), att = o.att || 0.3, rel = o.rel || 0.8, lvl = o.lvl || 0.5, hold = Math.max(dur, att);
  const f = C.createBiquadFilter(), g = C.createGain(); NODES += 2;
  f.type = 'lowpass'; f.Q.value = 0.6; f.frequency.setValueAtTime(o.cut || 1200, t0);
  if (o.cut2) f.frequency.linearRampToValueAtTime(o.cut2, t0 + hold);
  g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(lvl, t0 + att);
  g.gain.setValueAtTime(lvl, t0 + hold); g.gain.setTargetAtTime(0, t0 + hold, rel / 4);
  f.connect(g); g.connect(o.bus || G.b.pad);
  const end = t0 + hold + rel * 1.6;
  notes.forEach((m, i) => [-6, 6].forEach(d => { const os = C.createOscillator(); NODES++; os.type = 'sawtooth'; os.frequency.value = mtof(m + TRANS);
    os.detune.value = d + (hsh(m * 3 + i) - 0.5) * 3; os.connect(f); os.start(t0); os.stop(end); }));
  if (o.root != null) { const os = C.createOscillator(), sg = C.createGain(); NODES += 2; os.frequency.value = mtof(o.root + TRANS);
    sg.gain.value = o.sub || 1.5; os.connect(sg); sg.connect(g); os.start(t0); os.stop(end); }
}
function tone(o) {
  if (DRY) return DUMMY;
  const t0 = T(o.at), os = C.createOscillator(), g = C.createGain(), tr = TRANS ? Math.pow(2, TRANS / 12) : 1; NODES += 2;
  os.type = o.type || 'sine'; os.frequency.setValueAtTime(o.f * tr, t0);
  if (o.f2) os.frequency.exponentialRampToValueAtTime(o.f2 * tr, t0 + (o.glide || o.dur));
  let src = os;
  if (o.lp) { const f = C.createBiquadFilter(); NODES++; f.type = 'lowpass'; f.Q.value = o.q || 0.7; f.frequency.setValueAtTime(o.lp, t0);
    if (o.lp2) f.frequency.exponentialRampToValueAtTime(o.lp2, t0 + o.dur); os.connect(f); src = f; }
  const a = o.att || 0.005, r = Math.min(o.rel || 0.08, o.dur * 0.8);
  g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(o.lvl, t0 + a);
  g.gain.setValueAtTime(o.lvl, t0 + Math.max(a, o.dur - r)); g.gain.linearRampToValueAtTime(0, t0 + o.dur);
  if (o.vib) { const l = C.createOscillator(), lg = C.createGain(); NODES += 2; l.frequency.value = o.vibRate || 6; lg.gain.value = o.vib;
    l.connect(lg); lg.connect(os.detune); l.start(t0); l.stop(t0 + o.dur + 0.05); }
  src.connect(g); g.connect(o.bus); os.start(t0); os.stop(t0 + o.dur + 0.05);
  return os;
}
function swish(o) {
  if (DRY) { db('noise'); return; }
  const t0 = T(o.at), s = C.createBufferSource(), f = C.createBiquadFilter(), g = C.createGain(); NODES += 3;
  s.buffer = db('noise'); s.loop = true;
  f.type = 'bandpass'; f.Q.value = o.q || 1.2; f.frequency.setValueAtTime(o.f, t0); f.frequency.exponentialRampToValueAtTime(o.f2, t0 + o.dur);
  g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(o.lvl, t0 + o.dur * (o.peak == null ? 0.5 : o.peak)); g.gain.linearRampToValueAtTime(0, t0 + o.dur);
  s.connect(f); f.connect(g); g.connect(o.bus); s.start(t0, hsh(o.at * 10) * 0.5); s.stop(t0 + o.dur + 0.02);
}
function melody(notes, b, at, q, inst, bus, vel, sw, tr, ring) {
  if (!notes) return;
  for (const [s, m, len] of notes) if (s >> 2 === b) {
    const k = s & 3;
    note(inst, m + (tr || 0), at + k * q + (k % 2 ? sw || 0 : 0), bus, vel, ring ? undefined : len * q * 0.95, 0.12);
  }
}

const TH1 = [[0, 72, 3], [3, 75, 3], [6, 77, 2], [8, 75, 6], [14, 72, 2]];
const TH2 = [[0, 73, 3], [3, 72, 3], [6, 70, 2], [8, 70, 8]];
const TH3 = [[0, 75, 3], [3, 79, 3], [6, 80, 2], [8, 79, 6], [14, 75, 2]];
const TH4 = [[0, 77, 3], [3, 75, 3], [6, 72, 2], [8, 70, 8]];
const KEYS = {
  run: { bass: [29, 37, 34, 36], fifth: [36, 44, 41, 43],
    keys: [[56, 60, 63, 67], [56, 60, 63, 65], [56, 60, 61, 65], [55, 58, 61, 64]],
    brass: [[65, 68, 72], [65, 68, 72], [65, 68, 73], [64, 67, 70]] },
  pick: { bass: [32, 37, 39, 37], peck: [[60, 63, 68], [61, 65, 68], [63, 67, 70], [61, 65, 68]],
    mel: [[72, 75, 72, 80, 77], [77, 80, 77, 73, 79], [79, 82, 79, 75, 77], [77, 73, 77, 80, 72]],
    brass: [[68, 72, 75], [68, 73, 77], [67, 70, 75], [68, 73, 77]] },
  home: { bass: [37, 39, 36, 29], pad: [[53, 56, 60, 63], [56, 58, 61, 65], [58, 60, 63, 67], [56, 60, 63, 67]],
    theme: [TH1, TH2, TH3, TH4] },
  title: { bass: [32, 29, 37, 39], keys: [[55, 58, 60, 63], [56, 60, 63, 67], [53, 56, 60, 63], [56, 61, 65, 72]],
    theme: [TH1, null, [[0, 73, 3], [3, 72, 3], [6, 70, 2], [8, 68, 8]], null] },
};
const RUN_BASS = [[0, 3, 0, 1], [3, 3, 0, 0.75], [6, 2, 12, 0.7], [8, 3, 0, 0.95], [11, 3, 7, 0.75], [14, 2, 12, 0.7]];
const RUN_BASS_LO = [[0, 6, 0, 1], [8, 6, 0, 0.9], [14, 2, 7, 0.6]];
const HOME_BASS = [[0, 6, 0, 1], [6, 2, 0, 0.7], [8, 5, 0, 0.9], [14, 2, 7, 0.7]];
const RUN_BELL = 'M.h.h..MM.h.h..M';
const CONGA = ['H.T.S.T.H.T.O.O.', 'H.T.S.T.H.T.O.LL'], CONGA_N = { H: 'congaH', T: 'congaT', S: 'congaS', O: 'congaO', L: 'congaL' };
const CLAVE = ['....x...x.......', 'x.....x.....x...'];
const MONT_O = [0, 3, 6, 10, 14], MONT_C = [2, 8, 12];
const ARP = [0, 2, 1, 3, 2, 1, 3, 2];
const S = { sec: '', padEnd: 0, keysEnd: 0, cineMute: 0, catchN: 0, catchT: -9, dly: 0 };
function setDelay(at, secs) {
  if (DRY || Math.abs(secs - S.dly) < 0.004) return;
  S.dly = secs; const t0 = T(at); G.dL.delayTime.setTargetAtTime(secs, t0, 0.08); G.dR.delayTime.setTargetAtTime(secs, t0, 0.08);
}
const SECT = {
  count(at, n, iv) {
    const q = iv / 4, b = mod(n, 4), B = G.b;
    drum('kick', at, B.kick, 1); duck(at, 0.3, iv * 0.2);
    drum('rim', at, B.snare, b === 0 ? 0.9 : 0.6);
    if (b === 3) { drum('timbHi', at + 2 * q, B.perc, 0.7); drum('timbLo', at + 3 * q, B.perc, 0.9); drum('swell', at, B.crash, 0.8, 1 / iv); }
  },
  title(at, n, iv, e) {
    const q = iv / 4, b = mod(n, 4), bar = Math.floor(n / 4), ph = mod(bar, 4), B = G.b, K = KEYS.title, sw = 0.16 * q;
    if (b === 0) setDelay(at, iv * 0.75);
    if (b === 0 || S.keysEnd < at - 0.05) { const d = (4 - b) * iv; stab('rhodes', K.keys[ph], at, B.keys, 0.85, d - 0.05, 0.3); S.keysEnd = at + d; }
    if (b === 1) stab('rhodes', K.keys[ph].slice(2), at + 3 * q + sw, B.keys, 0.4, 3 * q, 0.2);
    if (b === 0) drum('kickS', at, B.kick, 0.8);
    if (b === 2) drum('kickS', at + 2 * q, B.kick, 0.55);
    if (b % 2) drum('rim', at, B.snare, 0.42);
    for (let k = 0; k < 4; k++) drum('shaker', at + k * q + (k % 2 ? sw : 0) + jit(n, k), B.shaker, k % 2 ? 0.5 : k ? 0.7 : 0.85);
    if (b === 0) note('tumbao', K.bass[ph], at, B.bass, 0.8, 2.5 * iv, 0.15);
    if (b === 2) note('tumbao', K.bass[ph] + 7, at + 2 * q, B.bass, 0.55, 1.4 * iv, 0.12);
    const alt = mod(Math.floor(bar / 4), 2);
    melody(K.theme[ph], b, at, q, alt ? 'vibe' : 'rhodes', alt ? B.bell : B.keys, alt ? 0.6 : 0.75, sw, alt ? 12 : 0, alt);
    if (e > 0.6 && b === 3 && ph === 3) drum('swell', at, B.crash, 0.5, 1 / iv);
  },
  run(at, n, iv, e) {
    const q = iv / 4, b = mod(n, 4), bar = Math.floor(n / 4), ph = mod(bar, 4), B = G.b, K = KEYS.run;
    if (b === 0) setDelay(at, iv * 0.75);
    drum('kick', at, B.kick, b === 0 ? 1 : 0.88);
    duck(at, 0.5, iv * 0.16);
    const sn = b % 2 ? 2 : 3;
    drum('snare', at + sn * q, B.snare, b % 2 ? 0.8 : 0.95);
    if (e > 0.55) drum('clap', at + sn * q, B.snare, 0.5 * lay(e, 0.55));
    for (let k = 0; k < 4; k++) {
      if (k !== 2 && (e < 0.3 || (k % 2 && e < 0.6))) continue;
      drum(k === 2 && b === 3 && e > 0.8 ? 'hatO' : 'hat', at + k * q, B.hat, k === 2 ? 1 : k ? 0.45 : 0.6);
    }
    for (const [s, len, i2, v] of e < 0.35 ? RUN_BASS_LO : RUN_BASS) if (s >> 2 === b) {
      const t = at + (s & 3) * q, src = note('bass', i2 === 7 ? K.fifth[ph] : K.bass[ph] + i2, t, B.bass, v * (0.7 + 0.3 * e), len * q * 0.92, 0.04);
      if (ph === 3 && s === 14 && e > 0.4) glide(src, t, len * q, 1.5);
    }
    for (const s of e > 0.5 ? [6, 10, 14] : [6, 14]) if (s >> 2 === b)
      stab('rhodes', K.keys[ph], at + (s & 3) * q, B.keys, s === 10 ? 0.55 : 0.85, q * 1.6, 0.06);
    if (e > 0.35) for (let k = 0; k < 4; k++) drum('shaker', at + k * q + jit(n, k), B.shaker, (k === 2 ? 1 : 0.55) * lay(e, 0.35));
    if (e > 0.45) { const v = lay(e, 0.45); drum('guiraL', at + jit(n, 5), B.guira, v); drum('guiraS', at + 2 * q + jit(n, 6), B.guira, 0.8 * v); drum('guiraS', at + 3 * q + jit(n, 7), B.guira, 0.65 * v); }
    if (e > 0.65) for (let k = 0; k < 4; k++) { const c = RUN_BELL[b * 4 + k]; if (c !== '.') drum(c === 'M' ? 'bellM' : 'bellH', at + k * q, B.perc, (c === 'M' ? 0.8 : 0.55) * lay(e, 0.65)); }
    if (e > 0.6) {
      if (b % 2) drum('paila', at + 3 * q, B.perc, 0.6);
      if (ph === 3 && b === 3) for (let k = 0; k < 4; k++) drum(k < 2 ? 'timbHi' : 'timbLo', at + k * q, B.perc, 0.55 + 0.15 * k);
    }
    if (e > 0.7 && ph === 0 && b === 0) drum('crash', at, B.crash, 1);
    if (e > 0.8) {
      const v = lay(e, 0.8, 0.1);
      if ((ph === 0 || ph === 2) && b === 0) { stab('brass', K.brass[ph], at, B.brass, v, q * 1.5, 0.05); stab('brass', K.brass[ph], at + 3 * q, B.brass, 0.8 * v, q * 0.9, 0.05); }
      if (ph === 3 && b === 2) glide(stab('brass', K.brass[ph], at + 2 * q, B.brass, 0.9 * v, q * 5, 0.1), at + 2 * q, q * 5, 0.8);
    }
    if (e > 0.5 && mod(bar, 8) >= 4 && mod(bar, 8) < 6) melody(mod(bar, 8) === 4 ? TH1 : TH2, b, at, q, 'vibe', B.bell, 0.7 * lay(e, 0.5), 0, 0, true);
  },
  pick(at, n, iv, e) {
    const q = iv / 4, b = mod(n, 4), bar = Math.floor(n / 4), ph = mod(bar, 4), B = G.b, K = KEYS.pick;
    if (b === 0) setDelay(at, iv * 0.75);
    if (b === 0 || b === 2) drum('kick', at, B.kick, b ? 0.5 : 0.65);
    if (b === 2 && e > 0.5) drum('kick', at + 2 * q, B.kick, 0.35);
    for (let k = 0; k < 4; k++) if (CLAVE[bar & 1][b * 4 + k] === 'x') drum('clave', at + k * q, B.clave, 1);
    const cp = CONGA[bar & 1];
    for (let k = 0; k < 4; k++) { const c = cp[b * 4 + k]; if (c !== '.') drum(CONGA_N[c], at + k * q + jit(n, k), B.conga, c === 'T' ? 0.55 : c === 'H' ? 0.8 : 1); }
    if (e > 0.75 && hsh(n * 3.1) > 0.55) drum('congaS', at + 3 * q + jit(n, 9), B.conga, 0.6);
    if (b === 1) note('tumbao', K.bass[ph], at + 2 * q, B.bass, 0.9, 6 * q, 0.05);
    if (b === 3) note('tumbao', K.bass[mod(ph + 1, 4)], at, B.bass, 1, 6 * q, 0.06);
    if (b === 2 && e > 0.6) note('tumbao', K.bass[ph] + 7, at + 2 * q, B.bass, 0.55, 2 * q, 0.04);
    MONT_O.forEach((s, j) => { if (s >> 2 !== b || (e < 0.3 && j % 2)) return;
      const m = K.mel[ph][j]; stab('piano', [m - 12, m], at + (s & 3) * q, B.piano, j === 4 ? 0.85 : 0.95, q * 1.5, 0.05); });
    if (e > 0.3) for (const s of MONT_C) if (s >> 2 === b) stab('piano', K.peck[ph], at + (s & 3) * q, B.piano, 0.6 * lay(e, 0.3), q * 1.2, 0.05);
    if (e > 0.35) { const v = lay(e, 0.35); drum('guiroL', at + jit(n, 4), B.guira, v); drum('guiroS', at + 2 * q + jit(n, 5), B.guira, 0.75 * v); drum('guiroS', at + 3 * q + jit(n, 6), B.guira, 0.6 * v); }
    if (e > 0.2) { drum('shaker', at + jit(n, 7), B.shaker, 0.5); drum('shaker', at + 2 * q + jit(n, 8), B.shaker, 0.8); }
    if (e > 0.6) { drum(b % 2 ? 'bellH' : 'bellM', at, B.perc, 0.7 * lay(e, 0.6)); if (e > 0.8) drum('bellH', at + 2 * q, B.perc, 0.5); }
    if (e > 0.5 && ph === 3 && b === 3) for (let k = 0; k < 4; k++) drum(k % 2 ? 'timbLo' : 'timbHi', at + k * q, B.perc, 0.5 + 0.15 * k);
    if (e > 0.85 && ph === 3 && b > 0 && b < 3) stab('brass', K.brass[ph], at + 2 * q, B.brass, 0.8, q * 1.2, 0.05);
    if (e > 0.6 && mod(bar, 8) === 4) melody(TH1, b, at, q, 'vibe', B.bell, 0.7 * lay(e, 0.6), 0, 12, true);
  },
  home(at, n, iv, e) {
    const q = iv / 4, b = mod(n, 4), bar = Math.floor(n / 4), ph = mod(bar, 4), B = G.b, K = KEYS.home, sw = 0.06 * q;
    drum('kick', at, B.kick, b === 0 ? 1 : 0.9);
    duck(at, 0.4, iv * 0.2);
    if (b === 0) setDelay(at, iv * 0.75);
    if (b === 0 || S.padEnd < at - 0.05) { const d = (4 - b) * iv; pad(K.pad[ph], at, d, { lvl: 0.75 + 0.25 * e, cut: 900 + 1700 * e, att: b ? 0.15 : 0.3, rel: 0.5 }); S.padEnd = at + d; }
    if (e > 0.35 && b % 2) drum('clap', at, B.snare, 0.5 + 0.3 * lay(e, 0.35, 0.4));
    if (e > 0.55) drum('rim', at + (b % 2 ? 2 : 3) * q, B.snare, 0.45 * lay(e, 0.55));
    if (e > 0.2) drum('hat', at + 2 * q + sw, B.hat, 0.9 * lay(e, 0.2, 0.2));
    if (e > 0.65) { drum('hat', at + q + sw, B.hat, 0.4); drum('hat', at + 3 * q + sw, B.hat, 0.4); }
    if (e > 0.45) for (let k = 0; k < 4; k++) drum('shaker', at + k * q + (k % 2 ? sw : 0) + jit(n, k), B.shaker, (k === 2 ? 0.9 : 0.5) * lay(e, 0.45));
    if (e > 0.25) for (const [s, len, i2, v] of HOME_BASS) if (s >> 2 === b) note('bass', K.bass[ph] + i2, at + (s & 3) * q, B.bass, v * (0.6 + 0.4 * e), len * q * 0.9, 0.06);
    const alt = mod(Math.floor(bar / 4), 2);
    if (!alt || e > 0.6) melody(K.theme[ph], b, at, q, 'nylon', B.pluck, 0.95, sw);
    else for (const k of [0, 2]) note('nylon', K.pad[ph][ARP[(b * 4 + k) >> 1]] + 12, at + k * q + (k ? sw : 0), B.pluck, 0.5, 2 * q, 0.2);
    if (alt && e > 0.75) melody(K.theme[ph], b, at, q, 'tres', B.pluck2, 0.5 * lay(e, 0.75), sw, 12);
    if (e > 0.7 && ph === 0 && b === 0) drum('crash', at, B.crash, 0.8);
    if (e > 0.6 && (b === 1 || b === 3)) stab('rhodes', K.pad[ph], at + 2 * q + sw, B.keys, 0.45 * lay(e, 0.6), 1.5 * q, 0.08);
  },
  cine(at, n, iv, e) {
    if (at < S.cineMute) return;
    const b = mod(n, 4), bar = Math.floor(n / 4);
    if (b === 0 || S.padEnd < at - 0.05) {
      const one = mod(bar, 4) < 2, d = (4 - b) * iv;
      pad(one ? [56, 60, 63, 70] : [53, 56, 60, 65], at, d + 0.6, { lvl: 0.5 + 0.3 * e, cut: 650 + 700 * e, att: 1.4, rel: 1.8, root: one ? 44 : 37, sub: 1.2 });
      S.padEnd = at + d;
    }
    if (b === 2 && mod(bar, 2)) note('glass', [87, 84, 91, 89][mod(bar >> 1, 4)], at, G.b.bell, 0.3);
  },
};

const PENT = [68, 70, 72, 75, 77];
const RIPE_STEP = { verde: 0, erizo: 2, mangonada: 4, gold: 5 };
const HOME_BPM = 92;
function trimStings(at, len, g) {
  if (DRY) return;
  const p = G.stings.gain, t0 = T(at);
  p.cancelScheduledValues(t0); p.setValueAtTime(g * STING_BASE, t0); p.setValueAtTime(g * STING_BASE, t0 + len);
  p.linearRampToValueAtTime(STING_BASE, t0 + len + 0.05);
}
const STING = {
  go(at) {
    const B = G.s;
    drum('kick', at, B.drum, 0.85); drum('crash', at, B.drum, 0.55); drum('timbHi', at, B.drum, 0.55); drum('timbLo', at + 0.028, B.drum, 0.7);
    glide(stab('brass', [53, 60, 65, 68, 72], at, B.brass, 0.8, 0.5, 0.12), at + 0.25, 0.37, 1.06);
    note('bass', 29, at, B.bass, 0.9, 0.6, 0.1);
    return 1.6;
  },
  perfect(at) {
    const B = G.s;
    [80, 84, 87, 91, 94].forEach((m, i) => note('glass', m, at + i * 0.05, B.bell, 0.56 - i * 0.06));
    drum('swell', at, B.fx, 0.3, 0.75);
    pad([68, 72, 75, 79], at, 0.5, { lvl: 0.55, att: 0.25, rel: 0.9, cut: 2600, cut2: 4200, bus: B.pad });
    muffle(at, 1.0, 900);
    return 1.6;
  },
  catch(at, o) {
    const r = o.ripe in RIPE_STEP ? o.ripe : 'erizo';
    if (at - S.catchT > 1.8 || at < S.catchT) S.catchN = 0;
    S.catchT = at;
    const i = Math.min(10, RIPE_STEP[r] + S.catchN++), m = PENT[i % 5] + 12 * Math.floor(i / 5);
    note('juicy', m, at, G.s.pluck, 1.9);
    if (r === 'gold') STING.gold(at + 0.02);
    return 0.6;
  },
  gold(at) {
    const B = G.s;
    [80, 82, 84, 87, 89, 92, 94, 96].forEach((m, i) => note(i % 2 ? 'glass' : 'vibe', m, at + i * 0.042, B.bell, 0.45 + i * 0.05));
    note('glass', 99, at + 0.36, B.bell, 0.7);
    drum('hatO', at, B.fx, 0.35); drum('hatO', at + 0.17, B.fx, 0.25);
    return 1.5;
  },
  hit(at) {
    const B = G.s;
    drum('thud', at, B.drum, 0.7);
    drum('congaS', at + 0.004, B.drum, 0.9, 0.55);
    tone({ at: at + 0.015, dur: 0.45, type: 'sawtooth', f: 233, f2: 147, glide: 0.38, lvl: 0.35, att: 0.012, rel: 0.14, lp: 1500, lp2: 600, q: 3, vib: 35, vibRate: 7, bus: B.fx });
    muffle(at, 0.7, 550);
    return 0.8;
  },
  drop(at) {
    const B = G.s;
    tone({ at, dur: 0.24, type: 'triangle', f: 1250, f2: 290, glide: 0.22, lvl: 0.26, att: 0.004, rel: 0.05, bus: B.fx });
    drum('thud', at + 0.25, B.drum, 0.5, 1.4); drum('congaS', at + 0.25, B.drum, 0.22, 0.7); drum('thud', at + 0.39, B.drum, 0.2, 1.7);
    return 0.7;
  },
  charge(at) {
    const B = G.s;
    tone({ at, dur: 0.6, type: 'triangle', f: mtof(56), f2: mtof(80), glide: 0.58, lvl: 0.2, att: 0.05, rel: 0.08, lp: 900, lp2: 5000, vib: 20, vibRate: 9, bus: B.fx });
    swish({ at, dur: 0.6, f: 500, f2: 4000, q: 1.5, lvl: 0.25, peak: 0.85, bus: B.fx });
    return 0.7;
  },
  release(at) {
    const B = G.s;
    tone({ at, dur: 0.22, type: 'sine', f: 190, f2: 950, glide: 0.09, lvl: 0.27, att: 0.003, rel: 0.1, vib: 60, vibRate: 22, bus: B.fx });
    note('tres', 80, at + 0.01, B.pluck, 0.28);
    swish({ at, dur: 0.35, f: 700, f2: 5000, q: 1.2, lvl: 0.22, peak: 0.3, bus: B.fx });
    return 0.45;
  },
  find(at) {
    const B = G.s; S.cineMute = at + 6.4;
    trimStings(at, 6.4, 0.75);
    swish({ at, dur: 0.8, f: 2400, f2: 260, q: 1.1, lvl: 0.32, peak: 0.15, bus: B.fx });
    tone({ at, dur: 0.7, type: 'sine', f: 110, f2: 55, lvl: 0.25, att: 0.01, rel: 0.4, bus: B.fx });
    pad([56, 60, 63, 67, 70], at + 0.3, 4.6, { lvl: 0.8, att: 1.6, rel: 1.8, cut: 1300, cut2: 2600, bus: B.pad, root: 44, sub: 1.2 });
    drum('swell', at + 0.45, B.fx, 0.35);
    [44, 51, 56, 60, 63, 67, 70, 72, 75, 79].forEach((m, i) => note('nylon', m, at + 1.45 + i * 0.075, B.pluck, 0.45 + i * 0.035));
    note('glass', 87, at + 1.45, B.bell, 0.5); note('glass', 94, at + 2.3, B.bell, 0.3);
    stab('rhodes', [56, 60, 63, 67], at + 3.5, B.keys, 0.6);
    TH1.slice(0, 4).forEach(([s, m]) => note('vibe', m, at + 3.5 + s * 0.17, B.bell, 0.8));
    return 6.4;
  },
  bagged(at) {
    const B = G.s, t1 = at + 0.4, t2 = at + 1.2, t3 = at + 2.0; S.cineMute = at + 4.4;
    drum('crinkle', at, B.fx, 0.55);
    stab('rhodes', [53, 56, 60, 63], t1, B.keys, 0.8, 0.85, 0.2); note('tumbao', 37, t1, B.bass, 0.8, 0.8, 0.1);
    stab('rhodes', [56, 58, 61, 65], t2, B.keys, 0.8, 0.85, 0.2); note('tumbao', 39, t2, B.bass, 0.8, 0.8, 0.1);
    stab('rhodes', [56, 60, 63, 70, 72], t3, B.keys, 0.95); note('tumbao', 32, t3, B.bass, 0.95);
    pad([56, 60, 63, 70], t3, 1.4, { lvl: 0.7, att: 0.3, rel: 1.4, cut: 1800, bus: B.pad, root: 44, sub: 1 });
    [[t1, 73], [t1 + 0.4, 72], [t2, 70], [t2 + 0.4, 72], [t3, 68]].forEach(([t, m], i) => note('nylon', m, t, B.pluck, i === 4 ? 1 : 0.8));
    note('glass', 84, t3 + 0.04, B.bell, 0.45); note('glass', 91, t3 + 0.5, B.bell, 0.25);
    return 4.4;
  },
  home(at) {
    const B = G.s, bt = 60 / HOME_BPM, q = bt / 4, br = bt * 4, end = at + 3 * br; S.cineMute = end + 3.8;
    trimStings(at, 3 * br + 3.8, 0.75);
    const bars = [
      { ch: [53, 56, 60, 63], bass: 37, mel: TH1 },
      { ch: [56, 58, 61, 65], bass: 39, mel: [[0, 73, 3], [3, 72, 3], [6, 70, 2], [8, 70, 6], [14, 72, 2]] },
      { ch: [56, 60, 63, 67], bass: 41, mel: [[0, 77, 3], [3, 75, 3], [6, 72, 2], [8, 73, 4], [12, 72, 2], [14, 70, 2]], ch2: [53, 56, 60, 63], bass2: 39 },
    ];
    bars.forEach((x, k) => {
      const t = at + k * br, half = x.ch2 ? 2 * bt : 0;
      stab('rhodes', x.ch, t, B.keys, 0.75, half || br - 0.05, 0.25);
      pad(x.ch, t, half || br, { lvl: 0.6 + 0.15 * k, att: k ? 0.2 : 0.8, rel: 0.4, cut: 1100 + 500 * k, bus: B.pad });
      note('tumbao', x.bass, t, B.bass, 0.85, half || 2.5 * bt, 0.2);
      if (x.ch2) { stab('rhodes', x.ch2, t + half, B.keys, 0.7, 2 * bt, 0.25); pad(x.ch2, t + half, 2 * bt, { lvl: 0.8, att: 0.2, rel: 0.4, cut: 2000, bus: B.pad });
        note('tumbao', x.bass2, t + half, B.bass, 0.85, 2 * bt, 0.2); }
      for (const [s, m, len] of x.mel) note('nylon', m, t + s * q, B.pluck, 0.95, len * q * 0.95 + 0.1, 0.15);
      for (let i = 0; i < 4; i++) { drum('kickS', t + i * bt, B.drum, i % 2 ? 0.25 : 0.4); drum('shaker', t + i * bt + 2 * q, B.drum, 0.18); }
    });
    drum('swell', end - 1.0, B.fx, 0.4);
    stab('nylon', [44, 51, 56, 63, 70, 72], end, B.pluck, 1, undefined, undefined, 0.035);
    note('nylon', 68, end + 0.2, B.pluck, 0.95);
    stab('rhodes', [56, 60, 63, 70, 72], end, B.keys, 0.9);
    pad([56, 60, 63, 70, 75], end, 1.2, { lvl: 0.9, att: 0.15, rel: 2.6, cut: 2400, cut2: 1400, bus: B.pad, root: 32, sub: 1.0 });
    note('tumbao', 32, end, B.bass, 1);
    note('vibe', 84, end + 0.35, B.bell, 0.6); note('glass', 92, end + 0.55, B.bell, 0.35); note('vibe', 87, end + 0.8, B.bell, 0.35);
    drum('crash', end, B.drum, 0.35);
    return 3 * br + 3.8;
  },
};

let CH = null;
function chargeOn(t) {
  const mk = () => C.createGain(), B = G.s.fx;
  const o1 = C.createOscillator(), o2 = C.createOscillator(), o2g = mk(), f = C.createBiquadFilter(), am = mk(), lvl = mk(), out = mk(),
    nz = C.createBufferSource(), nf = C.createBiquadFilter(), ng = mk(), lfo = C.createOscillator(), lg = mk();
  NODES += 13;
  o1.type = 'triangle'; o2.type = 'sawtooth'; o2.detune.value = 702; o2g.gain.value = 0.3;
  f.type = 'lowpass'; f.Q.value = 4; nf.type = 'bandpass'; nf.Q.value = 1.4; nz.buffer = db('noise'); nz.loop = true;
  am.gain.value = 0.7; lg.gain.value = 0.3; lvl.gain.value = 0.2; ng.gain.value = 0.1;
  o1.connect(f); o2.connect(o2g); o2g.connect(f); f.connect(am); am.connect(lvl); nz.connect(nf); nf.connect(ng); ng.connect(lvl);
  lfo.connect(lg); lg.connect(am.gain); lvl.connect(out); out.connect(B);
  out.gain.setValueAtTime(0, t); out.gain.linearRampToValueAtTime(1, t + 0.04);
  const srcs = [o1, o2, nz, lfo]; srcs.forEach(s => s.start(t));
  return { o1, o2, f, nf, ng, lfo, lvl, out, srcs, t0: t, level: -1, ripe: false };
}
function chargeSet(ch, k, t) {
  const tc = 0.035, fr = mtof(56 + TRANS) * Math.pow(2, 2 * k);
  ch.o1.frequency.setTargetAtTime(fr, t, tc); ch.o2.frequency.setTargetAtTime(fr, t, tc);
  ch.f.frequency.setTargetAtTime(500 * Math.pow(14, k), t, tc);
  ch.nf.frequency.setTargetAtTime(700 * Math.pow(7, k), t, tc); ch.ng.gain.setTargetAtTime(0.08 + 0.3 * k, t, tc);
  ch.lfo.frequency.setTargetAtTime(3 + 11 * k, t, tc); ch.lvl.gain.setTargetAtTime(0.18 + 0.16 * k, t, tc);
}
function chargeOff(ch, t) {
  const t1 = Math.max(t, ch.t0 + 0.045);
  ch.out.gain.setTargetAtTime(0, t1, 0.02);
  ch.srcs.forEach(s => s.stop(t1 + 0.25));
}

function warmSteps() {
  const st = Object.keys(DR).map(k => () => db(k)), film = !!FILM();

  for (const sec of film ? ['stings'] : ['title', 'run', 'count', 'pick', 'home', 'cine', 'stings'])
    if (sec === 'stings') { for (const k of Object.keys(STING)) if (!(film && FILM_MUSIC[k])) st.push(() => STING[k](10, {}));
      st.push(() => { for (const r of Object.keys(RIPE_STEP)) for (let i = 0; i < 8; i++) STING.catch(20 + i * 0.1, { ripe: r }); }); }
    else for (const e of [0.25, 0.6, 1]) for (let n = 0; n < 32; n += 4) st.push(() => { for (let j = 0; j < 4; j++) SECT[sec](10, n + j, 0.5, e); });
  return st;
}
function dry(fn) { const keep = Object.assign({}, S); DRY = true; try { fn(); } finally { DRY = false; Object.assign(S, keep); } }
function prepare() {
  const st = warmSteps(); let i = 0;
  return new Promise(res => { (function slice() {
    const t0 = Date.now();
    while (i < st.length && Date.now() - t0 < 8) dry(st[i++]);
    if (i < st.length) setTimeout(slice, 0); else res();
  })(); });
}
function measureLatency(sr) {
  return new Promise(res => {
    try {
      const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext, oc = new OAC(1, 2048, sr), cp = makeComp(oc),
        b = oc.createBuffer(1, 2048, sr), s = oc.createBufferSource();
      b.getChannelData(0)[64] = 0.05; s.buffer = b; s.connect(cp); cp.connect(oc.destination); s.start(0);
      const done = r => { const d = r.getChannelData(0); let k = -1, m = 0; for (let i = 0; i < d.length; i++) if (Math.abs(d[i]) > m) { m = Math.abs(d[i]); k = i; }
        res(m > 0 ? Math.max(0, (k - 64) / sr) : 0.006); };
      const p = oc.startRendering(); if (p && p.then) p.then(done, () => res(0.006)); else oc.oncomplete = e => done(e.renderedBuffer);
    } catch (e) { res(0.006); }
  });
}

const M = window.Music = window.Music || {};
M.ready = Promise.resolve();
M.prepared = Promise.resolve();
M.latency = LAT;
M.info = {
  sections: ['title', 'run', 'pick', 'home', 'cine', 'count'],
  stings: { go: 1.6, perfect: 1.6, catch: 0.6, gold: 1.5, hit: 0.8, drop: 0.7, find: 6.4, bagged: 4.4, home: 3 * 4 * 60 / HOME_BPM + 3.8, charge: 0.7, release: 0.45 },
  cues: { find: { reveal: 1.45, theme: 3.5 }, bagged: { resolve: 2.0 }, home: { finalChord: 3 * 4 * 60 / HOME_BPM } },
  suggestedBpm: { title: 84, run: '97 to 128 (follows iv)', pick: 112, home: 100, cine: 80 },
};
M.init = function (ctx, dest) {
  if (G && ctx === C && M._dest === (dest || ctx.destination)) return M._init;
  C = ctx; SR = ctx.sampleRate; SRL = Math.max(22050, Math.round(SR / 2)); NODES = 0; CH = null; M._dest = dest || ctx.destination;
  Object.assign(S, { sec: '', padEnd: 0, keysEnd: 0, cineMute: 0, catchN: 0, catchT: -9, dly: 0 });
  const F = FILM(); TRANS = F ? (F.transpose || 0) : 0;
  G = build(ctx, M._dest); M.sfx = G.sfx;

  STING_BASE = F ? (F.stingLevel == null ? 1 : F.stingLevel) : 1;
  G.stings.gain.value = STING_BASE;
  if (F && F.sfxLevel != null) G.sfx.gain.value = F.sfxLevel;
  if (F && F.pluckLevel != null) G.s.pluck.gain.value *= F.pluckLevel;

  const film = F && typeof F.init === 'function' ? F.init(ctx, { out: () => G.ch.groove, T }) : null;
  M.prepared = film ? Promise.all([prepare(), film]) : prepare();
  return (M._init = measureLatency(SR).then(l => { LAT = M.latency = l; return M; }));
};
M.warmAll = function () { if (G) warmSteps().forEach(dry); };

function filmFxLevel(F, section, at) {
  const lvl = section === 'pick' && F.pickStingLevel != null ? F.pickStingLevel : (F.stingLevel == null ? 1 : F.stingLevel);
  if (lvl === STING_BASE) return;
  STING_BASE = lvl;
  const p = G.stings.gain, t = Math.max(C.currentTime, T(at));
  p.cancelScheduledValues(t); p.setTargetAtTime(lvl, t, 0.12);
}
M.beat = function (at, n, iv, section, energy, perf) {
  if (!G || !SECT[section]) return;
  const F = FILM();
  if (F) { try { F.beat(+at, n | 0, +iv || 0.5, section, perf == null ? undefined : +perf); } catch (e) { console.warn('Film score', e); }
    filmFxLevel(F, section, +at); S.sec = 'film'; return; }
  if (section !== S.sec) { const first = !S.sec; S.sec = section; S.padEnd = S.keysEnd = 0; applyMix(section, +at, first); }
  SECT[section](+at, n | 0, clamp(+iv || 0.5, 0.15, 3), clamp(energy == null ? 0.5 : +energy || 0, 0, 1));
};
M.sting = function (name, at, opts) {
  if (!G || !STING[name]) return 0;
  if (at == null) at = C.currentTime + LAT + 0.01;
  const F = FILM();
  if (F && FILM_MUSIC[name]) return name === 'go' ? 0 : F.cue(name, +at);
  return STING[name](+at, opts || {});
};
M.charge = function (level, at) {
  if (!G) return;
  const t = Math.max(at == null ? C.currentTime : +at, C.currentTime);
  if (!(level >= 0)) { if (CH) { chargeOff(CH, t); CH = null; } return; }
  const k = clamp(+level, 0, 1);
  if (!CH) CH = chargeOn(t);
  if (Math.abs(k - CH.level) < 0.01) return;
  CH.level = k; chargeSet(CH, k, t);
  if (k >= 0.97 && !CH.ripe) { CH.ripe = true; note('glass', 92, t + LAT, G.s.bell, 0.45); note('vibe', 87, t + LAT + 0.06, G.s.bell, 0.3); }
  if (k < 0.85) CH.ripe = false;
};
M.setVolume = function (v) { VOL = clamp(+v || 0, 0, 1); if (G) G.vol.gain.setTargetAtTime(VOL, C.currentTime, 0.03); };
M.hush = function (at, fade) {
  if (!G) return;
  const t0 = T(at == null ? C.currentTime + LAT : at), f = fade || 0.3, old = G.ch, F = FILM();
  if (F) F.hush(at == null ? C.currentTime + LAT : +at, f);
  [old.hush.gain, old.rev.gain, old.dly.gain].forEach(p => p.setTargetAtTime(0, t0, f / 4));
  if (old.lfo) old.lfo.stop(t0 + f * 3);
  grooveChain(C, G); S.padEnd = S.keysEnd = 0;
};
M.stats = () => ({ nodes: NODES, buffers: BUF.size, mb: +(BYTES / 1048576).toFixed(2), latency: LAT, sampleRate: SR });
M._debug = {
  solo(names) { const keep = [].concat(names); G.soloed = keep; for (const k in G.b) if (!keep.includes(k)) G.b[k].gain.value = 0;
    for (const k in G.s) if (!keep.includes('s.' + k)) G.s[k].gain.value = 0; },
  raw() { G.comp.threshold.value = 0; G.comp.ratio.value = 1; G.makeup.gain.value = 1; },
  mem() { const o = {}; for (const [k, b] of BUF) { const g = k.startsWith('dr:') ? 'drums' : k.startsWith('dv:') ? 'drumVel' : k.startsWith('ir') ? 'reverb'
      : k.replace(/\[.*$/, ' chords').replace(/\d.*$/, ''); o[g] = (o[g] || 0) + b.length * b.numberOfChannels * 4 / 1048576; }
    for (const k in o) o[k] = +o[k].toFixed(2); return o; },
};
})();
