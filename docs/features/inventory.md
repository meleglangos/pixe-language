# Inventory: a loot tárolása és a „Tasche” ablak

**Állapot:** kész (jóváhagyva 2026-11-22)
**Ötlet:** README „Állapot” → 3. szakasz: inventory, gear a karakteren, shop, gold, HP-ital (az első darab)

## 1. Cél
Ami a ládából jön, az megmarad: a tárgyak a táskába, az arany a pénztárcába kerül. A játékos egy „Tasche” ablakban
látja, mit gyűjtött össze (kategóriánként, ritkaság szerint), és a gyógyitalt meg is tudja inni. Közben a tárgyak
német neveit névelővel látja és tanulja.

## 2. Játék közben
- A láda **csak akkor nyílik, ha a dungeon összes szörnyét legyőzted** (= megválaszoltad a kérdéseiket). A láda-ablak
  „Super!” gombjára a zsákmány a táskába, az arany a pénztárcába kerül (a HUD-on látszik).
- A HUD helytakarékos: a „Menü” felirat helyett **☰ ikon**, mellette a **táska ikon** (felirat nélkül, 44×44 px).
- A „Tasche” ablak: fent két kis legördülő — **szűrő** (Alle / kategóriák, darabszámmal) és **rendezés**
  (Seltenheit, Kategorie, Name, Wert, Anzahl); alatta a rács: ikon a ritkaság színű kerettel, darabszám.
  Egy tárgyra koppintva alul a részletek: név a „?”-lel, kategória · ritkaság, passzívok, érték, darabszám, és a
  tárgyhoz illő **műveletek**: italnál „Trinken” (+ annyi élet, amennyi a „Heilung”; teli életnél nem engedi).
  Később ide kerül a „Felvenni” (felszerelés) és az „Eladni” (bolt).
- Üres táskánál: „Deine Tasche ist leer.” A táska korlátlan.
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
- HUD: ☰ (menü) és táska ikon-gomb a jobb felső sarokban (legalább 44×44 px, safe area), felirat nélkül.
- Ablak: a meglévő `ui.modal`; fent két legördülő (szűrő, rendezés), görgethető rács, alatta a részletek.
- Láda-labor (`?debug=1`): kapcsoló „A zsákmány a táskába kerül” (alapból **ki**, hogy a próbanyitások ne töltsék
  tele a táskát), és egy „Táska ürítése” gomb a teszteléshez.
- Telefonon (iPhone 11 / 13): az ablak a képernyő magasságához igazodik, a részletek a rács alatt jelennek meg.

## 7. Szövegek
- Új kulcsok: `hud.bag` (Tasche), `bag.title`, `bag.empty` (Deine Tasche ist leer.), `bag.all` (Alle), `bag.filter`,
  `bag.sort`, `bag.sort.<mód>` (Seltenheit, Kategorie, Name, Wert, Anzahl), `bag.drink` (Trinken),
  `bag.full` (Du hast schon volles Leben.), `bag.value` (Wert), `bag.count` (Anzahl), `debug.storeLoot`, `debug.clearBag`.
- Német tartalom: egyszerű felületi szavak (A2–B1), amiben biztos vagyok; nem kell `review`.

## 8. Assetek
- Táska ikon a HUD-gombhoz: Items16 `it:674` (hátizsák) vagy `it:676` (bőrzsák) — a katalógusban megvan.

## 9. Eldöntendő kérdések
Döntések (2026-11-22):
- [x] **Láda:** csak a dungeon összes szörnyének legyőzése után nyílik (`config.js` → `loot.lockChestUntilCleared: true`).
- [x] **Ital:** nincs külön gomb a felületen; a táskában a tárgyra koppintva a részleteknél jelenik meg a „Trinken”.
      Kevés gomb, ne takarja a játékot: a „Menü” gombot is ☰ ikon váltja.
- [x] **Táska mérete:** korlátlan, szűrővel és rendezéssel. (Ötlet későbbre: korlátos táska, nagyobb táska
      dungeon-jutalomként — `docs/IDEAS.md`.)
- [x] **„Új” jelölés:** most nem.

## 10. Kész, ha
- [x] a láda zsákmánya a táskába, az arany a pénztárcába kerül, és újratöltés után is megvan
- [x] a „Tasche” ablak kategóriánként, ritkaság szerint mutatja a tárgyakat, részletekkel
- [x] a gyógyital a táskából megihatható, az élet nő, a darabszám csökken
- [x] a HUD-on ☰ és táska ikon (felirat nélkül), a láda csak a szörnyek legyőzése után nyílik
- [x] a láda-laborban a tárolás ki-be kapcsolható, a táska üríthető
- [x] tesztek: `collect`, ital, régi mentés betöltése; `node tools/build-data.js` és `npm test` zöld
- [x] telefonméretben (érintéssel) kipróbálva
- [x] README „Állapot”, `docs/GAME_DESIGN.md` (a loot már tárolódik) frissítve

## 11. Lépések
1. `Game.loot.collect`, a láda-ablak és a dungeon láda eltárolja a zsákmányt; láda-labor kapcsoló; tesztek.
2. A láda csak a szörnyek legyőzése után nyílik (config).
3. HUD: ☰ és táska ikon; a „Tasche” ablak (szűrő, rendezés, rács, részletek).
4. Ital ivása a részleteknél, tesztekkel.
5. Dokumentáció, lezárás.
