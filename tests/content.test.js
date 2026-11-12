// A data/*.json tartalom: érvényes, egyedi ID-k, minden hivatkozás feloldható, a bundle friss.
const test = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('child_process');
const path = require('path');
const { createGame, readData, ROOT } = require('./helpers/env');

test('a valódi tartalomban nincs hiba', () => {
  const { Game } = createGame();
  assert.deepEqual([...Game.content.issues], []);
});

test('minden dungeon ID-ja a világtérkép egy helyszíne, és az ID-k beszédesek', () => {
  const { Game } = createGame();
  for (const id of Object.keys(Game.data.dungeons)) {
    assert.match(id, /^dungeon_[a-z_]+$/);
    assert.ok(Game.data.map.pois.some(p => p.id === id), id);
  }
});

test('a validátor kiszúrja a hibákat', () => {
  const { Game } = createGame();
  const raw = readData();
  raw.items = [{ id: 'sword_bronze_01', rarity: 'mythic' }, { id: 'sword_bronze_01' }, { id: 'Bad-ID' }, { name: 'nincs id' }];
  raw.dungeons = raw.dungeons.map(d => ({ ...d }));
  raw.dungeons[0].monsters = [{ type: 'dragon', x: 1, y: 1 }];
  raw.lootTables = [{ id: 'loot_x', entries: [{ item: 'ghost_item' }] }];
  raw.shop = [{ id: 'offer_x', item: 'sword_bronze_01' }];
  const issues = Game.contentValidator.validate(raw).join('\n');
  assert.match(issues, /ismétlődő id: sword_bronze_01/);
  assert.match(issues, /hibás id \("Bad-ID"\)/);
  assert.match(issues, /hibás id \(undefined\)/);
  assert.match(issues, /ismeretlen rarity: mythic/);
  assert.match(issues, /ismeretlen monsters id: dragon/);
  assert.match(issues, /ismeretlen items id: ghost_item/);
  assert.doesNotMatch(issues, /offer_x/);
});

test('a betöltött tartalom ID szerint indexelt', () => {
  const { Game } = createGame();
  assert.equal(Game.data.dungeons.dungeon_crypt.theme, 'crypt');
  assert.equal(Game.data.monsters.skeleton.idle, 'skel_base_idle');
  assert.equal(Game.data.dungeonProps.torch.kind, 'wall');
  assert.equal(Game.data.dungeons.dungeon_mine.darkness.color, 0x04060e, 'a #rrggbb szín számmá alakul');
});

test('a data/bundle.js friss (különben: node tools/build-data.js)', () => {
  execFileSync(process.execPath, [path.join(ROOT, 'tools', 'build-data.js'), '--check'], { stdio: 'pipe' });
});

test('a ContentLoader és a tools/build-data.js ugyanazokat a fájlokat ismeri', () => {
  const { Game } = createGame();
  const { FILES } = require('../tools/build-data.js');
  const loader = Object.fromEntries(Object.entries(Game.content.FILES).map(([k, v]) => [k, v.file]));
  assert.deepEqual(loader, FILES);
});
