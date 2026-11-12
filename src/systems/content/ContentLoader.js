// A játék tartalmának betöltése a data/*.json fájlokból.
//
// Weboldalként (http/https) a JSON fájlokat tölti be, így a szerkesztésük azonnal látszik.
// Ha a játék file:// alól fut (dupla kattintás az index.html-re), a böngésző nem engedi a fetch-et:
// ilyenkor a data/bundle.js-ben lévő másolatot használja (`node tools/build-data.js` frissíti).
//
// Betöltés után a tartalom a Game.data alatt érhető el, ID szerint kulcsolva:
//   Game.data.dungeons[id], .monsters[id], .dungeonProps[id], .items[id], .lootTables[id], .tasks[id], .shop[id]
//   Game.data.strings (fordítások: kulcs -> { de, hu }, data/translations.json), Game.data.map (világtérkép)
//   Game.data.maps[id]: a nyers Tiled térképek (data/maps/<id>.json) -- a BootScene a Phaser cache-be is beteszi
//
// A térképek (data/maps/*.json) Tiled formátumúak; a világtérkép az "overworld", a dungeonöké a
// dungeons.json "map" mezője. A Game.data.map és a Game.data.dungeons[id] ezekből készül (systems/maps/TiledMap.js).
(function () {
  // kulcs a Game.data alatt -> fájlnév a data/ mappában. `list`: tömb, amit ID szerint indexelünk.
  const FILES = {
    strings:      { file: 'translations.json' },
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

  const MAPS_DIR = 'maps/';
  const OVERWORLD = 'overworld';
  // a betöltendő térképek: a világtérkép + minden dungeon "map" mezője
  const mapIds = dungeons => [OVERWORLD, ...new Set((Array.isArray(dungeons) ? dungeons : []).map(d => d && d.map).filter(id => typeof id === 'string'))];

  async function fetchJson(url) {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error(url + ': HTTP ' + res.status);
    return res.json();
  }
  async function fetchAll(base) {
    const raw = { maps: {} };
    await Promise.all(Object.keys(FILES).map(async key => { raw[key] = await fetchJson(base + FILES[key].file); }));
    await Promise.all(mapIds(raw.dungeons).map(async id => { raw.maps[id] = await fetchJson(base + MAPS_DIR + id + '.json'); }));
    return raw;
  }

  // A Tiled térképekből a játék belső leírása: Game.data.map és a teljes dungeon-leírások.
  function expandMaps(raw) {
    const issues = [];
    const maps = raw.maps || {};
    const out = Object.assign({}, raw);
    if (maps[OVERWORLD]) {
      const ow = Game.tiledMap.parseOverworld(maps[OVERWORLD]);
      out.map = ow.map;
      issues.push(...ow.issues);
    } else {
      issues.push('hiányzik a világtérkép: data/maps/' + OVERWORLD + '.json');
      out.map = { tileSize: 16, width: 0, height: 0, spawn: { x: 0, y: 0 }, legend: { ground: {}, objects: {} }, ground: [], objects: [], pois: [] };
    }
    out.dungeons = [];
    (Array.isArray(raw.dungeons) ? raw.dungeons : []).forEach(entry => {
      if (!entry || !maps[entry.map]) { issues.push('dungeons.' + (entry && entry.id) + ': hiányzik a térképe (data/maps/' + (entry && entry.map) + '.json), kihagyom'); return; }
      const d = Game.tiledMap.parseDungeon(maps[entry.map], entry);
      issues.push(...d.issues);
      out.dungeons.push(d.def);
    });
    return { expanded: out, issues };
  }

  const content = Game.content = {
    FILES,
    MAPS_DIR,
    mapIds,
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
      const { expanded, issues } = expandMaps(raw);
      Object.keys(FILES).forEach(key => {
        const v = expanded[key] === undefined ? (FILES[key].list ? [] : {}) : expanded[key];
        Game.data[key] = FILES[key].list ? index(v) : v;
      });
      Game.data.map = expanded.map;
      Game.data.maps = raw.maps || {};
      Object.values(Game.data.dungeons).forEach(d => { if (d.darkness) d.darkness.color = color(d.darkness.color); });
      content.issues = issues.concat(Game.contentValidator ? Game.contentValidator.validate(expanded) : []);
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
