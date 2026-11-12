// A mentés formátuma: alapértékek, verziók közti migrációk, és a betöltött adat ellenőrzése.
//
// HA VÁLTOZIK A MENTÉS SZERKEZETE:
//   1. növeld a VERSION-t,
//   2. írj egy migrations[régi verzió] lépést, ami a régi formát az újra alakítja,
//   3. írj rá tesztet (tests/save.migration.test.js).
// Új mezőnél elég a defaults()-ba felvenni: a régi mentésekbe a sanitize() pótolja.
// A mentésben szereplő ID-k (tárgyak, dungeonök) SOHA nem változhatnak; ha mégis, migráció kell.
(function () {
  //   v1: 1. szakasz (pozíció, HP, arany, üres inventory/gear/dungeons)
  //   v2: dungeons[id] = { visits, clears }
  //   v3: végleges, beszédes dungeon ID-k (dungeon3 -> dungeon_crypt, ...); inventory = [{ id, qty }]
  const VERSION = 3;

  // v2 -> v3: a helyszínek régi, számozott azonosítói
  const DUNGEON_IDS_V3 = { dungeon1: 'dungeon_cave', dungeon2: 'dungeon_mine', dungeon3: 'dungeon_crypt', boss: 'boss_tower' };

  const isObj = v => !!v && typeof v === 'object' && !Array.isArray(v);
  const num = (v, lo, hi, fb) => (Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : fb);
  const count = v => Math.max(0, Math.floor(Number(v)) || 0);

  // migrations[n]: az n. verziójú mentést alakítja (n+1)-esre. Helyben módosít.
  const migrations = {
    1(s) {
      const old = isObj(s.dungeons) ? s.dungeons : {};
      s.dungeons = {};
      Object.keys(old).forEach(id => {
        const d = isObj(old[id]) ? old[id] : {};
        s.dungeons[id] = { visits: Number(d.visits) || 0, clears: Number(d.clears) || 0 };
      });
    },
    2(s) {
      const old = isObj(s.dungeons) ? s.dungeons : {};
      s.dungeons = {};
      Object.keys(old).forEach(id => {
        const to = DUNGEON_IDS_V3[id] || id;
        const prev = s.dungeons[to], d = isObj(old[id]) ? old[id] : {};
        s.dungeons[to] = prev ? { visits: count(prev.visits) + count(d.visits), clears: count(prev.clears) + count(d.clears) } : d;
      });
      // v2-ben az inventory mindig üres volt; ha mégis volt benne szöveges ID, tárgy-bejegyzés lesz belőle
      if (Array.isArray(s.inventory)) s.inventory = s.inventory.map(e => (typeof e === 'string' ? { id: e, qty: 1 } : e));
    },
  };

  function defaults() {
    const cfg = Game.data.config, spawn = Game.data.map.spawn;
    return {
      v: VERSION,
      updatedAt: 0,
      player: { x: spawn.x, y: spawn.y, dir: 'down', hp: cfg.player.maxHp, maxHp: cfg.player.maxHp },
      gold: 0,
      inventory: [],                       // [{ id: tárgy-id, qty }]
      gear: { weapon: null, armor: null }, // { hely: tárgy-id | null }
      dungeons: {},                        // { dungeon-id: { visits, clears } }
      surprises: [],                       // megszerzett meglepetés-lootok ID-i
      flags: { introSeen: false },
    };
  }

  // A régi verziót a jelenlegire hozza. null, ha nem mentés, vagy újabb verziójú (azt nem értjük).
  function migrate(raw) {
    if (!isObj(raw) || typeof raw.v !== 'number' || raw.v !== Math.floor(raw.v) || raw.v < 1 || raw.v > VERSION) return null;
    for (let v = raw.v; v < VERSION; v++) migrations[v](raw);
    raw.v = VERSION;
    return raw;
  }

  // Minden mezőt ellenőriz és javít; az ismeretlen ID-kat eldobja (és feljegyzi az issues-ba),
  // így egy hibás vagy régi mentés sem akaszthatja meg a játékot.
  // known: { items: [id], dungeons: [id] } -- ha egy lista hiányzik, azt a típust nem szűri.
  function sanitize(s, known) {
    const issues = [];
    const def = defaults();
    const itemOk = id => typeof id === 'string' && (!known || !known.items || known.items.indexOf(id) >= 0);
    const dungeonOk = id => !known || !known.dungeons || known.dungeons.indexOf(id) >= 0;

    s.updatedAt = Number.isFinite(s.updatedAt) ? s.updatedAt : 0;

    const p = isObj(s.player) ? s.player : (s.player = {});
    p.maxHp = Math.round(num(p.maxHp, 1, 9999, def.player.maxHp));
    p.hp = Math.round(num(p.hp, 0, p.maxHp, p.maxHp));
    p.x = num(p.x, 0, 9999, def.player.x);
    p.y = num(p.y, 0, 9999, def.player.y);
    if (['up', 'down', 'left', 'right'].indexOf(p.dir) < 0) p.dir = def.player.dir;

    s.gold = Math.floor(num(s.gold, 0, 1e9, 0));

    const inv = [];
    (Array.isArray(s.inventory) ? s.inventory : []).forEach(e => {
      const id = typeof e === 'string' ? e : e && e.id;
      if (!itemOk(id)) { issues.push('ismeretlen tárgy az inventoryban: ' + JSON.stringify(id)); return; }
      const qty = typeof e === 'string' ? 1 : Math.floor(num(e.qty, 1, 1e6, 1));
      const same = inv.find(x => x.id === id);
      if (same) same.qty += qty; else inv.push({ id, qty });
    });
    s.inventory = inv;

    const gear = isObj(s.gear) ? s.gear : {};
    s.gear = {};
    Object.keys(def.gear).forEach(slot => {
      const id = gear[slot];
      if (id === null || id === undefined) { s.gear[slot] = null; return; }
      if (itemOk(id)) s.gear[slot] = id;
      else { s.gear[slot] = null; issues.push('ismeretlen tárgy felszerelve (' + slot + '): ' + JSON.stringify(id)); }
    });

    const dungeons = isObj(s.dungeons) ? s.dungeons : {};
    s.dungeons = {};
    Object.keys(dungeons).forEach(id => {
      if (!dungeonOk(id)) { issues.push('ismeretlen dungeon: ' + id); return; }
      const d = isObj(dungeons[id]) ? dungeons[id] : {};
      s.dungeons[id] = { visits: count(d.visits), clears: count(d.clears) };
    });

    s.surprises = [...new Set((Array.isArray(s.surprises) ? s.surprises : []).filter(x => typeof x === 'string'))];

    const flags = isObj(s.flags) ? s.flags : {};
    s.flags = {};
    Object.keys(flags).forEach(k => { if (typeof flags[k] === 'boolean') s.flags[k] = flags[k]; });
    Object.keys(def.flags).forEach(k => { if (!(k in s.flags)) s.flags[k] = def.flags[k]; });

    s.v = VERSION;
    return { state: s, issues };
  }

  // Nyers (JSON-ból olvasott) adat -> használható állapot, vagy null.
  function parse(raw, known) {
    const m = migrate(raw);
    return m ? sanitize(m, known) : null;
  }

  Game.saveSchema = { VERSION, DUNGEON_IDS_V3, migrations, defaults, migrate, sanitize, parse };
})();
