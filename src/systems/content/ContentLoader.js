// A játék tartalmának betöltése a data/*.json fájlokból.
//
// Weboldalként (http/https) a JSON fájlokat tölti be, így a szerkesztésük azonnal látszik.
// Ha a játék file:// alól fut (dupla kattintás az index.html-re), a böngésző nem engedi a fetch-et:
// ilyenkor a data/bundle.js-ben lévő másolatot használja (`node tools/build-data.js` frissíti).
//
// Betöltés után a tartalom a Game.data alatt érhető el, ID szerint kulcsolva:
//   Game.data.dungeons[id], .monsters[id], .dungeonProps[id], .items[id], .lootTables[id], .tasks[id], .shop[id]
//   Game.data.strings (szöveg-kulcs -> { de, hu }), Game.data.map (világtérkép)
(function () {
  // kulcs a Game.data alatt -> fájlnév a data/ mappában. `list`: tömb, amit ID szerint indexelünk.
  const FILES = {
    strings:      { file: 'strings.json' },
    map:          { file: 'world_map.json' },
    monsters:     { file: 'monsters.json', list: true },
    dungeonProps: { file: 'dungeon_props.json', list: true },
    dungeons:     { file: 'dungeons.json', list: true },
    items:        { file: 'items.json', list: true },
    lootTables:   { file: 'loot_tables.json', list: true },
    tasks:        { file: 'tasks.json', list: true },
    shop:         { file: 'shop.json', list: true },
  };

  const index = list => {
    const out = {};
    (Array.isArray(list) ? list : []).forEach(e => { if (e && typeof e.id === 'string' && !(e.id in out)) out[e.id] = e; });
    return out;
  };

  // '#rrggbb' -> 0xrrggbb (a JSON-ban olvashatóbb a szín, a Phaser számot vár)
  const color = v => (typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v) ? parseInt(v.slice(1), 16) : v);

  async function fetchAll(base) {
    const raw = {};
    await Promise.all(Object.keys(FILES).map(async key => {
      const res = await fetch(base + FILES[key].file, { cache: 'no-cache' });
      if (!res.ok) throw new Error(FILES[key].file + ': HTTP ' + res.status);
      raw[key] = await res.json();
    }));
    return raw;
  }

  const content = Game.content = {
    FILES,
    issues: [],

    // Betölti és telepíti a tartalmat. Promise; hiba esetén elutasít.
    async load(base) {
      base = base || 'data/';
      const bundle = window.GAME_CONTENT_BUNDLE;
      let raw = null;
      if (location.protocol !== 'file:') {
        try { raw = await fetchAll(base); } catch (e) { console.warn('A data/*.json nem tölthető be, a data/bundle.js-t használom.', e); }
      }
      if (!raw) raw = bundle;
      if (!raw) throw new Error('Nincs betölthető tartalom (data/*.json, data/bundle.js)');
      return content.install(raw);
    },

    // A nyers (JSON-ból olvasott) tartalom elhelyezése a Game.data alatt + ellenőrzés.
    install(raw) {
      Object.keys(FILES).forEach(key => {
        const v = raw[key] === undefined ? (FILES[key].list ? [] : {}) : raw[key];
        Game.data[key] = FILES[key].list ? index(v) : v;
      });
      Object.values(Game.data.dungeons).forEach(d => { if (d.darkness) d.darkness.color = color(d.darkness.color); });
      content.issues = Game.contentValidator ? Game.contentValidator.validate(raw) : [];
      content.issues.forEach(msg => console.warn('Tartalom:', msg));
      return Game.data;
    },

    // Az összes ismert ID egy típusból (pl. a mentés ellenőrzéséhez).
    ids(key) { return Object.keys(Game.data[key] || {}); },

    // Dungeon ID-k: a megépített dungeonök + a térkép dungeon/boss helyszínei (azok is kaphatnak rekordot).
    dungeonIds() {
      const ids = new Set(content.ids('dungeons'));
      ((Game.data.map && Game.data.map.pois) || []).forEach(p => { if (p.type === 'dungeon' || p.type === 'boss') ids.add(p.id); });
      return [...ids];
    },
  };
})();
