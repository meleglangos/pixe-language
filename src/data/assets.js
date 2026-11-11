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
  // 3x3-as padlóminta
  for (let i = 0; i < 9; i++) frames['floor_' + i] = t('pc_dungeon', 4 + (i % 3), Math.floor(i / 3));
  // víz: 4 képkocka, mindegyikből egy 3x3-as belső rész
  [[1, 6], [6, 6], [1, 11], [6, 11]].forEach(([c, r], i) => { frames['water_' + i] = t('pc_water', c, r, 3, 3); });

  const strip = (path, frameWidth, frameHeight, frameRate) => ({ url: PC + path, frameWidth, frameHeight, frameRate });
  const mob = name => strip('Entities/Mobs/Skeleton Crew/Skeleton - ' + name + '/Idle/Idle-Sheet.png', 32, 32, 6);

  Game.data.assets = {
    files: {
      pc_dungeon: PC + 'Environment/Tilesets/Dungeon_Tiles.png',
      pc_water: PC + 'Environment/Tilesets/Water_tiles.png',
      pc_dprops: PC + 'Environment/Props/Static/Dungeon_Props.png',
      pc_furniture: PC + 'Environment/Props/Static/Furniture.png',
      pc_skel_death: PC + 'Entities/Mobs/Skeleton Crew/Skeleton - Base/Death/Death-Sheet.png',
    },
    frames,

    strips: {
      girl_idle: strip("Entities/Npc's/Citizen_F/Tavern_A/Idle/Idle_Side-Sheet.png", 64, 64, 5),
      girl_walk: strip("Entities/Npc's/Citizen_F/Tavern_A/Walk/Walk_Side-Sheet.png", 64, 64, 10),
      skel_base_idle: mob('Base'),
      skel_rogue_idle: mob('Rogue'),
      skel_warrior_idle: mob('Warrior'),
      skel_mage_idle: mob('Mage'),
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
    //   fx_shadow, fx_marker, fx_heart, fx_light
    images: {},
  };
})();
