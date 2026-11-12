

(function () {
  'use strict';
  if (window.Create && window.Create.__ltwh) return;

  const P = 'ltwh-create-';
  const SRC = (document.currentScript && document.currentScript.src) || '';
  const DIR = SRC ? SRC.slice(0, SRC.lastIndexOf('/') + 1) : 'create/';
  const ROOT = () => typeof window.CREATE_BASE === 'string' ? window.CREATE_BASE : DIR + '../';
  const FONTS_DIR = () => typeof window.CREATE_BASE === 'string' ? window.CREATE_BASE + 'create/fonts/' : DIR + 'fonts/';

  const DEBOUNCE = 120;
  const HOLD = 1.4;
  const QUIET = 450;
  const KEY = 'ltwh-create';
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;

  const COPY = {
    title: 'Who\u2019s running home?',
    sub: 'Make them yours. You can switch it up anytime.',
    plainTitle: 'Ready to run?',
    plainSub: 'Lace up. The long way home starts here.',
    groups: { body: 'Runner', skin: 'Skin', hair: 'Hair', facial: 'Facial hair', hat: 'Hat', kit: 'Kit' },
    shoe: 'Everyone runs in the ADIZERO Evo SL Thinking of You.',
    shuffle: 'Shuffle', go: 'Let\u2019s run', back: 'Back',
    keys: 'Left and right arrows choose. Up and down move between rows.',
  };

  const STUB = {
    body: [{ id: 'm', label: 'Him' }, { id: 'f', label: 'Her' }],
    skin: [{ id: 's1', swatch: '#3A2219' }, { id: 's2', swatch: '#5B3524' }, { id: 's3', swatch: '#7B4A30' }, { id: 's4', swatch: '#99613F' },
      { id: 's5', swatch: '#B98058' }, { id: 's6', swatch: '#D4A17B' }, { id: 's7', swatch: '#EAC4A2' }],
    hair: [{ id: 'fade', label: 'Fade' }, { id: 'buzz', label: 'Buzz' }, { id: 'curls', label: 'Curls' }, { id: 'locs', label: 'Locs' },
      { id: 'braids', label: 'Braids' }, { id: 'bun', label: 'Bun' }, { id: 'ponytail', label: 'Ponytail' }],
    facial: [{ id: 'none', label: 'None' }, { id: 'stubble' }, { id: 'beard' }, { id: 'goatee' }],
    hat: [{ id: 'cap', label: 'Cap' }, { id: 'visor' }, { id: 'none' }],
    kit: [{ id: 'verde', label: 'Verde', swatches: ['#1F6B3A', '#17151C', '#F28C28'] },
      { id: 'mango', label: 'Mango', swatches: ['#F28C28', '#2E2A4F', '#FFF6E5'] },
      { id: 'dusk', label: 'Dusk', swatches: ['#2E2A4F', '#17151C', '#F28C28'] },
      { id: 'crema', label: 'Crema', swatches: ['#FFF6E5', '#1F4D33', '#F28C28'] }],
  };
  const STUB_DEFAULT = { body: 'm', skin: 's4', hair: 'fade', facial: 'beard', hat: 'cap', kit: 'verde' };

  function adapter() {
    const R = window.Runner;
    const runner = R && typeof R.draw === 'function' ? R : null;
    const looks = runner && R.looks && typeof R.looks === 'object' && Array.isArray(R.looks.body) && typeof R.setLook === 'function' &&
      !(R.features && R.features.looks === false);
    if (looks) {
      return { mode: 'looks', R: runner, cat: R.looks,
        def: () => R.defaultLook || null, cur: () => R.look || R.defaultLook || null,
        setLook: l => R.setLook(l),
        random: typeof R.randomLook === 'function' ? () => R.randomLook() : null,
        parse: typeof R.parseLook === 'function' ? c => R.parseLook(c) : null };
    }
    if (window.CREATE_STUB && !(runner && R.looks)) {
      let worn = Object.assign({}, STUB_DEFAULT);
      return { mode: 'stub', R: runner, cat: STUB, def: () => STUB_DEFAULT, cur: () => worn,
        setLook: l => new Promise(res => setTimeout(() => { worn = Object.assign({}, l); res(worn); }, 140)),
        random: null, parse: null };
    }
    return { mode: runner ? 'plain' : 'none', R: runner };
  }
  const runnerReady = R => R && R.ready && typeof R.ready.then === 'function' ? R.ready : Promise.resolve(true);

  const FONTS = [['display', 'basteleur-bold.woff', '700'], ['ui', 'apfel-regular.woff', '400'], ['ui', 'apfel-mittel.woff', '500'],
    ['ui', 'apfel-satt.woff', '700'], ['num', 'anton.woff', '400']];
  function loadFonts() {
    const dir = FONTS_DIR();
    if (window.FontFace && document.fonts && document.fonts.add) {
      return Promise.all(FONTS.map(([fam, file, w]) => {
        try {
          const f = new FontFace(P + fam, 'url("' + dir + file + '") format("woff")', { weight: w, style: 'normal', display: 'swap' });
          document.fonts.add(f);
          return f.load().catch(() => null);
        } catch (e) { return null; }
      }));
    }
    const st = document.createElement('style');
    st.textContent = FONTS.map(([fam, file, w]) => '@font-face{font-family:"' + P + fam + '";src:url("' + dir + file + '") format("woff");font-weight:' + w + ';font-display:swap}').join('');
    (document.head || document.documentElement).appendChild(st);
    return Promise.resolve();
  }
  const WORDMARK = new Image();
  WORDMARK.decoding = 'async';
  const wordmarkLoaded = new Promise(res => { WORDMARK.onload = WORDMARK.onerror = () => res(); });
  WORDMARK.src = ROOT() + 'brand/wordmark.png';

  const ready = Promise.race([Promise.all([loadFonts(), wordmarkLoaded]), new Promise(r => setTimeout(r, 1500))]).then(() => true, () => true);

  function noiseURL() {
    try {
      const n = 96, c = document.createElement('canvas'); c.width = c.height = n;
      const g = c.getContext('2d'), im = g.createImageData(n, n), d = im.data;
      let s = 20261114;
      for (let i = 0; i < d.length; i += 4) {
        s = (s * 16807) % 2147483647; const v = s % 256 > 127 ? 255 : 0;
        s = (s * 16807) % 2147483647;
        d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = s % 15;
      }
      g.putImageData(im, 0, 0);
      return c.toDataURL('image/png');
    } catch (e) { return ''; }
  }
  function injectCss() {
    if (document.getElementById(P + 'style')) return;
    const noise = noiseURL();
    const grain = noise ? 'url(' + noise + ') 0 0/96px 96px,' : '';
    const st = document.createElement('style');
    st.id = P + 'style';
    st.textContent = `
@keyframes ${P}in{from{opacity:0}to{opacity:1}}
@keyframes ${P}out{from{opacity:1}to{opacity:0}}
@keyframes ${P}rise{from{opacity:0;transform:translateY(.5em)}to{opacity:1;transform:none}}
@keyframes ${P}spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
.${P}root{position:fixed;inset:0;z-index:2147483000;display:grid;grid-template-columns:minmax(0,1.08fr) minmax(min(100%,24em),1fr);
 grid-template-rows:100%;margin:0;background:#15130F;color:#FFF6E5;
 font:400 clamp(14.5px,calc(5.5px + 1.35vh),22px)/1.35 "${P}ui",ui-sans-serif,system-ui,sans-serif;
 -webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility;
 -webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;-webkit-touch-callout:none;
 touch-action:none;overscroll-behavior:none;animation:${P}in .24s ease-out both;outline:none}
.${P}root *,.${P}root *::before,.${P}root *::after{box-sizing:border-box}
.${P}root.${P}closing{animation:${P}out .2s ease-in forwards;pointer-events:none}
.${P}root :focus{outline:none}
.${P}root :focus-visible{outline:3px solid #F28C28;outline-offset:3px}
.${P}root :where(button){font:inherit;color:inherit;margin:0;-webkit-appearance:none;appearance:none;cursor:pointer;touch-action:manipulation}
.${P}sr{position:absolute!important;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}

/* ---- the stage: the live preview */
.${P}stage{position:relative;min-width:0;min-height:0;overflow:hidden;background:#2E2A4F}
.${P}stage canvas{position:absolute;left:0;top:0;width:100%;height:100%;display:block;pointer-events:none}
.${P}fg{opacity:0;transition:opacity .35s ease}
.${P}fg.${P}on{opacity:1}
.${P}wordmark{position:absolute;left:0;top:0;width:12em;height:auto;pointer-events:none;opacity:0;
 filter:drop-shadow(0 2px 12px rgba(24,14,36,.35));transition:opacity .5s ease .15s}
.${P}wordmark.${P}on{opacity:.96}
.${P}back{position:absolute;z-index:2;left:max(14px,env(safe-area-inset-left));top:max(14px,env(safe-area-inset-top));
 display:inline-flex;align-items:center;gap:.3em;min-height:44px;min-width:44px;padding:0 1em 0 .6em;border:0;border-radius:999px;
 background:rgba(21,19,15,.34);color:#FFF6E5;font-weight:500;font-size:.95em;box-shadow:inset 0 0 0 1px rgba(255,246,229,.18);
 transition:background .15s}
.${P}back:hover{background:rgba(21,19,15,.55)}
.${P}back svg{width:1.25em;height:1.25em}

/* ---- the panel: the options */
.${P}panel{position:relative;display:flex;flex-direction:column;min-width:0;min-height:0;
 background:${grain}linear-gradient(180deg,#28233F 0%,#1D1931 52%,#17141F 100%);
 box-shadow:-1px 0 0 rgba(255,246,229,.07),-28px 0 50px -26px rgba(0,0,0,.6)}
.${P}scroll{flex:1 1 auto;min-height:0;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;touch-action:pan-y;
 -webkit-overflow-scrolling:touch;padding:1.9em 2.4em 1.1em;scrollbar-width:thin;scrollbar-color:rgba(255,246,229,.22) transparent}
.${P}solo .${P}scroll{display:flex;flex-direction:column;justify-content:center}
.${P}more{position:relative;height:0;z-index:1;pointer-events:none}
.${P}more::before{content:"";position:absolute;left:0;right:0;bottom:0;height:3.2em;opacity:0;transition:opacity .2s ease;
 background:linear-gradient(180deg,rgba(27,23,40,0),rgba(27,23,40,.92))}
.${P}more.${P}on::before{opacity:1}
.${P}head{margin:0 0 1.1em;animation:${P}rise .45s ease-out both}
.${P}head::before{content:"";display:block;width:4.2em;height:.5em;margin:0 0 .6em -.15em;background:#F28C28;opacity:.92;transform:rotate(-1.6deg);
 clip-path:polygon(0 12%,5% 0,10% 14%,15% 2%,85% 0,90% 12%,95% 0,100% 10%,100% 90%,95% 100%,90% 86%,85% 100%,15% 98%,10% 86%,5% 100%,0 88%)}
.${P}title{margin:0;font:700 2.15em/1.02 "${P}display",Georgia,serif;letter-spacing:-.005em;color:#FFF6E5;text-wrap:balance}
.${P}sub{margin:.45em 0 0;max-width:27em;color:rgba(255,246,229,.72);font-size:.98em;text-wrap:pretty}
/* landscape: a spec sheet, the label to the left of its row, a hairline between rows */
.${P}groups{display:flex;flex-direction:column}
.${P}group{display:grid;grid-template-columns:5.7em minmax(0,1fr);column-gap:1em;align-items:start;min-width:0;margin:0;
 padding:.62em 0;border:0;border-top:1px solid rgba(255,246,229,.075);animation:${P}rise .45s ease-out both}
.${P}group:first-child{border-top:0;padding-top:0}
.${P}group[hidden]{display:none}
.${P}label{margin:0;font:500 .9em/max(44px,3.22em) "${P}ui",ui-sans-serif,system-ui,sans-serif;color:rgba(255,246,229,.74);white-space:nowrap}
.${P}g-body,.${P}g-hair.${P}pics{align-items:center}
.${P}g-body .${P}label,.${P}g-hair.${P}pics .${P}label{line-height:1.2}
.${P}opts{display:flex;flex-wrap:wrap;gap:.5em}

/* body tiles: two little dusk stages with the runner's portrait */
.${P}opts-body{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:.75em}
.${P}tile,.${P}hairtile{position:relative;display:block;padding:0;border:0;overflow:hidden;color:#FFF6E5;text-align:left;
 background:radial-gradient(85% 70% at 74% 104%,rgba(246,170,96,.55),rgba(246,170,96,0) 72%),linear-gradient(180deg,#2C2849 0%,#4E3D69 48%,#9A5F78 82%,#C7806E 100%);
 box-shadow:inset 0 0 0 1px rgba(255,246,229,.16);transition:box-shadow .16s ease,filter .16s ease,transform .16s ease}
.${P}tile{height:6.6em;min-height:88px;border-radius:.95em}
.${P}tile canvas,.${P}hairtile canvas{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 0;pointer-events:none;opacity:0;transition:opacity .35s ease}
.${P}tile canvas.${P}on,.${P}hairtile canvas.${P}on{opacity:1}
.${P}tile[aria-checked="false"],.${P}hairtile[aria-checked="false"]{filter:saturate(.7) brightness(.82)}
.${P}tile[aria-checked="false"]:hover,.${P}hairtile[aria-checked="false"]:hover{filter:saturate(.9) brightness(.95)}
.${P}tile[aria-checked="true"],.${P}hairtile[aria-checked="true"]{box-shadow:inset 0 0 0 2px #FFF6E5,0 12px 26px -14px rgba(0,0,0,.8)}
.${P}tile:active,.${P}hairtile:active{transform:scale(.97)}
.${P}tilename{position:absolute;left:.62em;bottom:.42em;font:700 1.5em/1 "${P}display",Georgia,serif;color:#FFF6E5;text-shadow:0 1px 10px rgba(24,14,36,.6)}
.${P}tick{position:absolute;right:.55em;top:.55em;display:grid;place-items:center;width:1.65em;height:1.65em;border-radius:50%;
 background:#FFF6E5;color:#15130F;opacity:0;transform:scale(.5);transition:opacity .16s ease,transform .2s cubic-bezier(.3,1.6,.6,1)}
.${P}tick svg{width:68%;height:68%}
.${P}tile[aria-checked="true"] .${P}tick{opacity:1;transform:none}

/* hair tiles: a head portrait each (labels only until the portraits are baked) */
.${P}opts-hair{display:grid;grid-template-columns:repeat(var(--cols,6),minmax(0,4.7em));gap:.45em}
.${P}hairtile{width:100%;min-width:44px;aspect-ratio:.84;border-radius:.8em;
 background:radial-gradient(90% 75% at 72% 105%,rgba(246,170,96,.45),rgba(246,170,96,0) 70%),linear-gradient(180deg,#2C2849,#46375F 62%,#76506E)}
.${P}hairtile span{position:absolute;left:0;right:0;bottom:0;padding:1.1em .15em .4em;font-size:.76em;font-weight:500;line-height:1;text-align:center;
 white-space:nowrap;overflow:hidden;text-overflow:ellipsis;background:linear-gradient(180deg,rgba(21,19,15,0),rgba(21,19,15,.78))}
.${P}hairtile:not(.${P}has) span{top:0;display:grid;place-items:center;padding:0 .2em;font-size:.86em;background:none}

/* skin swatches: one row, or two even rows when one does not fit */
.${P}opts-skin{display:grid;grid-template-columns:repeat(var(--cols,8),max-content);gap:.3em .3em}
.${P}opts-skin.${P}spread,.${P}opts-hair.${P}spread{column-gap:0;justify-content:space-between}
.${P}swatch{position:relative;display:grid;place-items:center;width:max(44px,2.95em);height:max(44px,2.95em);padding:0;border:0;border-radius:50%;background:transparent}
.${P}swatch i{display:block;width:74%;height:74%;border-radius:50%;background:var(--c);
 box-shadow:inset 0 -.18em .35em rgba(0,0,0,.28),inset 0 .12em .2em rgba(255,236,210,.22),0 0 0 1px rgba(255,246,229,.1)}
.${P}swatch::after{content:"";position:absolute;inset:2px;border-radius:50%;box-shadow:inset 0 0 0 2px rgba(255,246,229,0);transition:box-shadow .15s ease}
.${P}swatch:hover::after{box-shadow:inset 0 0 0 2px rgba(255,246,229,.3)}
.${P}swatch[aria-checked="true"]::after{box-shadow:inset 0 0 0 2px #FFF6E5}

/* text chips (facial hair, hat, hair without portraits) and kit chips */
.${P}chip,.${P}kit{display:inline-flex;align-items:center;gap:.55em;min-height:max(44px,2.9em);padding:0 1.05em;border:0;border-radius:999px;
 background:rgba(255,246,229,.06);color:#FFF6E5;font-weight:500;font-size:.98em;line-height:1;white-space:nowrap;
 box-shadow:inset 0 0 0 1px rgba(255,246,229,.16);transition:background .15s ease,color .15s ease,box-shadow .15s ease}
.${P}chip:hover,.${P}kit:hover{background:rgba(255,246,229,.12)}
.${P}chip[aria-checked="true"],.${P}kit[aria-checked="true"]{background:#FFF6E5;color:#15130F;box-shadow:none}
.${P}kit{padding:0 1.05em 0 .42em}
.${P}kit b{display:block;flex:none;width:2.05em;height:2.05em;border-radius:50%;overflow:hidden;
 background:linear-gradient(180deg,var(--a) 0 52%,var(--c) 52% 63%,var(--b) 63% 100%);
 box-shadow:inset 0 0 0 1px rgba(0,0,0,.22),inset 0 .12em .2em rgba(255,255,255,.18)}

/* footer: the shoe line, Shuffle, Let's run */
.${P}foot{flex:none;display:grid;grid-template-columns:auto minmax(0,1fr);align-items:center;gap:.65em .7em;
 padding:.85em 2.4em max(1.05em,env(safe-area-inset-bottom));border-top:1px solid rgba(255,246,229,.08);
 background:linear-gradient(180deg,rgba(26,22,38,.4),rgba(23,20,31,.95))}
.${P}foot.${P}solo{grid-template-columns:minmax(0,1fr)}
.${P}shoe{grid-column:1/-1;display:flex;align-items:center;gap:.6em;margin:0;font-size:.86em;line-height:1.25;color:rgba(255,246,229,.72)}
.${P}shoe img{flex:none;width:3.3em;height:auto;filter:drop-shadow(0 2px 3px rgba(0,0,0,.35))}
.${P}shuffle{display:inline-flex;align-items:center;justify-content:center;gap:.45em;min-height:max(52px,3.35em);padding:0 1.15em;border:0;border-radius:.85em;
 background:rgba(255,246,229,.06);color:#FFF6E5;font-weight:500;box-shadow:inset 0 0 0 1px rgba(255,246,229,.22);transition:background .15s ease}
.${P}shuffle:hover{background:rgba(255,246,229,.12)}
.${P}shuffle svg{width:1.2em;height:1.2em}
.${P}shuffle.${P}spun svg{animation:${P}spin .5s cubic-bezier(.3,.9,.4,1)}
.${P}go{display:inline-flex;align-items:center;justify-content:center;gap:.5em;min-height:max(52px,3.35em);padding:0 1.3em;border:0;border-radius:.85em;
 background:linear-gradient(180deg,#F7A043,#F28C28 55%,#E27D1C);color:#15130F;font:700 1.3em/1 "${P}display",Georgia,serif;
 box-shadow:inset 0 1px 0 rgba(255,236,200,.55),0 2px 0 #A85A12,0 14px 26px -14px rgba(242,140,40,.85);transition:transform .12s ease,box-shadow .12s ease,filter .15s}
.${P}go:hover{filter:brightness(1.05)}
.${P}go:active{transform:translateY(2px);box-shadow:inset 0 1px 0 rgba(255,236,200,.5),0 0 0 #A85A12,0 8px 18px -12px rgba(242,140,40,.8)}
.${P}go svg{width:.95em;height:.95em}

/* phones held upright (and any tall window): preview on top, options below in a sheet that scrolls */
@media (max-aspect-ratio: 1/1){
 .${P}root{grid-template-columns:100%;grid-template-rows:minmax(0,43fr) minmax(0,57fr);font-size:clamp(13.5px,3.85vw,17px)}
 .${P}panel{z-index:1;margin-top:-1.3em;border-radius:1.3em 1.3em 0 0;box-shadow:0 -14px 30px -12px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,246,229,.08)}
 .${P}scroll{padding:1.35em 1.2em .9em}
 .${P}head{margin-bottom:1em}
 .${P}head::before{display:none}
 .${P}title{font-size:1.8em}
 .${P}sub{font-size:.93em}
 .${P}groups{gap:1.05em}
 .${P}group{display:block;padding:0;border:0}
 .${P}label,.${P}g-body .${P}label,.${P}g-hair.${P}pics .${P}label{line-height:1.2;margin:0 0 .5em}
 .${P}tile{height:7em}
 .${P}foot{padding:.75em 1.2em max(.85em,env(safe-area-inset-bottom))}
}
@media (prefers-reduced-motion: reduce){
 .${P}root,.${P}root *{animation:none!important;transition:none!important}
}
`;
    (document.head || document.documentElement).appendChild(st);
  }

  function el(tag, cls, attrs, kids) {
    const e = document.createElement(tag);
    if (cls) e.className = cls.split(' ').map(c => P + c).join(' ');
    if (attrs) for (const k in attrs) { if (attrs[k] != null) e.setAttribute(k, attrs[k]); }
    if (kids) for (const k of kids) if (k != null) e.appendChild(typeof k === 'string' ? document.createTextNode(k) : k);
    return e;
  }
  const ICON = {
    back: '<path d="M14.5 5.5 8 12l6.5 6.5"/>',
    go: '<path d="M4.5 12h14M13 6l6 6-6 6"/>',
    tick: '<path d="M5 12.5 10 17.2 19 7.5"/>',
    shuffle: '<path d="M3 7.5h3.2c2.1 0 3.4 1 4.6 2.9l1.6 2.6c1.2 1.9 2.5 3.5 4.9 3.5H20M3 16.5h3.2c1.4 0 2.5-.5 3.4-1.4M13.7 8.9c.9-.9 2-1.4 3.6-1.4H20M17.2 4.6 20 7.5l-2.8 2.9M17.2 13.6 20 16.5l-2.8 2.9"/>',
  };
  function icon(name, w) {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('aria-hidden', 'true'); s.setAttribute('focusable', 'false');
    s.setAttribute('fill', 'none'); s.setAttribute('stroke', 'currentColor'); s.setAttribute('stroke-width', w || '2.2');
    s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round');
    s.innerHTML = ICON[name];
    return s;
  }
  const titleCase = s => String(s).replace(/[_-]+/g, ' ').replace(/^\w/, c => c.toUpperCase());
  const labelOf = it => it.label || (it.id === 'none' ? 'None' : titleCase(it.id));

  function rng(seed) { let a = seed | 0; return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function paintBackdrop(c, L) {
    const W = c.width, H = c.height, g = c.getContext('2d'), k = L.k, gy = L.gy, fx = L.fx;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;

    let gr = g.createLinearGradient(0, Math.min(0, gy - 900 * k), 0, gy);
    [[0, '#1B1830'], [0.32, '#2E2A4F'], [0.55, '#4F3E6E'], [0.72, '#8A5679'], [0.85, '#C9746E'], [0.94, '#EC9A69'], [1, '#F6C08B']]
      .forEach(([o, col]) => gr.addColorStop(o, col));
    g.fillStyle = gr; g.fillRect(0, 0, W, gy + 2);

    const sx = Math.min(W * 0.84, fx + 250 * k), sy = gy - 112 * k;
    gr = g.createRadialGradient(sx, sy, 0, sx, sy, Math.max(W, H) * 0.75);
    gr.addColorStop(0, 'rgba(255,226,170,0.62)'); gr.addColorStop(0.12, 'rgba(252,182,120,0.36)'); gr.addColorStop(0.42, 'rgba(232,130,110,0.12)'); gr.addColorStop(1, 'rgba(200,110,120,0)');
    g.fillStyle = gr; g.fillRect(0, 0, W, gy + 2);

    g.save(); g.globalCompositeOperation = 'screen';
    const R = rng(7);
    for (let i = 0; i < 9; i++) {
      const a = -Math.PI * (0.52 + 0.46 * R()), w = 0.025 + 0.05 * R(), len = Math.max(W, H) * 1.2;
      const grd = g.createRadialGradient(sx, sy, 0, sx, sy, len);
      grd.addColorStop(0, 'rgba(255,214,160,' + (0.10 + 0.08 * R()).toFixed(3) + ')'); grd.addColorStop(1, 'rgba(255,214,160,0)');
      g.fillStyle = grd; g.beginPath(); g.moveTo(sx, sy);
      g.lineTo(sx + Math.cos(a - w) * len, sy + Math.sin(a - w) * len); g.lineTo(sx + Math.cos(a + w) * len, sy + Math.sin(a + w) * len); g.closePath(); g.fill();
    }
    g.restore();
    gr = g.createRadialGradient(sx, sy, 0, sx, sy, 44 * k);
    gr.addColorStop(0, 'rgba(255,244,214,0.95)'); gr.addColorStop(0.55, 'rgba(255,230,186,0.85)'); gr.addColorStop(1, 'rgba(255,214,160,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(sx, sy, 44 * k, 0, Math.PI * 2); g.fill();

    const far = document.createElement('canvas'); far.width = W; far.height = H;
    const f = far.getContext('2d'), r = rng(20261114);
    let x = -60 * k;
    while (x < W + 60 * k) {
      const w = (90 + r() * 150) * k, h = (70 + r() * 170) * k, top = gy - h;
      const lit = clamp(1 - Math.abs(x + w / 2 - sx) / (520 * k), 0, 1);
      f.fillStyle = 'rgba(' + Math.round(84 + 40 * lit) + ',' + Math.round(58 + 22 * lit) + ',' + Math.round(104 + 4 * lit) + ',0.92)';
      f.beginPath();
      if (r() < 0.4) {
        const s = (8 + r() * 6) * k;
        f.moveTo(x, gy); f.lineTo(x, top + 2 * s); f.lineTo(x + w * 0.22, top + 2 * s); f.lineTo(x + w * 0.22, top + s); f.lineTo(x + w * 0.38, top + s);
        f.lineTo(x + w * 0.38, top); f.lineTo(x + w * 0.62, top); f.lineTo(x + w * 0.62, top + s); f.lineTo(x + w * 0.78, top + s);
        f.lineTo(x + w * 0.78, top + 2 * s); f.lineTo(x + w, top + 2 * s); f.lineTo(x + w, gy); f.closePath();
      } else if (r() < 0.3) {
        const rr = Math.min(w, h) * 0.35;
        f.moveTo(x, gy); f.lineTo(x, top + rr); f.quadraticCurveTo(x, top, x + rr, top); f.lineTo(x + w, top); f.lineTo(x + w, gy); f.closePath();
      } else f.rect(x, top, w, h);
      f.fill();
      if (r() < 0.18) {
        const tx = x + w * (0.3 + 0.4 * r()), tw = 26 * k;
        f.fillRect(tx - 1.5 * k, top - 40 * k, 3 * k, 40 * k); f.fillRect(tx + tw - 1.5 * k, top - 40 * k, 3 * k, 40 * k);
        f.beginPath(); f.ellipse(tx + tw / 2, top - 46 * k, tw * 0.62, 14 * k, 0, 0, Math.PI * 2); f.fill();
      }
      const rows = Math.floor(h / (34 * k)), cols = Math.floor(w / (30 * k));
      for (let i = 1; i < rows; i++) for (let j = 1; j < cols; j++) {
        if (r() > 0.12) continue;
        f.fillStyle = r() < 0.5 ? 'rgba(255,200,128,0.85)' : 'rgba(255,170,120,0.7)';
        f.fillRect(x + j * 30 * k - 5 * k, top + i * 34 * k, 9 * k, 12 * k);
      }
      x += w + (r() < 0.35 ? (20 + r() * 60) * k : 0);
    }
    const palm = (px, base, h, lean, col, s) => {
      const tx = px + lean * h, ty = base - h;
      f.strokeStyle = col; f.fillStyle = col; f.lineCap = 'round';
      f.lineWidth = 6.5 * k * s; f.beginPath(); f.moveTo(px, base); f.quadraticCurveTo(px + lean * h * 0.15, base - h * 0.6, tx, ty); f.stroke();
      for (let i = 0; i < 11; i++) {
        const a = Math.PI * (-0.04 - 0.92 * i / 10) + (r() - 0.5) * 0.12, len = (62 + 26 * r()) * k * s;
        const ex = tx + Math.cos(a) * len, ey = ty + Math.sin(a) * len * 0.42 + len * 0.42;
        const mx = tx + Math.cos(a) * len * 0.55, my = ty + Math.sin(a) * len * 0.55 - len * 0.12;
        const nx = -Math.sin(a) * 4.5 * k * s, ny = Math.cos(a) * 4.5 * k * s;
        f.beginPath(); f.moveTo(tx, ty); f.quadraticCurveTo(mx + nx, my + ny, ex, ey); f.quadraticCurveTo(mx - nx, my - ny, tx, ty); f.fill();
      }
    };
    const P1 = rng(3);
    for (let i = 0; i < 6; i++) {
      const px = W * (0.04 + 0.19 * i + 0.08 * P1()), h = (230 + 160 * P1()) * k;
      palm(px, gy, h, (P1() - 0.35) * 0.18, 'rgba(58,40,78,0.9)', 0.9 + 0.3 * P1());
    }
    if (g.filter !== undefined) { g.filter = 'blur(' + Math.max(1, 2.6 * k).toFixed(1) + 'px)'; g.drawImage(far, 0, 0); g.filter = 'none'; }
    else g.drawImage(far, 0, 0);

    gr = g.createLinearGradient(0, gy - 260 * k, 0, gy);
    gr.addColorStop(0, 'rgba(244,170,120,0)'); gr.addColorStop(1, 'rgba(244,178,128,0.42)');
    g.fillStyle = gr; g.fillRect(0, gy - 260 * k, W, 260 * k);

    g.save(); g.globalCompositeOperation = 'screen';
    const B = rng(5);
    for (let i = 0; i < 16; i++) {
      const bx = W * B(), by = gy - (16 + 150 * B() * B()) * k, br = (7 + 15 * B()) * k, a = 0.1 + 0.2 * B();
      const warm = B() < 0.75, c0 = warm ? '255,206,140' : '255,150,170';
      const gg = g.createRadialGradient(bx, by, 0, bx, by, br);
      gg.addColorStop(0, 'rgba(' + c0 + ',' + a.toFixed(3) + ')'); gg.addColorStop(0.72, 'rgba(' + c0 + ',' + (a * 0.75).toFixed(3) + ')'); gg.addColorStop(1, 'rgba(' + c0 + ',0)');
      g.fillStyle = gg; g.beginPath(); g.arc(bx, by, br, 0, Math.PI * 2); g.fill();
    }
    g.restore();

    const sw = 44 * k, cb = 6 * k;
    g.fillStyle = '#A9967F'; g.fillRect(0, gy, W, sw);
    g.save(); g.translate(fx + 50 * k, gy + sw * 0.4); g.scale(1, 0.13);
    gr = g.createRadialGradient(0, 0, 0, 0, 0, 520 * k);
    gr.addColorStop(0, 'rgba(255,226,176,1)'); gr.addColorStop(0.35, 'rgba(250,206,154,0.85)'); gr.addColorStop(0.7, 'rgba(226,180,140,0.35)'); gr.addColorStop(1, 'rgba(210,170,140,0)');
    g.fillStyle = gr; g.fillRect(-600 * k, -600 * k, 1200 * k, 1200 * k); g.restore();
    g.fillStyle = 'rgba(52,34,52,0.16)';
    for (let jx = fx - 45 * k - Math.ceil(fx / (90 * k)) * 90 * k; jx < W; jx += 90 * k) g.fillRect(Math.round(jx), gy, Math.max(1, 1.6 * k), sw);
    g.fillStyle = 'rgba(255,238,206,0.55)'; g.fillRect(0, gy, W, Math.max(1, 1.2 * k));

    g.save(); g.translate(fx - 150 * k, gy + 7 * k); g.scale(1, 0.055);
    gr = g.createRadialGradient(0, 0, 0, 0, 0, 230 * k);
    gr.addColorStop(0, 'rgba(48,30,58,0.42)'); gr.addColorStop(0.6, 'rgba(48,30,58,0.18)'); gr.addColorStop(1, 'rgba(48,30,58,0)');
    g.fillStyle = gr; g.fillRect(-260 * k, -260 * k, 520 * k, 520 * k); g.restore();

    g.fillStyle = '#8E7C6C'; g.fillRect(0, gy + sw, W, cb);
    g.fillStyle = 'rgba(40,26,40,0.5)'; g.fillRect(0, gy + sw + cb - Math.max(1, k), W, Math.max(1, k));
    gr = g.createLinearGradient(0, gy + sw + cb, 0, H);
    gr.addColorStop(0, '#2A2333'); gr.addColorStop(1, '#17131E');
    g.fillStyle = gr; g.fillRect(0, gy + sw + cb, W, Math.max(0, H - gy - sw - cb));
    g.save(); g.translate(sx, gy + sw + cb + 10 * k); g.scale(1, 0.12);
    gr = g.createRadialGradient(0, 0, 0, 0, 0, 420 * k); gr.addColorStop(0, 'rgba(240,150,100,0.22)'); gr.addColorStop(1, 'rgba(240,150,100,0)');
    g.fillStyle = gr; g.fillRect(-500 * k, -500 * k, 1000 * k, 1000 * k); g.restore();

    const m = Math.max(W, H);
    gr = g.createRadialGradient(fx + 40 * k, gy - 200 * k, m * 0.18, fx + 40 * k, gy - 200 * k, m * 0.85);
    gr.addColorStop(0, 'rgba(14,10,24,0)'); gr.addColorStop(1, 'rgba(14,10,24,0.55)');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    try {
      const n = 128, nc = document.createElement('canvas'); nc.width = nc.height = n;
      const ng = nc.getContext('2d'), im = ng.createImageData(n, n), d = im.data, q = rng(11);
      for (let i = 0; i < d.length; i += 4) { const v = q() > 0.5 ? 255 : 0; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = Math.floor(q() * 12); }
      ng.putImageData(im, 0, 0);
      g.fillStyle = g.createPattern(nc, 'repeat'); g.fillRect(0, 0, W, H);
    } catch (e) {   }
  }

  const PCACHE = new Map();
  function cachePut(key, c) {
    const copy = document.createElement('canvas'); copy.width = c.width; copy.height = c.height;
    copy.getContext('2d').drawImage(c, 0, 0);
    PCACHE.set(key, copy);
    if (PCACHE.size > 24) PCACHE.delete(PCACHE.keys().next().value);
  }
  const STAND = { x: 0, ground: 0, h: 0, phase: 0, pace: 0.3, speed: 0, beatInterval: 0.62, air: false, vy: 0, stumble: 0, t: 0,
    static: true, pose: 'stand', poseT: 3 };

  function drawPortrait(R, cv, crop) {
    const g = cv.getContext('2d'), W = cv.width, H = cv.height;
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
    let a = null;
    try { a = R.draw(g, Object.assign({ noDraw: true }, STAND)); } catch (e) { a = null; }
    const top = a && a.headTop ? a.headTop.y : -398, hx = a && a.head ? a.head.x : 8;
    if (crop === 'head') {
      const k = H / 102;
      g.setTransform(k, 0, 0, k, W * 0.5 - (hx - 8) * k, H * 0.08 - top * k);
    } else {
      const k = H / 172;
      g.setTransform(k, 0, 0, k, W * 0.64 - (hx - 4) * k, H * 0.09 - top * k);
    }
    R.draw(g, STAND);
    g.setTransform(1, 0, 0, 1, 0, 0);
  }

  let current = null;

  function create(opts) {
    opts = opts || {};

    const byPointer = /^(pointer|mouse|touch|click)/.test((window.event && window.event.type) || '');
    const A = adapter();
    const full = A.mode === 'looks' || A.mode === 'stub';
    const pics = A.mode === 'looks';
    const hasR = !!A.R;
    const reduced = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
    const S = { closed: false, openedAt: performance.now(), t0: performance.now() / 1000 };
    const clock = () => performance.now() / 1000 - S.t0;

    const cat = full ? A.cat : null;
    const ORDER = ['body', 'skin', 'hair', 'facial', 'hat', 'kit'];
    const keys = full ? ORDER.filter(k => Array.isArray(cat[k]) && cat[k].length)
      .concat(Object.keys(cat).filter(k => ORDER.indexOf(k) < 0 && Array.isArray(cat[k]) && cat[k].length && cat[k][0] && cat[k][0].id != null)) : [];
    const has = (k, id) => !!(cat && cat[k] && cat[k].some(it => it.id === id));
    const def = full ? (A.def() || {}) : {};
    function norm(l) {
      const o = Object.assign({}, l || {});
      for (const k of keys) {
        if (!has(k, o[k])) o[k] = has(k, def[k]) ? def[k] : cat[k][0].id;
      }
      return o;
    }
    const same = (a, b) => !!a && !!b && keys.every(k => a[k] === b[k]);
    const keyOf = l => keys.map(k => l[k]).join('.');
    function parseIn(v) {
      if (!v) return null;
      if (typeof v === 'string') { try { return A.parse ? A.parse(v) : null; } catch (e) { return null; } }
      return typeof v === 'object' ? v : null;
    }
    const startLook = full ? Object.assign({}, A.cur() || def) : null;
    let look = full ? norm(parseIn(opts.look) || A.cur() || def) : null;

    let facialM = full ? (look.body === 'm' && has('facial', look.facial) ? look.facial : (has('facial', def.facial) ? def.facial : null)) : null;
    function variant(l, body) {
      const o = Object.assign({}, l, { body });
      if (has('facial', 'none') && body !== 'm') o.facial = 'none';
      else if (body === 'm' && facialM && has('facial', facialM)) o.facial = facialM;
      return o;
    }
    const outLook = () => full ? variant(look, look.body) : null;

    injectCss();
    const root = el('div', 'root', { role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': P + 'title', tabindex: '-1' });
    const stage = el('div', 'stage');
    const back = el('canvas', null, { 'aria-hidden': 'true' });
    const fg = el('canvas', 'fg', { role: 'img', 'aria-label': 'Your runner' });
    const wm = el('img', 'wordmark', { alt: '', 'aria-hidden': 'true', draggable: 'false', src: WORDMARK.src });
    const backBtn = el('button', 'back', { type: 'button' }, [icon('back', '2.4'), el('span', null, null, [COPY.back])]);
    stage.append(back);
    if (hasR) stage.appendChild(fg);
    stage.append(wm, backBtn);

    const panel = el('div', 'panel');
    const scroll = el('div', 'scroll');
    const head = el('header', 'head', null, [
      el('h2', 'title', { id: P + 'title' }, [full ? COPY.title : COPY.plainTitle]),
      el('p', 'sub', { id: P + 'sub' }, [full ? COPY.sub : COPY.plainSub]),
      el('p', 'sr', { id: P + 'keys' }, [COPY.keys])]);
    root.setAttribute('aria-describedby', P + 'sub ' + P + 'keys');
    if (!full) panel.classList.add(P + 'solo');
    scroll.appendChild(head);
    const groups = {};
    const groupsEl = el('div', 'groups');
    if (full) {
      for (const key of keys) {
        const items = cat[key];
        const lid = P + 'l-' + key;
        const kind = key === 'body' ? 'body' : key === 'skin' || items[0].swatch ? 'skin' : key === 'kit' || items[0].swatches ? 'kit'
          : key === 'hair' && pics ? 'hair' : 'chip';
        const sec = el('section', 'group g-' + key + (kind === 'hair' ? ' pics' : ''), { 'data-key': key });
        sec.style.animationDelay = (0.04 + 0.04 * keys.indexOf(key)).toFixed(2) + 's';
        sec.appendChild(el('h3', 'label', { id: lid }, [COPY.groups[key] || titleCase(key)]));
        const box = el('div', 'opts opts-' + kind, { role: 'radiogroup', 'aria-labelledby': lid });
        const btns = items.map((it, i) => {
          const b = el('button', kind === 'body' ? 'tile' : kind === 'skin' ? 'swatch' : kind === 'kit' ? 'kit' : kind === 'hair' ? 'hairtile' : 'chip',
            { type: 'button', role: 'radio', 'aria-checked': 'false', tabindex: '-1', 'data-key': key, 'data-id': it.id });
          if (kind === 'body') {
            b.append(el('canvas', null, { 'aria-hidden': 'true' }), el('span', 'tilename', null, [labelOf(it)]), el('span', 'tick', { 'aria-hidden': 'true' }, [icon('tick', '3')]));
          } else if (kind === 'hair') {
            b.append(el('canvas', null, { 'aria-hidden': 'true' }), el('span', null, null, [labelOf(it)]));
          } else if (kind === 'skin') {
            const dot = document.createElement('i'); dot.style.setProperty('--c', it.swatch || '#888');
            b.appendChild(dot);
            b.setAttribute('aria-label', 'Skin tone ' + (i + 1) + ' of ' + items.length);
          } else if (kind === 'kit') {
            const sw = it.swatches || [], dot = document.createElement('b');
            dot.style.setProperty('--a', sw[0] || '#555'); dot.style.setProperty('--b', sw[1] || sw[0] || '#333'); dot.style.setProperty('--c', sw[2] || sw[1] || sw[0] || '#555');
            b.append(dot, el('span', null, null, [labelOf(it)]));
          } else b.appendChild(el('span', null, null, [labelOf(it)]));
          box.appendChild(b);
          return b;
        });
        sec.appendChild(box);
        groupsEl.appendChild(sec);
        groups[key] = { sec, box, items: btns, kind };
      }
      scroll.appendChild(groupsEl);
    }
    const foot = el('div', 'foot' + (full ? '' : ' solo'));
    const shoeImg = el('img', null, { src: ROOT() + 'shoe.svg', alt: '', 'aria-hidden': 'true', draggable: 'false', decoding: 'async' });
    const shoeLine = el('p', 'shoe', null, [shoeImg, el('span', null, null, [COPY.shoe])]);
    const shuffleBtn = full ? el('button', 'shuffle', { type: 'button' }, [icon('shuffle', '2'), el('span', null, null, [COPY.shuffle])]) : null;
    const goBtn = el('button', 'go', { type: 'button' }, [el('span', null, null, [COPY.go]), icon('go', '2.6')]);
    for (const n of [shoeLine, shuffleBtn, goBtn]) if (n) foot.appendChild(n);
    const more = el('div', 'more', { 'aria-hidden': 'true' });
    panel.append(scroll, more, foot);
    const moreCheck = () => { more.classList.toggle(P + 'on', scroll.scrollTop + scroll.clientHeight < scroll.scrollHeight - 4); };
    scroll.addEventListener('scroll', moreCheck, { passive: true });
    const live = el('div', 'sr', { 'aria-live': 'polite', 'aria-atomic': 'true' });
    root.append(stage, panel, live);
    (document.body || document.documentElement).appendChild(root);

    function itemOf(k, id) { return cat[k].find(it => it.id === id) || {}; }
    function describe() {
      if (!full) return 'Your runner';
      const o = outLook(), parts = [];
      for (const k of keys) {
        const it = itemOf(k, o[k]), i = cat[k].indexOf(it);
        if (k === 'skin') parts.push('skin tone ' + (i + 1) + ' of ' + cat[k].length);
        else if (k === 'facial') { if (o.body === 'm') parts.push(it.id === 'none' ? 'no facial hair' : labelOf(it).toLowerCase()); }
        else if (k === 'hat') parts.push(it.id === 'none' ? 'no hat' : labelOf(it).toLowerCase());
        else if (k === 'hair') parts.push(labelOf(it).toLowerCase() + ' hair');
        else if (k === 'kit') parts.push(labelOf(it) + ' kit');
        else parts.push(labelOf(it));
      }
      return 'Your runner: ' + parts.join(', ');
    }
    function setDescribed() { if (hasR) fg.setAttribute('aria-label', describe()); }
    function announce(s) { live.textContent = ''; setTimeout(() => { if (!S.closed) live.textContent = s; }, 30); }

    function refresh(key) {
      const G = groups[key]; if (!G) return;
      for (const b of G.items) {
        const on = b.dataset.id === look[key];
        b.setAttribute('aria-checked', on ? 'true' : 'false');
        b.tabIndex = on ? 0 : -1;
      }
    }
    function refreshFacial() {
      if (groups.facial) groups.facial.sec.hidden = look.body !== 'm';
      groupsEl.setAttribute('data-body', look.body);
      moreCheck();
    }
    if (full) { for (const k of keys) refresh(k); refreshFacial(); }
    setDescribed();

    const ctx = hasR ? fg.getContext('2d') : null;
    let L = null, raf = 0, dirty = null;
    function layout() {
      const r = stage.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = Math.max(1, Math.round(r.width * dpr)), H = Math.max(1, Math.round(r.height * dpr));
      const tall = window.matchMedia ? matchMedia('(max-aspect-ratio: 1/1)').matches : r.width < r.height;
      balance();
      moreCheck();
      if (L && L.W === W && L.H === H && L.tall === tall) return;
      const overlap = tall ? 1.3 * parseFloat(getComputedStyle(root).fontSize || '15') * dpr : 0;
      const gy = Math.round((H - overlap) * (tall ? 0.84 : 0.855));
      const topPad = tall ? H * 0.06 : H * 0.17;
      const k = Math.min((gy - topPad) / 400, W * 0.64 / 300);
      const fx = Math.round(W * (tall ? 0.4 : 0.43));
      L = { W, H, dpr, k, gy, fx, tall };
      back.width = W; back.height = H;
      paintBackdrop(back, L);
      if (hasR) { fg.width = W; fg.height = H; dirty = null; }

      const ck = k / dpr, fxC = fx / dpr, headTop = (gy - 402 * k) / dpr;
      let ww = clamp(r.width * (tall ? 0.38 : 0.36), 110, 320), wh = ww * 409 / 1400;
      let wx = fxC + 32 * ck - ww * 0.42, wy = headTop - wh - 10;
      if (!hasR) { wx = (r.width - ww) / 2; wy = r.height * 0.32; }
      else if (wy < 10) { wx = fxC + 92 * ck; wy = Math.max(12, headTop + 4); }
      if (wx + ww > r.width - 12) { ww = Math.max(96, r.width - 12 - wx); wh = ww * 409 / 1400; }
      wm.style.width = ww.toFixed(1) + 'px'; wm.style.transform = 'translate(' + wx.toFixed(1) + 'px,' + wy.toFixed(1) + 'px)';
      if (hasR) render(clock());
    }

    function balance() {
      for (const k in groups) {
        const G = groups[k]; if (G.kind !== 'skin' && G.kind !== 'hair') continue;
        const n = G.items.length, w = G.box.clientWidth, em = parseFloat(getComputedStyle(G.box).fontSize) || 15;
        const gap = (G.kind === 'skin' ? 0.3 : 0.45) * em;
        const b = G.kind === 'skin' ? Math.max(44, 2.95 * em) : Math.max(46, 3 * em);
        let cols = n, spread = false;
        if (n * b + (n - 1) * gap > w + 0.5) {
          if (G.kind === 'skin' && n * b <= w + 0.5) spread = true;
          else { cols = Math.ceil(n / 2); spread = true; }
        }
        G.box.style.setProperty('--cols', String(cols));
        G.box.classList.toggle(P + 'spread', spread);
      }
    }

    const pose = { on: false, t0: 0, until: 0 };
    function bumpPose() { if (!hasR) return; const t = clock(); if (!pose.on) { pose.on = true; pose.t0 = t; } pose.until = Infinity; }
    function settled() { if (pose.on && pose.until === Infinity) pose.until = clock() + HOLD; }
    let showing = true, flashT = -9;
    function render(t) {
      if (!ctx || !L || !A.R || !showing) return;
      if (dirty) ctx.clearRect(dirty[0], dirty[1], dirty[2], dirty[3]); else ctx.clearRect(0, 0, L.W, L.H);
      const k = L.k;
      dirty = [Math.max(0, Math.floor(L.fx - 260 * k)), Math.max(0, Math.floor(L.gy - 520 * k)), Math.ceil(560 * k), Math.ceil(600 * k)];
      ctx.setTransform(k, 0, 0, k, L.fx, L.gy);
      const fl = 1 - (t - flashT) / 0.7;
      if (fl > 0) {
        const gr = ctx.createRadialGradient(10, -210, 0, 10, -210, 300);
        gr.addColorStop(0, 'rgba(255,214,150,' + (0.34 * fl * fl).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(255,214,150,0)');
        ctx.fillStyle = gr; ctx.fillRect(-300, -520, 600, 600);
      }
      if (pose.on && t > pose.until) pose.on = false;
      const st = { x: 0, ground: 0, h: 0, phase: t * 3.3, pace: 0.3, speed: 0, beatInterval: 0.62, air: false, vy: 0, stumble: 0, t, key: KEY };
      if (reduced || pose.on) { st.pose = 'stand'; st.poseT = reduced ? 6 + t : t - pose.t0; }
      try { A.R.draw(ctx, st); } catch (e) {   }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    function loop() {
      if (S.closed) return;
      raf = requestAnimationFrame(loop);
      render(clock());
    }
    let ro = null;
    if (window.ResizeObserver) { ro = new ResizeObserver(() => { if (!S.closed) layout(); }); ro.observe(stage); ro.observe(panel); }
    const onResize = () => { if (!S.closed && !ro) layout(); };
    window.addEventListener('resize', onResize);
    if (pics) bumpPose();
    layout();
    if (WORDMARK.complete) wm.classList.add(P + 'on'); else WORDMARK.addEventListener('load', () => wm.classList.add(P + 'on'), { once: true });
    if (hasR) {
      runnerReady(A.R).then(() => {
        if (S.closed) return;
        fg.classList.add(P + 'on');
        if (!raf) raf = requestAnimationFrame(loop);
      }, () => {   });
    }

    const ptiles = [];
    if (pics) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const add = (key, crop, lookFor) => {
        const G = groups[key]; if (!G) return;
        for (const b of G.items) {
          const c = b.querySelector('canvas'), r = b.getBoundingClientRect();
          c.width = Math.max(2, Math.round(r.width * dpr)); c.height = Math.max(2, Math.round(r.height * dpr));
          ptiles.push({ b, c, crop, id: b.dataset.id, lookFor, drawn: '' });
        }
      };
      add('body', 'bust', (want, id) => variant(want, id));
      add('hair', 'head', (want, id) => Object.assign({}, want, { hair: id, hat: has('hat', 'none') ? 'none' : want.hat }));

      ptiles.sort((p, q) => (p.crop === q.crop ? 0 : p.crop === 'bust' ? -1 : 1) || ((q.id === look[q.crop === 'bust' ? 'body' : 'hair']) - (p.id === look[p.crop === 'bust' ? 'body' : 'hair'])));
    }
    const pkey = (T, l) => keyOf(l) + '|' + T.crop + '@' + T.c.width + 'x' + T.c.height;
    function paintTile(T, key) {
      try { drawPortrait(A.R, T.c, T.crop); cachePut(key, T.c); } catch (e) { return; }
      T.drawn = key; T.c.classList.add(P + 'on'); T.b.classList.add(P + 'has');
    }
    function blitTile(T, key, src) {
      const g = T.c.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, T.c.width, T.c.height); g.drawImage(src, 0, 0);
      T.drawn = key; T.c.classList.add(P + 'on'); T.b.classList.add(P + 'has');
    }
    const failed = new Set();

    function nextJob(want) {
      const cur = A.cur();
      for (const T of ptiles) {
        const l = T.lookFor(want, T.id), key = pkey(T, l);
        if (T.drawn === key || failed.has(keyOf(l))) continue;
        const hit = PCACHE.get(key);
        if (hit) { blitTile(T, key, hit); continue; }
        if (same(l, cur)) { paintTile(T, key); continue; }
        return { T, l, key };
      }
      return null;
    }

    let working = false, quietUntil = 0, wake = null, busyLook = null, varOn = false, shownKey = full ? keyOf(A.cur() || def) : '';
    const nap = ms => new Promise(res => {
      const done = () => { clearTimeout(id); if (wake === done) wake = null; res(); };
      const id = setTimeout(done, ms);
      wake = done;
    });
    function poke() { if (!working) work(); else if (wake) wake(); }
    function schedule(now) { if (!full) return; quietUntil = performance.now() + (now ? 0 : DEBOUNCE); poke(); }
    function bake(l) {
      busyLook = l;
      let p;
      try { p = Promise.resolve(A.setLook(l)); } catch (e) { p = Promise.reject(e); }
      return Promise.race([p.then(() => true, e => { console.warn('Create: setLook failed', e); return false; }),
        new Promise(r => setTimeout(() => r(false), 4000))]).then(ok => { busyLook = null; return ok; });
    }
    function landed(want) {
      varOn = false; showing = true;
      const k = keyOf(want);
      if (k !== shownKey) { shownKey = k; flashT = clock(); }
    }
    async function work() {
      if (working || S.closed || !full) return;
      working = true;
      try {
        await runnerReady(A.R);
        while (!S.closed) {
          const want = outLook(), wk = keyOf(want);
          const job = pics ? nextJob(want) : null;
          const quiet = quietUntil + QUIET - performance.now();
          const needWant = !same(want, A.cur()) && !failed.has(wk);

          if (needWant && !(varOn && job && quiet <= 1)) {
            const wait = quietUntil - performance.now();
            if (wait > 1) { await nap(wait); continue; }
            await bake(want);
            if (S.closed) break;
            if (same(A.cur(), want)) landed(want);
            else if (same(outLook(), want)) failed.add(wk);
            continue;
          }
          if (varOn && same(want, A.cur())) landed(want);
          if (!job) break;
          if (quiet > 1) { await nap(quiet); continue; }
          if (!pose.on || pose.until !== Infinity || clock() - pose.t0 < 0.35) { bumpPose(); await nap(380); continue; }
          if (!same(outLook(), want)) continue;
          await bake(job.l);
          if (S.closed) break;
          if (same(A.cur(), job.l)) { varOn = !same(job.l, want); if (varOn) showing = false; paintTile(job.T, job.key); }
          else failed.add(keyOf(job.l));
        }
      } catch (e) { console.warn('Create:', e); }
      finally { working = false; }
      if (S.closed) return;
      if (varOn) { varOn = false; showing = true; }
      settled();
    }

    function choose(key, id) {
      if (!full || look[key] === id || !has(key, id)) return;
      look[key] = id;
      if (key === 'facial' && look.body === 'm') facialM = id;
      if (key === 'body') { if (id === 'm' && facialM && has('facial', facialM)) look.facial = facialM; refreshFacial(); refresh('facial'); }
      refresh(key);
      setDescribed();
      bumpPose();
      schedule(false);
    }
    function randomFromCatalog() {
      const o = {};
      for (const k of keys) o[k] = cat[k][Math.floor(Math.random() * cat[k].length)].id;
      return o;
    }
    function shuffle() {
      if (!full) return;
      let l = null;
      for (let i = 0; i < 4; i++) {
        try { l = A.random ? A.random() : null; } catch (e) { l = null; }
        l = norm(l || randomFromCatalog());
        if (!same(variant(l, l.body), outLook())) break;
      }
      if (l.body === 'm') facialM = l.facial;
      else l.facial = facialM || l.facial;
      look = l;
      for (const k of keys) refresh(k);
      refreshFacial();
      setDescribed();
      announce('Shuffled. ' + describe() + '.');
      shuffleBtn.classList.remove(P + 'spun'); void shuffleBtn.offsetWidth; shuffleBtn.classList.add(P + 'spun');
      bumpPose();
      schedule(true);
    }

    const SWALLOW = ['pointerdown', 'pointerup', 'pointermove', 'pointercancel', 'pointerover', 'pointerout', 'pointerenter', 'pointerleave',
      'mousedown', 'mouseup', 'mousemove', 'click', 'dblclick', 'auxclick', 'contextmenu', 'wheel',
      'touchstart', 'touchmove', 'touchend', 'touchcancel', 'keyup', 'keypress', 'gesturestart', 'gesturechange', 'gestureend'];
    const passive = t => t === 'wheel' || t.startsWith('touch');
    function swallow(e) {
      e.stopPropagation();
      if (e.type === 'contextmenu' || e.type === 'gesturestart' || e.type === 'dblclick') { if (e.cancelable) e.preventDefault(); }
    }
    for (const t of SWALLOW) root.addEventListener(t, swallow, { passive: passive(t) });
    const NAV = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown', ' ', 'Enter', 'Tab', 'Escape', 'Esc'];

    function guard(e) {
      if (S.closed) return;
      const inside = e.target && e.target.nodeType === 1 && root.contains(e.target);
      if (inside) return;
      e.stopPropagation(); e.stopImmediatePropagation();
      if (e.type.startsWith('key')) {
        if (NAV.includes(e.key) && e.cancelable) e.preventDefault();
        if (e.type === 'keydown') {
          if (e.key === 'Escape' || e.key === 'Esc') finish('cancel');
          else if (NAV.includes(e.key)) firstFocus().focus();
        }
      } else if (e.cancelable && (e.type === 'pointerdown' || e.type === 'mousedown' || e.type === 'click' || e.type === 'contextmenu')) e.preventDefault();
    }
    const GUARD = ['keydown', 'keyup', 'keypress', 'pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click', 'contextmenu', 'touchstart', 'touchend', 'wheel'];
    for (const t of GUARD) window.addEventListener(t, guard, { capture: true, passive: passive(t) });

    function rows() {
      const out = [[backBtn]];
      for (const k of keys) { const G = groups[k]; if (G && !G.sec.hidden) out.push(G.items); }
      out.push(full ? [shuffleBtn, goBtn] : [goBtn]);
      return out;
    }
    function rowFocus(row) {
      const sel = row.find(b => b.getAttribute('aria-checked') === 'true');
      return sel || (row.includes(goBtn) ? goBtn : row[0]);
    }
    function firstFocus() {
      if (full && groups.body) return rowFocus(groups.body.items);
      return goBtn;
    }
    function focusables() {
      return Array.from(root.querySelectorAll('button')).filter(b => b.tabIndex >= 0 && !b.disabled && b.getClientRects().length);
    }
    root.addEventListener('keydown', e => {
      e.stopPropagation();
      if (S.closed) return;
      const k = e.key;
      if (k === 'Escape' || k === 'Esc') { e.preventDefault(); finish('cancel'); return; }
      if (k === 'Tab') {
        const f = focusables(); if (!f.length) return;
        const i = f.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && (i < 0 || i === f.length - 1)) { e.preventDefault(); f[0].focus(); }
        return;
      }
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].indexOf(k) < 0) {
        if ((k === ' ' || k === 'Enter') && e.target === root) e.preventDefault();
        return;
      }
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      e.preventDefault();
      const R = rows();
      let ri = -1, ci = -1;
      R.forEach((row, i) => { const j = row.indexOf(document.activeElement); if (j >= 0) { ri = i; ci = j; } });
      if (ri < 0) { firstFocus().focus(); return; }
      if (k === 'ArrowUp' || k === 'ArrowDown') {
        const down = k === 'ArrowDown', row = R[ri], me = document.activeElement.getBoundingClientRect();

        if (row.length > 1 && row[0].getAttribute('role') === 'radio') {
          let best = null, bd = Infinity;
          for (const b of row) {
            const r = b.getBoundingClientRect();
            if (down ? r.top < me.bottom - 2 : r.bottom > me.top + 2) continue;
            const d = Math.abs(r.top - me.top) * 4 + Math.abs((r.left + r.right) / 2 - (me.left + me.right) / 2);
            if (d < bd) { bd = d; best = b; }
          }
          if (best) { best.focus(); choose(best.dataset.key, best.dataset.id); return; }
        }
        const ni = ri + (down ? 1 : -1);
        if (ni >= 0 && ni < R.length) rowFocus(R[ni]).focus();
        return;
      }
      const row = R[ri], radio = row[0].getAttribute('role') === 'radio';
      let nj = k === 'Home' ? 0 : k === 'End' ? row.length - 1 : ci + (k === 'ArrowLeft' ? -1 : 1);
      nj = radio ? (nj + row.length) % row.length : clamp(nj, 0, row.length - 1);
      const b = row[nj];
      b.focus();
      if (radio) choose(b.dataset.key, b.dataset.id);
    });
    root.addEventListener('click', e => {
      const b = e.target && e.target.closest ? e.target.closest('button') : null;
      if (!b || S.closed || !root.contains(b)) return;
      const early = performance.now() - S.openedAt < 350;
      if (b === goBtn) { if (!early) finish('done'); return; }
      if (b === backBtn) { if (!early) finish('cancel'); return; }
      if (b === shuffleBtn) { if (!early) shuffle(); return; }
      if (b.dataset.key) choose(b.dataset.key, b.dataset.id);
    });

    const prevFocus = document.activeElement;
    try { (full && !byPointer ? firstFocus() : root).focus({ preventScroll: true }); } catch (e) { root.focus(); }
    requestAnimationFrame(() => requestAnimationFrame(() => { if (!S.closed && full) setTimeout(() => schedule(true), 60); }));

    function finish(kind) {
      if (S.closed) return;
      S.closed = true;
      if (current === api) current = null;
      if (wake) wake();
      if (raf) cancelAnimationFrame(raf); raf = 0;
      for (const t of GUARD) window.removeEventListener(t, guard, { capture: true });
      window.removeEventListener('resize', onResize);
      if (ro) ro.disconnect();
      const chosen = kind === 'done' ? (full ? outLook() : (A.R && A.R.look) || parseIn(opts.look) || null) : null;

      const target = kind === 'done' ? chosen : startLook;
      if (A.mode === 'looks' && target) {
        const wearing = !busyLook && same(A.cur(), target), coming = !!busyLook && same(busyLook, target);
        if (!wearing && !coming) { try { A.setLook(target); } catch (e) {   } }
      }
      root.classList.add(P + 'closing');
      root.setAttribute('aria-hidden', 'true');
      try { if (prevFocus && prevFocus.focus && document.contains(prevFocus) && prevFocus !== document.body) prevFocus.focus({ preventScroll: true }); else root.blur(); } catch (e) {   }
      setTimeout(() => { if (root.parentNode) root.parentNode.removeChild(root); }, reduced ? 0 : 220);
      try {
        if (kind === 'done' && typeof opts.onDone === 'function') opts.onDone(chosen);
        else if (kind === 'cancel' && typeof opts.onCancel === 'function') opts.onCancel();
      } catch (e) { console.error('Create: callback failed', e); }
    }
    const api = { finish, isOpen: () => !S.closed, root };
    return api;
  }

  function open(opts) {
    if (current) current.finish('close');
    const inst = create(opts);
    current = inst;
    return { close: () => inst.finish('close') };
  }

  window.Create = {
    __ltwh: true, version: '1.0',
    ready,
    open,
    isOpen: () => !!(current && current.isOpen()),
  };
})();
