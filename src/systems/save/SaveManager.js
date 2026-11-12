// Az EGYETLEN hely, ami mentést ír vagy olvas (localStorage + export/import kód).
//
// Tárolás (localStorage):
//   <storageKey>          a fő mentés (JSON)
//   <storageKey>.backup   tartalék: az előző sikeres mentés. Ha a fő mentés sérült, ebből tölt be.
//   <storageKey>.broken   egy betölthetetlen fő mentés félretett másolata (hogy ne vesszen el nyom nélkül)
//
// Automatikus mentés: a fontos állapotváltozásokra (loot, arany, felszerelés, dungeon, HP, jelzők)
// feliratkozik, és ugyanabban a lépésben történt változásokat egyetlen írásba vonja össze.
// A pozíciót a WorldScene menti (megálláskor, illetve séta közben pár másodpercenként) a save()-vel.
(function () {
  const AUTOSAVE_ON = ['hp', 'gold', 'inventory', 'gear', 'dungeons', 'surprises', 'flags'];

  function browserStorage() {
    try { return window.localStorage; } catch (e) { return null; }
  }

  const sm = Game.saveManager = {
    storageOk: true,
    loadedFrom: null,   // 'main' | 'backup' | 'new' -- honnan jött a betöltött állás
    lastIssues: [],     // a betöltéskor javított / eldobott hibák (pl. ismeretlen ID-k)
    _storage: null,
    _lastWritten: null, // amit legutóbb mi írtunk ki (erről tudjuk, hogy ép)
    _pending: false,
    _unsub: [],

    get VERSION() { return Game.saveSchema.VERSION; },
    keys() {
      const k = Game.data.config.storageKey;
      return { main: k, backup: k + '.backup', broken: k + '.broken' };
    },

    // storage: tesztekhez cserélhető (getItem/setItem/removeItem); alapból a localStorage.
    init(storage) {
      sm._storage = storage || browserStorage();
      sm._lastWritten = null;
      sm._pending = false;
      sm._unsub.forEach(off => off());
      sm._unsub = AUTOSAVE_ON.map(key => Game.events.on('state:' + key, sm.requestSave));
    },

    known() { return { items: Game.content.ids('items'), dungeons: Game.content.dungeonIds() }; },

    // Nyers JSON szöveg -> ellenőrzött állapot, vagy null.
    parseText(text) {
      if (typeof text !== 'string' || !text) return null;
      let raw;
      try { raw = JSON.parse(text); } catch (e) { return null; }
      return Game.saveSchema.parse(raw, sm.known());
    },

    _get(key) { try { return sm._storage ? sm._storage.getItem(key) : null; } catch (e) { return null; } },
    _set(key, value) { sm._storage.setItem(key, value); },

    // Betöltés indításkor: fő mentés -> tartalék -> új játék. Létrehozza a Game.state-et.
    load() {
      const k = sm.keys();
      let result = null, from = 'new';
      const main = sm._get(k.main);
      if (main) {
        result = sm.parseText(main);
        if (result) { from = 'main'; sm._lastWritten = main; } else {
          console.warn('A mentés sérült vagy nem olvasható, a tartalékot próbálom.');
          try { sm._set(k.broken, main); } catch (e) { /* nincs hely: nem baj */ }
        }
      }
      if (!result) {
        result = sm.parseText(sm._get(k.backup));
        if (result) from = 'backup';
      }
      const data = result ? result.state : Game.saveSchema.defaults();
      sm.lastIssues = result ? result.issues : [];
      sm.lastIssues.forEach(msg => console.warn('Mentés:', msg));
      sm.loadedFrom = from;
      sm._install(data);
      return from;
    },

    _install(data) {
      if (Game.state) Game.state.replace(data); else Game.state = new Game.GameState(data);
      sm._pending = false;
    },

    // Azonnali mentés. Az előző ép mentésből tartalék lesz. Visszatér: sikerült-e.
    save() {
      sm._pending = false;
      if (!Game.state) return false;
      const k = sm.keys();
      const data = Game.state.data;
      data.updatedAt = Date.now();
      const json = JSON.stringify(data);
      try {
        const prev = sm._get(k.main);
        if (prev && prev !== json && (prev === sm._lastWritten || sm.parseText(prev))) sm._set(k.backup, prev);
        sm._set(k.main, json);
        sm._lastWritten = json;
        sm.storageOk = true;
      } catch (e) {
        sm.storageOk = false;
      }
      Game.events.emit('save:written', { ok: sm.storageOk });
      return sm.storageOk;
    },

    // Mentés kérése: az ugyanabban a lépésben érkező kéréseket egy mentésbe vonja össze.
    requestSave() {
      if (sm._pending) return;
      sm._pending = true;
      queueMicrotask(() => { if (sm._pending) sm.save(); });
    },

    // Új játék (a régi állás a tartalékba kerül).
    newGame(flags) {
      const data = Game.saveSchema.defaults();
      Object.assign(data.flags, flags || {});
      sm._install(data);
      sm.save();
    },

    exportCode() {
      return Game.saveCodec.encode(Game.state.data, Game.data.config.exportPrefix);
    },

    // Visszatér: true, ha sikerült (ilyenkor a Game.state már az új állás, és el is mentette).
    importCode(code) {
      const raw = Game.saveCodec.decode(code, Game.data.config.exportPrefix);
      const result = raw && Game.saveSchema.parse(raw, sm.known());
      if (!result) return false;
      sm.lastIssues = result.issues;
      sm._install(result.state);
      sm.save();
      return true;
    },
  };
})();
