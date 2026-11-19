// Loot sorsolás (Game.loot): egy loot tábla (data/loot_tables.json) alapján véletlen zsákmány.
// DOM és Phaser nélkül, tesztelhető. Leírás: README.md (ebben a mappában).
//
// Csomag tétel: {"pick": {kind, type, rarity}, weight} -- a szűrőhöz illő tárgyak közül húz (Game.items.match).
// Helyek a táblán: "places": ["crypt"] -- a hely-jelölt tárgyak közül ezekéi jöhetnek (az általánosak mindig).
// Ritkaság-szorzó a táblán: "rarityBoost": {"rare": 1.5, …} (nehezebb hely: nagyobb esély a ritkább tárgyra).
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

  // A tábla húzható tételei: a "pick" (csomag) tételek szétbontva a hozzájuk illő tárgyakra (a súly egyenlően
  // oszlik meg köztük; a qty a csomagé). Így a csillag- és ritkaság-szorzó tárgyanként érvényes.
  function expand(t) {
    const out = [];
    (t.entries || []).filter(e => e.weight > 0).forEach(e => {
      if (!e.pick) { out.push(e); return; }
      const items = Game.items.match(e.pick, t.places);
      items.forEach(it => out.push({ item: it.id, qty: e.qty, weight: e.weight / items.length }));
    });
    return out;
  }

  // egy húzás súlyai: súly × a tábla ritkaság-szorzója (rarityBoost: a nehezebb hely nagyobb esélyt ad a ritkább
  // tárgyra) × csillaggal a csillag ritkaság-szorzója
  function drawWeights(t, stars) {
    const entries = expand(t), boost = t.rarityBoost || {};
    const f = stars ? starsCfg(t).rarityFactor : null;
    return {
      entries,
      weights: entries.map(e => {
        const g = group(e);
        let w = e.weight * (boost[g] !== undefined ? boost[g] : 1);
        if (f && f[g] && f[g][stars - 1] !== undefined) w *= f[g][stars - 1];
        return w;
      }),
    };
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
    // ugyanaz a tárgy több tételből is jöhet (név szerint és csomagból): összevonva
    const out = [];
    entries.forEach((e, i) => {
      const p = weights[i] / total, same = e.item !== undefined && out.find(x => x.item === e.item);
      if (same) same.p += p; else out.push(Object.assign(e.gold !== undefined ? { gold: e.gold } : { item: e.item }, { p }));
    });
    return out.sort((a, b) => b.p - a.p);
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
    // az "always" csomag-tételeiből egy véletlen illő tárgy
    picked.forEach((e, i) => { if (e.pick) { const m = Game.items.match(e.pick, t.places); picked[i] = m.length ? { item: m[Math.floor(rnd() * m.length)].id, qty: e.qty } : { gold: 0 }; } });
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
