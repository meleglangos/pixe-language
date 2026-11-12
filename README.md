# Das Deutsch-Abenteuer

Böngészős pixel-art RPG német nyelvtanuláshoz. Nincs build lépés: az `index.html` megnyitásával fut
(a Phaser 3 és az EasyStar.js CDN-ről töltődik, ehhez internet kell). Webszerverről (pl. GitHub Pages) ajánlott futtatni.

**Online:** https://meleglangos.github.io/pixe-language/ (lásd lent: [Online elérhetőség](#online-elérhetőség-github-pages))

## Állapot
- [x] 1. szakasz: térkép, kattintásos + billentyűs mozgás, kutya, mentés + export/import
- [ ] 2. szakasz: egy dungeon, feladatrendszer, loot szabályok, HP, debug mód
  - [x] alapok: mappaszerkezet, JSON tartalom állandó ID-kkal, SaveManager (verzió, migráció, tartalék), központi állapot + események, tesztek
  - [x] alapok 2: fordítási fájl, Tiled térképek, GitHub Pages automatikus közzététel
  - [x] 2/1: „Die versunkene Gruft” dungeon jelenet, szörnyek (harc nélkül), láda
  - [x] 2/2: „Die Kristallmine” dungeon (pálya és látvány), közös dungeon-rendszer, Credits képernyő
- [ ] 3. szakasz: inventory, gear a karakteren, shop, gold, HP-ital
- [ ] 4. szakasz: többi dungeon, boss, meglepetés-lootok, feladatkészlet

## Felépítés
| Hol | Mi |
| --- | --- |
| `data/*.json` | **a teljes tartalom**: dungeonök, szörnyek, berendezés, tárgyak, loot, feladatok, shop – formátumok: [`data/README.md`](data/README.md) |
| `data/translations.json` | **a fordítási fájl**: minden megjelenő szöveg kulccsal, német + magyar változattal |
| `data/maps/` | a pályák **Tiled** formátumban (overworld, kripta, kristálybánya); `tilesets/`: a szerkesztő képei |
| `data/bundle.js` | generált másolat a `file://` alóli futáshoz (`node tools/build-data.js`) |
| `src/config/` | kód közeli beállítások: `config.js` (sebesség, HP, rarity létra, creditek), `assets.js` (grafikai manifest), `tiles.js` (mező- és helyszíntípusok) |
| `src/core/` | névtér (`game.js`), eseménybusz (`events.js`), szövegek (`i18n.js`) |
| `src/state/GameState.js` | **központi játékállapot**: HP, arany, inventory, felszerelés, dungeonök – csak a metódusain át módosítható, minden változás eseményt küld |
| `src/systems/save/` | mentés: `SaveManager` (az egyetlen, ami ír/olvas), `SaveSchema` (verzió, migrációk, ellenőrzés), `SaveCodec` (export/import kód) |
| `src/systems/content/` | a `data/*.json` betöltése és ellenőrzése |
| `src/systems/maps/` | a Tiled térképek olvasása (`TiledMap.js`) |
| `src/scenes/` | Phaser jelenetek: közös mozgás-alap (`ExploreScene`), világtérkép, dungeon; `dungeon/`: fények, víz, hangulat, berendezés |
| `src/world/` | rács + útkeresés, karakter, kutya, szörny; `dungeonThemes.js`: a dungeonök kinézete (kripta, bánya) |
| `src/ui/` | DOM felület: HUD, menü, ablakok, „?” buborékok |
| `src/gfx/placeholders.js` | a kódból rajzolt ideiglenes grafika |
| `assets/` | grafikai csomagok (Pixel Crawler – Anokolisa; Weapon Icons – Shade; Items16 – Glionox; Modern Interiors – LimeZu, csak nem kereskedelmi célra; Tiny RPG – Zerie) |
| `tests/` | tesztek: `npm test` (Node 20+, függőség nélkül) |
| `tools/` | `build-data.js` (bundle), `asset_catalog/` (asset-katalógus) |
| `.github/workflows/pages.yml` | tesztek + közzététel GitHub Pages-en |

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
ellenőrzése, a fordítási fájl (minden kulcs megvan, de + hu), a Tiled térképek, a `bundle.js` frissessége.

## Szövegek és fordítás
Minden megjelenő szöveg a `data/translations.json`-ból jön, kulccsal (`Game.i18n.de(kulcs)` / `ui.tx(kulcs)`).
A „?” gomb (`ui.help(kulcs)`) a buborékban ugyanennek a kulcsnak a magyar változatát mutatja.
Kódba és más adatfájlba csak kulcs kerülhet, kész szöveg nem.

## Térképek szerkesztése (Tiled)
A [Tiled](https://www.mapeditor.org/) szerkesztővel: File → Open → `data/maps/overworld.json` (vagy
`dungeon_crypt.json`, `dungeon_mine.json`). Mentés után `node tools/build-data.js` és `npm test`.
A rétegek és objektumok jelentése: [`data/README.md`](data/README.md#maps--tiled-térképek).

## Online elérhetőség (GitHub Pages)
A `.github/workflows/pages.yml` minden `main`-re küldött push után lefuttatja a teszteket, és ha zöldek,
kiteszi a játékot. Egyszeri beállítás a GitHubon:
1. Repó → **Settings** → bal oldalt **Pages**.
2. **Build and deployment** → **Source**: válaszd a **GitHub Actions**-t (nem a „Deploy from a branch”-et).
3. Ha a repó privát, a Pages-hez fizetős csomag kell; publikus repónál ingyenes.
4. Az **Actions** fülön a „GitHub Pages” futás végén megjelenik a cím: https://meleglangos.github.io/pixe-language/
   (első alkalommal kézzel is indítható: Actions → GitHub Pages → **Run workflow**).

## Assetek
Katalógus: `assets/ASSETS.md`, előnézetek: `assets/previews/`. Újragenerálás: `python3 tools/asset_catalog/build.py`
(a leírások a `tools/asset_catalog/notes.py`-ban vannak).

## Új dungeon hozzáadása
1. Tiledben: másold le pl. a `data/maps/dungeon_crypt.json`-t új néven (`dungeon_<név>.json`), és rajzold meg
   a pályát (terep, ajtók, szörnyek, láda, berendezés).
2. A világtérképen (`data/maps/overworld.json`, `pois` réteg) legyen egy helyszín ugyanezzel az ID-val.
3. `data/dungeons.json`: új bejegyzés (`id`, `name`, `theme: "crypt" | "mine"`, `map`).
4. `data/translations.json`: a nevek német–magyar szövege (`poi.<id>.name`, `poi.<id>.desc`).
5. `node tools/build-data.js`, majd `npm test`.
6. Új kinézethez új téma a `src/world/dungeonThemes.js`-ben. A `DungeonScene` kódjához nem kell nyúlni.
