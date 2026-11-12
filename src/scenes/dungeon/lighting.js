// Fények és sötétség: színes derengés, fénykörök a sötét dungeonökben, pislákoló pontok.
// A DungeonScene ezeket a metódusokat a saját prototípusára veszi fel (this = a dungeon jelenet).
(function () {
  const TS = 16;
  const LIGHT_TEX = { warm: 'fx_light', amber: 'fx_light_amber', cyan: 'fx_light_cyan', pink: 'fx_light_pink', green: 'fx_light_green', white: 'fx_light_white', gold: 'fx_light_gold' };

  Game.dungeonParts = Game.dungeonParts || {};
  Game.dungeonParts.lighting = {
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
    },

    // Halvány, pislákoló pont (pl. kristályok a szakadék mélyén).
    addGlint(g) {
      const d = this.add.image(g[0] * TS + 8 + (g[3] || 0), g[1] * TS + 8 + (g[4] || 0), LIGHT_TEX[g[2]]).setBlendMode(Phaser.BlendModes.ADD).setDepth(90000).setScale(0.22).setAlpha(0.15);
      this.tweens.add({ targets: d, alpha: 0.75, duration: 1200 + Math.random() * 2200, yoyo: true, repeat: -1, delay: Math.random() * 2500, ease: 'Sine.easeInOut' });
    },

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
    },

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
    },
  };
})();
