// Közös dungeon jelenet. Mindent a dungeons.js leírásából épít fel:
// pálya, berendezés, ajtók, szörnyek, láda, kijárat, fények, hangulat-effektek.
// A kinézetet a téma adja (src/world/dungeonThemes.js). A mozgás az ExploreScene-ben van.
(function () {
  const TS = 16;
  const LIGHT_TEX = { warm: 'fx_light', amber: 'fx_light_amber', cyan: 'fx_light_cyan', pink: 'fx_light_pink', green: 'fx_light_green', white: 'fx_light_white', gold: 'fx_light_gold' };
  const SPARK_TINT = { cyan: 0x9fe8ff, pink: 0xffa0f4, green: 0xa8ffc8, amber: 0xffd890, gold: 0xfff0b0, white: 0xffffff };

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
      const rec = Game.state.dungeons[this.dungeonId] || (Game.state.dungeons[this.dungeonId] = { visits: 0, clears: 0 });
      rec.visits++;
      Game.save.persist();

      if (Game.debug) this.drawDebug();
      Game.events.emit('scene', { key: 'Dungeon', name: def.name, exit: () => this.exitDungeon() });
      this.events.once('shutdown', () => Game.events.emit('scene', { key: null }));
    }

    exitDungeon() { this.leaveTo('World'); }

    // Kivágás (assets.js: frames) vagy önálló textúra rajzolása a talajra.
    drawArt(ctx, p, dx, dy) {
      if (p.texture) ctx.drawImage(this.textures.get(p.texture).getSourceImage(), dx, dy);
      else Game.gfx.drawFrame(this, ctx, p.frame, dx, dy);
    }
    artSize(p) {
      if (p.texture) { const s = this.textures.get(p.texture).getSourceImage(); return [s.width, s.height]; }
      if (p.strip) { const s = Game.data.assets.strips[p.strip]; return [s.frameWidth, s.frameHeight]; }
      const f = Game.data.assets.frames[p.frame];
      return [f[3], f[4]];
    }

    // ---------- berendezés ----------
    placeProp(ctx, name, x, y) {
      const p = Game.data.dungeonProps[name];
      if (!p) { console.warn('Ismeretlen berendezés:', name); return; }
      const [w, h] = this.artSize(p);
      if (p.blocks) for (let i = -(p.blocksLeft || 0); i <= (p.blocksRight || 0); i++) this.grid.block(x + i, y, true);
      (p.ground || []).forEach(g => Game.gfx.drawFrame(this, ctx, g[0], (x + g[1]) * TS, (y + g[2]) * TS));

      const cx = x * TS + TS / 2 + (p.dx || 0);
      let bottom; // a tárgy alja pixelben: ehhez igazodnak a részek és a fény
      if (p.kind === 'decal') {
        const aligned = w % TS === 0 && h % TS === 0;
        ctx.save();
        ctx.globalAlpha = p.alpha || 1;
        if (p.clip) { // csak falra és padlóra kerüljön, a sötétségbe ne lógjon ki
          ctx.beginPath();
          for (let j = 0; j < h / TS; j++) for (let i = 0; i < w / TS; i++) {
            if ([0, 1, 2, 3].some(k => this.isFloor(x + i, y + j + k))) ctx.rect((x + i) * TS, (y + j) * TS, TS, TS);
          }
          ctx.clip();
        }
        bottom = aligned ? y * TS + h : y * TS + TS - 2 - (p.dy || 0);
        this.drawArt(ctx, p, aligned ? x * TS : Math.round(cx - w / 2), bottom - h);
        ctx.restore();
      } else if (p.kind === 'wall') {
        bottom = y * TS + TS - (p.dy === undefined ? 4 : p.dy);
        this.drawArt(ctx, p, Math.round(cx - w / 2), bottom - h);
      } else { // 'object'
        bottom = y * TS + TS - 2 - (p.dy || 0);
        const depth = y * TS + TS - 2;
        let obj;
        if (p.strip) obj = this.add.sprite(cx, bottom, p.strip).play({ key: Game.gfx.stripAnim(this, p.strip), startFrame: (x + y) % 4 });
        else if (p.texture) obj = this.add.image(cx, bottom, p.texture);
        else obj = this.add.image(cx, bottom, Game.data.assets.frames[p.frame][0], p.frame);
        obj.setOrigin(p.originX === undefined ? 0.5 : p.originX, 1).setDepth(depth);
        if (p.shadow !== false) { ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(x * TS + 2, depth - 2, TS - 4, 3); }
      }

      // animált részek (pl. láng a tartó fölött)
      (p.parts || []).forEach(part => {
        this.add.sprite(cx + (part.dx || 0), bottom + (part.dy || 0), part.strip)
          .setOrigin(0.5, part.originY === undefined ? 1 : part.originY)
          .setDepth(p.kind === 'object' ? y * TS + TS - 1.5 : 2)
          .play({ key: Game.gfx.stripAnim(this, part.strip), startFrame: (x + y) % 4 });
      });
      if (p.light) this.addLight(cx + (p.light.dx || 0), bottom + (p.light.dy || 0), p.light);
      if (p.sparkle) (this.sparkles[p.sparkle] = this.sparkles[p.sparkle] || []).push({ x: cx, y: bottom - h / 2, r: Math.max(w, h) / 2 + 3 });
    }

    // Fény: színes derengés (ADD) + ha a dungeon sötét, egy fénykör a sötétségben.
    // cfg: { color, scale, mode: 'flicker' | 'pulse' | 'steady', hole: sugár pixelben }
    addLight(x, y, cfg) {
      const scale = cfg.scale || 1;
      const l = this.add.image(x, y, LIGHT_TEX[cfg.color] || 'fx_light').setBlendMode(Phaser.BlendModes.ADD).setDepth(90000).setScale(scale).setAlpha(0.8);
      const hole = cfg.hole ? { x, y, r: cfg.hole, k: 1 } : null;
      if (hole) this.holes.push(hole);
      if (cfg.mode === 'pulse') {
        this.tweens.add({ targets: l, alpha: 0.5, scale: scale * 0.9, duration: 1400 + Math.random() * 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: Math.random() * 1200,
          onUpdate: hole ? () => { hole.k = 0.9 + (l.alpha - 0.5) / 3; } : undefined });
      } else if (cfg.mode !== 'steady') {
        const flicker = () => {
          this.tweens.add({ targets: l, alpha: 0.55 + Math.random() * 0.4, scale: scale * (0.92 + Math.random() * 0.16), duration: 90 + Math.random() * 220,
            onComplete: () => { if (hole) hole.k = 0.94 + Math.random() * 0.1; flicker(); } });
        };
        flicker();
      }
      return l;
    }

    // Halvány, pislákoló pont (pl. kristályok a szakadék mélyén).
    addGlint(g) {
      const d = this.add.image(g[0] * TS + 8 + (g[3] || 0), g[1] * TS + 8 + (g[4] || 0), LIGHT_TEX[g[2]]).setBlendMode(Phaser.BlendModes.ADD).setDepth(90000).setScale(0.22).setAlpha(0.15);
      this.tweens.add({ targets: d, alpha: 0.75, duration: 1200 + Math.random() * 2200, yoyo: true, repeat: -1, delay: Math.random() * 2500, ease: 'Sine.easeInOut' });
    }

    // ---------- víz ----------
    // A csomag 4 képkockás vízanimációja egy maszkkal kivágva. mask(ctx): az alakzat kirajzolása.
    addWater(key, x, y, w, h, mask, opts) {
      const m = document.createElement('canvas');
      m.width = w; m.height = h;
      mask(m.getContext('2d'));
      const frames = [];
      for (let k = 0; k < 4; k++) {
        const fk = key + '_' + k;
        if (this.textures.exists(fk)) this.textures.remove(fk);
        const tex = this.textures.createCanvas(fk, w, h), c = tex.getContext();
        for (let j = 0; j < h; j += 48) for (let i = 0; i < w; i += 48) Game.gfx.drawFrame(this, c, 'water_' + k, i, j);
        if (opts.shade) { c.globalCompositeOperation = 'multiply'; c.fillStyle = opts.shade; c.fillRect(0, 0, w, h); }
        c.globalCompositeOperation = 'destination-in';
        c.drawImage(m, 0, 0);
        c.globalCompositeOperation = 'source-over';
        tex.refresh();
        frames.push({ key: fk });
      }
      if (this.anims.exists(key)) this.anims.remove(key);
      this.anims.create({ key, frames, frameRate: opts.frameRate || 3, repeat: -1 });
      return this.add.sprite(x, y, frames[0].key).setOrigin(0, 0).setDepth(-5).setAlpha(opts.alpha).play(key);
    }

    addPuddle(p, index) {
      const w = p.w * TS, h = p.h * TS;
      const s = this.addWater('puddle_' + index, p.x * TS, p.y * TS, w, h, c => Game.gfx.ell(c, '#000', w / 2, h / 2, w / 2 - 1, h / 2 - 2), { alpha: 0.42 });
      s.setTint(0x7fb0c0);
    }

    // Tavak: a pálya '~' mezőiből, lekerekített partvonallal.
    addLakes() {
      const L = this.L, wet = (x, y) => L.at(x, y) === '~';
      let x0 = Infinity, y0 = Infinity, x1 = -1, y1 = -1;
      for (let y = 0; y < L.H; y++) for (let x = 0; x < L.W; x++) if (wet(x, y)) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
      if (x1 < 0) return;
      const w = (x1 - x0 + 1) * TS, h = (y1 - y0 + 1) * TS;
      const cut = [[0, 0, 5, 1], [0, 1, 3, 1], [0, 2, 2, 1], [0, 3, 1, 2]]; // lépcsős sarok
      this.addWater('lake', x0 * TS, y0 * TS, w, h, c => {
        for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
          if (!wet(x, y)) continue;
          const px = (x - x0) * TS, py = (y - y0) * TS;
          c.fillRect(px, py, TS, TS);
          [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([i, j]) => {
            if (wet(x + i, y) || wet(x, y + j)) return;
            cut.forEach(([a, b, cw, ch]) => c.clearRect(i < 0 ? px + a : px + TS - a - cw, j < 0 ? py + b : py + TS - b - ch, cw, ch));
          });
        }
      }, { alpha: 0.9, shade: '#4f9aa8', frameRate: 4 });
    }

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

    // ---------- sötétség ----------
    // Egy pálya méretű sötét réteg, amibe minden képkockában "lyukat" vágunk a fényeknél
    // (csak a képernyőn látszóknál), így a kristályok és lámpák tényleg bevilágítják a környezetüket.
    setupDarkness() {
      const d = this.def.darkness;
      if (!d) return;
      this.dark = this.add.renderTexture(0, 0, this.L.W * TS, this.L.H * TS).setOrigin(0, 0).setDepth(80000);
      this.darkCfg = d;
      this.stamp = this.make.image({ key: 'fx_hole', add: false });
      this.playerHole = { x: 0, y: 0, r: d.playerLight || 48, k: 1 };
    }

    updateDarkness() {
      const rt = this.dark, v = this.cameras.main.worldView, d = this.darkCfg;
      rt.clear();
      rt.fill(d.color, d.alpha);
      this.playerHole.x = this.player.x; this.playerHole.y = this.player.y - 10;
      const cut = h => {
        const r = h.r * h.k;
        if (h.x + r < v.x || h.x - r > v.right || h.y + r < v.y || h.y - r > v.bottom) return;
        this.stamp.setScale(r / 64);
        rt.erase(this.stamp, h.x, h.y);
      };
      this.holes.forEach(cut);
      cut(this.playerHole);
    }

    // ---------- hangulat: lebegő por, csillogás, csöpögő víz ----------
    setupAmbience() {
      const a = this.def.ambience || {};
      const cam = this.cameras.main;
      if (a.dust) {
        // a por a látható részen születik, így kevés részecske is elég
        const source = { getRandomPoint: p => { const v = cam.worldView; p.x = v.x + Math.random() * v.width; p.y = v.y + Math.random() * v.height; return p; } };
        this.add.particles(0, 0, 'fx_dot', {
          emitZone: { type: 'random', source }, lifespan: 5200, frequency: 190, quantity: 1, maxAliveParticles: 30,
          speedX: { min: -4, max: 4 }, speedY: { min: -7, max: -2 }, scale: { min: 0.5, max: 1 },
          alpha: { onUpdate: (p, k, t) => Math.sin(t * Math.PI) * 0.45 }, tint: a.dust === true ? 0xcfe6ff : a.dust,
          blendMode: 'ADD',
        }).setDepth(90001);
      }
      // csillogás a kristályok körül: színenként egy közös részecske-forrás
      Object.keys(this.sparkles).forEach(color => {
        const pts = this.sparkles[color];
        if (!pts.length) return;
        const source = { getRandomPoint: p => {
          const list = this.sparkles[color], v = cam.worldView;
          for (let i = 0; i < 6; i++) { // lehetőleg a képernyőn lévő kristályt válasszon
            const s = list[Math.floor(Math.random() * list.length)];
            if (!s) break;
            p.x = s.x + (Math.random() * 2 - 1) * s.r; p.y = s.y + (Math.random() * 2 - 1) * s.r;
            if (v.contains(p.x, p.y)) return p;
          }
          p.x = -100; p.y = -100; return p;
        } };
        this.add.particles(0, 0, 'fx_spark', {
          emitZone: { type: 'random', source }, lifespan: 900, frequency: Math.max(110, 520 / Math.sqrt(pts.length)), quantity: 1, maxAliveParticles: 14,
          speedY: { min: -9, max: -3 }, scale: { start: 1, end: 0.2 }, rotate: { min: 0, max: 90 },
          alpha: { onUpdate: (p, k, t) => Math.sin(t * Math.PI) }, tint: SPARK_TINT[color] || 0xffffff, blendMode: 'ADD',
        }).setDepth(90001);
      });
      // csöpögő víz: egy csepp leesik, a becsapódásnál kis gyűrű
      (a.drips || []).forEach(([x, y], i) => {
        const px = x * TS + 8, py = y * TS + 8;
        const drop = this.add.rectangle(px, py, 1, 3, 0xbfe9ff, 0.9).setDepth(90001).setVisible(false);
        const ring = this.add.ellipse(px, py, 4, 2).setStrokeStyle(1, 0xbfe9ff, 0.9).setDepth(90001).setVisible(false);
        const fall = () => {
          if (!cam.worldView.contains(px, py)) { this.time.delayedCall(1500, fall); return; }
          drop.setPosition(px, py - 46).setVisible(true).setAlpha(0.9);
          this.tweens.add({ targets: drop, y: py, duration: 420, ease: 'Quad.easeIn', onComplete: () => {
            drop.setVisible(false);
            ring.setVisible(true).setScale(1).setAlpha(0.9);
            this.tweens.add({ targets: ring, scaleX: 4, scaleY: 3, alpha: 0, duration: 650, onComplete: () => ring.setVisible(false) });
            this.time.delayedCall(1800 + Math.random() * 3200, fall);
          } });
        };
        this.time.delayedCall(600 + i * 900, fall);
      });
    }

    update(time, delta) {
      this.exploreUpdate(delta);
      for (const m of this.mobs) m.lookAt(this.player);
      if (this.dark) this.updateDarkness();
    }
  }

  Game.scenes.Dungeon = DungeonScene;
})();
