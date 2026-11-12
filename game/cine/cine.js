

(function () {
'use strict';
const GROUND = 420, H = 540, TAU = Math.PI * 2;
const C = { cream: '#FFF6E5', mango: '#F28C28', green: '#1F4D33', violet: '#2E2A4F', ink: '#15130F', bar: '#0B0812' };
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const eio = t => { t = clamp(t, 0, 1); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const eout = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
const ein = t => Math.pow(clamp(t, 0, 1), 3);
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
function hash(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
function mk(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; }
const base = () => (window.CINE_BASE != null ? window.CINE_BASE : '');
const errors = [];

function guessS() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  return Math.min((innerHeight || 620) * dpr / 620, (innerWidth || 600) * dpr / 600) || 1.5;
}
const S0 = guessS();

function loadImage(src) {
  return new Promise(res => {
    const im = new Image();
    im.onload = () => (im.decode ? im.decode().catch(() => 0) : Promise.resolve()).then(() => res(im));
    im.onerror = () => { errors.push(src); console.warn('Cine: could not load', src); res(null); };
    im.src = src;
  });
}
const LEVELS = [0.5, 0.75, 1, 1.5, 2, 3, 4, 6, 8, 12];
const MAXPX = 4096;
const ART = {};
let EPOCH = 0;
function register(name, im, box, opts) { if (im) ART[name] = { im, box, lv: {}, opts: opts || {} }; return ART[name]; }
function levelFor(px) { for (const L of LEVELS) if (L >= px * 0.9) return L; return LEVELS[LEVELS.length - 1]; }
function bake(a, L) {
  const b = a.box; let k = L;
  if (b[2] * k > MAXPX) k = MAXPX / b[2];
  if (b[3] * k > MAXPX) k = Math.min(k, MAXPX / b[3]);
  const c = mk(b[2] * k, b[3] * k), x = c.getContext('2d');
  x.drawImage(a.im, 0, 0, c.width, c.height);
  if (a.opts.post) a.opts.post(x, c.width, c.height);
  a.lv[L] = c; (a.ep || (a.ep = {}))[L] = EPOCH;

  for (const k in a.lv) if (+k !== +L && (a.ep[k] || 0) < EPOCH) {
    const old = a.lv[k]; delete a.lv[k]; delete a.ep[k];
    try { old.width = old.height = 0; } catch (e) {}
  }
  return c;
}
function scaleOf(ctx) { const m = ctx.getTransform(); return Math.sqrt(m.a * m.a + m.b * m.b); }

function art(ctx, name, x, y, s, alpha) {
  const a = ART[name]; if (!a) return false;
  s = s || 1;
  const L = Math.min(levelFor(scaleOf(ctx) * s), a.opts.maxL || 99), c = a.lv[L] || bake(a, L), b = a.box;
  if (a.ep) a.ep[L] = EPOCH;
  if (alpha != null) ctx.globalAlpha = alpha;
  ctx.drawImage(c, x + b[0] * s, y + b[1] * s, b[2] * s, b[3] * s);
  if (alpha != null) ctx.globalAlpha = 1;
  return true;
}
function prebake(name, px) { const a = ART[name]; if (a) { const L = levelFor(px); if (!a.lv[L]) bake(a, L); } }

const FONT = { title: '"CineAnton", Anton, Impact, "Arial Narrow", sans-serif',
  serif: '"CineBasteleur", Georgia, "Times New Roman", serif', serifBold: '"CineBasteleurBold", Georgia, serif',
  sans: '"CineApfel", "Helvetica Neue", Arial, sans-serif', sansBold: '"CineApfelFett", "Helvetica Neue", Arial, sans-serif' };
function loadFonts() {
  if (!window.FontFace || !document.fonts) return Promise.resolve();
  const list = [['CineAnton', 'anton'], ['CineBasteleur', 'basteleur-moon'], ['CineBasteleurBold', 'basteleur-bold'],
    ['CineApfel', 'apfel'], ['CineApfelFett', 'apfel-fett']];
  return Promise.all(list.map(([fam, f]) => {
    try {
      const ff = new FontFace(fam, 'url(' + base() + 'cine/art/fonts/' + f + '.woff2) format("woff2")');
      return ff.load().then(x => { document.fonts.add(x); }, e => { errors.push(f); });
    } catch (e) { return Promise.resolve(); }
  }));
}
function font(ctx, fam, size) { ctx.font = size.toFixed(2) + 'px ' + fam; }

const GEN = {};
function radial(size, stops) {
  const c = mk(size, size), x = c.getContext('2d'), g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  for (const [o, col] of stops) g.addColorStop(o, col);
  x.fillStyle = g; x.fillRect(0, 0, size, size); return c;
}
function makeGenerated() {
  GEN.glow = radial(256, [[0, 'rgba(255,214,150,0.9)'], [0.18, 'rgba(255,186,120,0.5)'], [0.45, 'rgba(250,150,100,0.16)'], [1, 'rgba(240,130,110,0)']]);
  GEN.soft = radial(128, [[0, 'rgba(255,255,255,1)'], [0.4, 'rgba(255,255,255,0.45)'], [1, 'rgba(255,255,255,0)']]);
  GEN.dark = radial(128, [[0, 'rgba(14,9,26,0.9)'], [0.5, 'rgba(14,9,26,0.45)'], [1, 'rgba(14,9,26,0)']]);
  GEN.bokeh = radial(64, [[0, 'rgba(255,240,205,0.5)'], [0.72, 'rgba(255,232,190,0.42)'], [0.86, 'rgba(255,236,200,0.6)'], [0.95, 'rgba(255,236,200,0.2)'], [1, 'rgba(255,236,200,0)']]);

  GEN.bok = {};
  for (const [k, c] of [['gold', '255,196,110'], ['lime', '206,226,120'], ['cream', '255,238,206'], ['green', '120,170,90'], ['pink', '255,150,170'], ['amber', '255,170,80']])
    GEN.bok[k] = radial(96, [[0, 'rgba(' + c + ',0.55)'], [0.68, 'rgba(' + c + ',0.5)'], [0.84, 'rgba(' + c + ',0.62)'], [0.93, 'rgba(' + c + ',0.25)'], [1, 'rgba(' + c + ',0)']]);
  GEN.spark = (() => {
    const c = mk(96, 96), x = c.getContext('2d'); x.translate(48, 48);
    const g = x.createRadialGradient(0, 0, 0, 0, 0, 20); g.addColorStop(0, 'rgba(255,255,240,0.95)'); g.addColorStop(1, 'rgba(255,230,160,0)');
    x.fillStyle = g; x.beginPath(); x.arc(0, 0, 20, 0, TAU); x.fill();
    x.fillStyle = '#FFFDF4';
    for (const [l, w, a] of [[46, 2.4, 0], [46, 2.4, Math.PI / 2], [18, 1.5, Math.PI / 4], [18, 1.5, -Math.PI / 4]]) {
      x.save(); x.rotate(a); x.beginPath(); x.moveTo(-l, 0); x.quadraticCurveTo(0, -w, l, 0); x.quadraticCurveTo(0, w, -l, 0); x.fill(); x.restore();
    }
    return c;
  })();

  const vc = mk(256, 256), vx = vc.getContext('2d'), vg = vx.createRadialGradient(128, 118, 40, 128, 128, 182);
  vg.addColorStop(0, 'rgba(16,10,30,0)'); vg.addColorStop(0.62, 'rgba(16,10,30,0)'); vg.addColorStop(1, 'rgba(16,10,30,0.62)');
  vx.fillStyle = vg; vx.fillRect(0, 0, 256, 256); GEN.vignette = vc;

  const gc = mk(128, 128), gx = gc.getContext('2d'), id = gx.createImageData(128, 128);
  let seed = 98765;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  for (let i = 0; i < id.data.length; i += 4) {
    const v = rnd(), on = v > 0.5, m = Math.abs(v - 0.5) * 2;
    id.data[i] = id.data[i + 1] = id.data[i + 2] = on ? 255 : 0;
    id.data[i + 3] = m > 0.5 ? (m - 0.5) * 150 : 0;
  }
  gx.putImageData(id, 0, 0); GEN.grain = gc;
}

function norm(v) {
  v = v || {};
  const W = v.W || 960, OY = v.OY != null ? v.OY : 80, VH = v.VH || (OY + H);
  return { W, OY, VH, S: v.S || S0, t: v.t || 0, bag: v.bag || { count: 9, ripe: { verde: 2, erizo: 4, mangonada: 2, gold: 1 } }, score: v.score || {} };
}
const portraitness = v => 1 - clamp((v.W / v.VH - 0.6) / (1.45 - 0.6), 0, 1);
function barH(v) {
  const p = portraitness(v);
  const land = clamp((v.VH - v.W / 2.2) / 2, v.VH * 0.055, v.VH * 0.12);
  return lerp(land, v.VH * 0.045, p);
}

function fit(v, L, P, zoomMul, bars) {
  const p = eio(portraitness(v));
  const bx = [0, 1, 2, 3].map(i => lerp(L[i], P[i], p));
  const vh = v.VH - (bars === false ? 0 : 2 * barH(v));
  const z = Math.min(v.W / bx[2], vh / bx[3]) * (zoomMul || 1);
  return { cx: bx[0] + bx[2] / 2, cy: bx[1] + bx[3] / 2, z };
}
function camApply(ctx, v, c) {
  ctx.translate(v.W / 2, (H - v.OY) / 2); ctx.scale(c.z, c.z); if (c.rot) ctx.rotate(c.rot); ctx.translate(-c.cx, -c.cy);
}
function camView(v, c) {
  const hw = v.W / 2 / c.z, hh = v.VH / 2 / c.z, r = c.rot ? (Math.abs(Math.sin(c.rot)) * Math.max(hw, hh)) : 0;
  return { x0: c.cx - hw - r, x1: c.cx + hw + r, y0: c.cy - hh - r, y1: c.cy + hh + r };
}
function lerpCam(a, b, t) { return { cx: lerp(a.cx, b.cx, t), cy: lerp(a.cy, b.cy, t), z: Math.exp(lerp(Math.log(a.z), Math.log(b.z), t)), rot: lerp(a.rot || 0, b.rot || 0, t) }; }

function fillScreen(ctx, v, style, a) {
  if (a <= 0) return;
  ctx.globalAlpha = Math.min(1, a); ctx.fillStyle = style; ctx.fillRect(-2, -v.OY - 2, v.W + 4, v.VH + 4); ctx.globalAlpha = 1;
}
function bars(ctx, v, k, hOver) {
  const h = (hOver || barH(v)) * eout(k);
  if (h <= 0.2) return 0;
  ctx.fillStyle = C.bar;
  ctx.fillRect(-2, -v.OY - 2, v.W + 4, h + 2);
  ctx.fillRect(-2, H - h, v.W + 4, h + 2);
  return h;
}
let grainPat = null, grainCtx = null;
function finish(ctx, v, T, o) {
  o = o || {};
  ctx.globalAlpha = o.vignette != null ? o.vignette : 0.85;
  ctx.drawImage(GEN.vignette, -4, -v.OY - 4, v.W + 8, v.VH + 8);
  if (!grainPat || grainCtx !== ctx) { grainPat = ctx.createPattern(GEN.grain, 'repeat'); grainCtx = ctx; }
  const j = Math.floor(T * 24);
  if (grainPat.setTransform && window.DOMMatrix) grainPat.setTransform(new DOMMatrix([0.55, 0, 0, 0.55, hash(j) * 128, hash(j + 0.37) * 128]));
  ctx.globalAlpha = o.grain != null ? o.grain : 0.55; ctx.fillStyle = grainPat; ctx.fillRect(-2, -v.OY - 2, v.W + 4, v.VH + 4);
  ctx.globalAlpha = 1;
}

function wrapWords(ctx, words, maxW) {
  const lines = []; let cur = [], w = 0; const sp = ctx.measureText(' ').width;
  for (const wd of words) {
    const ww = ctx.measureText(wd).width;
    if (cur.length && w + sp + ww > maxW) { lines.push(cur); cur = []; w = 0; }
    cur.push(wd); w += (cur.length > 1 ? sp : 0) + ww;
  }
  if (cur.length) lines.push(cur);
  return lines;
}

function caption(ctx, v, text, t, o) {
  o = o || {};
  if (t <= 0) return;
  const p = portraitness(v), size = lerp(o.size || 31, o.sizeP || 30, p);
  font(ctx, FONT.serif, size);
  const maxW = o.maxW || Math.min(v.W * lerp(0.8, 0.88, p), 960);
  const paras = text.split('|').map(s => s.trim().split(/\s+/));
  let lines = [];
  for (const words of paras) lines = lines.concat(wrapWords(ctx, words, maxW));
  if (o.joinOnNarrow && p > 0.5) lines = wrapWords(ctx, paras.flat(), maxW);
  const lh = size * 1.32, bh = barH(v);
  const yLast = H - bh - lerp(o.lift != null ? o.lift : 30, o.liftP != null ? o.liftP : 56, p);
  const y0 = yLast - (lines.length - 1) * lh;
  const fade = o.fadeOut != null ? 1 - seg(t, o.fadeOut, o.fadeOut + 0.5) : 1;
  if (fade <= 0) return;

  const sa = 0.55 * fade * eout(t / 0.6);
  if (sa > 0) {
    const g = ctx.createLinearGradient(0, y0 - size * 1.6, 0, H);
    g.addColorStop(0, 'rgba(12,8,24,0)'); g.addColorStop(0.45, 'rgba(12,8,24,' + (0.5 * sa).toFixed(3) + ')'); g.addColorStop(1, 'rgba(12,8,24,' + (0.78 * sa).toFixed(3) + ')');
    ctx.fillStyle = g; ctx.fillRect(-2, y0 - size * 1.6, v.W + 4, H - (y0 - size * 1.6));
  }
  ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  const sp = ctx.measureText(' ').width, step = o.step || 0.13;
  let n = 0;
  ctx.shadowColor = 'rgba(10,6,20,0.65)'; ctx.shadowBlur = 6 * v.S; ctx.shadowOffsetY = 1;
  lines.forEach((ln, li) => {
    const widths = ln.map(w => ctx.measureText(w).width), tw = widths.reduce((a, b) => a + b, 0) + sp * (ln.length - 1);
    const cxl = o.x != null && p < 0.5 ? o.x : v.W / 2;
    let x = cxl - tw / 2;
    const y = y0 + li * lh;
    ln.forEach((wd, wi) => {
      const k = eout((t - n * step) / 0.55);
      if (k > 0) {
        ctx.globalAlpha = k * fade;
        ctx.fillStyle = o.color || C.cream;
        ctx.fillText(wd, x, y + (1 - k) * 7);
      }
      x += widths[wi] + sp; n++;
    });
  });
  ctx.shadowColor = 'rgba(0,0,0,0)'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  ctx.globalAlpha = 1;
}

function splitTitle(ctx, title, maxW) {
  const words = title.split(' ');
  if (words.length < 2) return [title];
  let best = null;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(' '), b = words.slice(i).join(' ');
    const m = Math.max(ctx.measureText(a).width, ctx.measureText(b).width);
    if (!best || m < best.m) best = { m, l: [a, b] };
  }
  return best.l;
}
function drawCard(ctx, title, sub, k, v) {
  v = norm(v); k = clamp(k, 0, 1);
  if (k <= 0 || k >= 1) return;
  ctx.save();
  try {
    const kin = sstep(0, 0.3, k), kout = sstep(0.7, 1, k), env = kin * (1 - kout);
    const p = portraitness(v), cy = (H - v.OY) / 2 - lerp(10, 40, p);

    fillScreen(ctx, v, 'rgb(12,8,22)', 0.38 * env);
    const bh = lerp(v.VH * 0.2, v.VH * 0.13, p);
    bars(ctx, v, eio(kin) * (1 - eio(kout)), bh);

    const maxW = Math.min(v.W * lerp(0.8, 0.86, p), 980);
    font(ctx, FONT.title, 100);
    let lines = [title], w100 = ctx.measureText(title).width;
    let size = Math.min(lerp(118, 104, p), 100 * maxW / w100);
    if (size < 70 && title.indexOf(' ') > 0) {
      lines = splitTitle(ctx, title, maxW);
      const wl = Math.max(...lines.map(s => ctx.measureText(s).width));
      size = Math.min(lerp(118, 104, p), 100 * maxW / wl);
    }
    font(ctx, FONT.title, size);
    ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    const lh = size * 1.02, block = lh * lines.length;
    const subSize = lerp(30, 28, p);
    const total = block + 18 + subSize * 1.4;
    let yb = cy - total / 2 + size * 0.86;
    let li = 0, n = 0;
    const count = title.replace(/ /g, '').length;
    for (const line of lines) {
      const tw = ctx.measureText(line).width; let x = v.W / 2 - tw / 2;
      ctx.save();
      ctx.beginPath(); ctx.rect(-2, yb - size * 1.1, v.W + 4, size * 1.16); ctx.clip();
      for (const ch of line) {
        const cw = ctx.measureText(ch).width;
        if (ch !== ' ') {
          const d = n / Math.max(1, count - 1);
          const ki = eout(seg(k, 0.03 + d * 0.13, 0.03 + d * 0.13 + 0.15));
          const ko = ein(seg(k, 0.72 + d * 0.08, 0.72 + d * 0.08 + 0.14));
          const off = (1 - ki) * size * 1.05 + ko * size * 1.05;
          ctx.shadowColor = 'rgba(10,6,20,0.5)'; ctx.shadowBlur = 16 * v.S; ctx.shadowOffsetY = 2 * v.S;
          ctx.fillStyle = C.cream; ctx.fillText(ch, x, yb + off);
          n++;
        }
        x += cw;
      }
      ctx.restore();
      ctx.shadowColor = 'rgba(0,0,0,0)'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      yb += lh; li++;
    }

    const ry = yb - lh + size * 0.2 + 16;
    const rk = eio(seg(k, 0.16, 0.34)) * (1 - eio(seg(k, 0.7, 0.86)));
    if (rk > 0) {
      const rw = lerp(70, 56, p) * rk;
      ctx.fillStyle = C.mango; ctx.fillRect(v.W / 2 - rw, ry, rw * 2, 3);
      ctx.beginPath(); ctx.arc(v.W / 2 + rw + 9, ry + 1.5, 3.4 * rk, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(v.W / 2 - rw - 9, ry + 1.5, 3.4 * rk, 0, TAU); ctx.fill();
    }

    const sk = eout(seg(k, 0.2, 0.4)) * (1 - sstep(0.7, 0.84, k));
    if (sk > 0 && sub) {
      font(ctx, FONT.serif, subSize);
      ctx.textAlign = 'center'; ctx.globalAlpha = sk; ctx.fillStyle = '#FBE3B8';
      ctx.fillText(sub, v.W / 2, ry + 14 + subSize * 1.05 + (1 - sk) * 8);
      ctx.globalAlpha = 1;
    }
  } finally { ctx.restore(); }
}

function brandTinted(name, color) {
  const key = name + color; if (ART[key]) return key;
  const a = ART[name]; if (!a) return null;
  const c = mk(a.im.naturalWidth || a.im.width, a.im.naturalHeight || a.im.height), x = c.getContext('2d');
  x.drawImage(a.im, 0, 0, c.width, c.height); x.globalCompositeOperation = 'source-in'; x.fillStyle = color; x.fillRect(0, 0, c.width, c.height);
  register(key, c, a.box); return key;
}
function endLayout(v) {
  const p = portraitness(v), top = -v.OY + barH(v) * 0.3 + 22, bottom = v.VH * 0.62 - v.OY;
  if (p < 0.5) {
    const hh = bottom - top, cx = v.W / 2;
    const shoeW = Math.min(v.W * 0.5, hh * 1.5, 640), shoeH = shoeW * 740 / 1180;
    const colX = Math.min(v.W * 0.73, cx + shoeW * 0.62 + 170);
    return { p, shoe: { x: Math.max(v.W * 0.3, colX - shoeW * 0.5 - 300) - shoeW / 2 + 30, y: top + (hh - shoeH) / 2 + 6, w: shoeW },
      col: colX, wm: { w: Math.min(360, v.W * 0.32) }, top, bottom };
  }
  const shoeW = Math.min(v.W * 0.9, 600), shoeH = shoeW * 740 / 1180;
  return { p, shoe: { x: v.W / 2 - shoeW / 2, w: shoeW, h: shoeH }, col: v.W / 2, wm: { w: Math.min(v.W * 0.74, 440) }, top, bottom };
}

let STORE_BLUR = null;
function storeBlur() {
  if (STORE_BLUR || !ART.store) return STORE_BLUR;
  const b = ART.store.box, k = 0.16, c = mk(b[2] * k, b[3] * k), g = c.getContext('2d');
  g.drawImage(ART.store.im, 0, 0, c.width, c.height);
  STORE_BLUR = { c: softBlur(softBlur(c, 1.6), 1.4), box: b };
  return STORE_BLUR;
}

let SHEEN = null;
function shoeSheen(ctx, x, y, w, u) {
  if (u <= 0 || u >= 1 || !ART.shoe) return;
  if (!SHEEN) {
    const mw = 420, mh = Math.round(mw * 740 / 1180), m = mk(mw, mh);
    m.getContext('2d').drawImage(ART.shoe.lv[levelFor(0.36)] || bake(ART.shoe, levelFor(0.36)), 0, 0, mw, mh);
    SHEEN = { m, s: mk(mw, mh) };
  }
  const s = SHEEN.s, g = s.getContext('2d'), mw = s.width, mh = s.height;
  g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, mw, mh); g.drawImage(SHEEN.m, 0, 0);
  g.globalCompositeOperation = 'source-in';
  const cx = lerp(-0.3, 1.3, u) * mw, gr = g.createLinearGradient(cx - mw * 0.16, 0, cx + mw * 0.16, mh * 0.35);
  gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,250,235,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, mw, mh);
  ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(s, x, y, w, w * 740 / 1180); ctx.globalCompositeOperation = 'source-over';
}
function drawEndCard(ctx, v, k, T) {
  const L = endLayout(v), cream = C.cream;
  const relLine = window.RELEASE_LINE || 'Only at Shoe Gallery · 1060 NE 79th St, Miami';
  const a = eout(k);

  const g = ctx.createLinearGradient(0, -v.OY, 0, H);
  g.addColorStop(0, '#120D22'); g.addColorStop(0.55, '#231B3C'); g.addColorStop(1, '#0E0A18');
  ctx.globalAlpha = a; ctx.fillStyle = g; ctx.fillRect(-2, -v.OY - 2, v.W + 4, v.VH + 4);
  const sb = storeBlur();
  if (sb) {
    const sw2 = Math.max(v.W * 1.25, 900), sh2 = sw2 * sb.box[3] / sb.box[2];
    ctx.globalAlpha = 0.22 * a; ctx.drawImage(sb.c, v.W / 2 - sw2 / 2, H + 40 - sh2, sw2, sh2);
    const g2 = ctx.createLinearGradient(0, H - sh2 * 0.8, 0, H);
    g2.addColorStop(0, 'rgba(14,10,24,0)'); g2.addColorStop(0.3, 'rgba(14,10,24,0.55)'); g2.addColorStop(0.6, 'rgba(14,10,24,0.3)'); g2.addColorStop(1, 'rgba(14,10,24,0.6)');
    ctx.globalAlpha = a; ctx.fillStyle = g2; ctx.fillRect(-2, H - sh2 * 0.8, v.W + 4, sh2 * 0.8 + 2);
  }
  const sw = L.shoe.w, sh = sw * 740 / 1180;
  let sx = L.shoe.x, sy = L.shoe.y;
  if (L.p >= 0.5) {
    const wmH = L.wm.w * 409 / 1400;
    const stackH = wmH + 18 + sh + 26 + 30 + 22 + 34 + L.wm.w * 0.78 * 584 / 1600;
    const y0 = L.top + Math.max(0, (L.bottom - L.top - stackH) / 2);
    L.wmY = y0; sy = y0 + wmH + 18; L.textY = sy + sh + 30;
  }
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.55 * a; ctx.drawImage(GEN.glow, sx + sw * 0.5 - sw * 0.9, sy + sh * 0.55 - sh * 1.1, sw * 1.8, sh * 2.2);
  ctx.globalAlpha = 0.3 * a; ctx.drawImage(GEN.glow, sx - sw * 0.2, sy + sh * 0.6, sw * 1.4, sh * 0.9);
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;

  const sk = eout(seg(k, 0.0, 0.8));
  ctx.globalAlpha = sk;
  const dx = (1 - sk) * -40;

  ctx.globalAlpha = 0.5 * sk; ctx.drawImage(GEN.dark, sx + dx + sw * 0.08, sy + sh * 0.86, sw * 0.86, sh * 0.16); ctx.globalAlpha = sk;
  art(ctx, 'shoe', sx + dx, sy, sw / 1180);
  ctx.globalAlpha = 1;

  if (k >= 1) shoeSheen(ctx, sx, sy, sw, ((T % 4.5) - 0.4) / 1.3);
  else shoeSheen(ctx, sx, sy, sw, (k - 0.45) / 0.55);

  const wmW = L.wm.w, wmH = wmW * 409 / 1400;
  const wk = eout(seg(k, 0.25, 0.85));
  let ty;
  if (L.p < 0.5) {
    const stackH = wmH + 24 + 26 + 10 + 20 + 36 + wmW * 0.82 * 584 / 1600;
    let y = L.top + Math.max(0, (L.bottom - L.top - stackH) / 2) - 6;
    ctx.globalAlpha = wk; art(ctx, 'wordmark', L.col - wmW / 2, y + (1 - wk) * 10, wmW / 1400); y += wmH + 26;
    ty = y;
  } else {
    ctx.globalAlpha = wk; art(ctx, 'wordmark', L.col - wmW / 2, L.wmY + (1 - wk) * 10, wmW / 1400);
    ty = L.textY;
  }
  const tk = eout(seg(k, 0.4, 1));
  ctx.globalAlpha = tk; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  font(ctx, FONT.sansBold, lerp(24, 23, L.p)); ctx.fillStyle = cream;
  ctx.fillText('ADIZERO Evo SL · Thinking of You', L.col, ty + 22);
  font(ctx, FONT.sans, lerp(16.5, 16, L.p)); ctx.fillStyle = 'rgba(255,246,229,0.78)';
  ctx.fillText(relLine, L.col, ty + 50);
  const lw = Math.min(wmW * 0.82, 330), lh = lw * 584 / 1600;
  const lk = eout(seg(k, 0.55, 1));
  ctx.globalAlpha = lk; art(ctx, 'lockup', L.col - lw / 2, ty + 78, lw / 1600);
  ctx.globalAlpha = 1;
}

const LIST = { find: { duration: 7.2 }, bagged: { duration: 5.05 }, home: { duration: 9.6 } };

const RIG = { LT: 88, LS: 84, LU: 66, LF: 56, SH: [3, -110], HD: [5, -153], SW: 90, SAX: 0.233, SAY: 0.419, SOLE: 0.953 };
RIG.SHH = RIG.SW * 740 / 1180; RIG.ANK = (RIG.SOLE - RIG.SAY) * RIG.SHH;
const PARTS0 = { thigh: [-27, -36, 52, 136], shin: [-24, -16, 44, 116], shorts_leg: [-31, -36, 62, 84], upper_arm: [-19, -24, 38, 96],
  forearm: [-14, -14, 28, 80], fist: [-12, -5, 25, 32], hand_open: [-12, -5, 30, 50], torso_back: [-36, -42, 66, 66], torso_front: [-34, -164, 66, 160], head: [-25, -40, 66, 70] };
const FARP = ['thigh', 'shin', 'shorts_leg', 'upper_arm', 'forearm', 'fist', 'hand_open'];
function farPost(box, limb) {
  return (x, w, h) => {
    const k = w / box[2];
    x.globalCompositeOperation = 'source-atop';
    if (limb) {
      const g = x.createLinearGradient((-16 - box[0]) * k, 0, (16 - box[0]) * k, 0);
      g.addColorStop(0, 'rgba(28,22,46,0.6)'); g.addColorStop(0.55, 'rgba(28,22,46,0.5)'); g.addColorStop(1, 'rgba(34,24,44,0.34)');
      x.fillStyle = g;
    } else x.fillStyle = 'rgba(28,22,46,0.5)';
    x.fillRect(0, 0, w, h);
  };
}
let RIG_OK = false;
let RIG_LOOK = null, RIG_SEQ = 0;
async function loadRig(shoeIm) {
  const seq = ++RIG_SEQ;
  const rb = window.RUNNER_BASE != null ? window.RUNNER_BASE : base();
  const RR = window.Runner, rp = RR && typeof RR.rigParts === 'function' ? RR.rigParts() : null;
  let parts = PARTS0;
  if (rp) { parts = {}; for (const n in rp.parts) parts[n] = rp.parts[n].box; }
  else try { const r = await fetch(rb + 'runner/parts/manifest.json'); if (r.ok) parts = Object.assign({}, PARTS0, await r.json()); } catch (e) {   }
  const names = Object.keys(parts).filter(n => !/^tee_folds/.test(n));
  const ims = await Promise.all(names.map(n => loadImage(rp ? rp.parts[n].url : rb + 'runner/parts/' + n + '.svg')));
  if (seq !== RIG_SEQ) return;
  for (const k of Object.keys(ART)) if (/^rp_/.test(k) && !/^rp_shoe/.test(k)) delete ART[k];
  RIG_LOOK = rp;
  names.forEach((n, i) => {
    if (!ims[i]) return;
    register('rp_' + n, ims[i], parts[n]);
    if (FARP.includes(n)) register('rp_' + n + '_far', ims[i], parts[n], { post: farPost(parts[n], true) });
  });
  if (shoeIm) {
    const sb = [-RIG.SAX * RIG.SW, -RIG.SAY * RIG.SHH, RIG.SW, RIG.SHH];
    register('rp_shoe', shoeIm, sb); register('rp_shoe_far', shoeIm, sb, { post: farPost(sb, false) });
  }
  RIG_OK = !!(ART.rp_thigh && ART.rp_shin && ART.rp_torso_front && ART.rp_head && ART.rp_shoe);
}
function ikLeg(hx, hy, ax, ay) {
  let dx = ax - hx, dy = ay - hy, d = Math.hypot(dx, dy);
  const maxD = (RIG.LT + RIG.LS) * 0.999;
  if (d > maxD) { dx *= maxD / d; dy *= maxD / d; d = maxD; }
  const phi = Math.atan2(dx, dy), a1 = Math.acos(clamp((RIG.LT * RIG.LT + d * d - RIG.LS * RIG.LS) / (2 * RIG.LT * d), -1, 1));
  const al = phi + a1, kx = hx + Math.sin(al) * RIG.LT, ky = hy + Math.cos(al) * RIG.LT;
  return [al, Math.atan2(hx + dx - kx, hy + dy - ky)];
}

const POSES = {
  stand:   { lean: 0.03, head: 0.02, hip: 196, feet: [-13, 15], far: [-0.06, 0.2, 0.08, 0], near: [0.02, 0.24, 0.1, 0] },
  lookUp:  { lean: -0.05, head: -0.52, hip: 197, feet: [-14, 16], far: [-0.14, 0.16, 0.1, 0], near: [-0.04, 0.3, 0.06, 0] },
  carry:   { lean: 0.03, head: 0.06, hip: 196, feet: [-13, 15], far: [-0.08, 0.22, 0.08, 0], near: [0.16, 0.06, -0.1, 0] },
  handoff: { lean: 0.08, head: 0.14, hip: 194, feet: [-20, 26], far: [-0.2, 0.3, 0.1, 0], near: [1.28, 0.22, -0.2, 0] },
};
function blendPose(a, b, k) {
  const o = {};
  for (const key in a) o[key] = Array.isArray(a[key]) ? a[key].map((x, i) => lerp(x, b[key][i], k)) : lerp(a[key], b[key], k);
  return o;
}
function breathe(p, T) { const b = Math.sin(T * 2.1); p = Object.assign({}, p); p.hip += 0.6 * b; p.head += 0.01 * b; p.lean += 0.004 * b; return p; }

function rigDraw(ctx, P, x0, ground, map, opt) {
  opt = opt || {};
  const m = ctx.getTransform(), M0 = [m.a, m.b, m.c, m.d, m.e, m.f], m0s = Math.sqrt(m.a * m.a + m.b * m.b);
  const put = (name, x, y, ang, len, sx, sy) => {
    const A = ART[name]; if (!A) return;
    const c = Math.cos(ang), s = Math.sin(ang);
    let ox = x, oy = y, xa = c, xb = s, ya = -s, yb = c;
    if (map) {
      [ox, oy] = map.p(x, y);
      const hl = len ? len / 2 : (A.box[1] + A.box[3] / 2);
      const J = map.J(x - s * hl, y + c * hl);
      xa = J[0] * c + J[2] * s; xb = J[1] * c + J[3] * s;
      if (len) { const e = map.p(x - s * len, y + c * len); ya = (e[0] - ox) / len; yb = (e[1] - oy) / len; }
      else { ya = J[0] * -s + J[2] * c; yb = J[1] * -s + J[3] * c; }
    }
    if (sx) { xa *= sx; xb *= sx; } if (sy) { ya *= sy; yb *= sy; }
    const L = levelFor(Math.sqrt(xa * xa + xb * xb) * m0s), cv = A.lv[L] || bake(A, L), b = A.box;
    ctx.setTransform(M0[0] * xa + M0[2] * xb, M0[1] * xa + M0[3] * xb, M0[0] * ya + M0[2] * yb, M0[1] * ya + M0[3] * yb,
      M0[0] * ox + M0[2] * oy + M0[4], M0[1] * ox + M0[3] * oy + M0[5]);
    ctx.drawImage(cv, b[0], b[1], b[2], b[3]);
  };
  const hx = x0 - 2, hy = ground - P.hip, lean = P.lean;
  const legs = [0, 1].map(i => {
    const far = i === 0, lhx = hx + (far ? -2 : 1.5), ax = x0 + P.feet[i], ay = ground - RIG.ANK;
    const [al, be] = ikLeg(lhx, hy, ax, ay);
    const kx = lhx + Math.sin(al) * RIG.LT, ky = hy + Math.cos(al) * RIG.LT;
    return { far, hx: lhx, al, be, kx, ky, ax: kx + Math.sin(be) * RIG.LS, ay: ky + Math.cos(be) * RIG.LS };
  });
  const rotp = (px, py, a) => [px * Math.cos(a) - py * Math.sin(a), px * Math.sin(a) + py * Math.cos(a)];
  const [shx, shy] = rotp(RIG.SH[0], RIG.SH[1], lean), [hdx, hdy] = rotp(RIG.HD[0], RIG.HD[1], lean);
  const hands = [];
  const arm = (A, far) => {
    const sx = hx + shx + (far ? -2 : 0), sy = hy + shy + (far ? 1 : 0);
    const a = A[0], fa = a + A[1];
    const ex = sx + Math.sin(a) * RIG.LU, ey = sy + Math.cos(a) * RIG.LU, wx = ex + Math.sin(fa) * RIG.LF, wy = ey + Math.cos(fa) * RIG.LF;
    const sfx = far ? '_far' : '';
    put('rp_forearm' + sfx, ex, ey, -fa, RIG.LF);
    if (A[3] > 0.5 && ART['rp_hand_open' + sfx]) put('rp_hand_open' + sfx, wx, wy, -(fa + A[2]));
    else put('rp_fist' + sfx, wx, wy, -(fa + A[2]));
    put('rp_upper_arm' + sfx, sx, sy, -a, RIG.LU);
    hands[far ? 0 : 1] = { x: wx + Math.sin(fa + A[2]) * 13, y: wy + Math.cos(fa + A[2]) * 13, ang: fa + A[2] };
  };
  const leg = L => {
    const sfx = L.far ? '_far' : '';
    put('rp_shin' + sfx, L.kx, L.ky, -L.be, RIG.LS);
    if (!opt.noShoes) put('rp_shoe' + sfx, L.ax, L.ay, 0);
    put('rp_thigh' + sfx, L.hx, hy, -L.al, RIG.LT);
    put('rp_shorts_leg' + sfx, L.hx, hy, -(L.al * 0.9), 0, 1, 1 - 0.07 * clamp(L.al, 0, 1));
  };
  if (!map && opt.shadow !== false) {
    ctx.globalAlpha = 0.32; ctx.drawImage(GEN.dark, x0 - 70, ground - 7, 140, 14); ctx.globalAlpha = 1;
  }
  arm(P.far, true);
  leg(legs[0]);
  put('rp_torso_back', hx, hy, lean);
  if (opt.between) { ctx.setTransform(M0[0], M0[1], M0[2], M0[3], M0[4], M0[5]); opt.between(hands, legs); }
  leg(legs[1]);
  put('rp_torso_front', hx, hy, lean);
  if (ART.rp_neck) put('rp_neck', hx, hy, lean);
  const headAng = lean * 0.28 + P.head;
  if (ART.rp_tail && RIG_LOOK && RIG_LOOK.tail) {
    const tl = RIG_LOOK.tail, c = Math.cos(headAng), s = Math.sin(headAng);
    put('rp_tail', hx + hdx + tl.root[0] * c - tl.root[1] * s, hy + hdy + tl.root[0] * s + tl.root[1] * c, Math.max(-0.1, 0.45 * (tl.rest + headAng)), tl.len);
  }
  put('rp_head', hx + hdx, hy + hdy, headAng);
  arm(P.near, false);
  ctx.setTransform(M0[0], M0[1], M0[2], M0[3], M0[4], M0[5]);
  const mp = map ? (x, y) => { const q = map.p(x, y); return { x: q[0], y: q[1] }; } : (x, y) => ({ x, y });
  const top = rotp(9, -46, headAng);
  return { head: mp(hx + hdx + 8, hy + hdy - 22), headTop: mp(hx + hdx + top[0], hy + hdy + top[1]), nearHand: mp(hands[1].x, hands[1].y),
    farHand: mp(hands[0].x, hands[0].y), nearShoe: mp(legs[1].ax, legs[1].ay), farShoe: mp(legs[0].ax, legs[0].ay), handAng: hands[1].ang };
}
function runnerHasPose(pose) {
  const R = window.Runner;
  return !!(R && R.parts && R.parts.shoe && R.features && Array.isArray(R.features.poses) && R.features.poses.includes(pose));
}

function drawRunner(ctx, s) {
  const R = window.Runner;
  const wantPose = s.pose || null;
  if (R && R.draw && R.parts && R.parts.shoe && (!wantPose || runnerHasPose(wantPose))) {
    let a = null;
    try { a = R.draw(ctx, s); } catch (e) { a = null; }
    if (a && a.headTop) return a;
    const L = R.last;
    if (L && L.hipX != null) {
      const hx = L.hipX + Math.sin(L.lean) * 158, hy = L.hipY - Math.cos(L.lean) * 158;
      return { head: { x: hx + 8, y: hy }, headTop: { x: hx + 6, y: hy - 32 }, nearHand: { x: s.x + 30, y: s.ground - 200 }, farHand: { x: s.x - 20, y: s.ground - 200 } };
    }
    return { head: { x: s.x + 10, y: s.ground - 350 }, headTop: { x: s.x + 8, y: s.ground - 382 }, nearHand: { x: s.x + 30, y: s.ground - 200 } };
  }
  if (!RIG_OK) return null;
  return rigDraw(ctx, s.rigPose || POSES.stand, s.x, s.ground, null, s.rigOpt);
}

const RCLOCK = {};
function runnerAt(ctx, key, fn, t, T, t0) {
  const R = window.Runner, last = RCLOCK[key];
  if (R && R.draw && (last == null || T < last - 1e-6 || T - last > 0.12)) {
    for (let u = Math.max(t0, t - 0.9); u < t - 1e-4; u += 1 / 30) {
      const s = fn(u, T - (t - u)); s.noDraw = true;
      try { R.draw(ctx, s); } catch (e) { break; }
    }
  }
  RCLOCK[key] = T;
  return drawRunner(ctx, fn(t, T));
}

function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const LEAFPAL = [[0, [10, 30, 22]], [0.22, [18, 50, 31]], [0.42, [32, 76, 40]], [0.6, [58, 106, 46]], [0.76, [104, 146, 58]], [0.88, [168, 190, 80]], [1, [232, 222, 136]]];
function palAt(P, x) {
  for (let i = 1; i < P.length; i++) if (x <= P[i][0]) { const a = P[i - 1], b = P[i], k = (x - a[0]) / (b[0] - a[0]); return a[1].map((c, j) => c + (b[1][j] - c) * k); }
  return P[P.length - 1][1];
}
const rgbs = (c, a) => 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + (a == null ? 1 : a) + ')';
function buildFoliage(o) {
  const res = Math.min(o.res, MAXPX / o.w, MAXPX / o.h);
  const c = mk(o.w * res, o.h * res), g = c.getContext('2d'), R = rng(o.seed || 1);
  const T = (x, y, a, s) => { const cs = Math.cos(a) * s * res, sn = Math.sin(a) * s * res; g.setTransform(cs, sn, -sn, cs, (x - o.x0) * res, (y - o.y0) * res); };
  const sample = () => { for (let i = 0; i < 60; i++) { const x = o.x0 + R() * o.w, y = o.y0 + R() * o.h; if (o.inside(x, y) > 0) return [x, y]; } return null; };
  const sun = o.sun || [0.86, -0.5];
  const litAt = (x, y) => {
    let d = 0;
    for (; d < 220; d += 14) if (o.inside(x + sun[0] * d, y + sun[1] * d) <= 0) break;
    return clamp(1 - d / 200, 0, 1);
  };

  for (let i = 0; i < o.blobs; i++) {
    const p = sample(); if (!p) continue;
    const L = litAt(p[0], p[1]) * 0.6, r = 28 + R() * 60;
    T(p[0], p[1], 0, 1); g.fillStyle = rgbs(palAt(LEAFPAL, L * 0.5 + 0.02)); g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fill();
  }

  const cl = [];
  for (let i = 0; i < o.clusters; i++) { const p = sample(); if (!p) continue; cl.push([p[0], p[1], litAt(p[0], p[1]), R()]); }
  cl.sort((a, b) => a[2] - b[2]);
  for (const [x, y, Lr, rr] of cl) {
    const n = 6 + (rr * 4 | 0), base = R() * TAU, droop = o.droop || 0.5;
    const young = o.young && y < o.y0 + o.h * 0.35 && R() < o.young;
    for (let k = 0; k < n; k++) {
      let a = base + k / n * TAU + (R() - 0.5) * 0.5;
      a = a + (Math.PI / 2 - ((a % TAU) + TAU) % TAU) * 0;
      const len = (o.leaf || 52) * (0.75 + R() * 0.5), wid = len * (0.13 + R() * 0.05);
      const L = clamp(Lr * (0.75 + R() * 0.4) + (R() - 0.5) * 0.12, 0, 1);
      let col = palAt(LEAFPAL, L);
      if (young) col = [lerp(110, 196, L), lerp(40, 98, L), lerp(26, 58, L)];

      const dn = Math.PI / 2, da = ((dn - a + Math.PI * 3) % TAU) - Math.PI;
      a += da * droop * 0.35;
      T(x, y, a, 1);
      g.fillStyle = rgbs(col);
      g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(len * 0.38, -wid, len, (R() - 0.5) * wid * 0.6); g.quadraticCurveTo(len * 0.4, wid, 0, 0); g.fill();
      if (L > 0.55) {
        g.strokeStyle = rgbs(palAt(LEAFPAL, Math.min(1, L + 0.18)), 0.55); g.lineWidth = 1.1 / 1;
        g.beginPath(); g.moveTo(len * 0.05, 0); g.quadraticCurveTo(len * 0.45, -wid * 0.12, len * 0.92, 0); g.stroke();
      }
    }
  }

  if (o.holes) {
    g.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < o.holes; i++) {
      const p = sample(); if (!p) continue;
      if (o.inside(p[0], p[1]) > (o.holeMax || 0.35)) continue;
      T(p[0], p[1], R() * TAU, 1); g.fillStyle = 'rgba(0,0,0,0.9)';
      g.beginPath(); g.ellipse(0, 0, 6 + R() * 16, 4 + R() * 9, 0, 0, TAU); g.fill();
    }
    g.globalCompositeOperation = 'source-over';
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
  return { c, x0: o.x0, y0: o.y0, w: o.w, h: o.h };
}

const CLUMP = { size: 220, levels: 6, variants: 5, sprites: null };
const CLUMP_PALS = {
  lit: [[0, [12, 34, 24]], [0.3, [24, 60, 34]], [0.55, [52, 98, 44]], [0.75, [104, 146, 58]], [0.9, [176, 196, 84]], [1, [238, 226, 140]]],
  back: [[0, [14, 30, 22]], [0.35, [34, 64, 32]], [0.6, [78, 120, 42]], [0.8, [146, 182, 66]], [1, [214, 228, 136]]],
  young: [[0, [46, 24, 22]], [0.5, [104, 56, 40]], [1, [170, 108, 70]]],
};
function makeClump(level, variant, pal, seed) {
  const N = CLUMP.size, c = mk(N, N), g = c.getContext('2d'), R = rng(seed);
  const cx = N / 2, cy = N / 2, rad = N * 0.3, P = CLUMP_PALS[pal];
  const n = 16 + (R() * 9 | 0), leaves = [];
  for (let i = 0; i < n; i++) {
    const a0 = R() * TAU, rr = Math.sqrt(R()) * rad * 0.55;
    const px = cx + Math.cos(a0) * rr, py = cy + Math.sin(a0) * rr;
    let a = Math.atan2(py - cy, px - cx) + (R() - 0.5) * 0.9;
    a += (Math.PI / 2 - a) * 0.12;
    const len = N * (0.2 + R() * 0.11), wid = len * (0.13 + R() * 0.05);
    const side = ((px - cx) * 0.8 - (py - cy) * 0.6) / rad;
    leaves.push({ px, py, a, len, wid, side, depth: R() });
  }
  leaves.sort((p, q) => p.depth - q.depth);
  for (const L of leaves) {
    const k = clamp(level * 0.78 + L.side * 0.22 * (0.4 + level) + (L.depth - 0.5) * 0.16 + (R() - 0.5) * 0.08, 0, 1);
    const col = palAt(P, k), cs = Math.cos(L.a), sn = Math.sin(L.a);
    g.setTransform(cs, sn, -sn, cs, L.px, L.py);
    g.fillStyle = rgbs(col);
    const bend = (R() - 0.5) * L.wid * 0.8;
    g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(L.len * 0.38, -L.wid + bend * 0.3, L.len, bend); g.quadraticCurveTo(L.len * 0.42, L.wid + bend * 0.3, 0, 0); g.fill();

    g.fillStyle = rgbs(palAt(P, Math.max(0, k - 0.12)), 0.55);
    g.beginPath(); g.moveTo(L.len * 0.06, 0); g.quadraticCurveTo(L.len * 0.42, L.wid + bend * 0.3, L.len, bend); g.quadraticCurveTo(L.len * 0.45, bend * 0.4, L.len * 0.06, 0); g.fill();
    if (k > 0.45) {
      g.strokeStyle = rgbs(palAt(P, Math.min(1, k + 0.22)), 0.6); g.lineWidth = 1;
      g.beginPath(); g.moveTo(L.len * 0.05, 0); g.quadraticCurveTo(L.len * 0.45, bend * 0.2, L.len * 0.94, bend * 0.9); g.stroke();
    }
  }
  return c;
}
function* clumpsGen() {
  const S = { lit: [], back: [], young: [] };
  for (const pal of ['lit', 'back']) for (let l = 0; l < CLUMP.levels; l++) { S[pal][l] = [];
    for (let v = 0; v < CLUMP.variants; v++) { S[pal][l][v] = makeClump(l / (CLUMP.levels - 1), v, pal, 101 + l * 17 + v * 7 + (pal === 'back' ? 999 : 0)); yield; } }
  S.young[0] = [0, 1, 2].map(v => makeClump(0.55, v, 'young', 555 + v));
  CLUMP.sprites = S;
}
function clumps() {
  if (!CLUMP.sprites) { const it = clumpsGen(); while (!it.next().done); }
  return CLUMP.sprites;
}

function* crownGen(o) {
  const res = Math.min(o.res, MAXPX / o.w, MAXPX / o.h);
  const c = mk(o.w * res, o.h * res), g = c.getContext('2d'), R = rng(o.seed || 1);
  if (!CLUMP.sprites) { yield* clumpsGen(); }
  const SP = clumps();
  const sun = o.sun || [0.86, -0.5], pal = o.pal || 'lit';
  const edge = (x, y) => { let d = 0; for (; d < 260; d += 16) if (o.inside(x + sun[0] * d, y + sun[1] * d) <= 0) break; return d; };
  const items = [];
  for (let i = 0; i < o.n; i++) {
    if (i % 12 === 0) yield;
    let p = null;
    for (let j = 0; j < 40 && !p; j++) { const x = o.x0 + R() * o.w, y = o.y0 + R() * o.h; if (o.inside(x, y) > -0.02) p = [x, y]; }
    if (!p) continue;
    const d = edge(p[0], p[1]), dark = o.inside(p[0], p[1]);
    let L = clamp(1 - d / 230, 0, 1) * 0.9 + (R() - 0.5) * 0.1 + 0.13 * vnoise(p[0] * 2.3, p[1] * 2.3);
    if (o.light) L = clamp(L + o.light(p[0], p[1]), 0, 1);
    items.push({ x: p[0], y: p[1], L, s: (o.size || 1) * (0.75 + R() * 0.6), r: (R() - 0.5) * 0.5, v: R() * CLUMP.variants | 0,
      young: o.young && R() < o.young && p[1] < o.y0 + o.h * 0.45 });
  }
  items.sort((a, b) => a.L - b.L);

  if (o.mass) {
    const cell = 10, shade = palAt(CLUMP_PALS[pal], o.mass);
    for (let y = o.y0; y < o.y0 + o.h; y += cell) {
      yield;
      g.setTransform(1, 0, 0, 1, 0, 0);
      for (let x = o.x0; x < o.x0 + o.w; x += cell) {
        const d = o.inside(x + cell / 2, y + cell / 2);
        if (d < 0.1) continue;
        const k = clamp((y - o.y0) / o.h, 0, 1);
        g.fillStyle = rgbs(shade.map((c, i) => c * (1.15 - 0.45 * k)));
        g.fillRect((x - o.x0) * res - 0.5, (y - o.y0) * res - 0.5, cell * res + 1, cell * res + 1);
      }
    }
  }
  const N = CLUMP.size;
  let n = 0;
  for (const it of items) {
    if (n++ % 24 === 0) yield;
    const lv = Math.round(clamp(it.L, 0, 1) * (CLUMP.levels - 1));
    const spr = it.young ? SP.young[0][it.v % 3] : SP[pal][lv][it.v];
    const k = it.s * res, cs = Math.cos(it.r) * k, sn = Math.sin(it.r) * k;
    g.setTransform(cs, sn, -sn, cs, (it.x - o.x0) * res, (it.y - o.y0) * res);
    g.drawImage(spr, -N / 2, -N / 2);
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
  return { c, x0: o.x0, y0: o.y0, w: o.w, h: o.h };
}
function buildCrown(o) { const it = crownGen(o); let r; while (!(r = it.next()).done); return r.value; }
function drawTex(ctx, tex, x, y, s, a) { if (!tex) return; if (a != null) ctx.globalAlpha = a; s = s || 1; ctx.drawImage(tex.c, x + tex.x0 * s, y + tex.y0 * s, tex.w * s, tex.h * s); if (a != null) ctx.globalAlpha = 1; }
function ellD(x, y, cx, cy, rx, ry) { const dx = (x - cx) / rx, dy = (y - cy) / ry; return 1 - Math.sqrt(dx * dx + dy * dy); }
function vnoise(x, y) { return Math.sin(x * 0.021 + Math.sin(y * 0.017) * 2.1) * 0.5 + Math.sin(y * 0.029 + x * 0.011) * 0.35 + Math.sin((x + y) * 0.053) * 0.15; }

function softBlur(src, k) {
  const w = Math.max(2, Math.round(src.width / k)), h = Math.max(2, Math.round(src.height / k));
  const a = mk(w, h), ax = a.getContext('2d'); ax.imageSmoothingQuality = 'high'; ax.drawImage(src, 0, 0, w, h);
  const b = mk(Math.max(2, w >> 1), Math.max(2, h >> 1)); b.getContext('2d').drawImage(a, 0, 0, b.width, b.height);
  const o = mk(w, h), ox = o.getContext('2d'); ox.imageSmoothingQuality = 'high'; ox.drawImage(b, 0, 0, w, h);
  return o;
}

const TREE = {};

function crownShape(x, y) {
  return Math.max(ellD(x, y, -200, -1020, 1040, 360), ellD(x, y, -760, -790, 560, 250), ellD(x, y, 420, -820, 470, 260),
    ellD(x, y, -1110, -640, 270, 190), ellD(x, y, 780, -660, 230, 170), ellD(x, y, -330, -712, 600, 140), ellD(x, y, 170, -730, 430, 150)) + 0.08 * vnoise(x, y);
}
function* findGen() {
  const canopy = yield* crownGen({ x0: -1420, y0: -1420, w: 2480, h: 1100, res: clamp(S0 * 0.9, 0.9, 1.6), seed: 11, inside: crownShape, n: 1500, size: 0.95, young: 0.03, mass: 0.06 });

  const ceil = (x, y) => clamp((-y - 840 - 70 * vnoise(x * 1.3, 40) - 80 * Math.sin(x * 0.0052 + 1.3)) / 110, -1, 1);
  const ceiling = yield* crownGen({ x0: -1100, y0: -1560, w: 2200, h: 1000, res: clamp(S0 * 0.75, 0.8, 1.3), seed: 5, inside: ceil, n: 1000, size: 1.2, sun: [0.5, 0.86], pal: 'back', mass: 0.04,
    light: (x, y) => -0.46 + 0.46 * sstep(-300, 900, x) });

  const bok = (x, y) => ellD(x, y, 0, 0, 760, 600) + 0.12 * vnoise(x * 2, y * 2);
  const bk = yield* crownGen({ x0: -800, y0: -640, w: 1600, h: 1280, res: 0.2, seed: 3, inside: bok, n: 380, size: 1.35, sun: [0.7, -0.7] });
  yield;
  TREE.ceiling = ceiling;
  TREE.bokeh = { c: softBlur(bk.c, 2.4), x0: bk.x0, y0: bk.y0, w: bk.w, h: bk.h };
  TREE.canopy = canopy;
  CLUMP.sprites = null;
}
let FINDJOB = null, WARMCV = null, LASTREAL = -1e9;

const WARMUP = { steps: 0, k: 0, done: null };
const WARMED = new Promise(r => { WARMUP.done = () => { WARMUP.k = 1; r(true); }; });

const busy = () => window.LTWH_BUSY === true;
function buildFind() {
  if (TREE.canopy) return;
  if (!FINDJOB) FINDJOB = findGen();
  while (!FINDJOB.next().done);
  FINDJOB = null;
}
function buildFindSoon() {
  if (TREE.canopy || FINDJOB) return;
  FINDJOB = findGen();
  const tick = () => {
    if (!FINDJOB) return;
    const t0 = performance.now(), ms = busy() ? 3 : 10;
    try { while (performance.now() - t0 < ms) { WARMUP.k = Math.min(0.3, ++WARMUP.steps / 700 * 0.3); if (FINDJOB.next().done) { FINDJOB = null; WARMUP.k = 0.3; return; } } }
    catch (e) { console.warn('Cine: crown build', e); FINDJOB = null; WARMUP.done(); return; }
    setTimeout(tick, busy() ? 30 : 8);
  };
  setTimeout(tick, 8);
}

function buildHorizon() {
  if (TREE.horizon || !(window.Scene && Scene.drawBackground)) return;
  const W = 2000, top = -260, k = 0.3, c = mk(W * k, (H - top) * k), g = c.getContext('2d');
  g.setTransform(k, 0, 0, k, 0, -top * k);
  try { Scene.drawBackground(g, { dist: 15000, W, OY: -top, t: 2, progress: 0.32 }); } catch (e) { return; }
  const b = softBlur(c, 2.2), bx = b.getContext('2d');

  bx.globalCompositeOperation = 'source-atop'; bx.fillStyle = 'rgba(242,196,160,0.38)'; bx.fillRect(0, 0, b.width, b.height);
  bx.globalCompositeOperation = 'destination-in';
  const fg = bx.createLinearGradient(0, 0, 0, b.height);
  fg.addColorStop(0, 'rgba(0,0,0,0)'); fg.addColorStop(0.45, 'rgba(0,0,0,0)'); fg.addColorStop(0.72, 'rgba(0,0,0,0.9)'); fg.addColorStop(1, 'rgba(0,0,0,1)');
  bx.fillStyle = fg; bx.fillRect(0, 0, b.width, b.height);
  TREE.horizon = { c: b, x0: 0, y0: top, w: W, h: H - top };
}
const FIND = { stop: 1.25, cutB: 1.72, cutC: 3.55, tilt: [0.4, 1.45], cap: 4.45, card: 6.4 };
function findStopTravel(t) { const T = FIND.stop, v0 = 430; return t >= T ? v0 * T / 3 : v0 * T / 3 * (1 - Math.pow(1 - t / T, 3)); }
const HERO_A = { x: -368, y: -640 };
const HANG_A = [[-1060, -500, 'verde', 1], [-900, -560, 'erizo', 1.05], [-700, -560, 'mangonada', 1], [-560, -600, 'erizo', 0.95], [-200, -610, 'verde', 1],
  [-80, -640, 'erizo', 0.9], [110, -620, 'mangonada', 1], [330, -610, 'verde', 1.05], [560, -600, 'erizo', 1], [760, -540, 'erizo', 1]];
function sky(ctx, x0, y0, x1, y1, stops) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  for (const [o, c] of stops) g.addColorStop(o, c);
  ctx.fillStyle = g; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
}
function sunGlow(ctx, x, y, r, a) {
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = a; ctx.drawImage(GEN.glow, x - r, y - r, r * 2, r * 2);
  ctx.globalAlpha = a * 0.85; ctx.drawImage(GEN.soft, x - r * 0.15, y - r * 0.15, r * 0.3, r * 0.3);
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
}
function rays(ctx, x, y, len, ang0, ang1, n, a, T) {
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const u = (i + 0.5) / n, ang = lerp(ang0, ang1, u) + Math.sin(T * 0.4 + i * 1.7) * 0.012, w = 0.02 + hash(i * 3.1) * 0.03;
    const l = len * (0.6 + hash(i * 7.7) * 0.4);
    const g = ctx.createLinearGradient(x, y, x + Math.cos(ang) * l, y + Math.sin(ang) * l);
    g.addColorStop(0, 'rgba(255,214,150,0)'); g.addColorStop(0.18, 'rgba(255,214,150,' + (a * (0.45 + 0.55 * hash(i))).toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,190,130,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(ang - w) * l, y + Math.sin(ang - w) * l); ctx.lineTo(x + Math.cos(ang + w) * l, y + Math.sin(ang + w) * l); ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';
}
function motes(ctx, x0, y0, x1, y1, n, T, a, seed) {
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const hx = hash(i * 1.37 + seed), hy = hash(i * 2.71 + seed), hz = hash(i * 5.13 + seed);
    const x = x0 + ((hx * (x1 - x0) + T * (6 + hz * 10)) % (x1 - x0)), y = y0 + ((hy * (y1 - y0) - T * (3 + hz * 6) + (y1 - y0) * 4) % (y1 - y0));
    const r = 1.1 + hz * 2.4, tw = 0.5 + 0.5 * Math.sin(T * (1 + hz * 2) + i);
    ctx.globalAlpha = a * tw; ctx.drawImage(GEN.soft, x - r * 2, y - r * 2, r * 4, r * 4);
  }
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
}
function flare(ctx, sx, sy, cx, cy, a) {
  ctx.globalCompositeOperation = 'lighter';
  const G = [[0.35, 26, 'cream'], [0.62, 14, 'gold'], [0.95, 40, 'lime'], [1.3, 22, 'gold'], [1.62, 60, 'cream']];
  for (const [k, r, c] of G) { const x = lerp(sx, cx, k), y = lerp(sy, cy, k); ctx.globalAlpha = a * 0.22; ctx.drawImage(GEN.bok[c], x - r, y - r, r * 2, r * 2); }
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
}
function fallbackBackdrop(ctx, x0, y0, x1, y1) {
  sky(ctx, x0, y0, x1, GROUND, [[0, '#4E5290'], [0.55, '#D49AA0'], [0.85, '#F4AE7C'], [1, '#FBE2B0']]);
  ctx.fillStyle = '#D9CDB6'; ctx.fillRect(x0, GROUND, x1 - x0, 44); ctx.fillStyle = '#B8AA92'; ctx.fillRect(x0, GROUND + 44, x1 - x0, 6);
  ctx.fillStyle = '#34303A'; ctx.fillRect(x0, GROUND + 50, x1 - x0, Math.max(10, y1 - GROUND - 50));
}

function findA(ctx, v, t, T) {
  const rx = v.W * 0.28, travel = findStopTravel(t), total = findStopTravel(9);
  const tx = rx + 430 + (total - travel);
  const cam0 = { cx: v.W / 2, cy: (H - v.OY) / 2, z: 1 };
  const cam1 = fit(v, [rx - 300, -560, 1150, 1030], [rx - 160, -780, 600, 1250]);
  const mx = tx + HERO_A.x, my = GROUND + HERO_A.y + 128 * 0.36 + 70 * 0.36;
  const cam2 = { cx: mx, cy: my, z: Math.max(cam1.z * 2.2, 1.1) };
  let cam = lerpCam(cam0, cam1, eio(seg(t, 0, 1.35)));
  if (t > 1.28) cam = lerpCam(cam, cam2, ein(seg(t, 1.28, FIND.cutB)) * 0.7);
  ctx.save();
  camApply(ctx, v, cam);
  const vw = camView(v, cam);

  const pad = 420, wide = camView(v, cam1), Wc = Math.ceil(Math.max(v.W, wide.x1 - wide.x0) + pad * 2), x0c = Math.min(0, wide.x0) - pad;
  const OYc = Math.ceil(Math.max(v.OY, -wide.y0) + 600);
  if (window.Scene && Scene.drawBackground) {
    ctx.save(); ctx.translate(x0c, 0);
    Scene.drawBackground(ctx, { dist: 9000 + travel + x0c, W: Wc, OY: OYc, t: T, progress: 0.3 });
    ctx.restore();
  } else fallbackBackdrop(ctx, vw.x0, vw.y0, vw.x1, vw.y1);

  ctx.save(); ctx.translate(tx, GROUND);
  art(ctx, 'tree_trunk', 0, 0, 1);
  drawTex(ctx, TREE.canopy, 0, 0, 1);
  rays(ctx, 640, -1240, 1700, 2.25, 2.8, 9, 0.11, T);
  for (const [hx, hy, ripe, sc] of HANG_A) {
    hangStem(ctx, hx, hy - 60, hx, hy - 8, 1.6);
    if (window.Props && Props.drawMango) Props.drawMango(ctx, hx, hy + 18, ripe, { t: T, hanging: true, seed: hx, scale: sc * 1.1 });
  }
  ctx.save(); ctx.translate(HERO_A.x, HERO_A.y); ctx.rotate(Math.sin(T * 1.3) * 0.035 + Math.sin(T * 2.7) * 0.01);
  const pulse = 0.7 + 0.3 * Math.sin(T * 3.2);
  ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.55 * pulse;
  ctx.drawImage(GEN.glow, -80, 20, 160, 160); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  art(ctx, 'hero_mango', 0, 0, 0.36);
  ctx.restore();
  ctx.restore();

  const posed = runnerHasPose('lookUp');
  if (!posed && t > FIND.stop - 0.12 && RIG_OK) rigDraw(ctx, blendPose(POSES.stand, POSES.lookUp, sstep(FIND.stop, FIND.stop + 0.35, t)), rx, GROUND, null, {});
  else runnerAt(ctx, 'cine-find', (u, TT) => findRunner(u, TT, rx, posed), t, T, 0);
  ctx.restore();

  ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.14; ctx.drawImage(GEN.glow, v.W * 0.5, -v.OY - 120, v.W, v.VH);
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
}
function findRunner(t, T, rx, posed) {
  const T0 = FIND.stop, runPh = (t < T0 ? (t * 2.3 - t * t * 0.55) : (T0 * 2.3 - T0 * T0 * 0.55)) * Math.PI;
  const s = { x: rx, ground: GROUND, h: 0, phase: runPh, pace: lerp(0.65, 0, seg(t, 0, T0)), speed: t < T0 ? 430 * Math.pow(1 - t / T0, 2) : 0,
    beatInterval: lerp(0.46, 0.7, seg(t, 0, T0)), air: false, vy: 0, stumble: 0, t: T, key: 'cine-find' };
  if (posed && t > T0 - 0.12) { s.pose = t > T0 + 0.12 ? 'lookUp' : 'stand'; s.poseT = Math.max(0, t - (s.pose === 'lookUp' ? T0 + 0.12 : T0 - 0.12)); }
  return s;
}
function hangStem(ctx, x0, y0, x1, y1, w) {
  ctx.strokeStyle = '#5E4A26'; ctx.lineWidth = w || 2.2; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(x0 - 4, (y0 + y1) / 2, x1, y1); ctx.stroke();
}

const LEAVES_B = [
  ['leaf_shade_a', 40, -6, 2.5, 1.08], ['leaf_shade_b', 44, -2, 1.98, 1.0], ['leaf_sun_a', 38, -2, 2.95, 1.0], ['leaf_back_b', 42, -4, 0.38, 1.12],
  ['leaf_back_a', 46, -8, -0.22, 1.18], ['leaf_young_a', 40, -10, -0.95, 0.95], ['leaf_back_a', 40, 0, 0.98, 1.06], ['leaf_shade_a', 36, 4, 1.58, 0.95],
  ['leaf_back_b', 30, -12, -1.62, 0.82]];
function findB(ctx, v, t, T) {
  const lt = t - FIND.cutB;
  const base = fit(v, [-205, 18, 410, 330], [-172, -20, 344, 410]);
  const settle = eout(seg(lt, 0, 0.8));
  const cam = { cx: base.cx + 6 * Math.sin(T * 0.5), cy: base.cy + (1 - settle) * 300 / base.z, z: base.z * lerp(0.93, 1.1, eio(seg(lt, 0, FIND.cutC - FIND.cutB))) };
  ctx.save();
  camApply(ctx, v, cam);
  const vw = camView(v, cam);

  sky(ctx, vw.x0 - 10, vw.y0 - 10, vw.x1 + 10, vw.y1 + 10, [[0, '#33452A'], [0.45, '#2A3A22'], [1, '#1A281A']]);
  ctx.save(); ctx.translate(cam.cx * 0.45, cam.cy * 0.45); drawTex(ctx, TREE.bokeh, 0, 40, 1.3); ctx.restore();

  const sx = lerp(vw.x0, vw.x1, 0.86), sy = lerp(vw.y0, vw.y1, 0.1);
  sunGlow(ctx, sx, sy, 380, 0.75);
  rays(ctx, sx, sy, 900, 1.95, 2.75, 12, 0.13, T);

  ctx.globalCompositeOperation = 'lighter';
  const BK = ['gold', 'lime', 'cream', 'gold', 'amber'];
  for (let i = 0; i < 34; i++) {
    const u = hash(i * 2.3), w = hash(i * 4.1);
    const bx = lerp(vw.x0, vw.x1, 0.15 + 0.9 * Math.sqrt(u)) + cam.cx * 0.08, by = lerp(vw.y0, vw.y1, 0.75 * w * w), r = (9 + hash(i * 6.7) * 30) / Math.sqrt(cam.z);
    const near = 1 - Math.min(1, Math.hypot(bx - sx, by - sy) / ((vw.x1 - vw.x0) * 0.7));
    ctx.globalAlpha = (0.1 + 0.5 * near) * (0.75 + 0.25 * Math.sin(T * 0.8 + i));
    ctx.drawImage(GEN.bok[BK[i % 5]], bx - r, by - r, r * 2, r * 2);
  }
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;

  ctx.lineCap = 'round';
  ctx.strokeStyle = '#3E3122'; ctx.lineWidth = 15; ctx.beginPath(); ctx.moveTo(-640, -160); ctx.quadraticCurveTo(-260, -40, 40, -4); ctx.stroke();
  ctx.strokeStyle = '#5E4A33'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(-640, -166); ctx.quadraticCurveTo(-260, -46, 40, -8); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,214,150,0.6)'; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(-620, -170); ctx.quadraticCurveTo(-250, -52, 38, -12); ctx.stroke();
  for (let i = 0; i < LEAVES_B.length; i++) {
    const [nm, lx, ly, la, ls] = LEAVES_B[i];
    ctx.save(); ctx.translate(lx, ly); ctx.rotate(la + Math.sin(T * 1.1 + i * 1.3) * 0.022); art(ctx, nm, 0, 0, ls); ctx.restore();
  }

  const sw = Math.sin(T * 1.15) * 0.035 + Math.sin(T * 2.6 + 1) * 0.01;
  ctx.save(); ctx.rotate(sw);
  ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.32; ctx.drawImage(GEN.glow, -180, 60, 360, 360);
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  art(ctx, 'hero_mango', 0, 0, 1);
  const gk = seg(lt, 0.95, 1.7), gl = Math.sin(gk * Math.PI);
  if (gl > 0.01) {
    const z = 50 * gl;
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = gl;
    ctx.translate(46, 160); ctx.rotate(gk * 0.8); ctx.drawImage(GEN.spark, -z, -z, z * 2, z * 2);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  }
  ctx.restore();
  motes(ctx, vw.x0, vw.y0, vw.x1, vw.y1, 34, T, 0.55, 1);
  ctx.restore();

  const d = Math.sin(T * 0.6) * 6;
  ctx.save(); ctx.translate(-30 + d, H - barH(v) - 20); ctx.rotate(-0.55); art(ctx, 'leaf_fg', 0, 0, lerp(2.0, 1.6, portraitness(v)), 0.95); ctx.restore();
  ctx.save(); ctx.translate(v.W + 40 - d, -v.OY + barH(v) + 40); ctx.rotate(2.75); art(ctx, 'leaf_fg', 0, 0, lerp(1.8, 1.4, portraitness(v)), 0.9); ctx.restore();
}

const HERO = { s0: 3.0, H0: 200 };
const heroMap = { p: (x, y) => { const h = Math.max(-HERO.H0 * 0.6, -y), k = 1 + h / HERO.H0; return [x * HERO.s0 / k, -HERO.s0 * HERO.H0 * Math.log(k)]; },
  J: (x, y) => { const h = Math.max(-HERO.H0 * 0.6, -y), k = 1 + h / HERO.H0, s = HERO.s0 / k; return [s, 0, x * HERO.s0 / (HERO.H0 * k * k), s]; } };
const HERO_POSE = { lean: -0.05, head: -0.55, hip: 198, feet: [-46, 30], far: [-0.12, 0.22, 0.08, 0], near: [0.04, 0.3, 0.06, 0] };
const HERO_REACH = { near: [2.55, 0.22, 0.12, 1] };
function trunkLow(ctx, T) {
  const pts = [], L = [], R = [];
  for (let i = 0; i <= 16; i++) { const h = i / 16 * 1100, w = lerp(95, 60, i / 16), xc = -470 + 40 * Math.sin(i * 0.4); L.push(heroMap.p(xc - w, -h)); R.push(heroMap.p(xc + w, -h)); }
  const path = () => { ctx.beginPath(); ctx.moveTo(L[0][0], L[0][1]); for (const q of L) ctx.lineTo(q[0], q[1]); for (let i = R.length - 1; i >= 0; i--) ctx.lineTo(R[i][0], R[i][1]); ctx.closePath(); };
  const g = ctx.createLinearGradient(L[8][0], 0, R[8][0], 0);
  g.addColorStop(0, '#231C2C'); g.addColorStop(0.55, '#4A3836'); g.addColorStop(0.9, '#8E6A50'); g.addColorStop(1, '#D8A672');
  path(); ctx.fillStyle = g; ctx.fill();
  ctx.save(); path(); ctx.clip();
  ctx.strokeStyle = 'rgba(20,14,22,0.35)'; ctx.lineWidth = 3;
  for (let k = 0; k < 9; k++) {
    const off = (k / 8 - 0.5) * 1.6; ctx.beginPath();
    for (let i = 0; i <= 16; i++) { const h = i / 16 * 1100, w = lerp(95, 60, i / 16), xc = -470 + 40 * Math.sin(i * 0.4) + off * w + 6 * Math.sin(i * 1.7 + k); const q = heroMap.p(xc, -h); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }
    ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,212,150,0.7)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(R[0][0], R[0][1]); for (const q of R) ctx.lineTo(q[0] - 2, q[1]); ctx.stroke();
}
function findC(ctx, v, t, T) {
  buildHorizon();
  const lt = t - FIND.cutC, p = portraitness(v);
  const mangoH = 620, [mX, mY] = heroMap.p(250, -mangoH);

  let cam;
  if (p < 0.5) {
    const shoes = fit(v, [-300, -330, 690, 380], [-300, -330, 690, 380]), up = fit(v, [-330, -965, 720, 575], [-330, -965, 720, 575]);
    cam = lerpCam(shoes, up, eio(seg(lt, FIND.tilt[0], FIND.tilt[1])));
  } else {
    const all = fit(v, [-310, -1070, 650, 1330], [-310, -1070, 650, 1330]);
    cam = lerpCam(all, Object.assign({}, all, { z: all.z * 1.05, cy: all.cy - 20 }), eio(seg(lt, 0, 3.4)));
  }
  ctx.save();
  camApply(ctx, v, cam);
  const vw = camView(v, cam);

  sky(ctx, vw.x0 - 10, vw.y0 - 10, vw.x1 + 10, 40, [[0, '#6F64A0'], [0.32, '#B693B4'], [0.68, '#F0B489'], [1, '#FCE2B0']]);
  const sunX = 640, sunY = -520;
  sunGlow(ctx, sunX, sunY, 820, 0.9);

  if (TREE.horizon) {
    const hs = 0.5, hw = TREE.horizon.w * hs;
    for (let x = Math.floor((vw.x0 + 300) / hw) * hw - 300; x < vw.x1; x += hw) drawTex(ctx, TREE.horizon, x, -GROUND * hs + 4, hs, 0.9);
  }
  trunkLow(ctx, T);
  drawTex(ctx, TREE.ceiling, 0, 0, 1);
  rays(ctx, sunX, sunY, 1500, 2.3, 3.15, 11, 0.11, T);

  ctx.save(); ctx.translate(mX, mY - 128 * 0.8); ctx.rotate(Math.sin(T * 1.2) * 0.04);
  ctx.strokeStyle = '#4A3A22'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -150); ctx.lineTo(0, 4); ctx.stroke();
  ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.6 + 0.2 * Math.sin(T * 3); ctx.drawImage(GEN.glow, -130, 60, 260, 260);
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  art(ctx, 'hero_mango', 0, 0, 0.8);
  ctx.restore();

  const gg = ctx.createLinearGradient(0, 0, 0, 520);
  gg.addColorStop(0, '#E2C8A0'); gg.addColorStop(0.05, '#C9AC8C'); gg.addColorStop(0.4, '#9C8070'); gg.addColorStop(1, '#5E4C52');
  ctx.fillStyle = gg; ctx.fillRect(vw.x0 - 10, 0, vw.x1 - vw.x0 + 20, 560);
  ctx.strokeStyle = 'rgba(64,44,52,0.32)'; ctx.lineWidth = 2.2;
  for (let i = -8; i <= 8; i++) { ctx.beginPath(); ctx.moveTo(i * 46, 0); ctx.lineTo(i * 520, 560); ctx.stroke(); }
  for (const y of [70, 210]) { ctx.beginPath(); ctx.moveTo(vw.x0 - 10, y); ctx.lineTo(vw.x1 + 10, y); ctx.stroke(); }

  ctx.globalAlpha = 0.42; ctx.fillStyle = '#3A2838';
  ctx.beginPath(); ctx.moveTo(-60, 2); ctx.lineTo(90, 2); ctx.lineTo(-420, 560); ctx.lineTo(-980, 560); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;

  for (const [lx, ly, la, ls, nm] of [[-430, 30, 0.3, 0.75, 'leaf_shade_b'], [360, 34, 2.6, 0.8, 'leaf_sun_a'], [-330, 52, -0.4, 0.9, 'leaf_young_a']]) {
    ctx.save(); ctx.translate(lx, ly); ctx.scale(1, 0.3); ctx.rotate(la); art(ctx, nm, 0, 0, ls, 0.85); ctx.restore();
  }
  ctx.fillStyle = 'rgba(255,226,180,0.22)'; ctx.fillRect(vw.x0 - 10, -2, vw.x1 - vw.x0 + 20, 5);

  ctx.globalAlpha = 0.5; ctx.drawImage(GEN.dark, -330, -16, 640, 44); ctx.globalAlpha = 1;
  const rk = eio(seg(lt, p < 0.5 ? 1.25 : 0.8, p < 0.5 ? 2.15 : 1.75));
  let P = Object.assign({}, HERO_POSE); P.near = HERO_POSE.near.map((x, i) => lerp(x, HERO_REACH.near[i], rk));
  P = breathe(P, T);
  rigDraw(ctx, P, 0, 0, heroMap, {});
  flare(ctx, sunX, sunY, cam.cx, cam.cy, 0.9);
  ctx.restore();
  motes(ctx, 0, -v.OY, v.W, H, 26, T, 0.45, 7);
}
function drawFind(ctx, v, t, T) {
  buildFind();
  if (t < FIND.cutB) findA(ctx, v, t, T);
  else if (t < FIND.cutC) findB(ctx, v, t, T);
  else findC(ctx, v, t, T);
  finish(ctx, v, T);
  caption(ctx, v, 'Gold, just sitting there in our neighborhoods.', t - FIND.cap, { fadeOut: FIND.card - 0.1 - FIND.cap });
  bars(ctx, v, seg(t, 0, 0.7));
  if (t > FIND.card) drawCard(ctx, 'THE PICK', 'Fill the bag', 0.5 * seg(t, FIND.card, FIND.card + 0.8), v);
}

let PEOPLE = null;
const PSCALE = 0.92;
async function loadPeople() {
  const B = base();
  try { const r = await fetch(B + 'cine/art/people.json'); if (r.ok) PEOPLE = await r.json(); } catch (e) { PEOPLE = null; }
  if (!PEOPLE) return;
  await Promise.all(Object.keys(PEOPLE).map(n => loadImage(B + 'cine/art/' + n + '.svg').then(im => register(n, im, PEOPLE[n].box))));
}
function pj(name, j) { const p = PEOPLE && PEOPLE[name]; return p && p.j[j] ? p.j[j] : [0, 0]; }

function arm2(ctx, pre, sh, a, e, upLen) {
  ctx.save(); ctx.translate(sh[0], sh[1]); ctx.rotate(a);
  art(ctx, pre + '_up', 0, 0, 1);
  ctx.translate(0, upLen); ctx.rotate(e);
  art(ctx, pre + '_lo', 0, 0, 1);
  ctx.restore();
}
function headX(ctx, names, x, y, ang, k) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  if (k < 1) art(ctx, names[0], 0, 0, 1);
  if (k > 0 && ART[names[1]]) art(ctx, names[1], 0, 0, 1, k);
  ctx.restore();
}
function drawFriend(ctx, x, y, P, T) {
  if (!ART.fr_body) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(PSCALE, PSCALE);
  const b = Math.sin(T * 1.9) * 0.6;
  const shF = pj('fr_body', 'shoulderF'), shN = pj('fr_body', 'shoulderN'), nk = pj('fr_body', 'neck');
  ctx.save(); ctx.translate(0, b * 0.3);
  ctx.save(); ctx.translate(shF[0], shF[1]); ctx.rotate(P.armF[0]); art(ctx, 'fr_up_far', 0, 0, 1); ctx.translate(0, 66); ctx.rotate(P.armF[1]); art(ctx, 'fr_lo_far', 0, 0, 1); ctx.restore();
  art(ctx, 'fr_body', 0, 0, 1);
  headX(ctx, ['fr_head', 'fr_head_smile'], nk[0], nk[1] + b * 0.4, P.nod || 0, P.smile || 0);
  ctx.save(); ctx.translate(shN[0], shN[1]); ctx.rotate(P.armN[0]); art(ctx, 'fr_up', 0, 0, 1); ctx.translate(0, 66); ctx.rotate(P.armN[1]); art(ctx, 'fr_lo', 0, 0, 1); ctx.restore();
  ctx.restore();
  ctx.restore();
}

function drawAbuela(ctx, x, y, P, T) {
  if (!ART.ab_body) return;
  const b = Math.sin(T * 1.6 + 1) * 0.5, h = eio(P.heart || 0);
  const sh = pj('ab_body', 'shoulderN'), nk = pj('ab_body', 'neck');
  ctx.save(); ctx.translate(x, y); ctx.scale(PSCALE, PSCALE);
  art(ctx, 'ab_body', 0, 0, 1);
  headX(ctx, ['ab_head', 'ab_head_smile'], nk[0], nk[1] + b * 0.3, -0.04 + (P.nod || 0) + 0.05 * h, P.smile || 0);
  ctx.save(); ctx.translate(sh[0], sh[1]); ctx.rotate(lerp(0.12, 0.5, h)); art(ctx, 'ab_up', 0, 0, 1);
  ctx.translate(0, 58); ctx.rotate(lerp(1.25, 2.15, h)); ctx.scale(1, lerp(0.52, 0.72, h)); art(ctx, 'ab_lo', 0, 0, 1);
  ctx.restore();
  ctx.restore();
}

function drawKid(ctx, x, y, P, T) {
  if (!ART.kd_body) return;
  const r = eio(P.reach || 0), hd = eio(P.hold || 0), hop = P.hop || 0;
  const shN = pj('kd_body', 'shoulderN'), shF = pj('kd_body', 'shoulderF'), nk = pj('kd_body', 'neck');
  ctx.save(); ctx.translate(x, y - hop); ctx.scale(P.flip ? -PSCALE : PSCALE, PSCALE);
  const aF = lerp(lerp(0.06, 2.55, r), 0.95, hd), aN = lerp(lerp(-0.04, 2.7, r), 0.8, hd);
  ctx.save(); ctx.translate(shF[0], shF[1]); ctx.rotate(aF); art(ctx, 'kd_arm_far', 0, 0, 1); ctx.restore();
  art(ctx, 'kd_body', 0, 0, 1);
  headX(ctx, ['kd_head', 'kd_head_joy'], nk[0], nk[1], lerp(0.04, 0.32, r) * (1 - hd) - 0.06 * hd + (P.look || 0), P.joy || 0);
  if (P.between) P.between(ctx);
  ctx.save(); ctx.translate(shN[0], shN[1]); ctx.rotate(aN); art(ctx, 'kd_arm', 0, 0, 1); ctx.restore();
  ctx.restore();
}
function debugPeople(ctx, v, t, T) {
  sky(ctx, -2, -v.OY - 2, v.W + 4, H + 2, [[0, '#1C1838'], [0.6, '#4A3B6A'], [1, '#875672']]);
  ctx.fillStyle = '#6E6070'; ctx.fillRect(0, GROUND, v.W, 120);
  const k = 0.5 + 0.5 * Math.sin(T * 2), Q = new URLSearchParams(location.search), zoom = Number(Q.get('pz') || 1), fx = Number(Q.get('px') || v.W / 2), fy = Number(Q.get('py') || (H - v.OY) / 2);
  ctx.save(); ctx.translate(v.W / 2, (H - v.OY) / 2); ctx.scale(zoom, zoom); ctx.translate(-fx, -fy);
  drawFriend(ctx, v.W * 0.2, GROUND, { armN: [0.08, 0.15], armF: [-0.05, 0.12], nod: 0, smile: 0 }, T);
  drawFriend(ctx, v.W * 0.42, GROUND, { armN: [0.95, 1.25 + 0.3 * k], armF: [0.85, 1.35 + 0.3 * k], nod: -0.06 * k, smile: 1 }, T);
  if (typeof drawAbuela === 'function') { drawAbuela(ctx, v.W * 0.62, GROUND, { smile: 0, heart: 0 }, T); drawAbuela(ctx, v.W * 0.74, GROUND, { smile: 1, heart: 1 }, T); }
  if (typeof drawKid === 'function') { drawKid(ctx, v.W * 0.84, GROUND, { reach: 0, joy: 0 }, T); drawKid(ctx, v.W * 0.94, GROUND, { reach: 1, joy: 1 }, T); }
  ctx.restore();
}
function placeholderSet(ctx, v, label, top, bottom) {
  const g = ctx.createLinearGradient(0, -v.OY, 0, H);
  g.addColorStop(0, top); g.addColorStop(1, bottom);
  ctx.fillStyle = g; ctx.fillRect(-2, -v.OY - 2, v.W + 4, v.VH + 4);
  font(ctx, FONT.serif, 26); ctx.fillStyle = 'rgba(255,246,229,0.6)'; ctx.textAlign = 'center'; ctx.fillText(label, v.W / 2, (H - v.OY) / 2);
}

const PLATES = {};
function scenePlate(key, o) {
  if (PLATES[key]) return PLATES[key];
  if (!(window.Scene && Scene.drawBackground)) return null;
  const W = o.W || 1600, top = o.top || -500, k = o.k || 0.35, c = mk(W * k, (H - top) * k), g = c.getContext('2d');
  g.setTransform(k, 0, 0, k, 0, -top * k);
  try {
    Scene.drawBackground(g, { dist: o.dist || 12000, W, OY: -top, t: o.t || 3, progress: o.p });
    if (o.post) o.post(g, W, top);
  } catch (e) { return null; }
  g.setTransform(1, 0, 0, 1, 0, 0);
  const b = softBlur(c, o.blur || 2.6);
  if (o.haze) { const bx = b.getContext('2d'); bx.globalCompositeOperation = 'source-atop'; bx.fillStyle = o.haze; bx.fillRect(0, 0, b.width, b.height); }
  return (PLATES[key] = { c: b, x0: 0, y0: top, w: W, h: H - top });
}
function drawPlate(ctx, pl, cx, groundY, s, a) {
  if (!pl) return false;
  drawTex(ctx, pl, cx - pl.w * s / 2, groundY - GROUND * s, s, a);
  return true;
}
const BAGGED = { sink: [0.42, 0.86], flip: [0.6, 1.02], hand: [0.92, 1.26], lift: [1.34, 2.02], cut: 2.02, cap: 2.5, card: 4.25 };

const BAG_SLOTS = [[-4, -452, 0.08, 1.12], [-82, -428, -0.42, 1.0], [76, -430, 0.46, 1.02], [-120, -398, -0.8, 0.92], [122, -402, 0.85, 0.94],
  [-38, -410, -0.16, 0.98], [44, -408, 0.24, 0.97]];
function bagFruit(v) {
  const r = v.bag.ripe || {}, list = [];
  for (const k of ['gold', 'mangonada', 'erizo', 'verde']) for (let i = 0; i < (r[k] || 0); i++) list.push(k);
  while (list.length < v.bag.count) list.push('erizo');
  const n = clamp(Math.round(v.bag.count * 0.62), v.bag.count > 0 ? 1 : 0, 7);

  const out = [], rest = list.filter(k => k !== 'gold');
  if (list.includes('gold')) out.push('gold');
  while (out.length < n && rest.length) out.push(rest.splice(out.length % 2 ? rest.length - 1 : 0, 1)[0]);
  return out;
}
function mangoArt(ripe, i) { const nm = 'pm_' + ripe + '_' + (i % 3); return ART[nm] ? nm : null; }
const FB_RIPE = { verde: ['#9CC24A', '#3E6B1F'], erizo: ['#F7B733', '#D9562A'], mangonada: ['#F0573B', '#8E1E1E'], gold: ['#FFE89A', '#D9A21B'] };
function fallbackMango(ctx, ripe, s) {
  const c = FB_RIPE[ripe] || FB_RIPE.erizo, g = ctx.createRadialGradient(-6 * s, -6 * s, 2 * s, 0, 0, 26 * s);
  g.addColorStop(0, c[0]); g.addColorStop(1, c[1]);
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, 26 * s, 20 * s, -0.3, 0, TAU); ctx.fill();
}

function miniBag(ctx, x, y, fill, s) {
  if (!ART.bag_body) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.translate(0, 300 + 6);
  art(ctx, 'bag_body', 0, 0, 1);
  ctx.save(); ctx.translate(0, -300); ctx.scale(1, -1); ctx.translate(0, 300); art(ctx, 'bag_flapin', 0, 0, 1); ctx.restore();
  ctx.save(); ctx.translate(18, -150); ctx.rotate(-0.05); art(ctx, 'bag_note', 0, 0, 1); ctx.restore();
  ctx.restore();
}
function carriedBag(ctx, x, y, v, T, o) {
  o = o || {};
  if (window.Props && typeof Props.drawBagCarry === 'function') Props.drawBagCarry(ctx, x, y, v.bag.count, T, { ripes: ripesList(v), scale: o.scale || 1.2, swing: o.swing || 0 });
  else miniBag(ctx, x, y, v.bag.count, 0.2 * (o.scale || 1.2));
}
function drawHeroBag(ctx, v, T, st) {

  const fruit = bagFruit(v), full = clamp(v.bag.count / 12, 0, 1);
  ctx.save();
  ctx.translate(0, -st.lift);
  if (st.swing) { ctx.translate(20, -300); ctx.rotate(st.swing); ctx.translate(-20, 300); }
  const sy = Math.cos(st.flip * Math.PI);

  if (sy > 0) { ctx.save(); ctx.translate(0, -300); ctx.scale(1 - 0.04 * st.flip, sy); ctx.translate(0, 300); art(ctx, 'bag_back', 0, 0, 1); ctx.restore(); }

  const lvl = lerp(70, 0, full) + st.sink * 200;
  for (let i = st.flip > 0.45 ? -1 : fruit.length - 1; i >= 0; i--) {
    const s = BAG_SLOTS[i], nm = mangoArt(fruit[i], i);
    ctx.save(); ctx.translate(s[0] * (1 - 0.06 * st.pinch), s[1] + lvl + (i > 2 ? 10 : 0)); ctx.rotate(s[2] + Math.sin(T * 2 + i) * 0.01);
    if (fruit[i] === 'gold' && st.sink < 0.9) {
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.45 * (1 - st.sink);
      ctx.drawImage(GEN.glow, -110, -110, 220, 220); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    }
    if (nm) art(ctx, nm, 0, 0, 2.25 * s[3]); else fallbackMango(ctx, fruit[i], 2.25 * s[3]);
    ctx.restore();
  }

  art(ctx, 'bag_body', 0, 0, 1);

  ctx.save(); ctx.translate(18, -150); ctx.rotate(-0.05);
  art(ctx, 'bag_note', 0, 0, 1);
  const wm = brandTinted('wordmark', '#2B2018');
  if (wm) art(ctx, wm, -70, -22, 140 / 1400);
  ctx.restore();

  ctx.save(); ctx.translate(0, -300); ctx.scale(1 - 0.06 * st.pinch, sy); ctx.translate(0, 300);
  art(ctx, sy >= 0 ? 'bag_flap' : 'bag_flapin', 0, 0, 1);
  ctx.restore();
  if (st.flip > 0.92) {
    ctx.fillStyle = 'rgba(255,224,170,' + (0.6 * seg(st.flip, 0.92, 1)).toFixed(3) + ')'; ctx.fillRect(-150, -302, 300, 3);
  }
  ctx.restore();
}
function drawHandGrip(ctx, x, y, ang, s) {
  if (!ART.rp_forearm || !ART.rp_fist) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
  art(ctx, 'rp_forearm', 0, -56, 1);
  art(ctx, 'rp_fist', 0, 0, 1);
  ctx.restore();
}
function coralLedge(ctx, x0, x1) {

  let g = ctx.createLinearGradient(0, -10, 0, 8);
  g.addColorStop(0, '#B79E84'); g.addColorStop(1, '#EAD6B6');
  ctx.fillStyle = g; ctx.fillRect(x0, -10, x1 - x0, 18);
  g = ctx.createLinearGradient(0, 8, 0, 160);
  g.addColorStop(0, '#C8AE90'); g.addColorStop(0.3, '#A08670'); g.addColorStop(1, '#5A4648');
  ctx.fillStyle = g; ctx.fillRect(x0, 8, x1 - x0, 400);
  for (let i = 0; i < 140; i++) {
    const x = x0 + hash(i * 3.7 + 1) * (x1 - x0), y = 12 + Math.pow(hash(i * 5.3 + 2), 0.8) * 150, r = 1.5 + Math.pow(hash(i * 7.1), 2) * 9;
    ctx.fillStyle = 'rgba(52,36,40,' + (0.25 + 0.3 * hash(i)).toFixed(2) + ')'; ctx.beginPath(); ctx.ellipse(x, y, r, r * (0.5 + 0.4 * hash(i * 1.3)), hash(i * 2.2) * 3, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,232,196,0.3)'; ctx.beginPath(); ctx.ellipse(x + r * 0.5, y - r * 0.35, r * 0.45, r * 0.25, 0, 0, TAU); ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,236,204,0.55)'; ctx.fillRect(x0, 7, x1 - x0, 2);
  ctx.fillStyle = 'rgba(40,26,30,0.25)'; ctx.fillRect(x0, 9, x1 - x0, 5);
}

function baggedA(ctx, v, t, T) {
  const base = fit(v, [-300, -470, 600, 520], [-205, -505, 410, 560]);
  const cam = { cx: base.cx, cy: base.cy, z: base.z * lerp(1, 1.07, eio(seg(t, 0, BAGGED.cut))) };
  ctx.save(); camApply(ctx, v, cam);
  const vw = camView(v, cam);

  sky(ctx, vw.x0 - 10, vw.y0 - 10, vw.x1 + 10, vw.y1 + 10, [[0, '#7A5A86'], [0.5, '#E08A6A'], [1, '#F7C08A']]);
  const pl = scenePlate('late', { p: 0.48, dist: 14600, k: 0.3, blur: 3.2, top: -900, haze: 'rgba(236,160,120,0.3)' });
  if (pl) drawPlate(ctx, pl, cam.cx * 0.6, 260, 1.5, 1);
  sunGlow(ctx, vw.x1 - 120, vw.y0 + 160, 520, 0.6);
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 10; i++) {
    const r = 14 + hash(i * 6.1) * 34, x = lerp(vw.x0, vw.x1, hash(i * 2.9)), y = lerp(vw.y0, vw.y0 + (vw.y1 - vw.y0) * 0.6, hash(i * 4.3));
    ctx.globalAlpha = 0.18 + 0.2 * hash(i); ctx.drawImage(GEN.bok[['gold', 'amber', 'cream', 'pink'][i % 4]], x - r, y - r, r * 2, r * 2);
  }
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  coralLedge(ctx, vw.x0 - 10, vw.x1 + 10);

  const lk = ein(seg(t, BAGGED.lift[0], BAGGED.lift[1]));
  const heavy = 1 + clamp(v.bag.count / 12, 0, 1) * 0.6;
  const lift = Math.pow(lk, heavy) * 900;
  ctx.globalAlpha = 0.55 * (1 - seg(lift, 0, 160)); ctx.drawImage(GEN.dark, -230, -16, 420, 34); ctx.globalAlpha = 1;
  const st = { sink: eio(seg(t, BAGGED.sink[0], BAGGED.sink[1])), flip: eio(seg(t, BAGGED.flip[0], BAGGED.flip[1])), pinch: 0,
    lift, swing: lk > 0 ? Math.sin(t * 9) * 0.03 * (1 - lk) - 0.04 * lk : 0 };
  drawHeroBag(ctx, v, T, st);

  const hk = eout(seg(t, BAGGED.hand[0], BAGGED.hand[1]));
  if (hk > 0) drawHandGrip(ctx, 34 + (1 - hk) * 160, -300 - 46 - (1 - hk) * 330 - lift, 0.5 - 0.12 * (1 - hk), 3.1);
  motes(ctx, vw.x0, vw.y0, vw.x1, vw.y1, 20, T, 0.4, 3);
  ctx.restore();
}

function baggedB(ctx, v, t, T) {
  const lt = t - BAGGED.cut;
  const base = fit(v, [-300, -215, 900, 600], [-230, -230, 460, 650]);
  const cam = { cx: base.cx, cy: base.cy, z: base.z * lerp(1, 1.06, eio(seg(lt, 0, 3))) };
  ctx.save(); camApply(ctx, v, cam);
  const vw = camView(v, cam);
  sky(ctx, vw.x0 - 10, vw.y0 - 10, vw.x1 + 10, vw.y1 + 10, [[0, '#6A5288'], [0.55, '#E2906C'], [1, '#F6C48C']]);
  const pl = scenePlate('late', { p: 0.48, dist: 14600, k: 0.3, blur: 3.2, top: -900, haze: 'rgba(236,160,120,0.3)' });
  if (!drawPlate(ctx, pl, 40, GROUND, 1, 1)) fallbackBackdrop(ctx, vw.x0, vw.y0, vw.x1, vw.y1);

  ctx.save(); ctx.translate(560, GROUND); art(ctx, 'tree_trunk', 0, 0, 1); drawTex(ctx, TREE.canopy, 0, 0, 1); ctx.restore();

  ctx.fillStyle = '#D9C4A4'; ctx.fillRect(vw.x0 - 10, GROUND, vw.x1 - vw.x0 + 20, 44);
  ctx.fillStyle = 'rgba(80,56,60,0.25)'; for (let x = Math.floor(vw.x0 / 64) * 64; x < vw.x1; x += 64) ctx.fillRect(x, GROUND, 1.5, 44);
  ctx.fillStyle = '#B49A80'; ctx.fillRect(vw.x0 - 10, GROUND + 44, vw.x1 - vw.x0 + 20, 6);
  ctx.fillStyle = '#3C3440'; ctx.fillRect(vw.x0 - 10, GROUND + 50, vw.x1 - vw.x0 + 20, 400);
  sunGlow(ctx, 700, 120, 700, 0.35);

  const rl = ripesList(v), posed = runnerHasPose('stand') && window.Runner.features.carry;
  let a = null;
  if (posed) a = runnerAt(ctx, 'cine-bagged', (u, TT) => ({ x: 0, ground: GROUND, h: 0, phase: 0, pace: 0, speed: 0, beatInterval: 0.6, air: false, vy: 0, stumble: 0,
    t: TT, key: 'cine-bagged', pose: 'stand', poseT: 1.2 + (u - BAGGED.cut), carry: { fill: v.bag.count, ripes: rl, scale: 1.2 } }), t, T, BAGGED.cut - 0.9);
  else if (RIG_OK) {
    a = rigDraw(ctx, breathe(POSES.carry, T), 0, GROUND, null, {});
    if (a) carriedBag(ctx, a.nearHand.x, a.nearHand.y, v, T, {});
  }

  const tk = eout(seg(lt, 0.3, 1.25));
  const ht = (a && a.headTop) || { x: 6, y: GROUND - 384 };
  if (tk > 0) {
    if (window.Props && typeof Props.drawThought === 'function') Props.drawThought(ctx, ht.x + 6, ht.y - 6 - 10 * (1 - tk), tk, T, { style: 'cream', scale: 1.25 });
    else thoughtFallback(ctx, ht.x, ht.y - 30, tk, T);
  }
  motes(ctx, vw.x0, vw.y0, vw.x1, vw.y1, 22, T, 0.4, 5);
  ctx.restore();
}
function ripesList(v) {
  const r = v.bag.ripe || {}, out = [];
  for (const k of ['erizo', 'mangonada', 'verde', 'gold']) for (let i = 0; i < (r[k] || 0); i++) out.push(k);

  return out.map((x, i) => out[(i * 5) % out.length]);
}
function thoughtFallback(ctx, x, y, k, T) {
  const w = 240, h = w * 409 / 1400, yy = y - h - 10 - 8 * Math.sin(T * 1.6);
  ctx.globalAlpha = 0.5 * k; ctx.drawImage(GEN.soft, x - w * 0.7, yy - h * 0.6, w * 1.4, h * 2.2);
  ctx.globalAlpha = k; art(ctx, 'wordmark', x - w / 2, yy + (1 - k) * 14, w / 1400); ctx.globalAlpha = 1;
}
function drawBagged(ctx, v, t, T) {
  buildFind();
  if (t < BAGGED.cut) baggedA(ctx, v, t, T); else baggedB(ctx, v, t, T);
  finish(ctx, v, T);
  caption(ctx, v, 'Now, who’s getting these?', t - BAGGED.cap, { fadeOut: BAGGED.card - 0.1 - BAGGED.cap, x: v.W * 0.63, maxW: v.W * 0.5, size: 34 });
  bars(ctx, v, seg(t, 0, 0.6));
  if (t > BAGGED.card) drawCard(ctx, 'THE LONG WAY HOME', 'Get the bag to Shoe Gallery', 0.5 * seg(t, BAGGED.card, BAGGED.card + 0.8), v);
}

const SG_CROP = [858, 132, 742, 320];
let SG_MARK = null;
function sgMark() {
  if (SG_MARK || !ART.lockup) return SG_MARK;
  const im = ART.lockup.im, k = (im.naturalWidth || 1600) / 1600, c = mk(SG_CROP[2] * k, SG_CROP[3] * k);
  c.getContext('2d').drawImage(im, SG_CROP[0] * k, SG_CROP[1] * k, SG_CROP[2] * k, SG_CROP[3] * k, 0, 0, c.width, c.height);
  register('sgmark', c, [0, 0, SG_CROP[2], SG_CROP[3]]);
  return (SG_MARK = 'sgmark');
}

function neonOn(p, t, seed) {
  const at = 0.62 + hash(seed) * 0.05;
  if (p < at) return 0;
  if (p < at + 0.02) return hash(Math.floor(t * 15) + seed * 7.1) > 0.45 ? 0.9 : 0.1;
  return hash(Math.floor(t * 8) + seed * 3.3) > 0.993 ? 0.55 : 1;
}
function storeAt(ctx, sx, ground, p, t, o) {
  o = o || {};
  ctx.save(); ctx.translate(sx, ground);
  if (!art(ctx, 'store', 0, 0, 1)) {
    ctx.fillStyle = '#B7A9B8'; ctx.fillRect(-540, -880, 1080, 880); ctx.fillStyle = '#F2B060'; ctx.fillRect(-500, -372, 330, 342); ctx.fillRect(170, -372, 330, 342);
    ctx.fillStyle = '#1E1A26'; ctx.fillRect(-540, -504, 1080, 104);
  }
  const lit = clamp(0.55 + p * 0.5, 0, 1);

  ctx.globalCompositeOperation = 'lighter';
  if (ART.store_glow) art(ctx, 'store_glow', 0, 0, 1, 0.75 * lit);

  const sg = sgMark(), sOn = Math.max(0.35, neonOn(p, t, 3));
  ctx.globalAlpha = 0.5 * sOn; ctx.drawImage(GEN.soft, -300, -530, 600, 150);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  if (sg) { const h = 88, w = h * SG_CROP[2] / SG_CROP[3]; art(ctx, sg, -w / 2, -454 - h / 2, w / SG_CROP[2], 0.78 + 0.22 * sOn); }

  font(ctx, FONT.sansBold, 18); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFE0A0'; ctx.globalAlpha = 0.95;
  ctx.fillText('1060', 0, -361); ctx.globalAlpha = 1;

  const fOn = neonOn(p, t, 11);
  if (fOn > 0) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.45 * fOn; ctx.drawImage(GEN.glow, -560, -960, 130, 580);
    ctx.globalAlpha = 0.7 * fOn; ctx.fillStyle = '#F28C28'; ctx.fillRect(-501, -925, 10, 512);
    ctx.globalAlpha = fOn; ctx.fillStyle = '#FFD6A0'; ctx.fillRect(-498, -922, 4, 506);
    ctx.globalAlpha = 0.35 * lit; ctx.drawImage(GEN.glow, -580, -430, 1160, 130);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  }
  ctx.restore();
}

const CREW = { kid: 210, abuela: 300, friend: 420 };
function crewIdle(ctx, sx, ground, t, near) {
  const hop = Math.max(0, Math.sin(t * 7)) * 3 * (0.5 + 0.5 * near);
  drawFriend(ctx, sx + CREW.friend, ground, { armN: near > 0.3 ? [2.55 + 0.05 * Math.sin(t * 9), 0.25 + 0.35 * Math.sin(t * 9)] : [0.08, 0.15], armF: [-0.05, 0.12], smile: near }, t);
  drawAbuela(ctx, sx + CREW.abuela, ground, { smile: 0.3 * near, heart: 0 }, t);
  drawKid(ctx, sx + CREW.kid, ground, { reach: 0, hop, joy: near }, t);
}
function drawShopfront(ctx, sx, ground, s) {
  s = s || {};
  ctx.save();
  try {
    const p = clamp(s.progress == null ? 1 : s.progress, 0, 1), t = s.t || 0;
    storeAt(ctx, sx, ground, p, t);
    if (s.people !== false && PEOPLE) crewIdle(ctx, sx, ground, t, 1);
  } finally { ctx.restore(); }
}

const HOME = { stop: 1.35, cut2: 2.3, hand: 2.45, grab: 3.3, cut3: 5.85, cap: 2.5, end: 7.4 };
function homeTravel(t) { const T = HOME.stop, v0 = 380; return t >= T ? v0 * T / 3 : v0 * T / 3 * (1 - Math.pow(1 - t / T, 3)); }
function homeRunner(u, TT, x0, v) {
  const T0 = HOME.stop, ph = (u < T0 ? (u * 2.2 - u * u * 0.5) : (T0 * 2.2 - T0 * T0 * 0.5)) * Math.PI;
  const s = { x: x0 + homeTravel(u), ground: GROUND, h: 0, phase: ph, pace: lerp(0.6, 0, seg(u, 0, T0)), speed: 0,
    beatInterval: lerp(0.48, 0.72, seg(u, 0, T0)), air: false, vy: 0, stumble: 0, t: TT, key: 'cine-home' };
  if (u > T0 - 0.1) {
    s.pose = u > HOME.grab + 0.35 ? 'stand' : u > HOME.hand ? 'handoff' : 'stand';
    s.poseT = Math.max(0, u - (u > HOME.grab + 0.35 ? HOME.grab + 0.35 : s.pose === 'handoff' ? HOME.hand : T0 - 0.1));
  }
  if (u < HOME.grab) s.carry = { fill: v.bag.count, ripes: ripesList(v), scale: 1.2 };
  return s;
}
let HOME_GRIP = null;
function homeGrip(x0, v) {
  if (HOME_GRIP) return HOME_GRIP;
  const R = window.Runner;
  let g = null;
  if (R && R.draw && runnerHasPose('handoff')) {
    try { const a = R.draw(null, { x: x0 + homeTravel(9), ground: GROUND, h: 0, phase: 0, pace: 0, speed: 0, beatInterval: 0.6, t: 0, static: true, noDraw: true,
      pose: 'handoff', poseT: 0.9, carry: { fill: v.bag.count, scale: 1.2 } }); if (a && a.bag) g = { x: a.bag.x, y: a.bag.y }; else if (a && a.nearHand) g = a.nearHand; } catch (e) { g = null; }
  }
  return (HOME_GRIP = g || { x: x0 + homeTravel(9) + 92, y: GROUND - 236 });
}
function homeSet(ctx, v, t, T, cam, o) {
  const vw = camView(v, cam), p = 0.97, x0 = -70;

  if (window.Scene && Scene.drawBackground) {
    const pad = 400, Wc = Math.ceil(Math.max(v.W / Math.min(o.zmin, 1), v.W) + pad * 2), x0c = -Wc / 2;
    ctx.save(); ctx.translate(x0c, 0);
    Scene.drawBackground(ctx, { dist: 26000 + x0c, W: Wc, OY: Math.ceil(Math.max(v.OY, -vw.y0) + 700), t: T, progress: p });
    ctx.restore();
  } else {
    sky(ctx, vw.x0 - 10, vw.y0 - 10, vw.x1 + 10, GROUND, [[0, '#100E24'], [0.5, '#2B2748'], [0.85, '#875672'], [1, '#CF7058']]);
    ctx.fillStyle = '#4A4458'; ctx.fillRect(vw.x0 - 10, GROUND, vw.x1 - vw.x0 + 20, 400);
  }
  storeAt(ctx, 0, GROUND, p, T);

  const reach = seg(t, HOME.hand + 0.25, HOME.grab), got = t >= HOME.grab, hold = seg(t, HOME.grab, HOME.grab + 0.45);
  const clap = t > HOME.grab - 0.3 && t < HOME.grab + 1.6;
  const ck = clap ? 0.5 + 0.5 * Math.cos((t - HOME.grab + 0.3) * TAU * 2.6) : 0;
  const near = seg(t, 0.4, 1.6);
  const wave = t < HOME.hand ? near : 0;
  drawFriend(ctx, CREW.friend, GROUND, {
    armN: clap ? [0.95, 1.3 + 0.35 * ck] : wave > 0.3 ? [2.55 + 0.05 * Math.sin(T * 9), 0.25 + 0.35 * Math.sin(T * 9)] : [0.08, 0.15],
    armF: clap ? [0.85, 1.38 + 0.35 * ck] : [-0.05, 0.12], nod: clap ? -0.05 * Math.abs(Math.sin((t - HOME.grab) * 5)) : 0, smile: seg(t, 1.2, 2.2) }, T);
  const turned = t >= HOME.cut3;
  drawAbuela(ctx, CREW.abuela, GROUND, { smile: Math.min(1, seg(t, HOME.grab - 0.2, HOME.grab + 0.5) * 0.8 + 0.2 * near + (turned ? 0.2 : 0)), heart: seg(t, HOME.grab + 0.1, HOME.grab + 0.8),
    nod: turned ? -0.1 - 0.02 * Math.sin(T * 2) : 0 }, T);
  const grip = homeGrip(x0, v);
  const kidHands = { x: CREW.kid - 22, y: GROUND - 222 };
  const bagFn = (c2) => {
    if (!got) return;
    const k = eio(hold);
    let bx = lerp(lerp(grip.x, kidHands.x, 0.5), CREW.kid - 18, k), by = lerp(kidHands.y + 30, GROUND - 158, k);
    if (turned) { bx = CREW.kid - 24; by = GROUND - 146; }
    carriedBag(c2, (bx - CREW.kid) / PSCALE, (by - GROUND) / PSCALE, v, T, { scale: 1.2 / PSCALE, swing: 0.2 * (1 - k) * Math.sin(t * 9) });
    if ((v.bag.ripe || {}).gold && k > 0.6) {
      c2.globalCompositeOperation = 'lighter'; c2.globalAlpha = 0.5 * seg(k, 0.6, 1) * (0.8 + 0.2 * Math.sin(T * 3));
      c2.drawImage(GEN.glow, (bx - CREW.kid) / PSCALE - 60, (by - GROUND) / PSCALE - 70, 120, 110); c2.globalCompositeOperation = 'source-over'; c2.globalAlpha = 1;
    }
  };
  drawKid(ctx, CREW.kid, GROUND, { reach: got ? 1 - hold : reach, hold, joy: Math.max(seg(t, HOME.hand, HOME.hand + 0.4), 0.4 * near),
    hop: got ? (turned ? Math.max(0, Math.sin(T * 6)) * 2 : 0) : Math.max(0, Math.sin(T * 7)) * 3 * near * (1 - reach), between: bagFn,
    flip: turned, look: turned ? 0.2 : 0 }, T);

  const posed = runnerHasPose('handoff');
  if (posed) runnerAt(ctx, 'cine-home', (u, TT) => homeRunner(u, TT, x0, v), t, T, 0);
  else if (RIG_OK) {
    const P = t < HOME.stop ? POSES.carry : blendPose(POSES.carry, POSES.handoff, sstep(HOME.hand, HOME.hand + 0.6, t));
    const a = rigDraw(ctx, breathe(P, T), x0 + homeTravel(t), GROUND, null, {});
    if (a && !got) carriedBag(ctx, a.nearHand.x, a.nearHand.y, v, T, {});
  }
  return vw;
}
function drawHome(ctx, v, t, T) {
  buildFind();
  const x0 = -70;

  let cam;
  const cam0 = { cx: v.W / 2 - (v.W * 0.28 + 70), cy: (H - v.OY) / 2, z: 1 };
  const wide = fit(v, [-560, -360, 1180, 830], [-200, -900, 700, 1360]);
  const two = fit(v, [-120, -40, 600, 480], [-60, -80, 520, 560]);
  const close = fit(v, [176, 118, 186, 224], [168, 104, 196, 286]);
  if (t < HOME.cut2) cam = lerpCam(cam0, wide, eio(seg(t, 0, 1.6)));
  else if (t < HOME.cut3) cam = lerpCam(two, Object.assign({}, two, { z: two.z * 1.06 }), eio(seg(t, HOME.cut2, HOME.cut3)));
  else cam = lerpCam(close, Object.assign({}, close, { z: close.z * 1.08, cx: close.cx + 6 }), eio(seg(t, HOME.cut3, HOME.end + 1)));
  const ek = seg(t, HOME.end, HOME.end + 1.6);
  if (ek < 1) {
    ctx.save(); camApply(ctx, v, cam);
    homeSet(ctx, v, t, T, cam, { zmin: wide.z });
    ctx.restore();
    finish(ctx, v, T, { vignette: 0.8 });
  }
  if (ek > 0) { ctx.globalAlpha = Math.min(1, ek * 1.6); drawEndCard(ctx, v, ek, T); ctx.globalAlpha = 1; finish(ctx, v, T, { vignette: 0.5, grain: 0.4 }); }
  caption(ctx, v, 'That’s Thinking of You.|A runner’s find, shared with the people you love.', t - HOME.cap, { fadeOut: HOME.cut3 - 0.45 - HOME.cap, step: 0.11 });
  bars(ctx, v, seg(t, 0, 0.6) * (1 - seg(t, HOME.end, HOME.end + 0.8)));
}
const CUTS = { find: drawFind, bagged: drawBagged, home: drawHome, people: debugPeople };

const Cine = {
  list: LIST,
  errors,
  ready: null,
  draw(ctx, name, t, v) {
    const f = CUTS[name]; if (!f) return;
    if (ctx.canvas !== WARMCV) LASTREAL = performance.now();
    v = norm(v);
    const d = LIST[name] ? LIST[name].duration : 1e9;
    ctx.save();
    try { f(ctx, v, Math.min(Math.max(0, t || 0), d), Math.max(0, t || 0)); }
    finally { ctx.restore(); }
  },
  drawCard,
  drawShopfront,
  rescaled() { EPOCH++; },
  warmed: WARMED,
  warmProgress: () => WARMUP.k,
};

const CINE_ART = {
  hero_mango: [-80, -12, 160, 310], tree_trunk: [-520, -1180, 1040, 1230], leaf_fg: [-30, -92, 300, 184],
  leaf_back_a: null, leaf_back_b: null, leaf_sun_a: null, leaf_shade_a: null, leaf_shade_b: null, leaf_young_a: null,
  bag_back: null, bag_body: null, bag_flap: null, bag_flapin: null, bag_note: null, store: null, store_glow: null,
};

async function loadPropMangoes() {
  const pb = window.PROPS_BASE != null ? window.PROPS_BASE : base();
  const jobs = [];
  for (const r of ['verde', 'erizo', 'mangonada', 'gold']) for (let i = 0; i < 3; i++)
    jobs.push(loadImage(pb + 'props/art/mango_' + r + '_lie_' + i + '.svg').then(im => register('pm_' + r + '_' + i, im, [-28, -24, 56, 44])));
  await Promise.all(jobs);
}
const ART_MAXL = { store: 2, tree_trunk: 2, store_glow: 1 };
function svgBox(im) {
  return [0, 0, im.naturalWidth || im.width, im.naturalHeight || im.height];
}
async function loadCineArt() {
  const B = base(), names = Object.keys(CINE_ART);

  await Promise.all(names.map(async n => {
    const url = B + 'cine/art/' + n + '.svg';
    let box = CINE_ART[n];
    if (!box) {
      try { const tx = await (await fetch(url)).text(); const m = /viewBox="([-\d.\s]+)"/.exec(tx); if (m) box = m[1].trim().split(/\s+/).map(Number); } catch (e) {}
    }
    const im = await loadImage(url);
    if (im) register(n, im, box || svgBox(im), ART_MAXL[n] ? { maxL: ART_MAXL[n] } : null);
  }));
}

window.addEventListener('runner-look', () => { loadRig(ART.shoe ? ART.shoe.im : null); });
Cine.ready = (async () => {
  makeGenerated();
  const B = base();
  const [shoe, wm, lk] = await Promise.all([loadImage(B + 'shoe.svg'), loadImage(B + 'brand/wordmark.png'), loadImage(B + 'brand/lockup_h_white.png'), loadFonts()]);
  register('shoe', shoe, [0, 0, 1180, 740]);
  register('wordmark', wm, [0, 0, 1400, 409]);
  register('lockup', lk, [0, 0, 1600, 584]);
  await Promise.all([loadCineArt(), loadRig(shoe), loadPropMangoes(), loadPeople()]);
  buildFindSoon();
  prebake('shoe', S0 * 0.55);

  const others = [window.Scene, window.Runner, window.Props].filter(m => m && m.ready && m.ready.then).map(m => m.ready.catch(() => 0));
  Promise.race([Promise.all(others), new Promise(r => setTimeout(r, 20000))]).then(() => setTimeout(prewarm, 300));
  return Cine;
})();

function prewarm() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2), cw = (innerWidth || 960) * dpr, ch = (innerHeight || 620) * dpr;
  const S = Math.min(ch / 620, cw / 600), W = cw / S, VH = ch / S, OY = VH - H;
  const c = WARMCV = mk(32, 32), g = c.getContext('2d');
  const v = { W, VH, OY, S, bag: { count: 10, ripe: { verde: 3, erizo: 4, mangonada: 2, gold: 1 } }, score: {} };
  const plan = [['find', [0.4, 1.4, 1.75, 2.6, 3.6, 4.6, 5.8, 7.1]], ['bagged', [0.2, 1.1, 1.7, 2.1, 3.0, 4.9]], ['home', [0.3, 1.8, 2.4, 3.2, 3.8, 5.9, 7.6, 9.5]]];

  const todo = []; for (const [name, ts] of plan) for (const t of ts) todo.push([name, t]);
  let i = 0;
  const later = ms => setTimeout(step, ms);
  const step = () => {
    const hold = busy() || performance.now() - LASTREAL < 600;
    if (hold || !TREE.canopy) { later(hold ? 400 : 60); return; }
    if (i >= todo.length) {
      try { g.setTransform(S, 0, 0, S, 0, OY * S); drawCard(g, 'THE PICK', 'Fill the bag', 0.5, v); } catch (e) {}
      Cine.warm = true; WARMUP.done(); return;
    }
    const [name, t] = todo[i++]; WARMUP.k = 0.3 + 0.7 * i / (todo.length + 1);
    try { g.setTransform(S, 0, 0, S, 0, OY * S); Cine.draw(g, name, t, v); } catch (e) { errors.push('prewarm ' + name + ': ' + e.message); }
    if (i >= todo.length || todo[i][0] !== name) for (const k in RCLOCK) delete RCLOCK[k];
    later(14);
  };
  step();
}
window.Cine = Cine;
})();
