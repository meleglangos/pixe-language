// Mentés: localStorage + export/import szövegkód.
// Game.state mindig a teljes, aktuális játékállás. Új mezőt elég a defaults()-ba felvenni:
// a régi mentésekbe a migrate() automatikusan pótolja.
(function () {
  const cfg = Game.data.config;
  // A mentés formátumának verziója. Ha a szerkezet változik: növeld, és írj hozzá migrációt lent.
  //   v1: 1. szakasz (pozíció, HP, arany, üres inventory/gear/dungeons)
  //   v2: dungeons[id] = { visits, clears }
  const VERSION = 2;

  // migrations[n]: az n. verziójú mentést alakítja (n+1)-esre.
  const migrations = {
    1(s) {
      const old = s.dungeons && typeof s.dungeons === 'object' && !Array.isArray(s.dungeons) ? s.dungeons : {};
      s.dungeons = {};
      Object.keys(old).forEach(id => {
        const d = old[id] && typeof old[id] === 'object' ? old[id] : {};
        s.dungeons[id] = { visits: Number(d.visits) || 0, clears: Number(d.clears) || 0 };
      });
    },
  };

  function defaults() {
    const spawn = Game.data.map.spawn;
    return {
      v: VERSION,
      updatedAt: 0,
      player: { x: spawn.x, y: spawn.y, dir: 'down', hp: cfg.player.maxHp, maxHp: cfg.player.maxHp },
      gold: 0,
      inventory: [],                       // 3. szakasz
      gear: { weapon: null, armor: null }, // 3. szakasz
      dungeons: {},                        // { id: { visits: n, clears: n } }
      surprises: [],                       // megszerzett meglepetés-lootok
      flags: { introSeen: false },
    };
  }

  const isObj = v => v && typeof v === 'object' && !Array.isArray(v);

  // A hiányzó vagy rossz típusú mezőket az alapértékekkel pótolja.
  function fill(target, def) {
    for (const k of Object.keys(def)) {
      const d = def[k], t = target[k];
      if (isObj(d)) {
        if (!isObj(t)) target[k] = JSON.parse(JSON.stringify(d)); else fill(t, d);
      } else if (t === undefined || (d !== null && typeof t !== typeof d) || Array.isArray(d) !== Array.isArray(t)) {
        target[k] = Array.isArray(d) ? d.slice() : d;
      }
    }
    return target;
  }

  function migrate(raw) {
    if (!isObj(raw) || typeof raw.v !== 'number' || raw.v > VERSION) return null;
    if (raw.v < 1 || raw.v !== Math.floor(raw.v)) return null;
    for (let v = raw.v; v < VERSION; v++) if (migrations[v]) migrations[v](raw);
    const s = fill(raw, defaults());
    s.v = VERSION;
    const num = (v, lo, hi, fb) => (Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : fb);
    s.player.maxHp = num(s.player.maxHp, 1, 9999, cfg.player.maxHp);
    s.player.hp = num(s.player.hp, 0, s.player.maxHp, s.player.maxHp);
    s.gold = Math.floor(num(s.gold, 0, 1e9, 0));
    return s;
  }

  // --- szövegkód ---
  function toB64(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = ''; bytes.forEach(b => { bin += String.fromCharCode(b); });
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function fromB64(b64) {
    const bin = atob(b64.replace(/-/g, '+').replace(/_/g, '/'));
    return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0)));
  }
  function checksum(str) { // FNV-1a
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
    return (h >>> 0).toString(36);
  }

  const save = Game.save = {
    VERSION,
    storageOk: true,

    load() {
      let state = null;
      try {
        const raw = localStorage.getItem(cfg.storageKey);
        if (raw) state = migrate(JSON.parse(raw));
      } catch (e) { console.warn('Mentés betöltése sikertelen', e); }
      Game.state = state || defaults();
      return Game.state;
    },

    persist() {
      Game.state.updatedAt = Date.now();
      try {
        localStorage.setItem(cfg.storageKey, JSON.stringify(Game.state));
        save.storageOk = true;
      } catch (e) { save.storageOk = false; }
      Game.events.emit('state');
    },

    reset() {
      Game.state = defaults();
      save.persist();
    },

    exportCode() {
      const body = toB64(JSON.stringify(Game.state));
      return cfg.exportPrefix + '.' + body + '.' + checksum(body);
    },

    // Visszatér: true, ha sikerült (ilyenkor Game.state már az új állás).
    importCode(code) {
      try {
        const parts = String(code).replace(/\s+/g, '').split('.');
        if (parts.length !== 3 || parts[0] !== cfg.exportPrefix) return false;
        if (checksum(parts[1]) !== parts[2]) return false;
        const state = migrate(JSON.parse(fromB64(parts[1])));
        if (!state) return false;
        Game.state = state;
        save.persist();
        return true;
      } catch (e) { return false; }
    },
  };
})();
