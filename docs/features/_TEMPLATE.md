# <Feature neve>

<!-- Sablon: másold le `docs/features/<id>.md` néven (kisbetű, szám, `_`), és töltsd ki.
     Egy kész spec kb. 30–60 sor. Ami nem vonatkozik a feature-re, oda írd: „nincs”.
     A felhasználó jóváhagyása előtt nem készül kód. -->

**Állapot:** tervezet | jóváhagyva | folyamatban | kész
**Ötlet:** `docs/IDEAS.md` → <a sor szövege>

## 1. Cél
<1–2 mondat: mit kap a játékos, és mit tanul belőle.>

## 2. Játék közben
<Rövid forgatókönyv a játékos szemével: hol találkozik vele, mit csinál, mit lát, mit kap.>

## 3. Mire épül
- Meglévő rendszerek: <kérdés-motor, loot, feloldás, pet…>
- Új rendszer kell-e: <nincs | `src/systems/<név>/`: miért nem elég a meglévő>

## 4. Adat
- Új vagy módosított fájl és mező: <`data/…json`>
- Példa:
```json
{}
```

## 5. Állapot és mentés
- Új mező a mentésben: <nincs | mi, és miért nem elég a meglévő `unlocks` / `daily` / `flags`>
- Ha van: `VERSION` növelése, `migrations[régi verzió]`, teszt a `tests/save.migration.test.js`-be.
- Új `Game.state` metódus és esemény: <…>

## 6. Felület
- Ablak, gomb, HUD-elem: <…>
- Érintéssel (iPhone 11 / 13): <hogyan, mekkora gombok, mi történik kis képernyőn>

## 7. Szövegek
- Új fordítási kulcsok (`de` + `hu`): <`kulcs.alkulcs`…>
- Német tartalom: szint, téma, feladattípus (`docs/GERMAN.md`).

## 8. Assetek
- Kell: <…> — a katalógusban: <igen, melyik | nincs: helyettesítő vagy új csomag kell>

## 9. Eldöntendő kérdések
<Amit a felhasználónak kell eldöntenie a kódolás előtt. A döntések ide kerülnek a kérdés alá.>
- [ ] <kérdés>

## 10. Kész, ha
- [ ] <a feature-re jellemző, ellenőrizhető pont>
- [ ] `node tools/build-data.js` és `npm test` zöld, új tesztekkel a feature-re
- [ ] egy régi mentés betöltése után is helyesen működik
- [ ] telefonméretben (érintéssel) is kipróbálva
- [ ] README „Állapot”, `CHANGELOG.md`, szükség esetén `docs/GAME_DESIGN.md` és `docs/DECISIONS.md` frissítve

## 11. Lépések
<Nagy feature-nél kisebb, önállóan működő lépések; mindegyik külön commit.>
1. <…>
