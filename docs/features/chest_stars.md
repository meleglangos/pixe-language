# Láda-ablak csillagokkal

**Állapot:** kész, 2. kiegészítéssel (jóváhagyva: 2026-11-17)
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
- ~~`chest.tapToOpen`, `chest.stars`, `chest.tapNext`~~ – a telefonos teszt után kikerültek (felesleges feliratok):
  a csillagok magukért beszélnek, a koppintásra a lebegő / remegő láda utal. Marad: `chest.legendary` („Legendär!”).

## 8. Assetek
- Nincs új: a láda a meglévő kivágás (`pc_wood`), a csillag kódból rajzolt (CSS / SVG), a fény a meglévő stílus.
  A saját láda-animációtok később egy új láda-stílus lesz (`chest_styles.json`).

## 9. Eldöntendő kérdések
- [x] A csillagok esélye → **1★ 30%, 2★ 30%, 3★ 20%, 4★ 13%, 5★ 7%**.
- [x] Nyitás az ablakban → **a játékos koppint a ládára**.
- [x] Ritkaság → ~~minimum csillag~~ → **nincs korlát**, 1★-ból is jöhet legendary, csak kis eséllyel;
      a csillag az esélyeket tolja a ritkább felé (4. pont, `rarityFactor`). **Az arany nem jár mindig.**
- [x] A `rarityFactor` számai (4. pont) → **jók kezdésnek** (adatban hangolható).

## 10. Kész, ha
- [x] „Öffnen”-re megnyílik az ablak, a csillagok kigyúlnak és véletlenszerűen megállnak 1–5-nél
- [x] több csillagnál több tárgy jön, és nagyobb eséllyel ritka; bármelyik ládából bármi jöhet; az arany nem kötelező
- [x] koppintásra a láda kinyílik, a loot kiesik, a lista és a „Super!” megjelenik; a pályán a láda nyitva marad
- [x] a csillagok hatása adatból állítható; tesztek a csillag-sorsolásra és a szűrésre
- [x] telefonméretben (érintéssel) a teljes játékban kipróbálva

Megjegyzések: a „Beute” ablak helyett a lista a láda-ablakban jelenik meg; a pályán a kirepülő loot megszűnt
(csak a fedél pattan fel). Mivel a közönséges tárgyak szorzója csökken a csillaggal, több csillagnál az arany
aránya is nő (1★: ~22%, 5★: ~37% egy húzásnál a kriptában) – ha zavaró, a `rarityFactor.gold` sorral hangolható.

## 2. kiegészítés: több koppintás, tárgyankénti kiemelés (jóváhagyva 2026-11-17)
Az egy koppintás unalmas volt („hiányzik a dopamin”). Új menet:
- **Nyitás 3 koppintással:** 1. megreped, fény szűrődik ki · 2. erősebb rázás · 3. a fedél felpattan.
  Több csillag = erősebb rázás és fény.
- **Tárgyanként egy koppintás:** a következő tárgy előtt a láda a **ritkasága színében dereng** (előjel), koppintásra
  a tárgy nagyban kiemelkedik a nevével és a ritkaságával; a ládán számláló („noch 3”). Common: gyors; rare: kék fény,
  szikrák; epic: lila fény, előtte rázás; legendary: hosszabb rázás, arany sugarak, villanás, „Legendär!” felirat.
- A végén a tárgyak sorban, alattuk a lista és a „Super!”.
- **Nincs „mindet mutat” gomb**, de lehet sietni: koppintásra az épp futó animáció azonnal a végére ugrik.
- **Ritka tárgyak:** 3 új tárgy (2 epic, 1 legendary) a két láda táblájába, hogy legyen mit kinyitni
  (a rendes tárgyrendszer később): `amulet_01` (epic1), `sword_gold_01` (epic2), `crown_gold` (legendary).
  Esély a kripta-ládában: 5★: a ládák ~5%-ában korona, 1★: ~0,03%.
- Kész: a teljes játékban kipróbálva (iPhone 13 emuláció), fix zsákmánnyal minden ritkaság menete, és a gyors
  végigkoppintás (egy 3★ láda ~2 mp alatt).

Finomítás (a telefonos teszt után): pixel art csillagok (generált, csillanással, 5★-nál ragyognak), a „Noch”
számláló kikerült, a fény és a sugarak a széle felé lágyan elhalványulnak (nincs éles levágás), és az utolsó
tárgy után a láda koppintásra vár, csak utána jön az összesítő.

## 3. kiegészítés: epikus nyitás (2026-11-17, a felhasználó kérésére, szabad kézzel)
A 3 koppintás három felvonás, egyre erősebben:
1. **Ébredés:** ütés-érzet (összenyomódik, felugrik, felvillan), izzó pixel-repedések, lökéshullám, por, rövid rezgés.
2. **Feltöltődés:** több repedés, a résekből és a sugarakból **a legjobb tárgy ritkaság-színében** szivárog a fény
   (előjel), a háttér elsötétül, parázs száll fel, a láda folyamatosan remeg, a csillagok lüktetnek.
3. **Robbanás:** összehúzódás, fehér villanás, a fedél pörögve lerepül, fényoszlop, két lökéshullám, aranyérme-zápor,
   szikrák, az ablak megrázkódik, erős rezgés; a nyitott ládából utána fény árad. Legendarynél minden erősebb.
A rezgés csak Androidon működik (iOS-en a böngésző nem engedi); „csökkentett mozgás” beállításnál nincs rezgés.

## 4. kiegészítés: pixeles fények, új láda, kevesebb üres hely (2026-11-17)
- A sima, elmosódó fények (dereng, belső fény, sugarak, fényoszlop) helyett **pixeles fények**: alacsony
  felbontású vászon, lépcsős sávok, sakktábla-dither a sávhatárokon; a sugarak lépésenként forognak (~12 kép/mp).
  Feltöltődéskor az egész ablak háttere sötétedik lépcsőzetesen (nem egy téglalap).
- **Új, saját láda** (`assets/custom/chest_royal.png`, rajz: `tools/art/chest_royal.py`): domború fedél, deszkák,
  vas pántok és sarkok, aranyzár rubinnal; nyitva arany a belsejében. Ez az alap láda-stílus (`royal`), a pályán is.
- Nyitás előtt a láda középen áll, robbanáskor lecsúszik (kevesebb üres hely), az ablak alacsonyabb.

## 5. kiegészítés: képernyő-effektek (2026-11-17)
- Robbanáskor pixeles fénycsíkok a ládából a képernyő szélei felé, és szétszórt pixel-csillanások az egész képernyőn.
- Kiemeléskor: rare – néhány csillanás; epic – több, lila; legendary – arany pixel-konfetti hullik az egész képernyőn.
- Egy teljes képernyős, átlátszó rétegben (`.cw-screen`), ami nem fogja meg a koppintást, és a „Super!”-ral eltűnik.
- Javítva: a fényfolt vászna mindig akkora, mint a folt (nem vágódik le egyenesen); a láda-terület magasabb,
  hogy a kiemelt tárgy felirata ne fusson rá a ládára.

## 11. Lépések
1. Csillagok a loot-sorsolásban (`rollStars`, `roll(…, { stars })`, `rarityFactor`, `chances`) + validátor + tesztek.
2. Láda-ablak: nagy láda, csillag-animáció, koppintásra nyitás, kieső loot, lista.
3. A pályán a régi kirepülés helyett az ablak; dokumentáció.
