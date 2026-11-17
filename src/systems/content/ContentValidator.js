// A data/*.json ellenőrzése betöltéskor. Nem dob hibát: a talált problémák listáját adja vissza
// (a ContentLoader kiírja őket a konzolra, a tesztek pedig elbuknak, ha van ilyen).
(function () {
  const ID_RE = /^[a-z][a-z0-9_]*$/;
  const LISTS = ['monsters', 'dungeonProps', 'dungeons', 'items', 'lootTables', 'questionPools', 'challenges', 'shop'];
  // Ezek az ID-k kerülhetnek a mentésbe: típusokon átívelően is egyedinek kell lenniük.
  const SAVED = ['dungeons', 'items'];

  function validate(raw) {
    const issues = [];
    const bad = msg => issues.push(msg);
    const byId = {};

    LISTS.forEach(key => {
      const list = raw[key] === undefined ? [] : raw[key];
      byId[key] = {};
      if (!Array.isArray(list)) { bad(key + ': tömbnek kell lennie'); return; }
      list.forEach((e, i) => {
        const id = e && e.id;
        if (typeof id !== 'string' || !ID_RE.test(id)) { bad(key + '[' + i + ']: hiányzó vagy hibás id (' + JSON.stringify(id) + '), csak kisbetű, szám, _'); return; }
        if (byId[key][id]) bad(key + ': ismétlődő id: ' + id); // az első marad érvényben (mint a betöltésnél)
        else byId[key][id] = e;
      });
    });
    const seen = {};
    SAVED.forEach(key => Object.keys(byId[key]).forEach(id => {
      if (seen[id]) bad('az id "' + id + '" két típusban is szerepel: ' + seen[id] + ', ' + key);
      seen[id] = key;
    }));

    const strings = raw.strings || {};
    const str = (where, key) => { if (typeof key !== 'string' || !strings[key]) bad(where + ': ismeretlen szöveg-kulcs: ' + key); };
    const de = key => (strings[key] && strings[key].de) || '';

    // fordítási fájl: csak de, hu és az "ellenőrizendő" jelölés (review: true)
    Object.keys(strings).forEach(key => {
      const e = strings[key];
      if (!e || typeof e !== 'object') { bad('strings.' + key + ': objektum kell ({ de, hu })'); return; }
      Object.keys(e).forEach(f => { if (['de', 'hu', 'review'].indexOf(f) < 0) bad('strings.' + key + ': ismeretlen mező: ' + f); });
      if ('review' in e && e.review !== true) bad('strings.' + key + '.review: csak true lehet (vagy hagyd el)');
    });
    const ref = (where, key, id) => { if (!byId[key][id]) bad(where + ': ismeretlen ' + key + ' id: ' + id); };

    // térkép
    const map = raw.map || {};
    const poiIds = {};
    (map.pois || []).forEach(p => {
      if (!p || typeof p.id !== 'string' || !ID_RE.test(p.id)) { bad('map.pois: hibás id: ' + JSON.stringify(p && p.id)); return; }
      if (poiIds[p.id]) bad('map.pois: ismétlődő id: ' + p.id);
      poiIds[p.id] = p;
      str('map.pois.' + p.id, 'poi.' + p.id + '.name');
      str('map.pois.' + p.id, 'poi.' + p.id + '.desc');
      if (Game.data.poiTypes && !Game.data.poiTypes[p.type]) bad('map.pois.' + p.id + ': ismeretlen típus: ' + p.type);
    });
    ['ground', 'objects'].forEach(layer => {
      const rows = map[layer] || [];
      if (rows.length !== map.height || rows.some(r => r.length !== map.width)) bad('map.' + layer + ': a mérete nem ' + map.width + 'x' + map.height);
    });

    // kérdések (data/questions/<pool>.json) és kihívások
    const questions = validateQuestions(raw, byId, bad, str, de);
    Object.values(byId.challenges).forEach(ch => {
      const w = 'challenges.' + ch.id;
      const pools = Array.isArray(ch.pools) ? ch.pools : [];
      if (!pools.length) bad(w + '.pools: legalább egy pool kell');
      pools.forEach(p => ref(w + '.pools', 'questionPools', p));
      if (ch.tags !== undefined && !Array.isArray(ch.tags)) bad(w + '.tags: tömbnek kell lennie');
      if (ch.levels !== undefined && (!Array.isArray(ch.levels) || ch.levels.some(l => LEVELS.indexOf(l) < 0))) bad(w + '.levels: ' + LEVELS.join(' | '));
      if (!(Number.isInteger(ch.need) && ch.need >= 1)) bad(w + '.need: pozitív egész szám kell');
      if (ch.wrongDamage !== undefined && !(Number.isInteger(ch.wrongDamage) && ch.wrongDamage >= 0)) bad(w + '.wrongDamage: nemnegatív egész szám kell');
      if (REPEATS.indexOf(ch.repeat) < 0) bad(w + '.repeat: ' + REPEATS.join(' | '));
      const sel = questions.filter(q => pools.indexOf(q.pool) >= 0
        && (!ch.tags || !ch.tags.length || (q.tags || []).some(t => ch.tags.indexOf(t) >= 0))
        && (!ch.levels || !ch.levels.length || ch.levels.indexOf(q.level) >= 0));
      if (sel.length < (ch.need || 1)) bad(w + ': kevés kérdés felel meg neki (' + sel.length + ')');
    });
    const needOk = v => v === undefined || (Number.isInteger(v) && v >= 1);

    Object.values(byId.monsters).forEach(m => {
      str('monsters.' + m.id, m.name); str('monsters.' + m.id, m.desc);
      if (!needOk(m.need)) bad('monsters.' + m.id + '.need: pozitív egész szám kell');
      if (m.challenge !== undefined) ref('monsters.' + m.id + '.challenge', 'challenges', m.challenge);
    });

    Object.values(byId.dungeons).forEach(d => {
      const w = 'dungeons.' + d.id;
      str(w, d.name);
      if (!poiIds[d.id]) bad(w + ': nincs hozzá helyszín a világtérképen (map.pois)');
      if (Game.dungeonThemes && !Game.dungeonThemes[d.theme]) bad(w + ': ismeretlen téma: ' + d.theme);
      const rows = Array.isArray(d.layout) ? d.layout : [];
      if (!rows.length || rows.some(r => typeof r !== 'string' || r.length !== rows[0].length)) bad(w + '.layout: minden sornak azonos hosszúnak kell lennie');
      (d.monsters || []).forEach(m => ref(w + '.monsters', 'monsters', m.type));
      (d.props || []).forEach(p => ref(w + '.props', 'dungeonProps', p[0]));
      if (d.lootTable !== undefined) ref(w + '.lootTable', 'lootTables', d.lootTable);
      if (d.challenge !== undefined) ref(w + '.challenge', 'challenges', d.challenge);
      else if ((d.monsters || []).some(m => !(byId.monsters[m.type] && byId.monsters[m.type].challenge))) bad(w + ': vannak szörnyei, de nincs kihívása (challenge)');
    });

    const rarities = Game.data.config && Game.data.config.rarities;
    Object.values(byId.items).forEach(it => {
      if (it.name !== undefined) str('items.' + it.id, it.name);
      if (it.rarity !== undefined && rarities && !rarities.some(r => r.id === it.rarity)) bad('items.' + it.id + ': ismeretlen rarity: ' + it.rarity);
    });
    Object.values(byId.lootTables).forEach(t => (t.entries || []).forEach(e => { if (e.item !== undefined) ref('lootTables.' + t.id, 'items', e.item); }));
    Object.values(byId.shop).forEach(s => { if (s.item !== undefined) ref('shop.' + s.id, 'items', s.item); });

    return issues;
  }

  // Kérdések: ID-k az összes poolban egyediek; típusonként a kötelező mezők; a választós lehetőségek
  // különbözők; a szókártyás válaszok ugyanazokból a szavakból állnak. Visszatér: a kérdések listája (pool mezővel).
  function validateQuestions(raw, byId, bad, str, de) {
    const out = [], seen = {};
    Object.keys(byId.questionPools).forEach(pid => {
      const list = raw.questions && raw.questions[pid];
      if (!Array.isArray(list)) { bad('questions/' + pid + '.json: hiányzik, vagy nem tömb'); return; }
      list.forEach((q, i) => {
        const id = q && q.id;
        if (typeof id !== 'string' || !ID_RE.test(id)) { bad('questions/' + pid + '[' + i + ']: hiányzó vagy hibás id (' + JSON.stringify(id) + ')'); return; }
        if (seen[id]) { bad('questions: ismétlődő id: ' + id + ' (' + seen[id] + ', ' + pid + ')'); return; }
        seen[id] = pid;
        out.push(Object.assign({}, q, { pool: pid }));
        const w = 'questions.' + id;
        if (QTYPES.indexOf(q.type) < 0) bad(w + ': ismeretlen típus: ' + q.type + ' (' + QTYPES.join(' | ') + ')');
        if (LEVELS.indexOf(q.level) < 0) bad(w + '.level: ' + LEVELS.join(' | '));
        if (!Array.isArray(q.tags) || !q.tags.length || q.tags.some(t => typeof t !== 'string' || !ID_RE.test(t))) bad(w + '.tags: legalább egy címke kell (kisbetű, szám, _)');
        str(w + '.prompt', q.prompt);
        if (q.explain !== undefined) str(w + '.explain', q.explain);
        if (q.caseSensitive !== undefined && typeof q.caseSensitive !== 'boolean') bad(w + '.caseSensitive: true / false');
        const answers = Array.isArray(q.answers) ? q.answers : [];
        const wrong = q.wrong === undefined ? [] : q.wrong;
        if (!answers.length) bad(w + '.answers: legalább egy helyes megoldás kell');
        if (!Array.isArray(wrong)) { bad(w + '.wrong: tömbnek kell lennie'); return; }
        answers.concat(wrong).forEach(k => str(w, k));
        const norm = k => de(k).toLowerCase().replace(/[.!?]+$/, '').trim();
        if (q.type === 'choice') {
          if (answers.length !== 1) bad(w + '.answers: választós kérdésnek pontosan egy helyes megoldása van');
          if (wrong.length < 2 || wrong.length > 3) bad(w + '.wrong: választós kérdéshez 2–3 rossz lehetőség kell');
          const texts = answers.concat(wrong).map(norm);
          if (new Set(texts).size !== texts.length) bad(w + ': két lehetőség szövege azonos');
        } else if (q.type === 'input') {
          if (wrong.length) bad(w + '.wrong: beírós kérdésnél nincs rossz lehetőség');
        } else if (q.type === 'tiles') {
          const bag = k => tileWords(de(k)).map(x => x.toLowerCase()).sort().join(' ');
          if (answers.length && tileWords(de(answers[0])).length < 2) bad(w + ': szókártyás kérdéshez legalább 2 szó kell');
          answers.forEach(k => { if (bag(k) !== bag(answers[0])) bad(w + '.answers: ' + k + ' nem ugyanazokból a szavakból áll, mint az első megoldás'); });
          wrong.forEach(k => { if (tileWords(de(k)).length !== 1) bad(w + '.wrong: ' + k + ': szókártyás rossz lehetőség egyetlen szó lehet'); });
        }
      });
    });
    return out;
  }

  // Egy mondat szókártyái: a kérdés-motoré (src/systems/questions), hogy a kettő ugyanúgy vágjon.
  const tileWords = s => Game.questions.tileWords(s);

  const QTYPES = ['choice', 'input', 'tiles'];
  const LEVELS = ['B1', 'B2', 'C1'];
  const REPEATS = ['unlimited', 'daily', 'once'];

  Game.contentValidator = { validate, ID_RE, QTYPES, LEVELS, REPEATS };
})();
