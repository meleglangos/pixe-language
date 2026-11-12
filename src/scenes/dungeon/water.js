// Víz: animált tócsák és tavak a dungeonökben.
// A DungeonScene ezeket a metódusokat a saját prototípusára veszi fel (this = a dungeon jelenet).
(function () {
  const TS = 16;
  Game.dungeonParts = Game.dungeonParts || {};
  Game.dungeonParts.water = {
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
    },

    addPuddle(p, index) {
      const w = p.w * TS, h = p.h * TS;
      const s = this.addWater('puddle_' + index, p.x * TS, p.y * TS, w, h, c => Game.gfx.ell(c, '#000', w / 2, h / 2, w / 2 - 1, h / 2 - 2), { alpha: 0.42 });
      s.setTint(0x7fb0c0);
    },

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
    },
  };
})();
