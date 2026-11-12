// Globális névtér. Minden fájl ehhez ad hozzá (nincs build lépés, sima <script> tagek).
window.Game = {
  data: {},      // betöltött tartalom (data/*.json, lásd systems/content) + beállítások (src/config/*.js)
  scenes: {},    // Phaser scene-ek
  gfx: {},       // kódból rajzolt placeholder grafika
  world: {},     // térkép-logika, karakterek
  state: null,   // a központi játékállapot (state/GameState.js)
  debug: /[?&]debug=1/.test(location.search),
};
