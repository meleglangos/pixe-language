# Új feature: a folyamat

Minden új feature ezen a folyamaton megy át, akkor is, ha a felhasználó nem a `/uj-feature` paranccsal kéri.
A lépések sorrendje kötelező: **spec és jóváhagyás nélkül nincs kód.**

**Mi számít feature-nek:** új rendszer, új játékmenet-elem, új ablak vagy képernyő, a mentés szerkezetének
változása, vagy bármi, ami több rendszert érint.
**Nem kell spec** kis munkához: hibajavítás, szöveg javítása, új kérdések egy meglévő poolba, új tárgy vagy
szörny a meglévő formátumban, egy meglévő dungeon finomítása. Ha bizonytalan vagy, kérdezd meg.

## A lépések

### 1. Ötlet kiválasztása
Az ötlet a `docs/IDEAS.md`-ből jön, vagy a felhasználó most mondja. Ha új, előbb írd be az `IDEAS.md`-be.
Adj neki ID-t (kisbetű, szám, `_`, pl. `fast_travel`).

### 2. Felderítés
Olvasd el:
- a README „Állapot” részét (hol tartunk, mi kell hozzá előbb),
- a `docs/GAME_DESIGN.md` érintett részét, német tartalomnál a `docs/GERMAN.md`-t,
- a `docs/DECISIONS.md`-t, hogy a feature ne ütközzön egy korábbi döntéssel,
- az érintett rendszerek `README.md`-jét (`src/systems/<név>/`), és csak ha kell, a kódjukat,
- assetnél az `assets/ASSETS.md`-t.

Ne olvasd végig a teljes kódbázist. Ha a feature egy még el nem készült rendszerre épülne, szólj:
lehet, hogy előbb azt kell megcsinálni.

### 3. Spec írása
Másold le a `docs/features/_TEMPLATE.md`-t `docs/features/<id>.md` néven, és töltsd ki (állapot: tervezet).
- Először a meglévő rendszerekkel próbáld kifejezni (adat, `unlocks`, `daily`, kérdés-motor); új kód és
  új rendszer csak akkor, ha ezek nem elegendők, és írd le, miért nem.
- Minden, amit a felhasználónak kell eldöntenie, a „9. Eldöntendő kérdések” alá kerül.
- Kreatív részeket (sztori, nevek, dungeon terve, hangulat) önállóan kitalálhatsz, de a specben legyenek leírva.

### 4. Jóváhagyás
Mutasd meg a specet röviden (cél, játék közben, eldöntendő kérdések), és várj a felhasználóra.
Írd be a döntéseit a specbe, állapot: jóváhagyva. **Itt állj meg, amíg nincs jóváhagyás.**

### 5. Előkészítés
- Vedd fel a tételt a README „Állapot” részébe (alpontokkal a spec lépései szerint), és írd be a
  „Most folyamatban” sorba.
- A spec állapota: folyamatban.

### 6. Megvalósítás lépésenként
A spec „11. Lépések” sorrendjében. Minden lépés után:
- adatmódosítás után `node tools/build-data.js`,
- `npm test` (új logikához új teszt is),
- commit és push a munkabranchre.

Közben a `CLAUDE.md` szabályai érvényesek (adat, ID-k, fordítás, mentés, állapot). Ha kiderül, hogy a spec
így nem működik, vagy egy szabályt sértene: **állj meg és szólj**, ne térj el csendben a spectől.
Ha a felhasználó jóváhagyja a változást, írd be a specbe.

### 7. Ellenőrzés
- Menj végig a spec „10. Kész, ha” listáján; mindegyik pont legyen kipipálva.
- Próbáld ki a böngészőben telefonméretben is (iPhone 11 / 13 nézet, érintéssel).
- Tölts be egy régi mentést (`tests/fixtures/`), és nézd meg, hogy minden működik.

### 8. Lezárás
- README „Állapot”: pipák, „Most folyamatban” frissítése.
- `docs/GAME_DESIGN.md`: ha új szabály született; `docs/DECISIONS.md`: ha fontos döntés született.
- Új rendszernél: rövid `README.md` a rendszer mappájába (mit csinál, publikus metódusok, események).
- `docs/IDEAS.md`: az ötlet áthúzva, hivatkozással a specre. A spec állapota: kész.

### 9. Összefoglaló a felhasználónak
Röviden, magyarul:
- mi készült el, és mi maradt ki (ha valami),
- **mit próbáljon ki a telefonon**, lépésről lépésre,
- milyen német szövegek kaptak „ellenőrizendő” jelölést,
- hol tart a munka, és mi a következő javasolt lépés.
