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

  // szűrő egy "csomaghoz" (loot tábla "pick"): { kind, type, rarity } -- mindegyik szöveg vagy szövegek tömbje.
  // A különleges (exclusive) tárgyak soha nem kerülnek csomagba: csak az a tábla adja, amelyik név szerint felsorolja.
  const anyOf = (v, x) => v === undefined || (Array.isArray(v) ? v.indexOf(x) >= 0 : v === x);
  function match(filter) {
    const f = filter || {};
    return all().filter(it => !it.exclusive && anyOf(f.kind, it.kind) && anyOf(f.type, it.type) && anyOf(f.rarity, it.rarity));
  }

  // csoportosítás kategória szerint (config sorrend), azon belül rendezve
  function byKind() {
    const out = {};
    Object.keys(cfg().items.kinds).forEach(k => { out[k] = []; });
    all().slice().sort(compare).forEach(it => { (out[it.kind] = out[it.kind] || []).push(it); });
    return out;
  }

  Game.items = { get, list: () => all().slice().sort(compare), value, stackable, stats, compare, match, byKind, rarity, rarityIndex };
})();
