// Játékegyensúly és általános beállítások.
Game.data.config = {
  storageKey: 'deutsch-abenteuer.save',
  exportPrefix: 'DA1',

  player: {
    speed: 72,        // pixel / másodperc (16 pixel = 1 mező)
    maxHp: 20,
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
