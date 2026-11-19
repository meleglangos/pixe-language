# Tárgyrendszer: kategóriák, ritkaság, érték

**Állapot:** kész (jóváhagyva 2026-11-19)
**Ötlet:** `docs/IDEAS.md` → „Tárgyrendszer: tárgycsoportok, ritkaság csoportonként, érték / erő; a loot táblák ehhez igazodnak”

## 1. Cél
A tárgyak ne ömlesztve legyenek: mindegyiknek legyen kategóriája (mi ez), típusa (milyen fajta), ritkasága (mennyire
értékes) és ára. Erre épül később az inventory („Tasche”), a felszerelés, a bolt és a HP-ital. A játékos közben
tanulja a tárgyak német nevét névelővel (das Schwert, der Ring, die Krone).

## 2. Játék közben
- A ládából ugyanúgy jönnek a tárgyak, de átgondolt választékból: a korai dungeonökben főleg közönséges és ritka
  tárgy, később jobbak. A kiemelésnél a név és a ritkaság mellett a kategória is látszik (pl. „Waffe · Selten I”).
- A „Beute” listán a tárgyak ritkaság szerint sorban (a legjobb felül).
- A fejlesztőnek: a láda-laborban egy **tárgy-katalógus** (magyarul): minden tárgy kategória és ritkaság szerint
  csoportosítva, ikonnal, árral, és hogy melyik loot táblában szerepel. Így látszik, mi hiányzik, mi van túl sok.

## 3. Mire épül
- Meglévő: `data/items.json`, `data/loot_tables.json`, `Game.loot` (`src/systems/loot/`), a rarity létra
  (`config.js` → `rarities`), a láda-ablak és a „Beute” lista, a láda-labor, a `ContentValidator`.
- Új rendszer nem kell: a tárgyak adatok maradnak; a `Game.loot` kap egy kis kiegészítést (lásd 4.), és egy
  `Game.items` segédet (kategória, rendezés, keresés) a `src/systems/loot/` mellé vagy alá.

## 4. Adat
**Kategóriák** (`kind`, rögzített lista, mindegyiknek német + magyar neve a fordítási fájlban):

| `kind` | Német | Mire való (később) | Típusok (`type`), példák |
| --- | --- | --- | --- |
| `weapon` | Waffe | felszerelés: fegyver-hely | `sword`, `dagger`, `axe`, `mace`, `spear`, `bow`, `staff` |
| `armor` | Rüstung | felszerelés: páncél-hely | `helmet`, `chest`, `shield`, `boots`, `gloves` |
| `jewelry` | Schmuck | felszerelés: ékszer-hely | `ring`, `amulet` |
| `potion` | Trank | elhasználható (HP) | `heal` |
| `gem` | Edelstein | eladható, később kovácsoláshoz | `gem` |
| `material` | Material | eladható, később kovácsoláshoz | `bone`, `ore`, `herb`, `monster` |
| `key` | Schlüssel | ajtót / ládát nyit (később) | `key` |
| `treasure` | Schatz | eladható, gyűjthető | `treasure` |

**Tárgy** (`data/items.json`):
```json
{"id": "sword_iron_01", "kind": "weapon", "type": "sword", "rarity": "rare", "value": 60,
 "icon": "wp:iron c3 r0", "name": "item.sword_iron_01.name", "desc": "item.sword_iron_01.desc"}
```
- `value`: ár aranyban (a boltnak, eladásnak); alapértéke ritkaságonként a `config.js`-ben, tárgyanként felülírható.
- `stack`: összeadódik-e a mennyiség (alapból: ital, drágakő, anyag, kulcs igen; fegyver, páncél, ékszer nem).
- Nincs külön szint: **a ritkaság határozza meg az erőt** (a passzívok nagysága ritkaságonként nő).
- `exclusive`: true = csak az a loot tábla adja, amelyik név szerint felsorolja (boss, egy adott hely).
- `stats`: passzívok rögzített listából, pl. `{"maxHp": 10, "shield": 2}`. Javasolt lista: `maxHp` (+max. élet),
  `shield` (kevesebb sebzés rossz válasznál), `heal` (ital: ennyi életet ad), `goldBonus` (+% arany),
  `luck` (jobb láda-csillag esély), `hint` (% eséllyel kiesik egy rossz válasz). A tárgyon most kiírva látszik;
  a hatásuk a felszerelés feature-rel (3. szakasz) kezd működni.
- `desc`: opcionális (most egyik tárgy sem kap; később a küldetés-tárgyak).
- **Fegyverek anyag szerint:** a fegyver-ikoncsomag 4 anyaga a ritkasághoz igazodik: bronz = közönséges, vas =
  ritka, acél = epikus, arany = legendás (a csoporton belüli I / II / III a változattól függ).

**Loot tábla:** a tárgyankénti tétel mellett „csomag” tétel is lehet: kategória és / vagy ritkaság szerint húz
egy véletlen tárgyat, így egy új tárgy magától bekerül a ládákba.
```json
{"pick": {"kind": "weapon", "rarity": ["common1", "common2", "common3"]}, "weight": 3}
```

**Ellenőrzés** (`ContentValidator` + teszt): ismert `kind` és `type`, létező ritkaság, `value` ≥ 0, ikon megvan,
`name` / `desc` kulcs `de` + `hu` változattal, egyedi ID; minden `pick` legalább egy tárgyat talál.

## 5. Állapot és mentés
- A mentés nem változik: az inventory már most `[{ id, qty }]`, a felszerelés `{ weapon, armor }`.
- A mostani 11 tárgy ID-ja még sehol nincs elmentve (a loot még nem tárolódik), ezért **most még átnevezhetők és
  törölhetők** migráció nélkül. Ennél a feature-nél véglegesítjük őket; utána már csak migrációval változhatnak.
- Az új felszerelés-helyek (ékszer, külön páncélrészek) a felszerelés feature-rel jönnek, migrációval.

## 6. Felület
- Láda-ablak kiemelés: a ritkaság sora elé a kategória („Waffe · Selten I”), a „?” buborékban magyarul.
- „Beute” lista: ritkaság szerint csökkenő sorrend, azon belül kategória.
- Láda-labor: új „Tárgyak” gomb → katalógus-ablak (csak `?debug=1`, magyarul), görgethető, kategória-szűrővel
  (44 px-es gombok), telefonon is használható.

## 7. Szövegek
- Új kulcsok: `kind.<kind>` (8 db), `type.<type>` (ha a felületen megjelenik), `item.<id>.name/desc` az új
  tárgyakhoz, `debug.items*` a katalógushoz.
- Német tartalom: tárgynév névelővel (B1 szókincs, a ritkábbaknál lehet B2: „der Streitkolben”, „die Armschiene”).
  Leírás most nincs; a passzívok nevei: `stat.<id>` (pl. „Leben”, „Schild”). Amiben nem vagyok biztos: `review` jelölés.

## 8. Assetek
- Fegyverek: `weapons/` (Weapon RPG Icons, 4 anyag × 24 típus × 10 változat) — megvan, bőven elég.
- Páncél, ékszer, ital, drágakő, anyag, kulcs, kincs: `items/` (Items16, 1244 ikon) — megvan
  (`assets/previews/it-ikon-*.png`). Új asset nem kell.

## 9. Eldöntendő kérdések
Döntések (2026-11-18):
- [x] **Ritkaság:** 7 fokozat (a 9 helyett): common · uncommon · rare · super rare · epic · legendary · unreal.
      A sorrend és a német nevek: lásd lent.
- [x] **Leírás:** a tárgyaknak most nincs leírás; helyette a **passzívok** (statok) látszanak („+10 Leben”).
      Leírást később a küldetés-tárgyak kapnak (a `desc` mező opcionális lesz).
- [x] **A mostani 11 tárgy:** mind újra lesz sorolva (az ID-k még szabadon változhatnak).
- [x] **Passzívok:** sokfélék lehetnek → rögzített passzív-lista (`stats`), lásd 4.; a hatásuk a felszerelés
      feature-rel működik, de az adat és a kijelzés most készül.
- [x] **Loot, hosszú távra** (sok tárgy, sok láda, helyhez kötött tárgyak, nehezebb dungeon = jobb loot):
      kevés kategória, sok tárgy; **szint nincs, csak ritkaság** (az adja az erőt). A loot táblák csomagokból húznak
      (`pick`: kategória / ritkaság); a **különleges tárgyak** (`exclusive`) csak abból a táblából jönnek, amelyik
      név szerint felsorolja őket (boss, egy adott dungeon).
- [x] **Nehezebb dungeon:** csak **nagyobb esély** a rare–legendary tárgyra, a közönséges tárgy ott is gyakori
      marad (nem lehet túl erős a loot). A tábla ritkaság-szorzókkal állítja, mint a láda-csillagok.
- [x] **Hány tárgy most:** minden ritkaságból legyen; kb. 56 tárgy:
      fegyver 14 (mind a 7 ritkaság × 2), páncél 14 (7 × 2), ékszer 7, ital 4 (common–epic), drágakő 6
      (common–legendary), anyag 5 (common–rare), kulcs 2, kincs 4 (epic–unreal).
- [x] **Ritkaság sorrendje és német nevei:** Gewöhnlich (common) · Ungewöhnlich (uncommon) · Selten (rare) ·
      Sehr selten (super rare) · Episch (epic) · Legendär (legendary) · Mythisch (unreal).

## 10. Kész, ha
- [x] minden tárgynak van kategóriája, típusa, ritkasága, ára; a kategóriák és típusok rögzített listából jönnek
- [x] a validátor és a tesztek ellenőrzik a tárgyakat és a `pick` tételeket
- [x] a loot táblák az új tárgyakra épülnek; a láda-labor szimulációja ésszerű eloszlást mutat
- [x] a láda-ablakban látszik a kategória és a passzívok, a „Beute” lista ritkaság szerint rendezett
- [x] a láda-laborban van tárgy-katalógus, telefonméretben is használható
- [x] a német tárgynevek névelővel, a bizonytalanok `review` jelöléssel
- [x] `node tools/build-data.js` és `npm test` zöld; egy régi mentés betöltése után is működik
- [x] README „Állapot”, `docs/GAME_DESIGN.md` (rarity létra, tárgycsoportok), `data/README.md` frissítve

## 11. Lépések
1. Adatformátum: `kind` / `type` / `value` / `stack`, kategória-lista, validátor, tesztek; a mostani tárgyak besorolása.
2. `Game.items` segéd (kategória, rendezés, keresés) + `pick` tétel a loot táblában, tesztekkel.
3. Új tárgyak (ikonok, német nevek, fordítások), a loot táblák átírása; láda-labor szimulációval ellenőrizve.
4. Felület: kategória a láda-ablakban, rendezett „Beute” lista, tárgy-katalógus a láda-laborban.
5. Dokumentáció, lezárás.
