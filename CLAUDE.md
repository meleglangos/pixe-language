# Das Deutsch-Abenteuer – munkaszabályok

Böngészős pixel-art RPG német nyelvtanuláshoz. Phaser 3, sima `<script>` tagek, nincs build lépés;
GitHub Pages-en fut (`.github/workflows/pages.yml`). Tesztek: `npm test` (Node 20+, függőség nélkül).

## Felépítés

| Hol | Mi |
| --- | --- |
| `data/*.json` | minden tartalom: dungeonök, szörnyek, berendezés, tárgyak, loot táblák, feladatok, shop (formátumok: `data/README.md`) |
| `data/translations.json` | a fordítási fájl: minden megjelenő szöveg kulccsal, `de` + `hu` változattal |
| `data/maps/*.json` | a pályák Tiled formátumban (overworld, dungeon_crypt, dungeon_mine); `tilesets/` = a Tiled képei |
| `data/bundle.js` | GENERÁLT (`node tools/build-data.js`), a `file://` alóli futáshoz; kézzel ne szerkeszd |
| `src/core/` | névtér, eseménybusz (`Game.events`), szövegek (`Game.i18n`) |
| `src/config/` | kód közeli beállítások: `config.js` (egyensúly, rarity, creditek), `assets.js` (kivágások), `tiles.js` |
| `src/state/GameState.js` | a központi játékállapot (`Game.state`): HP, arany, inventory, felszerelés, dungeonök |
| `src/systems/save/` | mentés: `SaveManager`, `SaveSchema` (verzió + migrációk), `SaveCodec` (export/import kód) |
| `src/systems/content/` | a `data/` betöltése és ellenőrzése; `src/systems/maps/`: Tiled olvasó |
| `src/scenes/` | Phaser jelenetek (Boot, World, Dungeon + `dungeon/` részei); `src/world/`: rács, karakterek, dungeon-témák |
| `src/ui/` | DOM felület: HUD, menü, ablakok, „?” buborék |
| `tests/` | tesztek; `tests/fixtures/`: valódi régi mentések a migrációs tesztekhez |

## Szabályok

- **Tartalom csak adatfájlban.** Dungeon, szörny, tárgy, loot, feladat, shop-kínálat a `data/*.json`-ba kerül,
  pálya a `data/maps/`-ba (Tiled), nem a kódba. Adatmódosítás után: `node tools/build-data.js`, majd `npm test`.
- **Állandó ID-k.** Minden tételnek egyedi szöveges ID-ja van (`dungeon_crypt`, `sword_bronze_01`; kisbetű, szám, `_`).
  A mentés csak ID-kat tárol, ezért kiadott ID-t soha ne nevezz át és ne törölj; ha mégis muszáj: migráció.
- **Szöveg csak a fordítási fájlon át.** Kódba és más adatfájlba csak kulcs kerül (`ui.tx('menu.title')`,
  `Game.i18n.de(kulcs)`), minden kulcshoz `de` és `hu` változat kell. A „?” buborék: `ui.help(kulcs)`.
- **Mentés csak a SaveManageren át** (`Game.saveManager`); más kód nem nyúl a localStorage-hoz.
- **A mentési formátum változásakor kötelező a migráció:** `VERSION` növelése és `migrations[régi verzió]`
  a `src/systems/save/SaveSchema.js`-ben, plusz teszt a `tests/save.migration.test.js`-be.
  A régi mentéseknek és export kódoknak mindig be kell töltődniük.
- **Állapot csak a `Game.state` metódusain át** változik (`addGold`, `addItem`, `equip`, `completeDungeon`…);
  a `Game.state.data`-t közvetlenül ne írd. A felület a `state:*` eseményekre iratkozzon fel.
- Egy fájl egy felelősség; új rendszer (harc, shop, loot…) a `src/systems/<név>/` alá kerül.
- Tiled térképnél: ortogonális, 16×16, CSV réteg-formátum, beágyazott tileset relatív képútvonallal,
  a rétegnevek maradjanak (lásd `data/README.md`).

## Assetek

Ha assetet keresel, először mindig az `assets/ASSETS.md` katalógusban és az `assets/previews` képeken keress. Csak akkor nyisd meg a nyers fájlokat, ha a katalógus alapján már tudod, melyik kell. Ha új assetet töltök fel, frissítsd a katalógust és az előnézeteket.

- A katalógust és az előnézeteket a `python3 tools/asset_catalog/build.py` generálja; az `ASSETS.md`-t ne szerkeszd kézzel.
- Új asset után: csomagold ki külön almappába az `assets/` alatt (a ZIP-et utána töröld), add hozzá a csomagot és a
  kategóriáit a `tools/asset_catalog/rules.py`-hoz, futtasd a buildet, nézd meg az új előnézeteket, és írd be a
  leírásokat a `tools/asset_catalog/notes.py`-ba, amíg a build nem jelez „leírás nélkül” tételt. Az új csomag
  creditjét vedd fel a `src/config/config.js` → `credits` alá is.
- A játékban használt kivágások nevei és koordinátái a `src/config/assets.js`-ben vannak.
