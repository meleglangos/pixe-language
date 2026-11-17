---
description: Új német kérdések írása egy kérdés-poolba
argument-hint: <téma> <szint B1|B2|C1> [darabszám]
---
Írj új német kérdéseket: $ARGUMENTS (alapértelmezett darabszám: 10).

1. Ellenőrizd, hogy a kérdés-rendszer elkészült-e (README „Állapot”, `data/questions/`). Ha még nincs kész,
   állj meg, és mondd meg, hogy előbb az kell (`/uj-feature`). Ne találj ki saját formátumot.
2. Olvasd el a `docs/GERMAN.md`-t, és a kérdés-formátumot a `data/README.md`-ből (vagy a kérdés-rendszer
   README-jéből). Nézd meg a pool meglévő kérdéseit, hogy ne legyen ismétlés.
3. A kérdések:
   - feleljenek meg a szintnek (`docs/GERMAN.md` 4. rész), és legyen köztük könnyebb és nehezebb is,
   - legyenek vegyes típusúak (Duolingo-szerűek, telefonon kényelmesek),
   - soroljanak fel minden helyes megoldást; csak nyelvtanilag helyes változat kerülhet a listára,
   - kapjanak magyar magyarázatot a „?” buborékhoz,
   - ahol nem vagy 100%-ig biztos, kapjanak `review` jelölést; ha kifejezetten kételkedsz, írj másikat.
4. Szöveg csak a fordítási fájlon át, `de` + `hu`. Új ID-k a konvenció szerint.
5. `node tools/build-data.js`, `npm test`, commit és push.
6. Összefoglaló: hány kérdés, milyen típusok, és a `review` jelölésű kérdések listája.
