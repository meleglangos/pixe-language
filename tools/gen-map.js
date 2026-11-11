// Térképgenerátor: `node tools/gen-map.js` -> felülírja a src/data/map.js fájlt.
// A map.js utána kézzel is szerkeszthető (ASCII rács); ha kézzel szerkeszted,
// ne futtasd újra ezt a scriptet, mert felülírja.
const fs = require('fs');
const path = require('path');

const W = 40, H = 30;
let seed = 20261111;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

const pois = [
  { id: 'home',     type: 'home',    x: 16, y: 13, sprite: 'poi_home' },
  { id: 'shop',     type: 'shop',    x: 24, y: 13, sprite: 'poi_shop' },
  { id: 'dungeon1', type: 'dungeon', x: 7,  y: 15, sprite: 'poi_cave' },
  { id: 'dungeon2', type: 'dungeon', x: 32, y: 10, sprite: 'poi_mine' },
  { id: 'dungeon3', type: 'dungeon', x: 30, y: 22, sprite: 'poi_crypt' },
  { id: 'boss',     type: 'boss',    x: 20, y: 7,  sprite: 'poi_tower' },
];
const spawn = { x: 20, y: 16 };

const inMap = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
const isLand = (x, y) => {
  if (!inMap(x, y)) return false;
  const dx = Math.abs((x - 19.5) / 17.6), dy = Math.abs((y - 14.5) / 12.6);
  return dx ** 3 + dy ** 3 + 0.05 * Math.sin(x * 1.3) + 0.05 * Math.cos(y * 1.7) < 1;
};

const ground = [], objects = [];
for (let y = 0; y < H; y++) {
  ground.push([]); objects.push([]);
  for (let x = 0; x < W; x++) { ground[y].push(isLand(x, y) ? 'g' : 'w'); objects[y].push('.'); }
}

// homokos part
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  if (ground[y][x] !== 'g') continue;
  let shore = false;
  for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) if (!isLand(x + i, y + j)) shore = true;
  if (shore) ground[y][x] = 's';
}

// zónák
const zone = (x, y) => {
  if (x <= 12) return 'forest';
  if (x >= 25 && y >= 18) return 'crypt';
  if (x >= 27 && y <= 12) return 'rock';
  if (y <= 8 && x >= 15 && x <= 25) return 'bossland';
  if (x >= 13 && x <= 27 && y >= 9 && y <= 18) return 'village';
  return 'meadow';
};
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  if (ground[y][x] !== 'g') continue;
  const z = zone(x, y);
  if (z === 'forest' || z === 'crypt') ground[y][x] = 'G';
  else if (z === 'rock' || z === 'bossland') ground[y][x] = 'r';
  else if (rnd() < 0.09) ground[y][x] = 'f';
}

// tó
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const dx = (x - 14) / 3.2, dy = (y - 22.5) / 1.8;
  if (dx * dx + dy * dy < 1) ground[y][x] = 'w';
}

// utak
const reserved = new Set();
const key = (x, y) => x + ',' + y;
function road(points) {
  for (let i = 0; i < points.length - 1; i++) {
    let [x, y] = points[i]; const [tx, ty] = points[i + 1];
    for (;;) {
      ground[y][x] = 'p'; reserved.add(key(x, y));
      if (x === tx && y === ty) break;
      x += Math.sign(tx - x); y += Math.sign(ty - y);
    }
  }
}
road([[20, 16], [20, 7]]);
road([[16, 13], [24, 13]]);
road([[20, 16], [7, 16], [7, 15]]);
road([[24, 13], [32, 13], [32, 10]]);
road([[20, 16], [27, 16], [27, 23], [30, 23], [30, 22]]);
road([[20, 16], [20, 21], [18, 21]]);
for (let y = 15; y <= 17; y++) for (let x = 19; x <= 21; x++) { ground[y][x] = 'p'; reserved.add(key(x, y)); }

// foglalt helyek (épületek, ajtók, kezdőhely)
for (const p of pois) {
  for (let y = p.y - 2; y <= p.y + 1; y++) for (let x = p.x - 1; x <= p.x + 1; x++) reserved.add(key(x, y));
}
for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) reserved.add(key(spawn.x + i, spawn.y + j));

// tereptárgyak
const table = {
  forest:   [['T', 0.27], ['P', 0.14], ['B', 0.04]],
  crypt:    [['D', 0.11], ['X', 0.10], ['R', 0.03]],
  rock:     [['R', 0.20], ['K', 0.06], ['P', 0.06]],
  bossland: [['R', 0.14], ['D', 0.09]],
  village:  [['B', 0.035], ['T', 0.015]],
  meadow:   [['T', 0.07], ['B', 0.04], ['R', 0.015]],
};
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const g = ground[y][x];
  if (g === 'w' || g === 's' || g === 'p' || reserved.has(key(x, y))) continue;
  let r = rnd();
  for (const [ch, p] of table[zone(x, y)]) { if (r < p) { objects[y][x] = ch; break; } r -= p; }
}

// ellenőrzés: minden ajtó elérhető a kezdőhelyről
const blocked = (x, y) => !inMap(x, y) || ground[y][x] === 'w' || objects[y][x] !== '.' ||
  pois.some(p => x >= p.x - 1 && x <= p.x + 1 && y >= p.y - 2 && y <= p.y - 1);
const seen = new Set([key(spawn.x, spawn.y)]); const q = [[spawn.x, spawn.y]];
while (q.length) {
  const [x, y] = q.shift();
  for (const [i, j] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const k = key(x + i, y + j);
    if (!seen.has(k) && !blocked(x + i, y + j)) { seen.add(k); q.push([x + i, y + j]); }
  }
}
for (const p of pois) if (!seen.has(key(p.x, p.y))) throw new Error('Nem elérhető: ' + p.id);

const rows = a => a.map(r => "    '" + r.join('') + "',").join('\n');
const out = `// A világtérkép. Kézzel szerkeszthető: minden karakter egy 16x16-os mező.
// A betűk jelentése a "legend" alatt van, a mezőtípusok tulajdonságai a tiles.js-ben.
// (Eredetileg a tools/gen-map.js generálta.)
Game.data.map = {
  tileSize: 16,
  width: ${W},
  height: ${H},
  spawn: { x: ${spawn.x}, y: ${spawn.y} },

  legend: {
    ground: { g: 'grass', G: 'darkgrass', f: 'flowers', p: 'path', s: 'sand', w: 'water', r: 'rocky' },
    objects: { T: 'tree_oak', P: 'tree_pine', D: 'tree_dead', R: 'rock', B: 'bush', X: 'grave', K: 'crystal' },
  },

  // Talaj
  ground: [
${rows(ground)}
  ],

  // Tereptárgyak ('.' = üres)
  objects: [
${rows(objects)}
  ],

  // Helyszínek. x,y = az ajtó előtti mező; az épület ettől felfelé áll (3 mező széles, 2 magas).
  // A nevek és leírások a strings.js-ben vannak: poi.<id>.name / poi.<id>.desc
  pois: [
${pois.map(p => '    ' + JSON.stringify(p).replace(/"(\w+)":/g, '$1: ').replace(/"/g, "'").replace(/,/g, ', ') + ',').join('\n')}
  ],
};
`;
fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'map.js'), out);
console.log(ground.map((r, y) => r.map((c, x) => objects[y][x] !== '.' ? objects[y][x] : (c === 'g' ? ' ' : c)).join('')).join('\n'));
