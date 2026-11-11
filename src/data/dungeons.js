// Dungeonök, szörnytípusok és berendezési tárgyak.
// A kulcs megegyezik a világtérképi helyszín azonosítójával (map.js: pois). Amelyik helyszínhez
// itt nincs dungeon, az a térképen "még zárva" marad.

// Szörnytípusok. idle = animációs csík (assets.js: strips), a nevek a strings.js-ben.
Game.data.monsters = {
  skeleton:         { idle: 'skel_base_idle',    name: 'mob.skeleton.name',         desc: 'mob.skeleton.desc' },
  skeleton_rogue:   { idle: 'skel_rogue_idle',   name: 'mob.skeleton_rogue.name',   desc: 'mob.skeleton_rogue.desc' },
  skeleton_warrior: { idle: 'skel_warrior_idle', name: 'mob.skeleton_warrior.name', desc: 'mob.skeleton_warrior.desc' },
};

// Berendezési tárgyak. kind:
//   'object' - a padlón áll, y szerint takar; blocks: nem lehet átmenni rajta
//   'decal'  - a padlóra festett dísz (rá lehet lépni); clip: a sötétségbe nem lóg ki
//   'wall'   - a fal alsó sorára kerül (x = oszlop, y = a fal alsó sora)
//   'torch'  - fali fáklya: tartó + lánganimáció + fényfolt a padlón
//   'brazier'- tűztál a padlón (animált), blokkol
// frame = kivágás neve (assets.js: frames); alpha, dy: finomhangolás
Game.data.dungeonProps = {
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
  torch:         { kind: 'torch' },
  brazier:       { kind: 'brazier', blocks: true },
};

Game.data.dungeons = {
  dungeon3: {
    name: 'poi.dungeon3.name',

    // '#' = fal / sötétség, '.' = padló. A falak képe automatikus: a padló fölötti 3 sor lesz falperem + 2 sor téglafal.
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
    // Kijárat: csukott faajtó a falban, 2 mező széles. x,y = a bal alsó mezője.
    exit: { x: 4, y: 41 },

    // Ajtók: 2 mező széles boltív a 3 soros falban. x,y = a bal alsó mezője.
    // state: 'open' | 'closed' (a zárás a harccal együtt jön; closed = rács, nem lehet átmenni)
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
};
