// A kérdés-ablak: egy kihívás (Game.questions.challenge) kérdéseit mutatja egymás után.
//
//   Game.quiz.open({ challenge: kihívás-id, need: szám (opcionális), title: szöveg-kulcs, onEnd(status) })
//     status: 'won' | 'lost' | 'fled' | 'empty' (nincs kérdés a kihíváshoz)
//
// Típusok: választós (nagy gombok), beírós (szövegmező, Enter is beküld), szókártyás (koppintás a szavakra).
// A kérdésnél van "?" (magyar fordítás); a lehetőségeknél nincs, hogy ne árulja el a megoldást. A válasz után
// a helyes megoldás és a magyarázat már "?"-lel együtt látszik.
(function () {
  const ui = Game.ui;

  function button(cls, text, onClick) {
    const b = ui.el('button', 'btn ' + cls, [text]);
    b.type = 'button';
    b.addEventListener('click', onClick);
    return b;
  }

  // ---------- válasz-részek típusonként: { el, value(), focus?, lock(result) } ----------
  const kinds = {
    choice(q, submit) {
      const list = ui.el('div', 'quiz-choices', Game.questions.choices(q).map(o => {
        const b = button('quiz-choice', Game.i18n.de(o.key), () => submit(o.key, b));
        b.dataset.correct = o.correct ? '1' : '';
        return b;
      }));
      return {
        el: list, needsCheck: false,
        lock(r, chosen) {
          list.querySelectorAll('button').forEach(b => { b.disabled = true; if (b.dataset.correct) b.classList.add('right'); });
          if (!r.correct && chosen) chosen.classList.add('wrong');
        },
      };
    },

    input(q, submit) {
      const input = ui.el('input', 'quiz-input');
      input.type = 'text';
      input.placeholder = Game.i18n.de('quiz.placeholder');
      input.autocomplete = 'off'; input.autocapitalize = 'off'; input.spellcheck = false;
      input.setAttribute('autocorrect', 'off');
      input.setAttribute('enterkeyhint', 'done');
      // preventDefault: különben ugyanez az Enter a fókuszt kapó "Weiter" gombot is megnyomná
      input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); if (input.value.trim()) submit(input.value, input); } });
      return {
        el: input, needsCheck: true, value: () => input.value, ready: () => !!input.value.trim(),
        onChange: fn => input.addEventListener('input', fn),
        focus: () => input.focus(),
        lock(r) { input.disabled = true; input.classList.add(r.correct ? 'right' : 'wrong'); },
      };
    },

    tiles(q) {
      const line = ui.el('div', 'quiz-line');
      const bank = ui.el('div', 'quiz-bank');
      const placed = [];
      let changed = () => {};
      Game.questions.tiles(q).forEach(t => {
        const slot = button('quiz-tile', t.text, () => {
          if (slot.disabled) return;
          slot.classList.add('used'); slot.disabled = true;
          const chip = button('quiz-tile', t.text, () => {
            if (chip.disabled) return;
            chip.remove(); placed.splice(placed.indexOf(chip), 1);
            slot.classList.remove('used'); slot.disabled = false;
            changed();
          });
          placed.push(chip); line.append(chip);
          changed();
        });
        bank.append(slot);
      });
      return {
        el: ui.el('div', 'quiz-tiles', [line, bank]), needsCheck: true,
        value: () => placed.map(c => c.textContent), ready: () => placed.length > 0,
        onChange: fn => { changed = fn; },
        lock(r) {
          line.parentNode.querySelectorAll('button').forEach(b => { b.disabled = true; });
          line.classList.add(r.correct ? 'right' : 'wrong');
        },
      };
    },
  };

  Game.quiz = {
    open(opts) {
      const ch = Game.questions.challenge(opts.challenge, { need: opts.need });
      const end = status => { ui.closeModal(); if (opts.onEnd) opts.onEnd(status); };
      if (!ch) { end('empty'); return; }
      const flee = () => { ch.flee(); end('fled'); };
      const progress = () => ui.el('p', 'quiz-progress small', [ui.tx('quiz.progress', { right: ch.right, need: ch.need })]);

      function ask() {
        const q = ch.next();
        if (!q) { ui.toast('quiz.noQuestions'); end('empty'); return; }
        let part;
        const submit = (given, chosen) => answer(q, part, given, chosen);
        part = kinds[q.type](q, submit);
        const body = [progress(), ui.el('p', 'quiz-prompt', [ui.tx(q.prompt)]), part.el];
        const buttons = [];
        if (part.needsCheck) {
          const check = ui.btn('quiz.check', () => { if (part.ready()) submit(part.value()); }, 'primary');
          const cb = check.querySelector('button');
          const sync = () => { cb.disabled = !part.ready(); };
          part.onChange(sync); sync();
          buttons.push(check);
        }
        buttons.push(ui.btn('quiz.flee', flee));
        ui.modal({ title: opts.title, closable: false, body, buttons });
        if (part.focus) setTimeout(part.focus, 0);
      }

      function answer(q, part, given, chosen) {
        const r = ch.submit(given);
        if (!r) return;
        part.lock(r, chosen);
        const panel = ui.modalEl.querySelector('.modal');
        const fb = [ui.el('div', 'quiz-verdict', [ui.tx(r.correct ? 'quiz.correct' : 'quiz.wrong')])];
        if (!r.correct || q.type === 'tiles') fb.push(ui.el('div', 'quiz-expected', [ui.tx(r.expected)]));
        if (q.explain) fb.push(ui.el('div', 'quiz-explain small', [ui.tx(q.explain)]));
        if (r.damage) fb.push(ui.el('div', 'quiz-damage small', [ui.tx('quiz.damage', { n: r.damage })]));
        if (r.won) fb.push(ui.el('div', 'quiz-verdict', [ui.tx('quiz.won')]));
        if (r.lost) fb.push(ui.el('div', 'quiz-verdict', [ui.tx('quiz.lost')]));
        const box = ui.el('div', 'quiz-feedback ' + (r.correct ? 'ok' : 'bad'), fb);
        panel.querySelector('.modal-body').append(box);
        panel.querySelector('.quiz-progress').replaceWith(progress());
        const next = r.done ? ui.btn('quiz.finish', () => end(ch.status), 'primary') : ui.btn('quiz.next', ask, 'primary');
        panel.querySelector('.modal-buttons').replaceChildren(next);
        const nb = next.querySelector('button');
        setTimeout(() => { if (nb.isConnected) { nb.focus({ preventScroll: true }); box.scrollIntoView({ block: 'nearest' }); } }, 0);
      }

      ask();
    },
  };
})();
