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
      // a fény és a sugarak külön rétegben, ami a széle felé lágyan elhalványul (nincs éles levágás, nincs görgetősáv)
      const glow = ui.el('div', 'cw-glow');
      const rays = ui.el('div', 'cw-rays');
      const fxLayer = ui.el('div', 'cw-fx', [rays, glow]);
      const chestBox = ui.el('div', 'cw-chest-box', [canvas]);
      const reveal = ui.el('div', 'cw-reveal');      // ide emelkedik ki a tárgy
      // a koppintható terület egy div (nem <button>), mert benne "?" gombok is vannak
      const stage = ui.el('div', 'cw-stage', [fxLayer, reveal, chestBox]);
      stage.setAttribute('role', 'button');
      stage.tabIndex = 0;
      stage.setAttribute('aria-label', Game.i18n.de('chest.name'));
      const starEls = [0, 1, 2, 3, 4].map(() => ui.el('span', 'cw-star', [starCanvas('off'), starCanvas('on'), ui.el('span', 'cw-twinkle')]));
      const starRow = ui.el('div', 'cw-stars', starEls);
      const collected = ui.el('div', 'cw-collected');
      const panel = ui.modal({ title: 'chest.name', closable: false, body: [stage, starRow, collected], buttons: [] });
      panel.classList.add('chest-window');
      panel.dataset.stars = stars;
      panel.dataset.phase = 'stars';

      const light = n => starEls.forEach((s, i) => s.classList.toggle('on', i < n));
      const setGlow = (color, scale, alpha) => {
        glow.style.setProperty('--glow', color);
        fx(glow, [{}, { transform: 'translate(-50%, -50%) scale(' + scale + ')', opacity: alpha }], { duration: 350, fill: 'forwards', easing: 'ease-out' });
      };
      const shake = (amp, ms) => anim(canvas, [0, -1, 1, -0.8, 0.8, -0.5, 0.5, 0].map(k => ({ transform: 'translateX(' + (k * amp) + 'px) rotate(' + (k * amp * 0.4) + 'deg)' })), { duration: ms });
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

      // ---------- 2. nyitás 3 koppintással ----------
      async function openTap() {
        taps++;
        chestBox.classList.remove('ready');
        if (taps < OPEN_TAPS) {
          setGlow(GOLD_COLOR, 1 + taps * 0.25 * power, 0.5 + taps * 0.2);
          sparks(3 + taps * 2, '#ffe58a', 40 + taps * 15);
          await shake(4 * taps * power, 260 + taps * 80);
          chestBox.classList.add('ready');
          return;
        }
        // 3. koppintás: a fedél felpattan
        await shake(7 * power, 380);
        if (style.strip) {
          for (const f of style.openFrames) { await draw(canvas, frameOf(style, f)); await wait(1000 / (style.fps || 12)); }
        } else await draw(canvas, frameOf(style, 'open'));
        sparks(10 + stars * 3, '#ffe58a', 70 + stars * 8);
        if (stars >= 4) fx(panel, [0, -1, 1, -1, 1, 0].map(k => ({ transform: 'translate(' + k * stars + 'px,' + (-k * stars / 2) + 'px)' })), { duration: 350 });
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
        rays.classList.remove('on');
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
        if (r.group === 'legendary' || r.group === 'epic') rays.classList.add('on');
        rays.style.setProperty('--rarity', r.color);
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

      draw(canvas, frameOf(style, 'closed')).then(spinStars, () => spinStars());
      return { stars, loot };
    },
  };
})();
