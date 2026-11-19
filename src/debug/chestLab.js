// Láda-labor (csak index.html?debug=1): egy próbaláda a világtérkép alján, és egy pult, amin kipróbálható,
// mi jön ki a ládákból. A fejlesztőnek, a játékos nem látja. A pult szövegei magyarul jelennek meg
// (a fordítási fájl "hu" változata), mert a fejlesztő nem tud németül.
//
//   - loot tábla és csillagszám választása (Zufall = a valódi sorsolás, vagy fix 1–5)
//   - a láda-ablak háttere (Zufall, vagy egy kiválasztott: src/ui/chestScene.js)
//   - egy húzás esélyei a választott csillagnál (Game.loot.chances)
//   - "Öffnen": a valódi láda-ablak a választott beállítással
//   - "1000× szimulálás": csillag-eloszlás, átlagos tételszám, tárgyanként hány ládában volt és átlag mennyi
//   - "Tárgyak": tárgy-katalógus kategóriánként (ikon, név, ritkaság, ár, passzívok, melyik ládából eshet)
(function () {
  const ui = Game.ui;
  const hu = (key, vars) => Game.i18n.hu(key, vars);
  const pct = x => (x * 100).toFixed(x < 0.01 ? 2 : 1) + '%';
  const state = { table: null, stars: 0, scene: '' }; // stars 0 / scene '' = Zufall

  const name = e => (e.gold !== undefined ? hu('loot.gold') : Game.i18n.de(Game.data.items[e.item].name) + ' – ' + hu(Game.data.items[e.item].name));
  const rarityOf = e => (e.gold !== undefined ? 'gold' : Game.data.items[e.item].rarity);

  // gomb magyar felirattal (a "?" ugyanúgy megvan)
  function huBtn(key, fn, cls) { const w = ui.btn(key, fn, cls); w.querySelector('button').textContent = hu(key); return w; }

  function el(tag, cls, text) { const e = ui.el(tag, cls); if (text !== undefined) e.textContent = text; return e; }

  function table(rows, head) {
    const t = el('table', 'lab-table');
    if (head) t.append(ui.el('tr', '', head.map(h => el('th', '', h))));
    rows.forEach(r => t.append(ui.el('tr', '', r.map(c => el('td', '', c)))));
    return t;
  }

  // 1000 láda szimulálása: csillagok, tételszám, tárgyanként előfordulás és átlag mennyiség
  function simulate(tableId, stars, n) {
    const starCount = [0, 0, 0, 0, 0, 0], seen = {}, qty = {};
    let entries = 0, gold = 0, goldChests = 0;
    for (let i = 0; i < n; i++) {
      const s = stars || Game.loot.rollStars(tableId);
      starCount[s]++;
      const loot = Game.loot.roll(tableId, { stars: s });
      loot.forEach(e => {
        const k = e.gold !== undefined ? '_gold' : e.item;
        seen[k] = (seen[k] || 0) + 1;
        qty[k] = (qty[k] || 0) + (e.gold !== undefined ? e.gold : e.qty);
        entries++;
        if (e.gold !== undefined) { gold += e.gold; goldChests++; }
      });
    }
    return { n, starCount, seen, qty, entries, gold, goldChests };
  }

  function render(panelBody) {
    const tables = Object.keys(Game.data.lootTables);
    if (!state.table) state.table = tables[0];

    const sel = el('select', 'lab-select');
    tables.forEach(id => { const o = el('option', '', id); o.value = id; o.selected = id === state.table; sel.append(o); });
    sel.addEventListener('change', () => { state.table = sel.value; render(panelBody); });

    const starBtns = ui.el('div', 'lab-stars', [0, 1, 2, 3, 4, 5].map(s => {
      const b = el('button', 'btn lab-star' + (state.stars === s ? ' primary' : ''), s ? s + '★' : hu('debug.random'));
      b.type = 'button';
      b.addEventListener('click', () => { state.stars = s; render(panelBody); });
      return b;
    }));

    const sceneBtns = ui.el('div', 'lab-stars', [''].concat(Game.chestScene.THEMES).map(id => {
      const b = el('button', 'btn lab-star' + (state.scene === id ? ' primary' : ''), id ? hu('debug.scene.' + id) : hu('debug.random'));
      b.type = 'button';
      b.addEventListener('click', () => { state.scene = id; render(panelBody); });
      return b;
    }));

    const show = state.stars || 1;
    const ch = Game.loot.chances(state.table, show);
    const rolls = Game.data.config.loot.stars.rolls[show - 1];
    const chances = ui.el('div', 'lab-block', [
      el('h3', '', hu('debug.chances', { n: show }) + (state.stars ? '' : ' ' + hu('debug.chancesRandomNote'))),
      el('p', 'small', hu('debug.rolls', { min: rolls[0], max: rolls[1] })),
      table(ch.map(c => [name(c), rarityOf(c), pct(c.p)]), [hu('debug.colItem'), hu('debug.colRarity'), hu('debug.colChance')]),
    ]);

    const result = ui.el('div', 'lab-block lab-result');
    const runSim = () => {
      const r = simulate(state.table, state.stars, 1000);
      const kids = [el('h3', '', hu('debug.simTitle', { n: r.n }))];
      if (!state.stars) kids.push(el('p', 'small', hu('debug.simStars') + ' ' + [1, 2, 3, 4, 5].map(s => s + '★ ' + pct(r.starCount[s] / r.n)).join(' · ')));
      kids.push(el('p', 'small', hu('debug.simAvg', { avg: (r.entries / r.n).toFixed(2), gold: r.goldChests ? Math.round(r.gold / r.goldChests) : 0 })));
      const keys = Object.keys(r.seen).sort((a, b) => r.seen[b] - r.seen[a]);
      kids.push(table(keys.map(k => {
        const e = k === '_gold' ? { gold: 0 } : { item: k };
        return [name(e), rarityOf(e), pct(r.seen[k] / r.n), (r.qty[k] / r.seen[k]).toFixed(1)];
      }), [hu('debug.colItem'), hu('debug.colRarity'), hu('debug.colInChests'), hu('debug.colAvgQty')]));
      result.replaceChildren(...kids);
    };

    const openBtn = huBtn('debug.openChest', () => {
      const scene = Game.phaser.scene.getScene('World');
      ui.closeModal();
      Game.chestWindow.open({
        style: Game.data.chestStyles[Game.data.config.loot.chestStyle],
        table: state.table,
        stars: state.stars || undefined,
        scene: state.scene || undefined,
        onDone: () => { if (scene && scene.scene.isActive()) Game.chestLab.panel(); },
      });
    }, 'primary');
    const simBtn = huBtn('debug.simulate', runSim);

    panelBody.replaceChildren(
      ui.el('label', 'lab-row', [el('span', '', hu('debug.table')), sel]),
      ui.el('div', 'lab-row', [el('span', '', hu('debug.stars')), starBtns]),
      ui.el('div', 'lab-row', [el('span', '', hu('debug.scene')), sceneBtns]),
      ui.el('div', 'lab-actions', [openBtn, simBtn, huBtn('debug.items', () => catalog())]),
      result,
      chances,
    );
  }

  // ---------- tárgy-katalógus: minden tárgy kategóriánként, a legritkább elöl ----------
  const short = key => hu(key).split(' (')[0];   // "Támadás (erősebb…)" -> "Támadás"
  // melyik loot táblákból eshet: név szerint vagy csomagból
  function sources(it) {
    return Object.values(Game.data.lootTables).filter(t => [].concat(t.entries || [], t.always || []).some(e =>
      e.item === it.id || (e.pick && Game.items.match(e.pick).some(m => m.id === it.id)))).map(t => t.id.replace(/^loot_|_chest$/g, ''));
  }
  let catKind = '';
  function catalog() {
    const body = ui.el('div', 'lab');
    const p = ui.modal({ title: 'debug.items', body: [body], buttons: [huBtn('debug.back', () => Game.chestLab.panel())] });
    p.classList.add('lab-panel');
    const h = p.querySelector('h2 .de'); if (h) h.textContent = hu('debug.items') + ' ';
    const draw = () => {
      const groups = Game.items.byKind(), kinds = Object.keys(groups);
      const btns = ui.el('div', 'lab-stars', [''].concat(kinds).map(k => {
        const n = k ? groups[k].length : Object.values(groups).reduce((a, g) => a + g.length, 0);
        const b = el('button', 'btn lab-star' + (catKind === k ? ' primary' : ''), (k ? short('kind.' + k) : hu('debug.itemsAll')) + ' ' + n);
        b.type = 'button';
        b.addEventListener('click', () => { catKind = k; draw(); });
        return b;
      }));
      const blocks = kinds.filter(k => !catKind || k === catKind).map(k => ui.el('div', 'lab-block', [
        el('h3', '', short('kind.' + k) + ' (' + groups[k].length + ')'),
        ui.el('ul', 'lab-items', groups[k].map(it => {
          const r = Game.items.rarity(it.rarity);
          const st = Game.items.stats(it).map(x => '+' + x.value + x.unit + ' ' + short('stat.' + x.id)).join(', ');
          const li = ui.el('li', 'lab-item', [
            Game.lootUI.icon(it.icon, 2),
            ui.el('span', 'lab-item-text', [
              el('b', '', Game.i18n.de(it.name)), el('span', 'small', ' – ' + hu(it.name)),
              el('span', 'lab-item-meta', [short('rarity.' + it.rarity), it.type, hu('debug.colValue') + ': ' + Game.items.value(it)].join(' · ')
                + (it.exclusive ? ' · ' + hu('debug.exclusive') : '')),
              st ? el('span', 'lab-item-stats', st) : '',
              el('span', 'lab-item-meta', hu('debug.colSource') + ': ' + (sources(it).join(', ') || '–')),
            ]),
          ]);
          if (r) li.style.setProperty('--rarity', r.color);
          return li;
        })),
      ]));
      body.replaceChildren(btns, ...blocks);
    };
    draw();
  }

  Game.chestLab = {
    // a próbaláda a világtérkép alján (a kezdőpont oszlopában, a legközelebbi járható mezőn)
    place(scene) {
      const map = scene.map, g = scene.grid;
      const tile = g.nearestWalkable(map.spawn.x, map.height - 2, 12);
      if (!tile) return;
      const c = g.center(tile.x, tile.y);
      const py = tile.y * map.tileSize + map.tileSize - 1;
      scene.add.image(c.x, py, 'pc_furniture', 'chest_closed').setOrigin(0.5, 1).setDepth(py);
      scene.add.text(c.x, py - 30, 'DEBUG', { fontFamily: 'monospace', fontSize: '7px', color: '#ff66cc' }).setOrigin(0.5, 1).setDepth(py + 1);
      g.block(tile.x, tile.y, true);
      g.rebuild();
      const spots = [[0, 1], [-1, 0], [1, 0], [0, -1]].map(([i, j]) => ({ x: tile.x + i, y: tile.y + j })).filter(s => g.walkable(s.x, s.y));
      g.redirect[tile.x + ',' + tile.y] = { spots, face: { x: c.x, y: c.y }, onReach: () => Game.chestLab.panel() };
      scene.hotspots.push({ x: c.x, y: c.y + 8, radius: 20, prompt: { type: 'debug.type', name: 'debug.chestLab', desc: 'debug.chestLabDesc', action: { key: 'debug.open', fn: () => Game.chestLab.panel() } } });
    },

    panel() {
      const body = ui.el('div', 'lab');
      const p = ui.modal({ title: 'debug.chestLab', body: [body], buttons: [huBtn('common.close', ui.closeModal)] });
      p.classList.add('lab-panel');
      // a címet is magyarul (fejlesztői eszköz)
      const h = p.querySelector('h2 .de'); if (h) h.textContent = hu('debug.chestLab') + ' ';
      render(body);
    },
  };
})();
