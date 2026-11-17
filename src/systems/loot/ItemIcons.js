// Tárgy-ikonok (Game.itemIcons): az items.json "icon" mezőjéből a kép helye.
//   "it:901"            -> Items16: assets/items/item901.png (egy ikon egy fájl)
//   "wp:bronze c3 r5"   -> Weapon Icons: a bronz lap 3. oszlopa, 5. sora (16×16-os rács)
// Ugyanezt használja a Phaser (BootScene: betöltés, jelenet: sprite) és a DOM-felület (CSS háttér).
(function () {
  const IT = 'assets/items/item';
  const WP = 'assets/weapons/16x16 Weapons RPG Icons/';
  const WP_MATERIALS = ['bronze', 'iron', 'steel', 'gold'];

  // -> { url, key: Phaser textúra-kulcs, frame: kockaszám vagy undefined, x, y: pixel a képen } vagy null
  function parse(icon) {
    let m = /^it:(\d+)$/.exec(icon || '');
    if (m) return { url: IT + m[1] + '.png', key: 'icon_it_' + m[1], x: 0, y: 0 };
    m = /^wp:([a-z]+) c(\d+) r(\d+)$/.exec(icon || '');
    if (m && WP_MATERIALS.indexOf(m[1]) >= 0 && +m[2] < 24 && +m[3] < 20) {
      return { url: WP + m[1] + '-weapons.png', key: 'icon_wp_' + m[1], sheet: true, frame: +m[3] * 24 + +m[2], x: +m[2] * 16, y: +m[3] * 16 };
    }
    return null;
  }

  // Az összes ikon, amit be kell tölteni: [{ key, url, sheet }] (ismétlés nélkül)
  function files(icons) {
    const seen = {}, out = [];
    icons.map(parse).filter(Boolean).forEach(p => { if (!seen[p.key]) { seen[p.key] = 1; out.push({ key: p.key, url: p.url, sheet: !!p.sheet }); } });
    return out;
  }

  Game.itemIcons = { parse, files };
})();
