# Kérdés-rendszer (közös kérdés-motor)

**Állapot:** folyamatban (jóváhagyva: 2026-11-17)
**Ötlet:** README „Állapot” → 2. szakasz → feladatrendszer (kérdés-rendszer); `docs/DECISIONS.md` D6, D7

## 1. Cél
Minden német feladat egy közös motoron fut: kérdések poolokban, egy „kihívás” megmondja, honnan és hány
kérdés jön, hány jó válasz kell, és mi a jutalom / büntetés. Első használat: a dungeonök szörnyei kérdeznek.
A játékos B1–C1 szintű, Duolingo-szerű, telefonon kényelmes feladatokat old meg, azonnali visszajelzéssel.

## 2. Játék közben
A dungeonben a szörnyre koppint (vagy mellé áll, és „Herausfordern”). Ablak nyílik: fent a szörny neve és
„Richtige Antworten: 0 von 2”, alatta a kérdés („?”-lel magyarul). Választós kérdésnél nagy gombok, beírósnál
szövegmező, mondatépítésnél szókártyák. Válasz után: zöld / piros jelölés, rossznál a helyes megoldás és rövid
magyarázat („?”). Ha összejön a szükséges számú jó válasz, a szörny porrá omlik, és szabad az út. Rossz válasz
következménye: lásd 9. A „Fliehen” gombbal bármikor kiléphet. Ha minden szörny legyőzve: a dungeon teljesítve.

## 3. Mire épül
- Meglévő: `Game.state` (HP, `completeDungeon`), `DungeonScene` (szörnyek, hotspotok), `ui.modal`, fordítási fájl,
  `ContentLoader` + `ContentValidator`, `SaveSchema`.
- Új rendszer: `src/systems/questions/` (motor: kiválasztás, ellenőrzés, kihívás; DOM és Phaser nélkül,
  tesztelhető) + `README.md`; ablak: `src/ui/quiz.js`. Új, mert ilyen még nincs (D7: egy közös motor).

## 4. Adat
- `data/questions/pools.json`: a poolok listája; minden pool egy fájl: `data/questions/<pool>.json`
  (a böngésző nem tud mappát listázni, ezért kell a lista). A `tasks.json` (üres) helyett; a `build-data`
  és a `ContentLoader` megtanulja.
- `data/challenges.json`: kihívások. A `monsters.json` szörnytípus és a `dungeons.json` dungeon hivatkozik rá.
```jsonc
// data/questions/b1_dungeon_crypt.json
{"id": "q_b1_crypt_perfekt_01", "type": "choice", "level": "B1", "tags": ["perfekt"],
 "prompt": "q.b1_crypt_perfekt_01.prompt", "answers": ["q.b1_crypt_perfekt_01.a"],      // minden helyes megoldás
 "wrong": ["q.b1_crypt_perfekt_01.w1", "q.b1_crypt_perfekt_01.w2"],                     // választósnál a rossz lehetőségek
 "explain": "q.b1_crypt_perfekt_01.explain"}
// típusok: choice (választós), input (beírós / Lückentext), tiles (szókártyás mondatépítés); később: match (párosítás)
// data/challenges.json
{"id": "ch_crypt_monster", "pools": ["b1_dungeon_crypt"], "tags": [], "need": 1, "wrongDamage": 3, "repeat": "unlimited"}
// monsters.json: "challenge": "ch_crypt_monster", "need": 2 (felülírja, erősebb szörnynél)
```
- „Ellenőrizendő” jelölés: a fordítási fájlban, a bejegyzésen: `{"de": …, "hu": …, "review": true}`. A validátor
  csak `true`-t enged; `node tools/review-list.js` kilistázza a jelölt szövegeket (D: 9. pont).

## 5. Állapot és mentés
- Új mezők (v3 → v4, migrációval és teszttel, `tests/fixtures/save_v3.json`):
  - `questions: { id: { right, wrong, streak } }` – haladás; a rontott és új kérdés gyakrabban jön (IDEAS: ismétlés).
  - `unlocks: [id]` és `daily: { date, done: { kihívás-id: n } }` – az általános feloldás / napi állapot (README
    „Állapot” kéri); most még semmi nem írja őket, csak a helyük és a metódusuk készül el.
- `Game.state`: `questionRecord(id)`, `recordAnswer(id, correct)` → `state:questions`; `unlock(id)`, `isUnlocked(id)`
  → `state:unlocks`; `dailyDone(chId)`, `markDaily(chId)` → `state:daily`. Mind automatikusan ment.

## 6. Felület
- Ablak (`ui.modal`, nem zárható kattintással): cím, haladás, kérdés + „?”, válasz-rész, visszajelzés, gombok
  (`Prüfen`, `Weiter`, `Fliehen`, `Fertig`). Válaszgombokon nincs „?” (elárulná a megoldást).
- Érintés: gombok teljes szélességűek, min. 44 px magasak; beírósnál az iOS ne javítson automatikusan
  (`autocorrect/autocapitalize off`), az Enter is beküld; kis képernyőn görgethető ablak, a billentyűzet ne takarja.

## 7. Szövegek
- Felület: `mob.challenge`, `quiz.progress`, `quiz.check`, `quiz.correct`, `quiz.wrong`, `quiz.damage`, `quiz.next`,
  `quiz.flee`, `quiz.finish`, `quiz.won`, `quiz.lost`, `quiz.placeholder`, `dungeon.cleared` (B1 egyszerűségű).
- Kérdések: `q.<kérdés-id nélkül q_>.<prompt|a|w1|explain>`. Első két pool: kripta B1 (Perfekt/Präteritum, Dativ/
  Akkusativ elöljárók, `weil/dass/obwohl`, melléknévragozás) és bánya B1–B2 (visszaható igék, `um … zu`,
  Konjunktiv II, vonzatos igék); poolonként kb. 20 kérdés, vegyes típus, bizonytalan → `review`.

## 8. Assetek
- Nincs új: az ablak a meglévő pergamen-stílus; a szörny eltűnése kódból rajzolt porfelhő.

## 9. Eldöntendő kérdések
- [x] Rossz válasz következménye? → **−3 HP** (`config.js`, kihívásonként felülírható), a szörny marad, új kérdés jön.
- [x] 0 HP-nál? → **kiesik a dungeonből**, kint ébred **teljes HP-val** (amíg nincs HP-ital).
- [x] Legyőzött szörny? → **minden belépéskor újra ott van** (gyakorlás); a „teljesítve” jelzés a mentésben marad.
- [x] Jutalom a szörnyért? → **még semmi**; a loot szabályok külön tétel.
- [x] Időlimit? → **nincs**.
- [x] Erősebb szörny (`*_warrior`) **2** jó választ kér, a többi 1-et.
- [x] `review` jelölés → **a fordítási fájlban**, a bejegyzésen.

## 10. Kész, ha
- [ ] a szörnyre koppintva kérdés jön; jó válaszokra a szörny eltűnik, rossznál a 9. szerinti következmény
- [ ] választós, beírós és szókártyás kérdés működik, telefonon is kényelmesen
- [ ] a beírós ellenőrzés a `docs/GERMAN.md` 6. része szerint elnéző, és csak a felsorolt megoldásokat fogadja el
- [ ] a validátor ellenőrzi a kérdéseket, kihívásokat, hivatkozásokat és a `review` jelölést
- [ ] `node tools/build-data.js` és `npm test` zöld, új tesztekkel (motor, ellenőrzés, kihívás, migráció)
- [ ] egy régi (v1, v2, v3) mentés betöltése után is helyesen működik
- [ ] telefonméretben (iPhone 13 emuláció, érintéssel) kipróbálva
- [ ] README „Állapot”, `docs/GAME_DESIGN.md` 4–5. rész (HP, kihívások) és `docs/DECISIONS.md` frissítve

## 11. Lépések
1. Motor: pool- és kérdésformátum, betöltés, validátor, `review` jelölés + lista; tesztek (még nincs felület).
2. Mentés v4: `questions`, `unlocks`, `daily` + `Game.state` metódusok, migráció, fixture, tesztek.
3. Kihívás: `data/challenges.json`, kiválasztás súlyozva, elnéző ellenőrzés, HP-következmény; tesztek.
4. Felület: kérdés-ablak (választós, beírós, szókártyás), telefonméretű próba.
5. Dungeon: „Herausfordern”, a szörny eltűnése, dungeon teljesítése, 0 HP kezelése.
6. Tartalom: a két első pool (kripta B1, bánya B1–B2), `review` jelölésekkel.
7. Lezárás: dokumentáció (rendszer-README, GAME_DESIGN, DECISIONS, README „Állapot”).

Megjegyzés: egy korai prototípus (a folyamat ismerete nélkül készült, A1-es kérdésekkel) helyben megvan a
`proto/kerdes-rendszer` branchen (nincs feltöltve). A motor, az ablak és a dungeon-rész kódja jóváhagyás után
ennek a specnek megfelelően átdolgozva felhasználható; a kérdései nem (szint alattiak).
