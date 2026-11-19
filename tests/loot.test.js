// Loot: sorsolás a loot táblákból (src/systems/loot/LootRoller.js), tárgy-ikonok, a tárgyak és táblák ellenőrzése.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { createGame, readData, plain, ROOT } = require('./helpers/env');

const seq = (...xs) => { let i = 0; return () => xs[i++ % xs.length]; };

// egy legendary teszt-tárgy (a valódi tárgyak között még nincs ilyen)
const LEG = { id: 'leg_test', kind: 'treasure', type: 'treasure', rarity: 'legendary', icon: 'it:1', name: 'loot.gold' };
function withTable(table) {
  return createGame({ content: raw => { raw.lootTables = raw.lootTables.concat(table); raw.items = raw.items.concat(LEG); } });
}

test('range: [min, max] a határokkal együtt, szám = önmaga', () => {
  const { Game } = createGame();
  assert.equal(Game.loot.range([5, 15], () => 0), 5);
  assert.equal(Game.loot.range([5, 15], () => 0.9999), 15);
  assert.equal(Game.loot.range(3, () => 0.5), 3);
});

test('roll: "always" mindig benne van, a húzások súlyozottak, az azonosak összevonva, az arany elöl', () => {
  const { Game } = withTable({ id: 'loot_t', always: [{ gold: [10, 10] }], rolls: [3, 3], entries: [
    { item: 'bone', qty: [2, 2], weight: 1 }, { item: 'skull', weight: 3 }, { gold: 5, weight: 1 },
  ] });
  // húzások: 0.1 -> bone (0..1/5), 0.5 -> skull, 0.1 -> bone; a qty / arany tartományok fixek
  const r = plain(Game.loot.roll('loot_t', { random: seq(0.5, 0.1, 0.5, 0.1) }));
  assert.deepEqual(r, [{ gold: 10 }, { item: 'bone', qty: 4 }, { item: 'skull', qty: 1 }]);
  // a húzott arany hozzáadódik az "always" aranyhoz: húzások 0.99 -> arany, 0 -> bone, 0.99 -> arany
  const g = plain(Game.loot.roll('loot_t', { random: seq(0, 0.99) }));
  assert.deepEqual(g, [{ gold: 10 + 5 + 5 }, { item: 'bone', qty: 2 }]);
});

test('a valódi ládák: csillagonként a megadott számú húzás, csak létező tárgyak, az arany nem kötelező', () => {
  const { Game } = createGame();
  const rolls = Game.data.config.loot.stars.rolls;
  let noGold = 0;
  for (const id of ['loot_crypt_chest', 'loot_mine_chest']) {
    for (let stars = 1; stars <= 5; stars++) {
      for (let i = 0; i < 200; i++) {
        const r = Game.loot.roll(id, { stars });
        const items = r.filter(e => e.item);
        items.forEach(e => assert.ok(Game.data.items[e.item], e.item));
        const n = items.reduce((a, e) => a + 1, 0) + (r[0] && r[0].gold ? 1 : 0);
        assert.ok(n >= 1 && n <= rolls[stars - 1][1], id + ' ' + stars + '★: ' + n);
        if (!r.some(e => e.gold)) noGold++;
      }
    }
  }
  assert.ok(noGold > 0, 'van arany nélküli láda is');
  assert.deepEqual(plain(Game.loot.roll('nincs_ilyen')), []);
});

test('csillagok: az esélyek a config szerint; több csillag = ritkább tárgyak nagyobb eséllyel, de 1★-ból is jöhet', () => {
  const { Game } = withTable({ id: 'loot_s', entries: [
    { item: 'bone', weight: 1 }, { item: 'gem_red', weight: 1 }, { item: 'leg_test', weight: 1 }, { gold: [10, 10], weight: 1 },
  ] });
  // a csillagszám eloszlása: 1★ 30, 2★ 30, 3★ 20, 4★ 13, 5★ 7
  assert.equal(Game.loot.rollStars('loot_s', () => 0), 1);
  assert.equal(Game.loot.rollStars('loot_s', () => 0.95), 5);
  const counts = [0, 0, 0, 0, 0, 0];
  for (let i = 0; i < 1000; i++) counts[Game.loot.rollStars('loot_s', () => i / 1000)]++;
  assert.deepEqual(counts.slice(1), [300, 300, 200, 130, 70]);
  const p = (stars, id) => Game.loot.chances('loot_s', stars).find(c => c.item === id).p;
  assert.ok(p(1, 'leg_test') > 0, 'legendary 1★-ból is jöhet');
  assert.ok(p(1, 'leg_test') < 0.005, '... de ritkán');
  assert.ok(p(5, 'leg_test') > 10 * p(1, 'leg_test'));
  assert.ok(p(5, 'gem_red') > p(1, 'gem_red'));
  assert.ok(p(5, 'bone') < p(1, 'bone'));
  const total = Game.loot.chances('loot_s', 3).reduce((a, c) => a + c.p, 0);
  assert.ok(Math.abs(total - 1) < 1e-9);
  // az arany szorzója: 5★ = ×3
  const r = plain(Game.loot.roll('loot_s', { stars: 5, random: () => 0.9999 }));
  // random 0.9999: 5 húzás (4–5 közül a felső), mindig az utolsó tétel (arany): 5 × 10 × 3
  assert.deepEqual(r, [{ gold: 150 }]);
});

test('ikonok: az items.json minden ikonja és az arany ikonja létező fájlra mutat', () => {
  const { Game } = createGame();
  const icons = Object.values(Game.data.items).map(it => it.icon).concat(Game.data.config.loot.goldIcon, Game.data.config.loot.coinIcon);
  for (const icon of icons) {
    const p = Game.itemIcons.parse(icon);
    assert.ok(p, icon);
    assert.ok(fs.existsSync(path.join(ROOT, p.url)), icon + ' -> ' + p.url);
  }
  assert.deepEqual(plain(Game.itemIcons.parse('wp:bronze c3 r5')), { url: 'assets/weapons/16x16 Weapons RPG Icons/bronze-weapons.png', key: 'icon_wp_bronze', sheet: true, frame: 123, x: 48, y: 80 });
  for (const bad of ['', 'it:', 'it:x', 'wp:wood c1 r1', 'wp:gold c24 r0', 'xx:1']) assert.equal(Game.itemIcons.parse(bad), null, bad);
  assert.equal(Game.itemIcons.files(['it:1', 'it:1', 'wp:gold c0 r0', 'wp:gold c1 r1']).length, 2);
});

test('a validátor kiszúrja a hibás tárgyakat és loot táblákat', () => {
  const { Game } = createGame();
  const raw = readData();
  raw.items = raw.items.concat(
    { id: 'item_bad', name: 'nincs.kulcs', desc: 'nincs.leiras', rarity: 'mythic', kind: 'food', icon: 'it:abc' },
    { id: 'item_bad2', name: 'loot.gold', rarity: 'rare', kind: 'weapon', type: 'ring', icon: 'it:1', value: -5, stack: 'igen', exclusive: 1, stats: { power: 3, maxHp: -2 } },
    { id: 'item_bad3', name: 'loot.gold', rarity: 'rare', kind: 'gem', type: 'gem', icon: 'it:1', stats: [1] },
  );
  raw.lootTables = raw.lootTables.concat(
    { id: 'loot_bad', rolls: [3, 1], always: [{ gold: 'sok' }], entries: [{ item: 'ghost', weight: 1 }, { item: 'bone', gold: 3, weight: 1 }, { item: 'bone', weight: 0 }, { item: 'bone', qty: 0, weight: 1 }] },
    { id: 'loot_empty' },
    { id: 'loot_stars', entries: [{ item: 'bone', weight: 1 }], stars: { weights: [1, 2], gold: 'x', rarityFactor: { rare: [1, 1, 1, 1, -1] } } },
  );
  const issues = Game.contentValidator.validate(raw).join('\n');
  for (const re of [
    /items\.item_bad\.name: ismeretlen szöveg-kulcs/, /items\.item_bad\.desc/, /item_bad: ismeretlen rarity: mythic/, /item_bad\.kind/, /item_bad\.icon: hibás ikon/,
    /item_bad2\.type: a\(z\) weapon típusai/, /item_bad2\.value/, /item_bad2\.stack/, /item_bad2\.exclusive/,
    /item_bad2\.stats\.power: ismeretlen passzív/, /item_bad2\.stats\.maxHp: pozitív szám/, /item_bad3\.stats: objektum/,
    /loot_bad\.rolls/, /loot_bad\.always\[0\]\.gold/, /loot_bad\.entries\[0\]: ismeretlen items id: ghost/,
    /loot_bad\.entries\[1\]: vagy "item", vagy "gold"/, /loot_bad\.entries\[2\]\.weight/, /loot_bad\.entries\[3\]\.qty/, /loot_empty: üres tábla/,
    /loot_stars\.stars\.weights/, /loot_stars\.stars\.gold/, /loot_stars\.stars\.rarityFactor\.rare/,
  ]) assert.match(issues, re);
});

test('a dungeonök ládái létező loot táblára mutatnak', () => {
  const { Game } = createGame();
  for (const d of Object.values(Game.data.dungeons)) if (d.chest) assert.ok(Game.data.lootTables[d.lootTable], d.id);
});

test('láda-stílusok: a valódiak hibátlanok; a validátor kiszúrja az ismeretlen kivágást / csíkot', () => {
  const { Game } = createGame();
  assert.ok(Game.data.chestStyles[Game.data.config.loot.chestStyle], 'az alap láda-stílus létezik');
  const raw = readData();
  raw.chestStyles = raw.chestStyles.concat(
    { id: 'cs_frames', closed: 'nincs_ilyen', open: 'chest_open' },
    { id: 'cs_strip', strip: 'nincs_csik', openFrames: [] },
  );
  raw.dungeons = raw.dungeons.map((d, i) => (i ? d : { ...d, chestStyle: 'cs_nincs' }));
  const issues = Game.contentValidator.validate(raw).join('\n');
  assert.match(issues, /chestStyles\.cs_frames\.closed: ismeretlen kivágás/);
  assert.match(issues, /chestStyles\.cs_strip\.strip: ismeretlen csík/);
  assert.match(issues, /chestStyles\.cs_strip\.openFrames/);
  assert.match(issues, /chestStyle: ismeretlen chestStyles id: cs_nincs/);
  assert.doesNotMatch(issues, /pc_wood/);
});

test('ritkaságok és tárgy-kategóriák: 7 fokozat alapárral és show-erővel; minden tárgy kategóriája és típusa a listából', () => {
  const { Game } = createGame();
  const r = Game.data.config.rarities;
  assert.deepEqual(plain(r.map(x => x.id)), ['common', 'uncommon', 'rare', 'super_rare', 'epic', 'legendary', 'unreal']);
  for (let i = 1; i < r.length; i++) assert.ok(r[i].value > r[i - 1].value && r[i].show >= r[i - 1].show, r[i].id);
  const f = Game.data.config.loot.stars.rarityFactor;
  for (const x of r) assert.equal(f[x.id].length, 5, 'rarityFactor.' + x.id);
  const kinds = Game.data.config.items.kinds;
  for (const it of Object.values(Game.data.items)) {
    assert.ok(kinds[it.kind], it.id + '.kind');
    assert.ok(kinds[it.kind].types.includes(it.type), it.id + '.type');
  }
  assert.equal(Game.loot.group({ item: 'sword_gold_01' }), 'legendary');
  assert.equal(Game.loot.group({ gold: 5 }), 'gold');
});
