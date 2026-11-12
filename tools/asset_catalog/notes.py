"""Kézzel írt leírások az asset-katalógushoz.

FILES: (regex a teljes útvonalra az assets/ mappán belül, leírás, címkék). Az első találat nyer,
ezért a szűkebb mintákat tedd előre. Ami ide nem kerül, az a katalógusban
"LEÍRÁS HIÁNYZIK" jelzést kap.
"""

SUMMARY = r'''
## Összefoglaló

| Csomag | Mappa | Mi van benne | Mire jó nálunk | Licenc / credit |
| --- | --- | --- | --- | --- |
| **Pixel Crawler – Free Pack (Exterior 0.1)**, Anokolisa | `pixel-crawler/` | 16 px-es fantasy készlet: tilesetek (dungeon, sziklafal, padló, víz), propok (bútor, edény, növény, szikla, kristály, szerszám), fák, épületelemek, tűz- és kemence-animációk, szörnyek (csontvázak, orkok), NPC-k, kézben tartott fegyverek | **A játék fő grafikai csomagja.** Dungeonök, szörnyek, a játékos karakter, a világ propjai | Szabadon használható kereskedelmi és nem kereskedelmi projektben, módosítható; a csomag maga nem adható el. Credit nem kötelező, de kérik: *Pixel Crawler by Anokolisa* (`Terms.txt`) |
| **16x16 Weapon RPG Icons**, Shade | `weapons/` | 4 anyag (bronz, vas, acél, arany) × 480 fegyver ikon, 24 fegyvertípus × 10 változat | Fegyver loot, inventory, bolt, gear-ikonok a rarity létrához | A csomagban nincs licencfájl; a letöltési oldalon kell ellenőrizni. Credit: *16x16 Weapon RPG Icons by Shade* |
| **Items16**, Glionox | `items/` | 1244 egyedi 16×16 ikon: fegyverek, páncél, ruha, étel, drágakő, érc, könyv, kulcs, hangszer, hal, virág, szörny-alapanyag | Páncél-ikonok, HP-ital, loot, meglepetés-tárgyak, bolt | A csomagban nincs licencfájl; a letöltési oldalon kell ellenőrizni. Credit: *Items16 by Glionox* |
| **Modern Interiors – Free v2.2**, LimeZu | `modern-interiors/` | Modern belső tér (bútor, konyha, fürdő, iroda), szobaépítő (falak, padlók), 4 modern karakter | A későbbi **ház rendszerhez**. Fantasy dungeonbe nem illik | **Csak nem kereskedelmi célra.** Credit: *Modern Interiors by LimeZu*, https://limezu.itch.io/moderninteriors |
| **Tiny RPG Character Asset Pack 01 – Free (Soldier & Orc)**, Zerie | `tiny-rpg-01/` | 2 animált karakter 100×100-as kockákban: katona (kard + íj) és ork (fejsze); idle, walk, támadások, hurt, death; nyílvessző lövedék | **Harc-animációk**: a Pixel Crawlerben nincs támadás- és sebződés-animáció a szörnyeknek, itt van. Más stílusú (nagyobb fej, chibi), egymás mellett nem keverendő | A csomagban nincs licencfájl; a letöltési oldalon (itch.io) kell ellenőrizni. Credit: *Tiny RPG Character Asset Pack by Zerie* |
| **Tiny RPG Character Asset Pack 02 – Free (Demon_A & Blood Monster_A)**, Zerie | `tiny-rpg-02/` | 2 animált szörny 100×100-as kockákban: démon (nagy pengével) és vérszörny; idle, walk, 2 támadás, hurt, death | Boss- vagy szörny-jelöltek harc-animációval | Mint fent |

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
| szörny **támadás és sebződés** animációval | Tiny RPG 01 / 02 |
| fegyver ikon (anyag szerint) | `wp:*` |
| páncél, sisak, csizma, étel, kulcs, drágakő ikon | Items16 (sorszám-tartományok lent) |
| modern bútor, szoba | Modern Interiors |
'''

PACK_NOTES = {
    't1': r'''
Útvonal: `tiny-rpg-01/Tiny RPG Character Asset Pack 01 v2.0 -Free Soldier&Orc/`. Minden animáció egysoros csík
**100×100-as kockákkal**; a figura ebből csak kb. 20–30 px, középen áll. Jobbra néznek.
Minden karakter két változatban van: árnyék nélkül és `with shadows` (árnyékkal a talpuk alatt).
A `Characters(100x100 split)/<Név>/<Név>/<Név>.png` az összes animáció egy lapon, soronként egy.
Mellette `.aseprite` forrásfájlok (a katalógus nem sorolja fel).
''',
    't2': r'''
Útvonal: `tiny-rpg-02/Tiny RPG Character Asset Pack 02 -Free Demon_A&Blood Monster_A/`. Ugyanaz a formátum, mint
a Tiny RPG 01-nél: 100×100-as kockák, jobbra néznek, árnyék nélkül és `with shadows` változat, egyben lévő lap is.
''',
    'pc': r'''
Útvonal: `pixel-crawler/Pixel Crawler - Free Pack/`. Minden PNG mellett ott van az `.aseprite` forrásfájl is
(193 db, ezeket a katalógus nem sorolja fel). A rács 16 px. Az animációk egysoros csíkok,
a karakterek és szörnyek **csak jobbra néznek** (balra tükrözni kell), kivéve a Body_A alaptestet,
aminek van le / oldal / fel iránya.
''',
    'wp': r'''
Útvonal: `weapons/16x16 Weapons RPG Icons/`. Négy egyforma elrendezésű lap (bronze, iron, steel, gold),
mindegyik 24 oszlop × 20 sor, 16×16-os ikonokkal (lapnként 480, összesen 1920).
Egy ikon azonosítása: **anyag + oszlop + sor**, pl. `wp:steel c3 r5` = acél kard (3. oszlop, 5. sor),
kivágás: x = oszlop × 16, y = sor × 16.
''',
    'it': r'''
Útvonal: `items/itemN.png` (N = 1…1244), mind 16×16. A számozás témák szerint halad, ezért
sorszám-tartományokkal írjuk le. Egy konkrét ikont az előnézeti lapon a száma alapján találsz meg.
''',
    'mi': r'''
Útvonal: `modern-interiors/Modern tiles_Free/`. Minden belső tér lap három felbontásban van
(16, 32, 48 px); nálunk a **16×16** illik a többi csomaghoz. Az ingyenes verzió a teljes csomag kb. 1%-a.
**Licenc: csak nem kereskedelmi célra** (`LICENSE.txt`).
''',
}

CATEGORY_NOTES = {
    ('t1', 'lap'): r'''
Sorrend a lapon (soronként): **Soldier**: idle (6), walk (8), attack01 (6, vágás), attack02 (6, szúrás),
attack03 (9, íjlövés), hurt (4), death (4). **Orc**: idle (6), walk (8), attack01 (6), attack02 (6), hurt (4), death (4).
A sorok kockaszáma a sor elejétől számít; a sor vége üres lehet.
''',
    ('t2', 'lap'): r'''
Sorrend a lapon (soronként): idle (6), walk (8), attack01, attack02 (Demon_A: 7-7, Blood Monster_A: 8-8), hurt (4), death (4).
''',
    ('t1', 'arnyekkal'): r'''
Ugyanazok a fájlok, mint fent, de a figura alatt árnyék-ellipszis van. Ha a játék maga rajzol árnyékot, az árnyék nélküli kell.
''',
    ('t2', 'arnyekkal'): r'''
Ugyanazok a fájlok, mint fent, árnyékkal.
''',
    ('pc', 'szorny'): r'''
Minden szörnynek 3 animációja van: **idle** (32×32, 4 kocka, jobbra néz), **run** (64×64, 6 kocka), **death** (eltérő méret).
A játékban: kripta = csontváz → zsivány → harcos, bánya = ork → felderítő → harcos (`src/data/dungeons.js`).
Még nem használt: `skel-mage` (piros köpenyes mágus), `orc-shaman` (sámán). A csontvázak death animációjának
utolsó kockái csontkupacként is jók (a kriptában így használjuk).
''',
    ('pc', 'karakter'): r'''
**Ruha és haj nélküli alaptest** (kopasz, meztelen figura): rétegezéshez készült, önmagában nem használható játékos-karakternek.
Minden mozdulat 3 irányban (down / side / up), 64×64-es kockák. A side jobbra néz.
''',
    ('pc', 'npc'): r'''
A játékos jelenleg a `npc/citizen-f/tavern-a` (barna hajú lány, idle + walk, csak oldalnézet). A `*-hold` változatok
valamit tartanak a kezükben. A Knight / Rogue / Wizzard ugyanolyan formátumú, mint a szörnyek (idle 32×32).
''',
    ('pc', 'tileset'): r'''
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
''',
    ('pc', 'prop'): r'''
Atlaszok, egy fájlban sok kis tárgy. A pontos kivágást az előnézet ráccsal és számokkal mutatja.
''',
    ('pc', 'allomas'): r'''
Ezek többsége animáció. A `bonfire-01…10` különböző tüzek (tábortűz, parázs, rönk, tűztál, grill); a `fire-01` nagy láng,
a `fire-02` kis láng (fáklyához). A kemencék (furnace) `stone`, `iron`, `bricks` változatban, 3 méretben.
A képkocka-számok automatikus becslések; nagy lapoknál (alchemy, anvil, sawmill) érdemes ránézni az előnézetre.
''',
    ('pc', 'fegyver'): r'''
**Kézben tartott** fegyver-sprite-ok (nem ikonok) három anyagban: csont, fa, plusz kezek. Később a játékos kezébe
vagy a szörnyekhez rétegként. Mindhárom lapon ugyanaz az elrendezés: kard, lándzsa, kalapács, fejsze, íj, pajzs, bot.
''',
    ('wp', 'fegyver-ikon'): r'''
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
''',
    ('it', 'ikon'): r'''
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
''',
    ('mi', 'belso-16'): r'''
**`interiors` fő régiói (sor, 16 px):** 0–9 fürdőszoba (kád, wc, zuhany, mosdó) · 10–28 szoba: ágy, asztal,
szőnyegek, könyvespolc, képek, ablak, függöny, ajtó · 29–35 konyhapult, székek · 36–43 iskola / iroda (pad, tábla,
földgömb, számítógép, hűtő) · 44–49 lila bútorok, cserepes növények, fényfüzér · 50–59 lámpák, szekrények, gyümölcstálak ·
60–66 konyha, csillár, gitár · 67–75 vázák, tükör, kandalló, könyvespolcok, kanapék · 76–88 fotelek, párnák, ágyak, tévéállvány.

**`room-builder`:** fal- és padlóminták (tapéták, fa, csempe, szőnyeg), szobaperem / plafon (0–3. sor).
''',
    ('mi', 'karakter'): r'''
Modern ruhás karakterek, 16×32-es kockák. Irány-sorrend a csíkokon: jobb, fel, bal, le.
''',
}

FILES = [
    # ======================= Tiny RPG 01 / 02 =======================
    (r'Arrow01\(100x100\)', 'Nyílvessző lövedék 100×100-as keretben (a katona íjlövéséhez)', ['lövedék', 'nyíl', 'harc']),
    (r'Arrow01\(32x32\)', 'Nyílvessző lövedék 32×32-es keretben', ['lövedék', 'nyíl', 'harc']),
    (r'with shadows/Soldier\.png', 'Katona, összes animáció egy lapon, árnyékkal', ['karakter', 'katona', 'atlasz', 'árnyék']),
    (r'with shadows/Orc\.png', 'Ork, összes animáció egy lapon, árnyékkal', ['szörny', 'ork', 'atlasz', 'árnyék']),
    (r'with shadows/Demon_A\.png', 'Démon, összes animáció egy lapon, árnyékkal', ['szörny', 'démon', 'atlasz', 'árnyék']),
    (r'with shadows/Blood Monster_A\.png', 'Vérszörny, összes animáció egy lapon, árnyékkal', ['szörny', 'vérszörny', 'atlasz', 'árnyék']),
    (r'Soldier/Soldier\.png', 'Katona, összes animáció egy lapon (7 sor)', ['karakter', 'katona', 'atlasz']),
    (r'Orc/Orc\.png', 'Ork, összes animáció egy lapon (6 sor)', ['szörny', 'ork', 'atlasz']),
    (r'Demon_A/Demon_A\.png', 'Démon, összes animáció egy lapon (6 sor)', ['szörny', 'démon', 'atlasz']),
    (r'Blood Monster_A/Blood Monster_A\.png', 'Vérszörny, összes animáció egy lapon (6 sor)', ['szörny', 'vérszörny', 'atlasz']),
    (r'Soldier_Idle', 'Katona (sisak, kard, piros tunika) áll', ['karakter', 'katona', 'idle', 'animáció']),
    (r'Soldier_Walk', 'Katona sétál', ['karakter', 'katona', 'séta', 'animáció']),
    (r'Soldier_Attack01', 'Katona kardvágás (széles ív)', ['karakter', 'katona', 'támadás', 'kard', 'animáció']),
    (r'Soldier_Attack02', 'Katona kardszúrás', ['karakter', 'katona', 'támadás', 'kard', 'animáció']),
    (r'Soldier_Attack03', 'Katona íjlövés (nyílvesszővel)', ['karakter', 'katona', 'támadás', 'íj', 'animáció']),
    (r'Soldier_Hurt', 'Katona sebződik (pirosan villan)', ['karakter', 'katona', 'sebződés', 'animáció']),
    (r'Soldier_Death', 'Katona meghal, eldől', ['karakter', 'katona', 'halál', 'animáció']),
    (r'Orc_Idle', 'Ork (zöld, nagy fejsze) áll', ['szörny', 'ork', 'idle', 'animáció']),
    (r'Orc_Walk', 'Ork sétál', ['szörny', 'ork', 'séta', 'animáció']),
    (r'Orc_Attack01', 'Ork fejszecsapás', ['szörny', 'ork', 'támadás', 'animáció']),
    (r'Orc_Attack02', 'Ork fejszecsapás (másik)', ['szörny', 'ork', 'támadás', 'animáció']),
    (r'Orc_Hurt', 'Ork sebződik', ['szörny', 'ork', 'sebződés', 'animáció']),
    (r'Orc_Death', 'Ork meghal', ['szörny', 'ork', 'halál', 'animáció']),
    (r'Demon_A_Idle', 'Démon (piros, szarvas, nagy ívelt pengével) áll — boss-jelölt', ['szörny', 'démon', 'boss', 'idle', 'animáció']),
    (r'Demon_A_Walk', 'Démon sétál', ['szörny', 'démon', 'séta', 'animáció']),
    (r'Demon_A_Attack01', 'Démon pengecsapás', ['szörny', 'démon', 'támadás', 'animáció']),
    (r'Demon_A_Attack02', 'Démon pengecsapás (másik)', ['szörny', 'démon', 'támadás', 'animáció']),
    (r'Demon_A_Hurt', 'Démon sebződik', ['szörny', 'démon', 'sebződés', 'animáció']),
    (r'Demon_A_Death', 'Démon meghal', ['szörny', 'démon', 'halál', 'animáció']),
    (r'Blood Monster_A_Idle', 'Vérszörny (bíbor, csápos, fogas) áll', ['szörny', 'vérszörny', 'idle', 'animáció']),
    (r'Blood Monster_A_Walk', 'Vérszörny mászik', ['szörny', 'vérszörny', 'séta', 'animáció']),
    (r'Blood Monster_A_Attack01', 'Vérszörny támadás', ['szörny', 'vérszörny', 'támadás', 'animáció']),
    (r'Blood Monster_A_Attack02', 'Vérszörny támadás (másik)', ['szörny', 'vérszörny', 'támadás', 'animáció']),
    (r'Blood Monster_A_Hurt', 'Vérszörny sebződik', ['szörny', 'vérszörny', 'sebződés', 'animáció']),
    (r'Blood Monster_A_Death', 'Vérszörny meghal', ['szörny', 'vérszörny', 'halál', 'animáció']),

    # ======================= Pixel Crawler: karakter alaptest =======================
    (r'Body_A/Animations/Idle_Base/Idle_(\w+)', 'Alaptest áll (idle)', ['karakter', 'alaptest', 'idle', 'animáció']),
    (r'Body_A/Animations/Walk_Base/', 'Alaptest sétál', ['karakter', 'alaptest', 'séta', 'animáció']),
    (r'Body_A/Animations/Run_Base/', 'Alaptest fut', ['karakter', 'alaptest', 'futás', 'animáció']),
    (r'Body_A/Animations/Hit_Base/', 'Alaptest sebződik', ['karakter', 'alaptest', 'sebződés', 'animáció']),
    (r'Body_A/Animations/Death_Base/', 'Alaptest meghal', ['karakter', 'alaptest', 'halál', 'animáció']),
    (r'Body_A/Animations/Slice_Base/', 'Alaptest vágó támadás (kard)', ['karakter', 'alaptest', 'támadás', 'animáció']),
    (r'Body_A/Animations/Pierce_Base/', 'Alaptest szúró támadás (lándzsa)', ['karakter', 'alaptest', 'támadás', 'animáció']),
    (r'Body_A/Animations/Crush_Base/', 'Alaptest zúzó támadás (kalapács)', ['karakter', 'alaptest', 'támadás', 'animáció']),
    (r'Body_A/Animations/Collect_Base/', 'Alaptest felvesz / gyűjt', ['karakter', 'alaptest', 'gyűjtés', 'animáció']),
    (r'Body_A/Animations/Fishing_Base/', 'Alaptest horgászik', ['karakter', 'alaptest', 'horgászat', 'animáció']),
    (r'Body_A/Animations/Watering_Base/', 'Alaptest locsol', ['karakter', 'alaptest', 'farm', 'animáció']),
    (r'Body_A/Animations/Carry_Idle/', 'Alaptest áll, valamit visz', ['karakter', 'alaptest', 'cipel', 'animáció']),
    (r'Body_A/Animations/Carry_Walk/', 'Alaptest sétál, valamit visz', ['karakter', 'alaptest', 'cipel', 'animáció']),
    (r'Body_A/Animations/Carry_Run/', 'Alaptest fut, valamit visz', ['karakter', 'alaptest', 'cipel', 'animáció']),

    # ======================= Pixel Crawler: NPC-k =======================
    (r'Peasant_A/Idle/', 'Paraszt lány (zöld haj, fehér ing) áll', ['npc', 'nő', 'idle', 'animáció']),
    (r'Peasant_A/Walk/', 'Paraszt lány sétál', ['npc', 'nő', 'séta', 'animáció']),
    (r'Tavern_A/Idle/Idle_Side', 'Kocsmáros lány (barna haj, bordó felső, zöld szoknya) áll — **a játékos karaktere**', ['npc', 'nő', 'játékos', 'idle', 'animáció', 'használt']),
    (r'Tavern_A/Walk/Walk_Side', 'Kocsmáros lány sétál — **a játékos karaktere**', ['npc', 'nő', 'játékos', 'séta', 'animáció', 'használt']),
    (r'Tavern_A/Idle_Hold/', 'Kocsmáros lány áll, tálcát tart', ['npc', 'nő', 'idle', 'tart', 'animáció']),
    (r'Tavern_A/Walk_Hold/', 'Kocsmáros lány sétál, tálcát tart', ['npc', 'nő', 'séta', 'tart', 'animáció']),
    (r'Tavern_B/Idle/', 'Kocsmáros lány B (sötétebb haj) áll', ['npc', 'nő', 'idle', 'animáció']),
    (r'Tavern_B/Walk/', 'Kocsmáros lány B sétál', ['npc', 'nő', 'séta', 'animáció']),
    (r'Tavern_B/Idle_Hold/', 'Kocsmáros lány B áll, tálcát tart', ['npc', 'nő', 'idle', 'tart', 'animáció']),
    (r'Tavern_B/Walk_Hold/', 'Kocsmáros lány B sétál, tálcát tart', ['npc', 'nő', 'séta', 'tart', 'animáció']),
    (r"Npc's/Knight/Idle", 'Lovag kék páncélban, áll', ['npc', 'lovag', 'idle', 'animáció']),
    (r"Npc's/Knight/Run", 'Lovag fut', ['npc', 'lovag', 'futás', 'animáció']),
    (r"Npc's/Knight/Death", 'Lovag meghal', ['npc', 'lovag', 'halál', 'animáció']),
    (r"Npc's/Rogue/Idle", 'Kapucnis zsivány (zöld köpeny), áll', ['npc', 'zsivány', 'idle', 'animáció']),
    (r"Npc's/Rogue/Run", 'Kapucnis zsivány fut', ['npc', 'zsivány', 'futás', 'animáció']),
    (r"Npc's/Rogue/Death", 'Kapucnis zsivány meghal', ['npc', 'zsivány', 'halál', 'animáció']),
    (r"Npc's/Wizzard/Idle", 'Varázsló (lila süveg, fehér szakáll), áll', ['npc', 'varázsló', 'idle', 'animáció']),
    (r"Npc's/Wizzard/Run", 'Varázsló fut', ['npc', 'varázsló', 'futás', 'animáció']),
    (r"Npc's/Wizzard/Death", 'Varázsló meghal', ['npc', 'varázsló', 'halál', 'animáció']),

    # ======================= Pixel Crawler: szörnyek =======================
    (r'Skeleton - Base/Idle', 'Csontváz (alap), áll — kripta 1. szörny', ['szörny', 'csontváz', 'idle', 'animáció', 'használt']),
    (r'Skeleton - Base/Run', 'Csontváz (alap) fut', ['szörny', 'csontváz', 'futás', 'animáció']),
    (r'Skeleton - Base/Death', 'Csontváz (alap) szétesik; az utolsó kockák csontkupacnak is jók', ['szörny', 'csontváz', 'halál', 'animáció', 'használt']),
    (r'Skeleton - Rogue/Idle', 'Csontváz zsivány piros csuklyában, áll — kripta 2. szörny', ['szörny', 'csontváz', 'idle', 'animáció', 'használt']),
    (r'Skeleton - Rogue/Run', 'Csontváz zsivány fut', ['szörny', 'csontváz', 'futás', 'animáció']),
    (r'Skeleton - Rogue/Death', 'Csontváz zsivány meghal', ['szörny', 'csontváz', 'halál', 'animáció']),
    (r'Skeleton - Warrior/Idle', 'Csontváz harcos kék páncélban, áll — kripta 3. szörny', ['szörny', 'csontváz', 'páncélos', 'idle', 'animáció', 'használt']),
    (r'Skeleton - Warrior/Run', 'Csontváz harcos fut', ['szörny', 'csontváz', 'futás', 'animáció']),
    (r'Skeleton - Warrior/Death', 'Csontváz harcos meghal', ['szörny', 'csontváz', 'halál', 'animáció']),
    (r'Skeleton - Mage/Idle', 'Csontváz mágus piros köpenyben, áll (még nem használt — boss-jelölt)', ['szörny', 'csontváz', 'mágus', 'idle', 'animáció']),
    (r'Skeleton - Mage/Run', 'Csontváz mágus fut', ['szörny', 'csontváz', 'mágus', 'futás', 'animáció']),
    (r'Skeleton - Mage/Death', 'Csontváz mágus meghal', ['szörny', 'csontváz', 'mágus', 'halál', 'animáció']),
    (r'Orc Crew/Orc/Idle', 'Ork (zöld, barna ruha), áll — bánya 1. szörny', ['szörny', 'ork', 'idle', 'animáció', 'használt']),
    (r'Orc Crew/Orc/Run', 'Ork fut', ['szörny', 'ork', 'futás', 'animáció']),
    (r'Orc Crew/Orc/Death', 'Ork meghal', ['szörny', 'ork', 'halál', 'animáció']),
    (r'Orc - Rogue/Idle', 'Ork felderítő (barna sapka), áll — bánya 2. szörny', ['szörny', 'ork', 'idle', 'animáció', 'használt']),
    (r'Orc - Rogue/Run', 'Ork felderítő fut', ['szörny', 'ork', 'futás', 'animáció']),
    (r'Orc - Rogue/Death', 'Ork felderítő meghal', ['szörny', 'ork', 'halál', 'animáció']),
    (r'Orc - Warrior/Idle', 'Ork harcos kék páncélban, fejszével, áll — bánya 3. szörny', ['szörny', 'ork', 'páncélos', 'idle', 'animáció', 'használt']),
    (r'Orc - Warrior/Run', 'Ork harcos fut', ['szörny', 'ork', 'futás', 'animáció']),
    (r'Orc - Warrior/Death', 'Ork harcos meghal (nagyobb, 96×80-as kockák)', ['szörny', 'ork', 'halál', 'animáció']),
    (r'Orc - Shaman/Idle', 'Ork sámán piros csuklyában, áll (még nem használt — boss-jelölt)', ['szörny', 'ork', 'mágus', 'idle', 'animáció']),
    (r'Orc - Shaman/Run', 'Ork sámán fut', ['szörny', 'ork', 'mágus', 'futás', 'animáció']),
    (r'Orc - Shaman/Death', 'Ork sámán meghal', ['szörny', 'ork', 'mágus', 'halál', 'animáció']),

    # ======================= Pixel Crawler: tilesetek =======================
    (r'Tilesets/Dungeon_Tiles', 'Dungeon tileset: kőfal, padló, boltív, faajtó, rács, csapda, fénytócsák, moha, zászlós oszlopok — a kripta alapja', ['tileset', 'dungeon', 'fal', 'padló', 'ajtó', 'használt']),
    (r'Tilesets/Wall_Tiles', 'Sziklafal tileset 3 színben: sziklaperem, homlokzat, rétegzett fal, barlang-gödör perem — a bánya alapja', ['tileset', 'szikla', 'barlang', 'fal', 'használt']),
    (r'Tilesets/Floors_Tiles', 'Padló tileset: fű, kavicsos kő, föld (átmenetekkel), téglafal, hó és homok foltok', ['tileset', 'padló', 'fű', 'kő', 'föld', 'használt']),
    (r'Tilesets/Water_tiles', 'Víz tileset: 4 kockás vízanimáció, füves szigetek', ['tileset', 'víz', 'animált', 'használt']),
    (r'Tilesets/Wall_Variations', 'Magas sziklafal- és gerendafal-változatok', ['tileset', 'fal', 'szikla']),

    # ======================= Pixel Crawler: propok =======================
    (r'Props/Static/Dungeon_Props', 'Dungeon propok: koporsók, szobor, kínzópadok, fali fegyvertartók, színes zászlók, kőpad', ['dekoráció', 'dungeon', 'koporsó', 'zászló', 'használt']),
    (r'Props/Static/Esoteric', 'Ezoterikus: bájitalok (üvegcsék több méretben), lombikok, tekercsek, könyvek, toll, kristálytartó állvány', ['dekoráció', 'bájital', 'mágia', 'könyv']),
    (r'Props/Static/Farm', 'Farm: magos zsákok, zöldségek növekedési fázisokban, termény-ládák, madárijesztő, kerítés, ágyások', ['dekoráció', 'farm', 'növény', 'étel']),
    (r'Props/Static/Furniture', 'Bútor és kellék: asztalok, szekrények, ajtók, ablakok, kerítések, **sínek**, pallók, lámpaoszlop, lámpás, gerendák, hordók, korsók, vödrök, **láda (nyitott / csukott)**, lánc', ['dekoráció', 'bútor', 'láda', 'hordó', 'sín', 'lámpa', 'használt']),
    (r'Props/Static/Meat', 'Hús és étel: nyers / sült hús, csirke, hal, kolbász, kosár gyümölccsel', ['dekoráció', 'étel', 'hús']),
    (r'Props/Static/Pan', 'Edények: lábasok, fazekak, serpenyők, üstök, evőeszközök, bárd', ['dekoráció', 'konyha', 'edény']),
    (r'Props/Static/Resources', 'Nyersanyagok: szén, ércrögök, kulcsok, gerendák, deszkák, farakás, ládák (üres / szénnel)', ['dekoráció', 'nyersanyag', 'szén', 'fa', 'használt']),
    (r'Props/Static/Rocks', 'Sziklák (barna, szürke, sötét) több méretben, kavicsok, ércrögök (réz, ezüst, arany), **kék kristályok**', ['dekoráció', 'szikla', 'kristály', 'érc', 'használt']),
    (r'Props/Static/Shadows', 'Árnyék-foltok (ellipszis, lomb) tárgyak és fák alá', ['árnyék', 'effekt']),
    (r'Props/Static/Tools', 'Szerszámok: kalapácsok, fogók, csavarkulcsok, fűrészek, festőhenger, üllő, köszörű, mérőeszközök', ['dekoráció', 'szerszám', 'kovács', 'használt']),
    (r'Props/Static/Vegetation', 'Növényzet: bokrok 4 évszak-színben, palánták, páfrányok, gyékény, virágok, száraz ágak, gombák, kövek', ['dekoráció', 'növény', 'bokor', 'virág', 'gomba']),
    (r'Props/Animated/Pan_01', 'Üst kék folyadékkal, fortyog', ['animált', 'konyha', 'bájital']),
    (r'Props/Animated/Pan_02', 'Kis üst kék folyadékkal, fortyog', ['animált', 'konyha', 'bájital']),
    (r'Props/Animated/Pan_03', 'Serpenyő, sül benne valami', ['animált', 'konyha']),
    (r'Props/Animated/Pan_04', 'Fazék fedővel, rotyog', ['animált', 'konyha']),
    (r'Props/Animated/Pan_05', 'Serpenyő tojással', ['animált', 'konyha']),

    # ======================= Pixel Crawler: fák =======================
    (r'Trees/Model_01/', 'Lombos kerek fa 5 évszak-változatban (zöld, sárga, narancs, kopasz, havas); a méret a fájlnévben', ['fa', 'lombos', 'évszak', 'világtérkép']),
    (r'Trees/Model_02/', 'Fenyő, sötét és világos zöld + kopasz változat', ['fa', 'fenyő', 'világtérkép']),
    (r'Trees/Model_03/.*export', 'Magas nyírfaszerű fa (export-változat, a nem-export fájllal szinte azonos)', ['fa', 'nyír', 'duplikátum']),
    (r'Trees/Model_03/', 'Magas nyírfaszerű fa: zöld, sárga, piros őszi, kopasz', ['fa', 'nyír', 'évszak', 'világtérkép']),

    # ======================= Pixel Crawler: épületek =======================
    (r'Buildings/Walls', 'Épület külső falak: rönkfal, deszkafal, vakolt fal téglával; ajtós és ablakos szakaszok', ['épület', 'fal', 'ház']),
    (r'Buildings/Roofs', 'Tetők: barna zsindely, zöld cserép, üvegtető; oromzatok, ereszek', ['épület', 'tető', 'ház']),
    (r'Buildings/Props', 'Épület-kellékek: boltíves ajtók, faajtók, ablakok zsalugáterrel, kémény, pad, virágláda, kerítés', ['épület', 'ajtó', 'ablak']),
    (r'Buildings/Shadows', 'Épületek árnyékai', ['épület', 'árnyék']),
    (r'Buildings/Interior/Interior_Walls', 'Belső falak (rönk, kő, deszka, vakolt), padlók (parketta, kő), belső tetőszerkezet', ['épület', 'belső tér', 'fal', 'padló']),
    (r'Buildings/Interior/Interior_Props', 'Belső tér kellékek: asztalok, székek, ágyak, kandalló, tűzhely, polcok, edények, növények, szőnyegek', ['épület', 'belső tér', 'bútor', 'konyha']),

    # ======================= Pixel Crawler: munkaállomások =======================
    (r'Bonfire/Fire_01', 'Nagy láng — a tűztálakon használjuk', ['tűz', 'láng', 'animált', 'használt']),
    (r'Bonfire/Fire_02', 'Kis láng — a fali fáklyákon használjuk', ['tűz', 'láng', 'fáklya', 'animált', 'használt']),
    (r'Bonfire/Smoke', 'Füst', ['füst', 'animált', 'effekt']),
    (r'Bonfire/Bonfire_01', 'Kő tűztál parázzsal — a kriptában és a bányában', ['tűz', 'tűztál', 'animált', 'használt']),
    (r'Bonfire/Bonfire_02', 'Kövekkel körbe rakott tábortűz', ['tűz', 'tábortűz', 'animált']),
    (r'Bonfire/Bonfire_03', 'Égő rönk', ['tűz', 'animált']),
    (r'Bonfire/Bonfire_04', 'Izzó tuskó', ['tűz', 'animált']),
    (r'Bonfire/Bonfire_05', 'Parázsló tábortűz kövekkel', ['tűz', 'parázs', 'animált']),
    (r'Bonfire/Bonfire_06', 'Izzó hasáb', ['tűz', 'animált']),
    (r'Bonfire/Bonfire_07', 'Szétszórt parázs', ['tűz', 'parázs', 'animált']),
    (r'Bonfire/Bonfire_08', 'Parázs-folt', ['tűz', 'parázs', 'animált']),
    (r'Bonfire/Bonfire_09', 'Hosszú kő parázstartó (grill alap)', ['tűz', 'parázs', 'animált']),
    (r'Bonfire/Bonfire_10', 'Kő tűzhely-doboz parázzsal', ['tűz', 'parázs', 'animált']),
    (r'Bonfire/Bonfire\.png', 'A tábortüzek állapotai egy oszlopban (állókép-atlasz)', ['tűz', 'atlasz']),
    (r'Furnace/Stone_02', 'Kő kemence, izzó — a bányában használjuk', ['kemence', 'kő', 'animált', 'használt']),
    (r'Furnace/Stone_', 'Kő kemence (méret a számban)', ['kemence', 'kő', 'animált']),
    (r'Furnace/Iron_', 'Vas kemence / olvasztó (méret a számban)', ['kemence', 'vas', 'animált']),
    (r'Furnace/Bricks_', 'Tégla kemence (méret a számban)', ['kemence', 'tégla', 'animált']),
    (r'Furnace/Furnace\.png', 'Kemencék állóképei egy atlaszban', ['kemence', 'atlasz']),
    (r'Anvil/Anvil\.png', 'Üllők és kovácsszerszámok állóképei', ['kovács', 'üllő', 'atlasz']),
    (r'Anvil/Anvil_', 'Kovácsműhely animációk (üllő, munkapad)', ['kovács', 'üllő', 'animált']),
    (r'Alchemy/', 'Alkimista asztal animációk (lombikok, fortyogó üvegek)', ['alkímia', 'bájital', 'animált']),
    (r'Cooking Station/Cooking Station', 'Főzőállomás alkatrészei egy atlaszban', ['konyha', 'atlasz']),
    (r'Cooking Station/Estructure', 'Főzőállomás váza (állvány, nyárs)', ['konyha', 'atlasz']),
    (r'Butchery/', 'Hentesállvány húsokkal', ['konyha', 'hús']),
    (r'Cooker/Cooker_0[12]', 'Üres nyárs-állvány', ['konyha']),
    (r'Cooker/', 'Kő tűzhely / sütő', ['konyha', 'tűz', 'animált']),
    (r'Grill/', 'Nyárson sülő hús a tűz fölött', ['konyha', 'tűz', 'animált']),
    (r'Sawmill/Base', 'Fűrésztelep alkatrészei', ['fűrészmalom', 'atlasz']),
    (r'Sawmill/Level_1', 'Fűrészbak rönkkel', ['fűrészmalom']),
    (r'Sawmill/Level_', 'Fűrésztelep animáció (nagyobb szint)', ['fűrészmalom', 'animált']),
    (r'Workbench/', 'Munkapadok, eszközök', ['munkapad', 'atlasz']),

    # ======================= Pixel Crawler: fegyverek, mockup =======================
    (r'Weapons/Bone/', 'Csont fegyverek kézbe: kardok, buzogány, lándzsa, íjak, pajzsok, bot', ['fegyver', 'csont', 'sprite']),
    (r'Weapons/Wood/', 'Fa fegyverek kézbe: kard, kalapács, fejsze, lándzsa, íjak, pajzsok, bot', ['fegyver', 'fa', 'sprite']),
    (r'Weapons/Hands/', 'Kezek (fegyver-rétegek alá)', ['kéz', 'sprite']),
    (r'MockUps/', 'Mintajelenet: kocsma belső tere a csomag elemeiből', ['mintakép', 'kocsma']),

    # ======================= Weapon icons =======================
    (r'bronze-weapons', 'Bronz fegyver ikonok, 480 db (24 típus × 10)', ['fegyver', 'ikon', 'bronz']),
    (r'iron-weapons', 'Vas fegyver ikonok, 480 db', ['fegyver', 'ikon', 'vas']),
    (r'steel-weapons', 'Acél fegyver ikonok, 480 db', ['fegyver', 'ikon', 'acél']),
    (r'gold-weapons', 'Arany fegyver ikonok, 480 db', ['fegyver', 'ikon', 'arany']),
    (r'all-assets-preview', 'A szerző áttekintő képe mind a 4 anyagról (nem játékba való)', ['áttekintő']),

    # ======================= Modern Interiors =======================
    (r'Characters_free/[A-Z][a-z]+_16x16\.png', 'Teljes karakterlap (áll, sétál, ül, telefonál stb. egyben)', ['modern', 'karakter', 'atlasz']),
    (r'_idle_anim_16x16', 'Áll, pislog / mozog', ['modern', 'karakter', 'idle', 'animáció']),
    (r'_idle_16x16', 'Áll, egy kocka irányonként', ['modern', 'karakter', 'idle']),
    (r'_run_16x16', 'Sétál / fut', ['modern', 'karakter', 'séta', 'animáció']),
    (r'_phone_16x16', 'Telefonál', ['modern', 'karakter', 'animáció']),
    (r'_sit\d?_16x16', 'Ül (széken / kanapén)', ['modern', 'karakter', 'ülés', 'animáció']),
    (r'RPGMAKERMV/', 'A 4 karakter RPG Maker MV formátumban', ['modern', 'karakter', 'rpgmaker']),
    (r'16x16/Interiors_free', 'Modern bútorok és tárgyak (fürdő, hálószoba, konyha, iroda, nappali)', ['modern', 'belső tér', 'bútor', 'ház']),
    (r'16x16/Room_Builder', 'Szobaépítő: falak, padlók, tapéták, szobaperem', ['modern', 'belső tér', 'fal', 'padló', 'ház']),
    (r'32x32/Interiors_free', 'Ugyanaz, mint a 16×16-os bútorlap, 2× felbontásban', ['modern', 'belső tér', 'nagy felbontás']),
    (r'48x48/Interiors_free', 'Ugyanaz, mint a 16×16-os bútorlap, 3× felbontásban', ['modern', 'belső tér', 'nagy felbontás']),
    (r'32x32/Room_Builder', 'Szobaépítő 2× felbontásban', ['modern', 'belső tér', 'nagy felbontás']),
    (r'48x48/Room_Builder', 'Szobaépítő 3× felbontásban', ['modern', 'belső tér', 'nagy felbontás']),
    (r'free_overview', 'A szerző áttekintő képe az ingyenes csomagról', ['áttekintő']),
    (r'Old/Tileset_', 'Régi (korábbi verziós) belső tér tileset; a szám a felbontás', ['modern', 'régi', 'tileset']),
    (r'Old/idle_', 'Régi karakter, áll', ['modern', 'régi', 'karakter']),
    (r'Old/run_horizontal', 'Régi karakter, oldalra fut', ['modern', 'régi', 'karakter', 'animáció']),
    (r'Old/mv/', 'Régi karakter RPG Maker formátumban', ['modern', 'régi', 'rpgmaker']),
]

WEAPON_COLUMNS = None
