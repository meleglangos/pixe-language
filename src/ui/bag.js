// A „Tasche” ablak: a táska tartalma (Game.state.inventory). Spec: docs/features/inventory.md.
//   fent: szűrő (Alle / kategóriák, darabszámmal) és rendezés (Seltenheit, Kategorie, Name, Wert, Anzahl)
//   középen: rács — ikon a ritkaság színű kerettel, jobb alul a darabszám
//   koppintásra felugró kártya: a kiválasztott tárgy részletei (név, kategória · ritkaság, passzívok, érték, darabszám) és a műveletei:
//         italnál „Trinken” (később: felvenni, eladni)
//   Game.bag.open()
(function () {
  const ui = Game.ui;
  const de = (k, v) => Game.i18n.de(k, v);
  const SORTS = ['rarity', 'kind', 'name', 'value', 'count'];
  // a választás a játék futása alatt megmarad (nem mentjük)
  const view = { kind: '', sort: 'rarity', selected: null };

  function entries() {
    return Game.state.inventory.map(e => ({ it: Game.items.get(e.id), qty: e.qty })).filter(e => e.it);
  }
  function sorted(list) {
    const name = e => de(e.it.name).replace(/^(der|die|das)\s+/i, '');
    const cmp = {
      rarity: (a, b) => Game.items.compare(a.it, b.it),
      kind: (a, b) => (Object.keys(Game.data.config.items.kinds).indexOf(a.it.kind) - Object.keys(Game.data.config.items.kinds).indexOf(b.it.kind)) || Game.items.compare(a.it, b.it),
      name: (a, b) => name(a).localeCompare(name(b), 'de'),
      value: (a, b) => (Game.items.value(b.it) - Game.items.value(a.it)) || Game.items.compare(a.it, b.it),
      count: (a, b) => (b.qty - a.qty) || Game.items.compare(a.it, b.it),
    }[view.sort];
    return list.slice().sort(cmp);
  }

  function select(options, value, onChange, label) {
    const s = ui.el('select', 'bag-select');
    s.setAttribute('aria-label', label);
    options.forEach(([v, text]) => { const o = ui.el('option', '', [text]); o.value = v; o.selected = v === value; s.append(o); });
    s.addEventListener('change', () => onChange(s.value));
    return s;
  }

  function slot(e) {
    const r = Game.items.rarity(e.it.rarity);
    const b = ui.el('button', 'bag-slot' + (view.selected === e.it.id ? ' on' : ''), [Game.lootUI.icon(e.it.icon, 3)]);
    b.type = 'button';
    b.setAttribute('aria-label', de(e.it.name));
    if (r) b.style.setProperty('--rarity', r.color);
    if (e.qty > 1) b.append(ui.el('span', 'bag-qty', [String(e.qty)]));
    b.addEventListener('click', () => { view.selected = e.it.id; render(); });
    return b;
  }

  // a tárgy műveletei (most: ital ivása)
  function actions(e) {
    const out = [];
    const heal = (e.it.stats || {}).heal;
    if (e.it.kind === 'potion' && heal) {
      out.push(ui.btn('bag.drink', () => {
        const r = Game.items.use(e.it.id);
        if (!r.ok) { if (r.reason === 'full') ui.toast('bag.full'); return; }
        ui.toast('bag.drank', { n: r.heal });
        if (!Game.state.hasItem(e.it.id)) view.selected = null;
        render();
      }, 'primary'));
    }
    return out;
  }

  // a kiválasztott tárgy kártyája: felugrik a táska fölé (nem a lista alján), a háttérre vagy a gombra koppintva bezárul
  function popup(e) {
    const close = () => { view.selected = null; render(); };
    const card = details(e);
    card.append(ui.el('div', 'bag-actions bag-close', [ui.btn('common.close', close)]));
    const back = ui.el('div', 'bag-pop', [card]);
    back.addEventListener('click', ev => { if (ev.target === back) close(); });
    return back;
  }

  function details(e) {
    const r = Game.items.rarity(e.it.rarity);
    const box = ui.el('div', 'bag-detail', [
      ui.el('div', 'bag-detail-head', [Game.lootUI.icon(e.it.icon, 3), ui.el('div', 'bag-detail-text', [
        ui.el('div', 'loot-name', [ui.tx(e.it.name)]),
        Game.lootUI.kindRarity(e.it),
        e.it.stats ? Game.lootUI.stats(e.it) : '',
        ui.el('div', 'bag-meta', [ui.tx('bag.value'), ' ' + Game.items.value(e.it) + ' · ', ui.tx('bag.count'), ' ' + e.qty]),
      ])]),
    ]);
    if (r) box.style.setProperty('--rarity', r.color);
    const act = actions(e);
    if (act.length) box.append(ui.el('div', 'bag-actions', act));
    return box;
  }

  let body = null;
  function render() {
    if (!body || !body.isConnected) return;
    const all = entries();
    const kinds = Object.keys(Game.data.config.items.kinds).filter(k => all.some(e => e.it.kind === k));
    if (view.kind && kinds.indexOf(view.kind) < 0) view.kind = '';
    const list = sorted(all.filter(e => !view.kind || e.it.kind === view.kind));
    if (view.selected && !list.some(e => e.it.id === view.selected)) view.selected = null; // a szűrő elrejtette
    if (!all.length) { body.replaceChildren(ui.el('p', 'bag-empty', [ui.tx('bag.empty')])); return; }
    const count = k => all.filter(e => !k || e.it.kind === k).reduce((a, e) => a + 1, 0);
    const controls = ui.el('div', 'bag-controls', [
      ui.el('label', 'bag-control', [
        select([['', de('bag.all') + ' (' + count('') + ')']].concat(kinds.map(k => [k, de('kind.' + k) + ' (' + count(k) + ')'])), view.kind,
          v => { view.kind = v; render(); }, de('bag.filter')),
        ui.help('bag.filter'),
      ]),
      ui.el('label', 'bag-control', [
        select(SORTS.map(s => [s, de('bag.sort.' + s)]), view.sort, v => { view.sort = v; render(); }, de('bag.sort')),
        ui.help('bag.sort'),
      ]),
    ]);
    const sel = all.find(e => e.it.id === view.selected);
    body.replaceChildren(controls, ui.el('div', 'bag-grid', list.map(slot)), ui.el('p', 'small bag-hint', [ui.tx('bag.hint')]));
    if (sel) body.append(popup(sel));
  }

  Game.bag = {
    open() {
      body = ui.el('div', 'bag');
      const panel = ui.modal({ title: 'bag.title', body: [body], buttons: [ui.btn('common.close', ui.closeModal, 'primary')] });
      panel.classList.add('bag-window');
      render();
    },
  };
  // ha közben változik a táska (pl. ivás), frissül
  Game.events.on('state:inventory', () => render());
})();
