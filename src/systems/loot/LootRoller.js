// Loot sorsolás (Game.loot): egy loot tábla (data/loot_tables.json) alapján véletlen zsákmány.
// DOM és Phaser nélkül, tesztelhető. Leírás: README.md (ebben a mappában).
(function () {
  // [min, max] vagy szám -> egész a tartományban (a határokat is beleértve)
  function range(v, rnd) {
    if (Array.isArray(v)) { const lo = Math.min(v[0], v[1]), hi = Math.max(v[0], v[1]); return lo + Math.floor(rnd() * (hi - lo + 1)); }
    return Number.isInteger(v) ? v : 1;
  }

  function weighted(entries, rnd) {
    const total = entries.reduce((a, e) => a + (e.weight > 0 ? e.weight : 0), 0);
    let x = rnd() * total;
    for (const e of entries) { if (e.weight > 0) { x -= e.weight; if (x < 0) return e; } }
    return entries[entries.length - 1];
  }

  // Visszatér: [{ gold: szám } | { item: id, qty }] -- az arany egy tételbe összevonva elöl, az azonos tárgyak összevonva.
  // A táblában: always (mindig benne van), rolls ([min, max] húzás a súlyozott entries-ből, visszatevéssel).
  function roll(tableId, random) {
    const t = Game.data.lootTables[tableId];
    if (!t) { console.warn('Ismeretlen loot tábla:', tableId); return []; }
    const rnd = random || Math.random;
    const picked = (t.always || []).slice();
    const entries = (t.entries || []).filter(e => e.weight > 0);
    const n = entries.length ? range(t.rolls === undefined ? 1 : t.rolls, rnd) : 0;
    for (let i = 0; i < n; i++) picked.push(weighted(entries, rnd));
    let gold = 0;
    const items = [];
    picked.forEach(e => {
      if (e.gold !== undefined) { gold += range(e.gold, rnd); return; }
      const qty = range(e.qty === undefined ? 1 : e.qty, rnd);
      const same = items.find(x => x.item === e.item);
      if (same) same.qty += qty; else items.push({ item: e.item, qty });
    });
    return (gold > 0 ? [{ gold }] : []).concat(items);
  }

  Game.loot = { roll, range };
})();
