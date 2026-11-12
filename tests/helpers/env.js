// Tesztkörnyezet: a játék böngészős szkriptjeit egy elszigetelt vm-kontextusba tölti
// (ugyanúgy, mint a <script> tagek), Phaser és DOM nélkül. A tartalom a valódi data/*.json.
const vm = require('vm');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const SCRIPTS = [
  'src/core/game.js',
  'src/core/events.js',
  'src/config/config.js',
  'src/config/tiles.js',
  'src/systems/content/ContentValidator.js',
  'src/systems/content/ContentLoader.js',
  'src/state/GameState.js',
  'src/systems/save/SaveSchema.js',
  'src/systems/save/SaveCodec.js',
  'src/systems/save/SaveManager.js',
];

// localStorage utánzat. failWrites: minden írás kivételt dob (pl. betelt tárhely).
function memoryStorage(initial) {
  const map = new Map(Object.entries(initial || {}));
  return {
    failWrites: false,
    writes: 0,
    getItem: k => (map.has(k) ? map.get(k) : null),
    setItem(k, v) { if (this.failWrites) throw new Error('QuotaExceededError'); this.writes++; map.set(k, String(v)); },
    removeItem: k => map.delete(k),
    dump: () => Object.fromEntries(map),
  };
}

function readData() {
  const { FILES } = require('../../tools/build-data.js');
  const raw = {};
  for (const [key, file] of Object.entries(FILES)) raw[key] = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', file), 'utf8'));
  return raw;
}

// opts.items: extra tárgyak a tesztekhez (a data/items.json még üres)
// opts.storage: kezdeti localStorage tartalom ({ kulcs: szöveg })
function createGame(opts = {}) {
  const warnings = [];
  const quietConsole = { log() {}, error: (...a) => warnings.push(a.join(' ')), warn: (...a) => warnings.push(a.join(' ')) };
  const storage = memoryStorage(opts.storage);
  const ctx = { location: { search: '', protocol: 'http:' }, console: quietConsole, TextEncoder, TextDecoder, btoa, atob, Uint8Array, queueMicrotask, localStorage: storage };
  ctx.window = ctx;
  vm.createContext(ctx);
  for (const f of SCRIPTS) vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
  const Game = ctx.Game;
  const raw = readData();
  if (opts.items) raw.items = raw.items.concat(opts.items);
  Game.content.install(raw);
  Game.saveManager.init(storage);
  return { Game, storage, warnings, KEY: Game.data.config.storageKey };
}

// a mikrotaszkként ütemezett automatikus mentés lefutása
const tick = () => new Promise(resolve => setImmediate(resolve));

const fixture = name => fs.readFileSync(path.join(__dirname, '..', 'fixtures', name), 'utf8').trim();

// a vm-kontextusból jövő objektumok "sima" másolata (deepStrictEqual-hoz)
const plain = v => JSON.parse(JSON.stringify(v));

module.exports = { createGame, memoryStorage, readData, tick, fixture, plain, ROOT };
