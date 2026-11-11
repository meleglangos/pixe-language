# Das Deutsch-Abenteuer

Böngészős pixel-art RPG német nyelvtanuláshoz. Nincs build lépés: az `index.html` megnyitásával fut
(a Phaser 3 és az EasyStar.js CDN-ről töltődik, ehhez internet kell). Webszerverről (pl. GitHub Pages) ajánlott futtatni.

## Állapot
- [x] 1. szakasz: térkép, kattintásos + billentyűs mozgás, kutya, mentés + export/import
- [ ] 2. szakasz: egy dungeon, feladatrendszer, loot szabályok, HP, debug mód
  - [x] 2/1: „Die versunkene Gruft” dungeon jelenet, szörnyek (harc nélkül), láda
- [ ] 3. szakasz: inventory, gear a karakteren, shop, gold, HP-ital
- [ ] 4. szakasz: többi dungeon, boss, meglepetés-lootok, feladatkészlet

## Felépítés
| Hol | Mi |
| --- | --- |
| `src/data/strings.js` | minden német szöveg + magyar fordítás (`de` / `hu`) |
| `src/data/map.js` | a térkép ASCII rácsként + a helyszínek |
| `src/data/tiles.js` | mezőtípusok, tereptárgyak, helyszíntípusok |
| `src/data/assets.js` | grafikai manifest: képfájlok, kivágások, animációk |
| `src/data/dungeons.js` | dungeonök felépítése, szörnytípusok, berendezés |
| `assets/` | grafikai csomagok (Pixel Crawler – Anokolisa; Weapon Icons – Shade; Items16 – Glionox) |
| `src/data/config.js` | sebesség, HP, rarity létra |
| `src/gfx/placeholders.js` | a kódból rajzolt ideiglenes grafika |
| `src/core/save.js` | mentés (localStorage) + export/import kód |
| `src/world/` | rács + útkeresés, karakter, kutya |
| `src/scenes/` | Phaser scene-ek: közös mozgás-alap (`ExploreScene`), világtérkép, dungeon |
| `src/ui/` | DOM felület: HUD, menü, ablakok, „?” buborékok |

A helyszínekre belépést a `Game.poi.handlers[típus]` kezeli (`WorldScene.js`); amíg nincs kezelő,
a „még zárva” üzenet jelenik meg.

`index.html?debug=1`: kirajzolja a járható (zöld) és blokkolt (piros) mezőket.
