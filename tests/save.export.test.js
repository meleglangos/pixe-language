// Export / import szövegkód.
const test = require('node:test');
const assert = require('node:assert/strict');
const { createGame, fixture, plain } = require('./helpers/env');

test('export -> import: ugyanaz az állás', () => {
  const a = createGame();
  a.Game.saveManager.load();
  a.Game.state.addGold(21);
  a.Game.state.recordDungeonVisit('dungeon_mine');
  a.Game.state.setPosition(10, 11, 'right');
  const code = a.Game.saveManager.exportCode();
  assert.match(code, /^DA1\.[A-Za-z0-9_-]+\.[0-9a-z]+$/);

  const b = createGame();
  b.Game.saveManager.load();
  assert.equal(b.Game.saveManager.importCode(code), true);
  const strip = d => { const c = plain(d); delete c.updatedAt; return c; }; // import után el is menti -> új időbélyeg
  assert.deepEqual(strip(b.Game.state.data), strip(a.Game.state.data));
  assert.equal(JSON.parse(b.storage.getItem(b.KEY)).gold, 21, 'import után el is menti');
});

test('a régi kóddal készült (v2) export kód is betölthető', () => {
  const { Game } = createGame();
  Game.saveManager.load();
  assert.equal(Game.saveManager.importCode(fixture('export_v2.txt')), true);
  assert.equal(Game.state.gold, 42);
  assert.equal(Game.state.hp, 13);
  assert.deepEqual(plain(Game.state.data.dungeons), { dungeon_crypt: { visits: 3, clears: 1 }, dungeon_mine: { visits: 1, clears: 0 } });
});

test('szóközök és sortörések a kódban nem zavarnak', () => {
  const { Game } = createGame();
  Game.saveManager.load();
  const code = fixture('export_v2.txt');
  assert.equal(Game.saveManager.importCode('  ' + code.slice(0, 30) + '\n ' + code.slice(30) + '\n'), true);
});

test('hibás kód: false, és az aktuális állás nem változik', () => {
  const { Game } = createGame();
  Game.saveManager.load();
  Game.state.addGold(3);
  const code = fixture('export_v2.txt');
  const [prefix, body, sum] = code.split('.');
  const tampered = prefix + '.' + body.slice(0, -2) + (body.slice(-2) === 'AA' ? 'BB' : 'AA') + '.' + sum;
  for (const bad of ['', 'abc', 'XX1.' + body + '.' + sum, tampered, prefix + '.' + body, prefix + '.!!!.' + sum, null, undefined]) {
    assert.equal(Game.saveManager.importCode(bad), false, String(bad));
  }
  assert.equal(Game.state.gold, 3);
});

test('érvényes kód, de nem mentés van benne: false', () => {
  const { Game } = createGame();
  Game.saveManager.load();
  const code = Game.saveCodec.encode({ hello: 'world' }, 'DA1');
  assert.equal(Game.saveManager.importCode(code), false);
});
