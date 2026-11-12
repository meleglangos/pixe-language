// SaveManager: mentés, betöltés, tartalék, sérült mentés, ismeretlen ID-k, automatikus mentés.
const test = require('node:test');
const assert = require('node:assert/strict');
const { createGame, tick, plain } = require('./helpers/env');

const SWORD = { id: 'sword_bronze_01', name: 'game.title', rarity: 'common1' };

test('új játék, ha nincs mentés', () => {
  const { Game } = createGame();
  assert.equal(Game.saveManager.load(), 'new');
  assert.equal(Game.state.hp, Game.data.config.player.maxHp);
  assert.equal(Game.state.gold, 0);
  assert.deepEqual(plain(Game.state.position()), { x: Game.data.map.spawn.x, y: Game.data.map.spawn.y, dir: 'down' });
});

test('mentés és visszatöltés: minden mező megmarad', () => {
  const a = createGame({ items: [SWORD] });
  a.Game.saveManager.load();
  const s = a.Game.state;
  s.setPosition(12, 9, 'left');
  s.addGold(37);
  s.setHp(11);
  s.addItem('sword_bronze_01', 2);
  s.equip('weapon', 'sword_bronze_01');
  s.recordDungeonVisit('dungeon_crypt');
  s.completeDungeon('dungeon_crypt');
  s.addSurprise('surprise_cat');
  s.setFlag('introSeen', true);
  assert.ok(a.Game.saveManager.save());

  const b = createGame({ items: [SWORD], storage: a.storage.dump() });
  assert.equal(b.Game.saveManager.load(), 'main');
  assert.deepEqual(plain(b.Game.state.data), plain(a.Game.state.data));
  assert.equal(b.Game.state.isDungeonCompleted('dungeon_crypt'), true);
  assert.deepEqual(plain(b.Game.state.completedDungeons()), ['dungeon_crypt']);
});

test('a mentés verziószámot tartalmaz', () => {
  const { Game, storage, KEY } = createGame();
  Game.saveManager.load();
  Game.saveManager.save();
  assert.equal(JSON.parse(storage.getItem(KEY)).v, Game.saveSchema.VERSION);
});

test('tartalék: mentéskor az előző ép mentés a .backup kulcsra kerül', () => {
  const { Game, storage, KEY } = createGame();
  Game.saveManager.load();
  Game.state.addGold(5);
  Game.saveManager.save();
  const first = storage.getItem(KEY);
  Game.state.addGold(5);
  Game.saveManager.save();
  assert.equal(storage.getItem(KEY + '.backup'), first);
  assert.equal(JSON.parse(storage.getItem(KEY)).gold, 10);
});

test('sérült fő mentés: a tartalékból tölt be, a sérültet félreteszi', () => {
  const a = createGame();
  a.Game.saveManager.load();
  a.Game.state.addGold(7);
  a.Game.saveManager.save();
  a.Game.state.addGold(1);
  a.Game.saveManager.save(); // backup: gold 7, main: gold 8
  const stored = a.storage.dump();
  stored[a.KEY] = stored[a.KEY].slice(0, 25); // félbeszakadt írás

  const b = createGame({ storage: stored });
  assert.equal(b.Game.saveManager.load(), 'backup');
  assert.equal(b.Game.state.gold, 7);
  assert.equal(b.storage.getItem(b.KEY + '.broken'), stored[a.KEY]);

  // a következő mentés nem írja felül a jó tartalékot a sérült fő mentéssel
  b.Game.saveManager.save();
  assert.equal(JSON.parse(b.storage.getItem(b.KEY + '.backup')).gold, 7);
  assert.equal(JSON.parse(b.storage.getItem(b.KEY)).gold, 7);
});

test('ha a fő mentés és a tartalék is sérült: új játék, nem fagy le', () => {
  const { Game, storage, KEY } = createGame({ storage: { 'deutsch-abenteuer.save': '{"v":3,', 'deutsch-abenteuer.save.backup': 'null' } });
  assert.equal(Game.saveManager.load(), 'new');
  assert.equal(Game.state.gold, 0);
  assert.equal(storage.getItem(KEY + '.broken'), '{"v":3,');
});

test('újabb verziójú mentést nem ír felül nyom nélkül', () => {
  const future = JSON.stringify({ v: 999, gold: 5 });
  const { Game, storage, KEY } = createGame({ storage: { 'deutsch-abenteuer.save': future } });
  assert.equal(Game.saveManager.load(), 'new');
  assert.equal(storage.getItem(KEY + '.broken'), future);
});

test('ismeretlen ID-k: eldobja őket, a többi adat megmarad', () => {
  const save = {
    v: 3, player: { x: 5, y: 6, dir: 'up', hp: 9, maxHp: 20 }, gold: 3,
    inventory: [{ id: 'sword_bronze_01', qty: 1 }, { id: 'removed_item', qty: 4 }, 'sword_bronze_01', 42, null],
    gear: { weapon: 'removed_item', armor: 'sword_bronze_01', ring: 'sword_bronze_01' },
    dungeons: { dungeon_crypt: { visits: 2, clears: 1 }, dungeon_atlantis: { visits: 1, clears: 1 } },
    surprises: ['s1', 's1', 7], flags: { introSeen: true },
  };
  const { Game } = createGame({ items: [SWORD], storage: { 'deutsch-abenteuer.save': JSON.stringify(save) } });
  assert.equal(Game.saveManager.load(), 'main');
  const d = plain(Game.state.data);
  assert.deepEqual(d.inventory, [{ id: 'sword_bronze_01', qty: 2 }]);
  assert.deepEqual(d.gear, { weapon: null, armor: 'sword_bronze_01' });
  assert.deepEqual(d.dungeons, { dungeon_crypt: { visits: 2, clears: 1 } });
  assert.deepEqual(d.surprises, ['s1']);
  assert.equal(d.gold, 3);
  assert.equal(d.player.hp, 9);
  assert.ok(Game.saveManager.lastIssues.length >= 4, 'a javításokat feljegyzi');
});

test('rossz típusú mezők: alapértékekkel pótolja', () => {
  const save = { v: 3, player: { x: 'a', y: null, dir: 'diagonal', hp: 999, maxHp: 'x' }, gold: -50, inventory: 'nope', gear: [], dungeons: [1, 2], surprises: {}, flags: { introSeen: 'yes' } };
  const { Game } = createGame({ storage: { 'deutsch-abenteuer.save': JSON.stringify(save) } });
  assert.equal(Game.saveManager.load(), 'main');
  const d = plain(Game.state.data);
  const max = Game.data.config.player.maxHp;
  assert.deepEqual(d.player, { x: Game.data.map.spawn.x, y: Game.data.map.spawn.y, dir: 'down', hp: max, maxHp: max });
  assert.equal(d.gold, 0);
  assert.deepEqual(d.inventory, []);
  assert.deepEqual(d.gear, { weapon: null, armor: null });
  assert.deepEqual(d.dungeons, {});
  assert.deepEqual(d.surprises, []);
  assert.deepEqual(d.flags, { introSeen: false });
});

test('ha a tárhely nem írható: storageOk = false, nem dob kivételt', () => {
  const { Game, storage } = createGame();
  Game.saveManager.load();
  storage.failWrites = true;
  assert.equal(Game.saveManager.save(), false);
  assert.equal(Game.saveManager.storageOk, false);
  storage.failWrites = false;
  assert.equal(Game.saveManager.save(), true);
});

test('automatikus mentés fontos eseményeknél, egy lépésen belül egyetlen írással', async () => {
  const { Game, storage, KEY } = createGame({ items: [SWORD] });
  Game.saveManager.load();
  const before = storage.writes;
  Game.state.addItem('sword_bronze_01'); // loot
  Game.state.addGold(15);
  await tick();
  assert.equal(storage.writes - before, 1, 'egy írás (fő mentés; tartalék még nincs)');
  assert.equal(JSON.parse(storage.getItem(KEY)).gold, 15);

  Game.state.completeDungeon('dungeon_crypt'); // dungeon teljesítése
  await tick();
  assert.equal(JSON.parse(storage.getItem(KEY)).dungeons.dungeon_crypt.clears, 1);

  assert.equal(Game.state.spendGold(10), true); // vásárlás
  await tick();
  assert.equal(JSON.parse(storage.getItem(KEY)).gold, 5);
});

test('a pozíció változása önmagában nem ment (azt a WorldScene ütemezi)', async () => {
  const { Game, storage } = createGame();
  Game.saveManager.load();
  const before = storage.writes;
  Game.state.setPosition(3, 4, 'up');
  await tick();
  assert.equal(storage.writes, before);
});

test('új játék: alapállapot, a megadott jelzőkkel, és a régi állás a tartalékba kerül', () => {
  const { Game, storage, KEY } = createGame();
  Game.saveManager.load();
  Game.state.addGold(99);
  Game.saveManager.save();
  Game.saveManager.newGame({ introSeen: true });
  assert.equal(Game.state.gold, 0);
  assert.equal(Game.state.flag('introSeen'), true);
  assert.equal(JSON.parse(storage.getItem(KEY)).gold, 0);
  assert.equal(JSON.parse(storage.getItem(KEY + '.backup')).gold, 99);
});
