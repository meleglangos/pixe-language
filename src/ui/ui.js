// DOM-alapú felület a játék fölött. Minden szöveg a fordítási fájlból (data/translations.json) jön kulccsal,
// és kap egy "?" gombot, ami a magyar fordítást mutatja.
(function () {
  const ui = Game.ui = { root: null, modalEl: null };
  let bubble = null, bubbleFor = null, toastEl = null, toastTimer = 0;

  ui.el = function (tag, cls, kids) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    (kids || []).forEach(k => e.append(k));
    return e;
  };

  // "?" gomb: a buborék a fordítási fájlból (data/translations.json) mutatja a kulcs magyar változatát.
  ui.help = function (key, vars) {
    const b = ui.el('button', 'help', ['?']);
    b.type = 'button';
    b.setAttribute('aria-label', Game.i18n.de('ui.translation'));
    b.dataset.key = key;
    if (vars) b.dataset.vars = JSON.stringify(vars);
    return b;
  };

  // Német szöveg + "?"
  ui.tx = function (key, vars, cls) {
    return ui.el('span', 'tx' + (cls ? ' ' + cls : ''), [
      ui.el('span', 'de', [Game.i18n.de(key, vars) + '\u00A0']), // nem törhető szóköz: a "?" ne kerüljön külön sorba
      ui.help(key, vars),
    ]);
  };

  // Gomb + "?" (a "?" a gomb mellett van, nem benne)
  ui.btn = function (key, onClick, cls) {
    const b = ui.el('button', 'btn' + (cls ? ' ' + cls : ''), [Game.i18n.de(key)]);
    b.type = 'button';
    b.addEventListener('click', onClick);
    return ui.el('span', 'btn-wrap', [b, ui.help(key)]);
  };

  // ---------- fordítás-buborék ----------
  function showBubble(anchor) {
    bubble.textContent = Game.i18n.hu(anchor.dataset.key, anchor.dataset.vars ? JSON.parse(anchor.dataset.vars) : undefined);
    bubble.hidden = false;
    bubbleFor = anchor;
    const a = anchor.getBoundingClientRect(), b = bubble.getBoundingClientRect();
    const vw = window.innerWidth, m = 8;
    const left = Math.max(m, Math.min(vw - b.width - m, a.left + a.width / 2 - b.width / 2));
    let top = a.top - b.height - 8;
    if (top < m) top = a.bottom + 8;
    bubble.style.left = left + 'px';
    bubble.style.top = top + 'px';
  }
  function hideBubble() { bubble.hidden = true; bubbleFor = null; }

  // ---------- ablak ----------
  // opts: { title: kulcs, body: [elemek], buttons: [elemek], closable: true }
  ui.modal = function (opts) {
    ui.closeModal();
    const panel = ui.el('div', 'panel modal', [
      ui.el('h2', '', [ui.tx(opts.title)]),
      ui.el('div', 'modal-body', opts.body || []),
      ui.el('div', 'modal-buttons', opts.buttons || []),
    ]);
    const backdrop = ui.el('div', 'backdrop', [panel]);
    if (opts.closable !== false) backdrop.addEventListener('click', e => { if (e.target === backdrop) ui.closeModal(); });
    ui.root.append(backdrop);
    ui.modalEl = backdrop;
    return panel;
  };
  ui.closeModal = function () {
    if (ui.modalEl) { ui.modalEl.remove(); ui.modalEl = null; }
    hideBubble();
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  };
  // Amíg ablak van nyitva, a játék nem reagál a bemenetre.
  ui.isBlocking = () => !!ui.modalEl;

  // ---------- rövid üzenet ----------
  ui.toast = function (key, vars) {
    if (toastEl) toastEl.remove();
    clearTimeout(toastTimer);
    toastEl = ui.el('div', 'toast panel', [ui.tx(key, vars)]);
    ui.root.append(toastEl);
    const el = toastEl;
    toastTimer = setTimeout(() => { if (bubbleFor && el.contains(bubbleFor)) hideBubble(); el.remove(); }, 3200);
  };

  // ---------- alsó panel: helyszín, szörny, láda... ----------
  // cfg: { type, name, desc: szövegkulcsok, action: { key, fn } | null }
  ui.prompt = {
    el: null,
    show(cfg) {
      this.hide();
      const kids = [
        ui.el('div', 'poi-type', [ui.tx(cfg.type)]),
        ui.el('div', 'poi-name', [ui.tx(cfg.name)]),
        ui.el('div', 'poi-desc', [ui.tx(cfg.desc)]),
      ];
      if (cfg.action) kids.push(ui.el('div', 'poi-actions', [ui.btn(cfg.action.key, cfg.action.fn, 'primary')]));
      this.el = ui.el('div', 'poi-prompt panel', kids);
      ui.root.append(this.el);
    },
    hide() {
      if (!this.el) return;
      if (bubbleFor && this.el.contains(bubbleFor)) hideBubble();
      this.el.remove(); this.el = null;
    },
  };

  ui.init = function () {
    ui.root = document.getElementById('ui');
    bubble = ui.el('div', 'bubble');
    bubble.hidden = true;
    document.body.append(bubble);

    document.addEventListener('click', e => {
      const h = e.target.closest && e.target.closest('.help');
      if (h) { e.stopPropagation(); if (bubbleFor === h && h.dataset.pinned) { delete h.dataset.pinned; hideBubble(); } else { showBubble(h); h.dataset.pinned = '1'; } }
      else hideBubble();
    }, true);
    // egérrel elég fölé vinni
    document.addEventListener('mouseover', e => {
      const h = e.target.closest && e.target.closest('.help');
      if (h && bubbleFor !== h) { showBubble(h); delete h.dataset.pinned; }
    });
    document.addEventListener('mouseout', e => {
      const h = e.target.closest && e.target.closest('.help');
      if (h && bubbleFor === h && !h.dataset.pinned) hideBubble();
    });
    document.getElementById('game').addEventListener('pointerdown', hideBubble);
    window.addEventListener('resize', hideBubble);
  };
})();
