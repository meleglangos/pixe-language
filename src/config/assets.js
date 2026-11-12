// Grafikai manifest: minden kép és animáció innen töltődik.
//
//  files   - betöltött képfájlok (kulcs -> útvonal)
//  frames  - névvel ellátott kivágások a fájlokból: [fájlkulcs, x, y, szélesség, magasság] pixelben
//  strips  - animációs csíkok (egy sorban egymás mellett a képkockák)
//  sheets  - karakterek: melyik animációhoz melyik csík tartozik
//  images  - a kódból rajzolt placeholderek felülírása PNG-vel (kulcs -> útvonal)
//
// Ha egy grafikát cserélni akarsz, elég itt átírni az útvonalat vagy a kivágást.
(function () {
  const PC = 'assets/pixel-crawler/Pixel Crawler - Free Pack/';
  const T = 16;
  const t = (file, col, row, w, h) => [file, col * T, row * T, (w || 1) * T, (h || 1) * T]; // kivágás mezőkben

  const frames = {
    // --- Dungeon_Tiles.png ---
    wall_cap_0: t('pc_dungeon', 0, 0), wall_cap_1: t('pc_dungeon', 1, 0), wall_cap_2: t('pc_dungeon', 2, 0),
    wall_top_0: t('pc_dungeon', 0, 1), wall_top_1: t('pc_dungeon', 1, 1), wall_top_2: t('pc_dungeon', 2, 1),
    wall_bottom_0: t('pc_dungeon', 0, 2), wall_bottom_1: t('pc_dungeon', 1, 2), wall_bottom_2: t('pc_dungeon', 2, 2),
    wall_drain: t('pc_dungeon', 1, 6),
    floor_alt_0: t('pc_dungeon', 4, 3), floor_alt_1: t('pc_dungeon', 5, 3), floor_alt_2: t('pc_dungeon', 6, 3), floor_alt_3: t('pc_dungeon', 7, 3),
    floor_holes: t('pc_dungeon', 8, 3),
    floor_grate: t('pc_dungeon', 7, 10, 2, 2),
    floor_blood: t('pc_dungeon', 9, 11),
    door_arch: t('pc_dungeon', 0, 10, 2, 3),    // nyitott boltív
    door_wood: t('pc_dungeon', 0, 7, 2, 3),     // csukott faajtó
    door_gate: t('pc_dungeon', 2, 7, 2, 3),     // leeresztett rács
    stairs: t('pc_dungeon', 9, 14, 1, 2),
    glow_red: t('pc_dungeon', 0, 19, 3, 3),     // fáklyafény a padlón
    vine_a: t('pc_dungeon', 10, 0, 4, 3),
    vine_b: t('pc_dungeon', 10, 4, 3, 3),
    vine_c: t('pc_dungeon', 12, 3, 2, 2),
    // --- Dungeon_Props.png ---
    coffin_a: ['pc_dprops', 113, 2, 14, 20],
    coffin_b: ['pc_dprops', 129, 2, 14, 20],
    statue: ['pc_dprops', 97, 1, 14, 21],
    wall_arms_a: ['pc_dprops', 19, 42, 10, 22],
    wall_arms_b: ['pc_dprops', 67, 34, 10, 21],
    wall_arms_c: ['pc_dprops', 99, 41, 10, 19],
    banner_red: ['pc_dprops', 67, 70, 10, 21],
    banner_blue: ['pc_dprops', 83, 70, 10, 21],
    banner_green: ['pc_dprops', 99, 70, 10, 21],
    // --- Furniture.png ---
    chest_open: ['pc_furniture', 736, 165, 16, 27],
    chest_closed: ['pc_furniture', 752, 165, 16, 27],
    crate: ['pc_furniture', 720, 73, 16, 23],
    barrel: ['pc_furniture', 753, 73, 15, 23],
    pot: ['pc_furniture', 769, 80, 14, 16],
    vase: ['pc_furniture', 787, 76, 10, 20],
    barrel_broken: ['pc_furniture', 753, 105, 15, 23],
    rubble_a: ['pc_furniture', 736, 129, 16, 15],
    rubble_b: ['pc_furniture', 752, 129, 16, 15],
    pot_broken: ['pc_furniture', 769, 133, 14, 11],
    sconce: ['pc_furniture', 757, 145, 6, 15],
    chain: ['pc_furniture', 772, 165, 8, 41],
    // --- csontkupacok: a csontváz "Death" animációjának utolsó képkockái ---
    bones_a: ['pc_skel_death', 7 * 96 + 37, 50, 17, 14],
    bones_b: ['pc_skel_death', 6 * 96 + 37, 53, 17, 11],
  };
  // ---------- bánya ----------
  Object.assign(frames, {
    // Wall_Tiles.png, szürke sziklakészlet: perem (a "gödör" 6x6-os mintájából) + rétegzett sziklafal
    rock_top_l: t('pc_walls', 7, 19), rock_top_0: t('pc_walls', 8, 19), rock_top_1: t('pc_walls', 9, 19), rock_top_r: t('pc_walls', 10, 19),
    rock_bot_l: t('pc_walls', 7, 24), rock_bot_0: t('pc_walls', 8, 24), rock_bot_1: t('pc_walls', 9, 24), rock_bot_r: t('pc_walls', 10, 24),
    rock_left_t: t('pc_walls', 6, 20), rock_left_0: t('pc_walls', 6, 21), rock_left_1: t('pc_walls', 6, 22), rock_left_b: t('pc_walls', 6, 23),
    rock_right_t: t('pc_walls', 11, 20), rock_right_0: t('pc_walls', 11, 21), rock_right_1: t('pc_walls', 11, 22), rock_right_b: t('pc_walls', 11, 23),
    rock_in_tl: t('pc_walls', 7, 20), rock_in_tr: t('pc_walls', 10, 20), rock_in_bl: t('pc_walls', 7, 23), rock_in_br: t('pc_walls', 10, 23),
    rock_fill: t('pc_walls', 8, 2),
    rock_face_a0: t('pc_walls', 6, 16), rock_face_a1: t('pc_walls', 7, 16), rock_face_a2: t('pc_walls', 8, 16),
    rock_face_b0: t('pc_walls', 6, 17), rock_face_b1: t('pc_walls', 7, 17), rock_face_b2: t('pc_walls', 8, 17),
    // Furniture.png: sínek, pallók, lámpák, gerendák
    rail_h: t('pc_furniture', 2, 39), rail_v: t('pc_furniture', 0, 41),
    lamp_post: ['pc_furniture', 147, 448, 43, 46],
    lantern: ['pc_furniture', 179, 482, 9, 14],
    rope_post: ['pc_furniture', 148, 422, 8, 23],
    timber_frame: ['pc_furniture', 144, 656, 54, 80],
    // Resources.png
    coal_pile: ['pc_resources', 11, 20, 31, 18],
    coal_lump: ['pc_resources', 49, 17, 14, 11],
    crate_empty: ['pc_resources', 0, 157, 15, 19],
    crate_coal: ['pc_resources', 16, 156, 15, 20],
    wood_post: ['pc_resources', 5, 80, 6, 32],
    wood_beam: ['pc_resources', 16, 85, 32, 6],
    wood_plank: ['pc_resources', 32, 68, 32, 7],
    log_pile: ['pc_resources', 20, 97, 22, 13],
    // Rocks.png
    rock_big_a: ['pc_rocks', 98, 19, 28, 43],
    rock_big_b: ['pc_rocks', 131, 19, 26, 27],
    rock_mid_a: ['pc_rocks', 161, 19, 14, 11],
    rock_mid_b: ['pc_rocks', 176, 17, 16, 14],
    rock_small_a: ['pc_rocks', 144, 51, 15, 10],
    rock_small_b: ['pc_rocks', 177, 68, 11, 9],
    rock_small_c: ['pc_rocks', 161, 100, 11, 9],
    pebble: ['pc_rocks', 132, 85, 8, 6],
    ore_copper: ['pc_rocks', 101, 119, 7, 4], ore_silver: ['pc_rocks', 101, 151, 7, 4], ore_gold: ['pc_rocks', 101, 183, 7, 4],
    ore_copper_b: ['pc_rocks', 132, 119, 7, 4], ore_silver_b: ['pc_rocks', 132, 151, 7, 4], ore_gold_b: ['pc_rocks', 132, 183, 7, 4],
    crystal_big: ['pc_rocks', 146, 279, 12, 25],
    crystal_mid: ['pc_rocks', 164, 284, 8, 20],
    crystal_mid_b: ['pc_rocks', 179, 285, 10, 19],
    crystal_small: ['pc_rocks', 197, 296, 6, 8],
    // Tools.png
    sledgehammer: ['pc_tools', 0, 64, 16, 16],
    anvil: ['pc_tools', 148, 93, 26, 19],
  });
  for (let i = 0; i < 9; i++) {
    // a minta felső sora átmenet-csempe (lyukas), ezért csak a két teli sort használjuk
    frames['cobble_' + i] = t('pc_floors', 6 + ((i + Math.floor(i / 3)) % 3), 10 + (Math.floor(i / 3) % 2));
    frames['dirt_' + i] = t('pc_floors', 11 + ((i + Math.floor(i / 3)) % 3), 10 + (Math.floor(i / 3) % 2));
    frames['planks_' + i] = t('pc_furniture', 1 + (i % 3), 35 + Math.floor(i / 3));
  }

  // 3x3-as padlóminta
  for (let i = 0; i < 9; i++) frames['floor_' + i] = t('pc_dungeon', 4 + (i % 3), Math.floor(i / 3));
  // víz: 4 képkocka, mindegyikből egy 3x3-as belső rész
  [[1, 6], [6, 6], [1, 11], [6, 11]].forEach(([c, r], i) => { frames['water_' + i] = t('pc_water', c, r, 3, 3); });

  const strip = (path, frameWidth, frameHeight, frameRate) => ({ url: PC + path, frameWidth, frameHeight, frameRate });
  const mob = name => strip('Entities/Mobs/Skeleton Crew/Skeleton - ' + name + '/Idle/Idle-Sheet.png', 32, 32, 6);
  const orc = name => strip('Entities/Mobs/Orc Crew/' + name + '/Idle/Idle-Sheet.png', 32, 32, 6);

  Game.data.assets = {
    files: {
      pc_dungeon: PC + 'Environment/Tilesets/Dungeon_Tiles.png',
      pc_water: PC + 'Environment/Tilesets/Water_tiles.png',
      pc_dprops: PC + 'Environment/Props/Static/Dungeon_Props.png',
      pc_furniture: PC + 'Environment/Props/Static/Furniture.png',
      pc_skel_death: PC + 'Entities/Mobs/Skeleton Crew/Skeleton - Base/Death/Death-Sheet.png',
      pc_walls: PC + 'Environment/Tilesets/Wall_Tiles.png',
      pc_floors: PC + 'Environment/Tilesets/Floors_Tiles.png',
      pc_rocks: PC + 'Environment/Props/Static/Rocks.png',
      pc_resources: PC + 'Environment/Props/Static/Resources.png',
      pc_tools: PC + 'Environment/Props/Static/Tools.png',
    },
    frames,

    strips: {
      girl_idle: strip("Entities/Npc's/Citizen_F/Tavern_A/Idle/Idle_Side-Sheet.png", 64, 64, 5),
      girl_walk: strip("Entities/Npc's/Citizen_F/Tavern_A/Walk/Walk_Side-Sheet.png", 64, 64, 10),
      skel_base_idle: mob('Base'),
      skel_rogue_idle: mob('Rogue'),
      skel_warrior_idle: mob('Warrior'),
      skel_mage_idle: mob('Mage'),
      orc_idle: orc('Orc'),
      orc_rogue_idle: orc('Orc - Rogue'),
      orc_warrior_idle: orc('Orc - Warrior'),
      orc_shaman_idle: orc('Orc - Shaman'),
      furnace: strip('Environment/Structures/Stations/Furnace/Stone_02-Sheet.png', 48, 64, 6),
      fire_big: strip('Environment/Structures/Stations/Bonfire/Fire_01-Sheet.png', 32, 48, 9),
      fire_small: strip('Environment/Structures/Stations/Bonfire/Fire_02-Sheet.png', 32, 48, 9),
      brazier: strip('Environment/Structures/Stations/Bonfire/Bonfire_01-Sheet.png', 32, 32, 7),
    },

    // Karakterek.
    //   mode 'side': a csomag animációi csak jobbra néznek -> balra tükrözve; fel/le menet az utolsó oldalirány marad.
    //   mode 'rows': egy sheet, soronként egy irány (a kódból rajzolt placeholderek ilyenek).
    // A régi, kódból rajzolt lány visszakapcsolható: player: { mode: 'rows', ...lásd 'player_placeholder' }
    sheets: {
      player: {
        mode: 'side', frameWidth: 64, frameHeight: 64, footY: 48,
        anims: { idle: 'girl_idle', walk: 'girl_walk' },
      },
      player_placeholder: {
        mode: 'rows', url: null, frameWidth: 16, frameHeight: 24, footY: 22,
        rows: ['down', 'left', 'right', 'up'],
        anims: {
          idle: { frames: [0, 0, 0, 0, 0, 0, 0, 0, 0, 3], frameRate: 4 },
          walk: { frames: [1, 0, 2, 0], frameRate: 9 },
        },
      },
      pet: {
        mode: 'rows', url: null, frameWidth: 16, frameHeight: 16, footY: 14,
        rows: ['down', 'left', 'right', 'up'],
        anims: {
          idle: { frames: [0, 3], frameRate: 3 },
          walk: { frames: [1, 0, 2, 0], frameRate: 12 },
        },
      },
    },

    // Placeholder-képek felülírása: kulcs -> 'útvonal.png'
    // Kulcsok: tile_grass_0..2, tile_darkgrass_0..2, tile_flowers_0..1, tile_rocky_0..1, tile_sand_0..1,
    //   tile_path_0..1, tile_water_0..1, obj_tree_oak, obj_tree_pine, obj_tree_dead, obj_rock, obj_bush,
    //   obj_grave, obj_crystal, poi_home, poi_shop, poi_cave, poi_mine, poi_crypt, poi_tower,
    //   fx_shadow, fx_marker, fx_heart, fx_light (+ fx_light_cyan/pink/green/amber/white), fx_hole, fx_dot, fx_spark
    images: {},
  };
})();
