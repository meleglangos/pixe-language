// Grafikai manifest.
//
// Alapból MINDEN textúrát a src/gfx/placeholders.js rajzol kódból.
// Ha egy textúrát le akarsz cserélni egy letöltött pixel art képre, add meg itt
// a kulcsát és a PNG útvonalát -- a kód többi részéhez nem kell nyúlni.
//
//   images: { obj_tree_oak: 'assets/tree.png', poi_shop: 'assets/shop.png' }
//
// Elérhető kép-kulcsok: tile_grass_0..2, tile_darkgrass_0..2, tile_flowers_0..1,
//   tile_rocky_0..1, tile_sand_0..1, tile_path_0..1, tile_water_0..1 (16x16),
//   obj_tree_oak, obj_tree_pine, obj_tree_dead, obj_rock, obj_bush, obj_grave, obj_crystal,
//   poi_home, poi_shop, poi_cave, poi_mine, poi_crypt, poi_tower,
//   fx_shadow, fx_marker, fx_heart
// A tárgyak és épületek az alsó-középső pontjukkal illeszkednek a mezőre, így a méretük szabadon eltérhet.

Game.data.assets = {
  images: {
    // kulcs: 'útvonal.png'
  },

  // Karakter-spritesheetek. Elrendezés: soronként egy irány (rows), oszloponként egy képkocka.
  //   url: null -> kódból rajzolt placeholder. PNG megadásakor a frameWidth/frameHeight/footY
  //   értékeket igazítsd a képhez (footY = hányadik pixelsorban van a talp).
  // A felszerelés-rétegek (páncél, fegyver) később ugyanilyen elrendezésű sheetek lesznek,
  // amik a test fölé rajzolódnak.
  sheets: {
    player: {
      url: null, frameWidth: 16, frameHeight: 24, footY: 22,
      rows: ['down', 'left', 'right', 'up'],
      anims: {
        idle: { frames: [0, 0, 0, 0, 0, 0, 0, 0, 0, 3], frameRate: 4 },
        walk: { frames: [1, 0, 2, 0], frameRate: 9 },
      },
    },
    pet: {
      url: null, frameWidth: 16, frameHeight: 16, footY: 14,
      rows: ['down', 'left', 'right', 'up'],
      anims: {
        idle: { frames: [0, 3], frameRate: 3 },
        walk: { frames: [1, 0, 2, 0], frameRate: 12 },
      },
    },
  },
};
