// A data/*.json ellenőrzése betöltéskor. Nem dob hibát: a talált problémák listáját adja vissza
// (a ContentLoader kiírja őket a konzolra, a tesztek pedig elbuknak, ha van ilyen).
(function () {
  const ID_RE = /^[a-z][a-z0-9_]*$/;
  const LISTS = ['monsters', 'dungeonProps', 'dungeons', 'items', 'lootTables', 'questionPools', 'questionTags', 'challenges', 'chestStyles', 'shop'];
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

    // címkék (data/questions/tags.json), kérdések (data/questions/<pool>.json) és kihívások
    Object.values(byId.questionTags).forEach(t => { if (TAG_KINDS.indexOf(t.kind) < 0) bad('questionTags.' + t.id + '.kind: ' + TAG_KINDS.join(' | ')); });
    const questions = validateQuestions(raw, byId, bad, str, de);
    const tagKind = id => byId.questionTags[id] && byId.questionTags[id].kind;
    const tagList = (where, list, kind) => {
      if (list === undefined) return [];
      if (!Array.isArray(list)) { bad(where + ': tömbnek kell lennie'); return []; }
      list.forEach(t => { if (!tagKind(t)) bad(where + ': ismeretlen címke: ' + t + ' (data/questions/tags.json)'); else if (kind && tagKind(t) !== kind) bad(where + ': nem ' + kind + ' címke: ' + t); });
      return list;
    };
    const any = (list, v) => !list.length || list.indexOf(v) >= 0;
    const anyTag = (list, q) => !list.length || (q.tags || []).some(t => list.indexOf(t) >= 0);
    Object.values(byId.challenges).forEach(ch => {
      const w = 'challenges.' + ch.id;
      const pools = ch.pools === undefined ? [] : ch.pools;
      if (!Array.isArray(pools)) bad(w + '.pools: tömbnek kell lennie');
      else pools.forEach(p => ref(w + '.pools', 'questionPools', p));
      const tags = tagList(w + '.tags', ch.tags);
      const context = tagList(w + '.context', ch.context, 'context');
      const levels = Array.isArray(ch.levels) ? ch.levels : [];
      if (ch.levels !== undefined && (!Array.isArray(ch.levels) || ch.levels.some(l => LEVELS.indexOf(l) < 0))) bad(w + '.levels: ' + LEVELS.join(' | '));
      if (ch.contextShare !== undefined && !(typeof ch.contextShare === 'number' && ch.contextShare >= 0 && ch.contextShare <= 1)) bad(w + '.contextShare: 0 és 1 közötti szám');
      if (!(Number.isInteger(ch.need) && ch.need >= 1)) bad(w + '.need: pozitív egész szám kell');
      if (!damageOk(ch.wrongDamage)) bad(w + '.wrongDamage: nemnegatív egész szám kell');
      if (REPEATS.indexOf(ch.repeat) < 0) bad(w + '.repeat: ' + REPEATS.join(' | '));
      const sel = questions.filter(q => any(Array.isArray(pools) ? pools : [], q.pool) && any(levels, q.level) && anyTag(tags, q));
      if (sel.length < (ch.need || 1)) bad(w + ': kevés kérdés felel meg neki (' + sel.length + ')');
      else if (context.length && !sel.some(q => anyTag(context, q))) bad(w + '.context: egy kérdés sincs ebből a témából a szűrésen belül');
    });
    const statsOk = (where, o) => {
      if (!needOk(o.need)) bad(where + '.need: pozitív egész szám kell');
      if (!damageOk(o.damage)) bad(where + '.damage: nemnegatív egész szám kell');
    };

    Object.values(byId.monsters).forEach(m => {
      str('monsters.' + m.id, m.name); str('monsters.' + m.id, m.desc);
      statsOk('monsters.' + m.id, m);
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
      if (d.chestStyle !== undefined) ref(w + '.chestStyle', 'chestStyles', d.chestStyle);
      if (d.chest && d.lootTable === undefined) bad(w + ': van ládája, de nincs loot táblája (lootTable)');
      if (d.monsterStats !== undefined) {
        if (!d.monsterStats || typeof d.monsterStats !== 'object' || Array.isArray(d.monsterStats)) bad(w + '.monsterStats: objektum kell ({ szörnytípus: { need, damage } })');
        else Object.keys(d.monsterStats).forEach(t => { ref(w + '.monsterStats', 'monsters', t); statsOk(w + '.monsterStats.' + t, d.monsterStats[t] || {}); });
      }
    });

    // láda-stílusok: képkockás (closed + open kivágás) vagy animált (strip + openFrames)
    const assets = Game.data.assets;
    Object.values(byId.chestStyles).forEach(st => {
      const w = 'chestStyles.' + st.id;
      if (st.strip !== undefined) {
        if (assets && !assets.strips[st.strip]) bad(w + '.strip: ismeretlen csík (src/config/assets.js strips): ' + st.strip);
        if (!Array.isArray(st.openFrames) || !st.openFrames.length || st.openFrames.some(f => !Number.isInteger(f) || f < 0)) bad(w + '.openFrames: képkocka-sorszámok tömbje');
      } else {
        ['closed', 'open'].forEach(k => { if (typeof st[k] !== 'string' || (assets && !assets.frames[st[k]])) bad(w + '.' + k + ': ismeretlen kivágás (src/config/assets.js frames): ' + st[k]); });
      }
    });
    if (Game.data.config && Game.data.config.loot && !byId.chestStyles[Game.data.config.loot.chestStyle]) bad('config.loot.chestStyle: ismeretlen láda-stílus: ' + Game.data.config.loot.chestStyle);

    // tárgyak: kategória (kind) és típus (type) a config.js -> items.kinds listából, ritkaság, ár, passzívok
    const rarities = Game.data.config && Game.data.config.rarities;
    const itemCfg = (Game.data.config && Game.data.config.items) || { kinds: {}, stats: {} };
    Object.values(byId.items).forEach(it => {
      const w = 'items.' + it.id;
      str(w + '.name', it.name);
      if (it.desc !== undefined) str(w + '.desc', it.desc);
      if (!rarities || !rarities.some(r => r.id === it.rarity)) bad(w + ': ismeretlen rarity: ' + it.rarity);
      const kind = itemCfg.kinds[it.kind];
      if (!kind) bad(w + '.kind: ' + Object.keys(itemCfg.kinds).join(' | '));
      else if (kind.types.indexOf(it.type) < 0) bad(w + '.type: a(z) ' + it.kind + ' típusai: ' + kind.types.join(' | '));
      if (it.value !== undefined && !(Number.isInteger(it.value) && it.value >= 0)) bad(w + '.value: nemnegatív egész (ár aranyban)');
      if (it.stack !== undefined && typeof it.stack !== 'boolean') bad(w + '.stack: true / false');
      if (it.exclusive !== undefined && typeof it.exclusive !== 'boolean') bad(w + '.exclusive: true / false');
      if (it.stats !== undefined) {
        if (!it.stats || typeof it.stats !== 'object' || Array.isArray(it.stats)) bad(w + '.stats: objektum, pl. {"maxHp": 10}');
        else Object.keys(it.stats).forEach(k => {
          if (!itemCfg.stats[k]) bad(w + '.stats.' + k + ': ismeretlen passzív (' + Object.keys(itemCfg.stats).join(' | ') + ')');
          else if (!(typeof it.stats[k] === 'number' && it.stats[k] > 0)) bad(w + '.stats.' + k + ': pozitív szám');
        });
      }
      if (Game.itemIcons && !Game.itemIcons.parse(it.icon)) bad(w + '.icon: hibás ikon: ' + JSON.stringify(it.icon) + ' ("it:<szám>" vagy "wp:<anyag> c<oszlop> r<sor>")');
    });
    const rangeOk = v => (Number.isInteger(v) && v >= 0) || (Array.isArray(v) && v.length === 2 && v.every(x => Number.isInteger(x) && x >= 0) && v[0] <= v[1]);
    // láda-csillagok (config.js -> loot.stars, vagy egy tábla "stars" felülírása): minden lista 5 elemű (1…5 csillag)
    const five = (v, ok) => Array.isArray(v) && v.length === 5 && v.every(ok);
    const nonNeg = x => typeof x === 'number' && x >= 0;
    const starsOk = (w, s) => {
      if (!s || typeof s !== 'object') { bad(w + ': objektum kell'); return; }
      if (s.weights !== undefined && !five(s.weights, nonNeg)) bad(w + '.weights: 5 nemnegatív szám (1…5 csillag)');
      if (s.rolls !== undefined && !five(s.rolls, rangeOk)) bad(w + '.rolls: 5 db szám vagy [min, max]');
      if (s.gold !== undefined && !five(s.gold, nonNeg)) bad(w + '.gold: 5 nemnegatív szorzó');
      Object.keys(s.rarityFactor || {}).forEach(g => { if (!five(s.rarityFactor[g], nonNeg)) bad(w + '.rarityFactor.' + g + ': 5 nemnegatív szorzó'); });
    };
    if (Game.data.config && Game.data.config.loot && Game.data.config.loot.stars) starsOk('config.loot.stars', Game.data.config.loot.stars);
    // loot táblák: always (mindig), rolls ([min, max] húzás), entries (súlyozott); egy tétel tárgy (qty) vagy arany
    Object.values(byId.lootTables).forEach(t => {
      const w = 'lootTables.' + t.id;
      const entry = (where, e, weighted) => {
        if (!e || typeof e !== 'object') { bad(where + ': objektum kell'); return; }
        if ((e.item === undefined) === (e.gold === undefined)) bad(where + ': vagy "item", vagy "gold" kell (pontosan az egyik)');
        if (e.item !== undefined) ref(where, 'items', e.item);
        if (e.gold !== undefined && !rangeOk(e.gold)) bad(where + '.gold: szám vagy [min, max]');
        if (e.qty !== undefined && !(rangeOk(e.qty) && (Array.isArray(e.qty) ? e.qty[0] : e.qty) >= 1)) bad(where + '.qty: legalább 1 (szám vagy [min, max])');
        if (weighted && !(typeof e.weight === 'number' && e.weight > 0)) bad(where + '.weight: pozitív szám kell');
      };
      (Array.isArray(t.always) ? t.always : []).forEach((e, i) => entry(w + '.always[' + i + ']', e, false));
      const entries = Array.isArray(t.entries) ? t.entries : [];
      entries.forEach((e, i) => entry(w + '.entries[' + i + ']', e, true));
      if (t.rolls !== undefined && !rangeOk(t.rolls)) bad(w + '.rolls: szám vagy [min, max]');
      if (t.stars !== undefined) starsOk(w + '.stars', t.stars);
      if (!entries.length && !(t.always || []).length) bad(w + ': üres tábla');
    });
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
        const tags = Array.isArray(q.tags) ? q.tags : [];
        tags.forEach(t => { if (!byId.questionTags[t]) bad(w + '.tags: ismeretlen címke: ' + t + ' (data/questions/tags.json)'); });
        ['context', 'grammar'].forEach(k => { if (!tags.some(t => byId.questionTags[t] && byId.questionTags[t].kind === k)) bad(w + '.tags: legalább egy ' + k + ' címke kell'); });
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

  const needOk = v => v === undefined || (Number.isInteger(v) && v >= 1);
  const damageOk = v => v === undefined || (Number.isInteger(v) && v >= 0);
  const TAG_KINDS = ['context', 'grammar'];
  const QTYPES = ['choice', 'input', 'tiles'];
  const LEVELS = ['B1', 'B2', 'C1'];
  const REPEATS = ['unlimited', 'daily', 'once'];

  Game.contentValidator = { validate, ID_RE, QTYPES, LEVELS, REPEATS };
})();
