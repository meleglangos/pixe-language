// A kérdés-motor (src/systems/questions/QuestionEngine.js): kiválasztás, elnéző ellenőrzés, kihívás.
// Saját teszt-kérdésekkel, hogy a valódi poolok tartalmától független legyen.
const test = require('node:test');
const assert = require('node:assert/strict');
const { createGame, plain, tick } = require('./helpers/env');

const S = {
  'tq.p': { de: 'Frage', hu: 'kérdés' },
  'tq.der': { de: 'der', hu: 'der' }, 'tq.die': { de: 'die', hu: 'die' }, 'tq.das': { de: 'das', hu: 'das' },
  'tq.gegangen': { de: 'gegangen', hu: 'ment' }, 'tq.strasse': { de: 'die Straße', hu: 'az utca' }, 'tq.strasse2': { de: 'Straße', hu: 'utca' },
  'tq.weil': { de: 'Ich bleibe zu Hause, weil es regnet.', hu: 'Otthon maradok, mert esik.' },
  'tq.weil2': { de: 'Weil es regnet, bleibe ich zu Hause.', hu: 'Mivel esik, otthon maradok.' },
  'tq.denn': { de: 'denn', hu: 'mert' }, 'tq.Sie': { de: 'Sie', hu: 'Ön' },
};
const Q = [
  { id: 'q_c1', type: 'choice', level: 'B1', tags: ['tctx', 'artikel'], prompt: 'tq.p', answers: ['tq.die'], wrong: ['tq.der', 'tq.das'] },
  { id: 'q_c2', type: 'choice', level: 'B1', tags: ['tctx', 'artikel'], prompt: 'tq.p', answers: ['tq.der'], wrong: ['tq.die', 'tq.das'] },
  { id: 'q_c3', type: 'choice', level: 'B2', tags: ['tctx', 'artikel'], prompt: 'tq.p', answers: ['tq.das'], wrong: ['tq.der', 'tq.die'] },
  { id: 'q_i1', type: 'input', level: 'B1', tags: ['other_ctx', 'perfekt'], prompt: 'tq.p', answers: ['tq.gegangen'] },
  { id: 'q_i2', type: 'input', level: 'B1', tags: ['other_ctx', 'wort'], prompt: 'tq.p', answers: ['tq.strasse', 'tq.strasse2'] },
  { id: 'q_i3', type: 'input', level: 'C1', tags: ['other_ctx', 'wort'], prompt: 'tq.p', answers: ['tq.Sie'], caseSensitive: true },
  { id: 'q_t1', type: 'tiles', level: 'B1', tags: ['other_ctx', 'nebensatz'], prompt: 'tq.p', answers: ['tq.weil', 'tq.weil2'], wrong: ['tq.denn'] },
];
const CH = [
  { id: 'ch_t', pools: ['tp'], tags: ['tctx', 'artikel'], need: 2, repeat: 'unlimited' },
  { id: 'ch_day', pools: ['tp'], levels: ['B1'], need: 1, repeat: 'daily', wrongDamage: 5 },
  { id: 'ch_once', pools: ['tp'], need: 1, repeat: 'once' },
  { id: 'ch_mix', pools: ['tp'], levels: ['B1'], context: ['tctx'], need: 1, repeat: 'unlimited' },
  { id: 'ch_ctx_only', pools: ['tp'], context: ['tctx'], contextShare: 1, need: 1, repeat: 'unlimited' },
];
function setup() {
  const env = createGame({ content: raw => {
    Object.assign(raw.strings, S);
    raw.questionPools = raw.questionPools.concat({ id: 'tp' });
    const known = new Set(raw.questionTags.map(t => t.id));
    raw.questionTags = raw.questionTags.concat(['tctx', 'other_ctx'].map(id => ({ id, kind: 'context' })),
      ['artikel', 'perfekt', 'wort', 'nebensatz'].filter(id => !known.has(id)).map(id => ({ id, kind: 'grammar' })));
    raw.questions = { ...raw.questions, tp: Q };
    raw.challenges = raw.challenges.concat(CH);
  } });
  env.Game.saveManager.load();
  assert.deepEqual([...env.Game.content.issues], []);
  return env;
}
const seq = (...xs) => { let i = 0; return () => xs[i++ % xs.length]; };
const ids = list => plain(list.map(q => q.id).sort());

test('select: pool, címke, szint szerint', () => {
  const { Game } = setup();
  assert.deepEqual(ids(Game.questions.select({ pools: ['tp'], tags: ['tctx', 'artikel'] })), ['q_c1', 'q_c2', 'q_c3']);
  assert.deepEqual(ids(Game.questions.select({ pools: ['tp'], tags: ['tctx', 'artikel'], levels: ['B1'] })), ['q_c1', 'q_c2']);
  assert.deepEqual(ids(Game.questions.select({ pools: ['tp'], tags: ['wort', 'perfekt'] })), ['q_i1', 'q_i2', 'q_i3']);
  assert.deepEqual(ids(Game.questions.select({ pools: ['nincs'] })), []);
});

test('ellenőrzés: elnéző a gépelésben (kis/nagybetű, umlaut, ß, szóköz, mondatvégi írásjel)', () => {
  const { Game } = setup();
  const q = Game.data.questions;
  for (const ok of ['gegangen', 'Gegangen', '  gegangen  ', 'gegangen.', 'GEGANGEN!']) assert.equal(Game.questions.check(q.q_i1, ok).correct, true, ok);
  for (const ok of ['die Straße', 'die Strasse', 'Die  strasse', 'Straße', 'strasse']) assert.equal(Game.questions.check(q.q_i2, ok).correct, true, ok);
  assert.equal(Game.questions.normalize('Ärger über Öl', false), 'aerger ueber oel');
  assert.equal(Game.questions.normalize('Ich weiß , dass', false), 'ich weiss, dass');
});

test('ellenőrzés: csak a helyes választ fogadja el (elírás, rossz végződés, rossz névelő, nem felsorolt alak)', () => {
  const { Game } = setup();
  const q = Game.data.questions;
  for (const no of ['', '   ', 'gegangn', 'gegangt', 'gegegangen', 'ge gangen']) assert.equal(Game.questions.check(q.q_i1, no).correct, false, no);
  for (const no of ['der Straße', 'das Strasse', 'die Strase', 'Straßen']) assert.equal(Game.questions.check(q.q_i2, no).correct, false, no);
  assert.equal(Game.questions.check(q.q_i3, 'Sie').correct, true);
  assert.equal(Game.questions.check(q.q_i3, 'sie').correct, false, 'caseSensitive: a kisbetű hiba');
});

test('választós: a lehetőségek keverve, a helyes a kulcsa alapján', () => {
  const { Game } = setup();
  const q = Game.data.questions.q_c1;
  const opts = plain(Game.questions.choices(q, seq(0, 0)));
  assert.deepEqual(opts.map(o => o.key).sort(), ['tq.das', 'tq.der', 'tq.die']);
  assert.notEqual(opts[0].key, 'tq.die', 'a helyes nem mindig az első');
  assert.deepEqual(opts.filter(o => o.correct).map(o => o.key), ['tq.die']);
  assert.deepEqual(plain(Game.questions.check(q, 'tq.die')), { correct: true, expected: 'tq.die' });
  assert.equal(Game.questions.check(q, 'tq.der').correct, false);
});

test('szókártyás: a kártyák a mondat szavai + csali, bármelyik felsorolt sorrend jó', () => {
  const { Game } = setup();
  const q = Game.data.questions.q_t1;
  const t = plain(Game.questions.tiles(q, seq(0.3, 0.7)));
  assert.deepEqual(t.map(x => x.text).sort(), ['Hause', 'Ich', 'bleibe', 'denn', 'es', 'regnet', 'weil', 'zu'].sort());
  const words = s => s.split(' ');
  assert.equal(Game.questions.check(q, words('Ich bleibe zu Hause weil es regnet')).correct, true);
  assert.equal(Game.questions.check(q, words('weil es regnet bleibe Ich zu Hause')).correct, true, 'a másik felsorolt sorrend, a kártyák saját írásmódjával');
  assert.equal(Game.questions.check(q, words('Ich bleibe zu Hause denn es regnet')).correct, false, 'nem felsorolt változat');
  assert.equal(Game.questions.check(q, words('Ich bleibe zu Hause weil regnet es')).correct, false, 'rossz szórend');
  assert.equal(Game.questions.check(q, words('Ich bleibe zu Hause weil es')).correct, false, 'hiányzó szó');
});

test('answer: a haladás a mentésbe kerül (automatikus mentés)', async () => {
  const { Game, storage, KEY } = setup();
  Game.questions.answer('q_i1', 'gegangen');
  Game.questions.answer('q_i1', 'gegeht');
  await tick();
  assert.deepEqual(JSON.parse(storage.getItem(KEY)).questions, { q_i1: { right: 1, wrong: 1, streak: 0 } });
  assert.equal(Game.questions.answer('q_nincs', 'x'), null);
});

test('pick: súlyozás a haladás szerint, kizárás, ismétlés ha elfogyott', () => {
  const { Game } = setup();
  const q = Game.data.questions;
  Game.questions.answer('q_c1', 'tq.der'); // rontott
  for (let i = 0; i < 5; i++) Game.questions.answer('q_c2', 'tq.der'); // begyakorolt
  assert.ok(Game.questions.weight(q.q_c1) > Game.questions.weight(q.q_c3), 'rontott > új');
  assert.ok(Game.questions.weight(q.q_c2) < Game.questions.weight(q.q_c3), 'begyakorolt < új');
  const f = { pools: ['tp'], tags: ['tctx', 'artikel'] };
  assert.equal(Game.questions.pick(f, { exclude: ['q_c2', 'q_c3'] }).id, 'q_c1');
  assert.ok(Game.questions.pick(f, { exclude: ['q_c1', 'q_c2', 'q_c3'] }), 'ha minden elfogyott, ismétel');
  assert.equal(Game.questions.pick({ pools: ['nincs'] }), null);
  // a rontott kérdés a véletlenek többségénél előbb jön, mint a begyakorolt
  let c1 = 0, c2 = 0;
  for (let i = 0; i < 200; i++) { const id = Game.questions.pick(f, { random: () => i / 200 }).id; if (id === 'q_c1') c1++; if (id === 'q_c2') c2++; }
  assert.ok(c1 > 3 * c2, c1 + ' vs ' + c2);
});

test('kihívás: győzelem, nem ismétel kérdést, rossz válasz sebez (config)', () => {
  const { Game } = setup();
  const c = Game.questions.challenge('ch_t');
  const right = q => q.answers[0], wrong = q => q.wrong[0];
  const q1 = c.next();
  const r1 = c.submit(wrong(q1));
  assert.deepEqual([r1.correct, r1.damage, r1.done, r1.expected], [false, Game.data.config.questions.wrongDamage, false, q1.answers[0]]);
  assert.equal(Game.state.hp, Game.state.maxHp - Game.data.config.questions.wrongDamage);
  const q2 = c.next();
  assert.notEqual(q2.id, q1.id);
  assert.equal(c.submit(right(q2)).done, false);
  assert.equal(c.submit(right(q2)), null, 'next() nélkül nem lehet újra válaszolni');
  const r3 = c.submit(right(c.next()));
  assert.deepEqual([r3.done, r3.won, c.status], [true, true, 'won']);
  assert.equal(c.next(), null);
});

test('kihívás: a szörny "need"-je felülírja; 0 HP = elveszett; menekülés', () => {
  const { Game } = setup();
  assert.equal(Game.questions.challenge('ch_t', { need: 3 }).need, 3);
  Game.state.setHp(4);
  const c = Game.questions.challenge('ch_t');
  c.submit(c.next().wrong[0]);
  assert.equal(c.status, 'active');
  const r = c.submit(c.next().wrong[0]);
  assert.deepEqual([r.damage, r.lost, c.status, Game.state.hp], [1, true, 'lost', 0]);
  const f = Game.questions.challenge('ch_t');
  f.next(); f.flee();
  assert.deepEqual([f.status, f.submit('x')], ['fled', null]);
  assert.equal(Game.questions.challenge('ch_nincs'), null);
});

test('kihívás: napi (naponta egyszer, saját HP-ár) és egyszeri (utána feloldva)', () => {
  const { Game } = setup();
  const now = new Date(2026, 10, 17, 12), tomorrow = new Date(2026, 10, 18, 8);
  const solve = c => { const q = c.next(); const g = q.type === 'choice' ? q.answers[0] : q.type === 'tiles' ? Game.i18n.de(q.answers[0]).split(' ') : Game.i18n.de(q.answers[0]); return c.submit(g); };
  assert.equal(Game.questions.available('ch_day', now), true);
  const d = Game.questions.challenge('ch_day', { now });
  const q = d.next();
  d.submit(q.type === 'choice' ? q.wrong[0] : 'xyz');
  assert.equal(Game.state.hp, Game.state.maxHp - 5, 'wrongDamage a kihívásból');
  assert.equal(solve(d).won, true);
  assert.equal(Game.questions.available('ch_day', now), false);
  assert.equal(Game.questions.available('ch_day', tomorrow), true);
  assert.equal(Game.questions.available('ch_once'), true);
  const o = Game.questions.challenge('ch_once');
  for (let i = 0; i < 5 && o.status === 'active'; i++) solve(o);
  assert.equal(o.status, 'won');
  assert.equal(Game.questions.available('ch_once'), false);
  assert.equal(Game.state.isUnlocked('ch_once'), true);
  assert.equal(Game.questions.available('ch_nincs'), false);
});

test('kihívás: helyzet-téma contextShare eséllyel, a többi a szinten belül bármiből', () => {
  const { Game } = setup();
  const ctxIds = ['q_c1', 'q_c2']; // B1 + tctx
  // random < 0.7 -> a témából; random >= 0.7 -> bárhonnan (B1)
  const c1 = Game.questions.challenge('ch_mix', { random: seq(0.1, 0.5) });
  assert.ok(ctxIds.includes(c1.next().id));
  const c2 = Game.questions.challenge('ch_mix', { random: seq(0.95, 0.99) });
  const q2 = c2.next();
  assert.equal(q2.level, 'B1');
  assert.ok(!ctxIds.includes(q2.id), 'a nagy véletlennél a legutolsó, nem téma-kérdés jön: ' + q2.id);
  // nagy mintán nagyjából 70% a témából (a téma 2 kérdés a 6 B1-ből)
  let n = 0;
  for (let i = 0; i < 400; i++) if (ctxIds.includes(Game.questions.challenge('ch_mix').next().id)) n++;
  assert.ok(n > 400 * 0.65 && n < 400 * 0.9, String(n));
});

test('kihívás: közös "asked" lista -> nincs ismétlés több kihíváson át; a témából elfogyva a többiből jön', () => {
  const { Game } = setup();
  const asked = [];
  const seen = [];
  for (let i = 0; i < 3; i++) { const c = Game.questions.challenge('ch_ctx_only', { asked }); seen.push(c.next().id); }
  assert.equal(new Set(seen).size, 3, seen.join());
  assert.deepEqual(seen.slice(0, 3).filter(id => ['q_c1', 'q_c2', 'q_c3'].includes(id)).length, 3);
  const next = Game.questions.challenge('ch_ctx_only', { asked }).next();
  assert.ok(!['q_c1', 'q_c2', 'q_c3'].includes(next.id), 'a téma elfogyott, más jön: ' + next.id);
  assert.equal(asked.length, 4);
});

test('kihívás: a sebzés és a need felülírható (szörny / dungeon), 0 sebzés is lehet', () => {
  const { Game } = setup();
  const c = Game.questions.challenge('ch_t', { damage: 1, need: 3 });
  assert.deepEqual([c.damage, c.need], [1, 3]);
  assert.equal(c.submit === undefined, false);
  c.submit(c.next().wrong[0]);
  assert.equal(Game.state.hp, Game.state.maxHp - 1);
  const z = Game.questions.challenge('ch_t', { damage: 0 });
  z.submit(z.next().wrong[0]);
  assert.equal(Game.state.hp, Game.state.maxHp - 1, '0 sebzés');
  assert.equal(Game.questions.challenge('ch_day').damage, 5, 'a kihívás wrongDamage-e');
  assert.equal(Game.questions.challenge('ch_t').damage, Game.data.config.questions.wrongDamage);
});

test('a valódi dungeonök: minden szörny 2 jó választ kér; sima szörny 1, harcos 2 HP-t visz', () => {
  const { Game } = setup();
  for (const d of Object.values(Game.data.dungeons)) {
    const ch = Game.data.challenges[d.challenge];
    for (const m of d.monsters) {
      const type = Game.data.monsters[m.type];
      const stats = Object.assign({ need: type.need, damage: type.damage }, (d.monsterStats || {})[m.type]);
      const c = Game.questions.challenge(type.challenge || d.challenge, stats);
      assert.equal(c.need, 2, d.id + ' ' + m.type);
      assert.equal(c.damage, /warrior/.test(m.type) ? 2 : 1, d.id + ' ' + m.type);
    }
    assert.ok(Array.isArray(ch.levels) && ch.levels.length, d.id + ': a dungeon szinthez kötött');
  }
});
