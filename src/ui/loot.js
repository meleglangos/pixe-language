// A "Beute" ablak: mit adott a láda. Ikon (2× nagyítva, éles pixel art) + német név a "?"-lel + darabszám, alatta
// kategória · ritkaság és a passzívok ("+2 Angriff"); a sor bal széle a tárgy ritkaságának színe; a legritkább elöl. Az arany külön sor, összeggel.
//   Game.lootUI.show([{ gold } | { item, qty }], onOk)   -- külön ablakban
//   Game.lootUI.list(loot), Game.lootUI.icon(icon)        -- elemek más ablakba (pl. a láda-ablak)
(function () {
  const ui = Game.ui;
  const SCALE = 2;

  // DOM-ikon a Game.itemIcons leírásából: CSS háttér a lapról, egész számú nagyítással (alap: 2×)
  function iconEl(icon, scale) {
    const k = scale || SCALE;
    const p = Game.itemIcons.parse(icon);
    const el = ui.el('span', 'loot-icon');
    el.style.width = el.style.height = (16 * k) + 'px';
    if (!p) return el;
    el.style.backgroundImage = 'url("' + encodeURI(p.url) + '")';
    if (p.sheet) {
      el.style.backgroundSize = (384 * k) + 'px ' + (320 * k) + 'px'; // a fegyverlapok mérete
      el.style.backgroundPosition = (-p.x * k) + 'px ' + (-p.y * k) + 'px';
    } else el.style.backgroundSize = (16 * k) + 'px ' + (16 * k) + 'px';
    return el;
  }

  // a passzívok: "+2 Angriff", "+10% Gold" (német név a "?"-lel)
  function statsEl(it) {
    return ui.el('span', 'loot-stats', Game.items.stats(it).map(st =>
      ui.el('span', 'loot-stat', ['+' + st.value + st.unit + '\u00A0', ui.tx('stat.' + st.id)])));
  }
  // kategória · ritkaság (a ritkaság a színével)
  function kindRarityEl(it) {
    const r = Game.items.rarity(it.rarity);
    const rar = ui.tx('rarity.' + it.rarity, null, 'loot-rarity');
    if (r) rar.style.setProperty('--rarity', r.color);
    return ui.el('span', 'loot-kind', [ui.tx('kind.' + it.kind), ' · ', rar]);
  }

  function row(e) {
    if (e.gold !== undefined) {
      return ui.el('li', 'loot-row', [iconEl(Game.data.config.loot.goldIcon), ui.el('span', 'loot-name', [ui.tx('loot.gold')]), ui.el('span', 'loot-qty', [String(e.gold)])]);
    }
    const it = Game.data.items[e.item];
    const rarity = Game.items.rarity(it.rarity);
    const name = ui.el('span', 'loot-name', [ui.tx(it.name)]);
    const text = [name, kindRarityEl(it)];
    if (it.stats) text.push(statsEl(it));
    if (it.desc) text.push(ui.el('span', 'loot-desc small', [ui.tx(it.desc)]));
    const kids = [iconEl(it.icon), ui.el('span', 'loot-text', text)];
    kids.push(ui.el('span', 'loot-qty', [e.qty > 1 ? '×' + e.qty : '']));
    const li = ui.el('li', 'loot-row', kids);
    if (rarity) li.style.setProperty('--rarity', rarity.color); // a sor bal széle a ritkaság színe
    return li;
  }
  // a lista sorrendje: arany elöl, utána a legritkább tárgy
  const sorted = loot => loot.filter(e => e.gold !== undefined).concat(loot.filter(e => e.gold === undefined).sort((a, b) => Game.items.compare(a.item, b.item)));

  Game.lootUI = {
    icon: iconEl,                                                   // (icon, nagyítás) – a láda-ablak is ezzel rajzol
    list: loot => ui.el('ul', 'loot-list', sorted(loot).map(row)),  // a zsákmány listája (láda-ablak, "Beute"), a legritkább elöl
    stats: statsEl,                                                 // a tárgy passzívjai (láda-ablak)
    kindRarity: kindRarityEl,                                       // kategória · ritkaság
    show(loot, onOk) {
      const ok = () => { ui.closeModal(); if (onOk) onOk(); };
      ui.modal({
        title: 'loot.title',
        body: [ui.el('ul', 'loot-list', sorted(loot).map(row))],
        buttons: [ui.btn('loot.ok', ok, 'primary')],
        closable: false,
      });
    },
  };
})();
