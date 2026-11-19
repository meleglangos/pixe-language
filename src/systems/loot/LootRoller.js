// Loot sorsolás (Game.loot): egy loot tábla (data/loot_tables.json) alapján véletlen zsákmány.
// DOM és Phaser nélkül, tesztelhető. Leírás: README.md (ebben a mappában).
//
// Láda-csillagok (1–5, config.js -> loot.stars, a tábla "stars" mezője felülírhatja): a csillagszám dönti el,
// hány tételt húz (rolls), mennyi arany jön (gold szorzó), és a ritkaságok szorzóit (rarityFactor):
// egy tétel esélye = súly × szorzó. Bármi bármelyik ládából jöhet, csak az esélyek mások.
(function () {
  // [min, max] vagy szám -> egész a tartományban (a határokat is beleértve)
  function range(v, rnd) {
    if (Array.isArray(v)) { const lo = Math.min(v[0], v[1]), hi = Math.max(v[0], v[1]); return lo + Math.floor(rnd() * (hi - lo + 1)); }
    return Number.isInteger(v) ? v : 1;
  }

  function weightedIndex(weights, rnd) {
    const total = weights.reduce((a, w) => a + (w > 0 ? w : 0), 0);
    let x = rnd() * total;
    for (let i = 0; i < weights.length; i++) { if (weights[i] > 0) { x -= weights[i]; if (x < 0) return i; } }
    return weights.length - 1;
  }

  // a csillag-beállítás: config + a tábla felülírásai
  function starsCfg(t) {
    const base = Game.data.config.loot.stars;
    const own = (t && t.stars) || {};
    return Object.assign({}, base, own, { rarityFactor: Object.assign({}, base.rarityFactor, own.rarityFactor) });
  }

  // a tétel ritkasága (a rarityFactor kulcsa): a tárgy ritkasága; arany -> 'gold'
  function group(e) {
    if (e.gold !== undefined) return 'gold';
    const it = Game.data.items[e.item];
    return it ? it.rarity : 'common';
  }

  // egy húzás súlyai: csillag nélkül a tábla súlyai, csillaggal × a ritkaság szorzója
  function drawWeights(t, stars) {
    const entries = (t.entries || []).filter(e => e.weight > 0);
    if (!stars) return { entries, weights: entries.map(e => e.weight) };
    const f = starsCfg(t).rarityFactor;
    return { entries, weights: entries.map(e => e.weight * ((f[group(e)] || [])[stars - 1] !== undefined ? f[group(e)][stars - 1] : 1)) };
  }

  // Csillagszám sorsolása (1–5) a tábla / config súlyai szerint.
  function rollStars(tableId, random) {
    return weightedIndex(starsCfg(Game.data.lootTables[tableId]).weights, random || Math.random) + 1;
  }

  // Egy húzás esélyei: [{ item | gold, p }] (0..1), csökkenő sorrendben -- hangoláshoz.
  function chances(tableId, stars) {
    const t = Game.data.lootTables[tableId];
    if (!t) return [];
    const { entries, weights } = drawWeights(t, stars);
    const total = weights.reduce((a, b) => a + b, 0) || 1;
    return entries.map((e, i) => Object.assign(e.gold !== undefined ? { gold: e.gold } : { item: e.item }, { p: weights[i] / total }))
      .sort((a, b) => b.p - a.p);
  }

  // Visszatér: [{ gold: szám } | { item: id, qty }] -- az arany egy tételbe összevonva elöl, az azonos tárgyak összevonva.
  // opts: { stars: 1–5 (ha megvan: a csillag-szabályok), random }. Csillag nélkül: a tábla "rolls" mezője.
  // A tábla "always" tételei mindig benne vannak.
  function roll(tableId, opts) {
    opts = opts || {};
    const t = Game.data.lootTables[tableId];
    if (!t) { console.warn('Ismeretlen loot tábla:', tableId); return []; }
    const rnd = opts.random || Math.random;
    const stars = opts.stars ? Math.max(1, Math.min(5, Math.floor(opts.stars))) : 0;
    const sc = stars ? starsCfg(t) : null;
    const picked = (t.always || []).slice();
    const { entries, weights } = drawWeights(t, stars);
    const n = entries.length ? range(stars ? sc.rolls[stars - 1] : (t.rolls === undefined ? 1 : t.rolls), rnd) : 0;
    for (let i = 0; i < n; i++) picked.push(entries[weightedIndex(weights, rnd)]);
    let gold = 0;
    const items = [];
    picked.forEach(e => {
      if (e.gold !== undefined) { gold += Math.round(range(e.gold, rnd) * (stars ? sc.gold[stars - 1] : 1)); return; }
      const qty = range(e.qty === undefined ? 1 : e.qty, rnd);
      const same = items.find(x => x.item === e.item);
      if (same) same.qty += qty; else items.push({ item: e.item, qty });
    });
    return (gold > 0 ? [{ gold }] : []).concat(items);
  }

  Game.loot = { roll, rollStars, chances, range, group };
})();
