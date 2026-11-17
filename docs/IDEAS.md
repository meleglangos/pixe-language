# Ötletláda

Ötletek, amikről még nem dőlt el, hogy megcsináljuk-e. Ezt a fájlt csak akkor olvasd el, ha a felhasználó
kéri, vagy ha új feature-t kell választani.

- Ötletenként egy sor: mi az, és mire épülne (`— rendszer + rendszer`). Új ötlet: `/uj-otlet`.
- Ha egy ötletből feature lesz: spec a `docs/features/<név>.md`-be, tétel a README „Állapot” részébe,
  itt pedig áthúzva, hivatkozással: `- [x] ~~Fast travel~~ → docs/features/fast_travel.md`.
- A „kérdés-motor” a közös kérdés-rendszer (`docs/GAME_DESIGN.md` 5. rész): ami arra épül, az nagyrészt adat.

> **Figyelem, nyilvános:** a játék GitHub Pages-en fut, a repó és az oldal bárki számára látható. Személyes
> tartalom (nevek, közös emlékek, dátumok, üzenetek) csak a felhasználó kifejezett jóváhagyásával kerülhet
> bele, és akkor is csak olyan formában, amit ő rendben talál.

## Kérdések és tanulás
- [ ] Új kérdés pool — csak adat
- [ ] Ismétlés a rontott kérdésekből (később újra előjönnek) — kérdés-motor + mentés
- [ ] Szótár (Wörterbuch) a játékban: a megtanult szavak kereshető listája — kérdés-motor + UI
- [ ] Időre menő szótár-challenge: 60 mp alatt minél több szó fordítása — kérdés-motor (időlimit)
- [ ] Német vizsga komoly lootért — kérdés-motor (vizsga kihívás) + loot
- [ ] Napi sorozat (streak): napi jutalom, 7 nap után nagyobb — kérdés-motor (napi) + mentés

## NPC-k és történet
- [ ] NPC beszélgetések választható válaszokkal, hanggal vagy anélkül (később dől el); jó válaszért
      jutalom: tárgy, szerencsésebb láda, ideiglenes effekt — kérdés-motor + NPC rendszer + effektek
- [ ] Reagáló NPC-k a világtérképen — NPC rendszer
- [ ] Feloldható questek — quest rendszer + feloldás
- [ ] Levelek, plakátok, naplók a dungeonökben (olvasmány + szövegértési kérdés) — kérdés-motor + adat
- [ ] Szabadulószoba / puzzle dungeon a talált levelekre építve — kérdés-motor + dungeon

## Pet
- [ ] Saját petek, kérdések nekik — pet rendszer + kérdés-motor
- [ ] Pet reakciók és animációk kattintásra, pet kérdések — pet rendszer

## Harc és kihívás
- [ ] Bossok, legyőzésük után új tartalom — boss rendszer + feloldás
- [ ] Nyelvtani témához kötött boss (pl. Passiv-Golem) — boss rendszer + kérdés-motor

## Haladás és motiváció
- [ ] Achievementek és címek, hozzá rangrendszer — achievement rendszer + mentés
- [ ] Saját szoba / ház, berendezhető a megszerzett bútorokkal — ház rendszer + Modern Interiors assetek
- [ ] Kozmetikai tárgyak a karakterre / petre — kérdéses: assettől függ (`assets/ASSETS.md`)
- [ ] Fast travel / teleport napi kérdésért cserébe — kérdés-motor (napi kihívás) + feloldás

## Easter eggek és események
- [ ] Személyes easter eggek (közös emlékek, rejtett üzenetek) — adat + kis kód (lásd a fenti figyelmeztetést)
- [ ] Térképdarabokból összeálló titkos dungeon — easter egg + feloldás
- [ ] Ünnepi események (születésnap, Weihnachtsmarkt, Oktoberfest) — kérdés-motor + dátum (talán)
