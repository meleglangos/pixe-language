// Betölti az assets.js-ben megadott képeket, a többit placeholderként megrajzolja.
(function () {
  class BootScene extends Phaser.Scene {
    constructor() { super('Boot'); }

    preload() {
      const a = Game.data.assets;
      const url = p => encodeURI(p);
      this.load.on('loaderror', file => console.error('Nem sikerült betölteni:', file.key, file.url));
      Object.keys(a.images).forEach(key => this.load.image(key, url(a.images[key])));
      Object.keys(a.files).forEach(key => this.load.image(key, url(a.files[key])));
      Object.keys(a.strips).forEach(key => {
        const s = a.strips[key];
        this.load.spritesheet(key, url(s.url), { frameWidth: s.frameWidth, frameHeight: s.frameHeight });
      });
      Object.keys(a.sheets).forEach(key => {
        const s = a.sheets[key];
        if (s.url) this.load.spritesheet(key, url(s.url), { frameWidth: s.frameWidth, frameHeight: s.frameHeight });
      });
    }

    create() {
      const a = Game.data.assets;
      // névvel ellátott kivágások: this.add.image(x, y, fájlkulcs, név)
      Object.keys(a.frames).forEach(name => {
        const [file, x, y, w, h] = a.frames[name];
        if (this.textures.exists(file)) this.textures.get(file).add(name, 0, x, y, w, h);
      });
      // A Tiled térképek a Phaser tilemap-cache-be is bekerülnek ('map_<id>'), így bármelyik jelenet
      // a Phaser saját Tiled-olvasójával is megnyithatja őket: this.make.tilemap({ key: 'map_overworld' }).
      Object.keys(Game.data.maps).forEach(id => {
        this.cache.tilemap.add('map_' + id, { format: Phaser.Tilemaps.Formats.TILED_JSON, data: Game.data.maps[id] });
      });
      Game.gfx.buildDerived(this);
      Game.gfx.generateMissing(this);
      this.scene.start('World');
    }
  }
  Game.scenes.Boot = BootScene;
})();
