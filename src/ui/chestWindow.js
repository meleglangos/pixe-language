// A láda-ablak: a láda nagyban, alatta 1–5 csillag (a láda minősége, véletlen), koppintásra kinyílik,
// a loot kiesik belőle, alul a lista és a "Super!" gomb. Spec: docs/features/chest_stars.md.
//
//   Game.chestWindow.open({ style: chest_styles.json bejegyzés, table: loot tábla id, onDone(loot, stars) })
//
// A láda képe canvasra rajzolódik a láda-stílus képkockáiból (kivágás vagy animációs csík), 5× nagyítva,
// éles pixel arttal -- így bármelyik láda-stílus működik vele. A loot most csak látvány (nem tárolódik).
(function () {
  const ui = Game.ui;
  const SCALE = 5;
  const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.8l3.1 6.6 7.2.9-5.3 5 1.4 7.1L12 17.9 5.6 21.4 7 14.3 1.7 9.3l7.2-.9z"/></svg>';
  const images = {};

  // egy kép (a Phaser már betöltötte; ha nincs Phaser, betöltjük) -> Promise<Image>
  function image(key, url) {
    const tex = window.Game.phaser && Game.phaser.textures && Game.phaser.textures.exists(key) && Game.phaser.textures.get(key).getSourceImage();
    if (tex) return Promise.resolve(tex);
    if (!images[url]) images[url] = new Promise((ok, fail) => { const im = new Image(); im.onload = () => ok(im); im.onerror = fail; im.src = encodeURI(url); });
    return images[url];
  }

  // a láda-stílus egy képkockája: { key, url, x, y, w, h }
  function frameOf(style, which) {
    const a = Game.data.assets;
    if (style.strip) {
      const s = a.strips[style.strip];
      const i = which === 'closed' ? (style.closedFrame || 0) : which;
      return { key: style.strip, url: s.url, x: i * s.frameWidth, y: 0, w: s.frameWidth, h: s.frameHeight };
    }
    const [key, x, y, w, h] = a.frames[which === 'closed' ? style.closed : style.open];
    return { key, url: a.files[key], x, y, w, h };
  }

  function draw(canvas, f) {
    return image(f.key, f.url).then(im => {
      canvas.width = f.w * SCALE; canvas.height = f.h * SCALE;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(im, f.x, f.y, f.w, f.h, 0, 0, f.w * SCALE, f.h * SCALE);
    });
  }

  const wait = ms => new Promise(r => setTimeout(r, ms));
  const anim = (el, frames, opts) => (el.animate ? el.animate(frames, opts).finished.catch(() => {}) : Promise.resolve());

  Game.chestWindow = {
    open(opts) {
      const style = opts.style, table = opts.table;
      const stars = Game.loot.rollStars(table);
      const loot = Game.loot.roll(table, { stars });

      const canvas = ui.el('canvas', 'cw-chest');
      const glow = ui.el('div', 'cw-glow');
      const drop = ui.el('div', 'cw-drop');           // ide esnek a tárgyak
      const chestBox = ui.el('button', 'cw-chest-box', [glow, canvas]);
      chestBox.type = 'button';
      chestBox.disabled = true;
      chestBox.setAttribute('aria-label', Game.i18n.de('chest.name'));
      const starEls = [0, 1, 2, 3, 4].map(() => { const s = ui.el('span', 'cw-star'); s.innerHTML = STAR; return s; });
      const starRow = ui.el('div', 'cw-stars', starEls);
      const caption = ui.el('div', 'cw-caption');
      const stage = ui.el('div', 'cw-stage', [chestBox, drop]);
      const panel = ui.modal({ title: 'chest.name', closable: false, body: [stage, starRow, caption], buttons: [] });
      panel.classList.add('chest-window');
      panel.dataset.stars = stars;

      const light = n => starEls.forEach((s, i) => s.classList.toggle('on', i < n));

      // 1. a csillagok "pörögnek", és lassulva megállnak a kisorsolt számnál
      async function spinStars() {
        const ticks = 10 + stars;
        for (let k = 0; k < ticks; k++) { light((k % 5) + 1); await wait(55 + k * 9); }
        light(stars);
        starEls.slice(0, stars).forEach((s, i) => anim(s, [{ transform: 'scale(1)' }, { transform: 'scale(1.45)' }, { transform: 'scale(1)' }], { duration: 320, delay: i * 70 }));
        if (stars === 5) panel.classList.add('cw-five');
        caption.replaceChildren(ui.el('div', 'cw-count', [ui.tx('chest.stars', { n: stars })]), ui.el('div', 'cw-hint', [ui.tx('chest.tapToOpen')]));
        chestBox.disabled = false;
        chestBox.classList.add('ready');
      }

      // 2. koppintásra: remegés, kinyílás (képkocka vagy animáció), villanás és szikrák
      async function openUp() {
        if (chestBox.disabled) return;
        chestBox.disabled = true;
        chestBox.classList.remove('ready');
        caption.querySelector('.cw-hint') && caption.querySelector('.cw-hint').remove();
        await anim(canvas, [0, -6, 6, -5, 5, -3, 3, 0].map(x => ({ transform: 'translateX(' + x + 'px)' })), { duration: 420 });
        if (style.strip) {
          for (const f of style.openFrames) { await draw(canvas, frameOf(style, f)); await wait(1000 / (style.fps || 12)); }
        } else await draw(canvas, frameOf(style, 'open'));
        glow.classList.add('burst');
        for (let i = 0; i < 14; i++) {
          const sp = ui.el('span', 'cw-spark');
          stage.append(sp);
          const ang = Math.PI * (1.05 + Math.random() * 0.9), d = 50 + Math.random() * 60;
          anim(sp, [{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: 'translate(' + Math.cos(ang) * d + 'px,' + Math.sin(ang) * d + 'px) scale(.3)', opacity: 0 }],
            { duration: 600 + Math.random() * 300, easing: 'ease-out' }).then(() => sp.remove());
        }
        await dropLoot();
      }

      // 3. a loot ívben kiesik a ládából, sorba rendeződik alatta; utána a lista és a "Super!" gomb
      async function dropLoot() {
        const n = loot.length;
        const flights = loot.map((e, i) => {
          const it = e.item && Game.data.items[e.item];
          const icon = Game.lootUI.icon(it ? it.icon : Game.data.config.loot.goldIcon);
          icon.classList.add('cw-loot');
          const rarity = it && Game.data.config.rarities.find(r => r.id === it.rarity);
          if (rarity) icon.style.setProperty('--rarity', rarity.color);
          drop.append(icon);
          const tx = (i - (n - 1) / 2) * 46;
          return anim(icon, [
            { transform: 'translate(0px, -70px) scale(.4)', opacity: 0 },
            { transform: 'translate(' + tx * 0.5 + 'px, -120px) scale(1.1)', opacity: 1, offset: 0.45 },
            { transform: 'translate(' + tx + 'px, 0px) scale(1)', opacity: 1, offset: 0.85 },
            { transform: 'translate(' + tx + 'px, -8px) scale(1)', opacity: 1, offset: 0.93 },
            { transform: 'translate(' + tx + 'px, 0px) scale(1)', opacity: 1 },
          ], { duration: 750, delay: 200 * i, easing: 'ease-in-out', fill: 'both' });
        });
        await Promise.all(flights);
        await wait(250);
        panel.querySelector('.modal-body').append(Game.lootUI.list(loot));
        const done = () => { ui.closeModal(); if (opts.onDone) opts.onDone(loot, stars); };
        const btns = panel.querySelector('.modal-buttons');
        btns.replaceChildren(ui.btn('loot.ok', done, 'primary'));
        const b = btns.querySelector('button');
        setTimeout(() => { if (b.isConnected) { b.focus({ preventScroll: true }); b.scrollIntoView({ block: 'nearest' }); } }, 0);
      }

      chestBox.addEventListener('click', openUp);
      draw(canvas, frameOf(style, 'closed')).then(spinStars, () => spinStars());
      return { stars, loot };
    },
  };
})();
