// A világtérkép: helyszínek, automatikus mentés. A mozgás az ExploreScene-ben van.
(function () {
  // Helyszínek kezelése. Egy típus kezelője: (poi, scene) => { ... }
  // Amíg nincs kezelő (vagy a helyszín még nincs kész), a "még zárva" üzenet jelenik meg.
  Game.poi = {
    handlers: {
      dungeon(poi, scene) {
        if (!Game.data.dungeons[poi.id]) { Game.ui.toast('poi.locked'); return; }
        scene.saveNow();
        scene.leaveTo('Dungeon', { id: poi.id });
      },
    },
    enter(poi) {
      const handler = Game.poi.handlers[poi.type];
      const scene = Game.phaser.scene.getScene('World');
      if (handler) handler(poi, scene); else Game.ui.toast('poi.locked');
    },
  };

  class WorldScene extends Game.scenes.Explore {
    constructor() { super('World'); }

    create() {
      const map = this.map = Game.data.map;
      const ts = map.tileSize;
      this.grid = Game.world.Grid.fromOverworld(map);
      this.saveTimer = 0;
      this.dirty = false;

      this.paintGround();
      this.placeObjects();

      const st = Game.state.player;
      let tile = { x: Math.round(st.x), y: Math.round(st.y) };
      if (!this.grid.walkable(tile.x, tile.y)) tile = map.spawn;
      this.initExplore({ tile, dir: st.dir, width: map.width * ts, height: map.height * ts });

      // helyszínek: közelségi panel + kattintható épület
      map.pois.forEach(poi => {
        const c = this.grid.center(poi.x, poi.y);
        const type = Game.data.poiTypes[poi.type] || {};
        this.hotspots.push({
          x: c.x, y: c.y, radius: 14,
          prompt: {
            type: 'poi.type.' + poi.type, name: 'poi.' + poi.id + '.name', desc: 'poi.' + poi.id + '.desc',
            action: type.enterable ? { key: 'poi.enter', fn: () => Game.poi.enter(poi) } : null,
          },
        });
        const target = { spots: [{ x: poi.x, y: poi.y }] };
        this.grid.footprint(poi).forEach(([x, y]) => { this.grid.redirect[x + ',' + y] = target; });
      });

      if (Game.debug) this.drawDebug();
      Game.events.emit('scene', { key: 'World' });
      Game.events.emit('state');
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

    update(time, delta) {
      const moved = this.exploreUpdate(delta);
      // mentés megálláskor, illetve mozgás közben pár másodpercenként
      if (moved) { this.dirty = true; this.saveTimer += delta; }
      if (this.dirty && (!moved || this.saveTimer > 4000)) this.saveNow();
    }

    saveNow() {
      if (!this.player) return;
      const t = this.grid.tileOf(this.player.x, this.player.y), st = Game.state.player;
      st.x = t.x; st.y = t.y; st.dir = this.player.dir;
      this.dirty = false; this.saveTimer = 0;
      Game.save.persist();
    }
  }

  Game.scenes.World = WorldScene;
})();
