// Hangulat-effektek: lebegő por, csillogás a kristályok körül, csöpögő víz.
// A DungeonScene ezeket a metódusokat a saját prototípusára veszi fel (this = a dungeon jelenet).
(function () {
  const TS = 16;
  const SPARK_TINT = { cyan: 0x9fe8ff, pink: 0xffa0f4, green: 0xa8ffc8, amber: 0xffd890, gold: 0xfff0b0, white: 0xffffff };

  Game.dungeonParts = Game.dungeonParts || {};
  Game.dungeonParts.ambience = {
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
    },
  };
})();
