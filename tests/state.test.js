// A központi állapot: módosítás csak metódusokon át, és minden változás eseményt küld.
const test = require('node:test');
const assert = require('node:assert/strict');
const { createGame, plain } = require('./helpers/env');

const SWORD = { id: 'sword_bronze_01' };
const SHIELD = { id: 'shield_wood_01' };

function setup() {
  const env = createGame({ items: [SWORD, SHIELD] });
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
