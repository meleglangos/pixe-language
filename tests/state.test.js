// A központi állapot: módosítás csak metódusokon át, és minden változás eseményt küld.
const test = require('node:test');
const assert = require('node:assert/strict');
const { createGame, plain } = require('./helpers/env');

const SWORD = { id: 'sword_bronze_01' };
const SHIELD = { id: 'shield_wood_01' };

// egy teszt-kérdés (a valódi poolok tartalmától függetlenül)
const Q = { id: 'q_test_01', type: 'input', level: 'B1', tags: ['test'], prompt: 'game.title', answers: ['game.title'] };
function setup() {
  const env = createGame({ items: [SWORD, SHIELD], content: raw => { raw.questionPools = raw.questionPools.concat({ id: 'test' }); raw.questions = { ...raw.questions, test: [Q] }; } });
  env.Game.saveManager.load();
  env.events = [];
  env.Game.events.on('state:changed', e => env.events.push(e.key));
  return env;
}

test('HP: eseményt küld, és a határok között marad', () => {
  const { Game } = setup();
  const seen = [];
  Game.events.on('state:hp', e => seen.push(plain(e)));
  Game.state.damage(5);
  Game.state.damage(500);
  Game.state.heal(3);
  Game.state.heal(999);
  Game.state.heal(1); // nincs változás -> nincs esemény
  assert.deepEqual(seen, [{ hp: 15, maxHp: 20 }, { hp: 0, maxHp: 20 }, { hp: 3, maxHp: 20 }, { hp: 20, maxHp: 20 }]);
});

test('arany: hozzáadás, költés csak fedezet esetén', () => {
  const { Game, events } = setup();
  Game.state.addGold(10);
  assert.equal(Game.state.spendGold(25), false);
  assert.equal(Game.state.spendGold(4), true);
  assert.equal(Game.state.spendGold(-1), false);
  assert.equal(Game.state.gold, 6);
  assert.deepEqual(events, ['gold', 'gold']);
});

test('inventory: halmozás, elvétel, ismeretlen tárgy elutasítva', () => {
  const { Game, warnings } = setup();
  assert.equal(Game.state.addItem('sword_bronze_01'), true);
  assert.equal(Game.state.addItem('sword_bronze_01', 2), true);
  assert.equal(Game.state.addItem('does_not_exist'), false);
  assert.ok(warnings.some(w => w.includes('does_not_exist')));
  assert.equal(Game.state.itemCount('sword_bronze_01'), 3);
  assert.equal(Game.state.removeItem('sword_bronze_01', 5), false);
  assert.equal(Game.state.removeItem('sword_bronze_01', 3), true);
  assert.equal(Game.state.hasItem('sword_bronze_01'), false);
  assert.deepEqual(plain(Game.state.inventory), []);
});

test('az inventory getter másolatot ad: kívülről nem írható át', () => {
  const { Game } = setup();
  Game.state.addItem('sword_bronze_01');
  Game.state.inventory[0].qty = 99;
  Game.state.inventory.push({ id: 'x', qty: 1 });
  assert.deepEqual(plain(Game.state.inventory), [{ id: 'sword_bronze_01', qty: 1 }]);
});

test('felszerelés: csak ismert helyre és ismert tárgyat', () => {
  const { Game } = setup();
  const seen = [];
  Game.events.on('state:gear', e => seen.push(plain(e)));
  assert.equal(Game.state.equip('weapon', 'sword_bronze_01'), true);
  assert.equal(Game.state.equip('armor', 'nope'), false);
  assert.equal(Game.state.equip('hat', 'shield_wood_01'), false);
  assert.equal(Game.state.unequip('weapon'), true);
  assert.deepEqual(seen, [{ slot: 'weapon', item: 'sword_bronze_01' }, { slot: 'weapon', item: null }]);
});

test('dungeonök: látogatás és teljesítés', () => {
  const { Game } = setup();
  Game.state.recordDungeonVisit('dungeon_mine');
  Game.state.recordDungeonVisit('dungeon_mine');
  assert.equal(Game.state.isDungeonCompleted('dungeon_mine'), false);
  Game.state.completeDungeon('dungeon_mine');
  assert.deepEqual(plain(Game.state.dungeonRecord('dungeon_mine')), { visits: 2, clears: 1 });
  assert.deepEqual(plain(Game.state.completedDungeons()), ['dungeon_mine']);
  assert.deepEqual(plain(Game.state.dungeonRecord('dungeon_cave')), { visits: 0, clears: 0 });
});

test('kérdések: a haladás feljegyzése, sorozat nullázása rossz válasznál', () => {
  const { Game, events } = setup();
  const seen = [];
  Game.events.on('state:questions', e => seen.push(plain(e)));
  Game.state.recordAnswer('q_test_01', true);
  Game.state.recordAnswer('q_test_01', true);
  Game.state.recordAnswer('q_test_01', false);
  Game.state.recordAnswer('q_test_01', true);
  assert.deepEqual(plain(Game.state.questionRecord('q_test_01')), { right: 3, wrong: 1, streak: 1 });
  assert.deepEqual(seen[2], { id: 'q_test_01', record: { right: 2, wrong: 1, streak: 0 }, correct: false });
  assert.equal(Game.state.recordAnswer('q_nincs', true), false);
  assert.deepEqual(plain(Game.state.questionRecord('q_nincs')), { right: 0, wrong: 0, streak: 0 });
  assert.deepEqual(events, ['questions', 'questions', 'questions', 'questions']);
});

test('feloldások: egyszer, eseménnyel', () => {
  const { Game, events } = setup();
  assert.equal(Game.state.unlock('ch_a'), true);
  assert.equal(Game.state.unlock('ch_a'), false);
  assert.equal(Game.state.unlock(''), false);
  assert.equal(Game.state.isUnlocked('ch_a'), true);
  assert.equal(Game.state.isUnlocked('ch_b'), false);
  assert.deepEqual(events, ['unlocks']);
});

test('napi állapot: napon belül számol, új napon nulláról indul', () => {
  const { Game } = setup();
  const day1 = new Date(2026, 10, 17, 9), day1late = new Date(2026, 10, 17, 23, 59), day2 = new Date(2026, 10, 18, 0, 1);
  assert.equal(Game.state.today(day1), '2026-11-17');
  assert.equal(Game.state.dailyCount('ch_d', day1), 0);
  assert.equal(Game.state.markDaily('ch_d', day1), 1);
  assert.equal(Game.state.markDaily('ch_d', day1late), 2);
  assert.equal(Game.state.dailyCount('ch_d', day1late), 2);
  assert.equal(Game.state.dailyCount('ch_d', day2), 0);
  assert.equal(Game.state.markDaily('ch_e', day2), 1);
  assert.deepEqual(plain(Game.state.data.daily), { date: '2026-11-18', done: { ch_e: 1 } });
});

test('replace (betöltés / import): minden kijelző-eseményt kiküld', () => {
  const { Game } = setup();
  const seen = [];
  ['state:hp', 'state:gold', 'state:replaced'].forEach(ev => Game.events.on(ev, () => seen.push(ev)));
  Game.state.replace(Game.saveSchema.defaults());
  assert.deepEqual(seen.sort(), ['state:gold', 'state:hp', 'state:replaced']);
});

test('egy hibás eseménykezelő nem állítja meg a többit', () => {
  const { Game, warnings } = setup();
  let ok = false;
  Game.events.on('state:gold', () => { throw new Error('bumm'); });
  Game.events.on('state:gold', () => { ok = true; });
  Game.state.addGold(1);
  assert.equal(ok, true);
  assert.ok(warnings.some(w => w.includes('state:gold')));
});

test('leiratkozás', () => {
  const { Game } = setup();
  let n = 0;
  const off = Game.events.on('state:gold', () => n++);
  Game.state.addGold(1);
  off();
  Game.state.addGold(1);
  assert.equal(n, 1);
});
