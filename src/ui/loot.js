// A "Beute" ablak: mit adott a láda. Ikon (2× nagyítva, éles pixel art) + német név a "?"-lel + darabszám;
// a sor bal széle a tárgy ritkaságának színe. Az arany külön sor, összeggel.
//   Game.lootUI.show([{ gold } | { item, qty }], onOk)   -- külön ablakban
//   Game.lootUI.list(loot), Game.lootUI.icon(icon)        -- elemek más ablakba (pl. a láda-ablak)
(function () {
  const ui = Game.ui;
  const SCALE = 2;

  // DOM-ikon a Game.itemIcons leírásából: CSS háttér a lapról, 2× nagyítva
  function iconEl(icon) {
    const p = Game.itemIcons.parse(icon);
    const el = ui.el('span', 'loot-icon');
    if (!p) return el;
    el.style.backgroundImage = 'url("' + encodeURI(p.url) + '")';
    if (p.sheet) {
      el.style.backgroundSize = (384 * SCALE) + 'px ' + (320 * SCALE) + 'px'; // a fegyverlapok mérete
      el.style.backgroundPosition = (-p.x * SCALE) + 'px ' + (-p.y * SCALE) + 'px';
    }
    return el;
  }

  function row(e) {
    if (e.gold !== undefined) {
      return ui.el('li', 'loot-row', [iconEl(Game.data.config.loot.goldIcon), ui.el('span', 'loot-name', [ui.tx('loot.gold')]), ui.el('span', 'loot-qty', [String(e.gold)])]);
    }
    const it = Game.data.items[e.item];
    const rarity = Game.data.config.rarities.find(r => r.id === it.rarity);
    const name = ui.el('span', 'loot-name', [ui.tx(it.name)]);
    const kids = [iconEl(it.icon), ui.el('span', 'loot-text', [name, ui.el('span', 'loot-desc small', [ui.tx(it.desc)])])];
    kids.push(ui.el('span', 'loot-qty', [e.qty > 1 ? '×' + e.qty : '']));
    const li = ui.el('li', 'loot-row', kids);
    if (rarity) li.style.setProperty('--rarity', rarity.color); // a sor bal széle a ritkaság színe
    return li;
  }

  Game.lootUI = {
    icon: iconEl,                                                   // a láda-ablak is ezzel rajzol ikont
    list: loot => ui.el('ul', 'loot-list', loot.map(row)),          // a zsákmány listája (láda-ablak, "Beute")
    show(loot, onOk) {
      const ok = () => { ui.closeModal(); if (onOk) onOk(); };
      ui.modal({
        title: 'loot.title',
        body: [ui.el('ul', 'loot-list', loot.map(row))],
        buttons: [ui.btn('loot.ok', ok, 'primary')],
        closable: false,
      });
    },
  };
})();
