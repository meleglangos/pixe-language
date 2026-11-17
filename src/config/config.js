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
    chestStyle: 'pc_wood',  // a láda alap kinézete (data/chest_styles.json); a dungeon "chestStyle"-ja felülírja
    lockChestUntilCleared: false, // true: a láda zárva, amíg él szörny a dungeonben (most kikapcsolva)
    // Láda-csillagok (1–5): a láda minősége. Egy loot tábla "stars" mezője bármelyik részt felülírhatja.
    stars: {
      weights: [30, 30, 20, 13, 7],                     // 1…5 csillag esélye
      rolls: [[1, 1], [1, 2], [2, 3], [3, 4], [4, 5]],  // hány tételt húz csillagonként
      gold: [1, 1.3, 1.6, 2, 3],                        // az arany mennyiségének szorzója
      // egy tétel esélye = súly × a ritkaság-csoport szorzója az adott csillagnál (bármi bármiből jöhet)
      rarityFactor: {   // 1★     2★    3★    4★    5★
        common:    [1,     0.9,  0.8,  0.6,  0.4],
        rare:      [0.15,  0.3,  0.5,  0.8,  1.2],
        epic:      [0.03,  0.06, 0.12, 0.25, 0.5],
        legendary: [0.005, 0.01, 0.03, 0.06, 0.15],
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
  rarities: [
    { id: 'common1',   color: '#b8b8b8' },
    { id: 'common2',   color: '#d0d0d0' },
    { id: 'common3',   color: '#ececec' },
    { id: 'rare1',     color: '#6aa9f0' },
    { id: 'rare2',     color: '#4a8fe8' },
    { id: 'rare3',     color: '#2f74d8' },
    { id: 'epic1',     color: '#b06ae8' },
    { id: 'epic2',     color: '#9a45dd' },
    { id: 'legendary', color: '#f0a530' },
  ],
};
