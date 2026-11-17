// A láda-ablak: a láda nagyban, alatta 1–5 csillag (a láda minősége, véletlen). Koppintásokkal nyílik:
//   1–3. koppintás: megreped, rázkódik, a fedél felpattan (több csillag = erősebb)
//   utána tárgyanként egy koppintás: előtte a láda a következő tárgy ritkaságának színében dereng (előjel),
//   koppintásra a tárgy nagyban kiemelkedik a nevével és ritkaságával (legendary: külön show)
//   a végén a tárgyak sorban, alattuk a lista és a "Super!" gomb.
// Sietni lehet: koppintásra az épp futó animáció azonnal a végére ugrik (nincs "mindet mutat" gomb).
// Spec: docs/features/chest_stars.md (2. kiegészítés).
//
//   Game.chestWindow.open({ style: chest_styles.json bejegyzés, table: loot tábla id, onDone(loot, stars), stars? })
//
// A láda képe canvasra rajzolódik a láda-stílus képkockáiból (kivágás vagy animációs csík), 5× nagyítva, éles
// pixel arttal -- így bármelyik láda-stílus működik vele. A loot most csak látvány (nem tárolódik).
(function () {
  const ui = Game.ui;
  const SCALE = 5;
  const OPEN_TAPS = 3;
  // pixel art csillag: egy ötágú csillag alakból generált N×N-es pixelrács (körvonal, csillanás bal-felül,
  // árnyék jobb-alul), egész számú nagyítással -- éles, és illik a játék grafikájához
  const STAR_N = 15, STAR_PX = 3;
  const STAR_COLORS = {
    on: { o: '#7a4a12', h: '#fff6c2', y: '#ffcc33', s: '#e0961a' },
    off: { o: '#9c8a66', h: '#efe4c8', y: '#dccca6', s: '#c4b088' },
  };
  const STAR_GRID = (function () {
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 0.52 : 1.05;
      pts.push([Math.cos(a) * r, Math.sin(a) * r + 0.09]);
    }
    const inside = (x, y) => {
      let c = false;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const [xi, yi] = pts[i], [xj, yj] = pts[j];
        if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
      }
      return c;
    };
    const h = (STAR_N - 1) / 2;
    const at = (x, y) => x >= 0 && y >= 0 && x < STAR_N && y < STAR_N && inside((x - h) / h, (y - h) / h);
    const g = [];
    for (let y = 0; y < STAR_N; y++) for (let x = 0; x < STAR_N; x++) {
      if (!at(x, y)) continue;
      const edge = !at(x - 1, y) || !at(x + 1, y) || !at(x, y - 1) || !at(x, y + 1);
      const d = (x - h) + (y - h); // bal-felül negatív, jobb-alul pozitív
      g.push([x, y, edge ? 'o' : d < -4 ? 'h' : d > 3 ? 's' : 'y']);
    }
    return g;
  })();
  function starCanvas(kind) {
    const c = document.createElement('canvas');
    c.width = c.height = STAR_N * STAR_PX;
    c.className = 'cw-star-' + kind;
    const ctx = c.getContext('2d'), pal = STAR_COLORS[kind];
    STAR_GRID.forEach(([x, y, k]) => { ctx.fillStyle = pal[k]; ctx.fillRect(x * STAR_PX, y * STAR_PX, STAR_PX, STAR_PX); });
    return c;
  }
  const GOLD_COLOR = '#ffd75a';
  const images = {};

  // egy kép (a Phaser már betöltötte; ha nincs Phaser, betöltjük) -> Promise<Image>
  function image(key, url) {
    const tex = window.Game.phaser && Game.phaser.textures && Game.phaser.textures.exists(key) && Game.phaser.textures.get(key).getSourceImage();
    if (tex) return Promise.resolve(tex);
    if (!images[url]) images[url] = new Promise((ok, fail) => { const im = new Image(); im.onload = () => ok(im); im.onerror = fail; im.src = encodeURI(url); });
    return images[url];
  }

  // a láda-stílus egy képkockája: { key, url, x, y, w, h }
  function frameOf(style, which) {
    const a = Game.data.assets;
    if (style.strip) {
      const s = a.strips[style.strip];
      const i = which === 'closed' ? (style.closedFrame || 0) : which;
      return { key: style.strip, url: s.url, x: i * s.frameWidth, y: 0, w: s.frameWidth, h: s.frameHeight };
    }
    const [key, x, y, w, h] = a.frames[which === 'closed' ? style.closed : style.open];
    return { key, url: a.files[key], x, y, w, h };
  }

  function draw(canvas, f) {
    return image(f.key, f.url).then(im => {
      canvas.width = f.w * SCALE; canvas.height = f.h * SCALE;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(im, f.x, f.y, f.w, f.h, 0, 0, f.w * SCALE, f.h * SCALE);
    });
  }

  // ---------- pixeles fények: alacsony felbontású vászon, lépcsős sávok, a sávhatárokon sakktábla-dither ----------
  // (nincs elmosódó, sima átmenet: illik a pixel art stílushoz)
  const FXPX = 5; // a fény-effektek egy pixele a képernyőn (ugyanaz, mint a ládáé)
  const BANDS = [[0.3, 0.55], [0.52, 0.36], [0.75, 0.2], [1, 0.08]];
  const hexRgb = c => { const n = parseInt(String(c).slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  function bandAlpha(d, x, y) {
    for (let i = 0; i < BANDS.length; i++) {
      const [lim, a] = BANDS[i];
      if (d < lim - 0.05) return a;
      if (d < lim + 0.05) return ((x + y) & 1) ? a : (BANDS[i + 1] ? BANDS[i + 1][1] : 0);
    }
    return 0;
  }
  // a vászon w×h logikai pixel; f(x, y) -> átlátszóság (0..1) minden pixelre
  function paint(cv, w, h, color, f) {
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    cv.style.width = (w * FXPX) + 'px'; cv.style.height = (h * FXPX) + 'px';
    const ctx = cv.getContext('2d'), img = ctx.createImageData(w, h), [r, g, b] = hexRgb(color);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const a = f(x, y), i = (y * w + x) * 4;
      if (a <= 0) continue;
      img.data[i] = r; img.data[i + 1] = g; img.data[i + 2] = b; img.data[i + 3] = Math.min(255, a * 255);
    }
    ctx.putImageData(img, 0, 0);
  }
  // kerek (vagy ellipszis) fényfolt
  const pixelGlow = (cv, w, h, color, rx, ry) => paint(cv, w, h, color, (x, y) => bandAlpha(Math.hypot((x + 0.5 - w / 2) / rx, (y + 0.5 - h / 2) / ry), x, y));
  // forgó sugarak: n küllő, a középtől kifelé halványulnak
  const pixelRays = (cv, w, h, color, rot, n, strength) => paint(cv, w, h, color, (x, y) => {
    const dx = x + 0.5 - w / 2, dy = y + 0.5 - h / 2, d = Math.hypot(dx, dy) / (Math.min(w, h) / 2);
    if (d > 1 || d < 0.12) return 0;
    const t = ((Math.atan2(dy, dx) + rot) / (Math.PI * 2) * n) % 1;
    return (t < 0 ? t + 1 : t) < 0.32 ? bandAlpha(d, x, y) * strength : 0;
  });
  // függőleges fényoszlop: középen erős, felfelé lépcsőzetesen halványul
  const pixelPillar = (cv, w, h, color) => paint(cv, w, h, color, (x, y) => {
    const d = Math.abs(x + 0.5 - w / 2) / (w / 2), up = Math.floor((y / h) * 4) / 4; // 4 lépcső
    return bandAlpha(d, x, y) * 1.6 * (0.25 + up * 0.75);
  });

  // a ritkaság-csoport és színe egy loot-tételhez
  function rarityInfo(e) {
    if (e.gold !== undefined) return { group: 'gold', color: GOLD_COLOR, id: null };
    const it = Game.data.items[e.item];
    const r = Game.data.config.rarities.find(x => x.id === it.rarity);
    return { group: String(it.rarity).replace(/\d+$/, ''), color: r ? r.color : '#ffffff', id: it.rarity };
  }

  Game.chestWindow = {
    open(opts) {
      const style = opts.style, table = opts.table;
      const stars = opts.stars || Game.loot.rollStars(table); // opts.stars: fix csillagszám (láda-labor)
      const loot = Game.loot.roll(table, { stars });
      const power = 0.6 + stars * 0.25; // a rázás / fény ereje a csillagszám szerint

      // ---------- sietés: a futó animációk és várakozások egy koppintásra a végükre ugranak ----------
      // anim: fő animáció (amíg fut, a koppintás csak siettet); fx: díszítés (szikra, fény), nem tartja fel a koppintást
      const running = new Set(), effects = new Set(), sleepers = new Set();
      const play = (set, node, frames, o) => {
        if (!node.animate) return Promise.resolve();
        const a = node.animate(frames, o);
        set.add(a);
        return a.finished.catch(() => {}).then(() => { set.delete(a); });
      };
      const anim = (node, frames, o) => play(running, node, frames, o);
      const fx = (node, frames, o) => play(effects, node, frames, o);
      const wait = ms => new Promise(r => { const t = setTimeout(done, ms); function done() { clearTimeout(t); sleepers.delete(done); r(); } sleepers.add(done); });
      const hurry = () => { [running, effects].forEach(set => set.forEach(a => { try { a.finish(); } catch (e) { /* végtelen */ } })); sleepers.forEach(f => f()); };
      const busy = () => running.size > 0 || sleepers.size > 0;

      // ---------- felépítés ----------
      const canvas = ui.el('canvas', 'cw-chest');
      const cracks = ui.el('canvas', 'cw-cracks');   // izzó repedések a ládán (csak a láda pixelein)
      const inner = ui.el('canvas', 'cw-inner');    // a nyitott ládából áradó fény (pixeles)
      const body = ui.el('div', 'cw-body', [canvas, inner, cracks]); // a láda teste: kép + fény + repedések együtt mozognak
      const lid = ui.el('canvas', 'cw-lid');         // a robbanáskor lerepülő fedél (a csukott kép felső része)
      // a fény és a sugarak külön rétegben, ami a széle felé lágyan elhalványul (nincs éles levágás, nincs görgetősáv)
      const glow = ui.el('canvas', 'cw-glow');
      const rays = ui.el('canvas', 'cw-rays');
      const pillar = ui.el('canvas', 'cw-pillar');   // robbanáskor fényoszlop (pixeles)
      const fxLayer = ui.el('div', 'cw-fx', [rays, glow, pillar]);
      const chestBox = ui.el('div', 'cw-chest-box', [body, lid]);
      const flash = ui.el('div', 'cw-flash');
      // a vászon alapból 300×150 px: amíg nincs rajta semmi, legyen 0, különben kilóg (görgetősáv, ugrálás)
      [cracks, lid, inner, glow, rays, pillar].forEach(c => { c.width = c.height = 0; });
      const reveal = ui.el('div', 'cw-reveal');      // ide emelkedik ki a tárgy
      // a koppintható terület egy div (nem <button>), mert benne "?" gombok is vannak
      const stage = ui.el('div', 'cw-stage centered', [fxLayer, reveal, chestBox]); // nyitás előtt a láda középen áll
      stage.setAttribute('role', 'button');
      stage.tabIndex = 0;
      stage.setAttribute('aria-label', Game.i18n.de('chest.name'));
      const starEls = [0, 1, 2, 3, 4].map(() => ui.el('span', 'cw-star', [starCanvas('off'), starCanvas('on'), ui.el('span', 'cw-twinkle')]));
      const starRow = ui.el('div', 'cw-stars', starEls);
      const collected = ui.el('div', 'cw-collected');
      const panel = ui.modal({ title: 'chest.name', closable: false, body: [stage, starRow, collected], buttons: [] });
      panel.classList.add('chest-window');
      panel.append(flash);
      panel.dataset.stars = stars;
      panel.dataset.phase = 'stars';

      const light = n => starEls.forEach((s, i) => s.classList.toggle('on', i < n));
      // a fény-effektek a láda közepéhez igazodnak (a láda nyitás előtt középen, utána lent áll)
      function placeFx() {
        const st = stage.getBoundingClientRect(), c = canvas.getBoundingClientRect();
        if (!c.width) return;
        fxLayer.style.setProperty('--cx', (c.left + c.width / 2 - st.left) + 'px');
        fxLayer.style.setProperty('--cy', (c.top + c.height / 2 - st.top) + 'px');
        fxLayer.style.setProperty('--cb', (c.bottom - st.top) + 'px');
      }
      const setGlow = (color, scale, alpha) => {
        placeFx();
        const r = 8 + scale * 7;
        pixelGlow(glow, 48, 48, color, r, r);
        pixelGlow(inner, 24, 12, color, 10, 6);
        glow.style.opacity = alpha;
      };
      // sugarak: 'off' | 'leak' (halvány, lassú) | 'on' (erős); lépésenként forognak (~12 kép/mp, pixel art érzet)
      let raysMode = 'off', raysColor = GOLD_COLOR, raysRot = 0, raysTimer = 0;
      function setRays(mode, color) {
        raysMode = mode; if (color) raysColor = color;
        rays.classList.toggle('on', mode !== 'off');
        clearInterval(raysTimer);
        if (mode === 'off') return;
        const tick = () => {
          if (!rays.isConnected) { clearInterval(raysTimer); return; }
          raysRot += mode === 'on' ? 0.07 : 0.035;
          pixelRays(rays, 60, 48, raysColor, raysRot, 10, mode === 'on' ? 1.5 : 0.9);
        };
        tick();
        raysTimer = setInterval(tick, 85);
      }
      const shake = (amp, ms) => anim(body, [0, -1, 1, -0.8, 0.8, -0.5, 0.5, 0].map(k => ({ transform: 'translateX(' + (k * amp) + 'px) rotate(' + (k * amp * 0.4) + 'deg)' })), { duration: ms });
      const sparks = (n, color, spread) => {
        for (let i = 0; i < n; i++) {
          const sp = ui.el('span', 'cw-spark');
          sp.style.background = color;
          chestBox.append(sp);
          const ang = Math.PI * (1.05 + Math.random() * 0.9), d = spread * (0.6 + Math.random() * 0.6);
          fx(sp, [{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: 'translate(' + Math.cos(ang) * d + 'px,' + Math.sin(ang) * d + 'px) scale(.3)', opacity: 0 }],
            { duration: 550 + Math.random() * 300, easing: 'ease-out' }).then(() => sp.remove());
        }
      };

      // ---------- 1. a csillagok pörögnek, és lassulva megállnak ----------
      let phase = 'stars', taps = 0, next = 0, shown = null;
      async function spinStars() {
        const ticks = 10 + stars;
        for (let k = 0; k < ticks && phase === 'stars' && !skipStars; k++) { light((k % 5) + 1); await wait(55 + k * 9); }
        light(stars);
        starEls.slice(0, stars).forEach((s, i) => {
          fx(s, [{ transform: 'scale(1)' }, { transform: 'scale(1.45) rotate(-8deg)' }, { transform: 'scale(1)' }], { duration: 340, delay: i * 80, easing: 'ease-out' });
          fx(s.querySelector('.cw-twinkle'), [{ opacity: 0, transform: 'scale(.2) rotate(0deg)' }, { opacity: 1, transform: 'scale(1.2) rotate(45deg)', offset: 0.4 }, { opacity: 0, transform: 'scale(.4) rotate(90deg)' }], { duration: 600, delay: i * 80 + 120 });
        });
        if (stars === 5) panel.classList.add('cw-five');
        setGlow(GOLD_COLOR, 1, 0.35 + stars * 0.05);
        phase = 'closed';
        panel.dataset.phase = phase;
        chestBox.classList.add('ready');
      }
      let skipStars = false;

      // ---------- 2. nyitás 3 koppintással: ébredés, feltöltődés, robbanás ----------
      // A 2. koppintástól a fény a zsákmány legjobb tárgyának ritkaság-színében izzik (előjel).
      const ORDER = { gold: 0, common: 0, rare: 1, epic: 2, legendary: 3 };
      const best = loot.map(rarityInfo).reduce((a, b) => ((ORDER[b.group] || 0) > (ORDER[a.group] || 0) ? b : a), { group: 'common', color: GOLD_COLOR });
      const bestLevel = ORDER[best.group] || 0;
      const aura = bestLevel ? best.color : GOLD_COLOR;
      const calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
      const buzz = pattern => { try { if (!calm && navigator.vibrate) navigator.vibrate(pattern); } catch (e) { /* nincs rezgés */ } };
      let embers = 0;

      // izzó repedések: pixeles véletlen bolyongás a láda közepéből, utána levágva a láda alakjára
      function addCracks(n, len) {
        if (cracks.width !== canvas.width || cracks.height !== canvas.height) { cracks.width = canvas.width; cracks.height = canvas.height; }
        const ctx = cracks.getContext('2d'), W = canvas.width / SCALE, H = canvas.height / SCALE;
        ctx.globalCompositeOperation = 'source-over';
        for (let i = 0; i < n; i++) {
          let x = W * (0.25 + Math.random() * 0.5), y = H * (0.3 + Math.random() * 0.45);
          const dx = Math.random() < 0.5 ? -1 : 1;
          for (let k = 0; k < len; k++) {
            ctx.fillStyle = k < 2 ? '#ffffff' : '#fff3b0';
            ctx.fillRect(Math.round(x) * SCALE, Math.round(y) * SCALE, SCALE, SCALE);
            if (Math.random() < 0.7) x += dx; else y += Math.random() < 0.5 ? -1 : 1;
            if (Math.random() < 0.25) y += Math.random() < 0.5 ? -1 : 1;
          }
        }
        ctx.globalCompositeOperation = 'destination-in'; // csak ahol a láda nem átlátszó
        ctx.drawImage(canvas, 0, 0);
        ctx.globalCompositeOperation = 'source-over';
      }

      // lökéshullám a láda alján (lapos ellipszis)
      function ring(color, size, delay) {
        const r = ui.el('span', 'cw-ring');
        r.style.borderColor = color;
        fxLayer.append(r); // a fény-rétegben: nem lóg ki az ablakból
        fx(r, [{ transform: 'translate(-50%, -50%) scale(.2, .07)', opacity: 1 }, { transform: 'translate(-50%, -50%) scale(' + size + ', ' + size * 0.35 + ')', opacity: 0 }],
          { duration: 600, delay: delay || 0, easing: 'cubic-bezier(.2,.7,.3,1)' }).then(() => r.remove());
      }

      // ütés-érzet: összenyomódik, felugrik, fehéren felvillan
      const hit = (k) => anim(body, [
        { transform: 'translateY(0) scale(1, 1)', filter: 'brightness(2.4)' },
        { transform: 'translateY(0) scale(' + (1 + 0.12 * k) + ', ' + (1 - 0.14 * k) + ')', filter: 'brightness(1.6)', offset: 0.18 },
        { transform: 'translateY(' + (-10 - 8 * k) + 'px) scale(' + (1 - 0.06 * k) + ', ' + (1 + 0.1 * k) + ')', filter: 'brightness(1.1)', offset: 0.5 },
        { transform: 'translateY(0) scale(' + (1 + 0.06 * k) + ', ' + (1 - 0.06 * k) + ')', filter: 'brightness(1)', offset: 0.8 },
        { transform: 'translateY(0) scale(1, 1)', filter: 'brightness(1)' },
      ], { duration: 380 + k * 60, easing: 'ease-out' });

      // parázs: apró fénypontok szállnak fel a láda körül, amíg fel van töltődve
      function startEmbers() {
        embers = setInterval(() => {
          if (!fxLayer.isConnected) { clearInterval(embers); return; }
          const e = ui.el('span', 'cw-ember');
          e.style.background = Math.random() < 0.5 ? aura : '#ffe58a';
          e.style.left = 'calc(var(--cx) + ' + Math.round((Math.random() - 0.5) * 120) + 'px)';
          fxLayer.append(e);
          fx(e, [{ transform: 'translateY(0) scale(1)', opacity: 0 }, { opacity: 1, offset: 0.2 }, { transform: 'translate(' + Math.round((Math.random() - 0.5) * 30) + 'px, ' + (-90 - Math.random() * 70) + 'px) scale(.4)', opacity: 0 }],
            { duration: 1100 + Math.random() * 600, easing: 'ease-out' }).then(() => e.remove());
        }, 70);
      }

      // robbanáskor aranyérmék záporoznak (parabola), a fény-rétegben (az ablakon belül maradnak)
      function coinBurst(n) {
        for (let i = 0; i < n; i++) {
          const c = Game.lootUI.icon(Game.data.config.loot.coinIcon, 1);
          c.classList.add('cw-coin');
          fxLayer.append(c);
          const vx = (Math.random() - 0.5) * 300, vy = -(180 + Math.random() * 160), g = 520, T = 0.9 + Math.random() * 0.4;
          const frames = [];
          for (let k = 0; k <= 8; k++) {
            const t = T * k / 8;
            frames.push({ transform: 'translate(' + (vx * t) + 'px, ' + (vy * t + g * t * t / 2) + 'px) rotate(' + (k * 45 * Math.sign(vx)) + 'deg)', opacity: k < 6 ? 1 : (8 - k) / 2 });
          }
          fx(c, frames, { duration: T * 1000, easing: 'linear' }).then(() => c.remove());
        }
      }

      async function openTap() {
        taps++;
        chestBox.classList.remove('ready', 'cw-charging');
        if (taps === 1) {
          // 1. ébredés
          buzz(20);
          addCracks(2, 6);
          ring('#ffe58a', 2.2);
          sparks(6, '#c9b58a', 50);            // por
          sparks(4, '#fff3b0', 40);
          setGlow(GOLD_COLOR, 1.25 * power, 0.6);
          await hit(1);
          chestBox.classList.add('ready');
          return;
        }
        if (taps === 2) {
          // 2. feltöltődés: a fény már a legjobb tárgy színében izzik
          buzz([25, 30, 25]);
          addCracks(4, 10);
          cracks.style.setProperty('--aura', aura);
          cracks.classList.add('hot');
          ring(aura, 3);
          sparks(10, aura, 60);
          setGlow(aura, 1.5 * power, 0.85);
          setRays('leak', aura);
          panel.classList.add('cw-dim'); // "leoltják a villanyt": az ablak háttere lépcsőzetesen elsötétül
          if (stars >= 4) starEls.forEach(st => st.classList.add('hot'));
          startEmbers();
          await hit(1.6);
          chestBox.classList.add('cw-charging'); // remeg, mintha alig bírná visszatartani
          return;
        }
        // 3. robbanás
        await anim(body, [{ transform: 'scale(1, 1)' }, { transform: 'scale(1.18, .72)', filter: 'brightness(1.8)' }], { duration: 170, easing: 'ease-in', fill: 'forwards' });
        clearInterval(embers);
        buzz(bestLevel >= 3 ? [80, 40, 160] : [60, 30, 100]);
        fx(flash, [{ opacity: 0 }, { opacity: bestLevel >= 3 ? 1 : 0.85, offset: 0.15 }, { opacity: 0 }], { duration: bestLevel >= 3 ? 650 : 420, easing: 'ease-out' });
        // a fedél lerepül: a csukott kép felső része külön vásznon
        const lidH = Math.round(canvas.height * 0.42 / SCALE) * SCALE;
        lid.width = canvas.width; lid.height = lidH;
        const lctx = lid.getContext('2d');
        lctx.imageSmoothingEnabled = false;
        lctx.drawImage(canvas, 0, 0, canvas.width, lidH, 0, 0, canvas.width, lidH);
        lid.classList.add('flying');
        stage.classList.remove('centered');
        setTimeout(placeFx, 420);
        if (style.strip) {
          for (const f of style.openFrames) { await draw(canvas, frameOf(style, f)); await wait(1000 / (style.fps || 12)); }
        } else await draw(canvas, frameOf(style, 'open'));
        cracks.getContext('2d').clearRect(0, 0, cracks.width, cracks.height);
        chestBox.classList.add('opened'); // a ládából fény árad (a következő tárgy színében)
        body.getAnimations && body.getAnimations().forEach(a => a.cancel());
        const side = Math.random() < 0.5 ? -1 : 1;
        fx(lid, [
          { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
          { transform: 'translate(' + side * 60 + 'px, -150px) rotate(' + side * 200 + 'deg)', opacity: 1, offset: 0.55 },
          { transform: 'translate(' + side * 110 + 'px, -60px) rotate(' + side * 380 + 'deg)', opacity: 0 },
        ], { duration: 900, easing: 'cubic-bezier(.2,.8,.4,1)' }).then(() => { lid.classList.remove('flying'); lid.width = lid.height = 0; });
        ring('#ffffff', 4.5);
        ring(aura, 6, 120);
        pixelPillar(pillar, 14, 48, aura);
        fx(pillar, [{ transform: 'translateX(-50%) scaleY(0)', opacity: 0 },
          { transform: 'translateX(-50%) scaleY(1)', opacity: 1, offset: 0.25 },
          { transform: 'translateX(-50%) scaleY(1)', opacity: 0 }], { duration: bestLevel >= 3 ? 1600 : 1000, easing: 'steps(8, end)' });
        coinBurst(8 + stars * 3 + bestLevel * 4);
        sparks(16 + stars * 4, '#fff3b0', 110);
        sparks(8 + bestLevel * 6, aura, 130);
        fx(panel, [0, -1, 1, -0.8, 0.8, -0.5, 0.5, 0].map(k => ({ transform: 'translate(' + k * (5 + stars + bestLevel * 2) + 'px,' + (-k * (3 + stars)) + 'px)' })), { duration: 450 + bestLevel * 100 });
        setGlow(aura, 1.8, 0.9);
        setRays('off');
        setTimeout(() => panel.classList.remove('cw-dim'), 500);
        starEls.forEach(st => st.classList.remove('hot'));
        await anim(body, [{ transform: 'scale(.9, 1.15)' }, { transform: 'scale(1.06, .95)', offset: 0.5 }, { transform: 'scale(1, 1)' }], { duration: 320, easing: 'ease-out' });
        await wait(250);
        phase = 'reveal';
        panel.dataset.phase = phase;
        prepareNext();
      }

      // ---------- 3. tárgyankénti kiemelés ----------
      // előjel: a láda a következő tárgy ritkaságának színében dereng. Az utolsó tárgy után is koppintásra vár,
      // és csak utána jön az összesítő.
      function prepareNext() {
        const left = loot.length - next;
        if (!left) {
          phase = 'last';
          panel.dataset.phase = phase;
          chestBox.classList.remove('cw-tease');
          setGlow(GOLD_COLOR, 0.9, 0.25);
          return;
        }
        const r = rarityInfo(loot[next]);
        const strong = { common: 0, gold: 0, rare: 1, epic: 2, legendary: 3 }[r.group] || 0;
        setGlow(r.color, 1.2 + strong * 0.25, 0.55 + strong * 0.15);
        chestBox.classList.toggle('cw-tease', strong >= 2); // epic / legendary: remeg és lüktet a láda
        chestBox.classList.add('ready');
      }

      // a kiemelt tárgy a gyűjtősorba kerül
      function stash() {
        if (!shown) return;
        const it = shown;
        shown = null;
        collected.append(it.small);
        fx(it.small, [{ transform: 'scale(.2)', opacity: 0 }, { transform: 'scale(1.2)', opacity: 1, offset: 0.7 }, { transform: 'scale(1)', opacity: 1 }], { duration: 300 });
        it.big.remove();
        setRays('off');
      }

      async function revealTap() {
        stash();
        chestBox.classList.remove('ready', 'cw-tease');
        const e = loot[next++];
        const r = rarityInfo(e);
        const item = e.item && Game.data.items[e.item];
        const icon = Game.lootUI.icon(item ? item.icon : Game.data.config.loot.goldIcon, 4);
        icon.classList.add('cw-big-icon');
        const label = e.gold !== undefined
          ? ui.el('div', 'cw-label', [ui.el('div', 'cw-name', [ui.tx('loot.gold')]), ui.el('div', 'cw-qty', ['+' + e.gold])])
          : ui.el('div', 'cw-label', [
            ui.el('div', 'cw-name', [ui.tx(item.name)]),
            ui.el('div', 'cw-rarity', [ui.tx('rarity.' + item.rarity)]),
            e.qty > 1 ? ui.el('div', 'cw-qty', ['×' + e.qty]) : '',
          ]);
        const big = ui.el('div', 'cw-item cw-' + r.group, [icon, label]);
        big.style.setProperty('--rarity', r.color);
        if (r.group === 'legendary') big.prepend(ui.el('div', 'cw-legend-title', [ui.tx('chest.legendary')]));
        const small = Game.lootUI.icon(item ? item.icon : Game.data.config.loot.goldIcon);
        small.classList.add('cw-small');
        small.style.setProperty('--rarity', r.color);
        shown = { big, small };

        // ritkább tárgy: előtte rázkódás, utána több fény
        if (r.group === 'epic') await shake(6 * power, 420);
        if (r.group === 'legendary') { await shake(9 * power, 700); await wait(150); }
        reveal.replaceChildren(big);
        if (r.group === 'legendary' || r.group === 'epic') setRays('on', r.color);
        if (r.group === 'legendary') fx(panel, [{ boxShadow: '0 0 0 0 #fff0' }, { boxShadow: '0 0 60px 20px ' + r.color }, { boxShadow: '0 0 0 0 #fff0' }], { duration: 900 });
        sparks({ common: 4, gold: 6, rare: 10, epic: 16, legendary: 26 }[r.group] || 4, r.color, 90);
        await anim(big, [
          { transform: 'translate(-50%, 90px) scale(.3)', opacity: 0 },
          { transform: 'translate(-50%, -10px) scale(1.15)', opacity: 1, offset: 0.7 },
          { transform: 'translate(-50%, 0) scale(1)', opacity: 1 },
        ], { duration: r.group === 'legendary' ? 700 : 450, easing: 'ease-out', fill: 'both' });
        prepareNext();
      }

      // ---------- 4. vége: lista és "Super!" ----------
      function finish() {
        phase = 'done';
        panel.dataset.phase = phase;
        chestBox.classList.remove('ready', 'cw-tease');
        setGlow(GOLD_COLOR, 0.9, 0.25);
        // az utolsó kiemelt tárgy is a sorba kerül
        setTimeout(() => {
          stash();
          panel.querySelector('.modal-body').append(Game.lootUI.list(loot));
          const done = () => { ui.closeModal(); if (opts.onDone) opts.onDone(loot, stars); };
          const btns = panel.querySelector('.modal-buttons');
          btns.replaceChildren(ui.btn('loot.ok', done, 'primary'));
          const b = btns.querySelector('button');
          setTimeout(() => { if (b.isConnected) { b.focus({ preventScroll: true }); b.scrollIntoView({ block: 'nearest' }); } }, 0);
        }, 120);
      }

      // ---------- koppintás: ha fut valami, a végére ugrik; különben a következő lépés ----------
      let stepping = false;
      stage.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); stage.click(); } });
      stage.addEventListener('click', async e => {
        if (e.target.closest && e.target.closest('.help')) return; // a "?" csak fordítást mutat, nem léptet
        if (phase === 'stars') { skipStars = true; hurry(); return; }
        if (stepping || busy()) { hurry(); return; }
        if (phase === 'done') return;
        stepping = true;
        try {
          if (phase === 'closed') await openTap();
          else if (phase === 'reveal') await revealTap();
          else if (phase === 'last') finish();
        } finally { stepping = false; }
      });

      draw(canvas, frameOf(style, 'closed')).then(() => { placeFx(); spinStars(); }, () => spinStars());
      return { stars, loot };
    },
  };
})();
