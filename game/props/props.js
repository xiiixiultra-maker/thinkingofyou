

(function () {
  'use strict';
  const LEVELS = [1.5, 3, 6, 12];

  function guessLevel() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2), S = Math.min(innerHeight * dpr / 540, innerWidth * dpr / 600) || 3;
    for (let i = 0; i < LEVELS.length; i++) if (LEVELS[i] >= S * 0.85) return LEVELS[i];
    return LEVELS[LEVELS.length - 1];
  }
  const LV0 = guessLevel();
  const RIPES = ['verde', 'erizo', 'mangonada', 'gold'];
  const BOX = {
    hang: [-34, -56, 68, 76], lie: [-28, -24, 56, 44],
    iguana: [-48, -30, 126, 40], root: [-16, -30, 90, 48], splat: [-22, -14, 92, 24], bag: [-20, -46, 40, 50],
  };
  const IGUANA = { walk: 10, bob: 6, run: 6 };
  const BOX3 = {
    bagc: [-26, -4, 52, 52], tag: [-9, -1, 18, 14], bagm: [-11, -11, 22, 22], leaf: [-2, -16, 18, 18],
    icon: [-16, -11, 32, 34], thought: [-112, -86, 224, 108], puff: [-20, -18, 40, 36],
  };
  const errors = [];
  const sprites = {};
  let READY = false, grainTile = null;

  const base = () => (window.PROPS_BASE || '') + 'props/art/';
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const ease = k => 1 - Math.pow(1 - k, 3);
  function hash(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }

  function makeGrain() {
    const n = 96, c = document.createElement('canvas'); c.width = c.height = n;
    const x = c.getContext('2d'), d = x.createImageData(n, n);
    let s = 1234567;
    for (let i = 0; i < n * n; i++) {
      s = (s * 1103515245 + 12345) & 0x7fffffff; const r = s / 0x7fffffff;
      const v = r < 0.5 ? 0 : 255, a = Math.abs(r - 0.5) * 2;
      d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = v; d.data[i * 4 + 3] = Math.round(a * a * 70);
    }
    x.putImageData(d, 0, 0); return c;
  }
  function raster(sp, lv) {
    const b = sp.box, c = document.createElement('canvas');
    c.width = Math.round(b[2] * lv); c.height = Math.round(b[3] * lv);
    const x = c.getContext('2d');
    x.drawImage(sp.img, 0, 0, c.width, c.height);
    if (grainTile && !sp.noGrain) {
      x.globalCompositeOperation = 'source-atop'; x.globalAlpha = 0.5;
      x.fillStyle = x.createPattern(grainTile, 'repeat'); x.fillRect(0, 0, c.width, c.height);
    }
    sp.lv[lv] = c; return c;
  }
  function load(name, box, opts) {
    return new Promise(res => {
      const im = new Image();
      im.onload = () => {
        const done = () => { const sp = { img: im, box, lv: {}, noGrain: opts && opts.noGrain }; sprites[name] = sp; raster(sp, LV0); res(); };
        if (im.decode) im.decode().then(done, done); else done();
      };
      im.onerror = () => { errors.push(name); console.warn('Props: could not load', name); res(); };
      im.src = base() + name + '.svg';
    });
  }
  function level(ctx) {
    const m = ctx.getTransform(), eff = Math.sqrt(m.a * m.a + m.b * m.b);
    for (let i = 0; i < LEVELS.length; i++) if (LEVELS[i] >= eff * 0.85) return LEVELS[i];
    return LEVELS[LEVELS.length - 1];
  }
  function blitLv(ctx, name, lv, dx, dy) {
    const sp = sprites[name]; if (!sp) return false;
    const c = sp.lv[lv] || raster(sp, lv), b = sp.box;
    ctx.drawImage(c, b[0] + (dx || 0), b[1] + (dy || 0), b[2], b[3]);
    return true;
  }
  function blit(ctx, name, s, dx, dy) {
    const sp = sprites[name]; if (!sp) return false;
    const lv = level(ctx), c = sp.lv[lv] || raster(sp, lv), b = sp.box;
    ctx.drawImage(c, b[0] + (dx || 0), b[1] + (dy || 0), b[2], b[3]);
    return true;
  }

  const FX = {};
  const JUICE = {
    verde: ['#C9E07A', '#7FAE3A', '#EEF7C2'], erizo: ['#FFC23A', '#F07A22', '#FFF1C4'],
    mangonada: ['#F2552E', '#A8231C', '#FFC9A8'], gold: ['#FFE07A', '#E8A010', '#FFFBE6'],
  };
  function spriteCanvas(w, h, fn) { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; }
  function buildFx() {
    for (const r of RIPES) {
      const [light, deep, hi] = JUICE[r];

      FX['drop_' + r] = spriteCanvas(64, 40, (x) => {
        x.translate(30, 20);
        x.beginPath(); x.moveTo(26, 0); x.bezierCurveTo(10, -4, 4, -13, -6, -13); x.arc(-6, 0, 13, -Math.PI / 2, Math.PI / 2, true);
        x.bezierCurveTo(4, 13, 10, 4, 26, 0); x.closePath();
        const g = x.createRadialGradient(2, -4, 1, -2, 0, 18); g.addColorStop(0, light); g.addColorStop(0.6, deep); g.addColorStop(1, deep);
        x.fillStyle = g; x.fill();
        x.globalAlpha = 0.85; x.fillStyle = hi; x.beginPath(); x.ellipse(-1, -6, 5, 2.6, -0.2, 0, TAU); x.fill();
        x.globalAlpha = 0.5; x.fillStyle = '#2E2A4F'; x.beginPath(); x.ellipse(-12, 6, 6, 4, 0.4, 0, TAU); x.fill();
      });

      FX['fleck_' + r] = spriteCanvas(32, 32, (x) => {
        const g = x.createRadialGradient(13, 13, 1, 16, 16, 15); g.addColorStop(0, hi); g.addColorStop(0.35, light); g.addColorStop(1, 'rgba(0,0,0,0)');
        x.fillStyle = g; x.beginPath(); x.arc(16, 16, 15, 0, TAU); x.fill();
      });

      FX['ring_' + r] = spriteCanvas(128, 128, (x) => {
        const g = x.createRadialGradient(64, 64, 30, 64, 64, 62);
        g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.55, hexA(light, 0.0)); g.addColorStop(0.78, hexA(hi, 0.95));
        g.addColorStop(0.9, hexA(light, 0.5)); g.addColorStop(1, hexA(light, 0));
        x.fillStyle = g; x.fillRect(0, 0, 128, 128);
      });
    }
    FX.glow = spriteCanvas(128, 128, (x) => {
      const g = x.createRadialGradient(64, 64, 4, 64, 64, 64);
      g.addColorStop(0, 'rgba(255,240,170,0.85)'); g.addColorStop(0.35, 'rgba(255,214,90,0.38)'); g.addColorStop(0.7, 'rgba(255,190,60,0.1)'); g.addColorStop(1, 'rgba(255,190,60,0)');
      x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    });
    FX.sparkle = spriteCanvas(64, 64, (x) => {
      x.translate(32, 32);
      const g = x.createRadialGradient(0, 0, 0, 0, 0, 14); g.addColorStop(0, 'rgba(255,255,240,0.9)'); g.addColorStop(1, 'rgba(255,230,150,0)');
      x.fillStyle = g; x.beginPath(); x.arc(0, 0, 14, 0, TAU); x.fill();
      x.fillStyle = '#FFFDF2';
      for (const [l, w, a] of [[30, 2.6, 0], [30, 2.6, Math.PI / 2], [13, 1.6, Math.PI / 4], [13, 1.6, -Math.PI / 4]]) {
        x.save(); x.rotate(a); x.beginPath(); x.moveTo(-l, 0); x.quadraticCurveTo(0, -w, l, 0); x.quadraticCurveTo(0, w, -l, 0); x.fill(); x.restore();
      }
    });
    FX.shadow = spriteCanvas(96, 32, (x) => {
      x.translate(48, 16); x.scale(1, 0.32);
      const g = x.createRadialGradient(0, 0, 2, 0, 0, 46); g.addColorStop(0, 'rgba(30,22,50,0.55)'); g.addColorStop(0.6, 'rgba(30,22,50,0.22)'); g.addColorStop(1, 'rgba(30,22,50,0)');
      x.fillStyle = g; x.beginPath(); x.arc(0, 0, 46, 0, TAU); x.fill();
    });
    FX.iconBack = spriteCanvas(104, 104, (x) => {
      const g = x.createRadialGradient(52, 52, 0, 52, 52, 52);
      g.addColorStop(0, 'rgba(21,19,15,0.46)'); g.addColorStop(0.74, 'rgba(21,19,15,0.4)'); g.addColorStop(0.88, 'rgba(21,19,15,0.14)'); g.addColorStop(1, 'rgba(21,19,15,0)');
      x.fillStyle = g; x.fillRect(0, 0, 104, 104);
      x.strokeStyle = 'rgba(255,246,229,0.2)'; x.lineWidth = 1.6; x.beginPath(); x.arc(52, 52, 44, 0, TAU); x.stroke();
    });
    FX.dust = spriteCanvas(48, 48, (x) => {
      const g = x.createRadialGradient(24, 24, 2, 24, 24, 23); g.addColorStop(0, 'rgba(240,226,200,0.7)'); g.addColorStop(1, 'rgba(240,226,200,0)');
      x.fillStyle = g; x.beginPath(); x.arc(24, 24, 23, 0, TAU); x.fill();
    });
  }
  function hexA(h, a) { const n = parseInt(h.slice(1), 16); return 'rgba(' + (n >> 16) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')'; }

  const jobs = [];
  for (const r of RIPES) for (const m of ['hang', 'lie']) for (let v = 0; v < 3; v++) jobs.push(load('mango_' + r + '_' + m + '_' + v, BOX[m]));
  for (const k in IGUANA) for (let i = 0; i < IGUANA[k]; i++) jobs.push(load('iguana_' + k + '_' + i, BOX.iguana));
  jobs.push(load('root', BOX.root), load('splat', BOX.splat), load('splat_hit', BOX.splat), load('bag', BOX.bag));
  for (let v = 0; v < 3; v++) jobs.push(load('bagc_back_' + v, BOX3.bagc), load('bagc_front_' + v, BOX3.bagc));
  jobs.push(load('bagc_tag', BOX3.tag), load('bag_leaf', BOX3.leaf), load('icon_back', BOX3.icon), load('icon_front', BOX3.icon));
  for (const r of RIPES) for (let v = 0; v < 3; v++) jobs.push(load('bagm_' + r + '_' + v, BOX3.bagm));
  for (const st of ['cream', 'dusk']) jobs.push(load('thought_' + st, BOX3.thought, { noGrain: true }), load('puff_' + st, BOX3.puff, { noGrain: true }));
  const WM = { img: null, tinted: null, steps: {} };
  jobs.push(new Promise(res => {
    const im = new Image();
    im.onload = () => { WM.img = im; res(); };
    im.onerror = () => { errors.push('brand/wordmark.png'); console.warn('Props: could not load brand/wordmark.png'); res(); };
    im.src = (window.PROPS_BASE || '') + 'brand/wordmark.png';
  }));
  try { grainTile = makeGrain(); } catch (e) { grainTile = null; }
  buildFx();
  const ready = Promise.all(jobs).then(() => { READY = true; return Props; });

  function drawMango(ctx, sx, sy, ripe, o) {
    o = o || {};
    const s = o.scale == null ? 1 : o.scale, t = o.t || 0, seed = o.seed || 0, hang = !!o.hanging;
    if (!RIPES.includes(ripe)) ripe = 'erizo';
    const v = Math.floor(hash(seed + 0.5) * 3), name = 'mango_' + ripe + '_' + (hang ? 'hang' : 'lie') + '_' + v;
    ctx.save();
    if (!hang && o.ground != null) {
      const hgt = Math.max(0, o.ground - sy), k = clamp(1 - hgt / 140, 0.25, 1);
      ctx.globalAlpha = k; ctx.drawImage(FX.shadow, sx - 26 * s * (1.3 - k * 0.3) - 6, o.ground - 5 * s, 52 * s * (1.3 - k * 0.3), 10 * s);
      ctx.globalAlpha = 1;
    }
    ctx.translate(sx, sy);
    if (s !== 1) ctx.scale(s, s);
    const ph = seed * 1.7 + hash(seed) * 6;
    if (ripe === 'gold') {
      const p = 0.75 + 0.25 * Math.sin(t * 3.1 + ph), R = 30 + 4 * p;
      ctx.globalAlpha = 0.55 + 0.35 * p; ctx.drawImage(FX.glow, -R, -R, R * 2, R * 2); ctx.globalAlpha = 1;
    }
    if (hang) {
      const piv = -37, a = Math.sin(t * 1.25 + ph) * 0.03 + Math.sin(t * 2.9 + ph * 2) * 0.008;
      ctx.translate(0, piv); ctx.rotate(a); ctx.translate(0, -piv);
    } else {
      ctx.translate(0, Math.sin(t * 2.3 + ph) * 1.4);
      ctx.rotate(Math.sin(t * 1.7 + ph) * 0.035 + (hash(seed + 3) - 0.5) * 0.22);
    }
    if (!blit(ctx, name, s)) fallbackMango(ctx, ripe);
    if (ripe === 'gold') {
      for (let i = 0; i < 2; i++) {
        const q = (t * 0.9 + i * 0.5 + hash(seed + i)) % 1, a = Math.sin(q * Math.PI);
        if (a <= 0.05) continue;
        const gx = i ? 6.5 : -4, gy = i ? -7.5 : 5, z = (5 + 5 * a) * (i ? 1 : 0.75);
        ctx.globalAlpha = a; ctx.translate(gx, gy); ctx.rotate(q * 0.6);
        ctx.drawImage(FX.sparkle, -z, -z, z * 2, z * 2);
        ctx.rotate(-q * 0.6); ctx.translate(-gx, -gy);
      }
    }
    ctx.restore();
  }
  function fallbackMango(ctx, ripe) {
    ctx.fillStyle = JUICE[ripe][1]; ctx.beginPath(); ctx.ellipse(0, 0, 11, 15, -0.3, 0, TAU); ctx.fill();
  }

  const hitSeen = new Map();
  function hitTime(kind, o, t) {
    if (o.hitT != null) return o.hitT;
    const key = kind + ':' + (o.seed || 0);
    if (!hitSeen.has(key)) { hitSeen.set(key, t); if (hitSeen.size > 64) hitSeen.delete(hitSeen.keys().next().value); }
    return hitSeen.get(key);
  }
  function drawObstacle(ctx, kind, sx, ground, t, o) {
    o = o || {}; t = t || 0;
    const seed = o.seed || 0;
    ctx.save();
    ctx.translate(sx, ground);
    if (kind === 'iguana') {
      const off = hash(seed + 7) * 10;
      if (o.hit) {
        const dt = Math.max(0, t - hitTime(kind, o, t));
        if (dt < 0.4) {
          const q = dt / 0.4;
          for (let i = 0; i < 4; i++) {
            const r = (5 + 9 * q) * (0.7 + hash(i + seed) * 0.6), px = 10 + i * 14 + q * 6 * (i - 1.5), py = -3 - q * (4 + i * 2);
            ctx.globalAlpha = (1 - q) * 0.75; ctx.drawImage(FX.dust, px - r, py - r, r * 2, r * 2);
          }
          ctx.globalAlpha = 1;
        }
        if (dt < 0.9) {
          const k = dt / 0.9, fr = Math.floor(dt * 22) % IGUANA.run;
          ctx.globalAlpha = 1 - k * k;
          ctx.translate(dt * 260 + dt * dt * 120, -dt * 26);
          ctx.scale(1 - k * 0.18, 1 - k * 0.18);
          blit(ctx, 'iguana_run_' + fr, 1);
        }
      } else {

        const T = t + off, walkDur = 1.15, bobDur = 1.1, loop = walkDur * 2 + bobDur, q = T % loop;
        let name;
        if (q < walkDur * 2) name = 'iguana_walk_' + (Math.floor(q / walkDur * IGUANA.walk) % IGUANA.walk);
        else name = 'iguana_bob_' + Math.min(IGUANA.bob - 1, Math.floor((q - walkDur * 2) / bobDur * IGUANA.bob));
        blit(ctx, name, 1);
      }
    } else if (kind === 'root') {
      blit(ctx, 'root', 1);
    } else if (kind === 'splat') {
      if (o.hit) {
        const dt = Math.max(0, t - hitTime(kind, o, t));
        if (dt < 0.12) {
          const k = dt / 0.12;
          ctx.save(); ctx.translate(20, 0); ctx.scale(1 + 0.12 * k, 1 - 0.4 * k); ctx.translate(-20, 0); blit(ctx, 'splat', 1); ctx.restore();
          ctx.globalAlpha = k;
        }
        blit(ctx, 'splat_hit', 1);
      } else blit(ctx, 'splat', 1);
    }
    ctx.restore();
  }

  const BURST = [];
  for (let i = 0; i < 13; i++) {
    const u = (i + hash(i) * 0.8) / 13, a = -Math.PI / 2 + Math.sin((u - 0.5) * Math.PI) * Math.PI * 0.92 + (hash(i + 5) - 0.5) * 0.5;
    BURST.push([a, 45 + hash(i + 20) * 105, 0.5 + hash(i + 40) * 0.85]);
  }
  function drawPickup(ctx, x, y, ripe, k) {
    if (!RIPES.includes(ripe)) ripe = 'erizo';
    k = clamp(k, 0, 1);
    const gold = ripe === 'gold', big = gold ? 1.5 : 1, tt = k * 0.4;
    ctx.save(); ctx.translate(x, y);

    const rk = ease(Math.min(1, k * 1.25)), R = (8 + 26 * rk) * big;
    ctx.globalAlpha = (1 - rk) * 0.9; ctx.drawImage(FX['ring_' + ripe], -R, -R, R * 2, R * 2);

    if (k < 0.3) { const f = 1 - k / 0.3, r = (10 + 10 * (1 - f)) * big; ctx.globalAlpha = f * 0.8; ctx.drawImage(FX.glow, -r, -r, r * 2, r * 2); }

    for (let i = 0; i < BURST.length; i++) {
      const [a, sp, sz] = BURST[i], v = sp * big;
      const px = Math.cos(a) * v * tt, py = Math.sin(a) * v * tt + 420 * tt * tt;
      const vx = Math.cos(a) * v, vy = Math.sin(a) * v + 840 * tt;
      const s = sz * (1 - k * 0.6) * big, len = 7 * s + Math.hypot(vx, vy) * 0.022;
      ctx.globalAlpha = k < 0.7 ? 1 : (1 - k) / 0.3;
      ctx.save(); ctx.translate(px, py); ctx.rotate(Math.atan2(vy, vx));
      ctx.drawImage(FX['drop_' + ripe], -len * 0.47, -2.6 * s, len, 5.2 * s);
      ctx.restore();
      if (i % 3 === 0) {
        const fx = px * 0.55, fy = py * 0.55, fs = 3.2 * s;
        ctx.drawImage(FX['fleck_' + ripe], fx - fs, fy - fs, fs * 2, fs * 2);
      }
    }

    const n = gold ? 7 : 3;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU + 0.4, d = (10 + 22 * ease(k)) * big * (0.7 + hash(i + 9) * 0.5);
      const tw = Math.sin(Math.min(1, k * 1.3 + hash(i) * 0.25) * Math.PI), z = (gold ? 7 : 5) * tw;
      if (z <= 0.2) continue;
      ctx.globalAlpha = tw;
      ctx.drawImage(FX.sparkle, Math.cos(a) * d - z, Math.sin(a) * d - z - 6 * k, z * 2, z * 2);
    }
    ctx.restore();
  }

  function drawBanked(ctx, x, y, k) {
    k = clamp(k, 0, 1);
    ctx.save(); ctx.translate(x, y);

    let s, lift = 0, a = 1;
    if (k < 0.22) { const q = k / 0.22; s = q < 0.7 ? ease(q / 0.7) * 1.12 : 1.12 - 0.12 * ((q - 0.7) / 0.3); }
    else s = 1;
    if (k > 0.7) { const q = (k - 0.7) / 0.3; lift = -18 * ease(q); a = 1 - q * q; }
    const wob = k < 0.4 ? Math.sin(k * 40) * 0.06 * (1 - k / 0.4) : 0;
    ctx.globalAlpha = a;
    const B = 1.35;
    ctx.translate(0, lift); ctx.rotate(wob); ctx.scale(s * B, s * B);
    blit(ctx, 'bag', s * B);

    for (let i = 0; i < 3; i++) {
      const q = clamp((k - 0.1 - i * 0.12) / 0.4, 0, 1), tw = Math.sin(q * Math.PI);
      if (tw <= 0.05) continue;
      const gx = [-17, 16, 2][i], gy = [-34, -40, -50][i], z = 5 * tw;
      ctx.globalAlpha = a * tw; ctx.drawImage(FX.sparkle, gx - z, gy - z, z * 2, z * 2);
    }
    ctx.restore();
  }

  const BAG_MIX = ['erizo', 'verde', 'mangonada', 'erizo', 'verde', 'erizo', 'mangonada', 'verde', 'erizo', 'mangonada', 'erizo', 'verde'];

  const BAG_SLOTS = [[-12.5, 5.6, 0], [12.0, 5.8, 1], [-7.5, 4.2, 2], [7.6, 4.4, 0], [-15.6, 3.6, 1], [15.4, 3.8, 2],
    [-10.5, 1.6, 1], [10.6, 1.8, 2], [-5.8, -0.2, 0], [6.0, -0.4, 1], [-13.2, -1.6, 2], [13.2, -1.8, 0]];
  function ripeOf(list, i) { const r = list && list[i]; return RIPES.includes(r) ? r : BAG_MIX[i % 12]; }
  function drawBagCarry(ctx, x, y, fill, t, o) {
    o = o || {}; t = t || 0;
    const n = clamp(Math.round(fill || 0), 0, 12), v = n === 0 ? 0 : n <= 5 ? 1 : 2;
    const sw = clamp(o.swing || 0, -1, 1), s = o.scale == null ? 1 : o.scale, bo = clamp(o.bounce || 0, -1, 1);
    ctx.save();
    ctx.translate(x, y); ctx.rotate(-sw * 0.3);
    if (s !== 1 || bo) ctx.scale(s, s * (1 + 0.025 * bo));
    const lv = level(ctx);
    blitLv(ctx, 'bagc_back_' + v, lv);
    if (n >= 3) { ctx.save(); ctx.translate(-9, 3.6); ctx.rotate(-0.95 + Math.sin(t * 5.3) * 0.04); blitLv(ctx, 'bag_leaf', lv); ctx.restore(); }
    if (n >= 9) { ctx.save(); ctx.translate(9.6, 2.8); ctx.rotate(0.22 + Math.sin(t * 4.7 + 1) * 0.04); blitLv(ctx, 'bag_leaf', lv); ctx.restore(); }
    const jig = 0.3 * (0.35 + Math.abs(sw));
    for (let i = 0; i < n; i++) {
      const sl = BAG_SLOTS[i];
      blitLv(ctx, 'bagm_' + ripeOf(o.ripes, i) + '_' + sl[2], lv, sl[0], sl[1] + Math.sin(t * 10.5 + i * 1.9) * jig + 0.5 * Math.max(0, bo));
    }
    blitLv(ctx, 'bagc_front_' + v, lv);
    ctx.translate(11.6, 5.4);
    ctx.rotate(sw * 0.22 + Math.sin(t * 6.1) * 0.05 * (0.3 + Math.abs(sw)));
    blitLv(ctx, 'bagc_tag', lv);
    ctx.restore();
  }

  const ICON_SLOTS = [[-6, -6.4, 0], [5.6, -6.6, 1], [0, -7.3, 2], [-9.4, -8.2, 1], [9.4, -8.4, 2], [-3.2, -9.8, 0],
    [3.4, -10.2, 1], [-7.2, -12.0, 2], [7.2, -12.2, 0], [0, -13.4, 1], [-4, -15.8, 2], [4.2, -16.2, 0]];
  const iconState = {};
  function drawBagIcon(ctx, x, y, fill, cap, pop, o) {
    o = o || {};
    cap = cap > 0 ? cap : 12;
    const n = Math.round(clamp(fill || 0, 0, cap) / cap * 12), now = performance.now() / 1000;
    const st = iconState[cap] || (iconState[cap] = { n, at: -9, dir: 1 });
    if (n !== st.n) { st.dir = n > st.n ? 1 : -1; st.at = now; st.lost = st.n; st.n = n; }
    const e = pop != null ? 1 - clamp(pop, 0, 1) : clamp((now - st.at) / 0.42, 0, 1);
    const add = pop != null ? true : st.dir > 0;
    const bump = e < 1 ? Math.sin(Math.PI * Math.min(1, e * 1.7)) * (1 - e * 0.6) : 0;
    const sc = 1 + (add ? 0.13 : 0.04) * bump, rot = add ? 0 : Math.sin(e * 26) * 0.11 * (1 - e);
    ctx.save();
    ctx.translate(x, y); if (rot) ctx.rotate(rot); if (sc !== 1) ctx.scale(sc, sc);
    ctx.drawImage(FX.iconBack, -27, -26, 54, 54);
    const lv = level(ctx);
    blitLv(ctx, 'icon_back', lv);
    for (let i = 0; i < n; i++) {
      const sl = ICON_SLOTS[i];
      let dy = 0;
      if (add && i === n - 1 && e < 1) dy = e < 0.55 ? -11 * Math.pow(1 - e / 0.55, 2) : -1.6 * Math.sin(Math.PI * (e - 0.55) / 0.45);
      ctx.save(); ctx.translate(sl[0], sl[1] + dy); ctx.scale(0.8, 0.8);
      blitLv(ctx, 'bagm_' + ripeOf(o.ripes, i) + '_' + sl[2], lv);
      ctx.restore();
    }
    if (!add && e < 1 && n < 12) {
      const sl = ICON_SLOTS[n];
      ctx.save(); ctx.globalAlpha = 1 - e; ctx.translate(sl[0] - 16 * e, sl[1] - 12 * e + 26 * e * e); ctx.rotate(-e * 4); ctx.scale(0.8, 0.8);
      blit(ctx, 'bagm_' + ripeOf(o.ripes, n) + '_' + sl[2], sc * 0.8);
      ctx.restore();
    }
    blitLv(ctx, 'icon_front', lv);
    if (add && e < 0.9 && n > 0) {
      const sl = ICON_SLOTS[n - 1], tw = Math.sin(Math.PI * e / 0.9), z = 6 * tw;
      ctx.globalAlpha = tw; ctx.drawImage(FX.sparkle, sl[0] + 3 - z, sl[1] - 5 - z, z * 2, z * 2);
    }
    ctx.restore();
  }

  function drawMangoDrop(ctx, x, y, ripe, k, o) {
    o = o || {};
    if (!RIPES.includes(ripe)) ripe = 'erizo';
    k = clamp(k, 0, 1);
    const ground = o.ground == null ? 420 : o.ground, seed = o.seed || 0, dir = hash(seed + 11) < 0.5 ? -1 : 1;
    const vxk = o.vx == null ? -55 : o.vx;
    const T = k * 0.8, g = 1500, vx0 = vxk * (0.8 + hash(seed) * 0.4), vy0 = -170, R = 7, floor = ground - R;
    const t1 = (-vy0 + Math.sqrt(vy0 * vy0 + 2 * g * Math.max(0, floor - y))) / g;
    const vy1 = -0.36 * (vy0 + g * t1), t2 = t1 + 2 * -vy1 / g, vx1 = vx0 * 0.7;
    let px, py;
    if (T < t1) { px = x + vx0 * T; py = y + vy0 * T + 0.5 * g * T * T; }
    else if (T < t2) { const u = T - t1; px = x + vx0 * t1 + vx1 * u; py = floor + vy1 * u + 0.5 * g * u * u; }
    else { const u = T - t2; px = x + vx0 * t1 + vx1 * (t2 - t1) + vx1 * 0.6 * u; py = floor; }
    const spin = dir * (T * 11 - Math.max(0, T - t1) * 5), a = 1 - clamp((k - 0.62) / 0.38, 0, 1);
    const q = Math.max(0, 1 - Math.abs(T - t1) / 0.06) + Math.max(0, 1 - Math.abs(T - t2) / 0.05) * 0.5;
    ctx.save();
    const hk = clamp(1 - (ground - py) / 150, 0.15, 1);
    ctx.globalAlpha = a * hk; ctx.drawImage(FX.shadow, px - 13 * (1.4 - hk * 0.4) - 3, ground - 3, 26 * (1.4 - hk * 0.4), 6);
    if (T >= t1 && T < t1 + 0.2) {
      const u = (T - t1) / 0.2, r = 4 + 9 * u;
      ctx.globalAlpha = (1 - u) * 0.7 * a; ctx.drawImage(FX.dust, px + 6 * u - r, ground - 3 - r * 0.6, r * 2, r * 1.2);
      ctx.drawImage(FX['fleck_' + ripe], px - 4 - 7 * u, ground - 6 - 5 * u, 5, 5);
    }
    ctx.globalAlpha = a;
    ctx.translate(px, py);
    if (q > 0) ctx.scale(1 + 0.14 * q, 1 - 0.2 * q);
    ctx.rotate(spin); ctx.scale(1.4, 1.4);
    blit(ctx, 'bagm_' + ripe + '_0', 1.4);
    ctx.restore();
  }

  const WM_AT = { cx: 0, cy: -31, w: 138 };
  const thoughtCache = {};
  function wordmarkFor(style) {
    if (!WM.img) return null;
    if (style === 'dusk') return WM.img;
    if (!WM.tinted) {
      const c = document.createElement('canvas'); c.width = WM.img.naturalWidth; c.height = WM.img.naturalHeight;
      const x = c.getContext('2d'); x.drawImage(WM.img, 0, 0);
      x.globalCompositeOperation = 'source-in'; x.fillStyle = '#1F4D33'; x.fillRect(0, 0, c.width, c.height);
      WM.tinted = c;
    }
    return WM.tinted;
  }
  function stepDown(src, w) {
    let c = src, cw = src.naturalWidth || src.width, ch = src.naturalHeight || src.height;
    while (cw > w * 2) {
      const n = document.createElement('canvas'); n.width = Math.round(cw / 2); n.height = Math.round(ch / 2);
      const x = n.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(c, 0, 0, n.width, n.height);
      c = n; cw = n.width; ch = n.height;
    }
    return c;
  }
  function thoughtCanvas(ctx, style, s) {
    const sp = sprites['thought_' + style]; if (!sp) return null;
    const lv = level(ctx), key = style + lv;
    if (thoughtCache[key]) return thoughtCache[key];
    const base = sp.lv[lv] || raster(sp, lv);
    const c = document.createElement('canvas'); c.width = base.width; c.height = base.height;
    const x = c.getContext('2d'); x.drawImage(base, 0, 0);
    const wm = wordmarkFor(style);
    if (wm) {
      const b = sp.box, w = WM_AT.w * lv, h = w * (wm.naturalHeight || wm.height) / (wm.naturalWidth || wm.width);
      x.imageSmoothingQuality = 'high';
      x.drawImage(stepDown(wm, w), (WM_AT.cx - b[0]) * lv - w / 2, (WM_AT.cy - b[1]) * lv - h / 2, w, h);
    }
    return (thoughtCache[key] = c);
  }
  const backOut = (a, c = 1.25) => 1 + (c + 1) * Math.pow(a - 1, 3) + c * Math.pow(a - 1, 2);

  const PUFFS = [[-1.5, -5.5, 0.36, 0], [-8.5, -17, 0.58, 0.12], [-18, -31.5, 0.86, 0.24]];
  function drawThought(ctx, x, y, k, t, o) {
    o = o || {};
    k = clamp(k == null ? 1 : k, 0, 1); if (k <= 0) return;
    t = t || 0;
    const style = o.style === 'dusk' ? 'dusk' : 'cream', s = o.scale == null ? 1 : o.scale;
    ctx.save();
    ctx.translate(x, y); if (s !== 1) ctx.scale(s, s);
    for (let i = 0; i < PUFFS.length; i++) {
      const [px, py, ps, k0] = PUFFS[i], a = clamp((k - k0) / 0.22, 0, 1);
      if (a <= 0) continue;
      const z = ps * backOut(a);
      ctx.save(); ctx.globalAlpha = a;
      ctx.translate(px + Math.sin(t * 0.6 - i) * 0.6, py + Math.sin(t * 1.15 - i * 0.7) * 1.1); ctx.scale(z, z);
      blit(ctx, 'puff_' + style, s * z);
      ctx.restore();
    }
    const a = clamp((k - 0.34) / 0.66, 0, 1);
    if (a > 0) {
      const c = thoughtCanvas(ctx, style, s), b = BOX3.thought;
      const z = (0.72 + 0.28 * backOut(a)) * (1 + 0.008 * Math.sin(t * 1.7));
      ctx.globalAlpha = a;
      ctx.translate(-26 + Math.sin(t * 0.55) * 1.4, -43 + Math.sin(t * 1.1) * 2.2 - 32);
      ctx.scale(z, z); ctx.translate(0, 32);
      if (c) ctx.drawImage(c, b[0], b[1], b[2], b[3]);
    }
    ctx.restore();
  }

  const Props = { ready, drawMango, drawObstacle, drawPickup, drawBanked, drawBagCarry, drawBagIcon, drawMangoDrop, drawThought,
    errors, get isReady() { return READY; }, _sprites: sprites, _levels: LEVELS };
  window.Props = Props;
})();
