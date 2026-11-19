// Játékegyensúly és általános beállítások.
Game.data.config = {
  storageKey: 'deutsch-abenteuer.save',
  exportPrefix: 'DA1',

  player: {
    speed: 72,        // pixel / másodperc (16 pixel = 1 mező)
    maxHp: 20,
  },
  // Loot (src/systems/loot/): az arany ikonja a "Beute" ablakban és a ládából kirepülve
  loot: {
    goldIcon: 'it:1163',
    coinIcon: 'it:1159',      // egyetlen aranyérme: ez záporozik a láda robbanásakor
    chestStyle: 'royal',  // a láda alap kinézete (data/chest_styles.json); a dungeon "chestStyle"-ja felülírja
    lockChestUntilCleared: false, // true: a láda zárva, amíg él szörny a dungeonben (most kikapcsolva)
    // Láda-csillagok (1–5): a láda minősége. Egy loot tábla "stars" mezője bármelyik részt felülírhatja.
    stars: {
      weights: [30, 30, 20, 13, 7],                     // 1…5 csillag esélye
      rolls: [[1, 1], [1, 2], [2, 3], [3, 4], [4, 5]],  // hány tételt húz csillagonként
      gold: [1, 1.3, 1.6, 2, 3],                        // az arany mennyiségének szorzója
      // egy tétel esélye = súly × a ritkaság szorzója az adott csillagnál (bármi bármiből jöhet)
      rarityFactor: {   // 1★      2★     3★     4★     5★
        common:     [1,      0.9,   0.8,   0.65,  0.5],
        uncommon:   [0.5,    0.55,  0.6,   0.6,   0.6],
        rare:       [0.15,   0.25,  0.35,  0.45,  0.55],
        super_rare: [0.06,   0.1,   0.15,  0.22,  0.3],
        epic:       [0.02,   0.04,  0.07,  0.12,  0.18],
        legendary:  [0.004,  0.008, 0.015, 0.03,  0.06],
        unreal:     [0.0005, 0.001, 0.002, 0.005, 0.012],
        gold:      [1,     1,    1,    1,    1],
      },
    },
  },

  // Kérdés-rendszer (src/systems/questions/)
  questions: {
    wrongDamage: 3,     // ennyi HP-t veszít a játékos egy rossz válaszért (a kihívás / szörny felülírhatja)
    contextShare: 0.7,  // ekkora eséllyel jön a kihívás helyzet-témájából a kérdés (különben bármi a szinten belül)
  },
  pet: {
    followDistance: 18, // ennyivel marad le a kutya (pixel)
    speedFactor: 1.25,  // a játékos sebességéhez képest
  },

  // Közreműködők (a menü "Mitwirkende" képernyője). url nélkül csak a név jelenik meg.
  credits: {
    art: [
      { name: 'Pixel Crawler', by: 'Anokolisa', url: 'https://www.patreon.com/Anokolisa' },
      { name: '16x16 Weapon RPG Icons', by: 'Shade' },
      { name: 'Items16', by: 'Glionox' },
      { name: 'Modern Interiors', by: 'LimeZu', url: 'https://limezu.itch.io/moderninteriors' },
      { name: 'Tiny RPG Character Asset Pack 01 & 02', by: 'Zerie' },
    ],
    code: [
      { name: 'Phaser 3', by: 'Phaser Studio', url: 'https://phaser.io' },
      { name: 'EasyStar.js', by: 'Bryce Neal', url: 'https://easystarjs.com' },
    ],
  },

  // Rarity létra alulról felfelé. A nevek a data/translations.json-ban: rarity.<id>
  //   value: a tárgy alapára aranyban (a tárgy "value" mezője felülírja)
  //   show:  a láda-ablak kiemelésének ereje (0 = egyszerű, 1 = csillogás, 2 = epikus, 3 = legendás show)
  rarities: [
    { id: 'common',     color: '#b8b8b8', value: 5,    show: 0 },
    { id: 'uncommon',   color: '#5cbf4a', value: 12,   show: 0 },
    { id: 'rare',       color: '#4a8fe8', value: 30,   show: 1 },
    { id: 'super_rare', color: '#2fc6d6', value: 60,   show: 1 },
    { id: 'epic',       color: '#a24ae8', value: 150,  show: 2 },
    { id: 'legendary',  color: '#f0a530', value: 400,  show: 3 },
    { id: 'unreal',     color: '#ff4f8b', value: 1000, show: 3 },
  ],

  // Tárgyak (data/items.json; spec: docs/features/item_system.md). A nevek: kind.<id>, stat.<id>.
  items: {
    // kategóriák: a megengedett típusok, a felszerelés-hely (később), és hogy összeadódik-e a mennyiség
    kinds: {
      weapon:   { types: ['sword', 'dagger', 'axe', 'mace', 'spear', 'bow', 'staff'], slot: 'weapon', stack: false },
      armor:    { types: ['helmet', 'chest', 'shield', 'boots', 'gloves'], slot: 'armor', stack: false },
      jewelry:  { types: ['ring', 'amulet'], slot: 'jewelry', stack: false },
      potion:   { types: ['heal'], stack: true },
      gem:      { types: ['gem'], stack: true },
      material: { types: ['bone', 'ore', 'herb', 'monster'], stack: true },
      key:      { types: ['key'], stack: true },
      treasure: { types: ['treasure'], stack: true },
    },
    // passzívok (a tárgy "stats" mezője); unit: '%' = százalék. A hatásuk a felszerelés feature-rel jön.
    stats: {
      attack:    {},             // Angriff: erősebb a szörnyek ellen
      maxHp:     {},             // Leben: több max. élet
      shield:    {},             // Schild: kevesebb sebzés rossz válasznál
      heal:      {},             // Heilung: ennyi életet ad (ital)
      goldBonus: { unit: '%' },  // Gold: több arany
      luck:      { unit: '%' },  // Glück: jobb láda-csillag
      hint:      { unit: '%' },  // Hilfe: ekkora eséllyel kiesik egy rossz válasz
    },
  },
};
