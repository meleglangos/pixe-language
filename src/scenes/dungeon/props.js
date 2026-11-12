// Berendezés a dungeonben: a dungeon_props.json tárgyainak kirajzolása és elhelyezése.
// A DungeonScene ezeket a metódusokat a saját prototípusára veszi fel (this = a dungeon jelenet).
(function () {
  const TS = 16;
  Game.dungeonParts = Game.dungeonParts || {};
  Game.dungeonParts.props = {
    // Kivágás (assets.js: frames) vagy önálló textúra rajzolása a talajra.
    drawArt(ctx, p, dx, dy) {
      if (p.texture) ctx.drawImage(this.textures.get(p.texture).getSourceImage(), dx, dy);
      else Game.gfx.drawFrame(this, ctx, p.frame, dx, dy);
    },
    artSize(p) {
      if (p.texture) { const s = this.textures.get(p.texture).getSourceImage(); return [s.width, s.height]; }
      if (p.strip) { const s = Game.data.assets.strips[p.strip]; return [s.frameWidth, s.frameHeight]; }
      const f = Game.data.assets.frames[p.frame];
      return [f[3], f[4]];
    },

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
    },
  };
})();
