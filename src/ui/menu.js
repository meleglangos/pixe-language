// Menü, mentés export/import, új játék, üdvözlő ablak.
(function () {
  const ui = Game.ui;
  const p = (key, cls) => ui.el('p', cls || '', [ui.tx(key)]);

  // A világ újraindítása az aktuális Game.state alapján (import / új játék után).
  function restartWorld() {
    const sm = Game.phaser.scene;
    if (sm.isActive('Dungeon')) sm.stop('Dungeon');
    sm.start('World');
  }

  const menu = Game.menu = {
    open() {
      ui.modal({
        title: 'menu.title',
        body: [
          ui.el('div', 'menu-list', [
            ui.btn('menu.export', menu.exportDialog),
            ui.btn('menu.import', menu.importDialog),
            ui.btn('menu.credits', menu.creditsDialog),
            ui.btn('menu.reset', menu.resetDialog, 'danger'),
          ]),
          ui.el('h3', '', [ui.tx('menu.controls')]),
          p('menu.controlsText', 'small'),
          p('menu.autosave', 'small'),
        ],
        buttons: [ui.btn('common.close', ui.closeModal, 'primary')],
      });
    },

    exportDialog() {
      const world = Game.phaser.scene.getScene('World');
      if (world && world.saveNow) world.saveNow();
      const area = ui.el('textarea', 'code');
      area.readOnly = true;
      area.value = Game.save.exportCode();
      const status = ui.el('div', 'status');
      const say = key => { status.replaceChildren(ui.tx(key)); };
      const copy = () => {
        area.focus(); area.select();
        const fallback = () => { let ok = false; try { ok = document.execCommand('copy'); } catch (e) { /* nincs */ } say(ok ? 'export.copied' : 'export.manual'); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(area.value).then(() => say('export.copied'), fallback);
        else fallback();
      };
      ui.modal({
        title: 'export.title',
        body: [p('export.desc'), area, status],
        buttons: [ui.btn('export.copy', copy, 'primary'), ui.btn('common.back', menu.open)],
      });
    },

    importDialog() {
      const area = ui.el('textarea', 'code');
      area.placeholder = Game.i18n.de('import.placeholder');
      area.spellcheck = false;
      area.autocapitalize = 'off';
      const status = ui.el('div', 'status error');
      const load = () => {
        if (!Game.save.importCode(area.value)) { status.replaceChildren(ui.tx('import.error')); return; }
        ui.closeModal();
        restartWorld();
        ui.toast('import.ok');
      };
      ui.modal({
        title: 'import.title',
        body: [p('import.desc'), ui.el('div', 'with-help', [area, ui.help(Game.i18n.hu('import.placeholder'))]), status],
        buttons: [ui.btn('import.load', load, 'primary'), ui.btn('common.back', menu.open)],
      });
    },

    resetDialog() {
      ui.modal({
        title: 'reset.title',
        body: [p('reset.confirm')],
        buttons: [
          ui.btn('reset.yes', () => {
            Game.save.reset();
            Game.state.flags.introSeen = true;
            Game.save.persist();
            ui.closeModal();
            restartWorld();
            ui.toast('reset.done');
          }, 'danger'),
          ui.btn('common.cancel', menu.open),
        ],
      });
    },

    creditsDialog() {
      const c = Game.data.config.credits;
      const list = items => ui.el('ul', 'credits', items.map(it => ui.el('li', '', [
        ui.el('strong', '', [it.name]), ' – ' + it.by,
        ...(it.url ? [ui.el('br'), ui.el('a', '', [it.url])] : []),
      ])));
      const panel = ui.modal({
        title: 'credits.title',
        body: [p('credits.intro'), ui.el('h3', '', [ui.tx('credits.art')]), list(c.art), ui.el('h3', '', [ui.tx('credits.code')]), list(c.code), p('credits.thanks')],
        buttons: [ui.btn('common.back', menu.open, 'primary')],
      });
      panel.querySelectorAll('a').forEach(a => { a.href = a.textContent; a.target = '_blank'; a.rel = 'noopener'; });
    },

    intro() {
      const done = () => { Game.state.flags.introSeen = true; Game.save.persist(); ui.closeModal(); };
      ui.modal({
        title: 'intro.title',
        closable: false,
        body: [p('intro.text1'), p('intro.text2'), p('intro.text3')],
        buttons: [ui.btn('intro.start', done, 'primary')],
      });
    },
  };
})();
