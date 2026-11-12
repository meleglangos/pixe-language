// A data/*.json és data/maps/*.json fájlokból elkészíti a data/bundle.js-t, amit a játék file:// alóli futáskor használ
// (ott a böngésző nem engedi a JSON-ok betöltését). Weboldalként a JSON-ok töltődnek be közvetlenül.
//
//   node tools/build-data.js           -- újragenerálja a bundle-t
//   node tools/build-data.js --check   -- csak ellenőrzi, hogy friss-e (a tesztek is ezt nézik)
//
// Futtasd minden data/*.json módosítás után.
const fs = require('fs');
const path = require('path');

const DATA = path.join(__dirname, '..', 'data');
// Ugyanaz a lista, mint a src/systems/content/ContentLoader.js-ben (FILES).
const FILES = {
  strings: 'translations.json', monsters: 'monsters.json', dungeonProps: 'dungeon_props.json',
  dungeons: 'dungeons.json', items: 'items.json', lootTables: 'loot_tables.json', tasks: 'tasks.json', shop: 'shop.json',
};

// Az összes tartalom egy objektumban (ugyanaz a szerkezet, amit a ContentLoader.install kap).
function readContent() {
  const content = {};
  for (const [key, file] of Object.entries(FILES)) {
    const text = fs.readFileSync(path.join(DATA, file), 'utf8');
    try { content[key] = JSON.parse(text); } catch (e) { throw new Error(file + ': hibás JSON – ' + e.message); }
  }
  // Tiled térképek: a világtérkép + minden dungeon "map" mezője (ugyanaz, mint a ContentLoader mapIds-e)
  content.maps = {};
  for (const id of ['overworld', ...new Set(content.dungeons.map(d => d.map))]) {
    const file = path.join(DATA, 'maps', id + '.json');
    try { content.maps[id] = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { throw new Error('maps/' + id + '.json: ' + e.message); }
  }
  return content;
}

function build() {
  const content = readContent();
  return '// GENERÁLT FÁJL – ne szerkeszd! Forrás: data/*.json, újragenerálás: node tools/build-data.js\n' +
    'window.GAME_CONTENT_BUNDLE = ' + JSON.stringify(content) + ';\n';
}

if (require.main === module) {
  const out = path.join(DATA, 'bundle.js');
  const text = build();
  if (process.argv.includes('--check')) {
    const fresh = fs.existsSync(out) && fs.readFileSync(out, 'utf8') === text;
    console.log(fresh ? 'data/bundle.js friss.' : 'data/bundle.js ELAVULT – futtasd: node tools/build-data.js');
    process.exit(fresh ? 0 : 1);
  }
  fs.writeFileSync(out, text);
  console.log('data/bundle.js kész (' + Math.round(text.length / 1024) + ' KB).');
}

module.exports = { build, readContent, FILES };
