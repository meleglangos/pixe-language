// A láda-ablak háttere: az egész ablakot kitöltő kép (a cím, a tárgy, a láda, a csillagok, a végén a lista is
// előtte áll). Minden nyitáskor véletlenül választ a hátterek közül (a láda-laborban kiválasztható):
//   campfire  - éjszakai erdő tábortűzzel, pihenő lovaggal (lobogó tűzfény, szikrák)
//   waterfall - szurdok nagy vízeséssel (zuhogó csíkok, hab, permet)
//   pagoda    - pagoda cseresznyevirágokkal, háttérben hegy (hulló szirmok)
//   valley    - völgy hegycsúccsal, virágmezővel (hulló szirmok)
//   lake      - tó sziklák között, cseresznyefákkal (hulló szirmok)
//   knight    - erdő mélye, fénysávban fekvő lovag (por a fényben)
// A láda alatt rúnakör, ami a nyitáskor a ritkaság színében izzik. Új háttér: kép az assets/backgrounds/original/
// mappába, python3 tools/art/backgrounds.py, kulcs a src/config/assets.js-be (bg_<id>), bejegyzés a THEMES-be,
// és "debug.scene.<id>" kulcs a fordítási fájlba (a láda-labor ezt mutatja).
//
//   const sc = Game.chestScene.create(sceneEl, stageEl, theme?)   // theme nélkül véletlen; sc.theme: a választott
//   sc.layout()            // újrarajzol, ha a doboz mérete változott (magától is figyeli)
//   sc.setColor(color, a)  // a rúnakör színe és erőssége (0..1)
//   sc.destroy()
//   Game.chestScene.THEMES // a hátterek azonosítói
//
// Rétegek hátulról előre: kép (statikus) -> mozgó réteg (víz) -> fények (lobognak) -> rúnakör ->
// [a láda-ablak fény-effektjei] -> részecskék -> [láda, tárgy, csillagok, lista].
// A képek letöltött képekből készült valódi pixel art (tools/art/backgrounds.py); alacsony felbontású vásznak,
// egész számú nagyítás (SCALE = 3), lépcsős sávok ditherrel. A vászonról nem olvas vissza (file://-ról a kép
// "tainted", a getImageData ott hibát dobna).
(function () {
  const SCALE = 3;
  const ui = Game.ui;
  const cache = {};

  function image(key, url) {
    const tex = window.Game.phaser && Game.phaser.textures && Game.phaser.textures.exists(key) && Game.phaser.textures.get(key).getSourceImage();
    if (tex) return Promise.resolve(tex);
    if (!cache[url]) cache[url] = new Promise((ok, fail) => { const im = new Image(); im.onload = () => ok(im); im.onerror = fail; im.src = encodeURI(url); });
    return cache[url];
  }
  // a hátterek képei (src/config/assets.js: bg_<id>); egy hiányzó kép nem akasztja meg a többit
  function loadAll() {
    const a = Game.data.assets, out = {};
    return Promise.all(Object.keys(THEMES).map(id => {
      const k = THEMES[id].image;
      return image(k, a.files[k]).then(im => { out[k] = im; }, () => { /* hiányzó kép: sötét háttér */ });
    })).then(() => out);
  }

  // lépcsős sávok: d (0 = közép .. 1 = szél) -> erősség; a határokon sakktábla
  const BANDS = [[0.3, 1], [0.55, 0.62], [0.8, 0.32], [1, 0.12]];
  function band(d, x, y) {
    for (let i = 0; i < BANDS.length; i++) {
      const [lim, a] = BANDS[i];
      if (d < lim - 0.06) return a;
      if (d < lim + 0.06) return ((x + y) & 1) ? a : (BANDS[i + 1] ? BANDS[i + 1][1] : 0);
    }
    return 0;
  }
  const hexRgb = c => { const n = parseInt(String(c).slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  // egy szín rárakása pixelenként (f(x, y) -> 0..1), soronként azonos erősségű szakaszokban
  function tint(ctx, x0, y0, w, h, color, max, f) {
    const [r, g, b] = hexRgb(color), pre = 'rgba(' + r + ',' + g + ',' + b + ',';
    for (let y = y0; y < y0 + h; y++) {
      let x = x0;
      while (x < x0 + w) {
        const a = f(x, y) * max;
        let e = x + 1;
        while (e < x0 + w && f(e, y) * max === a) e++;
        if (a > 0) { ctx.fillStyle = pre + Math.min(1, a).toFixed(3) + ')'; ctx.fillRect(x, y, e - x, 1); }
        x = e;
      }
    }
  }
  function sizeCanvas(cv, w, h) {
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    cv.style.width = (w * SCALE) + 'px'; cv.style.height = (h * SCALE) + 'px';
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    return ctx;
  }
  // rúnakör: két ellipszis-gyűrű, köztük rúnajelek
  const GLYPHS = [
    [[0, 0], [0, 1], [1, 0]], [[0, 0], [1, 1], [2, 0]], [[0, 0], [0, 1], [1, 1]],
    [[1, 0], [0, 1], [2, 1]], [[0, 0], [2, 0], [1, 1]], [[0, 1], [1, 1], [2, 0]],
  ];
  function runeCircle(ctx, cx, cy, rx, ry, outer, inner, glyph) {
    const ring = (rx2, ry2, c) => {
      ctx.fillStyle = c;
      const seen = new Set();
      for (let i = 0; i < 360; i++) {
        const a = i / 360 * Math.PI * 2, x = Math.round(cx + Math.cos(a) * rx2), y = Math.round(cy + Math.sin(a) * ry2);
        if (seen.has(x + ',' + y)) continue;
        seen.add(x + ',' + y);
        ctx.fillRect(x, y, 1, 1);
      }
    };
    ring(rx, ry, outer);
    ring(rx - 5, ry - 2, inner);
    ctx.fillStyle = glyph;
    for (let k = 0; k < 10; k++) {
      const a = (k + 0.5) / 10 * Math.PI * 2, gx = Math.round(cx + Math.cos(a) * (rx - 2.5)) - 1, gy = Math.round(cy + Math.sin(a) * (ry - 1)) - 1;
      GLYPHS[k % GLYPHS.length].forEach(([x, y]) => ctx.fillRect(gx + x, gy + y, 1, 1));
    }
  }

  // ---------- kép-hátterek (assets/backgrounds, tools/art/backgrounds.py) ----------
  // A kép egy pontja (focus: a talaj a kép közepe táján) a láda alá kerül; ahol a kép nem ér el (alul, a lista
  // mögött), a kép alsó sorai tükrözve folytatódnak, egyre sötétebben. Képkoordinátákban: fények, vízesés, szikrák.
  function paintImage(T) {
    return function (ctx, imgs, W, H, chestY) {
      const im = imgs[T.image], cx = Math.floor(W / 2);
      if (!im) { ctx.fillStyle = '#0a1416'; ctx.fillRect(0, 0, W, H); return { rc: { x: cx, y: chestY - 2, rx: 26, ry: 7 }, lights: [] }; }
      const iw = im.width, ih = im.height;
      const ox = iw <= W ? Math.floor((W - iw) / 2) : Math.max(W - iw, Math.min(0, cx - T.focus[0])), oy = chestY - T.focus[1];
      ctx.fillStyle = '#05080a'; ctx.fillRect(0, 0, W, H);
      ctx.drawImage(im, ox, oy);
      // fölötte (ha a kép alacsonyabb a doboznál) az első sor, alatta a tükrözött alsó sorok
      for (let y = 0; y < oy; y++) ctx.drawImage(im, 0, 0, iw, 1, ox, y, iw, 1);
      for (let y = oy + ih, k = 0; y < H; y++, k++) ctx.drawImage(im, 0, ih - 1 - (k % ih), iw, 1, ox, y, iw, 1);
      const below = oy + ih;
      if (below < H) tint(ctx, 0, below, W, H - below, '#05080a', 0.85, (x, y) => band(1 - Math.min(1, (y - below) / 24), x, y));
      // felül sötétebb (a cím olvasható legyen)
      tint(ctx, 0, 0, W, 40, '#05080a', 0.75, (x, y) => (y < 40 ? band(y / 40, x, y) : 0));
      const at = p => ({ x: p.x + ox, y: p.y + oy });
      return {
        rc: { x: cx, y: chestY - 2, rx: 26, ry: 7 },
        lights: (T.lights || []).map(l => Object.assign({}, l, at(l))),
        fall: T.fall ? Object.assign({}, T.fall, at(T.fall)) : null,
        source: T.source ? at(T.source) : null,
        motes: T.motes,
      };
    };
  }
  // vízesés: lefelé futó világos csíkok a kép vízesésén (áttetszőn), alján hab
  function animImage(ctx, imgs, W, H, g, k) {
    ctx.clearRect(0, 0, W, H);
    const f = g.fall;
    if (!f) return;
    for (let x = 0; x < f.w; x++) {
      const v = 2 + ((x * 5) % 3 === 0 ? 1 : 0), L = 9 + ((x * 3) % 7), ph = (x * 13) % L;
      for (let y = 0; y < f.h; y++) {
        const s = (((y - k * v + ph) % L) + L) % L;
        if (s > 1) continue;
        ctx.fillStyle = s === 0 ? 'rgba(240,250,255,0.55)' : 'rgba(170,215,245,0.35)';
        ctx.fillRect(f.x + x, f.y + y, 1, 1);
      }
    }
    for (let i = 0; i < 18; i++) {
      const x = f.x - 4 + ((i * 7 + k * 3) % (f.w + 8)), y = f.y + f.h - 3 + ((i * 3 + k) % 6);
      ctx.fillStyle = i % 3 ? 'rgba(235,248,255,0.8)' : 'rgba(160,210,245,0.7)';
      ctx.fillRect(x, y, 1, 1);
    }
  }

  // a választható hátterek (a láda-labor a nevüket a "debug.scene.<id>" kulcsból mutatja)
  // focus: a kép pontja (talaj), ami a láda alá kerül; képkoordinátákban (a kicsinyített képen)
  const THEMES = {
    campfire: { image: 'bg_campfire', focus: [86, 240], lights: [{ x: 57, y: 214, r: 30, c: '#ff9a3c', a: 0.32 }], source: { x: 57, y: 196 }, motes: 'embers' },
    waterfall: { image: 'bg_waterfall', focus: [77, 238], fall: { x: 68, y: 60, w: 19, h: 168 }, source: { x: 77, y: 228 }, motes: 'mist' },
    pagoda: { image: 'bg_pagoda', focus: [70, 255], motes: 'petals' },
    valley: { image: 'bg_valley', focus: [92, 205], motes: 'petals' },
    lake: { image: 'bg_lake', focus: [74, 222], motes: 'petals' },
    knight: { image: 'bg_knight', focus: [88, 280], source: { x: 90, y: 60 }, motes: 'dust' },
  };
  Object.keys(THEMES).forEach(id => { const T = THEMES[id]; T.paint = paintImage(T); T.anim = T.fall ? animImage : null; });

  // apró részecskék (CSS-sel mozognak): szikra a tűzből, permet a vízesésnél, hulló szirmok, por a fénysávban
  const MOTES = {
    //        szórás x / y (logikai px)   élettartam (mp)   elmozdulás x / y (logikai px)
    embers: { sx: 10, sy: 6, dur: [1.6, 1.6], dx: 8, dy: [-30, -30] },
    mist: { sx: 34, sy: 6, dur: [5, 6], dx: 20, dy: [-6, -10] },
    dust: { sx: 30, sy: 110, dur: [6, 6], dx: 10, dy: [-4, -10] },
    petals: { dur: [7, 6], dx: 30, dy: [60, 50] },
  };
  function placeMotes(box, g) {
    const kind = MOTES[g.motes] ? g.motes : 'petals', M = MOTES[kind], src = g.source;
    box.className = 'cs-motes cs-' + kind;
    [...box.children].forEach(d => {
      if (!src) {
        d.style.left = (Math.random() * 100) + '%';
        d.style.top = (Math.random() * 60) + '%';
      } else {
        d.style.left = ((src.x + (Math.random() - 0.5) * M.sx) * SCALE) + 'px';
        d.style.top = ((src.y + (Math.random() - 0.5) * M.sy) * SCALE) + 'px';
      }
      d.style.setProperty('--dur', (M.dur[0] + Math.random() * M.dur[1]).toFixed(1) + 's');
      d.style.setProperty('--delay', (-Math.random() * 8).toFixed(1) + 's');
      d.style.setProperty('--dx', Math.round((Math.random() - 0.5) * M.dx) * SCALE + 'px');
      d.style.setProperty('--dy', Math.round(M.dy[0] + Math.random() * M.dy[1]) * SCALE + 'px');
    });
  }

  Game.chestScene = {
    SCALE,
    THEMES: Object.keys(THEMES),
    // theme: a THEMES egyike; ha nincs megadva (vagy ismeretlen), véletlen
    create(sceneEl, stageEl, theme) {
      const id = THEMES[theme] ? theme : Object.keys(THEMES)[Math.floor(Math.random() * Object.keys(THEMES).length)];
      const T = THEMES[id];
      sceneEl.dataset.scene = id;
      const bg = ui.el('canvas', 'cs-bg');
      const anim = ui.el('canvas', 'cs-anim');
      const glow = ui.el('canvas', 'cs-glow');
      const rune = ui.el('canvas', 'cs-rune');
      const motes = ui.el('div', 'cs-motes');
      for (let i = 0; i < 16; i++) motes.append(ui.el('span', 'cs-mote'));
      [bg, anim, glow, rune].forEach(c => { c.width = c.height = 0; });
      sceneEl.prepend(bg, anim, glow, rune);
      sceneEl.append(motes);

      let imgs = null, lastKey = '', runeColor = '#ffd75a', runeAlpha = 0.4, geo = null, timer = 0, frameNo = 0, alive = true;

      function drawRune() {
        if (!geo) return;
        const { W, H, rc } = geo;
        const ctx = sizeCanvas(rune, W, H);
        ctx.clearRect(0, 0, W, H);
        const [r, g, b] = hexRgb(runeColor);
        tint(ctx, rc.x - rc.rx - 2, rc.y - rc.ry - 2, rc.rx * 2 + 5, rc.ry * 2 + 5, runeColor, 0.35,
          (x, y) => { const d = Math.hypot((x + 0.5 - rc.x) / rc.rx, (y + 0.5 - rc.y) / rc.ry); return d > 1.05 ? 0 : band(d, x, y); });
        const light = 'rgb(' + [r, g, b].map(v => Math.round(v + (255 - v) * 0.6)).join(',') + ')';
        runeCircle(ctx, rc.x, rc.y, rc.rx, rc.ry, runeColor, runeColor, light);
        rune.style.opacity = runeAlpha;
      }

      function tick() {
        if (!sceneEl.isConnected) { api.destroy(); return; }
        if (geo && T.anim) T.anim(anim.getContext('2d'), imgs, geo.W, geo.H, geo, ++frameNo);
      }

      function paint() {
        if (!imgs || !alive) return;
        const cw = sceneEl.clientWidth, ch = sceneEl.clientHeight;
        if (!cw || !ch) return;
        const st = stageEl.offsetTop, sh = stageEl.offsetHeight;
        const key = cw + 'x' + ch + ':' + st + ':' + sh;
        if (key === lastKey) return;
        lastKey = key;
        const W = Math.ceil(cw / SCALE), H = Math.ceil(ch / SCALE);
        const chestY = Math.round((st + sh - 8) / SCALE); // a nyitott láda alja: itt áll a talajon
        const g = T.paint(sizeCanvas(bg, W, H), imgs, W, H, chestY);
        // fények (tűz, gombák): külön réteg, lobog
        const gctx = sizeCanvas(glow, W, H);
        gctx.clearRect(0, 0, W, H);
        (g.lights || []).forEach(l => tint(gctx, l.x - l.r, l.y - l.r, l.r * 2 + 1, l.r * 2 + 1, l.c, l.a,
          (x, y) => { const d = Math.hypot(x + 0.5 - l.x, y + 0.5 - l.y) / l.r; return d > 1 ? 0 : band(d, x, y); }));
        sizeCanvas(anim, W, H);
        const first = !geo;
        geo = Object.assign(g, { W, H });
        if (first) placeMotes(motes, geo);
        if (T.anim) T.anim(anim.getContext('2d'), imgs, W, H, geo, frameNo);
        drawRune();
        if (!timer && T.anim) timer = setInterval(tick, 100);
      }

      const ro = window.ResizeObserver ? new ResizeObserver(() => paint()) : null;
      if (ro) ro.observe(sceneEl);
      else window.addEventListener('resize', paint);
      loadAll().then(r => { imgs = r; paint(); }, () => { /* kép nélkül a sötét háttér marad */ });

      const api = {
        theme: id,
        layout: paint,
        setColor(color, alpha) {
          runeColor = color || runeColor;
          runeAlpha = alpha == null ? runeAlpha : alpha;
          drawRune();
        },
        destroy() {
          alive = false;
          clearInterval(timer);
          if (ro) ro.disconnect(); else window.removeEventListener('resize', paint);
        },
      };
      return api;
    },
  };
})();
