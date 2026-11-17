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
| `questions/pools.json` + `questions/<pool>.json` | **a német kérdések** poolokban (a lista + poolonként egy fájl) | pl. `q_crypt_perfekt_01` |
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
  "ambience": {"dust": true}         // opcionális: lebegő por (a cseppek helye a térkép "drips" rétegében)
}
```

## monsters.json

`{ "id", "idle": animációs csík (src/config/assets.js: strips), "name", "desc": szöveg-kulcsok }`

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

A német kérdések poolokban vannak. `questions/pools.json` a poolok listája (`[{"id": "crypt"}, …]`), minden
poolnak saját fájlja van: `questions/<id>.json` (kérdések tömbje). Új pool: új sor a listába + új fájl.
A kérdés ID-ja az összes poolban egyedi, és a mentésbe kerül (a haladás miatt): kiadott ID-t ne nevezz át.

```jsonc
{
  "id": "q_crypt_perfekt_01",
  "type": "choice",                    // choice: választós | input: beírós | tiles: szókártyás mondatépítés
  "level": "B1",                       // B1 | B2 | C1 (docs/GERMAN.md 4. rész)
  "tags": ["perfekt"],                 // téma-címkék (kisbetű, szám, _), a kihívás szűrhet rájuk
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
- Szókártya = a mondat egy szava (a vessző a szónál marad, a mondat végi írásjel elmarad).
- Ellenőrzés (`docs/GERMAN.md` 6. rész): nem számít a kis-/nagybetű (kivéve `caseSensitive`), a felesleges
  szóköz, a mondat végi írásjel, és `ae`/`oe`/`ue`/`ss` = `ä`/`ö`/`ü`/`ß`. Minden más eltérés hiba.

## challenges.json – kihívások

```jsonc
{
  "id": "ch_crypt_monster",
  "pools": ["crypt"],        // innen jönnek a kérdések
  "tags": [],                // opcionális szűrés címkére (bármelyik egyezik)
  "levels": ["B1"],          // opcionális szűrés szintre
  "need": 1,                 // ennyi jó válasz kell a győzelemhez (a szörny "need" mezője felülírja)
  "wrongDamage": 3,          // opcionális: HP-vesztés rossz válaszért (alap: config.js -> questions.wrongDamage)
  "repeat": "unlimited"      // unlimited | daily (naponta egyszer) | once (egyszer, utána feloldva)
}
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
