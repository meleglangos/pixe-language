# Asset-katalógus

> Generálva: `python3 tools/asset_catalog/build.py`. Ne szerkeszd kézzel: a leírások a
> `tools/asset_catalog/notes.py`-ban vannak, a gépi adatok (méret, képkockák) a fájlokból jönnek.
> Előnézetek: `assets/previews/`. Útvonalak az `assets/` mappához képest.

## Összefoglaló

| Csomag | Mappa | Mi van benne | Mire jó nálunk | Licenc / credit |
| --- | --- | --- | --- | --- |
| **Pixel Crawler – Free Pack (Exterior 0.1)**, Anokolisa | `pixel-crawler/` | 16 px-es fantasy készlet: tilesetek (dungeon, sziklafal, padló, víz), propok (bútor, edény, növény, szikla, kristály, szerszám), fák, épületelemek, tűz- és kemence-animációk, szörnyek (csontvázak, orkok), NPC-k, kézben tartott fegyverek | **A játék fő grafikai csomagja.** Dungeonök, szörnyek, a játékos karakter, a világ propjai | Szabadon használható kereskedelmi és nem kereskedelmi projektben, módosítható; a csomag maga nem adható el. Credit nem kötelező, de kérik: *Pixel Crawler by Anokolisa* (`Terms.txt`) |
| **16x16 Weapon RPG Icons**, Shade | `weapons/` | 4 anyag (bronz, vas, acél, arany) × 480 fegyver ikon, 24 fegyvertípus × 10 változat | Fegyver loot, inventory, bolt, gear-ikonok a rarity létrához | A csomagban nincs licencfájl; a letöltési oldalon kell ellenőrizni. Credit: *16x16 Weapon RPG Icons by Shade* |
| **Items16**, Glionox | `items/` | 1244 egyedi 16×16 ikon: fegyverek, páncél, ruha, étel, drágakő, érc, könyv, kulcs, hangszer, hal, virág, szörny-alapanyag | Páncél-ikonok, HP-ital, loot, meglepetés-tárgyak, bolt | A csomagban nincs licencfájl; a letöltési oldalon kell ellenőrizni. Credit: *Items16 by Glionox* |
| **Modern Interiors – Free v2.2**, LimeZu | `modern-interiors/` | Modern belső tér (bútor, konyha, fürdő, iroda), szobaépítő (falak, padlók), 4 modern karakter | A későbbi **ház rendszerhez**. Fantasy dungeonbe nem illik | **Csak nem kereskedelmi célra.** Credit: *Modern Interiors by LimeZu*, https://limezu.itch.io/moderninteriors |

A játékban használt kivágások nevei és koordinátái: `src/data/assets.js` (`frames`, `strips`).
A credit a játékban: Menü → „Mitwirkende” (`src/data/config.js` → `credits`).

### Gyors kereső

| Ha ezt keresed… | …itt nézd |
| --- | --- |
| dungeon fal, padló, ajtó, rács, fáklyafény | `pc:tilesets/dungeon-tiles` |
| barlang / bánya sziklafal, kőpadló, föld | `pc:tilesets/wall-tiles`, `pc:tilesets/floors-tiles` |
| víz, tó, sziget | `pc:tilesets/water-tiles` |
| koporsó, szobor, zászló, fali fegyver | `pc:dungeon-props` |
| láda, hordó, korsó, lánc, sín, lámpás, fa szerkezetek | `pc:furniture` |
| kristály, szikla, érc | `pc:rocks` |
| szén, gerenda, deszka, kulcs, láda szénnel | `pc:resources` |
| bájital, tekercs, könyv | `pc:esoteric` és Items16 |
| tűz, tábortűz, kemence, üllő | Pixel Crawler → Munkaállomások |
| szörny (idle / futás / halál) | Pixel Crawler → Szörnyek |
| fegyver ikon (anyag szerint) | `wp:*` |
| páncél, sisak, csizma, étel, kulcs, drágakő ikon | Items16 (sorszám-tartományok lent) |
| modern bútor, szoba | Modern Interiors |

## Számok

| Csomag | Képfájl | Leírt tétel |
| --- | ---: | ---: |
| Pixel Crawler (Anokolisa) | 181 | 181 |
| 16x16 Weapon RPG Icons (Shade) | 5 | 5 |
| Items16 (Glionox) | 1244 | 1244 |
| Modern Interiors – Free (LimeZu) | 64 | 64 |

## Tartalom

- **Pixel Crawler (Anokolisa)**
  - [Karakter alaptest (Body_A) animációk](#pc-karakter) (42)
  - [NPC-k](#pc-npc) (19)
  - [Szörnyek (csontvázak, orkok)](#pc-szorny) (24)
  - [Tilesetek (padló, fal, víz, dungeon)](#pc-tileset) (5)
  - [Fák](#pc-fa) (15)
  - [Animált propok (serpenyők)](#pc-prop-animalt) (5)
  - [Dekoráció / propok (atlaszok)](#pc-prop) (11)
  - [Épületek (falak, tetők, belső tér)](#pc-epulet) (6)
  - [Munkaállomások (tűz, kemence, üllő...)](#pc-allomas) (50)
  - [Fegyver-sprite-ok (kézben tartott)](#pc-fegyver) (3)
  - [Mintakép](#pc-mockup) (1)
- **16x16 Weapon RPG Icons (Shade)**
  - [Fegyver ikonok (4 anyag × 480)](#wp-fegyver-ikon) (4)
  - [A csomag saját áttekintő képe](#wp-attekintes) (1)
- **Items16 (Glionox)**
  - [Tárgy ikonok (1244 db, 16×16)](#it-ikon) (1244)
- **Modern Interiors – Free (LimeZu)**
  - [Karakterek (Adam, Alex, Amelia, Bob)](#mi-karakter) (32)
  - [RPG Maker MV formátum](#mi-rpgmaker) (1)
  - [Belső tér és szobaépítő, 16×16](#mi-belso-16) (2)
  - [Ugyanez 32×32 és 48×48 felbontásban](#mi-belso-nagy) (4)
  - [A csomag saját áttekintő képe](#mi-attekintes) (1)
  - [Régi (Old) tilesetek és karakter](#mi-regi) (24)

---

## Pixel Crawler (Anokolisa)

Útvonal: `pixel-crawler/Pixel Crawler - Free Pack/`. Minden PNG mellett ott van az `.aseprite` forrásfájl is
(193 db, ezeket a katalógus nem sorolja fel). A rács 16 px. Az animációk egysoros csíkok,
a karakterek és szörnyek **csak jobbra néznek** (balra tükrözni kell), kivéve a Body_A alaptestet,
aminek van le / oldal / fel iránya.

<a id="pc-karakter"></a>
### Karakter alaptest (Body_A) animációk

**Ruha és haj nélküli alaptest** (kopasz, meztelen figura): rétegezéshez készült, önmagában nem használható játékos-karakternek.
Minden mozdulat 3 irányban (down / side / up), 64×64-es kockák. A side jobbra néz.

Előnézet: [`previews/pc-karakter.png`](previews/pc-karakter.png)

| Azonosító | Fájl | Méret | Képkockák | Leírás | Címkék |
| --- | --- | --- | --- | --- | --- |
| `pc:body/carry-idle-down` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Characters/Body_A/Animations/Carry_Idle/Carry_Idle_Down-Sheet.png` | 256×64 | 4 kocka, 64×64 | Alaptest áll, valamit visz | karakter, alaptest, cipel, animáció |
| `pc:body/carry-idle-side` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Characters/Body_A/Animations/Carry_Idle/Carry_Idle_Side-Sheet.png` | 256×64 | 4 kocka, 64×64 | Alaptest áll, valamit visz | karakter, alaptest, cipel, animáció |
| `pc:body/carry-idle-up` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Characters/Body_A/Animations/Carry_Idle/Carry_Idle_Up-Sheet.png` | 256×64 | 4 kocka, 64×64 | Alaptest áll, valamit visz | karakter, alaptest, cipel, animáció |
| `pc:body/carry-run-down` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Characters/Body_A/Animations/Carry_Run/Carry_Run_Down-Sheet.png` | 384×64 | 6 kocka, 64×64 | Alaptest fut, valamit visz | karakter, alaptest, cipel, animáció |
| `pc:body/carry-run-side` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Characters/Body_A/Animations/Carry_Run/Carry_Run_Side-Sheet.png` | 384×64 | 6 kocka, 64×64 | Alaptest fut, valamit visz | karakter, alaptest, cipel, animáció |
| `pc:body/carry-run-up` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Characters/Body_A/Animations/Carry_Run/Carry_Run_Up-Sheet.png` | 384×64 | 6 kocka, 64×64 | Alaptest fut, valamit visz | karakter, alaptest, cipel, animáció |
| `pc:body/carry-walk-down` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Characters/Body_A/Animations/Carry_Walk/Carry_Walk_Down-Sheet.png` | 384×64 | 6 kocka, 64×64 | Alaptest sétál, valamit visz | karakter, alaptest, cipel, animáció |
| `pc:body/carry-walk-side` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Characters/Body_A/Animations/Carry_Walk/Carry_Walk_Side-Sheet.png` | 384×64 | 6 kocka, 64×64 | Alaptest sétál, valamit visz | karakter, alaptest, cipel, animáció |
| `pc:body/carry-walk-up` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Characters/Body_A/Animations/Carry_Walk/Carry_Walk_Up-Sheet.png` | 384×64 | 6 kocka, 64×64 | Alaptest sétál, valamit visz | karakter, alaptest, cipel, animáció |
| `pc:body/collect-down` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Characters/Body_A/Animations/Collect_Base/Collect_Down-Sheet.png` | 512×64 | 8 kocka, 64×64 | Alaptest felvesz / gyűjt | karakter, alaptest, gyűjtés, animáció |
| `pc:body/collect-side` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Characters/Body_A/Animations/Collect_Base/Collect_Side-Sheet.png` | 512×64 | 8 kocka, 64×64 | Alaptest felvesz / gyűjt | karakter, alaptest, gyűjtés, animáció |
| `pc:body/collect-up` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Characters/Body_A/Animations/Collect_Base/Collect_Up-Sheet.png` | 512×64 | 8 kocka, 64×64 | Alaptest felvesz / gyűjt | karakter, alaptest, gyűjtés, animáció |
| `pc:body/crush-down` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Characters/Body_A/Animations/Crush_Base/Crush_Down-Sheet.png` | 512×64 | 8 kocka, 64×64 | Alaptest zúzó támadás (kalapács) | karakter, alaptest, támadás, animáció |
| `pc:body/crush-side` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Characters/Body_A/Animations/Crush_Base/Crush_Side-Sheet.png` | 512×64 | 8 kocka, 64×64 | Alaptest zúzó támadás (kalapács) | karakter, alaptest, támadás, animáció |
| `pc:body/crush-up` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Characters/Body_A/Animations/Crush_Base/Crush_Up-Sheet.png` | 512×64 | 8 kocka, 64×64 | Alaptest zúzó támadás (kalapács) | karakter, alaptest, támadás, animáció |
| `pc:body/death-down` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Characters/Body_A/Animations/Death_Base/Death_Down-Sheet.png` | 512×64 | 8 kocka, 64×64 | Alaptest meghal | karakter, alaptest, halál, animáció |
| `pc:body/death-side` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Characters/Body_A/Animations/Death_Base/Death_Side-Sheet.png` | 512×64 | 8 kocka, 64×64 | Alaptest meghal | karakter, alaptest, halál, animáció |
| `pc:body/death-up` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Characters/Body_A/Animations/Death_Base/Death_Up-Sheet.png` | 512×64 | 8 kocka, 64×64 | Alaptest meghal | karakter, alaptest, halál, animáció |
| `pc:body/fishing-down` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Characters/Body_A/Animations/Fishing_Base/Fishing_Down-Sheet.png` | 512×64 | 8 kocka, 64×64 | Alaptest horgászik | karakter, alaptest, horgászat, animáció |
| `pc:body/fishing-side` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Characters/Body_A/Animations/Fishing_Base/Fishing_Side-Sheet.png` | 512×64 | 8 kocka, 64×64 | Alaptest horgászik | karakter, alaptest, horgászat, animáció |
| `pc:body/fishing-up` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Characters/Body_A/Animations/Fishing_Base/Fishing_Up-Sheet.png` | 512×64 | 8 kocka, 64×64 | Alaptest horgászik | karakter, alaptest, horgászat, animáció |
| `pc:body/hit-down` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Characters/Body_A/Animations/Hit_Base/Hit_Down-Sheet.png` | 256×64 | 4 kocka, 64×64 | Alaptest sebződik | karakter, alaptest, sebződés, animáció |
| `pc:body/hit-side` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Characters/Body_A/Animations/Hit_Base/Hit_Side-Sheet.png` | 256×64 | 4 kocka, 64×64 | Alaptest sebződik | karakter, alaptest, sebződés, animáció |
| `pc:body/hit-up` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Characters/Body_A/Animations/Hit_Base/Hit_Up-Sheet.png` | 256×64 | 4 kocka, 64×64 | Alaptest sebződik | karakter, alaptest, sebződés, animáció |
| `pc:body/idle-down` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Characters/Body_A/Animations/Idle_Base/Idle_Down-Sheet.png` | 256×64 | 4 kocka, 64×64 | Alaptest áll (idle) | karakter, alaptest, idle, animáció |
| `pc:body/idle-side` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Characters/Body_A/Animations/Idle_Base/Idle_Side-Sheet.png` | 256×64 | 4 kocka, 64×64 | Alaptest áll (idle) | karakter, alaptest, idle, animáció |
| `pc:body/idle-up` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Characters/Body_A/Animations/Idle_Base/Idle_Up-Sheet.png` | 256×64 | 4 kocka, 64×64 | Alaptest áll (idle) | karakter, alaptest, idle, animáció |
| `pc:body/pierce-down` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Characters/Body_A/Animations/Pierce_Base/Pierce_Down-Sheet.png` | 512×64 | 8 kocka, 64×64 | Alaptest szúró támadás (lándzsa) | karakter, alaptest, támadás, animáció |
| `pc:body/pierce-side` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Characters/Body_A/Animations/Pierce_Base/Pierce_Side-Sheet.png` | 512×64 | 8 kocka, 64×64 | Alaptest szúró támadás (lándzsa) | karakter, alaptest, támadás, animáció |
| `pc:body/pierce-top` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Characters/Body_A/Animations/Pierce_Base/Pierce_Top-Sheet.png` | 512×64 | 8 kocka, 64×64 | Alaptest szúró támadás (lándzsa) | karakter, alaptest, támadás, animáció |
| `pc:body/run-down` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Characters/Body_A/Animations/Run_Base/Run_Down-Sheet.png` | 384×64 | 6 kocka, 64×64 | Alaptest fut | karakter, alaptest, futás, animáció |
| `pc:body/run-side` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Characters/Body_A/Animations/Run_Base/Run_Side-Sheet.png` | 384×64 | 6 kocka, 64×64 | Alaptest fut | karakter, alaptest, futás, animáció |
| `pc:body/run-up` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Characters/Body_A/Animations/Run_Base/Run_Up-Sheet.png` | 384×64 | 6 kocka, 64×64 | Alaptest fut | karakter, alaptest, futás, animáció |
| `pc:body/slice-down` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Characters/Body_A/Animations/Slice_Base/Slice_Down-Sheet.png` | 512×64 | 8 kocka, 64×64 | Alaptest vágó támadás (kard) | karakter, alaptest, támadás, animáció |
| `pc:body/slice-side` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Characters/Body_A/Animations/Slice_Base/Slice_Side-Sheet.png` | 512×64 | 8 kocka, 64×64 | Alaptest vágó támadás (kard) | karakter, alaptest, támadás, animáció |
| `pc:body/slice-up` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Characters/Body_A/Animations/Slice_Base/Slice_Up-Sheet.png` | 512×64 | 8 kocka, 64×64 | Alaptest vágó támadás (kard) | karakter, alaptest, támadás, animáció |
| `pc:body/walk-down` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Characters/Body_A/Animations/Walk_Base/Walk_Down-Sheet.png` | 384×64 | 6 kocka, 64×64 | Alaptest sétál | karakter, alaptest, séta, animáció |
| `pc:body/walk-side` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Characters/Body_A/Animations/Walk_Base/Walk_Side-Sheet.png` | 384×64 | 6 kocka, 64×64 | Alaptest sétál | karakter, alaptest, séta, animáció |
| `pc:body/walk-up` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Characters/Body_A/Animations/Walk_Base/Walk_Up-Sheet.png` | 384×64 | 6 kocka, 64×64 | Alaptest sétál | karakter, alaptest, séta, animáció |
| `pc:body/watering-down` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Characters/Body_A/Animations/Watering_Base/Watering_Down-Sheet.png` | 512×64 | 8 kocka, 64×64 | Alaptest locsol | karakter, alaptest, farm, animáció |
| `pc:body/watering-side` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Characters/Body_A/Animations/Watering_Base/Watering_Side-Sheet.png` | 512×64 | 8 kocka, 64×64 | Alaptest locsol | karakter, alaptest, farm, animáció |
| `pc:body/watering-up` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Characters/Body_A/Animations/Watering_Base/Watering_Up-Sheet.png` | 512×64 | 8 kocka, 64×64 | Alaptest locsol | karakter, alaptest, farm, animáció |

<a id="pc-npc"></a>
### NPC-k

A játékos jelenleg a `npc/citizen-f/tavern-a` (barna hajú lány, idle + walk, csak oldalnézet). A `*-hold` változatok
valamit tartanak a kezükben. A Knight / Rogue / Wizzard ugyanolyan formátumú, mint a szörnyek (idle 32×32).

Előnézet: [`previews/pc-npc.png`](previews/pc-npc.png)

| Azonosító | Fájl | Méret | Képkockák | Leírás | Címkék |
| --- | --- | --- | --- | --- | --- |
| `pc:npc/citizen-f/peasant-a/idle` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Npc's/Citizen_F/Peasant_A/Idle/Idle-Sheet.png` | 256×64 | 4 kocka, 64×64 | Paraszt lány (zöld haj, fehér ing) áll | npc, nő, idle, animáció |
| `pc:npc/citizen-f/peasant-a/walk` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Npc's/Citizen_F/Peasant_A/Walk/Walk-Sheet.png` | 384×64 | 6 kocka, 64×64 | Paraszt lány sétál | npc, nő, séta, animáció |
| `pc:npc/citizen-f/tavern-a/idle-side` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Npc's/Citizen_F/Tavern_A/Idle/Idle_Side-Sheet.png` | 256×64 | 4 kocka, 64×64 | Kocsmáros lány (barna haj, bordó felső, zöld szoknya) áll — **a játékos karaktere** | npc, nő, játékos, idle, animáció, használt |
| `pc:npc/citizen-f/tavern-a/idle-hold/idle-side` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Npc's/Citizen_F/Tavern_A/Idle_Hold/Idle_Side-Sheet.png` | 256×64 | 4 kocka, 64×64 | Kocsmáros lány áll, tálcát tart | npc, nő, idle, tart, animáció |
| `pc:npc/citizen-f/tavern-a/walk-side` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Npc's/Citizen_F/Tavern_A/Walk/Walk_Side-Sheet.png` | 384×64 | 6 kocka, 64×64 | Kocsmáros lány sétál — **a játékos karaktere** | npc, nő, játékos, séta, animáció, használt |
| `pc:npc/citizen-f/tavern-a/walk-hold/walk-side` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Npc's/Citizen_F/Tavern_A/Walk_Hold/Walk_Side-Sheet.png` | 384×64 | 6 kocka, 64×64 | Kocsmáros lány sétál, tálcát tart | npc, nő, séta, tart, animáció |
| `pc:npc/citizen-f/tavern-b/idle-side` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Npc's/Citizen_F/Tavern_B/Idle/Idle_Side-Sheet.png` | 256×64 | 4 kocka, 64×64 | Kocsmáros lány B (sötétebb haj) áll | npc, nő, idle, animáció |
| `pc:npc/citizen-f/tavern-b/idle-hold/idle-side` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Npc's/Citizen_F/Tavern_B/Idle_Hold/Idle_Side-Sheet.png` | 256×64 | 4 kocka, 64×64 | Kocsmáros lány B áll, tálcát tart | npc, nő, idle, tart, animáció |
| `pc:npc/citizen-f/tavern-b/walk-side` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Npc's/Citizen_F/Tavern_B/Walk/Walk_Side-Sheet.png` | 384×64 | 6 kocka, 64×64 | Kocsmáros lány B sétál | npc, nő, séta, animáció |
| `pc:npc/citizen-f/tavern-b/walk-hold/walk-side` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Npc's/Citizen_F/Tavern_B/Walk_Hold/Walk_Side-Sheet.png` | 384×64 | 6 kocka, 64×64 | Kocsmáros lány B sétál, tálcát tart | npc, nő, séta, tart, animáció |
| `pc:npc/knight/death` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Npc's/Knight/Death/Death-Sheet.png` | 288×32 | 6 kocka, 48×32 | Lovag meghal | npc, lovag, halál, animáció |
| `pc:npc/knight/idle` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Npc's/Knight/Idle/Idle-Sheet.png` | 128×32 | 4 kocka, 32×32 | Lovag kék páncélban, áll | npc, lovag, idle, animáció |
| `pc:npc/knight/run` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Npc's/Knight/Run/Run-Sheet.png` | 384×64 | 6 kocka, 64×64 | Lovag fut | npc, lovag, futás, animáció |
| `pc:npc/rogue/death` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Npc's/Rogue/Death/Death-Sheet.png` | 384×32 | 6 kocka, 64×32 | Kapucnis zsivány meghal | npc, zsivány, halál, animáció |
| `pc:npc/rogue/idle` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Npc's/Rogue/Idle/Idle-Sheet.png` | 128×32 | 4 kocka, 32×32 | Kapucnis zsivány (zöld köpeny), áll | npc, zsivány, idle, animáció |
| `pc:npc/rogue/run` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Npc's/Rogue/Run/Run-Sheet.png` | 384×64 | 6 kocka, 64×64 | Kapucnis zsivány fut | npc, zsivány, futás, animáció |
| `pc:npc/wizzard/death` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Npc's/Wizzard/Death/Death-Sheet.png` | 384×32 | 6 kocka, 64×32 | Varázsló meghal | npc, varázsló, halál, animáció |
| `pc:npc/wizzard/idle` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Npc's/Wizzard/Idle/Idle-Sheet.png` | 128×32 | 4 kocka, 32×32 | Varázsló (lila süveg, fehér szakáll), áll | npc, varázsló, idle, animáció |
| `pc:npc/wizzard/run` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Npc's/Wizzard/Run/Run-Sheet.png` | 384×64 | 6 kocka, 64×64 | Varázsló fut | npc, varázsló, futás, animáció |

<a id="pc-szorny"></a>
### Szörnyek (csontvázak, orkok)

Minden szörnynek 3 animációja van: **idle** (32×32, 4 kocka, jobbra néz), **run** (64×64, 6 kocka), **death** (eltérő méret).
A játékban: kripta = csontváz → zsivány → harcos, bánya = ork → felderítő → harcos (`src/data/dungeons.js`).
Még nem használt: `skel-mage` (piros köpenyes mágus), `orc-shaman` (sámán). A csontvázak death animációjának
utolsó kockái csontkupacként is jók (a kriptában így használjuk).

Előnézet: [`previews/pc-szorny.png`](previews/pc-szorny.png)

| Azonosító | Fájl | Méret | Képkockák | Leírás | Címkék |
| --- | --- | --- | --- | --- | --- |
| `pc:orc-rogue/death` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Mobs/Orc Crew/Orc - Rogue/Death/Death-Sheet.png` | 384×64 | 6 kocka, 64×64 | Ork felderítő meghal | szörny, ork, halál, animáció |
| `pc:orc-rogue/idle` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Mobs/Orc Crew/Orc - Rogue/Idle/Idle-Sheet.png` | 128×32 | 4 kocka, 32×32 | Ork felderítő (barna sapka), áll — bánya 2. szörny | szörny, ork, idle, animáció, használt |
| `pc:orc-rogue/run` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Mobs/Orc Crew/Orc - Rogue/Run/Run-Sheet.png` | 384×64 | 6 kocka, 64×64 | Ork felderítő fut | szörny, ork, futás, animáció |
| `pc:orc-shaman/death` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Mobs/Orc Crew/Orc - Shaman/Death/Death-Sheet.png` | 448×64 | 7 kocka, 64×64 | Ork sámán meghal | szörny, ork, mágus, halál, animáció |
| `pc:orc-shaman/idle` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Mobs/Orc Crew/Orc - Shaman/Idle/Idle-Sheet.png` | 128×32 | 4 kocka, 32×32 | Ork sámán piros csuklyában, áll (még nem használt — boss-jelölt) | szörny, ork, mágus, idle, animáció |
| `pc:orc-shaman/run` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Mobs/Orc Crew/Orc - Shaman/Run/Run-Sheet.png` | 384×64 | 6 kocka, 64×64 | Ork sámán fut | szörny, ork, mágus, futás, animáció |
| `pc:orc-warrior/death` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Mobs/Orc Crew/Orc - Warrior/Death/Death-Sheet.png` | 576×80 | 6 kocka, 96×80 | Ork harcos meghal (nagyobb, 96×80-as kockák) | szörny, ork, halál, animáció |
| `pc:orc-warrior/idle` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Mobs/Orc Crew/Orc - Warrior/Idle/Idle-Sheet.png` | 128×32 | 4 kocka, 32×32 | Ork harcos kék páncélban, fejszével, áll — bánya 3. szörny | szörny, ork, páncélos, idle, animáció, használt |
| `pc:orc-warrior/run` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Mobs/Orc Crew/Orc - Warrior/Run/Run-Sheet.png` | 384×64 | 6 kocka, 64×64 | Ork harcos fut | szörny, ork, futás, animáció |
| `pc:orc/death` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Mobs/Orc Crew/Orc/Death/Death-Sheet.png` | 384×64 | 6 kocka, 64×64 | Ork meghal | szörny, ork, halál, animáció |
| `pc:orc/idle` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Mobs/Orc Crew/Orc/Idle/Idle-Sheet.png` | 128×32 | 4 kocka, 32×32 | Ork (zöld, barna ruha), áll — bánya 1. szörny | szörny, ork, idle, animáció, használt |
| `pc:orc/run` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Mobs/Orc Crew/Orc/Run/Run-Sheet.png` | 384×64 | 6 kocka, 64×64 | Ork fut | szörny, ork, futás, animáció |
| `pc:skel-base/death` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Mobs/Skeleton Crew/Skeleton - Base/Death/Death-Sheet.png` | 768×64 | 8 kocka, 96×64 | Csontváz (alap) szétesik; az utolsó kockák csontkupacnak is jók | szörny, csontváz, halál, animáció, használt |
| `pc:skel-base/idle` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Mobs/Skeleton Crew/Skeleton - Base/Idle/Idle-Sheet.png` | 128×32 | 4 kocka, 32×32 | Csontváz (alap), áll — kripta 1. szörny | szörny, csontváz, idle, animáció, használt |
| `pc:skel-base/run` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Mobs/Skeleton Crew/Skeleton - Base/Run/Run-Sheet.png` | 384×64 | 6 kocka, 64×64 | Csontváz (alap) fut | szörny, csontváz, futás, animáció |
| `pc:skel-mage/death` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Mobs/Skeleton Crew/Skeleton - Mage/Death/Death-Sheet.png` | 384×64 | 6 kocka, 64×64 | Csontváz mágus meghal | szörny, csontváz, mágus, halál, animáció |
| `pc:skel-mage/idle` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Mobs/Skeleton Crew/Skeleton - Mage/Idle/Idle-Sheet.png` | 128×32 | 4 kocka, 32×32 | Csontváz mágus piros köpenyben, áll (még nem használt — boss-jelölt) | szörny, csontváz, mágus, idle, animáció |
| `pc:skel-mage/run` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Mobs/Skeleton Crew/Skeleton - Mage/Run/Run-Sheet.png` | 384×64 | 6 kocka, 64×64 | Csontváz mágus fut | szörny, csontváz, mágus, futás, animáció |
| `pc:skel-rogue/death` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Mobs/Skeleton Crew/Skeleton - Rogue/Death/Death-Sheet.png` | 384×64 | 6 kocka, 64×64 | Csontváz zsivány meghal | szörny, csontváz, halál, animáció |
| `pc:skel-rogue/idle` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Mobs/Skeleton Crew/Skeleton - Rogue/Idle/Idle-Sheet.png` | 128×32 | 4 kocka, 32×32 | Csontváz zsivány piros csuklyában, áll — kripta 2. szörny | szörny, csontváz, idle, animáció, használt |
| `pc:skel-rogue/run` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Mobs/Skeleton Crew/Skeleton - Rogue/Run/Run-Sheet.png` | 384×64 | 6 kocka, 64×64 | Csontváz zsivány fut | szörny, csontváz, futás, animáció |
| `pc:skel-warrior/death` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Mobs/Skeleton Crew/Skeleton - Warrior/Death/Death-Sheet.png` | 384×48 | 6 kocka, 64×48 | Csontváz harcos meghal | szörny, csontváz, halál, animáció |
| `pc:skel-warrior/idle` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Mobs/Skeleton Crew/Skeleton - Warrior/Idle/Idle-Sheet.png` | 128×32 | 4 kocka, 32×32 | Csontváz harcos kék páncélban, áll — kripta 3. szörny | szörny, csontváz, páncélos, idle, animáció, használt |
| `pc:skel-warrior/run` | `pixel-crawler/Pixel Crawler - Free Pack/Entities/Mobs/Skeleton Crew/Skeleton - Warrior/Run/Run-Sheet.png` | 384×64 | 6 kocka, 64×64 | Csontváz harcos fut | szörny, csontváz, futás, animáció |

<a id="pc-tileset"></a>
### Tilesetek (padló, fal, víz, dungeon)

**Fontos régiók (oszlop, sor; mezőben):**

- `dungeon-tiles`: falperem (0–2, 0), téglafal (0–2, 1–2), padló 3×3 minta (4–6, 0–2), padló-változatok (4–7, 3),
  boltív nyitva (0–1, 10–12), faajtó (0–1, 7–9), leeresztett rács (2–3, 7–9), tüskecsapda (4, 7–10),
  padlórács (7–8, 10–11), vérfolt (9, 11), lépcső (9, 14–15), színes fénytócsák: piros (0–2, 19–21), kék (3–5, 19–21), zöld (6–8, 19–21),
  borostyán / moha (10–13, 0–9), színes zászlós oszlopok (0–8, 15–17).
- `wall-tiles`: három színben (barna 0–5, szürke 6–11, sötétbarna 12–17 oszlop): sziklás „sziget” perem (0–4. sor),
  szikla homlokzat (5–9), hó/fű szél (8–11), rétegzett sziklafal (16–18), **gödör / barlang perem** (19–24; belseje sötét).
  A bánya a szürke készletet használja.
- `floors-tiles`: fű (0–4), kavicsos kő (5–9), föld (10–14) átmenetes 3×3 mintákkal; téglafal (15–18, 0–4);
  hó és homok foltok (12–25. sor).
- `water-tiles`: animált víz 4 kockában (5×5-ös blokkok: (0,5), (5,5), (0,10), (5,10)), szigetek fűvel (0–4. sor).
- `wall-variations`: magas barna / szürke sziklafalak, fa-gerendás falak.

Előnézet: [`previews/pc-tileset-dungeon-tiles.png`](previews/pc-tileset-dungeon-tiles.png), [`previews/pc-tileset-floors-tiles.png`](previews/pc-tileset-floors-tiles.png), [`previews/pc-tileset-wall-tiles.png`](previews/pc-tileset-wall-tiles.png), [`previews/pc-tileset-wall-variations.png`](previews/pc-tileset-wall-variations.png), [`previews/pc-tileset-water-tiles.png`](previews/pc-tileset-water-tiles.png)

| Azonosító | Fájl | Méret | Képkockák | Leírás | Címkék |
| --- | --- | --- | --- | --- | --- |
| `pc:tilesets/dungeon-tiles` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Tilesets/Dungeon_Tiles.png` | 400×400 | – | Dungeon tileset: kőfal, padló, boltív, faajtó, rács, csapda, fénytócsák, moha, zászlós oszlopok — a kripta alapja · [előnézet](previews/pc-tileset-dungeon-tiles.png) | tileset, dungeon, fal, padló, ajtó, használt |
| `pc:tilesets/floors-tiles` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Tilesets/Floors_Tiles.png` | 400×416 | – | Padló tileset: fű, kavicsos kő, föld (átmenetekkel), téglafal, hó és homok foltok · [előnézet](previews/pc-tileset-floors-tiles.png) | tileset, padló, fű, kő, föld, használt |
| `pc:tilesets/wall-tiles` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Tilesets/Wall_Tiles.png` | 400×400 | – | Sziklafal tileset 3 színben: sziklaperem, homlokzat, rétegzett fal, barlang-gödör perem — a bánya alapja · [előnézet](previews/pc-tileset-wall-tiles.png) | tileset, szikla, barlang, fal, használt |
| `pc:tilesets/wall-variations` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Tilesets/Wall_Variations.png` | 256×480 | – | Magas sziklafal- és gerendafal-változatok · [előnézet](previews/pc-tileset-wall-variations.png) | tileset, fal, szikla |
| `pc:tilesets/water-tiles` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Tilesets/Water_tiles.png` | 400×400 | – | Víz tileset: 4 kockás vízanimáció, füves szigetek · [előnézet](previews/pc-tileset-water-tiles.png) | tileset, víz, animált, használt |

<a id="pc-fa"></a>
### Fák

Előnézet: [`previews/pc-fa.png`](previews/pc-fa.png)

| Azonosító | Fájl | Méret | Képkockák | Leírás | Címkék |
| --- | --- | --- | --- | --- | --- |
| `pc:trees/model-01/size-02` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Props/Static/Trees/Model_01/Size_02.png` | 256×128 | – | Lombos kerek fa 5 évszak-változatban (zöld, sárga, narancs, kopasz, havas); a méret a fájlnévben | fa, lombos, évszak, világtérkép |
| `pc:trees/model-01/size-03` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Props/Static/Trees/Model_01/Size_03.png` | 208×192 | – | Lombos kerek fa 5 évszak-változatban (zöld, sárga, narancs, kopasz, havas); a méret a fájlnévben | fa, lombos, évszak, világtérkép |
| `pc:trees/model-01/size-04` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Props/Static/Trees/Model_01/Size_04.png` | 368×256 | – | Lombos kerek fa 5 évszak-változatban (zöld, sárga, narancs, kopasz, havas); a méret a fájlnévben | fa, lombos, évszak, világtérkép |
| `pc:trees/model-01/size-05` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Props/Static/Trees/Model_01/Size_05.png` | 448×368 | – | Lombos kerek fa 5 évszak-változatban (zöld, sárga, narancs, kopasz, havas); a méret a fájlnévben | fa, lombos, évszak, világtérkép |
| `pc:trees/model-02/size-02` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Props/Static/Trees/Model_02/Size_02.png` | 128×96 | – | Fenyő, sötét és világos zöld + kopasz változat | fa, fenyő, világtérkép |
| `pc:trees/model-02/size-03` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Props/Static/Trees/Model_02/Size_03.png` | 144×160 | – | Fenyő, sötét és világos zöld + kopasz változat | fa, fenyő, világtérkép |
| `pc:trees/model-02/size-04` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Props/Static/Trees/Model_02/Size_04.png` | 192×224 | – | Fenyő, sötét és világos zöld + kopasz változat | fa, fenyő, világtérkép |
| `pc:trees/model-02/size-05` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Props/Static/Trees/Model_02/Size_05.png` | 288×320 | – | Fenyő, sötét és világos zöld + kopasz változat | fa, fenyő, világtérkép |
| `pc:trees/model-03/size-02` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Props/Static/Trees/Model_03/Size_02.png` | 128×160 | – | Magas nyírfaszerű fa: zöld, sárga, piros őszi, kopasz | fa, nyír, évszak, világtérkép |
| `pc:trees/model-03/size-03-export` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Props/Static/Trees/Model_03/Size_03-export.png` | 192×288 | – | Magas nyírfaszerű fa (export-változat, a nem-export fájllal szinte azonos) | fa, nyír, duplikátum |
| `pc:trees/model-03/size-03` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Props/Static/Trees/Model_03/Size_03.png` | 192×288 | – | Magas nyírfaszerű fa: zöld, sárga, piros őszi, kopasz | fa, nyír, évszak, világtérkép |
| `pc:trees/model-03/size-04-export-export` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Props/Static/Trees/Model_03/Size_04-export-export.png` | 288×416 | – | Magas nyírfaszerű fa (export-változat, a nem-export fájllal szinte azonos) | fa, nyír, duplikátum |
| `pc:trees/model-03/size-04-export` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Props/Static/Trees/Model_03/Size_04-export.png` | 288×416 | – | Magas nyírfaszerű fa (export-változat, a nem-export fájllal szinte azonos) | fa, nyír, duplikátum |
| `pc:trees/model-03/size-04` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Props/Static/Trees/Model_03/Size_04.png` | 400×416 | – | Magas nyírfaszerű fa: zöld, sárga, piros őszi, kopasz | fa, nyír, évszak, világtérkép |
| `pc:trees/model-03/size-05` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Props/Static/Trees/Model_03/Size_05.png` | 384×512 | – | Magas nyírfaszerű fa: zöld, sárga, piros őszi, kopasz | fa, nyír, évszak, világtérkép |

<a id="pc-prop-animalt"></a>
### Animált propok (serpenyők)

Előnézet: [`previews/pc-prop-animalt.png`](previews/pc-prop-animalt.png)

| Azonosító | Fájl | Méret | Képkockák | Leírás | Címkék |
| --- | --- | --- | --- | --- | --- |
| `pc:props/animated/pan-01` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Props/Animated/Pan_01-Sheet.png` | 128×32 | 4 kocka, 32×32 | Üst kék folyadékkal, fortyog | animált, konyha, bájital |
| `pc:props/animated/pan-02` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Props/Animated/Pan_02-Sheet.png` | 64×32 | 4 kocka, 16×32 | Kis üst kék folyadékkal, fortyog | animált, konyha, bájital |
| `pc:props/animated/pan-03` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Props/Animated/Pan_03-Sheet.png` | 384×32 | 12 kocka, 32×32 | Serpenyő, sül benne valami | animált, konyha |
| `pc:props/animated/pan-04` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Props/Animated/Pan_04-Sheet.png` | 128×32 | 4 kocka, 32×32 | Fazék fedővel, rotyog | animált, konyha |
| `pc:props/animated/pan-05` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Props/Animated/Pan_05-Sheet.png` | 256×32 | 8 kocka, 32×32 | Serpenyő tojással | animált, konyha |

<a id="pc-prop"></a>
### Dekoráció / propok (atlaszok)

Atlaszok, egy fájlban sok kis tárgy. A pontos kivágást az előnézet ráccsal és számokkal mutatja.

Előnézet: [`previews/pc-prop-dungeon-props.png`](previews/pc-prop-dungeon-props.png), [`previews/pc-prop-esoteric.png`](previews/pc-prop-esoteric.png), [`previews/pc-prop-farm.png`](previews/pc-prop-farm.png), [`previews/pc-prop-furniture.png`](previews/pc-prop-furniture.png), [`previews/pc-prop-meat.png`](previews/pc-prop-meat.png), [`previews/pc-prop-pan.png`](previews/pc-prop-pan.png), [`previews/pc-prop-resources.png`](previews/pc-prop-resources.png), [`previews/pc-prop-rocks.png`](previews/pc-prop-rocks.png), [`previews/pc-prop-shadows.png`](previews/pc-prop-shadows.png), [`previews/pc-prop-tools.png`](previews/pc-prop-tools.png), [`previews/pc-prop-vegetation.png`](previews/pc-prop-vegetation.png)

| Azonosító | Fájl | Méret | Képkockák | Leírás | Címkék |
| --- | --- | --- | --- | --- | --- |
| `pc:dungeon-props` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Props/Static/Dungeon_Props.png` | 400×400 | – | Dungeon propok: koporsók, szobor, kínzópadok, fali fegyvertartók, színes zászlók, kőpad · [előnézet](previews/pc-prop-dungeon-props.png) | dekoráció, dungeon, koporsó, zászló, használt |
| `pc:esoteric` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Props/Static/Esoteric.png` | 400×400 | – | Ezoterikus: bájitalok (üvegcsék több méretben), lombikok, tekercsek, könyvek, toll, kristálytartó állvány · [előnézet](previews/pc-prop-esoteric.png) | dekoráció, bájital, mágia, könyv |
| `pc:farm` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Props/Static/Farm.png` | 400×400 | – | Farm: magos zsákok, zöldségek növekedési fázisokban, termény-ládák, madárijesztő, kerítés, ágyások · [előnézet](previews/pc-prop-farm.png) | dekoráció, farm, növény, étel |
| `pc:furniture` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Props/Static/Furniture.png` | 800×864 | – | Bútor és kellék: asztalok, szekrények, ajtók, ablakok, kerítések, **sínek**, pallók, lámpaoszlop, lámpás, gerendák, hordók, korsók, vödrök, **láda (nyitott / csukott)**, lánc · [előnézet](previews/pc-prop-furniture.png) | dekoráció, bútor, láda, hordó, sín, lámpa, használt |
| `pc:meat` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Props/Static/Meat.png` | 192×144 | – | Hús és étel: nyers / sült hús, csirke, hal, kolbász, kosár gyümölccsel · [előnézet](previews/pc-prop-meat.png) | dekoráció, étel, hús |
| `pc:pan` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Props/Static/Pan.png` | 160×176 | – | Edények: lábasok, fazekak, serpenyők, üstök, evőeszközök, bárd · [előnézet](previews/pc-prop-pan.png) | dekoráció, konyha, edény |
| `pc:resources` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Props/Static/Resources.png` | 400×400 | – | Nyersanyagok: szén, ércrögök, kulcsok, gerendák, deszkák, farakás, ládák (üres / szénnel) · [előnézet](previews/pc-prop-resources.png) | dekoráció, nyersanyag, szén, fa, használt |
| `pc:rocks` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Props/Static/Rocks.png` | 208×304 | – | Sziklák (barna, szürke, sötét) több méretben, kavicsok, ércrögök (réz, ezüst, arany), **kék kristályok** · [előnézet](previews/pc-prop-rocks.png) | dekoráció, szikla, kristály, érc, használt |
| `pc:shadows` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Props/Static/Shadows.png` | 400×400 | – | Árnyék-foltok (ellipszis, lomb) tárgyak és fák alá · [előnézet](previews/pc-prop-shadows.png) | árnyék, effekt |
| `pc:tools` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Props/Static/Tools.png` | 400×400 | – | Szerszámok: kalapácsok, fogók, csavarkulcsok, fűrészek, festőhenger, üllő, köszörű, mérőeszközök · [előnézet](previews/pc-prop-tools.png) | dekoráció, szerszám, kovács, használt |
| `pc:vegetation` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Props/Static/Vegetation.png` | 400×432 | – | Növényzet: bokrok 4 évszak-színben, palánták, páfrányok, gyékény, virágok, száraz ágak, gombák, kövek · [előnézet](previews/pc-prop-vegetation.png) | dekoráció, növény, bokor, virág, gomba |

<a id="pc-epulet"></a>
### Épületek (falak, tetők, belső tér)

Előnézet: [`previews/pc-epulet-interior-props-01.png`](previews/pc-epulet-interior-props-01.png), [`previews/pc-epulet-interior-walls-01.png`](previews/pc-epulet-interior-walls-01.png), [`previews/pc-epulet-props.png`](previews/pc-epulet-props.png), [`previews/pc-epulet-roofs.png`](previews/pc-epulet-roofs.png), [`previews/pc-epulet-shadows.png`](previews/pc-epulet-shadows.png), [`previews/pc-epulet-walls.png`](previews/pc-epulet-walls.png)

| Azonosító | Fájl | Méret | Képkockák | Leírás | Címkék |
| --- | --- | --- | --- | --- | --- |
| `pc:buildings/interior-props-01` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Buildings/Interior/Interior_Props_01.png` | 608×384 | – | Belső tér kellékek: asztalok, székek, ágyak, kandalló, tűzhely, polcok, edények, növények, szőnyegek · [előnézet](previews/pc-epulet-interior-props-01.png) | épület, belső tér, bútor, konyha |
| `pc:buildings/interior-walls-01` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Buildings/Interior/Interior_Walls_01.png` | 912×656 | – | Belső falak (rönk, kő, deszka, vakolt), padlók (parketta, kő), belső tetőszerkezet · [előnézet](previews/pc-epulet-interior-walls-01.png) | épület, belső tér, fal, padló |
| `pc:buildings/props` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Buildings/Props.png` | 400×400 | – | Épület-kellékek: boltíves ajtók, faajtók, ablakok zsalugáterrel, kémény, pad, virágláda, kerítés · [előnézet](previews/pc-epulet-props.png) | épület, ajtó, ablak |
| `pc:buildings/roofs` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Buildings/Roofs.png` | 400×400 | – | Tetők: barna zsindely, zöld cserép, üvegtető; oromzatok, ereszek · [előnézet](previews/pc-epulet-roofs.png) | épület, tető, ház |
| `pc:buildings/shadows` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Buildings/Shadows.png` | 400×400 | – | Épületek árnyékai · [előnézet](previews/pc-epulet-shadows.png) | épület, árnyék |
| `pc:buildings/walls` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Buildings/Walls.png` | 672×800 | – | Épület külső falak: rönkfal, deszkafal, vakolt fal téglával; ajtós és ablakos szakaszok · [előnézet](previews/pc-epulet-walls.png) | épület, fal, ház |

<a id="pc-allomas"></a>
### Munkaállomások (tűz, kemence, üllő...)

Ezek többsége animáció. A `bonfire-01…10` különböző tüzek (tábortűz, parázs, rönk, tűztál, grill); a `fire-01` nagy láng,
a `fire-02` kis láng (fáklyához). A kemencék (furnace) `stone`, `iron`, `bricks` változatban, 3 méretben.
A képkocka-számok automatikus becslések; nagy lapoknál (alchemy, anvil, sawmill) érdemes ránézni az előnézetre.

Előnézet: [`previews/pc-allomas.png`](previews/pc-allomas.png)

| Azonosító | Fájl | Méret | Képkockák | Leírás | Címkék |
| --- | --- | --- | --- | --- | --- |
| `pc:stations/alchemy-table-01` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Stations/Alchemy/Alchemy_Table_01-Sheet.png` | 192×704 | 11 kocka, 192×64 | Alkimista asztal animációk (lombikok, fortyogó üvegek) | alkímia, bájital, animált |
| `pc:stations/alchemy-table-02` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Stations/Alchemy/Alchemy_Table_02-Sheet.png` | 528×320 | 5 kocka, 528×64 | Alkimista asztal animációk (lombikok, fortyogó üvegek) | alkímia, bájital, animált |
| `pc:stations/alchemy-table-03` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Stations/Alchemy/Alchemy_Table_03-Sheet.png` | 400×400 | 5 kocka, 400×80 | Alkimista asztal animációk (lombikok, fortyogó üvegek) | alkímia, bájital, animált |
| `pc:stations/anvil` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Stations/Anvil/Anvil.png` | 272×160 | – | Üllők és kovácsszerszámok állóképei | kovács, üllő, atlasz |
| `pc:stations/anvil-01` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Stations/Anvil/Anvil_01-Sheet.png` | 512×400 | 40 kocka, 64×80 | Kovácsműhely animációk (üllő, munkapad) | kovács, üllő, animált |
| `pc:stations/anvil-02` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Stations/Anvil/Anvil_02-Sheet.png` | 480×480 | 36 kocka, 80×80 | Kovácsműhely animációk (üllő, munkapad) | kovács, üllő, animált |
| `pc:stations/anvil-03` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Stations/Anvil/Anvil_03-Sheet.png` | 768×560 | 5 kocka, 768×112 | Kovácsműhely animációk (üllő, munkapad) | kovács, üllő, animált |
| `pc:stations/bonfire` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Stations/Bonfire/Bonfire.png` | 64×384 | – | A tábortüzek állapotai egy oszlopban (állókép-atlasz) | tűz, atlasz |
| `pc:stations/bonfire-01` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Stations/Bonfire/Bonfire_01-Sheet.png` | 128×32 | 4 kocka, 32×32 | Kő tűztál parázzsal — a kriptában és a bányában | tűz, tűztál, animált, használt |
| `pc:stations/bonfire-02` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Stations/Bonfire/Bonfire_02-Sheet.png` | 128×32 | 4 kocka, 32×32 | Kövekkel körbe rakott tábortűz | tűz, tábortűz, animált |
| `pc:stations/bonfire-03` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Stations/Bonfire/Bonfire_03-Sheet.png` | 128×32 | 4 kocka, 32×32 | Égő rönk | tűz, animált |
| `pc:stations/bonfire-04` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Stations/Bonfire/Bonfire_04-Sheet.png` | 128×32 | 4 kocka, 32×32 | Izzó tuskó | tűz, animált |
| `pc:stations/bonfire-05` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Stations/Bonfire/Bonfire_05-Sheet.png` | 128×32 | 4 kocka, 32×32 | Parázsló tábortűz kövekkel | tűz, parázs, animált |
| `pc:stations/bonfire-06` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Stations/Bonfire/Bonfire_06-Sheet.png` | 128×32 | 4 kocka, 32×32 | Izzó hasáb | tűz, animált |
| `pc:stations/bonfire-07` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Stations/Bonfire/Bonfire_07-Sheet.png` | 128×32 | 4 kocka, 32×32 | Szétszórt parázs | tűz, parázs, animált |
| `pc:stations/bonfire-08` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Stations/Bonfire/Bonfire_08-Sheet.png` | 128×32 | 4 kocka, 32×32 | Parázs-folt | tűz, parázs, animált |
| `pc:stations/bonfire-09` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Stations/Bonfire/Bonfire_09-Sheet.png` | 320×32 | 4 kocka, 80×32 | Hosszú kő parázstartó (grill alap) | tűz, parázs, animált |
| `pc:stations/bonfire-10` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Stations/Bonfire/Bonfire_10-Sheet.png` | 192×32 | 4 kocka, 48×32 | Kő tűzhely-doboz parázzsal | tűz, parázs, animált |
| `pc:stations/bonfire/fire-01` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Stations/Bonfire/Fire_01-Sheet.png` | 128×48 | 4 kocka, 32×48 | Nagy láng — a tűztálakon használjuk | tűz, láng, animált, használt |
| `pc:stations/bonfire/fire-02` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Stations/Bonfire/Fire_02-Sheet.png` | 128×48 | 4 kocka, 32×48 | Kis láng — a fali fáklyákon használjuk | tűz, láng, fáklya, animált, használt |
| `pc:stations/bonfire/smoke` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Stations/Bonfire/Smoke-Sheet.png` | 128×48 | 4 kocka, 32×48 | Füst | füst, animált, effekt |
| `pc:stations/cooking-station/butchery-01` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Stations/Cooking Station/Butchery/Butchery_01-Sheet.png` | 64×64 | – | Hentesállvány húsokkal | konyha, hús |
| `pc:stations/cooking-station/butchery-02` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Stations/Cooking Station/Butchery/Butchery_02.png` | 64×64 | – | Hentesállvány húsokkal | konyha, hús |
| `pc:stations/cooking-station/butchery-03` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Stations/Cooking Station/Butchery/Butchery_03.png` | 80×80 | – | Hentesállvány húsokkal | konyha, hús |
| `pc:stations/cooking-station/butchery-04` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Stations/Cooking Station/Butchery/Butchery_04.png` | 80×80 | – | Hentesállvány húsokkal | konyha, hús |
| `pc:stations/cooking-station/cooker-01` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Stations/Cooking Station/Cooker/Cooker_01.png` | 64×64 | – | Üres nyárs-állvány | konyha |
| `pc:stations/cooking-station/cooker-02` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Stations/Cooking Station/Cooker/Cooker_02.png` | 64×64 | – | Üres nyárs-állvány | konyha |
| `pc:stations/cooking-station/cooker-03` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Stations/Cooking Station/Cooker/Cooker_03-Sheet.png` | 192×32 | 4 kocka, 48×32 | Kő tűzhely / sütő | konyha, tűz, animált |
| `pc:stations/cooking-station/cooker-04` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Stations/Cooking Station/Cooker/Cooker_04-Sheet.png` | 320×80 | 4 kocka, 80×80 | Kő tűzhely / sütő | konyha, tűz, animált |
| `pc:stations/cooking-station` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Stations/Cooking Station/Cooking Station.png` | 288×224 | – | Főzőállomás alkatrészei egy atlaszban | konyha, atlasz |
| `pc:stations/cooking-station/estructure` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Stations/Cooking Station/Estructure.png` | 288×224 | – | Főzőállomás váza (állvány, nyárs) | konyha, atlasz |
| `pc:stations/cooking-station/grill-01` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Stations/Cooking Station/Grill/Grill_01-Sheet.png` | 256×64 | 4 kocka, 64×64 | Nyárson sülő hús a tűz fölött | konyha, tűz, animált |
| `pc:stations/cooking-station/grill-02` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Stations/Cooking Station/Grill/Grill_02-Sheet.png` | 256×64 | 4 kocka, 64×64 | Nyárson sülő hús a tűz fölött | konyha, tűz, animált |
| `pc:stations/cooking-station/grill-03` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Stations/Cooking Station/Grill/Grill_03-Sheet.png` | 256×64 | 4 kocka, 64×64 | Nyárson sülő hús a tűz fölött | konyha, tűz, animált |
| `pc:stations/cooking-station/grill-04` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Stations/Cooking Station/Grill/Grill_04-Sheet.png` | 320×64 | 4 kocka, 80×64 | Nyárson sülő hús a tűz fölött | konyha, tűz, animált |
| `pc:stations/furnace/bricks-01` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Stations/Furnace/Bricks_01-Sheet.png` | 64×96 | 4 kocka, 32×48 | Tégla kemence (méret a számban) | kemence, tégla, animált |
| `pc:stations/furnace/bricks-02` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Stations/Furnace/Bricks_02-Sheet.png` | 96×128 | 4 kocka, 48×64 | Tégla kemence (méret a számban) | kemence, tégla, animált |
| `pc:stations/furnace/bricks-03` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Stations/Furnace/Bricks_03-Sheet.png` | 96×128 | 2 kocka, 96×64 | Tégla kemence (méret a számban) | kemence, tégla, animált |
| `pc:stations/furnace` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Stations/Furnace/Furnace.png` | 192×384 | – | Kemencék állóképei egy atlaszban | kemence, atlasz |
| `pc:stations/furnace/iron-01` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Stations/Furnace/Iron_01-Sheet.png` | 64×96 | 2 kocka, 64×48 | Vas kemence / olvasztó (méret a számban) | kemence, vas, animált |
| `pc:stations/furnace/iron-02` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Stations/Furnace/Iron_02-Sheet.png` | 96×128 | 4 kocka, 48×64 | Vas kemence / olvasztó (méret a számban) | kemence, vas, animált |
| `pc:stations/furnace/iron-03` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Stations/Furnace/Iron_03-Sheet.png` | 96×128 | – | Vas kemence / olvasztó (méret a számban) | kemence, vas, animált |
| `pc:stations/furnace/stone-01` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Stations/Furnace/Stone_01-Sheet.png` | 64×96 | 2 kocka, 64×48 | Kő kemence (méret a számban) | kemence, kő, animált |
| `pc:stations/furnace/stone-02` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Stations/Furnace/Stone_02-Sheet.png` | 96×128 | 4 kocka, 48×64 | Kő kemence, izzó — a bányában használjuk | kemence, kő, animált, használt |
| `pc:stations/furnace/stone-03` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Stations/Furnace/Stone_03-Sheet.png` | 96×128 | 4 kocka, 48×64 | Kő kemence (méret a számban) | kemence, kő, animált |
| `pc:stations/sawmill/base` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Stations/Sawmill/Base.png` | 256×144 | – | Fűrésztelep alkatrészei | fűrészmalom, atlasz |
| `pc:stations/sawmill/level-1` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Stations/Sawmill/Level_1.png` | 32×32 | – | Fűrészbak rönkkel | fűrészmalom |
| `pc:stations/sawmill/level-2` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Stations/Sawmill/Level_2-Sheet.png` | 640×512 | 8 kocka, 640×64 | Fűrésztelep animáció (nagyobb szint) | fűrészmalom, animált |
| `pc:stations/sawmill/level-3` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Stations/Sawmill/Level_3-Sheet.png` | 896×640 | 8 kocka, 896×80 | Fűrésztelep animáció (nagyobb szint) | fűrészmalom, animált |
| `pc:stations/workbench` | `pixel-crawler/Pixel Crawler - Free Pack/Environment/Structures/Stations/Workbench/Workbench.png` | 192×352 | – | Munkapadok, eszközök | munkapad, atlasz |

<a id="pc-fegyver"></a>
### Fegyver-sprite-ok (kézben tartott)

**Kézben tartott** fegyver-sprite-ok (nem ikonok) három anyagban: csont, fa, plusz kezek. Később a játékos kezébe
vagy a szörnyekhez rétegként. Mindhárom lapon ugyanaz az elrendezés: kard, lándzsa, kalapács, fejsze, íj, pajzs, bot.

Előnézet: [`previews/pc-fegyver-bone.png`](previews/pc-fegyver-bone.png), [`previews/pc-fegyver-hands.png`](previews/pc-fegyver-hands.png), [`previews/pc-fegyver-wood.png`](previews/pc-fegyver-wood.png)

| Azonosító | Fájl | Méret | Képkockák | Leírás | Címkék |
| --- | --- | --- | --- | --- | --- |
| `pc:weapons/bone` | `pixel-crawler/Pixel Crawler - Free Pack/Weapons/Bone/Bone.png` | 224×144 | – | Csont fegyverek kézbe: kardok, buzogány, lándzsa, íjak, pajzsok, bot · [előnézet](previews/pc-fegyver-bone.png) | fegyver, csont, sprite |
| `pc:weapons/hands` | `pixel-crawler/Pixel Crawler - Free Pack/Weapons/Hands/Hands.png` | 32×96 | – | Kezek (fegyver-rétegek alá) · [előnézet](previews/pc-fegyver-hands.png) | kéz, sprite |
| `pc:weapons/wood` | `pixel-crawler/Pixel Crawler - Free Pack/Weapons/Wood/Wood.png` | 192×112 | – | Fa fegyverek kézbe: kard, kalapács, fejsze, lándzsa, íjak, pajzsok, bot · [előnézet](previews/pc-fegyver-wood.png) | fegyver, fa, sprite |

<a id="pc-mockup"></a>
### Mintakép

| Azonosító | Fájl | Méret | Képkockák | Leírás | Címkék |
| --- | --- | --- | --- | --- | --- |
| `pc:mockups/tavern` | `pixel-crawler/Pixel Crawler - Free Pack/MockUps/Tavern.png` | 1280×1280 | – | Mintajelenet: kocsma belső tere a csomag elemeiből | mintakép, kocsma |

---

## 16x16 Weapon RPG Icons (Shade)

Útvonal: `weapons/16x16 Weapons RPG Icons/`. Négy egyforma elrendezésű lap (bronze, iron, steel, gold),
mindegyik 24 oszlop × 20 sor, 16×16-os ikonokkal (lapnként 480, összesen 1920).
Egy ikon azonosítása: **anyag + oszlop + sor**, pl. `wp:steel c3 r5` = acél kard (3. oszlop, 5. sor),
kivágás: x = oszlop × 16, y = sor × 16.

<a id="wp-fegyver-ikon"></a>
### Fegyver ikonok (4 anyag × 480)

**Oszlopok** (mind a négy anyagnál ugyanaz; soronként 10 változat, egyre díszesebb):

| Oszlop | Sor 0–9 (felső fél) | Sor 10–19 (alsó fél) |
| --- | --- | --- |
| 0–2 | vékony kard / rapír | fejsze (kézi, csata-, kétélű) |
| 3–5 | egykezes kard | 3: bunkó, 4: tüskés buzogány, 5: buzogány |
| 6–8 | nagy / kétkezes kard | 6: kés, 7: díszes tőr, 8: rövid bárd |
| 9–11 | katana / hosszú vékony penge | 9–11: bárd, hentesbárd |
| 12–14 | szablya / szamurájkard (14: horgas penge) | 12–13: csákány, 14: kasza |
| 15–17 | 15: lándzsa, 16: díszes lándzsa, 17: alabárd | 15–17: sarló / horog |
| 18–20 | 18: pálca, 19: bot, 20: varázsbot (csavart) | 18–20: íj, visszacsapó íj |
| 21–23 | díszes fokos / szigony-buzogány | 21: kalapács, 22: harci kalapács, 23: pöröly |

Előnézet: [`previews/wp-fegyver-ikon-bronze.png`](previews/wp-fegyver-ikon-bronze.png), [`previews/wp-fegyver-ikon-gold.png`](previews/wp-fegyver-ikon-gold.png), [`previews/wp-fegyver-ikon-iron.png`](previews/wp-fegyver-ikon-iron.png), [`previews/wp-fegyver-ikon-steel.png`](previews/wp-fegyver-ikon-steel.png)

| Azonosító | Fájl | Méret | Képkockák | Leírás | Címkék |
| --- | --- | --- | --- | --- | --- |
| `wp:bronze` | `weapons/16x16 Weapons RPG Icons/bronze-weapons.png` | 384×320 | – | Bronz fegyver ikonok, 480 db (24 típus × 10) · [előnézet](previews/wp-fegyver-ikon-bronze.png) | fegyver, ikon, bronz |
| `wp:gold` | `weapons/16x16 Weapons RPG Icons/gold-weapons.png` | 384×320 | – | Arany fegyver ikonok, 480 db · [előnézet](previews/wp-fegyver-ikon-gold.png) | fegyver, ikon, arany |
| `wp:iron` | `weapons/16x16 Weapons RPG Icons/iron-weapons.png` | 384×320 | – | Vas fegyver ikonok, 480 db · [előnézet](previews/wp-fegyver-ikon-iron.png) | fegyver, ikon, vas |
| `wp:steel` | `weapons/16x16 Weapons RPG Icons/steel-weapons.png` | 384×320 | – | Acél fegyver ikonok, 480 db · [előnézet](previews/wp-fegyver-ikon-steel.png) | fegyver, ikon, acél |

<a id="wp-attekintes"></a>
### A csomag saját áttekintő képe

| Azonosító | Fájl | Méret | Képkockák | Leírás | Címkék |
| --- | --- | --- | --- | --- | --- |
| `wp:all-assets-preview` | `weapons/16x16 Weapons RPG Icons/all-assets-preview.png` | 768×640 | – | A szerző áttekintő képe mind a 4 anyagról (nem játékba való) | áttekintő |

---

## Items16 (Glionox)

Útvonal: `items/itemN.png` (N = 1…1244), mind 16×16. A számozás témák szerint halad, ezért
sorszám-tartományokkal írjuk le. Egy konkrét ikont az előnézeti lapon a száma alapján találsz meg.

<a id="it-ikon"></a>
### Tárgy ikonok (1244 db, 16×16)

**Sorszám-tartományok** (`items/itemN.png`; a határok kb.-k, egy-két szomszédos ikon átlóghat):

| Tartomány | Tartalom | Címkék |
| --- | --- | --- |
| 1–20 | kardok (különböző anyagok, mágikus pengék) | fegyver, kard |
| 21–39 | csákányok | szerszám, csákány |
| 40–76 | fejszék, kalapácsok, buzogányok | fegyver, szerszám, fejsze, kalapács |
| 77–91 | lapátok | szerszám, lapát |
| 92–106 | kapák, csákányok (díszes) | szerszám |
| 107–114 | sarlók, kaszák | szerszám, kasza |
| 115–130 | lándzsák | fegyver, lándzsa |
| 131–146 | botok, buzogányok, varázspálcák | fegyver, mágia |
| 147–152 | íjak, számszeríjak | fegyver, távolsági |
| 153–165 | nyílvesszők | lőszer |
| 166–170 | érmek, kitüntetések | jutalom, medál |
| 171–185 | szigonyok, vasvillák | fegyver, szigony |
| 186–190 | horgászbotok | horgászat |
| 191–196 | vegyes fegyverek (lándzsa, fáklya, kés) | fegyver |
| 197–200 | pajzsok | páncél, pajzs |
| 201–219 | sisakok, kalapok, korona, koponya-sisak | páncél, fejfedő |
| 220–240 | mellvértek, köpenyek, ruhák | páncél, test |
| 241–260 | nadrágok, lábvértek | páncél, láb |
| 261–278 | csizmák, cipők | páncél, láb |
| 279–295 | vegyes ruhadarabok, kesztyűk | ruha, kesztyű |
| 296–321 | sisakok, maszkok, kalapok, kapucnik | páncél, fejfedő, maszk |
| 322–528 | ételek: gyümölcs, zöldség, pékáru, hús, hal, sütemény, édesség, ital | étel, HP-töltő |
| 529–560 | drágakövek, kristályok | kincs, drágakő |
| 561–572 | fémrudak (ingot) | alapanyag, fém |
| 573–592 | ércek, kőzetek | alapanyag, érc |
| 593–602 | vegyes alapanyagok (moha, jég, lánc, gyöngy, toll, bomba) | alapanyag |
| 603–624 | ajándékok, karácsonyi tárgyak | ünnep, ajándék, meglepetés |
| 625–664 | könyvek, tekercsek, térképek, levelek, toll | papír, könyv, tekercs |
| 665–688 | zsákok, erszények, kincsek, szív | zsák, kincs |
| 689–712 | kulcsok, kötél, szerszámok | kulcs, szerszám |
| 713–768 | ládák, fáklyák, tábortűz, lámpás, láncok, zászlók, iránytű | felszerelés, kaland |
| 769–794 | vegyes, sakkfigurák, dobókocka, kártya | játék, vegyes |
| 795–811 | konyhai eszközök, edények, bögrék | konyha |
| 812–832 | tőrök, amulettek, ékszerek | fegyver, ékszer |
| 833–864 | hangszerek (gitár, lant, trombita, hárfa, dob) | hangszer |
| 865–880 | gyűrűk, korona, köpenyek, varázslósüvegek, kristálygömb | ékszer, mágia |
| 881–900 | varázspálcák, botok | mágia, fegyver |
| 901–904 | bájitalok | bájital, HP-ital |
| 905–928 | vegyes (kulcs, dobócsillag, elsősegélydoboz) | vegyes |
| 929–960 | csavarok, fogaskerekek, alkatrészek | alkatrész (modern) |
| 961–987 | elektronika, áramkörök, kütyük | elektronika (modern, nem illik ide) |
| 988–1024 | fa, rönk, levelek, gyógynövények, makk | alapanyag, növény |
| 1025–1043 | virágok | növény, virág, ajándék |
| 1044–1088 | halak, tengeri élőlények | hal |
| 1089–1119 | kagylók, korall, horgok, úszók, mentőöv | tenger, horgászat |
| 1120–1145 | kőzet- és ércdarabok, ásványok | alapanyag |
| 1146–1155 | vödrök folyadékkal | vödör |
| 1156–1163 | érmék, pénz, aranyrudak | arany, pénz |
| 1164–1244 | szörny-alapanyagok: csont, koponya, szem, toll, karom, fog, szerv, nyálka, pókháló | szörny, loot, alapanyag |

Páncél-ikonokhoz: 197–321 (pajzs, sisak, mellvért, nadrág, csizma, kesztyű). HP-italhoz: 901–904 és az ételek.

Előnézet: [`previews/it-ikon-1-256.png`](previews/it-ikon-1-256.png), [`previews/it-ikon-257-512.png`](previews/it-ikon-257-512.png), [`previews/it-ikon-513-768.png`](previews/it-ikon-513-768.png), [`previews/it-ikon-769-1024.png`](previews/it-ikon-769-1024.png), [`previews/it-ikon-1025-1244.png`](previews/it-ikon-1025-1244.png)

---

## Modern Interiors – Free (LimeZu)

Útvonal: `modern-interiors/Modern tiles_Free/`. Minden belső tér lap három felbontásban van
(16, 32, 48 px); nálunk a **16×16** illik a többi csomaghoz. Az ingyenes verzió a teljes csomag kb. 1%-a.
**Licenc: csak nem kereskedelmi célra** (`LICENSE.txt`).

<a id="mi-karakter"></a>
### Karakterek (Adam, Alex, Amelia, Bob)

Modern ruhás karakterek, 16×32-es kockák. Irány-sorrend a csíkokon: jobb, fel, bal, le.

Előnézet: [`previews/mi-karakter.png`](previews/mi-karakter.png)

| Azonosító | Fájl | Méret | Képkockák | Leírás | Címkék |
| --- | --- | --- | --- | --- | --- |
| `mi:adam` | `modern-interiors/Modern tiles_Free/Characters_free/Adam_16x16.png` | 384×224 | 168 kocka, 16×32 (teljes karakterlap: 24 oszlop × 7 sor) | Teljes karakterlap (áll, sétál, ül, telefonál stb. egyben) | modern, karakter, atlasz |
| `mi:adam-idle` | `modern-interiors/Modern tiles_Free/Characters_free/Adam_idle_16x16.png` | 64×32 | 4 kocka, 16×32 (4 irány, 1-1 kocka (jobb, fel, bal, le)) | Áll, egy kocka irányonként | modern, karakter, idle |
| `mi:adam-idle-anim` | `modern-interiors/Modern tiles_Free/Characters_free/Adam_idle_anim_16x16.png` | 384×32 | 24 kocka, 16×32 (4 irány × 6 kocka (jobb, fel, bal, le)) | Áll, pislog / mozog | modern, karakter, idle, animáció |
| `mi:adam-phone` | `modern-interiors/Modern tiles_Free/Characters_free/Adam_phone_16x16.png` | 144×32 | 9 kocka, 16×32 (telefonálás) | Telefonál | modern, karakter, animáció |
| `mi:adam-run` | `modern-interiors/Modern tiles_Free/Characters_free/Adam_run_16x16.png` | 384×32 | 24 kocka, 16×32 (4 irány × 6 kocka (jobb, fel, bal, le)) | Sétál / fut | modern, karakter, séta, animáció |
| `mi:adam-sit2` | `modern-interiors/Modern tiles_Free/Characters_free/Adam_sit2_16x16.png` | 384×32 | 24 kocka, 16×32 (ülés (másik), 4 irány × 6) | Ül (széken / kanapén) | modern, karakter, ülés, animáció |
| `mi:adam-sit3` | `modern-interiors/Modern tiles_Free/Characters_free/Adam_sit3_16x16.png` | 192×32 | 12 kocka, 16×32 (ülés (harmadik), 2 irány × 6) | Ül (széken / kanapén) | modern, karakter, ülés, animáció |
| `mi:adam-sit` | `modern-interiors/Modern tiles_Free/Characters_free/Adam_sit_16x16.png` | 384×32 | 24 kocka, 16×32 (ülés, 4 irány × 6) | Ül (széken / kanapén) | modern, karakter, ülés, animáció |
| `mi:alex` | `modern-interiors/Modern tiles_Free/Characters_free/Alex_16x16.png` | 384×224 | 168 kocka, 16×32 (teljes karakterlap: 24 oszlop × 7 sor) | Teljes karakterlap (áll, sétál, ül, telefonál stb. egyben) | modern, karakter, atlasz |
| `mi:alex-idle` | `modern-interiors/Modern tiles_Free/Characters_free/Alex_idle_16x16.png` | 64×32 | 4 kocka, 16×32 (4 irány, 1-1 kocka (jobb, fel, bal, le)) | Áll, egy kocka irányonként | modern, karakter, idle |
| `mi:alex-idle-anim` | `modern-interiors/Modern tiles_Free/Characters_free/Alex_idle_anim_16x16.png` | 384×32 | 24 kocka, 16×32 (4 irány × 6 kocka (jobb, fel, bal, le)) | Áll, pislog / mozog | modern, karakter, idle, animáció |
| `mi:alex-phone` | `modern-interiors/Modern tiles_Free/Characters_free/Alex_phone_16x16.png` | 144×32 | 9 kocka, 16×32 (telefonálás) | Telefonál | modern, karakter, animáció |
| `mi:alex-run` | `modern-interiors/Modern tiles_Free/Characters_free/Alex_run_16x16.png` | 384×32 | 24 kocka, 16×32 (4 irány × 6 kocka (jobb, fel, bal, le)) | Sétál / fut | modern, karakter, séta, animáció |
| `mi:alex-sit2` | `modern-interiors/Modern tiles_Free/Characters_free/Alex_sit2_16x16.png` | 384×32 | 24 kocka, 16×32 (ülés (másik), 4 irány × 6) | Ül (széken / kanapén) | modern, karakter, ülés, animáció |
| `mi:alex-sit3` | `modern-interiors/Modern tiles_Free/Characters_free/Alex_sit3_16x16.png` | 192×32 | 12 kocka, 16×32 (ülés (harmadik), 2 irány × 6) | Ül (széken / kanapén) | modern, karakter, ülés, animáció |
| `mi:alex-sit` | `modern-interiors/Modern tiles_Free/Characters_free/Alex_sit_16x16.png` | 384×32 | 24 kocka, 16×32 (ülés, 4 irány × 6) | Ül (széken / kanapén) | modern, karakter, ülés, animáció |
| `mi:amelia` | `modern-interiors/Modern tiles_Free/Characters_free/Amelia_16x16.png` | 384×224 | 168 kocka, 16×32 (teljes karakterlap: 24 oszlop × 7 sor) | Teljes karakterlap (áll, sétál, ül, telefonál stb. egyben) | modern, karakter, atlasz |
| `mi:amelia-idle` | `modern-interiors/Modern tiles_Free/Characters_free/Amelia_idle_16x16.png` | 64×32 | 4 kocka, 16×32 (4 irány, 1-1 kocka (jobb, fel, bal, le)) | Áll, egy kocka irányonként | modern, karakter, idle |
| `mi:amelia-idle-anim` | `modern-interiors/Modern tiles_Free/Characters_free/Amelia_idle_anim_16x16.png` | 384×32 | 24 kocka, 16×32 (4 irány × 6 kocka (jobb, fel, bal, le)) | Áll, pislog / mozog | modern, karakter, idle, animáció |
| `mi:amelia-phone` | `modern-interiors/Modern tiles_Free/Characters_free/Amelia_phone_16x16.png` | 144×32 | 9 kocka, 16×32 (telefonálás) | Telefonál | modern, karakter, animáció |
| `mi:amelia-run` | `modern-interiors/Modern tiles_Free/Characters_free/Amelia_run_16x16.png` | 384×32 | 24 kocka, 16×32 (4 irány × 6 kocka (jobb, fel, bal, le)) | Sétál / fut | modern, karakter, séta, animáció |
| `mi:amelia-sit2` | `modern-interiors/Modern tiles_Free/Characters_free/Amelia_sit2_16x16.png` | 384×32 | 24 kocka, 16×32 (ülés (másik), 4 irány × 6) | Ül (széken / kanapén) | modern, karakter, ülés, animáció |
| `mi:amelia-sit3` | `modern-interiors/Modern tiles_Free/Characters_free/Amelia_sit3_16x16.png` | 192×32 | 12 kocka, 16×32 (ülés (harmadik), 2 irány × 6) | Ül (széken / kanapén) | modern, karakter, ülés, animáció |
| `mi:amelia-sit` | `modern-interiors/Modern tiles_Free/Characters_free/Amelia_sit_16x16.png` | 384×32 | 24 kocka, 16×32 (ülés, 4 irány × 6) | Ül (széken / kanapén) | modern, karakter, ülés, animáció |
| `mi:bob` | `modern-interiors/Modern tiles_Free/Characters_free/Bob_16x16.png` | 384×224 | 168 kocka, 16×32 (teljes karakterlap: 24 oszlop × 7 sor) | Teljes karakterlap (áll, sétál, ül, telefonál stb. egyben) | modern, karakter, atlasz |
| `mi:bob-idle` | `modern-interiors/Modern tiles_Free/Characters_free/Bob_idle_16x16.png` | 64×32 | 4 kocka, 16×32 (4 irány, 1-1 kocka (jobb, fel, bal, le)) | Áll, egy kocka irányonként | modern, karakter, idle |
| `mi:bob-idle-anim` | `modern-interiors/Modern tiles_Free/Characters_free/Bob_idle_anim_16x16.png` | 384×32 | 24 kocka, 16×32 (4 irány × 6 kocka (jobb, fel, bal, le)) | Áll, pislog / mozog | modern, karakter, idle, animáció |
| `mi:bob-phone` | `modern-interiors/Modern tiles_Free/Characters_free/Bob_phone_16x16.png` | 144×32 | 9 kocka, 16×32 (telefonálás) | Telefonál | modern, karakter, animáció |
| `mi:bob-run` | `modern-interiors/Modern tiles_Free/Characters_free/Bob_run_16x16.png` | 384×32 | 24 kocka, 16×32 (4 irány × 6 kocka (jobb, fel, bal, le)) | Sétál / fut | modern, karakter, séta, animáció |
| `mi:bob-sit2` | `modern-interiors/Modern tiles_Free/Characters_free/Bob_sit2_16x16.png` | 384×32 | 24 kocka, 16×32 (ülés (másik), 4 irány × 6) | Ül (széken / kanapén) | modern, karakter, ülés, animáció |
| `mi:bob-sit3` | `modern-interiors/Modern tiles_Free/Characters_free/Bob_sit3_16x16.png` | 192×32 | 12 kocka, 16×32 (ülés (harmadik), 2 irány × 6) | Ül (széken / kanapén) | modern, karakter, ülés, animáció |
| `mi:bob-sit` | `modern-interiors/Modern tiles_Free/Characters_free/Bob_sit_16x16.png` | 384×32 | 24 kocka, 16×32 (ülés, 4 irány × 6) | Ül (széken / kanapén) | modern, karakter, ülés, animáció |

<a id="mi-rpgmaker"></a>
### RPG Maker MV formátum

| Azonosító | Fájl | Méret | Képkockák | Leírás | Címkék |
| --- | --- | --- | --- | --- | --- |
| `mi:rpgmakermv/characters-mv` | `modern-interiors/Modern tiles_Free/Characters_free/RPGMAKERMV/Characters_MV.png` | 576×768 | – | A 4 karakter RPG Maker MV formátumban | modern, karakter, rpgmaker |

<a id="mi-belso-16"></a>
### Belső tér és szobaépítő, 16×16

**`interiors` fő régiói (sor, 16 px):** 0–9 fürdőszoba (kád, wc, zuhany, mosdó) · 10–28 szoba: ágy, asztal,
szőnyegek, könyvespolc, képek, ablak, függöny, ajtó · 29–35 konyhapult, székek · 36–43 iskola / iroda (pad, tábla,
földgömb, számítógép, hűtő) · 44–49 lila bútorok, cserepes növények, fényfüzér · 50–59 lámpák, szekrények, gyümölcstálak ·
60–66 konyha, csillár, gitár · 67–75 vázák, tükör, kandalló, könyvespolcok, kanapék · 76–88 fotelek, párnák, ágyak, tévéállvány.

**`room-builder`:** fal- és padlóminták (tapéták, fa, csempe, szőnyeg), szobaperem / plafon (0–3. sor).

Előnézet: [`previews/mi-belso-16-interiors.png`](previews/mi-belso-16-interiors.png), [`previews/mi-belso-16-room-builder.png`](previews/mi-belso-16-room-builder.png)

| Azonosító | Fájl | Méret | Képkockák | Leírás | Címkék |
| --- | --- | --- | --- | --- | --- |
| `mi:16x16/interiors` | `modern-interiors/Modern tiles_Free/Interiors_free/16x16/Interiors_free_16x16.png` | 256×1424 | – | Modern bútorok és tárgyak (fürdő, hálószoba, konyha, iroda, nappali) · [előnézet](previews/mi-belso-16-interiors.png) | modern, belső tér, bútor, ház |
| `mi:16x16/room-builder` | `modern-interiors/Modern tiles_Free/Interiors_free/16x16/Room_Builder_free_16x16.png` | 272×368 | – | Szobaépítő: falak, padlók, tapéták, szobaperem · [előnézet](previews/mi-belso-16-room-builder.png) | modern, belső tér, fal, padló, ház |

<a id="mi-belso-nagy"></a>
### Ugyanez 32×32 és 48×48 felbontásban

| Azonosító | Fájl | Méret | Képkockák | Leírás | Címkék |
| --- | --- | --- | --- | --- | --- |
| `mi:32x32/interiors-32x32` | `modern-interiors/Modern tiles_Free/Interiors_free/32x32/Interiors_free_32x32.png` | 512×2848 | – | Ugyanaz, mint a 16×16-os bútorlap, 2× felbontásban | modern, belső tér, nagy felbontás |
| `mi:32x32/room-builder-32x32` | `modern-interiors/Modern tiles_Free/Interiors_free/32x32/Room_Builder_free_32x32.png` | 544×736 | – | Szobaépítő 2× felbontásban | modern, belső tér, nagy felbontás |
| `mi:48x48/interiors-48x48` | `modern-interiors/Modern tiles_Free/Interiors_free/48x48/Interiors_free_48x48.png` | 768×4272 | – | Ugyanaz, mint a 16×16-os bútorlap, 3× felbontásban | modern, belső tér, nagy felbontás |
| `mi:48x48/room-builder-48x48` | `modern-interiors/Modern tiles_Free/Interiors_free/48x48/Room_Builder_free_48x48.png` | 816×1104 | – | Szobaépítő 3× felbontásban | modern, belső tér, nagy felbontás |

<a id="mi-attekintes"></a>
### A csomag saját áttekintő képe

| Azonosító | Fájl | Méret | Képkockák | Leírás | Címkék |
| --- | --- | --- | --- | --- | --- |
| `mi:free-overview` | `modern-interiors/Modern tiles_Free/free_overview.png` | 1886×1792 | – | A szerző áttekintő képe az ingyenes csomagról | áttekintő |

<a id="mi-regi"></a>
### Régi (Old) tilesetek és karakter

| Azonosító | Fájl | Méret | Képkockák | Leírás | Címkék |
| --- | --- | --- | --- | --- | --- |
| `mi:old/tileset-1` | `modern-interiors/Modern tiles_Free/Old/Tileset_16x16_1.png` | 160×160 | – | Régi (korábbi verziós) belső tér tileset; a szám a felbontás | modern, régi, tileset |
| `mi:old/tileset-16` | `modern-interiors/Modern tiles_Free/Old/Tileset_16x16_16.png` | 192×224 | – | Régi (korábbi verziós) belső tér tileset; a szám a felbontás | modern, régi, tileset |
| `mi:old/tileset-2` | `modern-interiors/Modern tiles_Free/Old/Tileset_16x16_2.png` | 160×160 | – | Régi (korábbi verziós) belső tér tileset; a szám a felbontás | modern, régi, tileset |
| `mi:old/tileset-3` | `modern-interiors/Modern tiles_Free/Old/Tileset_16x16_3.png` | 160×160 | – | Régi (korábbi verziós) belső tér tileset; a szám a felbontás | modern, régi, tileset |
| `mi:old/tileset-9` | `modern-interiors/Modern tiles_Free/Old/Tileset_16x16_9.png` | 160×160 | – | Régi (korábbi verziós) belső tér tileset; a szám a felbontás | modern, régi, tileset |
| `mi:old/tileset-32x32-1` | `modern-interiors/Modern tiles_Free/Old/Tileset_32x32_1.png` | 320×320 | – | Régi (korábbi verziós) belső tér tileset; a szám a felbontás | modern, régi, tileset |
| `mi:old/tileset-32x32-16` | `modern-interiors/Modern tiles_Free/Old/Tileset_32x32_16.png` | 384×448 | – | Régi (korábbi verziós) belső tér tileset; a szám a felbontás | modern, régi, tileset |
| `mi:old/tileset-32x32-2` | `modern-interiors/Modern tiles_Free/Old/Tileset_32x32_2.png` | 320×320 | – | Régi (korábbi verziós) belső tér tileset; a szám a felbontás | modern, régi, tileset |
| `mi:old/tileset-32x32-3` | `modern-interiors/Modern tiles_Free/Old/Tileset_32x32_3.png` | 320×320 | – | Régi (korábbi verziós) belső tér tileset; a szám a felbontás | modern, régi, tileset |
| `mi:old/tileset-32x32-9` | `modern-interiors/Modern tiles_Free/Old/Tileset_32x32_9.png` | 320×320 | – | Régi (korábbi verziós) belső tér tileset; a szám a felbontás | modern, régi, tileset |
| `mi:old/tileset-48x48-1` | `modern-interiors/Modern tiles_Free/Old/Tileset_48x48_1.png` | 480×480 | – | Régi (korábbi verziós) belső tér tileset; a szám a felbontás | modern, régi, tileset |
| `mi:old/tileset-48x48-16` | `modern-interiors/Modern tiles_Free/Old/Tileset_48x48_16.png` | 576×672 | – | Régi (korábbi verziós) belső tér tileset; a szám a felbontás | modern, régi, tileset |
| `mi:old/tileset-48x48-2` | `modern-interiors/Modern tiles_Free/Old/Tileset_48x48_2.png` | 480×480 | – | Régi (korábbi verziós) belső tér tileset; a szám a felbontás | modern, régi, tileset |
| `mi:old/tileset-48x48-3` | `modern-interiors/Modern tiles_Free/Old/Tileset_48x48_3.png` | 480×480 | – | Régi (korábbi verziós) belső tér tileset; a szám a felbontás | modern, régi, tileset |
| `mi:old/tileset-48x48-9` | `modern-interiors/Modern tiles_Free/Old/Tileset_48x48_9.png` | 480×480 | – | Régi (korábbi verziós) belső tér tileset; a szám a felbontás | modern, régi, tileset |
| `mi:old/idle-2` | `modern-interiors/Modern tiles_Free/Old/idle_16x16_2.png` | 64×32 | – | Régi karakter, áll | modern, régi, karakter |
| `mi:old/idle-32x32-2` | `modern-interiors/Modern tiles_Free/Old/idle_32x32_2.png` | 128×64 | – | Régi karakter, áll | modern, régi, karakter |
| `mi:old/idle-48x48-2` | `modern-interiors/Modern tiles_Free/Old/idle_48x48_2.png` | 192×96 | – | Régi karakter, áll | modern, régi, karakter |
| `mi:old/mv/character-2-rpgmaker` | `modern-interiors/Modern tiles_Free/Old/mv/Character_2_16x16_RPGMAKER.png` | 48×128 | – | Régi karakter RPG Maker formátumban | modern, régi, rpgmaker |
| `mi:old/mv/character-2-32x32-rpgmaker` | `modern-interiors/Modern tiles_Free/Old/mv/Character_2_32x32_RPGMAKER.png` | 96×256 | – | Régi karakter RPG Maker formátumban | modern, régi, rpgmaker |
| `mi:old/mv/character-2-48x48-rpgmaker` | `modern-interiors/Modern tiles_Free/Old/mv/Character_2_48x48_RPGMAKER.png` | 144×384 | – | Régi karakter RPG Maker formátumban | modern, régi, rpgmaker |
| `mi:old/run-horizontal-2` | `modern-interiors/Modern tiles_Free/Old/run_horizontal_16x16_2.png` | 384×32 | – | Régi karakter, oldalra fut | modern, régi, karakter, animáció |
| `mi:old/run-horizontal-32x32-2` | `modern-interiors/Modern tiles_Free/Old/run_horizontal_32x32_2.png` | 768×64 | – | Régi karakter, oldalra fut | modern, régi, karakter, animáció |
| `mi:old/run-horizontal-48x48-2` | `modern-interiors/Modern tiles_Free/Old/run_horizontal_48x48_2.png` | 1152×96 | – | Régi karakter, oldalra fut | modern, régi, karakter, animáció |

