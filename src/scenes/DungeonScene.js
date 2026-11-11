// Dungeon jelenet: a dungeons.js leírásából felépíti a termeket, a berendezést,
// a szörnyeket és a ládát. A mozgás az ExploreScene-ben van.
(function () {
  const VOID = '#141412';
  const TS = 16;

  class DungeonScene extends Game.scenes.Explore {
    constructor() { super('Dungeon'); }

    init(data) { this.dungeonId = data && data.id; }

    create() {
      const def = this.def = Game.data.dungeons[this.dungeonId];
      if (!def) { this.scene.start('World'); return; }
      const rows = def.layout, H = rows.length, W = rows[0].length;
      this.isFloor = (x, y) => y >= 0 && y < H && x >= 0 && x < W && rows[y][x] === '.';

      const cells = rows.map(r => r.split('').map(c => (c === '.' ? 0 : 1)));
      this.grid = new Game.world.Grid(cells, TS);
      this.cameras.main.setBackgroundColor(VOID);
      this.doors = [];
      this.mobs = [];
      this.pendingSpots = [];

      // talaj + falak egy textúrán
      if (this.textures.exists('dungeon_ground')) this.textures.remove('dungeon_ground');
      const tex = this.textures.createCanvas('dungeon_ground', W * TS, H * TS);
      const ctx = tex.getContext();
      this.paintBase(ctx, W, H);
      def.props.forEach(p => this.placeProp(ctx, p[0], p[1], p[2]));
      def.doors.forEach(d => this.addDoor(ctx, d));
      this.addExit(ctx, def.exit);
      tex.refresh();
      this.add.image(0, 0, 'dungeon_ground').setOrigin(0, 0).setDepth(-10);

      def.puddles.forEach((p, i) => this.addPuddle(p, i));
      def.monsters.forEach(m => this.addMonster(m));
      this.addChest(def.chest);

      this.grid.rebuild();
      this.initExplore({ tile: def.start, dir: 'up', width: W * TS, height: H * TS });
      this.hotspots = this.pendingSpots;

      // látogatások számolása a mentésben
      const rec = Game.state.dungeons[this.dungeonId] || (Game.state.dungeons[this.dungeonId] = { visits: 0, clears: 0 });
      rec.visits++;
      Game.save.persist();

      if (Game.debug) this.drawDebug();
      Game.events.emit('scene', { key: 'Dungeon', name: def.name, exit: () => this.exitDungeon() });
      this.events.once('shutdown', () => Game.events.emit('scene', { key: null }));
    }

    exitDungeon() { this.leaveTo('World'); }

    // ---------- padló és falak ----------
    paintBase(ctx, W, H) {
      const draw = (name, x, y) => Game.gfx.drawFrame(this, ctx, name, x * TS, y * TS);
      ctx.fillStyle = VOID; ctx.fillRect(0, 0, W * TS, H * TS);
      const f = this.isFloor;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        if (f(x, y)) {
          const hash = (x * 73 + y * 151 + x * y * 7) % 23;
          draw(hash < 2 ? 'floor_alt_' + ((x + y) % 4) : 'floor_' + ((x % 3) + (y % 3) * 3), x, y);
        } else if (f(x, y + 1)) draw('wall_bottom_' + (x % 3), x, y);
        else if (f(x, y + 2)) draw('wall_top_' + (x % 3), x, y);
        else if (f(x, y + 3)) draw('wall_cap_' + (x % 3), x, y);
      }
      // a csomagban nincs oldalsó / alsó falperem: vékony kőszegély kódból, a fal színeivel
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        if (!f(x, y)) continue;
        const px = x * TS, py = y * TS;
        if (!f(x - 1, y)) { ctx.fillStyle = '#394554'; ctx.fillRect(px - 3, py, 3, TS); ctx.fillStyle = '#607897'; ctx.fillRect(px - 1, py, 1, TS); }
        if (!f(x + 1, y)) { ctx.fillStyle = '#394554'; ctx.fillRect(px + TS, py, 3, TS); ctx.fillStyle = '#607897'; ctx.fillRect(px + TS, py, 1, TS); }
        if (!f(x, y + 1) && !f(x, y + 4)) { ctx.fillStyle = '#394554'; ctx.fillRect(px - (f(x - 1, y) ? 0 : 3), py + TS, TS + (f(x - 1, y) ? 0 : 3) + (f(x + 1, y) ? 0 : 3), 3); ctx.fillStyle = '#607897'; ctx.fillRect(px, py + TS, TS, 1); }
        // árnyék a fal tövében
        if (!f(x, y - 1)) { ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.fillRect(px, py, TS, 4); }
      }
    }

    // ---------- berendezés ----------
    placeProp(ctx, name, x, y) {
      const p = Game.data.dungeonProps[name];
      if (!p) { console.warn('Ismeretlen berendezés:', name); return; }
      const fr = p.frame && Game.data.assets.frames[p.frame];
      if (p.blocks) this.grid.block(x, y, true);

      if (p.kind === 'decal') {
        const aligned = fr[3] % TS === 0 && fr[4] % TS === 0;
        ctx.save();
        ctx.globalAlpha = p.alpha || 1;
        if (p.clip) { // csak falra és padlóra kerüljön, a sötétségbe ne lógjon ki
          ctx.beginPath();
          for (let j = 0; j < fr[4] / TS; j++) for (let i = 0; i < fr[3] / TS; i++) {
            if ([0, 1, 2, 3].some(k => this.isFloor(x + i, y + j + k))) ctx.rect((x + i) * TS, (y + j) * TS, TS, TS);
          }
          ctx.clip();
        }
        if (aligned) Game.gfx.drawFrame(this, ctx, p.frame, x * TS, y * TS);
        else Game.gfx.drawFrame(this, ctx, p.frame, x * TS + Math.round((TS - fr[3]) / 2), y * TS + TS - 2 - fr[4]);
        ctx.restore();
      } else if (p.kind === 'wall') {
        Game.gfx.drawFrame(this, ctx, p.frame, x * TS + Math.round((TS - fr[3]) / 2), y * TS + TS - (p.dy || 4) - fr[4]);
      } else if (p.kind === 'object') {
        const py = y * TS + TS - 2;
        this.add.image(x * TS + TS / 2, py, fr[0], p.frame).setOrigin(0.5, 1).setDepth(py);
        ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(x * TS + 2, py - 2, TS - 4, 3);
      } else if (p.kind === 'torch') {
        // fénytócsa a padlón (a csomag saját "glow" csempéi), tartó a falon, fölötte a láng
        Game.gfx.drawFrame(this, ctx, 'glow_red', (x - 1) * TS, (y + 1) * TS);
        const s = Game.data.assets.frames.sconce, bottom = y * TS + TS - 5;
        Game.gfx.drawFrame(this, ctx, 'sconce', x * TS + Math.round((TS - s[3]) / 2), bottom - s[4]);
        const cx = x * TS + TS / 2;
        this.add.sprite(cx, bottom - s[4] + 6, 'fire_small').setOrigin(0.5, 33 / 48).setDepth(2)
          .play({ key: Game.gfx.stripAnim(this, 'fire_small'), startFrame: (x + y) % 4 });
        this.addLight(cx, y * TS + TS + 6, 1.5);
      } else if (p.kind === 'brazier') {
        const cx = x * TS + TS / 2, py = y * TS + TS - 1;
        this.add.sprite(cx, py, 'brazier').setOrigin(0.5, 1).setDepth(py).play(Game.gfx.stripAnim(this, 'brazier'));
        this.add.sprite(cx, py - 12, 'fire_big').setOrigin(0.5, 38 / 48).setDepth(py + 0.5)
          .play({ key: Game.gfx.stripAnim(this, 'fire_big'), startFrame: x % 4 });
        this.addLight(cx, py - 10, 1.3);
      }
    }

    // Villódzó fény (kódos effekt; a csomagban a fénynek nincs animációja).
    addLight(x, y, scale) {
      const l = this.add.image(x, y, 'fx_light').setBlendMode(Phaser.BlendModes.ADD).setDepth(90000).setScale(scale).setAlpha(0.8);
      const flicker = () => {
        this.tweens.add({
          targets: l, alpha: 0.55 + Math.random() * 0.4, scale: scale * (0.92 + Math.random() * 0.16),
          duration: 90 + Math.random() * 220, onComplete: flicker,
        });
      };
      flicker();
      return l;
    }

    // ---------- víztócsa: a csomag 4 képkockás vízanimációja, kódból lekerekítve ----------
    addPuddle(p, index) {
      const w = p.w * TS, h = p.h * TS, keys = [];
      // tócsa alakú maszk (pixeles ellipszis)
      const mask = document.createElement('canvas');
      mask.width = w; mask.height = h;
      Game.gfx.ell(mask.getContext('2d'), '#000', w / 2, h / 2, w / 2 - 1, h / 2 - 2);
      for (let k = 0; k < 4; k++) {
        const key = 'puddle_' + index + '_' + k;
        if (this.textures.exists(key)) this.textures.remove(key);
        const tex = this.textures.createCanvas(key, w, h), c = tex.getContext();
        for (let y = 0; y < h; y += 48) for (let x = 0; x < w; x += 48) Game.gfx.drawFrame(this, c, 'water_' + k, x, y);
        c.globalCompositeOperation = 'destination-in';
        c.drawImage(mask, 0, 0);
        c.globalCompositeOperation = 'source-over';
        tex.refresh();
        keys.push({ key });
      }
      const animKey = 'puddle_' + index;
      if (this.anims.exists(animKey)) this.anims.remove(animKey);
      this.anims.create({ key: animKey, frames: keys, frameRate: 3, repeat: -1 });
      this.add.sprite(p.x * TS, p.y * TS, keys[0].key).setOrigin(0, 0).setDepth(-5).setAlpha(0.42).setTint(0x7fb0c0).play(animKey);
    }

    // ---------- ajtók ----------
    addDoor(ctx, d) {
      const door = { def: d, x: d.x, y: d.y, open: d.state !== 'closed' };
      const px = d.x * TS, py = (d.y - 2) * TS;
      // a nyitott boltív belseje átlátszó "kapu": a karakter a kőkeret mögött megy át
      const key = 'door_arch_' + d.x + '_' + d.y;
      if (this.textures.exists(key)) this.textures.remove(key);
      const tex = this.textures.createCanvas(key, 32, 48), c = tex.getContext();
      Game.gfx.drawFrame(this, c, 'door_arch', 0, 0);
      c.globalCompositeOperation = 'destination-out';
      [[7, 12, 20], [8, 10, 22], [9, 9, 23], [10, 7, 25], [11, 7, 25], [12, 6, 26], [13, 5, 27], [14, 5, 27]].forEach(([y, a, b]) => c.fillRect(a, y, b - a, 1));
      c.fillRect(4, 15, 24, 33);
      c.globalCompositeOperation = 'source-over';
      tex.refresh();
      Game.gfx.drawFrame(this, ctx, 'door_arch', px, py);
      ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(px + 4, py + 48, 24, 3);
      door.arch = this.add.image(px, py, key).setOrigin(0, 0).setDepth((d.y + 1) * TS - 1);
      door.gate = this.add.image(px, py, 'pc_dungeon', 'door_gate').setOrigin(0, 0).setDepth((d.y + 1) * TS - 2);
      this.doors.push(door);
      this.setDoor(door, door.open, true);
    }

    // Ajtó nyitása / zárása (zárva: rács, nem lehet átmenni). A harc-lépés ezt fogja használni.
    setDoor(door, open, skipRebuild) {
      door.open = open;
      door.gate.setVisible(!open);
      for (let y = door.y - 2; y <= door.y; y++) for (let x = door.x; x <= door.x + 1; x++) this.grid.block(x, y, !open);
      if (!skipRebuild) this.grid.rebuild();
    }

    // ---------- kijárat ----------
    addExit(ctx, e) {
      // csukott faajtó a falban (2 mező széles, 3 magas): ezen jöttünk be
      Game.gfx.drawFrame(this, ctx, 'door_wood', e.x * TS, (e.y - 2) * TS);
      const spots = [{ x: e.x, y: e.y + 1 }, { x: e.x + 1, y: e.y + 1 }];
      const cx = (e.x + 1) * TS, cy = (e.y + 1) * TS + 12;
      const target = { spots, face: { x: cx, y: cy - 16 } };
      for (let y = e.y - 2; y <= e.y; y++) for (let x = e.x; x <= e.x + 1; x++) this.grid.redirect[x + ',' + y] = target;
      this.pendingSpots.push({
        x: cx, y: cy, radius: 18,
        prompt: { type: 'poi.type.exit', name: 'dungeon.exitName', desc: 'dungeon.exitDesc', action: { key: 'dungeon.exit', fn: () => this.exitDungeon() } },
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
      const spots = [[0, 1], [-1, 0], [1, 0], [0, -1]].map(([i, j]) => ({ x: m.x + i, y: m.y + j })).filter(s => this.isFloor(s.x, s.y));
      const target = { spots, face: { x: c.x, y: c.y - 4 } };
      this.grid.redirect[m.x + ',' + m.y] = this.grid.redirect[m.x + ',' + (m.y - 1)] = target;
      this.pendingSpots.push({ x: c.x, y: c.y - 4, radius: 27, prompt: { type: 'mob.type', name: type.name, desc: type.desc, action: null } });
    }

    // ---------- láda ----------
    addChest(ch) {
      const cx = (ch.x + 1) * TS, py = ch.y * TS + TS - 2;
      this.chest = { opened: false };
      this.chest.sprite = this.add.image(cx, py, 'pc_furniture', 'chest_closed').setOrigin(0.5, 1).setDepth(py);
      this.chest.light = this.addLight(cx, py - 6, 0.9).setTint(0xffe9a0);
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
            const d = this.add.rectangle(s.x + (i - 2.5) * 3, s.y - 14, 2, 2, 0xd8d0b0, 0.9).setDepth(s.depth + 1);
            this.tweens.add({ targets: d, y: d.y - 8 - Math.random() * 8, x: d.x + (i - 2.5) * 2, alpha: 0, duration: 500 + Math.random() * 300, onComplete: () => d.destroy() });
          }
          Game.ui.toast('chest.empty');
        },
      });
      this.tweens.killTweensOf(ch.light);
      this.tweens.add({ targets: ch.light, alpha: 0, duration: 600 });
      this.chestPrompt();
      this.refreshPrompt();
    }

    update(time, delta) {
      this.exploreUpdate(delta);
      for (const m of this.mobs) m.lookAt(this.player);
    }
  }

  Game.scenes.Dungeon = DungeonScene;
})();
