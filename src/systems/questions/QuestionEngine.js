// A közös kérdés-motor (Game.questions): kérdés kiválasztása, válasz ellenőrzése, kihívás.
// DOM és Phaser nélkül, így tesztelhető; az ablak a src/ui/quiz.js-ben van. Leírás: README.md (ebben a mappában).
(function () {
  const cfg = () => Game.data.config.questions;
  // Egy mondat szókártyái: szóközönként, írásjelek nélkül. (Más szórendnél a vessző máshová kerülne, ezért a
  // kártyákon nincs írásjel, és a szókártyás ellenőrzés sem nézi; a válasz után a teljes mondat látszik.)
  const PUNCT = /^[,;:.!?"„“”»«()–-]+|[,;:.!?"„“”»«()–-]+$/g;
  const tileWords = s => String(s).trim().split(/\s+/).map(w => w.replace(PUNCT, '')).filter(Boolean);

  // Gépelési kényelem (docs/GERMAN.md 6.): kis-/nagybetű (ha a kérdés nem épp azt kérdezi), umlaut-átírás,
  // felesleges szóköz, a mondat végi írásjel. Minden más eltérés hiba marad.
  function normalize(s, caseSensitive) {
    let t = String(s === undefined || s === null ? '' : s).normalize('NFC').replace(/[’‘`´]/g, "'");
    if (!caseSensitive) t = t.toLowerCase();
    t = t.replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/Ä/g, 'Ae').replace(/Ö/g, 'Oe').replace(/Ü/g, 'Ue').replace(/ß/g, 'ss');
    return t.replace(/\s+/g, ' ').replace(/ ([,;:.!?])/g, '$1').trim().replace(/[.!?]+$/, '').trim();
  }

  // filter: { pools: [id], tags: [címke], context: [címke], levels: [szint] } -- a hiányzó / üres feltétel nem szűr.
  // A tags és a context is "bármelyik egyezzen"; a kettő együtt: mindkettőnek teljesülnie kell.
  function select(filter) {
    const f = filter || {};
    const has = (list, v) => !Array.isArray(list) || !list.length || list.indexOf(v) >= 0;
    const anyTag = (list, q) => !Array.isArray(list) || !list.length || (q.tags || []).some(t => list.indexOf(t) >= 0);
    return Object.values(Game.data.questions || {}).filter(q => has(f.pools, q.pool) && has(f.levels, q.level)
      && anyTag(f.tags, q) && anyTag(f.context, q));
  }

  // Súly a haladás szerint: az új és a rontott kérdés gyakrabban jön, a sokszor eltalált egyre ritkábban
  // (de sosem tűnik el).
  function weight(q) {
    const r = Game.state.questionRecord(q.id);
    if (!r.right && !r.wrong) return 3;
    if (!r.streak) return 4;
    return 2 / (1 + r.streak);
  }

  function shuffle(list, random) {
    const rnd = random || Math.random, a = list.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  // Súlyozott véletlen választás egy listából.
  function weighted(list, random) {
    if (!list.length) return null;
    const w = list.map(weight);
    let x = (random || Math.random)() * w.reduce((a, b) => a + b, 0);
    for (let i = 0; i < list.length; i++) { x -= w[i]; if (x < 0) return list[i]; }
    return list[list.length - 1];
  }

  // opts: { exclude: [kérdés-id], random }. Ha minden kérdés ki van zárva, ismételhet. Nincs kérdés: null.
  function pick(filter, opts) {
    opts = opts || {};
    const all = select(filter);
    const fresh = all.filter(q => (opts.exclude || []).indexOf(q.id) < 0);
    return weighted(fresh.length ? fresh : all, opts.random);
  }

  // Kihívás kérdése: contextShare eséllyel a helyzet-témából, különben bármelyik a szűrésen belül.
  // Mindig a még nem látott kérdések közül, amíg van; ha a témából elfogyott, a többiből; ha minden elfogyott, ismétel.
  function pickFor(ch, exclude, random) {
    const rnd = random || Math.random;
    const base = { pools: ch.pools, tags: ch.tags, levels: ch.levels };
    const fresh = list => list.filter(q => exclude.indexOf(q.id) < 0);
    const share = typeof ch.contextShare === 'number' ? ch.contextShare : cfg().contextShare;
    const ctx = Array.isArray(ch.context) && ch.context.length && rnd() < share
      ? fresh(select(Object.assign({ context: ch.context }, base))) : [];
    if (ctx.length) return weighted(ctx, rnd);
    const all = select(base);
    const rest = fresh(all);
    return weighted(rest.length ? rest : all, rnd);
  }

  // Választós kérdés lehetőségei, keverve: [{ key, correct }]
  const choices = (q, random) => shuffle(q.answers.slice(0, 1).map(key => ({ key, correct: true }))
    .concat((q.wrong || []).map(key => ({ key, correct: false }))), random);

  // Szókártyás kérdés kártyái, keverve: [{ id, text }] (az első megoldás szavai + a csali szavak)
  const tiles = (q, random) => shuffle(tileWords(Game.i18n.de(q.answers[0]))
    .concat((q.wrong || []).map(k => Game.i18n.de(k))).map((text, id) => ({ id, text })), random);

  // given: choice -> a választott lehetőség kulcsa; input -> a beírt szöveg; tiles -> a kártyák szövege sorban.
  // Visszatér: { correct, expected: a fő megoldás kulcsa }. Állapotot nem ír.
  function check(q, given) {
    const expected = q.answers[0];
    if (q.type === 'choice') return { correct: q.answers.indexOf(given) >= 0, expected };
    // szókártyásnál írásjelek nélkül, kis-/nagybetű nélkül (a kártyák szövege adott, csak a sorrend számít)
    const prep = q.type === 'tiles'
      ? t => normalize(tileWords(Array.isArray(t) ? t.join(' ') : t).join(' '), false)
      : t => normalize(t, q.caseSensitive);
    const g = prep(given);
    const correct = !!g && q.answers.some(k => prep(Game.i18n.de(k)) === g);
    return { correct, expected };
  }

  // Ellenőrzés + a haladás feljegyzése (Game.state.recordAnswer).
  function answer(id, given) {
    const q = Game.data.questions[id];
    if (!q) return null;
    const r = check(q, given);
    Game.state.recordAnswer(id, r.correct);
    return r;
  }

  // Elérhető-e most a kihívás (daily: ma még nem; once: még nincs feloldva).
  function available(chId, now) {
    const ch = Game.data.challenges[chId];
    if (!ch) return false;
    if (ch.repeat === 'daily') return Game.state.dailyCount(ch.id, now) === 0;
    if (ch.repeat === 'once') return !Game.state.isUnlocked(ch.id);
    return true;
  }

  // Kihívás: `need` jó válasz kell; minden rossz válasz sebez. Ha a HP elfogy: elveszett.
  // Egy kihíváson belül nem ismétlődik kérdés, amíg van másik.
  //   const c = Game.questions.challenge('ch_crypt_monster', { need: 2, damage: 1, asked: [] });
  //     need / damage: felülírja a kihívásét (pl. a szörny értékei); asked: közös lista a már feltett
  //     kérdésekről (pl. egy dungeon-látogatás összes szörnyére), hogy ne ismétlődjön
  //   c.next()        -> a következő kérdés (null, ha vége, vagy nincs kérdés)
  //   c.submit(given) -> { correct, expected, damage, done, won, lost } (null, ha most nem lehet válaszolni)
  //   c.flee()        -> feladás: nem sebez
  //   c.status        -> 'active' | 'won' | 'lost' | 'fled'
  function challenge(chId, opts) {
    opts = opts || {};
    const ch = Game.data.challenges[chId];
    if (!ch) { console.warn('Ismeretlen kihívás:', chId); return null; }
    const need = Math.max(1, Math.floor(opts.need || ch.need || 1));
    const damage = Number.isInteger(opts.damage) ? opts.damage : Number.isInteger(ch.wrongDamage) ? ch.wrongDamage : cfg().wrongDamage;
    const asked = Array.isArray(opts.asked) ? opts.asked : [];
    const c = {
      id: ch.id, need, damage, right: 0, wrong: 0, status: 'active', question: null,
      next() {
        if (c.status !== 'active') return null;
        c.question = pickFor(ch, asked, opts.random);
        if (c.question) asked.push(c.question.id);
        return c.question;
      },
      submit(given) {
        if (c.status !== 'active' || !c.question) return null;
        const r = answer(c.question.id, given);
        let lost = 0;
        if (r.correct) c.right++;
        else { c.wrong++; lost = Math.min(Game.state.hp, damage); Game.state.damage(lost); }
        if (c.right >= need) {
          c.status = 'won';
          if (ch.repeat === 'daily') Game.state.markDaily(ch.id, opts.now);
          if (ch.repeat === 'once') Game.state.unlock(ch.id);
        } else if (Game.state.hp <= 0) c.status = 'lost';
        c.question = null;
        return { correct: r.correct, expected: r.expected, damage: lost, done: c.status !== 'active', won: c.status === 'won', lost: c.status === 'lost' };
      },
      flee() { if (c.status === 'active') { c.status = 'fled'; c.question = null; } },
    };
    return c;
  }

  Game.questions = { normalize, select, weight, weighted, pick, choices, tiles, check, answer, available, challenge, tileWords };
})();
