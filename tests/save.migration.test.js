// Migráció: a régi mentések mindig betöltődnek.
const test = require('node:test');
const assert = require('node:assert/strict');
const { createGame, fixture, plain } = require('./helpers/env');

test('v2 mentés (a régi kóddal készült): betöltődik, a dungeon ID-k átnevezve', () => {
  const { Game, storage, KEY } = createGame({ storage: { 'deutsch-abenteuer.save': fixture('save_v2.json') } });
  assert.equal(Game.saveManager.load(), 'main');
  const d = plain(Game.state.data);
  assert.equal(d.v, Game.saveSchema.VERSION);
  assert.deepEqual(d.player, { x: 31, y: 21, dir: 'left', hp: 13, maxHp: 20 });
  assert.equal(d.gold, 42);
  assert.deepEqual(d.dungeons, { dungeon_crypt: { visits: 3, clears: 1 }, dungeon_mine: { visits: 1, clears: 0 } });
  assert.equal(Game.state.flag('introSeen'), true);
  assert.deepEqual(plain(Game.saveManager.lastIssues), []);

  // az első mentés után új formátumban van, a régi pedig a tartalékban
  Game.saveManager.save();
  assert.equal(JSON.parse(storage.getItem(KEY)).v, Game.saveSchema.VERSION);
  assert.equal(storage.getItem(KEY + '.backup'), fixture('save_v2.json'));
});

test('v1 mentés: v1 -> v2 -> v3 lánc', () => {
  const { Game } = createGame({ storage: { 'deutsch-abenteuer.save': fixture('save_v1.json') } });
  assert.equal(Game.saveManager.load(), 'main');
  const d = plain(Game.state.data);
  assert.equal(d.v, Game.saveSchema.VERSION);
  assert.deepEqual(d.dungeons, { dungeon_crypt: { visits: 2, clears: 0 }, dungeon_cave: { visits: 0, clears: 0 } });
  assert.deepEqual(d.player, { x: 7, y: 16, dir: 'up', hp: 20, maxHp: 20 });
  assert.equal(d.gold, 5);
  assert.deepEqual(d.surprises, []);
});

test('v2 -> v3: ha a régi és az új ID is szerepel, összeadja őket', () => {
  const { Game } = createGame();
  const raw = { v: 2, dungeons: { dungeon3: { visits: 1, clears: 1 }, dungeon_crypt: { visits: 2, clears: 0 }, boss: { visits: 1, clears: 0 } } };
  const out = Game.saveSchema.migrate(raw);
  assert.deepEqual(plain(out.dungeons), { dungeon_crypt: { visits: 3, clears: 1 }, boss_tower: { visits: 1, clears: 0 } });
});

test('a v3-as átnevezés minden cél-ID-ja létező helyszín', () => {
  const { Game } = createGame();
  const known = Game.content.dungeonIds();
  Object.values(Game.saveSchema.DUNGEON_IDS_V3).forEach(id => assert.ok(known.includes(id), id));
});

test('minden régebbi verzióhoz van migrációs lépés', () => {
  const { Game } = createGame();
  for (let v = 1; v < Game.saveSchema.VERSION; v++) assert.equal(typeof Game.saveSchema.migrations[v], 'function', 'hiányzik: migrations[' + v + ']');
});

test('nem mentés vagy ismeretlen verzió: null (nem dob kivételt)', () => {
  const { Game } = createGame();
  for (const raw of [null, 5, 'x', [], {}, { v: 0 }, { v: 1.5 }, { v: '2' }, { v: Game.saveSchema.VERSION + 1 }]) {
    assert.equal(Game.saveSchema.migrate(raw), null, JSON.stringify(raw));
  }
});

test('a jelenlegi verzió változatlanul megy át', () => {
  const { Game } = createGame();
  const d = Game.saveSchema.defaults();
  d.gold = 12; d.dungeons.dungeon_mine = { visits: 4, clears: 2 };
  const before = JSON.stringify(d);
  const out = Game.saveSchema.parse(JSON.parse(before), null);
  assert.equal(JSON.stringify(out.state), before);
  assert.deepEqual(plain(out.issues), []);
});
