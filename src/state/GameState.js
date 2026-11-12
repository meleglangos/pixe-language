// A központi játékállapot. Minden, ami a mentésbe kerül, itt él: pozíció, HP, arany, inventory,
// felszerelés, dungeonök, meglepetés-lootok, jelzők.
//
// Az állapotot CSAK ezeken a metódusokon át szabad módosítani. Minden változás eseményt küld
// (Game.events), így a felület (HUD) és a mentés (SaveManager) magától frissül:
//   state:hp         { hp, maxHp }
//   state:gold       { gold, delta }
//   state:inventory  { inventory }
//   state:gear       { slot, item }
//   state:dungeons   { id, record }
//   state:surprises  { surprises }
//   state:flags      { name, value }
//   state:position   { x, y, dir }        (ez nem vált ki automatikus mentést, lásd WorldScene)
//   state:replaced   {}                   (új játék / betöltés / import: minden kijelző frissüljön)
//   state:changed    { key }              (bármilyen változás után, a fentiek mellett)
//
// A mentésben csak ID-k szerepelnek (tárgy, dungeon), a tartalom a data/*.json-ból jön.
(function () {
  const clampInt = (v, lo, hi) => Math.min(hi, Math.max(lo, Math.round(v)));

  class GameState {
    constructor(data) { this.data = data; }

    emit(key, payload) {
      Game.events.emit('state:' + key, payload);
      Game.events.emit('state:changed', { key });
    }

    // Az egész állapot cseréje (betöltés, import, új játék).
    replace(data) {
      this.data = data;
      Game.events.emit('state:replaced', {});
      ['hp', 'gold', 'inventory', 'gear', 'dungeons', 'surprises', 'flags', 'position'].forEach(key => Game.events.emit('state:' + key, {}));
      Game.events.emit('state:changed', { key: 'replaced' });
    }

    toJSON() { return this.data; }

    // ---------- pozíció a világtérképen ----------
    position() { const p = this.data.player; return { x: p.x, y: p.y, dir: p.dir }; }
    setPosition(x, y, dir) {
      const p = this.data.player;
      if (p.x === x && p.y === y && p.dir === dir) return;
      p.x = x; p.y = y; if (dir) p.dir = dir;
      this.emit('position', this.position());
    }

    // ---------- élet ----------
    get hp() { return this.data.player.hp; }
    get maxHp() { return this.data.player.maxHp; }
    setHp(value) {
      const hp = clampInt(Number(value) || 0, 0, this.maxHp);
      if (hp === this.hp) return;
      this.data.player.hp = hp;
      this.emit('hp', { hp, maxHp: this.maxHp });
    }
    damage(n) { this.setHp(this.hp - Math.max(0, n)); }
    heal(n) { this.setHp(this.hp + Math.max(0, n)); }

    // ---------- arany ----------
    get gold() { return this.data.gold; }
    addGold(n) {
      n = Math.floor(Number(n) || 0);
      if (!n) return;
      const gold = Math.max(0, this.data.gold + n);
      const delta = gold - this.data.gold;
      this.data.gold = gold;
      this.emit('gold', { gold, delta });
    }
    // Vásárláshoz: csak akkor von le, ha van elég. Visszatér: sikerült-e.
    spendGold(n) {
      n = Math.floor(Number(n) || 0);
      if (n < 0 || n > this.data.gold) return false;
      this.addGold(-n);
      return true;
    }

    // ---------- inventory: [{ id, qty }] ----------
    get inventory() { return this.data.inventory.map(e => ({ id: e.id, qty: e.qty })); }
    itemCount(id) { const e = this.data.inventory.find(x => x.id === id); return e ? e.qty : 0; }
    hasItem(id) { return this.itemCount(id) > 0; }
    addItem(id, qty) {
      qty = qty === undefined ? 1 : Math.floor(qty);
      if (!(qty > 0)) return false;
      if (!Game.data.items[id]) { console.warn('Ismeretlen tárgy:', id); return false; }
      const e = this.data.inventory.find(x => x.id === id);
      if (e) e.qty += qty; else this.data.inventory.push({ id, qty });
      this.emit('inventory', { inventory: this.inventory });
      return true;
    }
    removeItem(id, qty) {
      qty = qty === undefined ? 1 : Math.floor(qty);
      const i = this.data.inventory.findIndex(x => x.id === id);
      if (i < 0 || !(qty > 0) || this.data.inventory[i].qty < qty) return false;
      this.data.inventory[i].qty -= qty;
      if (!this.data.inventory[i].qty) this.data.inventory.splice(i, 1);
      this.emit('inventory', { inventory: this.inventory });
      return true;
    }

    // ---------- felszerelés: { slot: tárgy-id | null } ----------
    gear(slot) { return this.data.gear[slot] || null; }
    equip(slot, id) {
      if (!(slot in this.data.gear)) { console.warn('Ismeretlen felszerelés-hely:', slot); return false; }
      if (id !== null && !Game.data.items[id]) { console.warn('Ismeretlen tárgy:', id); return false; }
      if (this.data.gear[slot] === id) return true;
      this.data.gear[slot] = id;
      this.emit('gear', { slot, item: id });
      return true;
    }
    unequip(slot) { return this.equip(slot, null); }

    // ---------- dungeonök: { id: { visits, clears } } ----------
    dungeonRecord(id) { const r = this.data.dungeons[id]; return r ? { visits: r.visits, clears: r.clears } : { visits: 0, clears: 0 }; }
    isDungeonCompleted(id) { return this.dungeonRecord(id).clears > 0; }
    completedDungeons() { return Object.keys(this.data.dungeons).filter(id => this.data.dungeons[id].clears > 0); }
    recordDungeonVisit(id) { this._dungeon(id, 'visits'); }
    completeDungeon(id) { this._dungeon(id, 'clears'); }
    _dungeon(id, field) {
      const r = this.data.dungeons[id] || (this.data.dungeons[id] = { visits: 0, clears: 0 });
      r[field]++;
      this.emit('dungeons', { id, record: this.dungeonRecord(id) });
    }

    // ---------- meglepetés-lootok: [id] ----------
    get surprises() { return this.data.surprises.slice(); }
    addSurprise(id) {
      if (typeof id !== 'string' || this.data.surprises.indexOf(id) >= 0) return false;
      this.data.surprises.push(id);
      this.emit('surprises', { surprises: this.surprises });
      return true;
    }

    // ---------- jelzők ----------
    flag(name) { return !!this.data.flags[name]; }
    setFlag(name, value) {
      value = !!value;
      if (this.data.flags[name] === value) return;
      this.data.flags[name] = value;
      this.emit('flags', { name, value });
    }
  }

  Game.GameState = GameState;
})();
