// Dungeonök, szörnytípusok és berendezési tárgyak.
// A kulcs megegyezik a világtérképi helyszín azonosítójával (map.js: pois). Amelyik helyszínhez
// itt nincs dungeon, az a térképen "még zárva" marad.
//
// ÚJ DUNGEON HOZZÁADÁSA: vegyél fel egy új bejegyzést a Game.data.dungeons alá (pálya, ajtók,
// szörnyek, láda, berendezés), a nevét a strings.js-be, és kész -- a kódhoz nem kell nyúlni.
// A kinézetet a "theme" adja (src/world/dungeonThemes.js: 'crypt', 'mine').

// Szörnytípusok. idle = animációs csík (assets.js: strips), a nevek a strings.js-ben.
Game.data.monsters = {
  skeleton:         { idle: 'skel_base_idle',    name: 'mob.skeleton.name',         desc: 'mob.skeleton.desc' },
  skeleton_rogue:   { idle: 'skel_rogue_idle',   name: 'mob.skeleton_rogue.name',   desc: 'mob.skeleton_rogue.desc' },
  skeleton_warrior: { idle: 'skel_warrior_idle', name: 'mob.skeleton_warrior.name', desc: 'mob.skeleton_warrior.desc' },
  orc:              { idle: 'orc_idle',          name: 'mob.orc.name',              desc: 'mob.orc.desc' },
  orc_rogue:        { idle: 'orc_rogue_idle',    name: 'mob.orc_rogue.name',        desc: 'mob.orc_rogue.desc' },
  orc_warrior:      { idle: 'orc_warrior_idle',  name: 'mob.orc_warrior.name',      desc: 'mob.orc_warrior.desc' },
};

// Berendezési tárgyak. kind:
//   'object' - a padlón áll, y szerint takar
//   'decal'  - a padlóra festett dísz (rá lehet lépni); clip: a sötétségbe nem lóg ki
//   'wall'   - a fal alsó sorára kerül (x = oszlop, y = a fal alsó sora)
// Kép: frame (assets.js: frames) | texture (önálló textúra) | strip (animáció, csak 'object').
// További mezők:
//   blocks (+ blocksLeft / blocksRight: hány szomszéd mezőt foglal még)   - nem lehet átmenni rajta
//   ground: [[frame, dx, dy], ...]   - a talajra festett kiegészítés, mezőkben eltolva
//   parts:  [{ strip, dx, dy, originY }]   - animált rész (pl. láng), pixelben a tárgy aljához képest
//   light:  { color, scale, dx, dy, mode: 'flicker' | 'pulse' | 'steady', hole }
//           color: warm, amber, cyan, pink, green, white, gold;  hole: fénykör sugara a sötét dungeonökben
//   sparkle: szín   - csillogó részecskék körülötte
//   alpha, dx, dy, originX, shadow: finomhangolás
(function () {
  const fire = { color: 'warm', mode: 'flicker' };
  const P = Game.data.dungeonProps = {
    // --- kripta ---
    coffin_a:      { kind: 'object', frame: 'coffin_a', blocks: true },
    coffin_b:      { kind: 'object', frame: 'coffin_b', blocks: true },
    statue:        { kind: 'object', frame: 'statue', blocks: true },
    barrel:        { kind: 'object', frame: 'barrel', blocks: true },
    barrel_broken: { kind: 'object', frame: 'barrel_broken', blocks: true },
    crate:         { kind: 'object', frame: 'crate', blocks: true },
    pot:           { kind: 'object', frame: 'pot', blocks: true },
    vase:          { kind: 'object', frame: 'vase', blocks: true },
    bones_a:       { kind: 'decal', frame: 'bones_a' },
    bones_b:       { kind: 'decal', frame: 'bones_b' },
    rubble_a:      { kind: 'decal', frame: 'rubble_a' },
    rubble_b:      { kind: 'decal', frame: 'rubble_b' },
    pot_broken:    { kind: 'decal', frame: 'pot_broken' },
    floor_grate:   { kind: 'decal', frame: 'floor_grate' },
    floor_holes:   { kind: 'decal', frame: 'floor_holes' },
    floor_blood:   { kind: 'decal', frame: 'floor_blood' },
    vine_a:        { kind: 'decal', frame: 'vine_a', alpha: 0.92, clip: true },
    vine_b:        { kind: 'decal', frame: 'vine_b', alpha: 0.92, clip: true },
    vine_c:        { kind: 'decal', frame: 'vine_c', alpha: 0.92, clip: true },
    banner_red:    { kind: 'wall', frame: 'banner_red', dy: 5 },
    banner_blue:   { kind: 'wall', frame: 'banner_blue', dy: 5 },
    banner_green:  { kind: 'wall', frame: 'banner_green', dy: 5 },
    wall_arms_a:   { kind: 'wall', frame: 'wall_arms_a', dy: 4 },
    wall_arms_b:   { kind: 'wall', frame: 'wall_arms_b', dy: 4 },
    wall_arms_c:   { kind: 'wall', frame: 'wall_arms_c', dy: 5 },
    // fali fáklya: gyertyatartó + lánganimáció + a csomag piros fénytócsája a padlón
    torch: {
      kind: 'wall', frame: 'sconce', dy: 5, ground: [['glow_red', -1, 1]],
      parts: [{ strip: 'fire_small', dy: -9, originY: 33 / 48 }],
      light: Object.assign({ scale: 1.5, dy: 11, hole: 52 }, fire),
    },
    // tűztál / tábortűz
    brazier: {
      kind: 'object', strip: 'brazier', blocks: true, shadow: false, dy: -1,
      parts: [{ strip: 'fire_big', dy: -12, originY: 38 / 48 }],
      light: Object.assign({ scale: 1.3, dy: -10, hole: 58 }, fire),
    },

    // --- bánya ---
    rail_h:        { kind: 'decal', frame: 'rail_h' },
    rail_v:        { kind: 'decal', frame: 'rail_v' },
    lamp_post: {
      kind: 'object', texture: 'lamp_post', blocks: true, originX: 0.16,
      light: { color: 'amber', scale: 1.5, dx: 29, dy: -32, mode: 'flicker', hole: 62 },
    },
    lantern:       { kind: 'object', frame: 'lantern', blocks: true, light: { color: 'amber', scale: 1.0, dy: -6, mode: 'flicker', hole: 40 } },
    furnace: {
      kind: 'object', strip: 'furnace', blocks: true, blocksLeft: 1, blocksRight: 1, shadow: false,
      light: { color: 'warm', scale: 1.4, dy: -14, mode: 'flicker', hole: 54 },
    },
    rope_post:     { kind: 'object', frame: 'rope_post', blocks: true },
    anvil:         { kind: 'object', frame: 'anvil', blocks: true },
    log_pile:      { kind: 'object', frame: 'log_pile', blocks: true },
    coal_pile:     { kind: 'object', frame: 'coal_pile', blocks: true, shadow: false },
    coal_lump:     { kind: 'decal', frame: 'coal_lump' },
    crate_empty:   { kind: 'object', frame: 'crate_empty', blocks: true },
    crate_coal:    { kind: 'object', frame: 'crate_coal', blocks: true },
    rock_big_a:    { kind: 'object', frame: 'rock_big_a', blocks: true },
    rock_big_b:    { kind: 'object', frame: 'rock_big_b', blocks: true },
    rock_mid_a:    { kind: 'object', frame: 'rock_mid_a', blocks: true },
    rock_mid_b:    { kind: 'object', frame: 'rock_mid_b', blocks: true },
    rock_small_a:  { kind: 'decal', frame: 'rock_small_a' },
    rock_small_b:  { kind: 'decal', frame: 'rock_small_b' },
    rock_small_c:  { kind: 'decal', frame: 'rock_small_c' },
    pebble:        { kind: 'decal', frame: 'pebble' },
    sledgehammer:  { kind: 'wall', frame: 'sledgehammer', dy: 1 },
  };
  ['copper', 'silver', 'gold'].forEach(m => {
    P['ore_' + m] = { kind: 'decal', frame: 'ore_' + m, dy: 3 };
    P['ore_' + m + '_b'] = { kind: 'decal', frame: 'ore_' + m + '_b', dy: 6, dx: 3 };
  });
  // Kristályok: méret x szín. A padlón állók blokkolnak; a "w" előtagúak a falból nőnek ki.
  const sizes = { big: [1.7, 58, -12], mid: [1.15, 42, -9], mid_b: [1.15, 42, -9], small: [0.7, 26, -4] };
  const colors = { blue: 'cyan', pink: 'pink', green: 'green', amber: 'amber' };
  Object.keys(sizes).forEach(size => Object.keys(colors).forEach(color => {
    const [scale, hole, dy] = sizes[size], texture = 'crystal_' + size + '_' + color;
    const light = { color: colors[color], scale, dy, mode: 'pulse', hole };
    P[texture] = { kind: 'object', texture, blocks: true, light, sparkle: colors[color] };
    P['w' + texture] = { kind: 'wall', texture, dy: 1, light, sparkle: colors[color] };
  }));
})();

Game.data.dungeons = {
  // ===================== Die versunkene Gruft =====================
  dungeon3: {
    name: 'poi.dungeon3.name',
    theme: 'crypt',

    // '#' = fal / sötétség, '.' = padló. A falak képe automatikus: a padló fölötti 3 sor lesz falperem + 2 sor fal.
    // Felépítés lentről felfelé: bejárat -> 1. terem -> 2. terem -> 3. terem -> kincses terem.
    layout: [
      '################',
      '################',
      '################',
      '################',
      '####........####', //  4  kincses terem
      '####........####',
      '####........####',
      '####........####',
      '####........####',
      '################',
      '################',
      '################',
      '###..........###', // 12  3. terem
      '###..........###',
      '###..........###',
      '###..........###',
      '###..........###',
      '###..........###',
      '###..........###',
      '################',
      '################',
      '################',
      '###..........###', // 22  2. terem
      '###..........###',
      '###..........###',
      '###..........###',
      '###..........###',
      '###..........###',
      '###..........###',
      '################',
      '################',
      '################',
      '###..........###', // 32  1. terem
      '###..........###',
      '###..........###',
      '###..........###',
      '###..........###',
      '###..........###',
      '###..........###',
      '################',
      '################',
      '################',
      '####........####', // 42  bejárat
      '####........####',
      '####........####',
      '####........####',
      '####........####',
      '################',
      '################',
    ],

    start: { x: 7, y: 44 },
    // Kijárat a falban, 2 mező széles. x,y = a bal alsó mezője.
    exit: { x: 4, y: 41 },

    // Ajtók: 2 mező széles átjáró a 3 soros falban. x,y = a bal alsó mezője.
    // state: 'open' | 'closed' (a zárás a harccal együtt jön; closed = nem lehet átmenni)
    doors: [
      { x: 7, y: 41, state: 'open' },
      { x: 7, y: 31, state: 'open' },
      { x: 7, y: 21, state: 'open' },
      { x: 7, y: 11, state: 'open' },
    ],

    // Szörnyek, a bejárattól befelé egyre erősebbek.
    monsters: [
      { type: 'skeleton', x: 8, y: 34 },
      { type: 'skeleton_rogue', x: 7, y: 24 },
      { type: 'skeleton_warrior', x: 8, y: 14 },
    ],

    // Láda: 2 mezőt foglal (x és x+1), középre rajzolva.
    chest: { x: 7, y: 5 },

    // Víztócsák (mezőkben). Át lehet gázolni rajtuk.
    puddles: [
      { x: 9, y: 36, w: 3, h: 2 },
      { x: 3, y: 26, w: 4, h: 3 },
      { x: 9, y: 16, w: 3, h: 2 },
      { x: 5, y: 45, w: 2, h: 2 },
    ],

    // Berendezés: [típus, x, y]
    props: [
      // bejárat
      ['torch', 10, 41], ['vine_c', 10, 39], ['pot', 11, 46], ['rubble_b', 4, 46], ['bones_b', 9, 45],
      // 1. terem
      ['torch', 5, 31], ['torch', 10, 31], ['coffin_a', 3, 32], ['coffin_b', 4, 32], ['coffin_a', 12, 32],
      ['wall_arms_b', 12, 31], ['bones_a', 4, 36], ['bones_b', 10, 33], ['pot_broken', 3, 38], ['barrel', 12, 38],
      ['floor_blood', 6, 37], ['vine_c', 2, 30],
      // 2. terem
      ['torch', 4, 21], ['torch', 11, 21], ['statue', 5, 22], ['statue', 10, 22], ['banner_green', 6, 21], ['banner_green', 9, 21],
      ['coffin_b', 3, 22], ['coffin_a', 12, 22], ['floor_grate', 10, 26], ['bones_b', 9, 24], ['bones_a', 8, 27],
      ['rubble_a', 11, 28], ['barrel_broken', 12, 28], ['floor_holes', 4, 24], ['vine_b', 10, 19],
      // 3. terem
      ['torch', 5, 11], ['torch', 10, 11], ['brazier', 4, 13], ['brazier', 11, 13], ['coffin_a', 3, 12], ['coffin_b', 12, 12],
      ['wall_arms_a', 4, 11], ['wall_arms_c', 11, 11], ['bones_a', 5, 17], ['bones_b', 11, 15], ['floor_blood', 6, 14], ['vine_a', 0, 9],
      // kincses terem
      ['torch', 5, 3], ['torch', 10, 3], ['banner_red', 6, 3], ['banner_red', 9, 3], ['vase', 4, 4], ['pot', 11, 4],
      ['crate', 4, 8], ['barrel', 11, 8], ['pot_broken', 10, 8], ['vine_c', 2, 1], ['vine_b', 9, 6],
    ],
  },

  // ===================== Die Kristallmine =====================
  dungeon2: {
    name: 'poi.dungeon2.name',
    theme: 'mine',

    // Sötétség: csak a fények (kristályok, lámpák, tűz) és a játékos körül világos.
    darkness: { color: 0x04060e, alpha: 0.8, playerLight: 52 },
    // Hangulat: lebegő por, csöpögő víz (mezők, ahova a cseppek esnek)
    ambience: { dust: true, drips: [[14, 16], [18, 15], [12, 18], [16, 19], [29, 34]] },

    // Jelek: '#' szikla, '.' kőpadló, ',' földes padló, '~' tó, 'x' szakadék, '=' híd.
    // Felépítés lentről felfelé: bejárat -> rakodó (1. szörny) -> déli part (2. szörny) -> híd a szakadék fölött
    //   -> északi part -> tavas barlang (3. szörny) -> kincses terem.
    layout: [
      '####################################', // 0
      '####################################',
      '####################################',
      '####################################',
      '####################........########',
      '####################........########', // 5
      '####################........########',
      '####################..,,,,..########',
      '####################..,,,,..########',
      '####################..,,,,..########',
      '####################################', // 10
      '####################################',
      '####################################',
      '##########............,,,,,...######',
      '##########.~~~~~~~~~..,,,,,...######',
      '##########.~~~~~~~~~..,,,,,...######', // 15
      '##########.~~~~~~~~~............####',
      '##########.~~~~~~~~~.......,,,,,####',
      '##########.~~~~~~~~~.......,,,,,####',
      '##########..~~~~~~~........,,,,,####',
      '##########....................######', // 20
      '##########....................######',
      '####################################',
      '####################################',
      '####################################',
      '##################..............####', // 25
      '##################.....,,,,,,...####',
      '##################.....,,,,,,...####',
      '########xxxxxxxxxxxxxxxxx==xxxxxxx##',
      '########xxxxxxxxxxxxxxxxx==xxxxxxx##',
      '########xxxxxxxxxxxxxxxxx==xxxxxxx##', // 30
      '########xxxxxxxxxxxxxxxxx==xxxxxxx##',
      '##############.........,,,,,,...####',
      '##########.............,,,,,,...####',
      '##########......................####',
      '##########......................####', // 35
      '##############..................####',
      '####################################',
      '####################################',
      '####################################',
      '######................##############', // 40
      '######................##############',
      '######...................###########',
      '######......,,,,,,,,,,,,,###########',
      '######....,,,,,,,,,,,,,,,###########',
      '######....,,,,,,,,,,,,##############', // 45
      '######....,,,.........##############',
      '####################################',
      '####################################',
      '####################################',
      '#####.....,,,..#####################', // 50
      '#####.....,,,..#####################',
      '#####.....,,,..#####################',
      '#####.....,,,..#####################',
      '#####.....,,,..#####################',
      '####################################', // 55
      '####################################',
    ],

    start: { x: 9, y: 52 },
    exit: { x: 6, y: 49, name: 'dungeon.mineExitName', desc: 'dungeon.mineExitDesc', light: { color: 'white', scale: 1.5, mode: 'steady', hole: 46 } },

    doors: [
      { x: 11, y: 49, state: 'open' },
      { x: 16, y: 39, state: 'open' },
      { x: 25, y: 24, state: 'open' },
      { x: 23, y: 12, state: 'open' },
    ],

    monsters: [
      { type: 'orc', x: 14, y: 42 },
      { type: 'orc_rogue', x: 22, y: 34 },
      { type: 'orc_warrior', x: 24, y: 17 },
    ],

    chest: { x: 23, y: 6 },

    // Halvány fénypontok a szakadék mélyén: [x, y, szín, dx, dy]
    glints: [
      [9, 29, 'cyan', 3, 5], [10, 30, 'pink', -4, 2], [13, 29, 'cyan', 5, -3], [15, 31, 'pink', 0, -4], [17, 30, 'green', 2, 3],
      [20, 30, 'cyan', -5, 4], [22, 31, 'pink', 4, -2], [30, 30, 'cyan', 0, 0], [32, 29, 'pink', -3, 5], [29, 31, 'green', 5, -5],
    ],

    props: [
      // sínek a bejárattól a rakodón át az érces fülkéig
      ['rail_v', 11, 44], ['rail_v', 11, 45], ['rail_v', 11, 46], ['rail_v', 11, 47], ['rail_v', 11, 48], ['rail_v', 11, 49], ['rail_v', 11, 50], ['rail_v', 11, 51], ['rail_v', 11, 52], ['rail_v', 11, 53], ['rail_h', 12, 44], ['rail_h', 13, 44], ['rail_h', 14, 44], ['rail_h', 15, 44], ['rail_h', 16, 44], ['rail_h', 17, 44], ['rail_h', 18, 44], ['rail_h', 19, 44], ['rail_h', 20, 44], ['rail_h', 21, 44], ['rail_h', 22, 44], ['rail_h', 23, 44],
      // bejárat
      ['lamp_post', 8, 50], ['crate_coal', 13, 53], ['coal_pile', 6, 53], ['rock_mid_a', 5, 51], ['pebble', 8, 53],
      ['sledgehammer', 13, 49], ['wcrystal_small_blue', 9, 49], ['lantern', 14, 50], ['coal_lump', 13, 52],
      // rakodó: kemence, üllő, csille a sín végén, érces fülke
      ['furnace', 8, 40], ['anvil', 10, 41], ['crate_coal', 11, 43], ['lamp_post', 18, 40], ['log_pile', 21, 40],
      ['wcrystal_mid_green', 13, 39], ['wcrystal_small_green', 20, 39], ['sledgehammer', 12, 39],
      ['coal_pile', 6, 45], ['crate_empty', 7, 46], ['rock_small_a', 20, 46], ['pebble', 15, 45],
      ['rock_big_b', 24, 42], ['crystal_mid_amber', 22, 42], ['ore_gold', 23, 42], ['ore_copper', 22, 43], ['ore_silver_b', 23, 43], ['crate_coal', 24, 44],
      // déli part: híd-fő, rózsaszín kristályos párkány
      ['rope_post', 24, 32], ['rope_post', 27, 32], ['lantern', 28, 32],
      ['crystal_big_pink', 10, 34], ['crystal_mid_pink', 12, 33], ['crystal_small_pink', 11, 35],
      ['rock_mid_b', 30, 35], ['rock_big_a', 19, 32], ['pebble', 26, 35], ['crystal_small_blue', 31, 33], ['ore_copper', 15, 36], ['rock_small_c', 17, 35],
      // északi part
      ['rope_post', 24, 27], ['rope_post', 27, 27],
      ['wcrystal_mid_pink', 20, 24], ['wcrystal_big_blue', 22, 24], ['wcrystal_mid_blue', 29, 24],
      ['crystal_big_blue', 19, 26], ['rock_mid_a', 31, 25], ['crystal_small_green', 30, 27], ['ore_silver', 21, 27],
      // tavas barlang: kristályok a vízben, tábortűz a fülkében
      ['crystal_big_blue', 13, 15], ['crystal_mid_blue', 17, 17], ['crystal_mid_b_blue', 15, 18], ['crystal_small_blue', 12, 17], ['crystal_small_green', 18, 14],
      ['wcrystal_mid_blue', 12, 12], ['wcrystal_big_blue', 16, 12], ['wcrystal_mid_green', 19, 12], ['wcrystal_small_blue', 27, 12],
      ['brazier', 30, 18], ['crate_empty', 31, 16], ['log_pile', 28, 20], ['lantern', 21, 13],
      ['crystal_mid_green', 28, 21], ['rock_big_b', 11, 21], ['rock_small_b', 22, 20], ['pebble', 20, 16],
      // kincses terem: kristályok minden színben a láda körül
      ['crystal_big_blue', 21, 5], ['crystal_big_pink', 26, 5], ['crystal_mid_green', 20, 7], ['crystal_mid_amber', 27, 7],
      ['crystal_small_amber', 21, 8], ['crystal_small_green', 26, 8],
      ['wcrystal_mid_pink', 22, 3], ['wcrystal_mid_amber', 25, 3], ['wcrystal_small_green', 20, 3], ['wcrystal_small_blue', 27, 3],
      ['ore_gold', 22, 9], ['ore_gold_b', 25, 9], ['ore_silver', 24, 4],
    ],
  },
};
