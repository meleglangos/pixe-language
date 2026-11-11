// Indítás.
(function () {
  function start() {
    Game.save.load();
    Game.ui.init();

    if (!window.Phaser || !window.EasyStar) {
      Game.ui.modal({ title: 'game.title', closable: false, body: [Game.ui.el('p', '', [Game.ui.tx('error.libs')])] });
      return;
    }

    Game.hud.init();
    Game.phaser = new Phaser.Game({
      type: Phaser.AUTO,
      parent: 'game',
      backgroundColor: '#3f8fd0',
      pixelArt: true,
      roundPixels: true,
      scale: { mode: Phaser.Scale.RESIZE, width: '100%', height: '100%' },
      scene: [Game.scenes.Boot, Game.scenes.World, Game.scenes.Dungeon],
      // file:// alól (dupla kattintás az index.html-re) a böngésző nem engedi a képeket WebGL-be tölteni:
      ...(location.protocol === 'file:' ? { type: Phaser.CANVAS, loader: { imageLoadType: 'HTMLImageElement' } } : {}),
    });

    // mentés, amikor a lap háttérbe kerül vagy bezárul
    const flush = () => {
      const world = Game.phaser.scene.getScene('World');
      if (world && world.player && world.scene.isActive()) world.saveNow();
    };
    document.addEventListener('visibilitychange', () => { if (document.hidden) flush(); });
    window.addEventListener('pagehide', flush);

    if (!Game.state.flags.introSeen) Game.menu.intro();
  }

  if (document.readyState === 'complete') start(); else window.addEventListener('load', start);
})();
