// Állandó kijelzők: élet, arany; jobb felül táska és menü (☰) ikon-gomb.
(function () {
  const ui = Game.ui;
  let hpFill, hpNum, goldNum;

  Game.hud = {
    init() {
      hpFill = ui.el('div', 'bar-fill');
      hpNum = ui.el('span', 'num');
      goldNum = ui.el('span', 'num');
      const hud = ui.el('div', 'hud panel', [
        ui.el('div', 'hud-row', [ui.el('span', 'icon heart'), ui.tx('hud.hp'), ui.el('div', 'bar', [hpFill]), hpNum]),
        ui.el('div', 'hud-row', [ui.el('span', 'icon coin'), ui.tx('hud.gold'), goldNum]),
      ]);
      // jobb felül két ikon-gomb, felirat nélkül (helytakarékos): táska és menü (☰)
      const iconBtn = (cls, key, kids, fn) => {
        const b = ui.el('button', 'hud-icon ' + cls, kids);
        b.type = 'button';
        b.setAttribute('aria-label', Game.i18n.de(key));
        b.title = Game.i18n.de(key);
        b.addEventListener('click', fn);
        return b;
      };
      const menu = ui.el('div', 'hud-menu', [
        iconBtn('bag', 'hud.bag', [Game.lootUI.icon(Game.data.config.items.bagIcon, 2)], () => Game.bag.open()),
        iconBtn('burger', 'hud.menu', [ui.el('span'), ui.el('span'), ui.el('span')], () => Game.menu.open()),
      ]);
      ui.root.append(hud, menu);
      // dungeonben: a hely neve + kijárat gomb
      let bar = null;
      Game.events.on('scene', info => {
        if (bar) { bar.remove(); bar = null; }
        if (info.key !== 'Dungeon') return;
        bar = ui.el('div', 'place-bar panel', [ui.el('span', 'place-name', [ui.tx(info.name)]), ui.btn('dungeon.exit', info.exit)]);
        ui.root.append(bar);
      });
      // a központi állapot változására frissül (state/GameState.js)
      ['state:hp', 'state:gold', 'state:replaced'].forEach(ev => Game.events.on(ev, Game.hud.refresh));
      Game.hud.refresh();
    },
    refresh() {
      const s = Game.state;
      if (!s || !hpFill) return;
      hpFill.style.width = Math.round(100 * s.hp / s.maxHp) + '%';
      hpNum.textContent = s.hp + '/' + s.maxHp;
      goldNum.textContent = s.gold;
    },
  };
})();
