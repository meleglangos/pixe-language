# Tartalom (data/)

A játék teljes tartalma itt van JSON-ban. Új dungeont, szörnyet, tárgyat stb. kódváltoztatás nélkül
lehet hozzáadni. **Minden módosítás után futtasd:** `node tools/build-data.js` (ez frissíti a
`bundle.js`-t, amit a játék `file://` alóli futáskor használ; az `npm test` elbukik, ha elavult).

## ID-k – a legfontosabb szabály

- Minden tételnek van `id`-ja: csak kisbetű, szám és `_` (pl. `dungeon_crypt`, `sword_bronze_01`).
- Az ID egyedi a saját fájlján belül; a mentésbe kerülő típusok (dungeonök, tárgyak) között is.
- **A mentés csak ID-kat tárol, ezért egy már kiadott ID-t SOHA nem szabad átnevezni vagy törölni.**
  Ha mégis muszáj: új mentés-verzió + migráció kell (`src/systems/save/SaveSchema.js`), ahogy a
  v3-ban a `dungeon3` → `dungeon_crypt` átnevezésnél.
- Betöltéskor a `ContentValidator` ellenőrzi az ID-kat és a hivatkozásokat; a hibák a konzolra kerülnek.

| Fájl | Mi van benne | Tétel |
| --- | --- | --- |
| `translations.json` | **a fordítási fájl**: minden megjelenő szöveg `"kulcs": { "de": "...", "hu": "..." }` – `de` látszik a játékban, `hu` a „?” buborékban; `{név}` = behelyettesített érték | objektum, a kulcs az ID |
| `maps/*.json` | a pályák **Tiled** formátumban: `overworld`, `dungeon_crypt`, `dungeon_mine` | a fájlnév az ID |
| `dungeons.json` | a dungeonök nem térképes adatai (név, téma, sötétség) + melyik térkép | `dungeon_*` |
| `monsters.json` | szörnytípusok | pl. `skeleton` |
| `dungeon_props.json` | dungeon-berendezés (fáklya, koporsó, kristály…) | pl. `torch` |
| `items.json` | tárgyak (még üres) | pl. `sword_bronze_01` |
| `loot_tables.json` | loot táblák (még üres) | pl. `loot_crypt_chest` |
| `questions/pools.json` + `questions/<fájl>.json` | **a német kérdések**: egy közös készlet, rendezésből több fájlban | pl. `q_crypt_04` |
| `questions/tags.json` | a kérdés-címkék rögzített listája (helyzet-téma / nyelvtan) | pl. `dungeon`, `perfekt` |
| `challenges.json` | kihívások: melyik poolból, hány jó válasz kell, rossz válasz ára | pl. `ch_crypt_monster` |
| `shop.json` | a bolt kínálata (még üres) | pl. `offer_potion_small` |

## translations.json – minden szöveg innen jön

A kódban és a többi adatfájlban csak **kulcs** szerepel (pl. `"poi.dungeon_crypt.name"`), soha nem kész szöveg.
Minden kulcsnak kell `de` és `hu` változat, azonos `{helyőrzőkkel}` (a teszt ellenőrzi). A „?” buborék is
a kulcsból, ebből a fájlból veszi a magyar szöveget. Kulcs-előtagok: `poi.<id>.name/desc`, `poi.type.<típus>`,
`mob.<id>.name/desc`, `rarity.<id>`, `menu.*`, `hud.*` stb.

## maps/ – Tiled térképek

Megnyitás: Tiled (1.10+) → File → Open → `data/maps/overworld.json` (vagy `dungeon_crypt.json`, `dungeon_mine.json`).
A tilesetek a térképbe vannak ágyazva, a képük relatív útvonalon van: `maps/tilesets/*.png` – ezek csak a
szerkesztőnek kellenek (a játék a saját grafikájával rajzol: a falakat, partokat, változatokat automatikusan).
Mentés után: `node tools/build-data.js`, majd `npm test` (ellenőrzi a térképeket is).

Szabályok, hogy a játék olvasni tudja:
- Ortogonális térkép, 16×16-os mezők, nem végtelen; **Tile Layer Format: CSV** (Map → Map Properties).
- A tileset maradjon beágyazva (ne „Export Tileset”), a rétegek neve ne változzon.
- Objektumok: a **Name** és a **Class/Type** mező számít; a pont bárhol lehet a mezőn belül (az számít, melyik mezőre esik).

### overworld.json
| Réteg | Fajta | Tartalom |
| --- | --- | --- |
| `ground` | csemperéteg | talaj: fű, sötét fű, virágos, ösvény, homok, víz, köves (a csempék `char`/`kind` tulajdonsága) |
| `objects` | csemperéteg | fák, sziklák, bokrok, sírok, kristályok (üres = nincs semmi) |
| `pois` | objektumok | helyszínek: pont az ajtó előtti mezőn; Name = helyszín ID, Class = `home` / `shop` / `dungeon` / `boss`, tulajdonság: `sprite` |
| `markers` | objektumok | `spawn`: a kezdőpont |

A helyszínek nevei: `poi.<id>.name` / `poi.<id>.desc` a fordítási fájlban. A `dungeon` típusú helyszín akkor
nyílik meg, ha van azonos ID-jú bejegyzés a `dungeons.json`-ban.

### dungeon_*.json
| Réteg | Fajta | Tartalom |
| --- | --- | --- |
| `terrain` | csemperéteg | fal/sötétség, kőpadló, földes padló, tó, szakadék, híd. A padló fölötti 3 sor automatikusan falperem + 2 sor fal lesz |
| `markers` | objektumok | `start` (pont), `exit` (2×3 mezős téglalap a falban; tulajdonságok: `name`, `desc`, `light_color`, `light_scale`, `light_mode`, `light_hole`), `chest` (2×1 téglalap), `door` (2×3 téglalap a falban, tulajdonság: `state` = `open` / `closed`) |
| `monsters` | objektumok | pont; Name = szörnytípus (`monsters.json` id), bejárattól befelé egyre erősebbek |
| `props` | objektumok | pont; Name = berendezés (`dungeon_props.json` id). A sorrend a rajzolási sorrend |
| `puddles` | objektumok | téglalap: víztócsa, át lehet gázolni |
| `glints` | objektumok | pont; Name = szín (`cyan`, `pink`, `green`…): halvány fénypont, a pont pontos helyén |
| `drips` | objektumok | pont: ide esnek a csöpögő víz cseppjei |

## dungeons.json

```jsonc
{
  "id": "dungeon_mine",              // = a világtérképi helyszín ID-ja
  "name": "poi.dungeon_mine.name",   // szöveg-kulcs
  "theme": "mine",                   // kinézet: src/world/dungeonThemes.js ('crypt' | 'mine')
  "map": "dungeon_mine",             // térkép: data/maps/dungeon_mine.json
  "darkness": {"color": "#04060e", "alpha": 0.8, "playerLight": 52},  // opcionális: sötét dungeon
  "ambience": {"dust": true},        // opcionális: lebegő por (a cseppek helye a térkép "drips" rétegében)
  "challenge": "ch_mine_monster",    // a szörnyei ezt a kihívást adják (challenges.json); kötelező, ha vannak szörnyei
  "monsterStats": {"orc": {"damage": 2}}  // opcionális: szörnytípusonként más need / damage ebben a dungeonben
}
```

## monsters.json

`{ "id", "idle": animációs csík (src/config/assets.js: strips), "name", "desc": szöveg-kulcsok, "damage": 1, "need": 2, "challenge": "ch_…" }`

`damage` / `need` (opcionális): HP-vesztés rossz válaszért / hány jó válasz kell (felülírja a kihívásét; egy dungeon
`monsterStats`-a ezt is felülírhatja, lásd challenges.json); `challenge` (opcionális): saját kihívás a dungeoné helyett. A legyőzött szörny csak az adott látogatásra tűnik el.

## dungeon_props.json

`kind`:
- `object`: a padlón áll, y szerint takar
- `decal`: a padlóra festett dísz (rá lehet lépni); `clip: true` → a sötétségbe nem lóg ki
- `wall`: a fal alsó sorára kerül (x = oszlop, y = a fal alsó sora)

Kép: `frame` (src/config/assets.js: frames) | `texture` (önálló textúra) | `strip` (animáció, csak `object`).
További mezők:
- `blocks` (+ `blocksLeft` / `blocksRight`: hány szomszéd mezőt foglal még) – nem lehet átmenni rajta
- `ground: [[frame, dx, dy], …]` – a talajra festett kiegészítés, mezőkben eltolva
- `parts: [{ strip, dx, dy, originY }]` – animált rész (pl. láng), pixelben a tárgy aljához képest
- `light: { color, scale, dx, dy, mode: "flicker" | "pulse" | "steady", hole }` –
  color: warm, amber, cyan, pink, green, white, gold; hole: fénykör sugara a sötét dungeonökben
- `sparkle: szín` – csillogó részecskék körülötte
- `alpha`, `dx`, `dy`, `originX`, `shadow`: finomhangolás

## questions/ – a kérdések

A német kérdések **egy közös készletet** alkotnak; a fájlok csak a rendezést szolgálják (most: `dungeon.json`,
`alltag.json`). `questions/pools.json` a fájlok listája (`[{"id": "dungeon"}, …]`), minden bejegyzéshez tartozik
egy `questions/<id>.json` (kérdések tömbje). Új fájl: új sor a listába + új fájl. Egy kérdés áthelyezhető másik
fájlba; az ID-ja az összes fájlban egyedi, és a mentésbe kerül (a haladás miatt): kiadott ID-t ne nevezz át.

**Címkék** (`questions/tags.json`, rögzített lista: `{"id": "dungeon", "kind": "context"}`). Kétféle van:
- `context` – helyzet-téma: hol / mivel kapcsolatban jön a kérdés (`dungeon`, `alltag`, később pl. `tiere`, `laden`),
- `grammar` – nyelvtani téma vagy szókincs (`perfekt`, `dativ`, `wortschatz`…).

Minden kérdésnek legalább egy `context` és egy `grammar` címkéje van. Új címkét előbb a listába kell felvenni
(a validátor szól, ha egy címke nincs rajta – így nem lesz egyszer `tiere`, máskor `tier`).

```jsonc
{
  "id": "q_crypt_perfekt_01",
  "type": "choice",                    // choice: választós | input: beírós | tiles: szókártyás mondatépítés
  "level": "B1",                       // B1 | B2 | C1 (docs/GERMAN.md 4. rész)
  "tags": ["dungeon", "perfekt"],      // címkék a questions/tags.json-ból: legalább egy context + egy grammar
  "prompt": "q.crypt_perfekt_01.prompt",
  "answers": ["q.crypt_perfekt_01.a"], // MINDEN helyes megoldás (szöveg-kulcsok); a játék csak ezeket fogadja el
  "wrong": ["q.crypt_perfekt_01.w1", "q.crypt_perfekt_01.w2"],
  "explain": "q.crypt_perfekt_01.explain",  // opcionális: rövid magyarázat a válasz után
  "caseSensitive": false               // opcionális: true, ha a feladat éppen a kis-/nagybetűt kérdezi
}
```

| Típus | `answers` | `wrong` |
| --- | --- | --- |
| `choice` | pontosan 1 (a helyes lehetőség) | 2–3 rossz lehetőség; a lehetőségek keverve jelennek meg |
| `input` | 1 vagy több: minden elfogadható alak (szinonima, névelővel / nélküle…) | nincs |
| `tiles` | a helyes mondat(ok); a kártyák az elsőből készülnek, a többi ugyanazokból a szavakból más sorrend | opcionális: egy-egy szavas „csali” kártyák |

- A szöveg a kulcsok mögött a `translations.json`-ban van; a kérdés kulcsai: `q.<id q_ nélkül>.<prompt|a|a2|w1|explain>`.
- Szókártya = a mondat egy szava, írásjel nélkül (más szórendnél a vessző máshová kerülne); a szókártyás
  ellenőrzés csak a szavak sorrendjét nézi. A válasz után a teljes, írásjeles mondat jelenik meg.
- Ellenőrzés (`docs/GERMAN.md` 6. rész): nem számít a kis-/nagybetű (kivéve `caseSensitive`), a felesleges
  szóköz, a mondat végi írásjel, és `ae`/`oe`/`ue`/`ss` = `ä`/`ö`/`ü`/`ß`. Minden más eltérés hiba.

## challenges.json – kihívások

```jsonc
{
  "id": "ch_crypt_monster",
  "levels": ["B1"],          // szint-szűrés (a dungeonök haladva nehezednek: B1 -> C1)
  "context": ["dungeon"],    // helyzet-téma: ebből jön a kérdés contextShare eséllyel ...
  "contextShare": 0.7,       // ... (opcionális, alap: config.js), különben bármelyik kérdés a szűrésen belül
  "tags": [],                // opcionális kemény szűrés címkére (bármelyik egyezik), pl. egy nyelvtani bossnál
  "pools": [],               // opcionális kemény szűrés fájlra
  "need": 2,                 // ennyi jó válasz kell a győzelemhez
  "wrongDamage": 3,          // opcionális: HP-vesztés rossz válaszért
  "repeat": "unlimited"      // unlimited | daily (naponta egyszer) | once (egyszer, utána feloldva)
}
```

Egy kihíváson belül nincs ismétlés; a dungeon egy látogatáson belül sem ismétel, amíg van még nem látott kérdés.

**Kérdésszám és sebzés – az erősebb nyer:**
`dungeons.json` → `monsterStats[szörnytípus]` > `monsters.json` szörnytípus > kihívás (`need`, `wrongDamage`) > `config.js`.
```jsonc
// monsters.json: a szörnytípus alapértékei
{"id": "skeleton_warrior", …, "damage": 2}               // "need" is megadható
// dungeons.json: egy nehezebb dungeonben ugyanaz a szörny más értékekkel
{"id": "dungeon_tower", …, "challenge": "ch_tower_monster", "monsterStats": {"skeleton": {"need": 3, "damage": 2}}}
```

## translations.json – „ellenőrizendő” jelölés

Ha egy német szövegben nem vagy 100%-ig biztos: `{"de": "…", "hu": "…", "review": true}`. A listájuk:
`npm run review`. Más mező nem lehet a bejegyzésben (a validátor ellenőrzi).

## Tervezett formátumok (a 3–4. szakaszhoz)

A validátor ezeket a mezőket már most ellenőrzi; a többi mező szabadon bővíthető.

```jsonc
// items.json
{"id": "sword_bronze_01", "name": "item.sword_bronze_01.name", "slot": "weapon", "rarity": "common1"}
// loot_tables.json -- a dungeons.json "lootTable" mezője hivatkozhat rá
{"id": "loot_crypt_chest", "entries": [{"item": "sword_bronze_01", "weight": 3}, {"gold": [5, 15], "weight": 5}]}
// shop.json
{"id": "offer_sword_bronze_01", "item": "sword_bronze_01", "price": 40}
```

A `rarity` a `src/config/config.js` → `rarities` egyik `id`-ja.
