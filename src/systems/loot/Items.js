// Tárgy-segéd (Game.items): a data/items.json tárgyai a config.js -> rarities / items beállításaival együtt.
// DOM és Phaser nélkül, tesztelhető. Spec: docs/features/item_system.md; leírás: README.md (ebben a mappában).
(function () {
  const cfg = () => Game.data.config;
  const all = () => Object.values(Game.data.items || {});

  // a ritkaság sorszáma a létrán (common = 0 … unreal = 6); ismeretlen: -1
  const rarityIndex = id => cfg().rarities.findIndex(r => r.id === id);
  const rarity = id => cfg().rarities.find(r => r.id === id) || null;
  const kindOrder = k => Object.keys(cfg().items.kinds).indexOf(k);

  function get(id) { return (Game.data.items || {})[id] || null; }

  // ár aranyban: a tárgy "value" mezője, különben a ritkaság alapára
  function value(it) {
    if (typeof it === 'string') it = get(it);
    if (!it) return 0;
    if (it.value !== undefined) return it.value;
    const r = rarity(it.rarity);
    return r ? r.value : 0;
  }

  // összeadódik-e a mennyiség: a tárgy "stack" mezője, különben a kategóriáé
  function stackable(it) {
    if (typeof it === 'string') it = get(it);
    if (!it) return false;
    if (it.stack !== undefined) return it.stack;
    const k = cfg().items.kinds[it.kind];
    return !!(k && k.stack);
  }

  // a passzívok a config sorrendjében: [{ id, value, unit }]
  function stats(it) {
    if (typeof it === 'string') it = get(it);
    if (!it || !it.stats) return [];
    const defs = cfg().items.stats;
    return Object.keys(defs).filter(k => it.stats[k] !== undefined).map(k => ({ id: k, value: it.stats[k], unit: defs[k].unit || '' }));
  }

  // rendezés: ritkább elöl, azon belül kategória (config sorrend), típus, végül ID
  function compare(a, b) {
    if (typeof a === 'string') a = get(a);
    if (typeof b === 'string') b = get(b);
    return (rarityIndex(b.rarity) - rarityIndex(a.rarity)) || (kindOrder(a.kind) - kindOrder(b.kind))
      || String(a.type).localeCompare(String(b.type)) || a.id.localeCompare(b.id);
  }

  // szűrő egy "csomaghoz" (loot tábla "pick"): { kind, type, rarity, place } -- mindegyik szöveg vagy szövegek tömbje.
  //   places: a tábla helyei (loot tábla "places"): a hely-jelölt tárgyak közül csak ezek jöhetnek.
  // Általános tárgy (nincs "places"): bárhonnan. Hely-jelölt tárgy: csak ha a helyei közül valamelyik a tábláé
  // (vagy a csomag "place" szűrőjéé). A csomag "place" szűrője csak az adott hely(ek) tárgyait adja (általánosat nem).
  // A különleges (exclusive) tárgyak soha nem kerülnek csomagba: csak az a tábla adja, amelyik név szerint felsorolja.
  const anyOf = (v, x) => v === undefined || (Array.isArray(v) ? v.indexOf(x) >= 0 : v === x);
  const meets = (a, b) => (a || []).some(x => (b || []).indexOf(x) >= 0);
  function match(filter, places) {
    const f = filter || {}, own = f.place === undefined ? null : [].concat(f.place);
    const allowed = [].concat(places || [], own || []);
    return all().filter(it => !it.exclusive && anyOf(f.kind, it.kind) && anyOf(f.type, it.type) && anyOf(f.rarity, it.rarity)
      && (own ? meets(it.places, own) : (!it.places || !it.places.length || meets(it.places, allowed))));
  }

  // csoportosítás kategória szerint (config sorrend), azon belül rendezve
  function byKind() {
    const out = {};
    Object.keys(cfg().items.kinds).forEach(k => { out[k] = []; });
    all().slice().sort(compare).forEach(it => { (out[it.kind] = out[it.kind] || []).push(it); });
    return out;
  }

  // Egy tárgy használata a táskából (most: ital ivása). Visszatér: { ok, heal } vagy { ok: false, reason }
  //   reason: 'none' (nincs a táskában), 'cannot' (nem használható), 'full' (teli élet)
  function use(id) {
    const it = get(id);
    if (!it || !Game.state.hasItem(id)) return { ok: false, reason: 'none' };
    const heal = it.kind === 'potion' && it.stats && it.stats.heal;
    if (!heal) return { ok: false, reason: 'cannot' };
    if (Game.state.hp >= Game.state.maxHp) return { ok: false, reason: 'full' };
    Game.state.removeItem(id, 1);
    Game.state.heal(heal);
    return { ok: true, heal };
  }

  Game.items = { use, get, list: () => all().slice().sort(compare), value, stackable, stats, compare, match, byKind, rarity, rarityIndex };
})();
