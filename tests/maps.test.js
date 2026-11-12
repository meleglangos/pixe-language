// Tiled térképek (data/maps/*.json): a Tiled szerkesztővel nyithatók, és a játék helyesen olvassa őket.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { createGame, readData, plain, ROOT } = require('./helpers/env');

const MAPS = path.join(ROOT, 'data', 'maps');
const files = fs.readdirSync(MAPS).filter(f => f.endsWith('.json'));
const load = f => JSON.parse(fs.readFileSync(path.join(MAPS, f), 'utf8'));

test('megvan mindhárom térkép', () => {
  assert.deepEqual(files.sort(), ['dungeon_crypt.json', 'dungeon_mine.json', 'overworld.json']);
});

for (const f of files) {
  test(f + ': Tiled-kompatibilis (ortogonális, CSV rétegek, beágyazott tileset, relatív és létező képútvonal)', () => {
    const m = load(f);
    assert.equal(m.type, 'map');
    assert.equal(m.orientation, 'orthogonal');
    assert.equal(m.infinite, false);
    assert.equal(m.tilewidth, 16); assert.equal(m.tileheight, 16);
    assert.ok(m.tilesets.length > 0);
    for (const ts of m.tilesets) {
      assert.equal(ts.source, undefined, 'a tileset legyen beágyazva');
      assert.ok(!path.isAbsolute(ts.image) && !/^[a-z]+:/i.test(ts.image), 'relatív útvonal: ' + ts.image);
      const img = path.join(MAPS, ts.image);
      assert.ok(fs.existsSync(img), 'létezik: ' + ts.image);
      const png = fs.readFileSync(img);
      assert.equal(png.readUInt32BE(16), ts.imagewidth, ts.image + ' szélessége');
      assert.equal(png.readUInt32BE(20), ts.imageheight, ts.image + ' magassága');
      assert.equal(ts.columns * ts.tilewidth, ts.imagewidth);
    }
    const ids = new Set();
    for (const l of m.layers) {
      assert.ok(!ids.has(l.id), 'egyedi réteg-id'); ids.add(l.id);
      if (l.type === 'tilelayer') {
        assert.equal(l.encoding, undefined);
        assert.equal(l.data.length, m.width * m.height);
      }
    }
    assert.ok(m.nextlayerid > Math.max(...ids));
    const objIds = m.layers.flatMap(l => (l.objects || []).map(o => o.id));
    assert.equal(new Set(objIds).size, objIds.length, 'egyedi objektum-id');
    assert.ok(m.nextobjectid > Math.max(0, ...objIds));
  });
}

test('a térképekből épített pályák épek: a kezdőpont, a láda és a szörnyek járható helyen', () => {
  const { Game } = createGame();
  assert.deepEqual([...Game.content.issues], []);
  const ow = Game.data.map;
  assert.equal(ow.legend.ground[ow.ground[ow.spawn.y][ow.spawn.x]] !== 'water', true);
  assert.equal(ow.objects[ow.spawn.y][ow.spawn.x], '.');
  for (const d of Object.values(Game.data.dungeons)) {
    const floor = (x, y) => '.,='.includes(d.layout[y][x]);
    assert.ok(floor(d.start.x, d.start.y), d.id + ' start');
    assert.ok(floor(d.chest.x, d.chest.y) && floor(d.chest.x + 1, d.chest.y), d.id + ' láda');
    d.monsters.forEach(m => assert.ok(floor(m.x, m.y), d.id + ' ' + m.type));
    assert.ok(d.doors.length > 0 && d.props.length > 0);
  }
});

// ---------- a Tiledben szerkesztett fájlok olvasása ----------
const overworld = () => readData().maps.overworld;

test('egy Tiledben áthelyezett objektum új helyre kerül (a pont a mezőn belül bárhol lehet)', () => {
  const { Game } = createGame();
  const m = overworld();
  const shop = m.layers.find(l => l.name === 'pois').objects.find(o => o.name === 'shop');
  shop.x = 25 * 16 + 3; shop.y = 14 * 16 + 15;
  const out = Game.tiledMap.parseOverworld(m);
  assert.deepEqual(plain(out.map.pois.find(p => p.id === 'shop')), { id: 'shop', type: 'shop', x: 25, y: 14, sprite: 'poi_shop' });
});

test('tükrözött csempe és Tiled 1.9 "class" mező is működik', () => {
  const { Game } = createGame();
  const m = overworld();
  const ground = m.layers.find(l => l.name === 'ground');
  const before = Game.tiledMap.parseOverworld(m).map.ground[5][10];
  ground.data[5 * m.width + 10] = (ground.data[5 * m.width + 10] | 0x80000000) >>> 0; // vízszintes tükrözés
  m.layers.find(l => l.name === 'pois').objects.forEach(o => { o.class = o.type; delete o.type; });
  const out = Game.tiledMap.parseOverworld(m);
  assert.deepEqual(plain(out.issues), []);
  assert.equal(out.map.ground[5][10], before);
  assert.equal(out.map.pois[0].type, 'home');
});

test('hibás térkép: érthető hibaüzenet, nem dob kivételt', () => {
  const { Game } = createGame();
  const m = overworld();
  m.layers.find(l => l.name === 'ground').data[0] = 999;
  m.layers.find(l => l.name === 'objects').encoding = 'base64';
  m.layers = m.layers.filter(l => l.name !== 'markers');
  m.tilesets.push({ firstgid: 500, source: 'kulso.tsx' });
  const issues = Game.tiledMap.parseOverworld(m).issues.join('\n');
  assert.match(issues, /ismeretlen csempe \(gid 999\)/);
  assert.match(issues, /formátuma legyen CSV/);
  assert.match(issues, /hiányzik a kezdőpont/);
  assert.match(issues, /külső tileset/);
});

test('hiányzó dungeon-térkép: a dungeon kimarad (zárva marad), a játék betölt', () => {
  const { Game } = createGame();
  const raw = readData();
  delete raw.maps.dungeon_mine;
  Game.content.install(raw);
  assert.equal(Game.data.dungeons.dungeon_mine, undefined);
  assert.ok(Game.data.dungeons.dungeon_crypt);
  assert.match(Game.content.issues.join('\n'), /hiányzik a térképe \(data\/maps\/dungeon_mine\.json\)/);
});
