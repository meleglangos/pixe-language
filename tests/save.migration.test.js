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

test('v1 mentés: v1 -> v2 -> v3 -> v4 lánc', () => {
  const { Game } = createGame({ storage: { 'deutsch-abenteuer.save': fixture('save_v1.json') } });
  assert.equal(Game.saveManager.load(), 'main');
  const d = plain(Game.state.data);
  assert.equal(d.v, Game.saveSchema.VERSION);
  assert.deepEqual(d.dungeons, { dungeon_crypt: { visits: 2, clears: 0 }, dungeon_cave: { visits: 0, clears: 0 } });
  assert.deepEqual(d.player, { x: 7, y: 16, dir: 'up', hp: 20, maxHp: 20 });
  assert.equal(d.gold, 5);
  assert.deepEqual(d.surprises, []);
  assert.deepEqual([d.questions, d.unlocks], [{}, []]);
});

test('v3 mentés: betöltődik, üres kérdés-haladással, feloldással és napi állapottal (v3 -> v4)', () => {
  const { Game, storage, KEY } = createGame({ storage: { 'deutsch-abenteuer.save': fixture('save_v3.json') } });
  assert.equal(Game.saveManager.load(), 'main');
  const d = plain(Game.state.data);
  assert.equal(d.v, Game.saveSchema.VERSION);
  assert.deepEqual([d.questions, d.unlocks, d.daily], [{}, [], { date: '', done: {} }]);
  assert.deepEqual(d.player, { x: 20, y: 16, dir: 'down', hp: 11, maxHp: 20 });
  assert.equal(d.gold, 17);
  assert.deepEqual(d.dungeons, { dungeon_crypt: { visits: 1, clears: 0 } });
  assert.equal(Game.state.flag('introSeen'), true);
  assert.deepEqual(plain(Game.saveManager.lastIssues), []);
  Game.saveManager.save();
  assert.equal(JSON.parse(storage.getItem(KEY)).v, Game.saveSchema.VERSION);
  assert.equal(storage.getItem(KEY + '.backup'), fixture('save_v3.json'));
});

test('v4: a kérdés-haladás, a feloldások és a napi állapot ellenőrzése', () => {
  const { Game } = createGame();
  const d = Game.saveSchema.defaults();
  d.questions = { q_torolt: { right: 1 } };
  d.unlocks = ['ch_a', 'ch_a', 5, '', 'ch_b'];
  d.daily = { date: '2026-11-17', done: { ch_a: '2', ch_b: -1, ch_c: 0 } };
  const out = Game.saveSchema.parse(d, Game.saveManager.known());
  assert.deepEqual(plain(out.state.questions), {});
  assert.deepEqual(plain(out.issues), ['ismeretlen kérdés: q_torolt']);
  assert.deepEqual(plain(out.state.unlocks), ['ch_a', 'ch_b']);
  assert.deepEqual(plain(out.state.daily), { date: '2026-11-17', done: { ch_a: 2 } });
  const bad = Game.saveSchema.parse({ ...Game.saveSchema.defaults(), questions: 'x', daily: { date: 'tegnap', done: [] } }, null).state;
  assert.deepEqual(plain([bad.questions, bad.daily]), [{}, { date: '', done: {} }]);
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
