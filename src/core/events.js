// Eseménybusz a játéklogika és a felület között.
//   Game.events.on('state:gold', fn)  -- feliratkozás; visszatér egy leiratkozó függvénnyel
//   Game.events.emit('state:gold', { gold })
// Egy hibás feliratkozó nem akasztja meg a többit (pl. a HUD hibája ne állítsa le a mentést).
Game.events = {
  _h: {},
  on(name, fn) {
    (this._h[name] = this._h[name] || []).push(fn);
    return () => this.off(name, fn);
  },
  off(name, fn) {
    const list = this._h[name];
    if (list) this._h[name] = list.filter(f => f !== fn);
  },
  emit(name, arg) {
    (this._h[name] || []).slice().forEach(fn => {
      try { fn(arg); } catch (e) { console.error('Hiba a(z) "' + name + '" esemény kezelőjében', e); }
    });
  },
};
