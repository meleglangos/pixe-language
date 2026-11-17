// A láda-ablak háttere: sötét kincskamra (téglafal, két fali fáklya, zászlók, kőpadló, aranykupacok), a láda alatt
// rúnakörrel, ami a nyitáskor a ritkaság színében izzik. A tárgy, a láda, a csillagok és a gyűjtött tárgyak mind
// ebben a jelenetben állnak (nincs üres pergamen a tárgy mögött).
//
//   const sc = Game.chestScene.create(sceneEl, stageEl)   // sceneEl: a jelenet doboza (position: relative)
//   sc.layout()            // újrarajzol, ha a doboz mérete változott (magától is figyeli)
//   sc.setColor(color, a)  // a rúnakör színe és erőssége (0..1)
//   sc.destroy()
//
// A grafika a Pixel Crawler dungeon-készletéből áll össze (src/config/assets.js kivágásai), alacsony felbontású
// vásznon, egész számú nagyítással (SCALE), éles pixelekkel. A sötétítés és a fények lépcsős sávok
// sakktábla-ditherrel, nincs sima átmenet.
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
    const a = Game.data.assets, keys = ['pc_dungeon', 'pc_dprops', 'pc_furniture'], out = {};
    const fire = a.strips.fire_small;
    return Promise.all([
      ...keys.map(k => image(k, a.files[k]).then(im => { out[k] = im; })),
      image('fire_small', fire.url).then(im => { out.fire = im; }),
    ]).then(() => out);
  }
  function frame(ctx, imgs, name, x, y) {
    const f = Game.data.assets.frames[name];
    if (!f || !imgs[f[0]]) return;
    ctx.drawImage(imgs[f[0]], f[1], f[2], f[3], f[4], Math.round(x), Math.round(y), f[3], f[4]);
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
  // egy szín rárakása a vászonra pixelenként; f(x, y) -> 0..1. Nem olvas vissza a vászonról (file://-ról a
  // betöltött kép "tainted", a getImageData ott hibát dob): soronként azonos erősségű szakaszokat fest rá.
  function tint(ctx, w, h, color, max, f) {
    const [r, g, b] = hexRgb(color), pre = 'rgba(' + r + ',' + g + ',' + b + ',';
    for (let y = 0; y < h; y++) {
      let x = 0;
      while (x < w) {
        const a = f(x, y) * max;
        let e = x + 1;
        while (e < w && f(e, y) * max === a) e++;
        if (a > 0) { ctx.fillStyle = pre + a.toFixed(3) + ')'; ctx.fillRect(x, y, e - x, 1); }
        x = e;
      }
    }
  }
  function sizeCanvas(cv, w, h) {
    cv.width = w; cv.height = h;
    cv.style.width = (w * SCALE) + 'px'; cv.style.height = (h * SCALE) + 'px';
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    return ctx;
  }

  // aranykupac: kis halom érme, csillanással (kódból, determinisztikus)
  function goldHeap(ctx, cx, by, w, seed) {
    const h = Math.round(w * 0.45);
    let s = seed;
    const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    for (let y = 0; y < h; y++) {
      const half = Math.round((w / 2) * Math.sqrt(1 - Math.pow((h - y) / h, 2)));
      for (let x = -half; x <= half; x++) {
        const edge = y === 0 || x === -half || x === half;
        const t = (x + half) / Math.max(1, 2 * half);
        ctx.fillStyle = edge ? '#5a3410' : rnd() < 0.18 ? '#fff2a8' : t < 0.35 ? '#ffd24a' : t < 0.75 ? '#e8a830' : '#b5701c';
        ctx.fillRect(cx + x, by - h + y, 1, 1);
      }
    }
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(cx - Math.round(w / 2) - 1, by, w + 3, 1);
    // néhány elgurult érme
    [[-w / 2 - 3, 0], [w / 2 + 2, -1]].forEach(([dx, dy]) => {
      ctx.fillStyle = '#5a3410'; ctx.fillRect(Math.round(cx + dx) - 1, by + dy - 1, 3, 2);
      ctx.fillStyle = '#ffd24a'; ctx.fillRect(Math.round(cx + dx), by + dy - 1, 1, 1);
    });
  }

  // rúnakör: két ellipszis-gyűrű, köztük rúnajelek; 'stone' = vésett (sötét), különben izzó
  const GLYPHS = [
    [[0, 0], [0, 1], [0, 2], [1, 0]], [[0, 0], [1, 1], [2, 0], [1, 2]], [[0, 0], [0, 1], [0, 2], [1, 1], [2, 2]],
    [[1, 0], [0, 1], [2, 1], [1, 2]], [[0, 0], [2, 0], [1, 1], [1, 2]], [[0, 2], [1, 1], [2, 0], [2, 1]],
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
      // a láda takarja a kör közepét és hátsó felét: ott a rúnák úgysem látszanak
      GLYPHS[k % GLYPHS.length].forEach(([x, y]) => ctx.fillRect(gx + x, gy + Math.min(y, 1), 1, 1));
    }
  }

  Game.chestScene = {
    SCALE,
    create(sceneEl, stageEl) {
      const bg = ui.el('canvas', 'cs-bg');
      const torchGlows = [ui.el('canvas', 'cs-torchglow'), ui.el('canvas', 'cs-torchglow')];
      const flames = [ui.el('canvas', 'cs-flame'), ui.el('canvas', 'cs-flame')];
      const rune = ui.el('canvas', 'cs-rune');
      const dust = ui.el('div', 'cs-dust');
      for (let i = 0; i < 12; i++) {
        const d = ui.el('span', 'cs-mote');
        d.style.left = (4 + Math.random() * 92) + '%';
        d.style.setProperty('--dur', (6 + Math.random() * 6).toFixed(1) + 's');
        d.style.setProperty('--delay', (-Math.random() * 10).toFixed(1) + 's');
        d.style.setProperty('--drift', Math.round((Math.random() - 0.5) * 8) * SCALE + 'px');
        dust.append(d);
      }
      [bg, rune].forEach(c => { c.width = c.height = 0; });
      sceneEl.prepend(bg, ...torchGlows, ...flames, rune);
      sceneEl.append(dust);

      let imgs = null, lastKey = '', runeColor = '#ffd75a', runeAlpha = 0.5, geo = null, flameTimer = 0, alive = true;

      function drawRune() {
        if (!geo) return;
        const { W, H, rc } = geo;
        const ctx = sizeCanvas(rune, W, H);
        ctx.clearRect(0, 0, W, H);
        // a kör belseje halványan dereng (dither), a gyűrűk és a rúnák izzanak
        const [r, g, b] = hexRgb(runeColor);
        const img = ctx.createImageData(W, H), d = img.data;
        for (let y = Math.max(0, rc.y - rc.ry - 2); y < Math.min(H, rc.y + rc.ry + 3); y++) {
          for (let x = Math.max(0, rc.x - rc.rx - 2); x < Math.min(W, rc.x + rc.rx + 3); x++) {
            const dd = Math.hypot((x + 0.5 - rc.x) / rc.rx, (y + 0.5 - rc.y) / rc.ry);
            if (dd > 1.05) continue;
            const a = band(dd, x, y) * 0.35, i = (y * W + x) * 4;
            if (!a) continue;
            d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = a * 255;
          }
        }
        ctx.putImageData(img, 0, 0);
        const light = 'rgb(' + [r, g, b].map(v => Math.round(v + (255 - v) * 0.6)).join(',') + ')';
        runeCircle(ctx, rc.x, rc.y, rc.rx, rc.ry, runeColor, runeColor, light);
        rune.style.opacity = runeAlpha;
      }

      function drawFlames(k) {
        const f = Game.data.assets.strips.fire_small;
        flames.forEach((cv, i) => {
          if (!geo) return;
          const ctx = cv.getContext('2d');
          ctx.clearRect(0, 0, cv.width, cv.height);
          const n = (k + i * 2) % Math.max(1, Math.floor(imgs.fire.width / f.frameWidth));
          ctx.drawImage(imgs.fire, n * f.frameWidth + 8, 10, 18, 26, 0, 0, 18, 26);
        });
      }

      function paint() {
        if (!imgs || !alive) return;
        const cw = sceneEl.clientWidth, ch = sceneEl.clientHeight;
        if (!cw || !ch) return;
        const st = stageEl.offsetTop, sh = stageEl.offsetHeight;
        const key = cw + 'x' + ch + ':' + st + ':' + sh;
        if (key === lastKey) return;
        lastKey = key;
        const W = Math.ceil(cw / SCALE), H = Math.ceil(ch / SCALE), cx = Math.floor(W / 2);
        // a fal és a padló határa: a nyitott láda félmagasságánál
        const floorY = Math.round((st + sh - 62) / SCALE);
        const ctx = sizeCanvas(bg, W, H);
        ctx.fillStyle = '#121014';
        ctx.fillRect(0, 0, W, H);
        // a csempék a közép körül szimmetrikusan
        const x0 = cx - Math.ceil(cx / TS) * TS;
        // fal: alulról felfelé, a tövénél a szokásos kétsoros falszakasz, fölötte ismétlődik
        for (let y = floorY - TS, row = 0; y > -TS; y -= TS, row++) {
          for (let x = x0, i = 0; x < W; x += TS, i++) frame(ctx, imgs, (row % 2 ? 'wall_top_' : 'wall_bottom_') + (i % 3), x, y);
        }
        // padló
        for (let y = floorY, j = 0; y < H; y += TS, j++) {
          for (let x = x0, i = 0; x < W; x += TS, i++) {
            const hash = (i * 73 + j * 151 + i * j * 7) % 23;
            frame(ctx, imgs, hash < 3 ? 'floor_alt_' + ((i + j) % 4) : 'floor_' + ((i % 3) + (j % 3) * 3), x, y);
          }
        }
        // árnyék a fal tövében + kőszegély
        ctx.fillStyle = '#394554'; ctx.fillRect(0, floorY - 1, W, 1);
        ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(0, floorY, W, 2);
        ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(0, floorY + 2, W, 2);

        // zászlók és fáklyák a falon, szimmetrikusan
        const torchDX = Math.min(31, Math.floor(W / 2) - 12), bannerDX = torchDX + 16;
        const wallMid = floorY - 30;
        [-1, 1].forEach(s => {
          if (cx - bannerDX - 5 > 1) frame(ctx, imgs, 'banner_red', cx + s * bannerDX - 5, wallMid - 14);
          frame(ctx, imgs, 'sconce', cx + s * torchDX - 3, wallMid);
        });
        // rúnakör a láda alatt (vésett, sötét), aranykupacok mellette
        const rc = { x: cx, y: Math.round((st + sh - 16) / SCALE), rx: 26, ry: 7 };
        runeCircle(ctx, rc.x, rc.y + 1, rc.rx, rc.ry, 'rgba(0,0,0,0.45)', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.4)');
        runeCircle(ctx, rc.x, rc.y, rc.rx, rc.ry, '#5d6a7c', '#4a5566', '#6f7d91');
        if (W > 96) {
          goldHeap(ctx, cx - rc.rx - 14, rc.y + 2, 13, 7);
          goldHeap(ctx, cx + rc.rx + 13, rc.y + 1, 11, 3);
        }
        // fáklyafény a falon (meleg, lépcsős)
        const lights = [-1, 1].map(s => ({ x: cx + s * torchDX, y: wallMid - 4 }));
        tint(ctx, W, H, '#ff9a3c', 0.32, (x, y) => Math.max(...lights.map(l => band(Math.hypot((x - l.x) / 22, (y - l.y) / 18), x, y))));
        // sötétítés: felül (boltozat) és a két szélen (vinyetta)
        tint(ctx, W, H, '#0b0a10', 1, (x, y) => {
          const top = 1 - y / (floorY * 0.9);
          const side = Math.abs(x + 0.5 - W / 2) / (W / 2);
          const d = Math.max(0, top * 0.95, (side - 0.55) * 1.6, (y - floorY) / (H - floorY) * 0.35);
          return d <= 0 ? 0 : band(1 - Math.min(1, d), x, y) * 0.92;
        });

        // fáklyák lángja és fénye (külön réteg: lobog)
        lights.forEach((l, i) => {
          const fl = flames[i];
          sizeCanvas(fl, 18, 26);
          fl.style.left = ((l.x - 9) * SCALE) + 'px';
          fl.style.top = ((wallMid - 19) * SCALE) + 'px';
          const g = torchGlows[i], gw = 30, gh = 30, gctx = sizeCanvas(g, gw, gh);
          const gi = gctx.createImageData(gw, gh), gd = gi.data;
          for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) {
            const a = band(Math.hypot((x + 0.5 - gw / 2) / 14, (y + 0.5 - gh / 2) / 14), x, y) * 0.28, p = (y * gw + x) * 4;
            gd[p] = 255; gd[p + 1] = 170; gd[p + 2] = 80; gd[p + 3] = a * 255;
          }
          gctx.putImageData(gi, 0, 0);
          g.style.left = ((l.x - gw / 2) * SCALE) + 'px';
          g.style.top = ((l.y - 6 - gh / 2) * SCALE) + 'px';
        });
        geo = { W, H, rc };
        drawRune();
        if (!flameTimer) {
          let k = 0;
          drawFlames(0);
          flameTimer = setInterval(() => { if (!sceneEl.isConnected) { api.destroy(); return; } drawFlames(++k); }, 110);
        }
      }

      const ro = window.ResizeObserver ? new ResizeObserver(() => paint()) : null;
      if (ro) ro.observe(sceneEl);
      else window.addEventListener('resize', paint);
      loadAll().then(r => { imgs = r; paint(); }, () => { /* kép nélkül marad a sötét háttér */ });

      const api = {
        layout: paint,
        setColor(color, alpha) {
          runeColor = color || runeColor;
          runeAlpha = alpha == null ? runeAlpha : alpha;
          drawRune();
        },
        destroy() {
          alive = false;
          clearInterval(flameTimer);
          if (ro) ro.disconnect(); else window.removeEventListener('resize', paint);
        },
      };
      return api;
    },
  };
})();
