// Karakter (játékos, kutya): árnyék + test + opcionális rétegek (páncél, fegyver) egy konténerben.
// A konténer x,y pontja a karakter talppontja; a takarás (depth) ebből az y-ból jön.
(function () {
  const DIRS = ['down', 'left', 'right', 'up'];

  // Animáció egy csíkból (assets.js: strips). A kulcsa maga a csík kulcsa.
  function stripAnim(scene, stripKey, repeat) {
    if (!scene.anims.exists(stripKey)) {
      const def = Game.data.assets.strips[stripKey];
      scene.anims.create({
        key: stripKey, frameRate: def.frameRate, repeat: repeat === undefined ? -1 : repeat,
        frames: scene.anims.generateFrameNumbers(stripKey, {}),
      });
    }
    return stripKey;
  }
  Game.gfx.stripAnim = stripAnim;

  // 'rows' módú sheet animációi: "<sheet>:<anim>:<irány>"
  function ensureRowAnims(scene, sheetKey) {
    const def = Game.data.assets.sheets[sheetKey];
    const cols = Game.gfx.sheetCols(scene, sheetKey);
    def.rows.forEach((dir, row) => {
      Object.keys(def.anims).forEach(name => {
        const key = sheetKey + ':' + name + ':' + dir;
        if (scene.anims.exists(key)) return;
        const a = def.anims[name];
        scene.anims.create({
          key, frameRate: a.frameRate, repeat: -1,
          frames: a.frames.map(c => ({ key: sheetKey, frame: row * cols + c })),
        });
      });
    });
  }

  class Character {
    constructor(scene, sheetKey, x, y) {
      this.scene = scene;
      this.sheetKey = sheetKey;
      this.def = Game.data.assets.sheets[sheetKey];
      this.side = this.def.mode === 'side';
      this.dir = 'down';     // merre néz (mentéshez, irányításhoz)
      this.hdir = 'right';   // utolsó vízszintes irány ('side' módban ez dönti el a tükrözést)
      this.moving = false;
      this.layers = {};

      let texture = sheetKey;
      if (this.side) {
        Object.keys(this.def.anims).forEach(name => stripAnim(scene, this.def.anims[name]));
        texture = this.def.anims.idle;
      } else ensureRowAnims(scene, sheetKey);

      const originY = this.def.footY / this.def.frameHeight;
      this.shadow = scene.add.image(0, 0, 'fx_shadow').setOrigin(0.5, 0.5);
      this.body = scene.add.sprite(0, 0, texture, 0).setOrigin(0.5, originY);
      this.container = scene.add.container(x, y, [this.shadow, this.body]);
      this.container.setSize(16, 16);
      this.play();
      this.syncDepth();
    }

    get x() { return this.container.x; }
    get y() { return this.container.y; }
    setPosition(x, y) { this.container.setPosition(x, y); this.syncDepth(); }
    syncDepth() { this.container.setDepth(this.container.y); }

    // Felszerelés-réteg a test fölé (a testtel azonos elrendezésű sheet). textureKey = null -> levétel.
    setLayer(name, textureKey) {
      if (this.layers[name]) { this.layers[name].destroy(); delete this.layers[name]; }
      if (!textureKey || !this.scene.textures.exists(textureKey)) return;
      const s = this.scene.add.sprite(0, 0, textureKey, 0).setOrigin(0.5, this.body.originY);
      this.layers[name] = s;
      this.container.add(s);
    }

    faceVector(dx, dy) {
      if (!dx && !dy) return;
      let dir;
      if (Math.abs(dx) > Math.abs(dy) + 0.01) dir = dx < 0 ? 'left' : 'right';
      else if (Math.abs(dy) > Math.abs(dx) + 0.01) dir = dy < 0 ? 'up' : 'down';
      else { // átló: maradjon az eddigi irány, ha az egyik összetevő
        const h = dx < 0 ? 'left' : 'right', v = dy < 0 ? 'up' : 'down';
        dir = this.dir === h || this.dir === v ? this.dir : h;
      }
      if (Math.abs(dx) > 0.01) this.hdir = dx < 0 ? 'left' : 'right';
      this.face(dir);
    }
    face(dir) {
      if (DIRS.indexOf(dir) < 0) return;
      if (dir === 'left' || dir === 'right') this.hdir = dir;
      this.dir = dir;
      this.play();
    }
    setMoving(moving) {
      if (moving === this.moving) return;
      this.moving = moving; this.play();
    }
    play() {
      const name = this.moving ? 'walk' : 'idle';
      if (this.side) {
        this.body.setFlipX(this.hdir === 'left');
        this.body.play(this.def.anims[name], true);
      } else this.body.play(this.sheetKey + ':' + name + ':' + this.dir, true);
    }
    // Minden képkockában: a rétegek kövessék a test képkockáját.
    update() {
      const frame = this.body.frame.name;
      for (const k in this.layers) this.layers[k].setFrame(frame).setFlipX(this.body.flipX);
      this.syncDepth();
    }
  }

  // A kutya a játékos nyomvonalát követi, így mindig járható úton megy.
  class Pet extends Character {
    constructor(scene, x, y) {
      super(scene, 'pet', x, y);
      this.trail = [];
      this.shadow.setScale(0.8);
    }
    resetTo(x, y) { this.trail = []; this.setPosition(x, y); }

    follow(leader, dt) {
      const cfg = Game.data.config;
      const last = this.trail[this.trail.length - 1];
      if (!last || Math.hypot(leader.x - last.x, leader.y - last.y) >= 2) this.trail.push({ x: leader.x, y: leader.y });

      // a nyomvonal hossza a kutyától a gazdiig
      let len = 0, px = this.x, py = this.y;
      for (const p of this.trail) { len += Math.hypot(p.x - px, p.y - py); px = p.x; py = p.y; }
      if (len > 160) { this.resetTo(leader.x, leader.y); this.setMoving(false); return; }

      let step = Math.min(len - cfg.pet.followDistance, cfg.player.speed * cfg.pet.speedFactor * dt);
      if (step <= 0.01) { this.setMoving(false); return; }
      let x = this.x, y = this.y;
      const sx = x, sy = y;
      while (step > 0 && this.trail.length) {
        const p = this.trail[0], d = Math.hypot(p.x - x, p.y - y);
        if (d <= step) { x = p.x; y = p.y; step -= d; this.trail.shift(); }
        else { x += (p.x - x) / d * step; y += (p.y - y) / d * step; step = 0; }
      }
      this.faceVector(x - sx, y - sy);
      this.setPosition(x, y);
      this.setMoving(true);
    }
  }

  // Szörny: egy helyben áll az idle animációjával, és a játékos felé fordul.
  // (A csomag szörnyei jobbra néznek; balra tükrözéssel.)
  class Mob {
    constructor(scene, type, x, y) {
      this.type = type;
      this.shadow = scene.add.image(0, 0, 'fx_shadow').setOrigin(0.5, 0.5);
      this.body = scene.add.sprite(0, 0, type.idle, 0).setOrigin(0.5, 1);
      this.body.play({ key: stripAnim(scene, type.idle), startFrame: Math.floor(Math.random() * 4) });
      this.container = scene.add.container(x, y, [this.shadow, this.body]).setDepth(y);
    }
    get x() { return this.container.x; }
    get y() { return this.container.y; }
    lookAt(target) { if (Math.abs(target.x - this.x) > 2) this.body.setFlipX(target.x < this.x); }
  }

  Game.world.Character = Character;
  Game.world.Pet = Pet;
  Game.world.Mob = Mob;
})();
