// Egy térkép rácsa: járhatóság, ütközés, útkeresés (EasyStar.js).
(function () {
  const HALF_W = 4, BOX_H = 5; // a karakter "lábnyoma" pixelben (a talppont körül)

  class Grid {
    // cells: 2D tömb, 0 = járható, 1 = fal
    constructor(cells, tileSize) {
      this.cells = cells;
      this.ts = tileSize;
      this.h = cells.length;
      this.w = cells[0].length;
      // Kattintható, de nem járható mezők: 'x,y' -> { spots: [{x,y}], onReach }
      this.redirect = {};
      this.rebuild();
    }

    // A világtérkép rácsa a map.js alapján.
    static fromOverworld(map) {
      const tiles = Game.data.tiles, objs = Game.data.objectTypes;
      const cells = [];
      for (let y = 0; y < map.height; y++) {
        const row = [];
        for (let x = 0; x < map.width; x++) {
          const t = tiles[map.legend.ground[map.ground[y][x]]];
          const o = objs[map.legend.objects[map.objects[y][x]]];
          row.push(!t || !t.walkable || (o && o.blocks) ? 1 : 0);
        }
        cells.push(row);
      }
      const grid = new Grid(cells, map.tileSize);
      map.pois.forEach(p => grid.footprint(p).forEach(([x, y]) => grid.block(x, y, true)));
      return grid;
    }

    // Az útkeresőt a cellák változása után frissíteni kell.
    rebuild() {
      this.easystar = new EasyStar.js();
      this.easystar.setGrid(this.cells);
      this.easystar.setAcceptableTiles([0]);
      this.easystar.enableDiagonals();
      this.easystar.disableCornerCutting();
      this.easystar.enableSync();
    }

    block(x, y, blocked) { if (this.inside(x, y)) this.cells[y][x] = blocked ? 1 : 0; }

    // Egy világtérképi épület lábnyoma (3 széles, 2 magas, az ajtó fölött).
    footprint(poi) {
      const out = [];
      for (let y = poi.y - 2; y <= poi.y - 1; y++) for (let x = poi.x - 1; x <= poi.x + 1; x++) out.push([x, y]);
      return out;
    }

    inside(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h; }
    walkable(x, y) { return this.inside(x, y) && this.cells[y][x] === 0; }

    toTile(px) { return Math.floor(px / this.ts); }
    // A mező "álló pontja": ide kerül a karakter talpa.
    center(tx, ty) { return { x: tx * this.ts + this.ts / 2, y: ty * this.ts + 12 }; }
    // A karakter mezője a talppontja alapján.
    tileOf(x, y) { return { x: this.toTile(x), y: this.toTile(y - 2) }; }

    // Ütközik-e a karakter lábnyoma, ha a talppontja (x, y)?
    boxBlocked(x, y) {
      const x0 = this.toTile(x - HALF_W), x1 = this.toTile(x + HALF_W - 0.01);
      const y0 = this.toTile(y - BOX_H), y1 = this.toTile(y - 0.01);
      for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (!this.walkable(tx, ty)) return true;
      return false;
    }

    // Útvonal mezőkben [{x,y}, ...] (a kezdőmezővel együtt), vagy null.
    findPath(sx, sy, tx, ty) {
      if (!this.walkable(sx, sy) || !this.walkable(tx, ty)) return null;
      if (sx === tx && sy === ty) return [{ x: sx, y: sy }];
      let result = null;
      this.easystar.findPath(sx, sy, tx, ty, p => { result = p; });
      this.easystar.calculate();
      return result && result.length ? result : null;
    }

    // A legközelebbi járható mező (ha valaki falra, vízre kattint).
    nearestWalkable(tx, ty, maxR) {
      if (this.walkable(tx, ty)) return { x: tx, y: ty };
      let best = null, bestD = Infinity;
      for (let r = 1; r <= (maxR || 6) && !best; r++) {
        for (let y = ty - r; y <= ty + r; y++) for (let x = tx - r; x <= tx + r; x++) {
          if (Math.max(Math.abs(x - tx), Math.abs(y - ty)) !== r || !this.walkable(x, y)) continue;
          const d = (x - tx) ** 2 + (y - ty) ** 2;
          if (d < bestD) { bestD = d; best = { x, y }; }
        }
      }
      return best;
    }
  }

  Game.world.Grid = Grid;
})();
