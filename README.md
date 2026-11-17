# Das Deutsch-Abenteuer

Böngészős pixel-art RPG német nyelvtanuláshoz. Nincs build lépés: az `index.html` megnyitásával fut
(a Phaser 3 és az EasyStar.js CDN-ről töltődik, ehhez internet kell). Webszerverről (pl. GitHub Pages) ajánlott futtatni.

**Online:** https://meleglangos.github.io/pixe-language/ (lásd lent: [Online elérhetőség](#online-elérhetőség-github-pages))

## Állapot
Ez a projekt ütemterve. Claude minden feladat elején elolvassa, a végén frissíti (pipák + „Most folyamatban”).
Új szakaszt vagy tételt csak a felhasználó kérésére vesz fel; az ötletek a `docs/IDEAS.md`-be kerülnek.

**Most folyamatban:** semmi. Következő javasolt lépés: inventory (a loot tárolása + „Tasche” ablak).

- [x] 1. szakasz: térkép, kattintásos + billentyűs mozgás, kutya, mentés + export/import
- [ ] 2. szakasz: egy dungeon, feladatrendszer, loot szabályok, HP, debug mód
  - [x] alapok: mappaszerkezet, JSON tartalom állandó ID-kkal, SaveManager (verzió, migráció, tartalék), központi állapot + események, tesztek
  - [x] alapok 2: fordítási fájl, Tiled térképek, GitHub Pages automatikus közzététel
  - [x] 2/1: „Die versunkene Gruft” dungeon jelenet, szörnyek (harc nélkül), láda
  - [x] 2/2: „Die Kristallmine” dungeon (pálya és látvány), közös dungeon-rendszer, Credits képernyő
  - [x] dokumentáció: `CLAUDE.md`, `docs/`, slash commandok
  - [x] feladatrendszer (kérdés-rendszer): a dungeonök, napi kihívások, petek, bossok közös kérdés-motorja
    - [x] 1. kérdés-motor és poolok (`data/questions/`), címkék: szint (B1–C1), téma, típus; „ellenőrizendő” (`review`) jelölés, validátorral
    - [x] 2. mentés v4: kérdés-haladás, általános `unlocks` / `daily` állapot, migrációval
    - [x] 3. kihívások (`data/challenges.json`), elnéző válasz-ellenőrzés (kis/nagybetű, `ae`↔`ä`, `ss`↔`ß`, szóközök, több helyes megoldás), HP-vesztés
    - [x] 4. kérdés-ablak: választós, beírós, szókártyás
    - [x] 5. dungeon: a szörnyek kérdeznek, legyőzés, 0 HP
    - [x] 6. első poolok: kripta (B1), bánya (B1–B2)
    - [x] 7. dokumentáció
    - [x] 2. kiegészítés: közös kérdéskészlet címkelistával (helyzet-téma + nyelvtan), szint dungeononként, nincs ismétlés egy látogatáson belül, szörnyenként 2 jó válasz, sebzés rétegesen állítható
  - [ ] loot szabályok
    - [x] ládanyitás: tárgyak, loot táblák, sorsolás, animáció, kirepülő loot, „Beute” ablak (a loot még nem tárolódik; a láda bármikor nyitható)
  - [ ] HP
  - [ ] debug mód
- [ ] 3. szakasz: inventory, gear a karakteren, shop, gold, HP-ital
- [ ] 4. szakasz: többi dungeon, boss, meglepetés-lootok, feladatkészlet

## Felépítés
A mappák és fájlok térképe, valamint a munkaszabályok: [`CLAUDE.md`](CLAUDE.md).
Az adatfájlok formátuma: [`data/README.md`](data/README.md).

A helyszínekre belépést a `Game.poi.handlers[típus]` kezeli (`WorldScene.js`); amíg nincs kezelő,
a „még zárva” üzenet jelenik meg.

`index.html?grid=1`: kirajzolja a járható (zöld) és blokkolt (piros) mezőket.
`index.html?debug=1`: a kérdés-ablakban megjelenik a „Lösung zeigen” gomb: minden elfogadott megoldás németül és magyarul, a magyarázat és a kérdés ID-ja
(a fejlesztőnek, a kérdések ellenőrzéséhez; nem számít válasznak, és normál címmel nem látszik).

## Játékállapot és események
A játékállapot a `Game.state` (`src/state/GameState.js`). Közvetlenül nem szabad átírni, csak a metódusain át:
`setHp / damage / heal`, `addGold / spendGold`, `addItem / removeItem`, `equip / unequip`,
`recordDungeonVisit / completeDungeon`, `recordAnswer`, `unlock`, `markDaily`, `addSurprise`, `setFlag`, `setPosition`.
Minden változás eseményt küld (`Game.events.on('state:gold', fn)` stb., a lista a fájl elején);
a HUD ezekre frissül magától, a SaveManager pedig ezekre ment.

## Mentés
- Egyetlen modul ír és olvas: `Game.saveManager` (`src/systems/save/SaveManager.js`).
- localStorage-kulcsok: `deutsch-abenteuer.save` (fő), `….backup` (az előző sikeres mentés),
  `….broken` (egy betölthetetlen mentés félretett másolata). Sérült fő mentésnél a tartalékból tölt be.
- Automatikus mentés: loot, arany, felszerelés, dungeon, megválaszolt kérdés, feloldás, napi kihívás, HP és jelzők változásakor (egy lépésen belül
  egyetlen írás); a pozíció megálláskor és séta közben 4 másodpercenként; a lap bezárásakor.
- Betöltéskor minden mezőt ellenőriz; az ismeretlen ID-kat eldobja (a konzolra kiírja), nem fagy le.
- A mentésben verziószám van (`v`). **Ha a szerkezet változik:** növeld a `VERSION`-t a
  `SaveSchema.js`-ben, írj egy `migrations[régi verzió]` lépést, és tesztet a `tests/save.migration.test.js`-be.
- **iPhone / Safari:** a Safari 7 nap használat nélkül törölheti a weboldalak adatait, így a mentést is.
  Ellenszer: Safari → Megosztás → **Főképernyőhöz adás**, és onnan indítani a játékot (arra nem vonatkozik a törlés).
  A Főképernyőről indított játéknak saját tárhelye van, a Safariban lévő mentést export kóddal kell átvinni.
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

## Online elérhetőség (GitHub Pages) és munkamenet
- **`main` = az élő oldal.** A Pages közvetlenül a `main` branchből megy:
  Settings → Pages → Build and deployment → Source: **Deploy from a branch**, Branch: **main**, mappa: **/ (root)**.
  Cím: https://meleglangos.github.io/pixe-language/
- **Munkabranch** (pl. `refactor/foundations`): ide kerülnek az újítások. Minden push után lefutnak a tesztek
  (`.github/workflows/tests.yml`, eredmény az **Actions** fülön), az élő oldal nem változik.
- Kipróbálás merge előtt: a branch letöltése (Code → Download ZIP), majd az `index.html` megnyitása.
- Ha a tesztek zöldek és te is jóváhagytad: pull request a `main`-be → merge → pár perc múlva élesben.
  Pár nagyobb update után új munkabranch indul a `main`-ről.

## Új dungeon hozzáadása
1. Tiledben: másold le pl. a `data/maps/dungeon_crypt.json`-t új néven (`dungeon_<név>.json`), és rajzold meg
   a pályát (terep, ajtók, szörnyek, láda, berendezés).
2. A világtérképen (`data/maps/overworld.json`, `pois` réteg) legyen egy helyszín ugyanezzel az ID-val.
3. `data/dungeons.json`: új bejegyzés (`id`, `name`, `theme: "crypt" | "mine"`, `map`).
4. `data/translations.json`: a nevek német–magyar szövege (`poi.<id>.name`, `poi.<id>.desc`).
5. `node tools/build-data.js`, majd `npm test`.
6. Új kinézethez új téma a `src/world/dungeonThemes.js`-ben. A `DungeonScene` kódjához nem kell nyúlni.
