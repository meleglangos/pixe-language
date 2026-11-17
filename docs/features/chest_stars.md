# Láda-ablak csillagokkal

**Állapot:** tervezet
**Ötlet:** a felhasználó kérése (a ládanyitás folytatása: `docs/features/chest_opening.md`)

## 1. Cél
A ládanyitás saját ablakban, nagyban történik. A láda alatt véletlenszerűen 1–5 csillag jelenik meg: ez a láda
minősége. Több csillag = több és jobb loot. Utána animációval kiesik a loot a ládából.

## 2. Játék közben
„Öffnen” → elsötétül a háttér, középen megjelenik a láda nagyban (éles pixel art, 5× nagyítás). Alatta öt üres
csillag-hely; a csillagok egymás után kigyúlnak (pörgés-szerűen, kb. 1 mp), és megállnak 1–5 csillagnál
(5 csillagnál külön fény-villanás). Ezután a játékos a ládára koppint (felirat: „Tippe auf die Truhe!”): a láda
megremeg, kinyílik, és a loot ívben kiesik belőle az ablakban; alul megjelenik a lista (mint most a „Beute”),
és a „Super!” gombbal zárul. A pályán a láda utána nyitva marad.

## 3. Mire épül
- Meglévő: `Game.loot.roll` (sorsolás), `chest_styles.json` (a láda kinézete), tárgy-ikonok, a „Beute” lista.
- Új rendszer nem kell: a láda-ablak a `src/ui/chestWindow.js` (DOM: a láda képkockái CSS háttérként, nagyítva,
  így bármelyik láda-stílussal működik); a pályán a `src/scenes/dungeon/chest.js` csak megnyitja.
  A kirepülő loot a pályáról átkerül az ablakba.

## 4. Adat
- A csillagok hatása **adatból** jön (`config.js` → `loot.stars`, loot táblánként felülírható `"stars"` mezővel):
```jsonc
"stars": {
  "weights": [30, 30, 20, 13, 7],                    // 1…5 csillag esélye (%-szerű súlyok)
  "rolls":   [[1, 1], [1, 2], [2, 3], [3, 4], [4, 5]], // ennyi tárgyat húz csillagonként
  "gold":    [1, 1.3, 1.6, 2, 3]                     // az arany szorzója
}
```
- **Nincs korlát: bármi eshet bármelyik ládából, csak az esélyek mások.** Egy tétel esélye = a súlya × a
  ritkasága szorzója az adott csillagszámnál (`config.js` → `loot.stars.rarityFactor`, ritkaság-csoportonként):
```jsonc
"rarityFactor": {                       // 1★    2★    3★    4★    5★
  "common":    [1,     0.9,  0.8,  0.6,  0.4],
  "rare":      [0.15,  0.3,  0.5,  0.8,  1.2],
  "epic":      [0.03,  0.06, 0.12, 0.25, 0.5],
  "legendary": [0.005, 0.01, 0.03, 0.06, 0.15],   // 1★-ból is jöhet legendary, csak ritkán
  "gold":      [1,     1,    1,    1,    1]       // az arany is csak egy tétel a táblában
}
```
  A csoport a ritkaság ID-jából jön (`common1` → `common`, `rare2` → `rare`). Pontos esélyek: lásd a teszt / a
  `Game.loot.chances(tábla, csillag)` függvény, ami kiírja, mi milyen eséllyel jön.
- **Az arany nem jár mindig:** kikerül az `always` rész, az arany a többi tétellel együtt sorsolódik.
- `Game.loot.roll(tábla, { stars })` – a csillagszám sorsolása: `Game.loot.rollStars(tábla)`.

## 5. Állapot és mentés
- Nincs változás: a loot továbbra is csak látvány (a tárolás az inventory feature-rel jön).

## 6. Felület
- Teljes képernyős sötét háttér, középen a láda (kb. 80 px széles), csillagok 32 px, a lista görgethető.
- Telefon: a láda egy nagy koppintható terület (min. 44 px), „Super!” gomb alul; kis képernyőn a lista görgethető.

## 7. Szövegek
- `chest.tapToOpen` („Tippe auf die Truhe!”), `chest.stars` („{n} von 5 Sternen” – a „?”-hez), a többi a meglévő.

## 8. Assetek
- Nincs új: a láda a meglévő kivágás (`pc_wood`), a csillag kódból rajzolt (CSS / SVG), a fény a meglévő stílus.
  A saját láda-animációtok később egy új láda-stílus lesz (`chest_styles.json`).

## 9. Eldöntendő kérdések
- [x] A csillagok esélye → **1★ 30%, 2★ 30%, 3★ 20%, 4★ 13%, 5★ 7%**.
- [x] Nyitás az ablakban → **a játékos koppint a ládára**.
- [x] Ritkaság → ~~minimum csillag~~ → **nincs korlát**, 1★-ból is jöhet legendary, csak kis eséllyel;
      a csillag az esélyeket tolja a ritkább felé (4. pont, `rarityFactor`). **Az arany nem jár mindig.**
- [ ] A `rarityFactor` számai (4. pont) így jók kezdésnek? (Később adatban hangolható.)

## 10. Kész, ha
- [ ] „Öffnen”-re megnyílik az ablak, a csillagok kigyúlnak és véletlenszerűen megállnak 1–5-nél
- [ ] több csillagnál több tárgy jön, és nagyobb eséllyel ritka; bármelyik ládából bármi jöhet; az arany nem kötelező
- [ ] koppintásra a láda kinyílik, a loot kiesik, a lista és a „Super!” megjelenik; a pályán a láda nyitva marad
- [ ] a csillagok hatása adatból állítható; tesztek a csillag-sorsolásra és a szűrésre
- [ ] telefonméretben (érintéssel) a teljes játékban kipróbálva

## 11. Lépések
1. Csillagok a loot-sorsolásban (`rollStars`, `roll(…, { stars })`, `rarityFactor`, `chances`) + validátor + tesztek.
2. Láda-ablak: nagy láda, csillag-animáció, koppintásra nyitás, kieső loot, lista.
3. A pályán a régi kirepülés helyett az ablak; dokumentáció.
