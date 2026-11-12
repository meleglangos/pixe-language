// Fordítási fájl (data/translations.json): minden megjelenő szöveg innen jön, német + magyar változattal.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { createGame, ROOT } = require('./helpers/env');

const translations = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'translations.json'), 'utf8'));
const vars = s => [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort();

test('minden bejegyzésnek van német és magyar szövege, azonos helyőrzőkkel', () => {
  for (const [key, entry] of Object.entries(translations)) {
    assert.match(key, /^[a-z][a-zA-Z0-9_]*(\.[a-zA-Z0-9_]+)+$/, 'kulcs formátuma: ' + key);
    assert.equal(typeof entry.de, 'string', key + '.de'); assert.ok(entry.de.trim(), key + '.de üres');
    assert.equal(typeof entry.hu, 'string', key + '.hu'); assert.ok(entry.hu.trim(), key + '.hu üres');
    assert.deepEqual(vars(entry.hu), vars(entry.de), key + ': a {helyőrzők} nem egyeznek');
  }
});

// A felület kódjában szereplő kulcs-literálok ('menu.title' stb.) mind léteznek.
// ('poi.' + id jellegű összefűzéseknél a pontra végződő előtagot kihagyjuk; azokat a tartalom-ellenőrzés nézi.)
test('a kódban használt összes szöveg-kulcs létezik a fordítási fájlban', () => {
  const dirs = ['src/ui', 'src/scenes', 'src/world', 'src/main.js'];
  const files = dirs.flatMap(d => {
    const p = path.join(ROOT, d);
    if (fs.statSync(p).isFile()) return [p];
    return fs.readdirSync(p, { recursive: true }).filter(f => f.endsWith('.js')).map(f => path.join(p, f));
  });
  const missing = [];
  let found = 0;
  for (const f of files) {
    for (const m of fs.readFileSync(f, 'utf8').matchAll(/'([a-z]+\.[a-zA-Z0-9_.]+)'/g)) {
      if (m[1].endsWith('.')) continue;
      found++;
      if (!translations[m[1]]) missing.push(path.relative(ROOT, f) + ': ' + m[1]);
    }
  }
  assert.ok(found > 40, 'túl kevés kulcsot talált: ' + found);
  assert.deepEqual(missing, []);
});

test('a tartalomból hivatkozott szövegek (helyszínek, típusok, rarity) léteznek', () => {
  const { Game } = createGame();
  const keys = [];
  Game.data.map.pois.forEach(p => keys.push('poi.' + p.id + '.name', 'poi.' + p.id + '.desc', 'poi.type.' + p.type));
  Game.data.config.rarities.forEach(r => keys.push('rarity.' + r.id));
  assert.deepEqual(keys.filter(k => !translations[k]), []);
});

test('a "?" buborék a fordítási fájlból dolgozik (kulcsot tárol, nem kész szöveget)', () => {
  const src = fs.readFileSync(path.join(ROOT, 'src/ui/ui.js'), 'utf8');
  assert.match(src, /ui\.help = function \(key, vars\)/);
  assert.match(src, /Game\.i18n\.hu\(anchor\.dataset\.key/);
  const callers = ['src/ui', 'src/scenes', 'src/main.js'].flatMap(d => {
    const p = path.join(ROOT, d);
    return fs.statSync(p).isFile() ? [p] : fs.readdirSync(p, { recursive: true }).filter(f => f.endsWith('.js')).map(f => path.join(p, f));
  });
  for (const f of callers) assert.doesNotMatch(fs.readFileSync(f, 'utf8'), /ui\.help\(Game\.i18n/, f + ': a help() kulcsot kapjon');
});
