// A világtérkép: mozgás (kattintás + billentyűk), kutya, helyszínek, automatikus mentés.
(function () {
  // Helyszínek kezelése. A későbbi szakaszok ide regisztrálnak:
  //   Game.poi.handlers.dungeon = (poi, scene) => { ... }
  Game.poi = {
    handlers: {},
    enter(poi) {
      const handler = Game.poi.handlers[poi.type];
      const scene = Game.phaser.scene.getScene('World');
      if (handler) handler(poi, scene); else Game.ui.toast('poi.locked');
    },
  };

  class WorldScene extends Phaser.Scene {
    constructor() { super('World'); }

    create() {
      const map = this.map = Game.data.map;
      const ts = map.tileSize;
      this.grid = new Game.world.Grid(map);
      this.path = null;
      this.nearPoi = null;
      this.saveTimer = 0;
      this.dirty = false;

      this.paintGround();
      this.placeObjects();

      // játékos + kutya
      const st = Game.state.player;
      let tile = { x: Math.round(st.x), y: Math.round(st.y) };
      if (!this.grid.walkable(tile.x, tile.y)) tile = map.spawn;
      const pos = this.grid.center(tile.x, tile.y);
      this.player = new Game.world.Character(this, 'player', pos.x, pos.y);
      this.player.face(st.dir);
      const side = [[-1, 0], [1, 0], [0, 1], [0, -1]].find(([i, j]) => this.grid.walkable(tile.x + i, tile.y + j)) || [0, 0];
      const petPos = this.grid.center(tile.x + side[0], tile.y + side[1]);
      this.pet = new Game.world.Pet(this, petPos.x, petPos.y);
      // kattintható terület a kutya körül (a konténer közepéhez képest eltolva)
      this.pet.container.setInteractive(new Phaser.Geom.Rectangle(-2, -8, 20, 20), Phaser.Geom.Rectangle.Contains);

      this.marker = this.add.image(0, 0, 'fx_marker').setDepth(1).setVisible(false);

      // kamera
      const cam = this.cameras.main;
      cam.setBounds(0, 0, map.width * ts, map.height * ts);
      cam.setRoundPixels(true);
      cam.startFollow(this.player.container, true);
      this.applyZoom();
      this.scale.on('resize', this.applyZoom, this);

      // bemenet
      this.keys = this.input.keyboard.addKeys('W,A,S,D,UP,LEFT,DOWN,RIGHT', false);
      this.input.on('pointerdown', this.onPointer, this);
      this.input.on('pointermove', p => { if (p.isDown && this.time.now - this.lastTap > 140) this.onPointer(p, []); });
      this.lastTap = 0;
      this.game.events.on('blur', this.resetKeys, this);

      if (Game.debug) this.drawDebug();

      this.events.once('shutdown', () => {
        this.scale.off('resize', this.applyZoom, this);
        this.game.events.off('blur', this.resetKeys, this);
        Game.ui.poiPrompt.hide();
      });
      Game.events.emit('state');
    }

    resetKeys() { this.input.keyboard.resetKeys(); }

    applyZoom() {
      const w = this.scale.width, h = this.scale.height;
      this.cameras.main.setZoom(Math.max(2, Math.round(Math.min(w, h) / 190)));
    }

    // A teljes talaj egyetlen textúrára rajzolva.
    paintGround() {
      const map = this.map, ts = map.tileSize, tiles = Game.data.tiles;
      if (this.textures.exists('ground')) this.textures.remove('ground');
      const tex = this.textures.createCanvas('ground', map.width * ts, map.height * ts);
      const ctx = tex.getContext();
      const typeAt = (x, y) => tiles[map.legend.ground[(map.ground[y] || '')[x]]] || tiles.water;
      for (let y = 0; y < map.height; y++) for (let x = 0; x < map.width; x++) {
        const t = typeAt(x, y);
        const v = t.variants > 1 ? '_' + ((x * 7 + y * 13 + ((x * y) % 5)) % t.variants) : '';
        ctx.drawImage(this.textures.get(t.texture + v).getSourceImage(), 0, 0, ts, ts, x * ts, y * ts, ts, ts);
      }
      Game.gfx.decorateGround(ctx, map, (x, y) => typeAt(x, y).group);
      tex.refresh();
      this.add.image(0, 0, 'ground').setOrigin(0, 0).setDepth(-10);
    }

    // Tereptárgyak és épületek; a mélységük (depth) az aljuk y-koordinátája.
    placeObjects() {
      const map = this.map, ts = map.tileSize, objs = Game.data.objectTypes;
      for (let y = 0; y < map.height; y++) for (let x = 0; x < map.width; x++) {
        const def = objs[map.legend.objects[map.objects[y][x]]];
        if (!def) continue;
        const py = y * ts + ts - 1;
        this.add.image(x * ts + ts / 2, py, def.texture).setOrigin(0.5, 1).setDepth(py);
      }
      map.pois.forEach(p => {
        const py = p.y * ts;
        this.add.image(p.x * ts + ts / 2, py, p.sprite).setOrigin(0.5, 1).setDepth(py);
      });
    }

    drawDebug() {
      const g = this.add.graphics().setDepth(99999), ts = this.map.tileSize;
      for (let y = 0; y < this.grid.h; y++) for (let x = 0; x < this.grid.w; x++) {
        g.fillStyle(this.grid.cells[y][x] ? 0xff0000 : 0x00ff00, 0.18).fillRect(x * ts + 1, y * ts + 1, ts - 2, ts - 2);
      }
      this.map.pois.forEach(p => g.fillStyle(0xffff00, 0.6).fillRect(p.x * ts + 4, p.y * ts + 4, 8, 8));
    }

    // ---------- kattintás / koppintás ----------
    onPointer(pointer, over) {
      if (Game.ui.isBlocking()) return;
      this.lastTap = this.time.now;
      if (over && over.indexOf(this.pet.container) >= 0) { this.petHeart(); return; }

      const g = this.grid;
      const wp = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      let tx = g.toTile(wp.x), ty = g.toTile(wp.y);
      const poi = g.poiAt[tx + ',' + ty];
      if (poi) { tx = poi.x; ty = poi.y; }
      const target = g.nearestWalkable(tx, ty);
      if (!target) return;
      this.walkTo(target.x, target.y);
    }

    walkTo(tx, ty) {
      const g = this.grid, here = g.tileOf(this.player.x, this.player.y);
      const tiles = g.findPath(here.x, here.y, tx, ty);
      if (!tiles) return false;
      const pts = tiles.map(t => g.center(t.x, t.y));
      if (pts.length > 1) pts.shift(); // a kezdőmező közepére nem kell visszalépni
      this.path = pts;
      const end = pts[pts.length - 1];
      this.marker.setPosition(end.x, end.y - 3).setVisible(true).setAlpha(1).setScale(1);
      this.tweens.killTweensOf(this.marker);
      this.tweens.add({ targets: this.marker, scale: 0.6, alpha: 0.55, duration: 380, yoyo: true, repeat: -1 });
      return true;
    }

    stopPath() { this.path = null; this.marker.setVisible(false); this.tweens.killTweensOf(this.marker); }

    petHeart() {
      const h = this.add.image(this.pet.x, this.pet.y - 14, 'fx_heart').setDepth(99998);
      this.tweens.add({ targets: h, y: h.y - 12, alpha: 0, duration: 900, ease: 'Sine.easeOut', onComplete: () => h.destroy() });
    }

    // ---------- képkockánként ----------
    update(time, delta) {
      const dt = Math.min(delta, 50) / 1000;
      const p = this.player, g = this.grid, speed = Game.data.config.player.speed;
      let moved = false;

      if (!Game.ui.isBlocking()) {
        const k = this.keys;
        const kx = (k.D.isDown || k.RIGHT.isDown ? 1 : 0) - (k.A.isDown || k.LEFT.isDown ? 1 : 0);
        const ky = (k.S.isDown || k.DOWN.isDown ? 1 : 0) - (k.W.isDown || k.UP.isDown ? 1 : 0);

        if (kx || ky) {
          if (this.path) this.stopPath();
          let x = p.x, y = p.y;
          if (g.boxBlocked(x, y)) { const t = g.tileOf(x, y), c = g.center(t.x, t.y); x = c.x; y = c.y; }
          const len = Math.hypot(kx, ky), dx = kx / len * speed * dt, dy = ky / len * speed * dt;
          if (dx && !g.boxBlocked(x + dx, y)) x += dx;
          if (dy && !g.boxBlocked(x, y + dy)) y += dy;
          moved = x !== p.x || y !== p.y;
          p.faceVector(kx, ky);
          p.setPosition(x, y);
        } else if (this.path) {
          let step = speed * dt, x = p.x, y = p.y;
          const sx = x, sy = y;
          while (step > 0 && this.path.length) {
            const t = this.path[0], d = Math.hypot(t.x - x, t.y - y);
            if (d <= step) { x = t.x; y = t.y; step -= d; this.path.shift(); }
            else { x += (t.x - x) / d * step; y += (t.y - y) / d * step; step = 0; }
          }
          p.faceVector(x - sx, y - sy);
          p.setPosition(x, y);
          moved = true;
          if (!this.path.length) this.stopPath();
        }
      }

      p.setMoving(moved);
      p.update();
      this.pet.follow(p, dt);
      this.pet.update();

      this.checkPois();
      this.autosave(moved, delta);
    }

    checkPois() {
      const p = this.player, g = this.grid;
      let near = null;
      for (const poi of this.map.pois) {
        const c = g.center(poi.x, poi.y);
        if (Math.hypot(c.x - p.x, c.y - p.y) < 14) { near = poi; break; }
      }
      if (near === this.nearPoi) return;
      this.nearPoi = near;
      if (near) Game.ui.poiPrompt.show(near); else Game.ui.poiPrompt.hide();
    }

    // Mentés megálláskor, illetve mozgás közben pár másodpercenként.
    autosave(moved, delta) {
      if (moved) { this.dirty = true; this.saveTimer += delta; }
      if (this.dirty && (!moved || this.saveTimer > 4000)) this.saveNow();
    }

    saveNow() {
      const t = this.grid.tileOf(this.player.x, this.player.y), st = Game.state.player;
      st.x = t.x; st.y = t.y; st.dir = this.player.dir;
      this.dirty = false; this.saveTimer = 0;
      Game.save.persist();
    }
  }

  Game.scenes.World = WorldScene;
})();
