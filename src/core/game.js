// Globális névtér. Minden fájl ehhez ad hozzá (nincs build lépés, sima <script> tagek).
window.Game = {
  data: {},      // adatfájlok (src/data/*.js)
  scenes: {},    // Phaser scene-ek
  gfx: {},       // kódból rajzolt placeholder grafika
  world: {},     // térkép-logika, karakterek
  state: null,   // az aktuális mentés (lásd core/save.js)
  debug: /[?&]debug=1/.test(location.search),
};

// Mini eseménybusz a játéklogika és a felület között.
Game.events = {
  _h: {},
  on(name, fn) { (this._h[name] = this._h[name] || []).push(fn); },
  emit(name, arg) { (this._h[name] || []).forEach(fn => fn(arg)); },
};
