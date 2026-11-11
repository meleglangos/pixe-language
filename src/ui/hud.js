// Állandó kijelzők: élet, arany, menü gomb.
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
      const menu = ui.el('div', 'hud-menu', [ui.btn('hud.menu', () => Game.menu.open())]);
      ui.root.append(hud, menu);
      Game.events.on('state', Game.hud.refresh);
      Game.hud.refresh();
    },
    refresh() {
      const s = Game.state;
      if (!s || !hpFill) return;
      hpFill.style.width = Math.round(100 * s.player.hp / s.player.maxHp) + '%';
      hpNum.textContent = s.player.hp + '/' + s.player.maxHp;
      goldNum.textContent = s.gold;
    },
  };
})();
