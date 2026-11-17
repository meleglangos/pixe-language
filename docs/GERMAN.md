# Német tartalom

Szabályok minden német szöveghez: feladatok, kérdések, felület, tárgy- és szörnynevek. Akkor olvasd el, ha
német szöveget írsz vagy módosítasz, kérdéseket készítesz, vagy a válasz-ellenőrzéshez nyúlsz.

**Fontos:** a fejlesztő nem tud németül, tehát a német szöveget senki nem ellenőrzi helyetted.
A játékos (23 éves, B1–C1 szint) tanul belőle, ezért egy hibás mondat rosszabb, mint egy hiányzó.

## 1. A felület nyelve

- A játék felülete német, a magyar a segítség: a „?” buborék (`ui.help(kulcs)`) ugyanannak a kulcsnak a
  magyar változatát mutatja. Minden szöveg a `data/translations.json`-ban van, `de` + `hu` változattal.
- A felület német szövege legyen egyszerűbb (B1), mint a feladatoké, hogy a játék mindig kezelhető maradjon.

## 2. Helyesség

- Csak olyan mondatot írj, amiben biztos vagy. Természetes, mai, köznyelvi német (Németország), ne
  tankönyvszagú vagy archaikus, hacsak a helyszín hangulata nem kéri (pl. kripta-felirat).
- Főnév szókincsként mindig névelővel és többes számmal: `der Hund, -e`, `die Stadt, Städte`.
- Helyes umlaut és `ß`, nagybetűs főnevek, helyes vessző a mellékmondatok előtt.
- Egy feladatnak egyértelműnek kell lennie: ha két válasz is helyes lehet, vagy mindkettőt fogadd el,
  vagy írd át a kérdést.
- A magyar fordítás természetes magyar legyen, ne tükörfordítás; a magyar is legyen helyes.

## 3. „Ellenőrizendő” jelölés

- Ha nem vagy 100%-ig biztos egy német szövegben (ritka szó, idióma, kétes vonzat, regionális változat),
  jelöld `review`-val. A játékos később végigmehet a jelölt szövegeken.
- A jelölés helyét és formátumát a kérdés-rendszer spec rögzíti, és a validátor ellenőrzi; amíg nincs kész,
  sorold fel a bizonytalan kulcsokat a feladat végi összefoglalóban.
- A jelölés nem mentség: ha egy mondatban kifejezetten kételkedsz, inkább írj másikat.

## 4. Szintek: B1, B2, C1

A dungeonök és a kérdés-poolok sorban haladnak: az elején B1, a végén C1. Egy poolon belül is legyen
könnyebb és nehezebb kérdés. A szint nemcsak a nyelvtant jelenti, hanem a szókincset és a mondathosszt is.

| Szint | Mit tud a játékos | Nyelvtan (példák) | Szókincs, szöveg |
| --- | --- | --- | --- |
| **B1** | hétköznapi helyzetek, egyszerű összefüggő szöveg | Perfekt / Präteritum, `weil`, `dass`, `wenn`, `obwohl`; Dativ / Akkusativ, elöljárók esettel; melléknévragozás; visszaható igék; `um … zu` | gyakori, konkrét szavak; rövid mondatok |
| **B2** | elvont témák, véleménykifejtés, árnyalatok | Konjunktiv II (`hätte`, `würde`, múlt idejű is); Passiv (Präsens, Präteritum, Perfekt, módbeli igével); vonzatos igék (`sich freuen auf`, `abhängen von`); vonzatos névmás (`darauf`, `worüber`); `je … desto`; Relativsatz elöljáróval; Plusquamperfekt | elvontabb szavak, szinonimák, hosszabb mondatok |
| **C1** | gördülékeny, pontos, stílusérzékeny nyelv | Konjunktiv I (függő beszéd); nominalizálás (`die Durchführung`); Partizip mint jelző (`der seit Jahren geplante Bau`); Passiv-helyettesítők (`sich lassen`, `-bar`, `sein … zu`); kötőszó-párok (`zwar … aber`, `sowohl … als auch`); `Funktionsverbgefüge` (`in Frage kommen`) | idiómák, választékos és hivatalos stílus, finom jelentéskülönbségek |

## 5. Feladattípusok

A játékos szereti a Duolingo-szerű feladatokat, ezért ilyen jellegűek legyenek: rövidek, gyorsan
megoldhatók, azonnali visszajelzéssel, és **telefonon is kényelmesek** (érintés > gépelés).

| Típus | Leírás |
| --- | --- |
| választós | 3–4 lehetőségből egy helyes (szó, névelő, igealak, jelentés) |
| szókártyás mondatépítés | a mondatot szavakból kell összerakni koppintással (fordítás vagy szórend) |
| kiegészítős (Lückentext) | hiányzó szó vagy végződés egy mondatban, beírva vagy választva |
| párosítás | német–magyar szópárok, vagy szó–névelő párok |
| beírós fordítás | rövid mondat fordítása magyarról németre vagy fordítva |
| hallás utáni | (később) felolvasott mondat, `speechSynthesis` de-DE hanggal – külön döntés kell róla |

Egy feladat lehet szókincs, nyelvtan, olvasott szöveg értése: a poolok legyenek vegyesek.

## 6. Válasz-ellenőrzés: elnéző, de csak helyes választ fogad el

Alapelv: **a játék akkor fogad el egy választ, ha az helyes.** Az elnézés csak a gépelésre vonatkozik,
a nyelvtanra nem.

Elfogadható, mert nem nyelvi hiba (csak gépelési kényelem):
- kis- és nagybetű eltérés, kivéve, ha a feladat éppen a nagybetűt kérdezi,
- `ae`/`oe`/`ue` az `ä`/`ö`/`ü` helyett, `ss` a `ß` helyett,
- felesleges szóköz, a mondat végi írásjel hiánya.

Nem fogadható el:
- elírás, rossz végződés, rossz névelő, rossz szórend,
- olyan alternatív válasz, ami nincs felsorolva a kérdés helyes megoldásai között.

Több helyes megoldás: minden helyes változatot (szinonima, más szórend, névelővel vagy nélküle) **fel kell
sorolni** a kérdésnél. Egy változat csak akkor kerülhet a listára, ha nyelvtanilag helyes és a jelentése
illik a kérdéshez. A játék nem találgat, csak a felsoroltakat fogadja el. Azt, hogy a névelő elhagyható-e,
kérdésenként kell beállítani (névelő-gyakorlásnál soha).

Rossz válasznál mutasd meg a helyes megoldást, a „?” buborékban rövid magyar magyarázattal.
