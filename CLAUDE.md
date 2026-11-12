# Das Deutsch-Abenteuer – munkaszabályok

## Assetek

Ha assetet keresel, először mindig az `assets/ASSETS.md` katalógusban és az `assets/previews` képeken keress. Csak akkor nyisd meg a nyers fájlokat, ha a katalógus alapján már tudod, melyik kell. Ha új assetet töltök fel, frissítsd a katalógust és az előnézeteket.

- A katalógust és az előnézeteket a `python3 tools/asset_catalog/build.py` generálja; az `ASSETS.md`-t ne szerkeszd kézzel.
- Új asset után: csomagold ki külön almappába az `assets/` alatt (a ZIP-et utána töröld), add hozzá a csomagot és a
  kategóriáit a `tools/asset_catalog/rules.py`-hoz, futtasd a buildet, nézd meg az új előnézeteket, és írd be a
  leírásokat a `tools/asset_catalog/notes.py`-ba, amíg a build nem jelez „leírás nélkül” tételt. Az új csomag
  creditjét vedd fel a `src/config/config.js` → `credits` alá is.
- A játékban használt kivágások nevei és koordinátái a `src/config/assets.js`-ben vannak.

## Tartalom és kód

- Minden tartalom a `data/*.json`-ban van (formátumok: `data/README.md`), nem a kódban. JSON módosítás után:
  `node tools/build-data.js`, majd `npm test`.
- Az ID-k (pl. `dungeon_crypt`) állandók: a mentés csak ID-kat tárol. Kiadott ID-t ne nevezz át; ha muszáj,
  új mentés-verzió + migráció a `src/systems/save/SaveSchema.js`-ben, teszttel.
- A játékállapotot csak a `Game.state` metódusain át módosítsd (`src/state/GameState.js`), közvetlenül a
  `Game.state.data`-t ne írd. A felület az állapot eseményeire (`state:*`) iratkozzon fel.
- Mentést csak a `Game.saveManager` ír/olvas. Ha a mentés szerkezete változik: `VERSION` + migráció + teszt.
- Egy fájl egy felelősség; új rendszer a `src/systems/<név>/` alá kerül.
