// Tiled térképek (data/maps/*.json) olvasása. A fájlok a Tiled szerkesztővel nyithatók és menthetők
// (Map > Map Properties: orthogonal, 16x16; Layer Format: CSV; a tilesetek beágyazva, relatív képútvonallal).
// A Phaser Tiled loadere is ezt a formátumot olvassa (a BootScene a tilemap-cache-be is beteszi őket).
//
// A térképből a játék belső leírása készül, ugyanaz, amiből a jelenetek rajzolnak:
//   overworld:  ground / objects rétegek (csempe-tulajdonság: char, kind), "pois" és "markers" objektumrétegek
//   dungeon:    "terrain" réteg (char), "props", "monsters", "markers", "puddles", "glints", "drips" objektumrétegek
// A rétegek és objektumok leírása: data/README.md.
(function () {
  const FLIP_MASK = 0x1fffffff; // a gid felső bitjei a tükrözést jelölik

  function props(list) {
    const out = {};
    (Array.isArray(list) ? list : []).forEach(p => { if (p && typeof p.name === 'string') out[p.name] = p.value; });
    return out;
  }

  // Tiled 1.9 "class"-nak, 1.10+ "type"-nak hívja az objektum típusát.
  const typeOf = o => o.type || o.class || '';

  class Reader {
    constructor(json, where) {
      this.json = json || {};
      this.where = where;
      this.issues = [];
      const j = this.json;
      if (j.orientation !== 'orthogonal') this.bad('nem ortogonális térkép');
      if (j.infinite) this.bad('végtelen (infinite) térkép nem támogatott');
      this.ts = j.tilewidth || 16;
      this.width = j.width | 0;
      this.height = j.height | 0;
      // gid -> csempe-tulajdonságok
      this.tiles = {};
      (j.tilesets || []).forEach(set => {
        if (set.source) { this.bad('külső tileset (' + set.source + ') nem támogatott: ágyazd be (Embed Tileset)'); return; }
        (set.tiles || []).forEach(t => { this.tiles[set.firstgid + t.id] = props(t.properties); });
      });
    }

    bad(msg) { this.issues.push(this.where + ': ' + msg); }

    layer(name, type) {
      const l = (this.json.layers || []).find(x => x.name === name);
      if (l && l.type !== type) { this.bad('a(z) "' + name + '" réteg típusa nem ' + type); return null; }
      return l || null;
    }

    // Csemperéteg -> soronként egy szöveg, a csempék "char" tulajdonságából. Üres mező: empty.
    chars(name, empty, legend) {
      const l = this.layer(name, 'tilelayer');
      if (!l) { this.bad('hiányzik a(z) "' + name + '" csemperéteg'); return []; }
      if (l.encoding || l.compression) { this.bad('a(z) "' + name + '" réteg formátuma legyen CSV (Map > Map Properties > Tile Layer Format)'); return []; }
      if (l.width !== this.width || l.height !== this.height || !Array.isArray(l.data) || l.data.length !== this.width * this.height) {
        this.bad('a(z) "' + name + '" réteg mérete nem egyezik a térképével'); return [];
      }
      const rows = [];
      for (let y = 0; y < this.height; y++) {
        let row = '';
        for (let x = 0; x < this.width; x++) {
          const gid = l.data[y * this.width + x] & FLIP_MASK;
          if (!gid) { row += empty; continue; }
          const t = this.tiles[gid];
          if (!t || typeof t.char !== 'string' || t.char.length !== 1) { this.bad(name + ' (' + x + ',' + y + '): ismeretlen csempe (gid ' + gid + ')'); row += empty; continue; }
          if (legend && t.kind) legend[t.char] = t.kind;
          row += t.char;
        }
        rows.push(row);
      }
      return rows;
    }

    objects(name) {
      const l = this.layer(name, 'objectgroup');
      return l ? (l.objects || []) : [];
    }

    // pont (vagy bármilyen objektum) -> a mező, amelyikre esik
    tile(o) { return { x: Math.floor(o.x / this.ts), y: Math.floor(o.y / this.ts) }; }
    // téglalap -> mezőkben (bal felső sarok, szélesség, magasság)
    rect(o) {
      const ts = this.ts;
      return { x: Math.round(o.x / ts), y: Math.round(o.y / ts), w: Math.max(1, Math.round((o.width || 0) / ts)), h: Math.max(1, Math.round((o.height || 0) / ts)) };
    }
  }

  // ---------- világtérkép ----------
  function parseOverworld(json) {
    const r = new Reader(json, 'maps/overworld');
    const legend = { ground: {}, objects: {} };
    const ground = r.chars('ground', 'w', legend.ground);
    const objects = r.chars('objects', '.', legend.objects);
    const spawnObj = r.objects('markers').find(o => typeOf(o) === 'spawn');
    if (!spawnObj) r.bad('hiányzik a kezdőpont (markers réteg, "spawn" típusú pont)');
    const spawn = spawnObj ? r.tile(spawnObj) : { x: 0, y: 0 };
    const pois = r.objects('pois').map(o => {
      const t = r.tile(o), p = props(o.properties);
      return { id: o.name, type: typeOf(o), x: t.x, y: t.y, sprite: p.sprite };
    });
    return {
      map: { tileSize: r.ts, width: r.width, height: r.height, spawn, legend, ground, objects, pois },
      issues: r.issues,
    };
  }

  // ---------- dungeon ----------
  // A dungeons.json bejegyzésével (név, téma, sötétség...) összefésülve adja a teljes leírást.
  function parseDungeon(json, entry) {
    const r = new Reader(json, 'maps/' + entry.map);
    const def = Object.assign({}, entry);
    delete def.map;
    def.layout = r.chars('terrain', '#');

    const markers = r.objects('markers');
    const one = type => {
      const found = markers.filter(o => typeOf(o) === type);
      if (found.length !== 1) r.bad('a markers rétegben pontosan egy "' + type + '" kell (most ' + found.length + ')');
      return found[0];
    };
    const start = one('start'), exit = one('exit'), chest = one('chest');
    if (start) def.start = r.tile(start);
    if (exit) {
      const b = r.rect(exit), p = props(exit.properties);
      def.exit = { x: b.x, y: b.y + b.h - 1 };
      if (p.name) def.exit.name = p.name;
      if (p.desc) def.exit.desc = p.desc;
      if (p.light_color) {
        def.exit.light = { color: p.light_color };
        if (p.light_scale !== undefined) def.exit.light.scale = p.light_scale;
        if (p.light_mode) def.exit.light.mode = p.light_mode;
        if (p.light_hole !== undefined) def.exit.light.hole = p.light_hole;
      }
    }
    if (chest) { const b = r.rect(chest); def.chest = { x: b.x, y: b.y }; }
    def.doors = markers.filter(o => typeOf(o) === 'door').map(o => {
      const b = r.rect(o);
      return { x: b.x, y: b.y + b.h - 1, state: props(o.properties).state || 'open' };
    });

    def.monsters = r.objects('monsters').map(o => Object.assign({ type: o.name }, r.tile(o)));
    const puddles = r.objects('puddles').map(o => r.rect(o));
    if (puddles.length) def.puddles = puddles;
    def.props = r.objects('props').map(o => { const t = r.tile(o); return [o.name, t.x, t.y]; });

    // fénypont: a pont pontos helye a mező közepéhez képest = finom eltolás pixelben
    const glints = r.objects('glints').map(o => {
      const t = r.tile(o);
      return [t.x, t.y, o.name, Math.round(o.x - t.x * r.ts - r.ts / 2), Math.round(o.y - t.y * r.ts - r.ts / 2)];
    });
    if (glints.length) def.glints = glints;

    const drips = r.objects('drips').map(o => { const t = r.tile(o); return [t.x, t.y]; });
    if (drips.length) def.ambience = Object.assign({}, def.ambience, { drips });

    return { def, issues: r.issues };
  }

  Game.tiledMap = { parseOverworld, parseDungeon, props };
})();
