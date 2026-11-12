// Közös dungeon jelenet. Mindent a data/dungeons.json leírásából épít fel:
// pálya, berendezés, ajtók, szörnyek, láda, kijárat, fények, hangulat-effektek.
// A kinézetet a téma adja (src/world/dungeonThemes.js), a mozgás az ExploreScene-ben van.
// A fények, a víz, a hangulat-effektek és a berendezés a scenes/dungeon/ mappában vannak.
(function () {
  const TS = 16;

  class DungeonScene extends Game.scenes.Explore {
    constructor() { super('Dungeon'); }

    init(data) { this.dungeonId = data && data.id; }

    create() {
      const def = this.def = Game.data.dungeons[this.dungeonId];
      if (!def) { this.scene.start('World'); return; }
      const theme = this.theme = Game.dungeonThemes[def.theme];
      const rows = def.layout, H = rows.length, W = rows[0].length;
      const at = (x, y) => (y >= 0 && y < H && x >= 0 && x < W ? rows[y][x] : '#');
      const walkCh = c => c === '.' || c === ',' || c === '=';
      const L = this.L = { W, H, at, floor: (x, y) => walkCh(at(x, y)) };
      this.isFloor = L.floor;

      const cells = rows.map(r => r.split('').map(c => (walkCh(c) ? 0 : 1)));
      this.grid = new Game.world.Grid(cells, TS);
      if (theme.blockedExtra) theme.blockedExtra(L).forEach(([x, y]) => this.grid.block(x, y, true));
      this.cameras.main.setBackgroundColor(theme.voidColor);
      this.doors = [];
      this.mobs = [];
      this.pendingSpots = [];
      this.holes = [];      // fénykörök a sötétségben
      this.sparkles = {};   // szín -> csillogás-pontok
      this.tick = 0;

      // talaj + falak egy textúrán
      if (this.textures.exists('dungeon_ground')) this.textures.remove('dungeon_ground');
      const tex = this.textures.createCanvas('dungeon_ground', W * TS, H * TS);
      const ctx = tex.getContext();
      ctx.fillStyle = theme.voidColor; ctx.fillRect(0, 0, W * TS, H * TS);
      theme.paintBase(this, ctx, L);
      (def.props || []).forEach(p => this.placeProp(ctx, p[0], p[1], p[2]));
      (def.doors || []).forEach(d => this.addDoor(ctx, d));
      this.addExit(ctx, def.exit);
      tex.refresh();
      this.add.image(0, 0, 'dungeon_ground').setOrigin(0, 0).setDepth(-10);

      this.addLakes();
      (def.puddles || []).forEach((p, i) => this.addPuddle(p, i));
      (def.monsters || []).forEach(m => this.addMonster(m));
      this.addChest(def.chest);
      (def.glints || []).forEach(g => this.addGlint(g));

      this.grid.rebuild();
      this.initExplore({ tile: def.start, dir: 'up', width: W * TS, height: H * TS });
      this.hotspots = this.pendingSpots;
      this.setupDarkness();
      this.setupAmbience();

      // látogatások számolása a mentésben
      Game.state.recordDungeonVisit(this.dungeonId);

      if (Game.debug) this.drawDebug();
      Game.events.emit('scene', { key: 'Dungeon', name: def.name, exit: () => this.exitDungeon() });
      this.events.once('shutdown', () => Game.events.emit('scene', { key: null }));
    }

    exitDungeon() { this.leaveTo('World'); }

    // ---------- ajtók ----------
    addDoor(ctx, d) {
      const parts = this.theme.door(this, ctx, d);
      const door = { def: d, x: d.x, y: d.y, open: d.state !== 'closed', gate: parts.gate };
      parts.overlay.setDepth((d.y + 1) * TS - 1);
      parts.gate.setDepth((d.y + 1) * TS - 2);
      this.doors.push(door);
      this.setDoor(door, door.open, true);
    }

    // Ajtó nyitása / zárása (zárva: nem lehet átmenni). A harc-lépés ezt fogja használni.
    setDoor(door, open, skipRebuild) {
      door.open = open;
      door.gate.setVisible(!open);
      for (let y = door.y - 2; y <= door.y; y++) for (let x = door.x; x <= door.x + 1; x++) this.grid.block(x, y, !open);
      if (!skipRebuild) this.grid.rebuild();
    }

    // ---------- kijárat (2 mező széles, 3 magas a falban; x,y = a bal alsó mezője) ----------
    addExit(ctx, e) {
      this.theme.exit(this, ctx, e);
      const spots = [{ x: e.x, y: e.y + 1 }, { x: e.x + 1, y: e.y + 1 }];
      const cx = (e.x + 1) * TS, cy = (e.y + 1) * TS + 12;
      const target = { spots, face: { x: cx, y: cy - 16 } };
      for (let y = e.y - 2; y <= e.y; y++) for (let x = e.x; x <= e.x + 1; x++) this.grid.redirect[x + ',' + y] = target;
      if (e.light) this.addLight(cx, e.y * TS, e.light);
      this.pendingSpots.push({
        x: cx, y: cy, radius: 18,
        prompt: { type: 'poi.type.exit', name: e.name || 'dungeon.exitName', desc: e.desc || 'dungeon.exitDesc', action: { key: 'dungeon.exit', fn: () => this.exitDungeon() } },
      });
    }

    // ---------- szörnyek ----------
    addMonster(m) {
      const type = Game.data.monsters[m.type];
      if (!type) { console.warn('Ismeretlen szörny:', m.type); return; }
      const c = this.grid.center(m.x, m.y);
      const mob = new Game.world.Mob(this, type, c.x, c.y);
      this.mobs.push(mob);
      this.grid.block(m.x, m.y, true);
      const spots = [[0, 1], [-1, 0], [1, 0], [0, -1]].map(([i, j]) => ({ x: m.x + i, y: m.y + j })).filter(s => this.grid.walkable(s.x, s.y));
      const target = { spots, face: { x: c.x, y: c.y - 4 } };
      this.grid.redirect[m.x + ',' + m.y] = this.grid.redirect[m.x + ',' + (m.y - 1)] = target;
      this.pendingSpots.push({ x: c.x, y: c.y - 4, radius: 27, prompt: { type: 'mob.type', name: type.name, desc: type.desc, action: null } });
      this.holes.push({ x: c.x, y: c.y - 12, r: 30, k: 1 }); // sötét dungeonben is látszódjon
    }

    // ---------- láda (2 mezőt foglal: x és x+1) ----------
    addChest(ch) {
      const cx = (ch.x + 1) * TS, py = ch.y * TS + TS - 2;
      this.chest = { opened: false };
      this.chest.sprite = this.add.image(cx, py, 'pc_furniture', 'chest_closed').setOrigin(0.5, 1).setDepth(py);
      this.chest.light = this.addLight(cx, py - 6, { color: 'gold', scale: 0.9, hole: this.def.darkness ? 26 : 0 });
      (this.sparkles.gold = this.sparkles.gold || []).push({ x: cx, y: py - 8, r: 12 });
      this.grid.block(ch.x, ch.y, true); this.grid.block(ch.x + 1, ch.y, true);
      const target = { spots: [{ x: ch.x, y: ch.y + 1 }, { x: ch.x + 1, y: ch.y + 1 }], face: { x: cx, y: py - 20 }, onReach: () => this.openChest() };
      [[0, 0], [1, 0], [0, -1], [1, -1]].forEach(([i, j]) => { this.grid.redirect[(ch.x + i) + ',' + (ch.y + j)] = target; });
      this.chest.spot = { x: cx, y: (ch.y + 1) * TS + 10, radius: 22, prompt: null };
      this.chestPrompt();
      this.pendingSpots.push(this.chest.spot);
    }

    chestPrompt() {
      const o = this.chest.opened;
      this.chest.spot.prompt = {
        type: 'chest.type', name: 'chest.name', desc: o ? 'chest.emptyDesc' : 'chest.desc',
        action: o ? null : { key: 'chest.open', fn: () => this.openChest() },
      };
    }

    // Kinyílás: a csomagban a ládának két képkockája van (csukott / nyitott),
    // ezt váltjuk egy kis kódos "ugrással" és porfelhővel.
    openChest() {
      const ch = this.chest;
      if (ch.opened) return;
      ch.opened = true;
      const s = ch.sprite;
      this.tweens.add({
        targets: s, scaleY: 0.82, scaleX: 1.1, duration: 90, yoyo: true,
        onYoyo: () => s.setFrame('chest_open'),
        onComplete: () => {
          s.setScale(1);
          for (let i = 0; i < 6; i++) {
            const d = this.add.rectangle(s.x + (i - 2.5) * 3, s.y - 14, 2, 2, 0xd8d0b0, 0.9).setDepth(90002);
            this.tweens.add({ targets: d, y: d.y - 8 - Math.random() * 8, x: d.x + (i - 2.5) * 2, alpha: 0, duration: 500 + Math.random() * 300, onComplete: () => d.destroy() });
          }
          Game.ui.toast('chest.empty');
        },
      });
      this.tweens.killTweensOf(ch.light);
      this.tweens.add({ targets: ch.light, alpha: 0.25, duration: 600 });
      this.sparkles.gold = [];
      this.chestPrompt();
      this.refreshPrompt();
    }

    update(time, delta) {
      this.exploreUpdate(delta);
      for (const m of this.mobs) m.lookAt(this.player);
      if (this.dark) this.updateDarkness();
    }
  }

  // A kiemelt részek (scenes/dungeon/*.js) metódusai a jelenet részeivé válnak.
  Object.values(Game.dungeonParts).forEach(part => Object.assign(DungeonScene.prototype, part));

  Game.scenes.Dungeon = DungeonScene;
})();
