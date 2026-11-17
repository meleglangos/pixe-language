# Das Deutsch-Abenteuer – munkaszabályok

## A projekt

Böngészős pixel-art RPG német nyelvtanuláshoz, egyetlen játékosnak: a fejlesztő barátnőjének (23 éves,
B1–C1 szint). A fejlesztő **nem tud németül**, tehát a német szöveget rajtad kívül senki nem ellenőrzi: egy hibás
mondat rosszabb, mint egy hiányzó. A játék GitHub Pages-en fut, a repó és az oldal **nyilvános**: személyes
tartalom csak a felhasználó kifejezett jóváhagyásával kerülhet bele.

## Kommunikáció és önállóság

- Magyarul válaszolj, röviden. A feladat végén összefoglaló: mi készült, **mit próbáljon ki a telefonon**,
  mely német szövegek kaptak `review` jelölést, mi a következő lépés.
- **Önálló vagy** a kreatív munkában: dungeon, sztori, nevek, szörnyek, kérdések, hangulat, apró javítások.
- **Kérdezz előbb**, ha a kérés ütközne egy szabállyal, mentési formátumot vagy kiadott ID-t érintene, új
  függőséget vagy build lépést hozna, vagy bármi a `main`-re kerülne.
- **Szabályt soha ne szegj meg**, akkor sem, ha a kérés erre utalna: szólj, és ajánlj szabályos megoldást.

## Technika

- Phaser 3.90 és EasyStar.js 0.4.4 CDN-ről, sima `<script>` tagek, globális `Game.*` névtér, nincs modul,
  nincs npm függőség, nincs build lépés (`docs/DECISIONS.md` D1).
- Futtatás: `index.html` (`file://`-ról is, a `data/bundle.js` miatt) vagy helyi szerver
  (`python3 -m http.server`). `index.html?debug=1`: megoldás-mutató a kérdés-ablakban; `?grid=1`: járható / blokkolt mezők.
- Tesztek: `npm test` (Node 20+, függőség nélkül); minden push után a CI is lefuttatja (`.github/workflows/tests.yml`).
- Pixel art: `pixelArt: true`, `roundPixels: true` (`src/main.js`), canvas `image-rendering: pixelated`.
  Ezeket ne kapcsold ki; grafikát csak egész számú nagyítással használj.
- Branch: a fejlesztés munkabranchen folyik (most: `refactor/foundations`), a `main` az élő oldal.
  A `main`-re csak a felhasználó jóváhagyása után kerül bármi (PR + merge), közvetlenül ne pusholj rá.

## Mappatérkép

| Hol | Mi |
| --- | --- |
| `data/*.json` | minden tartalom: dungeonök, szörnyek, berendezés, tárgyak, loot táblák, kihívások, shop (formátumok: `data/README.md`) |
| `data/questions/` | a német kérdések egy közös készletben: `pools.json` (fájllista) + `<fájl>.json`, `tags.json` (címkelista) |
| `data/translations.json` | a fordítási fájl: minden megjelenő szöveg kulccsal, `de` + `hu` változattal |
| `data/maps/*.json` | a pályák Tiled formátumban (overworld, dungeon_crypt, dungeon_mine); `tilesets/` = a Tiled képei |
| `data/bundle.js` | GENERÁLT (`node tools/build-data.js`), a `file://` alóli futáshoz; kézzel ne szerkeszd |
| `src/core/` | névtér (`game.js`), eseménybusz (`Game.events`), szövegek (`Game.i18n`) |
| `src/config/` | `config.js` (egyensúly, rarity, creditek), `assets.js` (kivágások), `tiles.js` (mező- és helyszíntípusok) |
| `src/state/GameState.js` | a központi játékállapot (`Game.state`): HP, arany, inventory, felszerelés, dungeonök, jelzők |
| `src/systems/save/` | mentés: `SaveManager`, `SaveSchema` (verzió + migrációk), `SaveCodec` (export/import kód) |
| `src/systems/content/` | a `data/` betöltése és ellenőrzése; `src/systems/maps/`: Tiled olvasó |
| `src/systems/loot/` | loot sorsolás (`Game.loot`), tárgy-ikonok (`Game.itemIcons`); a „Beute” lista: `src/ui/loot.js`, a láda-ablak: `src/ui/chestWindow.js` |
| `src/systems/questions/` | a közös kérdés-motor (`Game.questions`): kiválasztás, ellenőrzés, kihívás; ablak: `src/ui/quiz.js` |
| `src/scenes/` | Phaser jelenetek: `ExploreScene` (közös mozgás-alap), `WorldScene`, `DungeonScene`; `dungeon/`: fény, víz, hangulat, berendezés, láda |
| `src/world/` | rács + útkeresés, karakter, kutya, szörny; `dungeonThemes.js`: a dungeonök kinézete |
| `src/ui/` | DOM felület: HUD, menü, ablakok, „?” buborék |
| `src/gfx/placeholders.js` | a kódból rajzolt ideiglenes grafika |
| `assets/` | grafikai csomagok, katalógus: `assets/ASSETS.md` (a Modern Interiors csak nem kereskedelmi célra használható) |
| `tests/` | tesztek; `tests/fixtures/`: valódi régi mentések a migrációs tesztekhez |
| `tools/` | `build-data.js` (bundle + ellenőrzés), `asset_catalog/` (asset-katalógus generátor) |
| `docs/` | játéktervezés, német szabályok, döntések, ötletek, feature specek (lásd lent) |
| `.claude/commands/` | slash commandok: `/allapot`, `/uj-otlet`, `/uj-feature`, `/uj-kerdesek`, `/uj-dungeon` |

## Aranyszabályok

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
- **Állapot csak a `Game.state` metódusain át** változik (`addGold`, `addItem`, `equip`, `completeDungeon`, `setFlag`…);
  a `Game.state.data`-t közvetlenül ne írd. A felület a `state:*` eseményekre iratkozzon fel.
- **Egy fájl egy felelősség;** új rendszer (harc, shop, loot…) a `src/systems/<név>/` alá kerül, egy rövid
  `README.md`-vel (mit csinál, publikus metódusok, események).
- **Tiled térképnél:** ortogonális, 16×16, CSV réteg-formátum, beágyazott tileset relatív képútvonallal,
  a rétegnevek maradjanak (lásd `data/README.md`).
- **Új feature csak a `docs/features/README.md` folyamatán át** készülhet, akkor is, ha nem a `/uj-feature`
  paranccsal kérik. Spec és jóváhagyás nélkül nincs kód. Kis munkához (hibajavítás, szöveg, új kérdés a meglévő
  formátumban) nem kell spec.

## Munkamódszer

- A feladat elején olvasd el a README „Állapot” részét (ez az ütemterv), a végén frissítsd.
- Kis, önállóan működő lépésekben haladj; minden lépés után teszt, commit, push.
- Csak ahhoz nyúlj, amit kértek. Ha közben hibát vagy furcsaságot látsz, írd bele az összefoglalóba, ne javítsd kérés nélkül.
- Mielőtt új kódot írsz, próbáld a meglévő rendszerekkel megoldani (adat, `Game.state`, később a kérdés-motor).
- Ne olvasd végig a kódbázist: a rendszerek `README.md`-je és a lenti táblázat mutatja, mit kell elolvasni.
- Ha egy megoldás furcsának tűnik, előbb nézd meg a `docs/DECISIONS.md`-t, mielőtt megváltoztatnád.

## Mit mikor olvass

| Ha ezen dolgozol | Előbb olvasd el |
| --- | --- |
| bármilyen feladat eleje | README „Állapot” |
| új feature | `docs/features/README.md` (a folyamat) + `docs/features/_TEMPLATE.md` |
| félbehagyott feature folytatása | a spec: `docs/features/<id>.md` |
| német szöveg, kérdések, válasz-ellenőrzés | `docs/GERMAN.md` |
| loot, rarity, HP, kihívások, pet | `docs/GAME_DESIGN.md` |
| adatfájl, új dungeon, Tiled pálya | `data/README.md` + README „Új dungeon hozzáadása” |
| mentés, állapot | `src/systems/save/SaveSchema.js` + `tests/save.migration.test.js`, README „Mentés” |
| asset, grafika | `assets/ASSETS.md` + `assets/previews/` |
| egy rendszer belseje | a rendszer mappájának `README.md`-je |
| „miért van ez így?” | `docs/DECISIONS.md` |
| új ötlet, mi legyen a következő | `docs/IDEAS.md` (csak ilyenkor) |

## Német tartalom

- Csak olyan német mondatot írj, amiben biztos vagy; a bizonytalan szöveg `review` jelölést kap.
- Szintek (B1–C1), feladattípusok (Duolingo-szerű), válasz-ellenőrzés (gépelésben elnéző, de csak helyes
  választ fogad el): `docs/GERMAN.md`.
- A felület német, a magyar a segítség a „?” buborékban.

## Mobil

- Minden funkció működjön **iPhone 11 és iPhone 13** Safarin, érintéssel; a mentés is (export/import kód).
- A Safari 7 nap után törölheti a mentést; a Főképernyőről indított játéknak saját tárhelye van (`docs/DECISIONS.md` D8).
- Gombok legalább kb. 44×44 px, ne legyen hover-függő funkció, figyelj a safe area-ra és a kis képernyőre.
  A hang iOS-en csak érintés után indulhat.
- Itt csak Chromium van: telefonméretet és érintést tudsz emulálni (Playwright `devices['iPhone 13']`),
  valódi Safarit nem. A végső próba a felhasználóé, ezért az összefoglalóban mindig írd le, mit nézzen meg.

## Assetek

Ha assetet keresel, először mindig az `assets/ASSETS.md` katalógusban és az `assets/previews` képeken keress. Csak akkor nyisd meg a nyers fájlokat, ha a katalógus alapján már tudod, melyik kell. Ha új assetet töltök fel, frissítsd a katalógust és az előnézeteket.

- A katalógust és az előnézeteket a `python3 tools/asset_catalog/build.py` generálja; az `ASSETS.md`-t ne szerkeszd kézzel.
- Új asset után: csomagold ki külön almappába az `assets/` alatt (a ZIP-et utána töröld), add hozzá a csomagot és a
  kategóriáit a `tools/asset_catalog/rules.py`-hoz, futtasd a buildet, nézd meg az új előnézeteket, és írd be a
  leírásokat a `tools/asset_catalog/notes.py`-ba, amíg a build nem jelez „leírás nélkül” tételt. Az új csomag
  creditjét vedd fel a `src/config/config.js` → `credits` alá is.
- A játékban használt kivágások nevei és koordinátái a `src/config/assets.js`-ben vannak.

## Feladat végén

1. Adatmódosítás után `node tools/build-data.js`; mindig `npm test` (új logikához új teszt).
2. Felületi változásnál kipróbálás a böngészőben, telefonméretben is.
3. README „Állapot” frissítése (pipák, „Most folyamatban”); ha kell, `docs/GAME_DESIGN.md`, `docs/DECISIONS.md`.
4. Commit és push a munkabranchre.
5. Összefoglaló a felhasználónak (lásd Kommunikáció).

## Buktatók

Ha új csapdába futsz, ami egy későbbi munkamenetet is megfoghat, írd be ide egy sorban.

- Új `.js` fájlt be kell kötni az `index.html`-be, a függőségi sorrendnek megfelelő helyre (core → config →
  bundle → systems → world/ui → scenes → `main.js`).
- A `data/bundle.js` generált: adat- vagy pályamódosítás után újra kell generálni, különben a teszt elbukik
  és `file://`-ról a régi tartalom fut.
- A Tiled rétegneveket és objektumtípusokat a kód név szerint olvassa: ne nevezd át őket.
- A Phaser és az EasyStar CDN-ről jön: verziót csak tudatosan, teszteléssel válts.
- A felhős munkamenetben a CDN (jsdelivr) tiltva lehet, az npm viszont nem: a teljes játék kipróbálásához
  `npm pack phaser@3.90.0 easystarjs@0.4.4` a scratchpadba (nem a repóba!), és Playwrightban
  `context.route(/cdn\.jsdelivr\.net\/npm\/phaser@/, …)` → a helyi fájl; az `index.html` `file://`-ról fut.
- Ha a `ContentValidator`-ba szúrsz be sort, vigyázz az `if … else if` párokra (a dungeon-résznél kétszer is szétszakadt).
