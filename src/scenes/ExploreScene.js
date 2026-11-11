// Közös alap a bejárható jelenetekhez (világtérkép, dungeon):
// játékos + kutya, kattintásos és billentyűs mozgás, kamera, közelségi panelek.
//
// A leszármazott jelenet a create()-ben:
//   1. felépíti a rácsot (this.grid) és a látványt,
//   2. meghívja: this.initExplore({ tile: {x, y}, dir, width, height })
//   3. feltölti: this.hotspots  -- [{ x, y, radius, prompt }]  (pixelben; a prompt a ui.prompt.show paramétere)
//               this.grid.redirect['x,y'] = { spots: [{x,y}], onReach() }  (kattintható, nem járható mezők)
// és az update()-ben meghívja: this.exploreUpdate(delta)
(function () {
  class ExploreScene extends Phaser.Scene {
    initExplore(opts) {
      const g = this.grid;
      this.path = null;
      this.pending = null;      // kattintott célpont, amihez épp odasétálunk
      this.hotspots = [];
      this.nearSpot = null;
      this.lastTap = 0;

      let tile = opts.tile;
      if (!g.walkable(tile.x, tile.y)) tile = g.nearestWalkable(tile.x, tile.y, 12) || tile;
      const pos = g.center(tile.x, tile.y);
      this.player = new Game.world.Character(this, 'player', pos.x, pos.y);
      this.player.face(opts.dir || 'down');
      const side = [[-1, 0], [1, 0], [0, 1], [0, -1]].find(([i, j]) => g.walkable(tile.x + i, tile.y + j)) || [0, 0];
      const petPos = g.center(tile.x + side[0], tile.y + side[1]);
      this.pet = new Game.world.Pet(this, petPos.x, petPos.y);
      // kattintható terület a kutya körül (a konténer közepéhez képest eltolva)
      this.pet.container.setInteractive(new Phaser.Geom.Rectangle(-2, -8, 20, 20), Phaser.Geom.Rectangle.Contains);

      this.marker = this.add.image(0, 0, 'fx_marker').setDepth(1).setVisible(false);

      const cam = this.cameras.main;
      cam.setBounds(0, 0, opts.width, opts.height);
      cam.setRoundPixels(true);
      cam.startFollow(this.player.container, true);
      this.applyZoom();
      this.scale.on('resize', this.applyZoom, this);

      this.keys = this.input.keyboard.addKeys('W,A,S,D,UP,LEFT,DOWN,RIGHT', false);
      this.input.on('pointerdown', this.onPointer, this);
      this.input.on('pointermove', p => { if (p.isDown && this.time.now - this.lastTap > 140) this.onPointer(p, []); });
      this.game.events.on('blur', this.resetKeys, this);

      this.events.once('shutdown', () => {
        this.scale.off('resize', this.applyZoom, this);
        this.game.events.off('blur', this.resetKeys, this);
        Game.ui.prompt.hide();
      });
      cam.fadeIn(220, 0, 0, 0);
    }

    resetKeys() { this.input.keyboard.resetKeys(); }

    // Egész számú nagyítás, hogy a pixel art éles maradjon.
    applyZoom() {
      const w = this.scale.width, h = this.scale.height;
      this.cameras.main.setZoom(Math.max(2, Math.round(Math.min(w, h) / 190)));
    }

    // Átváltás másik jelenetre rövid elsötétítéssel.
    leaveTo(sceneKey, data) {
      if (this.leaving) return;
      this.leaving = true;
      this.stopPath();
      this.cameras.main.fadeOut(200, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => { this.leaving = false; this.scene.start(sceneKey, data); });
    }

    drawDebug() {
      const g = this.add.graphics().setDepth(99999), ts = this.grid.ts;
      for (let y = 0; y < this.grid.h; y++) for (let x = 0; x < this.grid.w; x++) {
        g.fillStyle(this.grid.cells[y][x] ? 0xff0000 : 0x00ff00, 0.18).fillRect(x * ts + 1, y * ts + 1, ts - 2, ts - 2);
      }
      Object.keys(this.grid.redirect).forEach(k => {
        const [x, y] = k.split(',').map(Number);
        g.fillStyle(0xffff00, 0.5).fillRect(x * ts + 4, y * ts + 4, 8, 8);
      });
    }

    // ---------- kattintás / koppintás ----------
    onPointer(pointer, over) {
      if (Game.ui.isBlocking() || this.leaving) return;
      this.lastTap = this.time.now;
      if (over && over.indexOf(this.pet.container) >= 0) { this.petHeart(); return; }

      const g = this.grid;
      const wp = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      const tx = g.toTile(wp.x), ty = g.toTile(wp.y);
      const target = g.redirect[tx + ',' + ty];
      if (target) { this.walkToTarget(target); return; }
      const tile = g.nearestWalkable(tx, ty);
      if (tile) { this.pending = null; this.walkTo(tile.x, tile.y); }
    }

    // Odasétál egy célpont legközelebbi megközelítési pontjához; megérkezéskor onReach().
    walkToTarget(target) {
      const g = this.grid, here = g.tileOf(this.player.x, this.player.y);
      let best = null;
      for (const s of target.spots) {
        const p = g.findPath(here.x, here.y, s.x, s.y);
        if (p && (!best || p.length < best.len)) best = { s, len: p.length };
      }
      if (!best) return;
      this.pending = target;
      this.walkTo(best.s.x, best.s.y);
      if (best.len <= 1 && !this.path) this.arrive();
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

    stopPath() {
      this.path = null;
      if (this.marker) { this.marker.setVisible(false); this.tweens.killTweensOf(this.marker); }
    }

    arrive() {
      this.stopPath();
      const t = this.pending;
      this.pending = null;
      if (t) {
        if (t.face) this.player.faceVector(t.face.x - this.player.x, t.face.y - this.player.y);
        if (t.onReach) t.onReach();
      }
    }

    petHeart() {
      const h = this.add.image(this.pet.x, this.pet.y - 14, 'fx_heart').setDepth(99998);
      this.tweens.add({ targets: h, y: h.y - 12, alpha: 0, duration: 900, ease: 'Sine.easeOut', onComplete: () => h.destroy() });
    }

    // ---------- képkockánként; visszatér: mozgott-e a játékos ----------
    exploreUpdate(delta) {
      const dt = Math.min(delta, 50) / 1000;
      const p = this.player, g = this.grid, speed = Game.data.config.player.speed;
      let moved = false;

      if (!Game.ui.isBlocking() && !this.leaving) {
        const k = this.keys;
        const kx = (k.D.isDown || k.RIGHT.isDown ? 1 : 0) - (k.A.isDown || k.LEFT.isDown ? 1 : 0);
        const ky = (k.S.isDown || k.DOWN.isDown ? 1 : 0) - (k.W.isDown || k.UP.isDown ? 1 : 0);

        if (kx || ky) {
          if (this.path) this.stopPath();
          this.pending = null;
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
          if (!this.path.length) this.arrive();
        }
      }

      p.setMoving(moved);
      p.update();
      this.pet.follow(p, dt);
      this.pet.update();
      this.checkHotspots();
      return moved;
    }

    // A legközelebbi "hotspot" panelje jelenik meg alul, ha a játékos elég közel van.
    checkHotspots() {
      const p = this.player;
      let near = null, best = Infinity;
      for (const h of this.hotspots) {
        const d = Math.hypot(h.x - p.x, h.y - p.y);
        if (d < h.radius && d < best) { best = d; near = h; }
      }
      if (near === this.nearSpot) return;
      this.nearSpot = near;
      if (near) Game.ui.prompt.show(near.prompt); else Game.ui.prompt.hide();
    }

    // Az aktuális hotspot paneljének újrarajzolása (ha megváltozott a tartalma).
    refreshPrompt() { this.nearSpot = null; }
  }

  Game.scenes.Explore = ExploreScene;
})();
