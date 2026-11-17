# Játéktervezés

Hogyan *működik* a játék: a rendszerek szabályai és fogalmai. Akkor olvasd el, ha ezekhez a rendszerekhez
nyúlsz (loot, rarity, HP, kérdés-kihívások, pet), vagy új feature specet írsz.

- **A számok nem itt vannak.** Sebesség, HP, rarity színek: `src/config/config.js`; a tartalom: `data/*.json`.
  Ez a fájl a logikát írja le, és a számokra csak hivatkozik.
- **„Eldöntendő”** = még nincs szabály. Ne találj ki rá szabályt magadtól: a hozzá tartozó feature spec
  (`docs/features/`) dönti el a felhasználóval, és utána ide kerül be.
- Ha egy szabály változik, itt is frissítsd. Ha a változásnak indoka van, írd be a `docs/DECISIONS.md`-be is.

## 1. A játék köre

Világtérkép → helyszín (dungeon) → német feladatok → jutalom (loot, arany, feloldás) → erősebb felszerelés
→ nehezebb dungeon. A tanulás a játék motorja: haladni a feladatok megoldásával lehet, nem a feladatok mellett.

- A világtérképen a helyszínekre belépést a `Game.poi.handlers[típus]` kezeli; kezelő nélkül „még zárva”.
- A dungeonök közös rendszerrel futnak (`DungeonScene`), a kinézetüket a téma adja (`src/world/dungeonThemes.js`).
- A dungeonök haladva nehezednek: a nyelvi szint és a jutalom is nő (a szintekről: `docs/GERMAN.md`).

## 2. Rarity létra

Kilenc fokozat alulról felfelé: `common1–3`, `rare1–3`, `epic1–2`, `legendary`
(ID-k és színek: `config.js` → `rarities`; nevek: `rarity.<id>` a fordítási fájlban).

- Alapelv: a nehezebb kihívás és a későbbi dungeon jobb ritkaságot ér.
- **Eldöntendő:** pontosan mi határozza meg egy tárgy ritkaságát, és mennyivel erősebb egy fokozat a másiknál.

## 3. Jutalmak és loot

- Loot forrásai (tervezett): láda a dungeonben, kérdés-kihívás, boss, vizsga. Mindegyik loot táblára
  hivatkozik (`data/loot_tables.json`, formátum: `data/README.md`); a jutalom soha nincs a kódba égetve.
- Alapelv: a nehezebb kérdés és a több egymás utáni jó válasz jobb lootot ér; a „komoly” jutalom
  (epic, legendary) a vizsgákhoz és bossokhoz kötődik.
- Meglepetés-loot: `Game.state.addSurprise` (a mentésben már van helye).
- **Eldöntendő:** a loot táblák súlyai, az arany mennyisége, ismétlődhet-e a láda tartalma.

## 4. HP

- Most: maximum 20 (`config.js` → `player.maxHp`), módosítás: `setHp / damage / heal`.
- Csökken: rossz válasz egy kihívásban (`config.js` → `questions.wrongDamage`, alapból 3; a kihívás felülírhatja).
- 0 HP: a kihívás elveszett, a játékos kiesik a dungeonből, és kint ébred teljes HP-val (amíg nincs HP-ital).
- **Eldöntendő:** mitől nő a HP (ital, pihenés?), és a 0 HP később szigorúbb legyen-e.

## 5. Kérdés-kihívások

Minden német feladat egy közös motoron fut. Egy új ötlet (napi kérdés, pet, boss, vizsga) lehetőleg csak egy
új **kihívás** az adatfájlban, nem új kód. Fogalmak:

| Fogalom | Mit jelent |
| --- | --- |
| **kérdés** | egy feladat: típus (választós, beírós, kiegészítős), szint, téma, helyes megoldás(ok) |
| **pool** | kérdések egy csoportja (`data/questions/`), címkékkel szűrhető |
| **kihívás** | melyik poolból, hány kérdés, hány jó válasz kell, milyen gyakran (egyszer, naponta, korlátlan) |
| **jutalom** | loot tábla, arany, feloldás (`unlocks`), pet-XP |

- Ellenőrzés: elnéző (kis- és nagybetű, umlaut-átírás, szóközök, több helyes megoldás); a részletek:
  `docs/GERMAN.md`.
- Feloldások és napi állapot általános listában élnek a mentésben (`unlocks`, `daily`), így egy új feloldható
  tartalomhoz nem kell mentési migráció, csak egy új ID.
- Kész (spec: `docs/features/kerdes_rendszer.md`, motor: `src/systems/questions/README.md`, formátum: `data/README.md`).
- Kiválasztás: egy kihíváson belül nincs ismétlés; az új és a rontott kérdés gyakrabban jön, a többször
  egymás után eltalált ritkábban (a haladás a mentésben: `questions`).
- Dungeon: minden szörny a dungeon kihívását adja (`dungeons.json` → `challenge`), a `*_warrior` szörnyek 2 jó
  választ kérnek. A legyőzött szörny csak arra a látogatásra tűnik el; ha mind legyőzve, a dungeon teljesítve.
- Rossz válasz: HP-vesztés, a szörny marad, új kérdés jön. Nincs időlimit. Szörnyért még nincs jutalom.

## 6. Pet

- Most: egy kutya követi a játékost (`config.js` → `pet`).
- Tervezett (`docs/IDEAS.md`): saját petek, kattintásra reakció és animáció, pet kérdések.

## 7. Alapelvek minden új rendszerhez

- Minden funkció érintéssel is teljesen használható (iPhone 11 / 13), egérre és billentyűre is.
- Ami haladás, az mentésbe kerül, és egy régi mentés betöltése után is helyesen működik.
- A nehézség fokozatos: az új rendszer első találkozása legyen könnyű, a nehéz változat jöjjön később.
