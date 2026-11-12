// Mezőtípusok, tereptárgyak és helyszíntípusok tulajdonságai.
// texture = a textúra kulcsa (lásd assets.js). variants: N -> texture_0 ... texture_{N-1}

Game.data.tiles = {
  grass:     { texture: 'tile_grass',     variants: 3, walkable: true,  group: 'land' },
  darkgrass: { texture: 'tile_darkgrass', variants: 3, walkable: true,  group: 'land' },
  flowers:   { texture: 'tile_flowers',   variants: 2, walkable: true,  group: 'land' },
  rocky:     { texture: 'tile_rocky',     variants: 2, walkable: true,  group: 'land' },
  sand:      { texture: 'tile_sand',      variants: 2, walkable: true,  group: 'sand' },
  path:      { texture: 'tile_path',      variants: 2, walkable: true,  group: 'path' },
  water:     { texture: 'tile_water',     variants: 2, walkable: false, group: 'water' },
};

Game.data.objectTypes = {
  tree_oak:  { texture: 'obj_tree_oak',  blocks: true },
  tree_pine: { texture: 'obj_tree_pine', blocks: true },
  tree_dead: { texture: 'obj_tree_dead', blocks: true },
  rock:      { texture: 'obj_rock',      blocks: true },
  bush:      { texture: 'obj_bush',      blocks: true },
  grave:     { texture: 'obj_grave',     blocks: true },
  crystal:   { texture: 'obj_crystal',   blocks: true },
};

// enterable: megjelenik-e a "Betreten" gomb. A belépés kezelése: Game.poi.handlers[type]
Game.data.poiTypes = {
  home:    { enterable: false },
  shop:    { enterable: true },
  dungeon: { enterable: true },
  boss:    { enterable: true },
};
