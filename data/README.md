# Tartalom (data/)

A játék teljes tartalma itt van JSON-ban. Új dungeont, szörnyet, tárgyat stb. kódváltoztatás nélkül
lehet hozzáadni. **Minden módosítás után futtasd:** `node tools/build-data.js` (ez frissíti a
`bundle.js`-t, amit a játék `file://` alóli futáskor használ; a `npm test` elbukik, ha elavult).

## ID-k – a legfontosabb szabály

- Minden tételnek van `id`-ja: csak kisbetű, szám és `_` (pl. `dungeon_crypt`, `sword_bronze_01`).
- Az ID egyedi a saját fájlján belül; a mentésbe kerülő típusok (dungeonök, tárgyak) között is.
- **A mentés csak ID-kat tárol, ezért egy már kiadott ID-t SOHA nem szabad átnevezni vagy törölni.**
  Ha mégis muszáj: új mentés-verzió + migráció kell (`src/systems/save/SaveSchema.js`), ahogy a
  v3-ban a `dungeon3` → `dungeon_crypt` átnevezésnél.
- Betöltéskor a `ContentValidator` ellenőrzi az ID-kat és a hivatkozásokat; a hibák a konzolra kerülnek.

| Fájl | Mi van benne | Tétel |
| --- | --- | --- |
| `strings.json` | minden szöveg: `"kulcs": { "de": "...", "hu": "..." }` – `de` látszik, `hu` a „?” buborék; `{név}` = behelyettesített érték | objektum, a kulcs az ID |
| `world_map.json` | világtérkép ASCII rácsként (`ground`, `objects`, jelmagyarázat: `legend`), `spawn`, helyszínek (`pois`) | – |
| `dungeons.json` | dungeonök felépítése | `dungeon_*` |
| `monsters.json` | szörnytípusok | pl. `skeleton` |
| `dungeon_props.json` | dungeon-berendezés (fáklya, koporsó, kristály…) | pl. `torch` |
| `items.json` | tárgyak (még üres) | pl. `sword_bronze_01` |
| `loot_tables.json` | loot táblák (még üres) | pl. `loot_crypt_chest` |
| `tasks.json` | nyelvi feladatok (még üres) | pl. `task_articles_01` |
| `shop.json` | a bolt kínálata (még üres) | pl. `offer_potion_small` |

## world_map.json

- `ground` / `objects`: soronként egy szöveg, minden karakter egy 16×16-os mező; a betűk jelentése a
  `legend` alatt, a mezőtípusok tulajdonságai a `src/config/tiles.js`-ben. `objects`-ben `.` = üres.
- `pois`: `{ id, type, x, y, sprite }` – x,y = az ajtó előtti mező, az épület ettől felfelé áll (3×2 mező).
  A nevek: `poi.<id>.name` / `poi.<id>.desc` a `strings.json`-ban. A belépést a `type` szerinti kezelő
  intézi (`Game.poi.handlers`, `src/scenes/WorldScene.js`); a `dungeon` típusú helyszín akkor nyílik meg,
  ha van azonos ID-jú bejegyzés a `dungeons.json`-ban.

## dungeons.json

```jsonc
{
  "id": "dungeon_crypt",            // = a világtérképi helyszín ID-ja
  "name": "poi.dungeon_crypt.name", // szöveg-kulcs
  "theme": "crypt",                 // kinézet: src/world/dungeonThemes.js ('crypt' | 'mine')
  "layout": ["####", "#..#"],       // '#' fal/sötétség, '.' padló, ',' földes padló, '~' tó, 'x' szakadék, '=' híd
                                    // a padló fölötti 3 sor automatikusan falperem + 2 sor fal lesz
  "start": {"x": 7, "y": 44},       // kezdőmező
  "exit": {"x": 4, "y": 41},        // kijárat a falban (2 széles, 3 magas; x,y = bal alsó mezője)
                                    //   opcionális: name, desc (szöveg-kulcs), light (lásd lent)
  "doors": [{"x": 7, "y": 41, "state": "open"}],   // 2 széles átjáró; 'closed' = nem lehet átmenni
  "monsters": [{"type": "skeleton", "x": 8, "y": 34}],   // type = monsters.json id
  "chest": {"x": 7, "y": 5},        // 2 mezőt foglal (x és x+1)
  "puddles": [{"x": 9, "y": 36, "w": 3, "h": 2}],   // víztócsák, át lehet gázolni
  "props": [["torch", 10, 41]],     // [dungeon_props.json id, x, y]
  "glints": [[9, 29, "cyan", 3, 5]],                // halvány fénypont: [x, y, szín, dx, dy]
  "darkness": {"color": "#04060e", "alpha": 0.8, "playerLight": 52},  // opcionális: sötét dungeon
  "ambience": {"dust": true, "drips": [[14, 16]]}   // opcionális: lebegő por, csöpögő víz
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

## Tervezett formátumok (a 3–4. szakaszhoz)

A validátor ezeket a mezőket már most ellenőrzi; a többi mező szabadon bővíthető.

```jsonc
// items.json
{"id": "sword_bronze_01", "name": "item.sword_bronze_01.name", "slot": "weapon", "rarity": "common1"}
// loot_tables.json -- a dungeon "lootTable" mezője hivatkozhat rá
{"id": "loot_crypt_chest", "entries": [{"item": "sword_bronze_01", "weight": 3}, {"gold": [5, 15], "weight": 5}]}
// shop.json
{"id": "offer_sword_bronze_01", "item": "sword_bronze_01", "price": 40}
// tasks.json
{"id": "task_articles_01", "type": "choice", "prompt": "task.articles_01.prompt", "answers": ["der", "die", "das"], "correct": 0}
```

A `rarity` a `src/config/config.js` → `rarities` egyik `id`-ja.
