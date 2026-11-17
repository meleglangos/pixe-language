// A láda-ablak háttere: éjszakai erdei rom. Bal oldalt mohos romfal lovagszoborral és törött oszloppal, jobb oldalt
// sziklafal vízeséssel és tóval, középen fűben álló rúnakör (a láda alatt), tábortűz, világító gombák, virágok,
// bokrok, szentjánosbogarak. Az egész ablakot kitölti (a cím, a tárgy, a láda, a csillagok mind benne állnak).
//
//   const sc = Game.chestScene.create(sceneEl, stageEl)   // sceneEl: a jelenet doboza (position: relative)
//   sc.layout()            // újrarajzol, ha a doboz mérete változott (magától is figyeli)
//   sc.setColor(color, a)  // a rúnakör színe és erőssége (0..1): a nyitáskor a ritkaság színében izzik
//   sc.destroy()
//
// Rétegek hátulról előre: háttér (statikus) -> mozgó réteg (vízesés, tó csillogása, tábortűz lángja) -> fények
// (tűz, gombák; lobognak) -> rúnakör -> [a láda-ablak fény-effektjei] -> szentjánosbogarak -> [láda, tárgy, csillagok].
// Grafika: Pixel Crawler (fű, téglafal, szikla, növények, tűz) + saját rajz (tools/art/ruins_props.py); a víz, a lomb
// és a fények kódból. Alacsony felbontású vásznak, egész számú nagyítás (SCALE), lépcsős sávok ditherrel.
// A vászonról nem olvas vissza (file://-ról a kép "tainted", a getImageData ott hibát dobna).
(function () {
  const SCALE = 3;
  const TS = 16;
  const ui = Game.ui;
  const cache = {};

  function image(key, url) {
    const tex = window.Game.phaser && Game.phaser.textures && Game.phaser.textures.exists(key) && Game.phaser.textures.get(key).getSourceImage();
    if (tex) return Promise.resolve(tex);
    if (!cache[url]) cache[url] = new Promise((ok, fail) => { const im = new Image(); im.onload = () => ok(im); im.onerror = fail; im.src = encodeURI(url); });
    return cache[url];
  }
  function loadAll() {
    const a = Game.data.assets, keys = ['pc_floors', 'pc_walls', 'pc_veg', 'pc_pines', 'ruins_props'], out = {};
    return Promise.all([
      ...keys.map(k => image(k, a.files[k]).then(im => { out[k] = im; })),
      image('fire_small', a.strips.fire_small.url).then(im => { out.fire = im; }),
    ]).then(() => out);
  }
  function frame(ctx, imgs, name, x, y, flip) {
    const f = Game.data.assets.frames[name];
    if (!f || !imgs[f[0]]) return;
    x = Math.round(x); y = Math.round(y);
    if (!flip) { ctx.drawImage(imgs[f[0]], f[1], f[2], f[3], f[4], x, y, f[3], f[4]); return; }
    ctx.save(); ctx.translate(x + f[3], y); ctx.scale(-1, 1);
    ctx.drawImage(imgs[f[0]], f[1], f[2], f[3], f[4], 0, 0, f[3], f[4]);
    ctx.restore();
  }
  const fsize = name => { const f = Game.data.assets.frames[name]; return f ? { w: f[3], h: f[4] } : { w: 0, h: 0 }; };

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
  // determinisztikus véletlen (ugyanaz a kép minden újrarajzoláskor)
  function rng(seed) { let s = seed; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }

  // lombfolt: kör egy színnel, a szélén ditherrel
  function blob(ctx, cx, cy, r, color, dither) {
    ctx.fillStyle = color;
    for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) {
      const d = Math.hypot(x, y) / r;
      if (d > 1 || (dither && d > 0.8 && ((x + y + cx + cy) & 1))) continue;
      ctx.fillRect(cx + x, cy + y, 1, 1);
    }
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

  // ---------- a jelenet megrajzolása (statikus réteg); visszaadja a mozgó elemek helyét ----------
  function paintRuins(ctx, imgs, W, H, chestY) {
    const R = rng(11), cx = Math.floor(W / 2);
    const hy = Math.min(chestY - 40, Math.round(H * 0.46)); // a fű hátsó széle (horizont)
    const sky = ['#0a1416', '#0d1a1b', '#112221', '#152a26', '#1a3229'];
    const skyAt = y => sky[Math.min(sky.length - 1, Math.floor(y / Math.max(1, hy) * sky.length))];
    // ég / erdő mélye: lépcsős, felfelé sötétedő
    for (let y = 0; y < hy; y++) { ctx.fillStyle = skyAt(y); ctx.fillRect(0, y, W, 1); }
    // holdfény-sávok balról felülről (halvány, ditheres)
    tint(ctx, 0, 0, W, hy, '#cfe8d0', 0.07, (x, y) => {
      const u = (x - y * 0.55 + 400) % 46;
      return u < 7 ? ((x + y) & 1 ? 1 : 0.5) : 0;
    });
    // fenyőerdő két sorban: a hátsó szinte sziluett, az első valamivel világosabb
    const pines = ['pine_a', 'pine_b', 'pine_c', 'pine_d'];
    for (let x = -60, i = 0; x < W; x += 34, i++) frame(ctx, imgs, pines[i % 4], x, hy - 157 - 14 + (i % 2) * 8, i % 2);
    tint(ctx, 0, 0, W, hy, '#0a1416', 0.82, () => 1);
    for (let x = -70, i = 1; x < W + 20; x += 52, i++) frame(ctx, imgs, pines[i % 4], x + (i % 2) * 6, hy - 157 + 2, i % 2);
    tint(ctx, 0, 0, W, hy + 2, '#0c1a18', 0.62, () => 1);
    // holdfény-sávok a fák előtt (halvány, ditheres)
    tint(ctx, 0, 0, W, hy, '#cfe8d0', 0.08, (x, y) => {
      const u = (x - y * 0.55 + 400) % 46;
      return u < 7 ? ((x + y) & 1 ? 1 : 0.5) : 0;
    });
    // lomb a tetején (keretezi a jelenetet)
    for (let x = -4; x < W + 8; x += 6) {
      const r = 6 + Math.round(R() * 5), y = Math.round(R() * 6) - 2;
      blob(ctx, x, y, r, '#0a1612', false);
      blob(ctx, x + 2, y + r - 2, Math.max(2, r - 4), '#11231b', true);
      if (R() < 0.5) { ctx.fillStyle = '#0a1612'; ctx.fillRect(x + 1, y + r, 1, 3 + Math.round(R() * 8)); } // lelógó inda
    }

    // fű (a horizonttól lefelé)
    for (let y = hy, j = 0; y < H; y += TS, j++) for (let x = 0, i = 0; x < W; x += TS, i++) frame(ctx, imgs, 'grass_' + ((i * 7 + j * 3) % 4), x, y);
    tint(ctx, 0, hy, W, H - hy, '#0b1a14', 0.52, () => 1); // éjszaka: sötétebb fű
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(0, hy, W, 2);

    // ---- jobb oldal: sziklafal vízeséssel, alatta tó ----
    const cliffX = W - 34, cliffTop = Math.max(8, hy - 74);
    for (let y = hy + 6 - TS; y > cliffTop + 16; y -= 3 * TS) frame(ctx, imgs, 'cliff_face', cliffX, y - 2 * TS);
    frame(ctx, imgs, 'cliff_top', cliffX, cliffTop);
    frame(ctx, imgs, 'cliff_foot', cliffX, hy + 6 - TS);
    const pond = { x: W - 17, y: hy + 12, rx: 22, ry: 7 };
    const fall = { x: W - 22, y: cliffTop + 10, w: 10, h: 0 };
    fall.h = pond.y - fall.y;
    // a tó (sötétkék, világosabb széllel); a vízesés a mozgó rétegen
    for (let y = -pond.ry; y <= pond.ry; y++) for (let x = -pond.rx; x <= pond.rx; x++) {
      const d = Math.hypot(x / pond.rx, y / pond.ry);
      if (d > 1) continue;
      ctx.fillStyle = d > 0.88 ? '#3f6f8a' : d > 0.7 && ((x + y) & 1) ? '#24506e' : y < -pond.ry * 0.3 ? '#1b3f5c' : '#163550';
      ctx.fillRect(pond.x + x, pond.y + y, 1, 1);
    }
    for (let k = 0; k < 9; k++) {
      const a = Math.PI * (0.1 + k * 0.1), x = Math.round(pond.x - Math.cos(a) * (pond.rx + 1)), y = Math.round(pond.y + Math.sin(a) * (pond.ry + 1));
      ctx.fillStyle = '#2e322f'; ctx.fillRect(x - 1, y, 3, 2);
      ctx.fillStyle = '#6d746e'; ctx.fillRect(x - 1, y, 2, 1);
    }
    frame(ctx, imgs, 'fern_b', cliffX - 6, hy - 6);

    // ---- bal oldal: romfal, előtte a szobor és egy törött oszlop ----
    const wallW = Math.min(46, Math.round(W * 0.38)), wallTop = hy - 34;
    // leomlott, csipkés teteje és lejtős jobb széle: a téglák csak a kivágáson belül látszanak
    const wallCut = x => Math.round(Math.abs(Math.sin(x * 0.45)) * 5 + (x > wallW - 12 ? (x - wallW + 12) * 2 : 0) + ((x * 7) % 5 === 0 ? 1 : 0));
    ctx.save();
    ctx.beginPath();
    for (let x = 0; x < wallW; x++) ctx.rect(x, wallTop + wallCut(x), 1, hy + 4 - wallTop - wallCut(x));
    ctx.clip();
    for (let y = wallTop, j = 0; y < hy + 4; y += TS, j++) for (let x = 0, i = 0; x < wallW; x += TS, i++) frame(ctx, imgs, 'ruin_brick_' + ((i + j) % 3), x, y);
    ctx.restore();
    // a fal a fák árnyékában sötétebb; moha a tetején
    tint(ctx, 0, wallTop, wallW, hy + 4 - wallTop, '#0d1a16', 0.45, (x, y) => (y >= wallTop + wallCut(x) ? 1 : 0));
    for (let x = 0; x < wallW - 4; x++) if (R() < 0.6) {
      const y = wallTop + wallCut(x) + 1, len = 1 + Math.round(R() * R() * 9);
      for (let k = 0; k < len; k++) { ctx.fillStyle = k ? '#2c5222' : '#4f8034'; ctx.fillRect(x, y + k, 1, 1); }
    }
    frame(ctx, imgs, 'ruin_pillar_broken', wallW - 4, hy + 6 - 28);
    const statueX = 4;
    frame(ctx, imgs, 'ruin_statue', statueX, hy + 10 - 50);
    frame(ctx, imgs, 'fern_a', statueX - 4, hy - 3);
    frame(ctx, imgs, 'fern_b', statueX + 20, hy - 2, true);

    // ösvény kőlapokból a rúnakörig
    const R2 = rng(5);
    for (let y = chestY + 8; y < H + 4; y += 5) {
      const w = 7 + Math.round((y - chestY) / 14);
      for (let x = cx - w; x < cx + w; x += 6) {
        const sx = x + Math.round(R2() * 2), sw = 4 + Math.round(R2());
        ctx.fillStyle = '#2f3a33'; ctx.fillRect(sx - 1, y - 1, sw + 2, 5);
        ctx.fillStyle = '#6b746d'; ctx.fillRect(sx, y, sw, 3);
        ctx.fillStyle = '#8b948c'; ctx.fillRect(sx, y, sw, 1);
      }
    }
    // rúnakör a láda alatt (vésett kő)
    const rc = { x: cx, y: chestY - 2, rx: 26, ry: 7 };
    runeCircle(ctx, rc.x, rc.y + 1, rc.rx, rc.ry, 'rgba(0,0,0,0.45)', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.4)');
    runeCircle(ctx, rc.x, rc.y, rc.rx, rc.ry, '#7d8a80', '#66726a', '#8e9c91');

    // tábortűz: kőkör + farönkök (a láng a mozgó rétegen)
    const fire = { x: Math.min(W - 14, cx + 40), y: chestY + 4 };
    ctx.fillStyle = '#3b2414'; ctx.fillRect(fire.x - 5, fire.y - 2, 10, 2);
    ctx.fillStyle = '#6a4123'; ctx.fillRect(fire.x - 4, fire.y - 3, 8, 1);
    [[-6, 0], [-4, 1], [-1, 2], [2, 2], [5, 1], [6, 0]].forEach(([dx, dy]) => {
      ctx.fillStyle = '#2e322f'; ctx.fillRect(fire.x + dx - 1, fire.y + dy - 1, 3, 2);
      ctx.fillStyle = '#6d746e'; ctx.fillRect(fire.x + dx - 1, fire.y + dy - 1, 2, 1);
    });

    // virágok, gombák (világítanak), bokrok
    const R3 = rng(23), flowers = ['flower_red', 'flower_white', 'flower_blue', 'flower_yellow'];
    for (let k = 0; k < Math.round(W / 6); k++) {
      const x = Math.round(R3() * (W - 6)), y = hy + 8 + Math.round(R3() * (H - hy - 14));
      if (Math.abs(x - cx) < 30 && y > chestY - 14) continue; // a láda, az ösvény és a csillagok környéke tiszta
      frame(ctx, imgs, flowers[k % 4], x, y);
    }
    const mush = [
      { n: 'mushroom_blue', x: statueX + 24, y: hy + 8, c: '#5fc8ff' },
      { n: 'mushroom_big', x: 12, y: chestY + 2, c: '#ffa64a' },
      { n: 'mushroom_blue', x: 3, y: chestY + 8, c: '#5fc8ff' },
      { n: 'mushroom_orange', x: W - 46, y: hy + 16, c: '#ffa64a' },
      { n: 'mushroom_blue', x: W - 12, y: chestY + 10, c: '#5fc8ff' },
    ];
    mush.forEach(m => frame(ctx, imgs, m.n, m.x, m.y - fsize(m.n).h));
    frame(ctx, imgs, 'bush_round', -10, H - 22);
    frame(ctx, imgs, 'bush_small', W - 18, H - 20);

    // sötétítés: felül (a cím olvasható legyen), a széleken és alul
    tint(ctx, 0, 0, W, H, '#060c0c', 0.9, (x, y) => {
      const top = 1 - y / 46;
      const side = Math.abs(x + 0.5 - W / 2) / (W / 2);
      const bottom = (y - (H - 30)) / 30;
      const d = Math.max(0, top * 0.9, (side - 0.6) * 1.4, bottom * 0.6);
      return d <= 0 ? 0 : band(1 - Math.min(1, d), x, y);
    });
    return {
      rc, fall, pond, fire,
      lights: [{ x: fire.x, y: fire.y - 6, r: 20, c: '#ff9a3c', a: 0.3 }].concat(mush.map(m => ({ x: m.x + 5, y: m.y - 6, r: 9, c: m.c, a: 0.3 }))),
    };
  }

  // ---------- mozgó réteg: vízesés, tó csillogása, a tábortűz lángja ----------
  function paintAnim(ctx, imgs, W, H, g, k) {
    ctx.clearRect(0, 0, W, H);
    const f = g.fall;
    // oszloponként más ütemű, más hosszú csíkok: a víz lefelé zuhog
    for (let x = 0; x < f.w; x++) {
      const v = 2 + ((x * 5) % 3 === 0 ? 1 : 0), L = 7 + ((x * 3) % 5), ph = (x * 13) % L;
      for (let y = 0; y < f.h; y++) {
        const s = (((y - k * v + ph) % L) + L) % L;
        const edge = x === 0 || x === f.w - 1;
        ctx.fillStyle = edge ? (s < 2 ? '#4a88c4' : '#2a557a') : s === 0 ? '#e8f7ff' : s < 2 ? '#a8d8f8' : s < 4 ? '#6aa8dc' : '#3f7cb8';
        ctx.fillRect(f.x + x, f.y + y, 1, 1);
      }
    }
    // hab a vízesés alján
    for (let i = 0; i < 14; i++) {
      const x = f.x - 3 + ((i * 5 + k * 3) % (f.w + 6)), y = f.y + f.h - 2 + ((i * 3 + k) % 4);
      ctx.fillStyle = i % 3 ? '#e6f6ff' : '#9fd2f5';
      ctx.fillRect(x, y, 1, 1);
    }
    // a tó csillogása
    const p = g.pond;
    for (let i = 0; i < 5; i++) {
      const a = i * 1.7 + k * 0.05, x = Math.round(p.x - 4 + Math.cos(a) * p.rx * 0.6), y = Math.round(p.y + 1 + Math.sin(a * 1.3) * p.ry * 0.5);
      if ((k + i * 3) % 6 < 3) { ctx.fillStyle = '#bfe6ff'; ctx.fillRect(x, y, 2, 1); }
    }
    // a tábortűz lángja
    if (imgs.fire) {
      const st = Game.data.assets.strips.fire_small, n = Math.max(1, Math.floor(imgs.fire.width / st.frameWidth));
      ctx.drawImage(imgs.fire, (k % n) * st.frameWidth + 8, 10, 18, 26, g.fire.x - 9, g.fire.y - 24, 18, 26);
    }
  }

  Game.chestScene = {
    SCALE,
    create(sceneEl, stageEl) {
      const bg = ui.el('canvas', 'cs-bg');
      const anim = ui.el('canvas', 'cs-anim');
      const glow = ui.el('canvas', 'cs-glow');
      const rune = ui.el('canvas', 'cs-rune');
      const flies = ui.el('div', 'cs-flies');
      for (let i = 0; i < 14; i++) {
        const d = ui.el('span', 'cs-fly');
        d.style.left = (4 + Math.random() * 92) + '%';
        d.style.top = (20 + Math.random() * 70) + '%';
        d.style.setProperty('--dur', (5 + Math.random() * 6).toFixed(1) + 's');
        d.style.setProperty('--delay', (-Math.random() * 10).toFixed(1) + 's');
        d.style.setProperty('--dx', Math.round((Math.random() - 0.5) * 14) * SCALE + 'px');
        d.style.setProperty('--dy', Math.round(-4 - Math.random() * 10) * SCALE + 'px');
        flies.append(d);
      }
      [bg, anim, glow, rune].forEach(c => { c.width = c.height = 0; });
      sceneEl.prepend(bg, anim, glow, rune);
      sceneEl.append(flies);

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
        if (geo) paintAnim(anim.getContext('2d'), imgs, geo.W, geo.H, geo, ++frameNo);
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
        const chestY = Math.round((st + sh - 8) / SCALE); // a nyitott láda alja: itt áll a fűben
        const g = paintRuins(sizeCanvas(bg, W, H), imgs, W, H, chestY);
        // fények: tűz és gombák (külön réteg, lobog)
        const gctx = sizeCanvas(glow, W, H);
        gctx.clearRect(0, 0, W, H);
        g.lights.forEach(l => tint(gctx, l.x - l.r, l.y - l.r, l.r * 2 + 1, l.r * 2 + 1, l.c, l.a,
          (x, y) => { const d = Math.hypot(x + 0.5 - l.x, y + 0.5 - l.y) / l.r; return d > 1 ? 0 : band(d, x, y); }));
        sizeCanvas(anim, W, H);
        geo = Object.assign(g, { W, H });
        paintAnim(anim.getContext('2d'), imgs, W, H, geo, frameNo);
        drawRune();
        if (!timer) timer = setInterval(tick, 100);
      }

      const ro = window.ResizeObserver ? new ResizeObserver(() => paint()) : null;
      if (ro) ro.observe(sceneEl);
      else window.addEventListener('resize', paint);
      loadAll().then(r => { imgs = r; paint(); }, () => { /* kép nélkül a sötét háttér marad */ });

      const api = {
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
