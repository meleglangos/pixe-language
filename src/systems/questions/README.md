# Kérdés-rendszer (`Game.questions`)

A közös kérdés-motor: minden német feladat ezen fut (dungeon-szörnyek, később napi kihívás, pet, boss, vizsga;
`docs/DECISIONS.md` D7). DOM és Phaser nélküli logika; az ablak a `src/ui/quiz.js`. Spec: `docs/features/kerdes_rendszer.md`.

## Adat
- Kérdések: `data/questions/pools.json` + `data/questions/<pool>.json` → `Game.data.questions[id]` (`.pool` mezővel),
  `Game.data.questionPools[id].questions`. Kihívások: `data/challenges.json` → `Game.data.challenges[id]`.
  Formátum: `data/README.md`. Az ellenőrzés: `src/systems/content/ContentValidator.js`.

## Publikus függvények
| Függvény | Mit csinál |
| --- | --- |
| `select({ pools, tags, context, levels })` | a feltételeknek megfelelő kérdések (üres feltétel: nem szűr) |
| `pick(filter, { exclude, random })` | egy kérdés, a haladás szerint súlyozva (`weight`): új 3, rontott 4, eltalált `2 / (1 + sorozat)` |
| `choices(q)` / `tiles(q)` | választós lehetőségek `[{ key, correct }]` / szókártyák `[{ id, text }]`, keverve |
| `check(q, given)` | `{ correct, expected }`, állapotot nem ír. `given`: choice → kulcs, input → szöveg, tiles → szavak tömbje |
| `answer(id, given)` | `check` + `Game.state.recordAnswer` |
| `normalize(s, caseSensitive)` | a gépelési kényelem (`docs/GERMAN.md` 6.): kis-/nagybetű, `ae`/`oe`/`ue`/`ss`, szóköz, mondatvégi írásjel |
| `available(chId, now)` | `daily`: ma még nem teljesítette; `once`: még nincs feloldva; `unlimited`: mindig |
| `challenge(chId, { need, damage, asked, random, now })` | kihívás: `next()`, `submit(given)`, `flee()`, `status` (lent) |

## Debug
`index.html?debug=1`: a kérdés-ablakban „Lösung zeigen” gomb (`Game.quiz.toggleCheat`), a fejlesztőnek.

## Kihívás
`need` jó válasz kell, rossz válaszonként `damage` HP (a hívó adja, pl. a szörny értékei; különben a kihívás
`need` / `wrongDamage`-e, végül `config.js`); ha a HP 0, `status = 'lost'`. Kérdés: `contextShare` eséllyel a
`context` témából, különben bármi a szűrésen (`levels`, `tags`, `pools`) belül, mindig a még nem látottak közül.
Az `asked` tömb közös lehet több kihívás között (a dungeon egy látogatásra adja), így nincs ismétlés. Győzelemkor `daily` → `Game.state.markDaily(id)`, `once` → `Game.state.unlock(id)`.
`submit` visszatér: `{ correct, expected, damage, done, won, lost }`.

## Állapot és események (`Game.state`)
`questionRecord(id)`, `recordAnswer(id, correct)` → `state:questions`; `unlock(id)`, `isUnlocked(id)` → `state:unlocks`;
`dailyCount(id)`, `markDaily(id)` → `state:daily`. Mind a mentésbe kerül (v4), automatikus mentéssel.
