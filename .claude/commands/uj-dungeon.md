---
description: Új dungeon tervezése és megépítése
argument-hint: <ötlet, hangulat vagy téma>
---
Új dungeont építünk: $ARGUMENTS

1. Olvasd el: README „Állapot” és „Új dungeon hozzáadása”, `data/README.md` (dungeonök, szörnyek, Tiled),
   `docs/GAME_DESIGN.md` 1–3. rész, `docs/GERMAN.md` (szintek), és assethez az `assets/ASSETS.md`-t.
2. Ha a dungeonhöz új rendszer vagy új mechanika kell (új téma a `dungeonThemes.js`-ben, új berendezés-viselkedés,
   új állapot a mentésben), az feature: válts a `docs/features/README.md` folyamatára, és ott kérj jóváhagyást.
3. Kreatívan önálló vagy: név (németül), hangulat, sztori, pályaterv, szörnyek, láda, nyelvi téma és szint
   (a meglévő dungeonök után következő nehézség). Mielőtt építesz, mutass egy rövid tervet (5–10 sor), és
   kérdezd meg, mehet-e.
4. Építés a recept szerint (README „Új dungeon hozzáadása”): Tiled pálya a meglévő formátumban és rétegnevekkel,
   helyszín a világtérképen, `data/dungeons.json`, fordítási kulcsok `de` + `hu`, szükség esetén új szörny
   a `data/monsters.json`-ba. Tartalom csak adatfájlba, kódhoz nem nyúlsz.
5. `node tools/build-data.js`, `npm test`, kipróbálás a böngészőben telefonméretben is, commit és push.
6. Frissítsd a README „Állapot” részét. Összefoglaló: mi készült, mit próbáljon ki a felhasználó a telefonon,
   és a `review` jelölésű német szövegek.
