// A dungeon ládája: (ha a config így kéri) zárva, amíg él szörny; nyitáskor remeg, kinyílik, és a loot ívben kirepül belőle,
// majd a "Beute" ablak (src/ui/loot.js) listázza. A zsákmány a loot táblából jön (Game.loot.roll), és most
// még nem tárolódik (spec: docs/features/chest_opening.md).
//
// A láda kinézete adatból jön: data/chest_styles.json (a dungeon "chestStyle" mezője, alapból config.loot.chestStyle).
//   képkockás: { closed: kivágás-név, open: kivágás-név }              (src/config/assets.js: frames)
//   animált:   { strip: csík-kulcs, closedFrame, openFrames: [..], fps } (src/config/assets.js: strips)
// A DungeonScene ezeket a metódusokat a saját prototípusára veszi fel (this = a dungeon jelenet).
(function () {
  const TS = 16;
  // hová esnek a tárgyak a láda aljához képest (pixel): felváltva balra és jobbra, egyre távolabb
  const SLOTS = [[-17, 2], [17, 2], [-29, 6], [29, 6], [-23, 15], [23, 15]];

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

    openChest() {
      const ch = this.chest;
      if (ch.opened || ch.busy) return;
      if (this.chestLocked()) { this.chestRattle(); Game.ui.toast('chest.locked'); return; }
      ch.busy = true;
      this.stopPath();
      const s = ch.sprite, x0 = s.x;
      // 1. kétszeri remegés
      this.tweens.add({
        targets: s, x: { from: x0 - 1, to: x0 + 1 }, duration: 55, yoyo: true, repeat: 3, ease: 'Sine.easeInOut',
        onComplete: () => { s.x = x0; this.chestPop(); },
      });
      this.tweens.killTweensOf(ch.light);
      this.tweens.add({ targets: ch.light, alpha: 1, scale: 1.3, duration: 400 });
    },

    // zárt láda: kis zörgés
    chestRattle() {
      const s = this.chest.sprite, x0 = s.x;
      this.tweens.add({ targets: s, x: { from: x0 - 1, to: x0 + 1 }, duration: 40, yoyo: true, repeat: 1, onComplete: () => { s.x = x0; } });
    },

    // 2. a fedél felpattan (képkocka-csere vagy animáció), por és csillogás
    chestPop() {
      const ch = this.chest, s = ch.sprite, st = ch.style;
      const opened = () => {
        for (let i = 0; i < 8; i++) {
          const d = this.add.rectangle(s.x + (i - 3.5) * 3, s.y - 14, 2, 2, i % 2 ? 0xffe28a : 0xd8d0b0, 0.95).setDepth(90002);
          this.tweens.add({ targets: d, y: d.y - 10 - Math.random() * 10, x: d.x + (i - 3.5) * 2.5, alpha: 0, duration: 500 + Math.random() * 300, onComplete: () => d.destroy() });
        }
        this.tweens.add({ targets: ch.light, alpha: 0.3, scale: 0.9, duration: 900, delay: 300 });
        this.sparkles.gold = [];
        this.chestLoot();
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

    // 3. a loot ívben kirepül, földet ér, pattan, és ritkaság-színű fényben lebeg; utána a "Beute" ablak
    chestLoot() {
      const ch = this.chest;
      const loot = Game.loot.roll(this.def.lootTable);
      const n = loot.length;
      const icons = [];
      loot.forEach((e, i) => {
        const item = e.item && Game.data.items[e.item];
        const icon = Game.itemIcons.parse(item ? item.icon : Game.data.config.loot.goldIcon);
        const rarity = item && Game.data.config.rarities.find(r => r.id === item.rarity);
        const color = rarity ? parseInt(rarity.color.slice(1), 16) : 0xffd75a;
        // a láda két oldalára esnek legyezőben (a láda előtt a játékos áll, ott takarná)
        const slot = SLOTS[i % SLOTS.length];
        const tx = ch.x + slot[0], ty = ch.y + slot[1];
        const img = (icon.sheet ? this.add.image(ch.x, ch.y - 12, icon.key, icon.frame) : this.add.image(ch.x, ch.y - 12, icon.key)).setDepth(90003).setScale(0.3);
        const glow = this.add.image(tx, ty + 1, 'fx_light_white').setBlendMode(Phaser.BlendModes.ADD).setTint(color).setScale(0.05).setAlpha(0).setDepth(90002);
        icons.push(img, glow);
        const fly = { t: 0 }, sx = img.x, sy = img.y, h = 22 + Math.random() * 8;
        this.tweens.add({
          targets: fly, t: 1, duration: 520, delay: 160 * i, ease: 'Sine.easeIn',
          onStart: () => this.tweens.add({ targets: img, scale: 1, duration: 260 }),
          onUpdate: () => { img.x = sx + (tx - sx) * fly.t; img.y = sy + (ty - sy) * fly.t - Math.sin(fly.t * Math.PI) * h; },
          onComplete: () => {
            this.tweens.add({ targets: img, y: ty - 4, duration: 120, yoyo: true, ease: 'Quad.easeOut',
              onComplete: () => this.tweens.add({ targets: img, y: ty - 2, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }) });
            this.tweens.add({ targets: glow, alpha: 0.8, scale: 0.35, duration: 300 });
          },
        });
      });
      // 4. ha minden földet ért: "Beute" ablak; az OK-ra az ikonok a játékoshoz repülnek
      this.time.delayedCall(160 * n + 520 + 1000, () => {
        Game.lootUI.show(loot, () => {
          icons.forEach(o => {
            this.tweens.killTweensOf(o);
            this.tweens.add({ targets: o, x: this.player.x, y: this.player.y - 10, alpha: 0, scale: 0.3, duration: 380, ease: 'Quad.easeIn', onComplete: () => o.destroy() });
          });
        });
        ch.opened = true; ch.busy = false;
        this.chestPrompt();
      });
    },
  };
})();
