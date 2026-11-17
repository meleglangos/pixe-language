# Döntések

Miért döntöttünk úgy, ahogy. Ha egy megoldás furcsának tűnik, előbb itt nézd meg, és ne „javítsd ki” egy itt
szereplő döntést a felhasználó jóváhagyása nélkül.

- Új döntés akkor kerül ide, ha később valaki (vagy egy új munkamenet) másképp csinálná: mi a döntés, miért,
  mikor. Döntésenként 2–3 sor, a legújabb alul.
- Ha egy döntés megváltozik, ne töröld: írd mellé, hogy mi váltotta fel (`→ felváltotta: D12`).

## D1. Nincs build lépés, sima `<script>` tagek (2026)
A játék az `index.html` megnyitásával fut, a Phaser 3 és az EasyStar.js CDN-ről jön. Így bármikor
szerkeszthető és GitHub Pages-en közvetlenül fut. Ezért nincs npm függőség és nincs bundler; a `package.json`
csak a tesztekhez és az eszközökhöz kell.

## D2. A `main` az élő oldal, a fejlesztés munkabranchen folyik (2026)
A GitHub Pages közvetlenül a `main` branchből megy, így ami oda kerül, az azonnal élesben van.
A `main`-re csak a felhasználó jóváhagyása után kerül bármi (PR + merge).

## D3. Minden tartalom adatfájlban, a pályák Tiledben (2026)
Dungeon, szörny, tárgy, loot, feladat, shop: `data/*.json`; pálya: `data/maps/` (Tiled). Így a tartalom kód
nélkül bővíthető, és a validátor ellenőrizni tudja. A `data/bundle.js` csak a `file://` alóli futáshoz kell.

## D4. A mentés csak ID-kat tárol (2026)
A mentésben nincs tartalom, csak ID (tárgy, dungeon), a tartalom a `data/`-ból jön. Ezért a tartalom
javítása azonnal látszik a régi mentésekben is, viszont kiadott ID-t nem szabad átnevezni vagy törölni
(ha mégis muszáj: migráció).

## D5. Német felület, magyar segítség (2026)
A játékos B1–C1 szinten van, ezért a felület is német, a „?” buborék adja a magyar változatot.
A felület szövege egyszerűbb (B1), mint a feladatoké.

## D6. Válasz-ellenőrzés: gépelésben elnéző, de csak helyes választ fogad el (2026)
A kis- és nagybetű, az umlaut-átírás (`ae`, `ss`) és a szóköz nem számít hibának, mert telefonon nehéz
gépelni. Elírás, rossz végződés vagy rossz névelő viszont hiba, mert a játékos tanul belőle. Alternatív
választ csak akkor fogad el, ha a kérdésnél fel van sorolva (részletek: `docs/GERMAN.md`).

## D7. Minden német feladat egy közös kérdés-motoron fut (2026)
Dungeon, napi kihívás, pet, boss, vizsga: mind „kérdések egy poolból + feltétel + jutalom”. Egy közös motorral
az új ötletek nagy része csak adat (új pool, új kihívás), nem új kód, és a válasz-ellenőrzés mindenhol egyforma.

## D8. iPhone: Főképernyőhöz adás és export kód a mentéshez (2026)
A Safari 7 nap használat nélkül törölheti a weboldalak tárhelyét, vele a mentést. A Főképernyőről indított
játékra ez nem vonatkozik, de annak saját tárhelye van, ezért a mentést export kóddal kell átvinni.
Az export kód ezért fontos funkció, legyen könnyen elérhető.

## D9. Az ütemterv a README „Állapot” részében van (2026)
Nincs külön roadmap fájl. Claude a feladat elején elolvassa, a végén frissíti; a felhasználónak nem kell
kézzel írnia. Az ötletek a `docs/IDEAS.md`-ben várnak, amíg el nem dől, hogy megcsináljuk őket.

## D10. A mappatérkép csak a `CLAUDE.md`-ben van (2026)
A `CLAUDE.md` minden munkamenetben betöltődik, a README-t pedig a feladatok elején olvassa Claude, ezért ha
a térkép mindkettőben szerepelne, kétszer kerülne a kontextusba, és a két példány elcsúszna egymástól.

## D11. Nincs `CHANGELOG.md` (2026)
Egy fájl, amit minden feladat végén frissíteni kell, de senki nem olvas, csak költség. A haladás a README
„Állapot” részében, a részletek a git logban vannak. Ha a játékosnak kell újdonságlista, az a játékban
legyen („Neuigkeiten” ablak, `docs/IDEAS.md`), a fordítási fájlon át.
