# Inventory: a loot tárolása és a „Tasche” ablak

**Állapot:** tervezet
**Ötlet:** README „Állapot” → 3. szakasz: inventory, gear a karakteren, shop, gold, HP-ital (az első darab)

## 1. Cél
Ami a ládából jön, az megmarad: a tárgyak a táskába, az arany a pénztárcába kerül. A játékos egy „Tasche” ablakban
látja, mit gyűjtött össze (kategóriánként, ritkaság szerint), és a gyógyitalt meg is tudja inni. Közben a tárgyak
német neveit névelővel látja és tanulja.

## 2. Játék közben
- A láda-ablak „Super!” gombjára a zsákmány a táskába kerül, az arany a HUD-on felpörög (+12).
- A HUD-on a „Menü” mellett egy **„Tasche”** gomb (táska ikon). Koppintásra megnyílik az ablak:
  - fent fülek: **Alle** · Waffen · Rüstung · Schmuck · Tränke · Edelsteine · Material · Schlüssel · Schätze
    (csak az a fül látszik, amiben van valami);
  - rács (kb. 4–5 oszlop telefonon): ikon a ritkaság színű kerettel, jobb alul a darabszám; a legritkább elöl;
  - egy tárgyra koppintva alul a részletek: név a „?”-lel, kategória · ritkaság, passzívok („+3 Angriff”), ár,
    darabszám; italnál **„Trinken”** gomb (+ annyi élet, amennyi a „Heilung”; teli életnél nem engedi).
  - Üres táskánál: „Deine Tasche ist leer.”
- A felvétel (felszerelés a karakterre) és az eladás **nem** része ennek: a felszerelés és a bolt feature-é.

## 3. Mire épül
- Meglévő: `Game.state` (`addItem`, `removeItem`, `inventory`, `addGold`, `heal`), a `state:*` események,
  `Game.items` (rendezés, passzívok, ár), `Game.lootUI` (ikon, passzívok), a láda-ablak (`onDone(loot)`), a HUD.
- Új rendszer nem kell: a tárolás egy kis függvény (`Game.loot.collect(loot)`), az ablak `src/ui/bag.js`.

## 4. Adat
- Új adatfájl nincs. A tárgyak, kategóriák, passzívok a meglévők (`data/items.json`, `config.js` → `items`).
- Új `config.js` mező: `loot.storeLoot` (true), és a láda-labor saját kapcsolója (lásd 6.).

## 5. Állapot és mentés
- **A mentés formátuma nem változik:** az inventory már most `[{ id, qty }]`, az arany `gold` (v4 óta). Migráció nem kell.
- `Game.loot.collect(loot)`: minden tételt `Game.state.addItem` / `addGold`-dal tesz el (a `state:inventory` és
  `state:gold` eseménnyel); a mentés a meglévő automatikus mentéssel történik.
- Ital: `Game.state.removeItem(id, 1)` + `Game.state.heal(stats.heal)`.

## 6. Felület
- HUD: „Tasche” gomb a „Menü” mellett (legalább 44×44 px, safe area), a menü-gombhoz hasonló stílusban.
- Ablak: a meglévő `ui.modal`; görgethető rács; a fülek 44 px magas gombok, sorba törnek kis képernyőn.
- Láda-labor (`?debug=1`): kapcsoló „A zsákmány a táskába kerül” (alapból **ki**, hogy a próbanyitások ne töltsék
  tele a táskát), és egy „Táska ürítése” gomb a teszteléshez.
- Telefonon (iPhone 11 / 13): az ablak a képernyő magasságához igazodik, a részletek a rács alatt jelennek meg.

## 7. Szövegek
- Új kulcsok: `hud.bag` (Tasche), `bag.title`, `bag.empty` (Deine Tasche ist leer.), `bag.all` (Alle),
  `bag.tab.<kind>` (Waffen, Rüstung, Schmuck, Tränke, Edelsteine, Material, Schlüssel, Schätze), `bag.drink` (Trinken),
  `bag.full` (Du hast schon volles Leben.), `bag.value` (Wert), `bag.count` (Anzahl), `debug.storeLoot`, `debug.clearBag`.
- Német tartalom: egyszerű felületi szavak (A2–B1), amiben biztos vagyok; nem kell `review`.

## 8. Assetek
- Táska ikon a HUD-gombhoz: Items16 `it:674` (hátizsák) vagy `it:676` (bőrzsák) — a katalógusban megvan.

## 9. Eldöntendő kérdések
- [ ] **A láda és a „farmolás”:** most a láda minden belépéskor újra tele van, és bármikor kinyitható. Ha a loot
      tárolódik, a ki-be járkálással végtelen tárgy szerezhető. Javaslat: a láda **csak akkor nyílik, ha a dungeon
      összes szörnyét legyőzted** (= megválaszoltad a kérdéseiket; a kapcsoló már megvan: `lockChestUntilCleared`).
      Mivel a szörnyek minden belépéskor visszajönnek (D14), minden láda kérdésekbe „kerül”, és a tanulás marad a motor.
      Más lehetőség: naponta egyszer tele (a `daily` állapottal), vagy maradjon szabadon.
- [ ] **Ital ivása most:** bekerüljön a „Trinken” gomb (javaslat: igen, kicsi és hasznos), vagy várjon a HP feature-re?
- [ ] **Táska mérete:** korlátlan (javaslat), vagy legyen felső határ (később bővíthető)?
- [ ] **„Új” jelölés:** jelöljük-e a még nem látott tárgyakat a táskában? (Ehhez kellene egy kis mentés-bővítés
      migrációval; javaslat: most nem.)

## 10. Kész, ha
- [ ] a láda zsákmánya a táskába, az arany a pénztárcába kerül, és újratöltés után is megvan
- [ ] a „Tasche” ablak kategóriánként, ritkaság szerint mutatja a tárgyakat, részletekkel
- [ ] (ha jóváhagyva) a gyógyital megihatható, az élet nő, a darabszám csökken
- [ ] a láda-laborban a tárolás ki-be kapcsolható, a táska üríthető
- [ ] tesztek: `collect`, ital, régi mentés betöltése; `node tools/build-data.js` és `npm test` zöld
- [ ] telefonméretben (érintéssel) kipróbálva
- [ ] README „Állapot”, `docs/GAME_DESIGN.md` (a loot már tárolódik) frissítve

## 11. Lépések
1. `Game.loot.collect`, a láda-ablak és a dungeon láda eltárolja a zsákmányt; láda-labor kapcsoló; tesztek.
2. A láda nyitásának szabálya (a 9. döntés szerint).
3. „Tasche” gomb a HUD-on + az ablak (fülek, rács, részletek).
4. Ital ivása (ha jóváhagyva), tesztekkel.
5. Dokumentáció, lezárás.
