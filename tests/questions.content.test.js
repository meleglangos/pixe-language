// Kérdés-poolok (data/questions/): betöltés, a kérdések és kihívások ellenőrzése, "ellenőrizendő" jelölés.
const test = require('node:test');
const assert = require('node:assert/strict');
const { createGame, readData } = require('./helpers/env');

// teszt-szövegek és -kérdések (a valódi poolok tartalmától függetlenül)
const S = {
  't.p': { de: 'Frage', hu: 'kérdés' }, 't.a': { de: 'Antwort', hu: 'válasz' }, 't.b': { de: 'anders', hu: 'más' },
  't.c': { de: 'falsch', hu: 'rossz' }, 't.s1': { de: 'Ich bin gestern gekommen.', hu: 'Tegnap jöttem.' },
  't.s2': { de: 'Gestern bin ich gekommen.', hu: 'Tegnap jöttem.' }, 't.s3': { de: 'Ich bin heute gekommen.', hu: 'Ma jöttem.' },
  't.w1': { de: 'habe', hu: 'van' }, 't.w2': { de: 'zwei Wörter', hu: 'két szó' },
};
const q = (id, more) => Object.assign({ id, type: 'choice', level: 'B1', tags: ['test'], prompt: 't.p', answers: ['t.a'], wrong: ['t.b', 't.c'] }, more);
function withContent(questions, extra) {
  return raw => {
    Object.assign(raw.strings, S);
    raw.questionPools = raw.questionPools.concat({ id: 'p1' }, { id: 'p2' });
    raw.questions = { ...raw.questions, p1: questions.p1 || [], p2: questions.p2 || [] };
    if (extra) extra(raw);
  };
}

test('a poolok kérdései ID szerint, pool-jelöléssel töltődnek be', () => {
  const { Game } = createGame({ content: withContent({ p1: [q('q_a'), q('q_b')], p2: [q('q_c', { type: 'input', wrong: undefined })] }) });
  assert.deepEqual(Object.keys(Game.data.questions).filter(id => /^q_[abc]$/.test(id)).sort(), ['q_a', 'q_b', 'q_c']);
  assert.equal(Game.data.questions.q_c.pool, 'p2');
  assert.deepEqual([...Game.data.questionPools.p1.questions], ['q_a', 'q_b']);
  assert.deepEqual([...Game.content.issues], []);
});

test('a valódi poolok minden fájlja megvan (pools.json <-> data/questions/*.json)', () => {
  const raw = readData();
  assert.deepEqual(Object.keys(raw.questions).sort(), raw.questionPools.map(p => p.id).sort());
});

test('a validátor kiszúrja a hibás kérdéseket', () => {
  const { Game } = createGame();
  const raw = readData();
  withContent({
    p1: [
      q('q_dup'), q('q_dup'), q('Bad'),
      q('q_type', { type: 'essay' }), q('q_level', { level: 'A1' }), q('q_tags', { tags: [] }),
      q('q_key', { prompt: 'nincs.ilyen' }),
      q('q_two', { answers: ['t.a', 't.b'] }), q('q_few', { wrong: ['t.b'] }), q('q_same', { wrong: ['t.a', 't.b'] }),
      q('q_in', { type: 'input' }),
    ],
    p2: [
      q('q_dup'),
      q('q_t1', { type: 'tiles', answers: ['t.s1', 't.s2'], wrong: ['t.w1'] }), // jó
      q('q_t2', { type: 'tiles', answers: ['t.s1', 't.s3'], wrong: ['t.w2'] }),
    ],
  })(raw);
  const issues = Game.contentValidator.validate(raw).join('\n');
  for (const re of [
    /questions: ismétlődő id: q_dup \(p1, p1\)/, /questions: ismétlődő id: q_dup \(p1, p2\)/, /hibás id \("Bad"\)/,
    /q_type: ismeretlen típus: essay/, /q_level\.level/, /q_tags\.tags/, /q_key\.prompt: ismeretlen szöveg-kulcs: nincs\.ilyen/,
    /q_two\.answers: választós kérdésnek pontosan egy/, /q_few\.wrong: választós kérdéshez 2–3/, /q_same: két lehetőség szövege azonos/,
    /q_in\.wrong: beírós kérdésnél nincs rossz lehetőség/,
    /q_t2\.answers: t\.s3 nem ugyanazokból a szavakból áll/, /q_t2\.wrong: t\.w2: szókártyás rossz lehetőség egyetlen szó/,
  ]) assert.match(issues, re);
  assert.doesNotMatch(issues, /q_t1/);
});

test('a validátor ellenőrzi a kihívásokat és a hivatkozásokat', () => {
  const { Game } = createGame();
  const raw = readData();
  withContent({ p1: [q('q_a'), q('q_b', { tags: ['other'] })] }, r => {
    r.challenges = [
      { id: 'ch_ok', pools: ['p1'], need: 2, repeat: 'unlimited' },
      { id: 'ch_bad', pools: ['p9'], need: 0, repeat: 'sometimes', wrongDamage: -1, levels: ['A2'] },
      { id: 'ch_few', pools: ['p1'], tags: ['other'], need: 2, repeat: 'daily' },
    ];
    r.monsters = r.monsters.map((m, i) => (i ? m : { ...m, need: 1.5, challenge: 'ch_nope' }));
    r.dungeons = r.dungeons.map((d, i) => (i ? d : { ...d, challenge: 'ch_nope2' }));
  })(raw);
  const issues = Game.contentValidator.validate(raw).join('\n');
  for (const re of [
    /challenges\.ch_bad\.pools: ismeretlen questionPools id: p9/, /ch_bad\.need/, /ch_bad\.repeat/, /ch_bad\.wrongDamage/, /ch_bad\.levels/,
    /challenges\.ch_few: kevés kérdés felel meg neki \(1\)/, /\.need: pozitív egész/, /challenge: ismeretlen challenges id: ch_nope\b/,
    /challenge: ismeretlen challenges id: ch_nope2/,
  ]) assert.match(issues, re);
  assert.doesNotMatch(issues, /ch_ok/);
});

test('"ellenőrizendő" jelölés: csak review: true, más mező nem lehet a szövegben', () => {
  const { Game } = createGame();
  const raw = readData();
  raw.strings = Object.assign({}, raw.strings, {
    'x.ok': { de: 'a', hu: 'b', review: true }, 'x.bad': { de: 'a', hu: 'b', review: 'ja' }, 'x.extra': { de: 'a', hu: 'b', note: 'x' },
  });
  const issues = Game.contentValidator.validate(raw).join('\n');
  assert.match(issues, /strings\.x\.bad\.review: csak true/);
  assert.match(issues, /strings\.x\.extra: ismeretlen mező: note/);
  assert.doesNotMatch(issues, /x\.ok/);
});

test('review-list: a jelölt szövegeket listázza', () => {
  const { reviewList } = require('../tools/review-list.js');
  const list = reviewList();
  assert.ok(Array.isArray(list));
  list.forEach(e => { assert.equal(typeof e.key, 'string'); assert.equal(typeof e.de, 'string'); });
});

test('szókártyák: szóközönként, írásjelek nélkül', () => {
  const { Game } = createGame();
  assert.deepEqual([...Game.questions.tileWords('Ich weiß, dass er „heute“ kommt!')], ['Ich', 'weiß', 'dass', 'er', 'heute', 'kommt']);
});

test('a valódi poolok: minden kérdés megoldható a saját megoldásaival, és vegyes a típus', () => {
  const { Game } = createGame();
  Game.saveManager.load();
  for (const pool of Object.values(Game.data.questionPools)) {
    const qs = pool.questions.map(id => Game.data.questions[id]);
    assert.ok(qs.length >= 15, pool.id + ': kevés kérdés');
    assert.deepEqual([...new Set(qs.map(q => q.type))].sort(), ['choice', 'input', 'tiles'], pool.id);
    for (const q of qs) {
      for (const a of q.answers) {
        const de = Game.i18n.de(a);
        const given = q.type === 'choice' ? a : q.type === 'tiles' ? Game.questions.tileWords(de) : de;
        assert.equal(Game.questions.check(q, given).correct, true, q.id + ': ' + de);
      }
      for (const w of q.wrong || []) if (q.type === 'choice') assert.equal(Game.questions.check(q, w).correct, false, q.id);
    }
  }
});
