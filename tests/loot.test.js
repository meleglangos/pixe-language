// Loot: sorsolás a loot táblákból (src/systems/loot/LootRoller.js), tárgy-ikonok, a tárgyak és táblák ellenőrzése.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { createGame, readData, plain, ROOT } = require('./helpers/env');

const seq = (...xs) => { let i = 0; return () => xs[i++ % xs.length]; };

function withTable(table) {
  return createGame({ content: raw => { raw.lootTables = raw.lootTables.concat(table); } });
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
  const r = plain(Game.loot.roll('loot_t', seq(0.5, 0.1, 0.5, 0.1)));
  assert.deepEqual(r, [{ gold: 10 }, { item: 'bone', qty: 4 }, { item: 'skull', qty: 1 }]);
  // a húzott arany hozzáadódik az "always" aranyhoz: húzások 0.99 -> arany, 0 -> bone, 0.99 -> arany
  const g = plain(Game.loot.roll('loot_t', seq(0, 0.99)));
  assert.deepEqual(g, [{ gold: 10 + 5 + 5 }, { item: 'bone', qty: 2 }]);
});

test('a valódi ládák: mindig van arany, összesen 2–4 tétel, csak létező tárgyak', () => {
  const { Game } = createGame();
  for (const id of ['loot_crypt_chest', 'loot_mine_chest']) {
    for (let i = 0; i < 300; i++) {
      const r = Game.loot.roll(id);
      assert.ok(r[0].gold > 0, id + ': nincs arany');
      const picks = r.slice(1);
      picks.forEach(e => assert.ok(Game.data.items[e.item], e.item));
      assert.ok(r.length >= 1 && r.length <= 4, id + ': ' + r.length);
    }
  }
  assert.deepEqual(plain(Game.loot.roll('nincs_ilyen')), []);
});

test('ikonok: az items.json minden ikonja és az arany ikonja létező fájlra mutat', () => {
  const { Game } = createGame();
  const icons = Object.values(Game.data.items).map(it => it.icon).concat(Game.data.config.loot.goldIcon);
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
  raw.items = raw.items.concat({ id: 'item_bad', name: 'nincs.kulcs', rarity: 'mythic', kind: 'food', icon: 'it:abc' });
  raw.lootTables = raw.lootTables.concat(
    { id: 'loot_bad', rolls: [3, 1], always: [{ gold: 'sok' }], entries: [{ item: 'ghost', weight: 1 }, { item: 'bone', gold: 3, weight: 1 }, { item: 'bone', weight: 0 }, { item: 'bone', qty: 0, weight: 1 }] },
    { id: 'loot_empty' },
  );
  const issues = Game.contentValidator.validate(raw).join('\n');
  for (const re of [
    /items\.item_bad\.name: ismeretlen szöveg-kulcs/, /items\.item_bad\.desc/, /item_bad: ismeretlen rarity: mythic/, /item_bad\.kind/, /item_bad\.icon: hibás ikon/,
    /loot_bad\.rolls/, /loot_bad\.always\[0\]\.gold/, /loot_bad\.entries\[0\]: ismeretlen items id: ghost/,
    /loot_bad\.entries\[1\]: vagy "item", vagy "gold"/, /loot_bad\.entries\[2\]\.weight/, /loot_bad\.entries\[3\]\.qty/, /loot_empty: üres tábla/,
  ]) assert.match(issues, re);
});

test('a dungeonök ládái létező loot táblára mutatnak', () => {
  const { Game } = createGame();
  for (const d of Object.values(Game.data.dungeons)) if (d.chest) assert.ok(Game.data.lootTables[d.lootTable], d.id);
});
