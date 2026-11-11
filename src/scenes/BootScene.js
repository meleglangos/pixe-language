// Betölti az assets.js-ben megadott képeket, a többit placeholderként megrajzolja.
(function () {
  class BootScene extends Phaser.Scene {
    constructor() { super('Boot'); }

    preload() {
      const a = Game.data.assets;
      Object.keys(a.images).forEach(key => this.load.image(key, a.images[key]));
      Object.keys(a.sheets).forEach(key => {
        const s = a.sheets[key];
        if (s.url) this.load.spritesheet(key, s.url, { frameWidth: s.frameWidth, frameHeight: s.frameHeight });
      });
    }

    create() {
      Game.gfx.generateMissing(this);
      this.scene.start('World');
    }
  }
  Game.scenes.Boot = BootScene;
})();
