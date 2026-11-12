# Das Deutsch-Abenteuer

Böngészős pixel-art RPG német nyelvtanuláshoz. Nincs build lépés: az `index.html` megnyitásával fut
(a Phaser 3 és az EasyStar.js CDN-ről töltődik, ehhez internet kell). Webszerverről (pl. GitHub Pages) ajánlott futtatni.

## Állapot
- [x] 1. szakasz: térkép, kattintásos + billentyűs mozgás, kutya, mentés + export/import
- [ ] 2. szakasz: egy dungeon, feladatrendszer, loot szabályok, HP, debug mód
  - [x] alapok: mappaszerkezet, JSON tartalom állandó ID-kkal, SaveManager (verzió, migráció, tartalék), központi állapot + események, tesztek
  - [x] 2/1: „Die versunkene Gruft” dungeon jelenet, szörnyek (harc nélkül), láda
  - [x] 2/2: „Die Kristallmine” dungeon (pálya és látvány), közös dungeon-rendszer, Credits képernyő
- [ ] 3. szakasz: inventory, gear a karakteren, shop, gold, HP-ital
- [ ] 4. szakasz: többi dungeon, boss, meglepetés-lootok, feladatkészlet

## Felépítés
| Hol | Mi |
| --- | --- |
| `data/*.json` | **a teljes tartalom**: szövegek, térkép, dungeonök, szörnyek, berendezés, tárgyak, loot, feladatok, shop – formátumok: [`data/README.md`](data/README.md) |
| `data/bundle.js` | generált másolat a `file://` alóli futáshoz (`node tools/build-data.js`) |
| `src/config/` | kód közeli beállítások: `config.js` (sebesség, HP, rarity létra, creditek), `assets.js` (grafikai manifest), `tiles.js` (mező- és helyszíntípusok) |
| `src/core/` | névtér (`game.js`), eseménybusz (`events.js`), szövegek (`i18n.js`) |
| `src/state/GameState.js` | **központi játékállapot**: HP, arany, inventory, felszerelés, dungeonök – csak a metódusain át módosítható, minden változás eseményt küld |
| `src/systems/save/` | mentés: `SaveManager` (az egyetlen, ami ír/olvas), `SaveSchema` (verzió, migrációk, ellenőrzés), `SaveCodec` (export/import kód) |
| `src/systems/content/` | a `data/*.json` betöltése és ellenőrzése |
| `src/scenes/` | Phaser jelenetek: közös mozgás-alap (`ExploreScene`), világtérkép, dungeon; `dungeon/`: fények, víz, hangulat, berendezés |
| `src/world/` | rács + útkeresés, karakter, kutya, szörny; `dungeonThemes.js`: a dungeonök kinézete (kripta, bánya) |
| `src/ui/` | DOM felület: HUD, menü, ablakok, „?” buborékok |
| `src/gfx/placeholders.js` | a kódból rajzolt ideiglenes grafika |
| `assets/` | grafikai csomagok (Pixel Crawler – Anokolisa; Weapon Icons – Shade; Items16 – Glionox; Modern Interiors – LimeZu, csak nem kereskedelmi célra; Tiny RPG – Zerie) |
| `tests/` | tesztek: `npm test` (Node 18+, függőség nélkül) |

A helyszínekre belépést a `Game.poi.handlers[típus]` kezeli (`WorldScene.js`); amíg nincs kezelő,
a „még zárva” üzenet jelenik meg.

`index.html?debug=1`: kirajzolja a járható (zöld) és blokkolt (piros) mezőket.

## Játékállapot és események
A játékállapot a `Game.state` (`src/state/GameState.js`). Közvetlenül nem szabad átírni, csak a metódusain át:
`setHp / damage / heal`, `addGold / spendGold`, `addItem / removeItem`, `equip / unequip`,
`recordDungeonVisit / completeDungeon`, `addSurprise`, `setFlag`, `setPosition`.
Minden változás eseményt küld (`Game.events.on('state:gold', fn)` stb., a lista a fájl elején);
a HUD ezekre frissül magától, a SaveManager pedig ezekre ment.

## Mentés
- Egyetlen modul ír és olvas: `Game.saveManager` (`src/systems/save/SaveManager.js`).
- localStorage-kulcsok: `deutsch-abenteuer.save` (fő), `….backup` (az előző sikeres mentés),
  `….broken` (egy betölthetetlen mentés félretett másolata). Sérült fő mentésnél a tartalékból tölt be.
- Automatikus mentés: loot, arany, felszerelés, dungeon, HP és jelzők változásakor (egy lépésen belül
  egyetlen írás); a pozíció megálláskor és séta közben 4 másodpercenként; a lap bezárásakor.
- Betöltéskor minden mezőt ellenőriz; az ismeretlen ID-kat eldobja (a konzolra kiírja), nem fagy le.
- A mentésben verziószám van (`v`). **Ha a szerkezet változik:** növeld a `VERSION`-t a
  `SaveSchema.js`-ben, írj egy `migrations[régi verzió]` lépést, és tesztet a `tests/save.migration.test.js`-be.
- Export/import kód: `DA1.<base64>.<ellenőrzőösszeg>` – a régi kódok is betölthetők (migrációval).

## Tesztek
```
npm test
```
Lefedik: mentés–betöltés, tartalék és sérült mentés, ismeretlen ID-k, migráció (valódi v1/v2 mentéssel és
export kóddal a `tests/fixtures/`-ből), automatikus mentés, központi állapot és események, a tartalom
ellenőrzése, a `bundle.js` frissessége.

## Assetek
Katalógus: `assets/ASSETS.md`, előnézetek: `assets/previews/`. Újragenerálás: `python3 tools/asset_catalog/build.py`
(a leírások a `tools/asset_catalog/notes.py`-ban vannak).

## Új dungeon hozzáadása
1. `data/dungeons.json`: új bejegyzés, az `id` a világtérképi helyszín ID-ja (`data/world_map.json` → `pois`):
   pálya ASCII-ban, ajtók, szörnyek, láda, berendezés, `theme: "crypt" | "mine"`.
2. `data/strings.json`: a nevek német–magyar szövege.
3. `node tools/build-data.js`, majd `npm test`.
4. Új kinézethez új téma a `src/world/dungeonThemes.js`-ben. A `DungeonScene` kódjához nem kell nyúlni.
