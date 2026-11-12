# Das Deutsch-Abenteuer – munkaszabályok

## Assetek

Ha assetet keresel, először mindig az `assets/ASSETS.md` katalógusban és az `assets/previews` képeken keress. Csak akkor nyisd meg a nyers fájlokat, ha a katalógus alapján már tudod, melyik kell. Ha új assetet töltök fel, frissítsd a katalógust és az előnézeteket.

- A katalógust és az előnézeteket a `python3 tools/asset_catalog/build.py` generálja; az `ASSETS.md`-t ne szerkeszd kézzel.
- Új asset után: csomagold ki külön almappába az `assets/` alatt (a ZIP-et utána töröld), add hozzá a csomagot és a
  kategóriáit a `tools/asset_catalog/rules.py`-hoz, futtasd a buildet, nézd meg az új előnézeteket, és írd be a
  leírásokat a `tools/asset_catalog/notes.py`-ba, amíg a build nem jelez „leírás nélkül” tételt. Az új csomag
  creditjét vedd fel a `src/data/config.js` → `credits` alá is.
- A játékban használt kivágások nevei és koordinátái a `src/data/assets.js`-ben vannak.
