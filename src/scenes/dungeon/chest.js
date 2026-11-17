// A dungeon ládája: (ha a config így kéri) zárva, amíg él szörny. "Öffnen"-re a láda-ablak nyílik meg
// (src/ui/chestWindow.js: csillagok, kinyílás, kieső loot, lista); utána a pályán is kinyílik és üres marad.
// A zsákmány a loot táblából jön (Game.loot), és most még nem tárolódik
// (spec: docs/features/chest_opening.md, docs/features/chest_stars.md).
//
// A láda kinézete adatból jön: data/chest_styles.json (a dungeon "chestStyle" mezője, alapból config.loot.chestStyle).
//   képkockás: { closed: kivágás-név, open: kivágás-név }              (src/config/assets.js: frames)
//   animált:   { strip: csík-kulcs, closedFrame, openFrames: [..], fps } (src/config/assets.js: strips)
// A DungeonScene ezeket a metódusokat a saját prototípusára veszi fel (this = a dungeon jelenet).
(function () {
  const TS = 16;

  Game.dungeonParts = Game.dungeonParts || {};
  Game.dungeonParts.chest = {
    // ---------- láda (2 mezőt foglal: x és x+1) ----------
    addChest(ch) {
      const cx = (ch.x + 1) * TS, py = ch.y * TS + TS - 2;
      const style = Game.data.chestStyles[this.def.chestStyle || Game.data.config.loot.chestStyle];
      const sprite = style.strip
        ? this.add.sprite(cx, py, style.strip, style.closedFrame || 0)
        : this.add.image(cx, py, Game.data.assets.frames[style.closed][0], style.closed);
      this.chest = { opened: false, busy: false, style, sprite: sprite.setOrigin(0.5, 1).setDepth(py), x: cx, y: py };
      this.chest.light = this.addLight(cx, py - 6, { color: 'gold', scale: 0.9, hole: this.def.darkness ? 26 : 0 });
      (this.sparkles.gold = this.sparkles.gold || []).push({ x: cx, y: py - 8, r: 12 });
      this.grid.block(ch.x, ch.y, true); this.grid.block(ch.x + 1, ch.y, true);
      const target = { spots: [{ x: ch.x, y: ch.y + 1 }, { x: ch.x + 1, y: ch.y + 1 }], face: { x: cx, y: py - 20 }, onReach: () => this.openChest() };
      [[0, 0], [1, 0], [0, -1], [1, -1]].forEach(([i, j]) => { this.grid.redirect[(ch.x + i) + ',' + (ch.y + j)] = target; });
      this.chest.spot = { x: cx, y: (ch.y + 1) * TS + 10, radius: 22, prompt: null };
      this.chestPrompt();
      this.pendingSpots.push(this.chest.spot);
    },

    // zárva, amíg él szörny -- csak ha a config.loot.lockChestUntilCleared be van kapcsolva
    chestLocked() { return !!Game.data.config.loot.lockChestUntilCleared && (this.mobs || []).some(m => !m.defeated); },

    // a panel szövege az állapottól függ: zárva / nyitható / üres (a DungeonScene a szörnyek legyőzése után is hívja)
    chestPrompt() {
      if (!this.chest) return;
      const o = this.chest.opened, locked = !o && this.chestLocked();
      this.chest.spot.prompt = {
        type: 'chest.type', name: 'chest.name', desc: o ? 'chest.emptyDesc' : locked ? 'chest.lockedDesc' : 'chest.desc',
        action: o ? null : { key: 'chest.open', fn: () => this.openChest() },
      };
      this.refreshPrompt();
    },

    // "Öffnen": a láda-ablak (src/ui/chestWindow.js) nyílik meg csillagokkal és a kieső lootal;
    // amikor bezárul, a pályán is kinyílik a láda (por, csillogás), és üres marad.
    openChest() {
      const ch = this.chest;
      if (ch.opened || ch.busy) return;
      if (this.chestLocked()) { this.chestRattle(); Game.ui.toast('chest.locked'); return; }
      ch.busy = true;
      this.stopPath();
      Game.chestWindow.open({
        style: ch.style,
        table: this.def.lootTable,
        onDone: () => this.chestOpenInWorld(),
      });
    },

    // zárt láda: kis zörgés
    chestRattle() {
      const s = this.chest.sprite, x0 = s.x;
      this.tweens.add({ targets: s, x: { from: x0 - 1, to: x0 + 1 }, duration: 40, yoyo: true, repeat: 1, onComplete: () => { s.x = x0; } });
    },

    // a pályán a fedél felpattan (képkocka-csere vagy animáció), por és csillogás; a láda üres marad
    chestOpenInWorld() {
      const ch = this.chest, s = ch.sprite, st = ch.style;
      ch.opened = true; ch.busy = false;
      this.chestPrompt();
      const opened = () => {
        for (let i = 0; i < 8; i++) {
          const d = this.add.rectangle(s.x + (i - 3.5) * 3, s.y - 14, 2, 2, i % 2 ? 0xffe28a : 0xd8d0b0, 0.95).setDepth(90002);
          this.tweens.add({ targets: d, y: d.y - 10 - Math.random() * 10, x: d.x + (i - 3.5) * 2.5, alpha: 0, duration: 500 + Math.random() * 300, onComplete: () => d.destroy() });
        }
        this.tweens.killTweensOf(ch.light);
        this.tweens.add({ targets: ch.light, alpha: 0.25, scale: 0.9, duration: 900 });
        this.sparkles.gold = [];
      };
      if (st.strip) {
        const key = 'chest_open_' + st.id;
        if (!this.anims.exists(key)) this.anims.create({ key, frames: st.openFrames.map(f => ({ key: st.strip, frame: f })), frameRate: st.fps || 12 });
        s.play(key);
        s.once('animationcomplete', opened);
      } else {
        this.tweens.add({
          targets: s, scaleY: 0.82, scaleX: 1.1, duration: 90, yoyo: true,
          onYoyo: () => s.setFrame(st.open),
          onComplete: () => { s.setScale(1); opened(); },
        });
      }
    },
  };
})();
