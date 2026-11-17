# Ládanyitás (animáció + kirepülő loot)

**Állapot:** tervezet
**Ötlet:** README „Állapot” → 2. szakasz → loot szabályok (első darab: csak a láda, inventory nélkül)

## 1. Cél
A dungeon ládája látványosan kinyílik, és véletlenszerű loot repül ki belőle (arany, ital, drágakő, fegyver…).
A tárgyak még nem kerülnek inventoryba, az a következő feature. A tárgyak német nevét a „?” mutatja magyarul.

## 2. Játék közben
A játékos a ládához sétál, és megnyomja az „Öffnen” gombot (vagy a ládára koppint). A láda kétszer megremeg,
felvillan alatta a fény, és a fedele felpattan (porfelhő, aranyszín csillogás). 2–4 tárgy-ikon ívben kirepül,
a láda előtt földet ér, kicsit pattan, és ritkaság-színű derengéssel lebeg. Kb. fél másodperc múlva megjelenik
egy kis **„Beute”** ablak: ikon + német név („?”) + darabszám, a név a ritkaság színével. A „Super!” gombra az
ikonok a játékoshoz repülnek és eltűnnek. Utána a láda üres („Leer – nur ein bisschen Staub.”).

## 3. Mire épül
- Meglévő: `DungeonScene` ládája (csukott / nyitott kép, már van ugrás + porfelhő), `ui.modal`, fordítási fájl,
  rarity létra (`config.js`), a tervezett `items.json` / `loot_tables.json` formátum és a validátor.
- Új rendszer: `src/systems/loot/` – a loot tábla „sorsolása” (DOM és Phaser nélkül, tesztelhető) + `README.md`.
  Az animáció a `src/scenes/dungeon/chest.js`-be kerül (a ládát kiveszem a `DungeonScene`-ből), a „Beute” ablak
  a `src/ui/loot.js`-be.

## 4. Adat
- `items.json`: az első kb. 8 tárgy; `icon`: Items16 (`it:<szám>`) vagy Weapon Icons (`wp:<anyag> c<oszlop> r<sor>`).
- `loot_tables.json`: `rolls` (hány tétel), súlyozott `entries`: tárgy (darabszám-tartománnyal) vagy arany.
- `dungeons.json`: `"lootTable": "loot_crypt_chest"` (a validátor már ellenőrzi a hivatkozást).
```jsonc
{"id": "potion_small", "name": "item.potion_small.name", "desc": "item.potion_small.desc", "kind": "potion",
 "rarity": "common1", "icon": "it:901"}
{"id": "loot_crypt_chest", "rolls": [2, 4], "entries": [
  {"gold": [5, 15], "weight": 5}, {"item": "potion_small", "qty": [1, 2], "weight": 3},
  {"item": "gem_blue", "weight": 2}, {"item": "sword_bronze_01", "weight": 1}]}
```
- Első tárgyak (javaslat): kis HP-ital, kék drágakő, ezüstérme-zacskó helyett arany, csont, régi kulcs,
  bronz kard, bronz tőr, kerek fapajzs – common1…rare1 között. A kripta és a bánya kissé más táblát kap.

## 5. Állapot és mentés
- A tárgyak nem kerülnek a mentésbe (a felhasználó kérése: inventory majd külön). Mentési formátum nem változik.
- Arany: lásd 9. (ha igen: `Game.state.addGold`, ami már létezik és ment, a HUD magától frissül).

## 6. Felület
- „Beute” ablak: ikonok 2× nagyítva (32 px, éles pixel art), sorok min. 44 px magasak, egy nagy „Super!” gomb.
- Telefon: a láda és a kirepülő ikonok a kamera közepén maradnak (nem takarja a HUD és a panel).

## 7. Szövegek
- `loot.title` („Beute”), `loot.ok` („Super!”), `item.<id>.name` / `.desc` minden tárgyhoz, `chest.locked` (ha 9.3 igen).
  A tárgynevek névelővel: „der Heiltrank”, „das Bronzeschwert” (B1-es felület).

## 8. Assetek
- Láda: `pc:furniture` (csukott / nyitott, már használjuk). Ikonok: Items16 (ital 901–904, drágakő 529–560,
  érme 1156–1163, csont 1164+, kulcs 689–712), Weapon Icons (bronz kard, tőr). Fény / csillogás: meglévő fx textúrák.
  Új asset nem kell.

## 9. Eldöntendő kérdések
- [ ] Az arany már most kerüljön be (HUD + mentés), vagy az is csak látvány legyen? Javaslat: **kerüljön be** – a
      rendszer kész hozzá, és van értelme a ládának.
- [ ] Minden belépéskor újra tele a láda? Javaslat: **igen, most még igen** (amíg nincs tárolás, nincs mit védeni).
- [ ] Zárva legyen a láda, amíg él szörny a dungeonben? Javaslat: **igen** („Die Truhe ist verschlossen. Besiege
      zuerst alle Monster!”) – így a kérdések megoldása vezet a jutalomhoz.
- [ ] Hány tárgy jön ki? Javaslat: **2–4**, ebből legalább egy arany.

## 10. Kész, ha
- [ ] a láda remeg, kinyílik, a tárgyak ívben kirepülnek, földet érnek, és a „Beute” ablak listázza őket
- [ ] a loot a loot táblából jön, súlyozott véletlennel; a validátor ellenőrzi a tárgyakat és a táblákat
- [ ] (ha 9.1 igen) az arany bekerül a HUD-ba és a mentésbe
- [ ] `node tools/build-data.js` és `npm test` zöld, új tesztekkel (sorsolás, validátor)
- [ ] telefonméretben (érintéssel) kipróbálva; régi mentéssel is működik
- [ ] README „Állapot”, `docs/GAME_DESIGN.md` 3. rész (jutalmak), szükség esetén `docs/DECISIONS.md`

## 11. Lépések
1. Adat + sorsolás: `items.json` első tárgyai, `loot_tables.json`, validátor, `src/systems/loot/` + tesztek.
2. Láda-animáció és kirepülő ikonok (`src/scenes/dungeon/chest.js`), ikonok betöltése.
3. „Beute” ablak, arany (ha igen), zárt láda (ha igen).
4. Lezárás: dokumentáció, README „Állapot”.
