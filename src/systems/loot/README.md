# Loot (`Game.loot`, `Game.items`, `Game.itemIcons`)

Zsákmány sorsolása a loot táblákból, és a tárgy-ikonok helye. DOM és Phaser nélküli logika.
Spec: `docs/features/chest_opening.md`, `docs/features/item_system.md`. Adat: `data/items.json`, `data/loot_tables.json` (formátum: `data/README.md`).

## `Game.loot`
| Függvény | Mit csinál |
| --- | --- |
| `roll(tableId, { stars, random })` | `[{ gold }, { item, qty }, …]`: az `always` tételek + húzások a súlyozott `entries`-ből (visszatevéssel); csillaggal a húzásszám, az arany-szorzó és a ritkaság-szorzók a `loot.stars` szerint, csillag nélkül a tábla `rolls`-a; az arany egy tételbe összevonva elöl, az azonos tárgyak összevonva |
| `rollStars(tableId, random)` | 1–5 csillag a `loot.stars.weights` szerint |
| `chances(tableId, stars)` | egy húzás esélyei `[{ item \| gold, p }]`, csökkenő sorrendben (hangoláshoz) |
| `range(v, random)` | `[min, max]` → egész a határokkal együtt; szám → önmaga |

Csomag tétel a táblában: `{"pick": {"kind", "type", "rarity"}, "weight"}` — a szűrőhöz illő tárgyakra bomlik (a súly
egyenlően oszlik meg), a különleges (`exclusive`) tárgyak kimaradnak. A tábla `rarityBoost` mezője (`{"rare": 1.5, …}`)
a ritkaságonkénti esélyt szorozza (nehezebb hely = nagyobb esély a ritkább tárgyra), a csillag-szorzó mellett.
Helyek: a tárgy `places` jelölése (`["crypt"]`, több is lehet) → csak abból a táblából jön, amelyiknek a `places`-e
tartalmazza (egy tábla több helyet is kérhet); jelölés nélkül általános (bárhonnan).

## `Game.items`
| Függvény | Mit csinál |
| --- | --- |
| `get(id)`, `list()` | egy tárgy; az összes, rendezve (ritkább elöl, azon belül kategória, típus) |
| `value(item)` | ár aranyban: a tárgy `value`-ja, különben a ritkaság alapára |
| `stackable(item)` | összeadódik-e a mennyiség (a tárgy `stack`-je, különben a kategóriáé) |
| `stats(item)` | passzívok a config sorrendjében: `[{ id, value, unit }]` |
| `compare(a, b)` | rendező függvény (ritkább elöl) |
| `match({ kind, type, rarity, place }, places)` | a szűrőhöz illő, nem különleges tárgyak (értékek: szöveg vagy tömb); a hely-jelölt tárgyak csak a `places` (a tábla helyei) vagy a `place` szűrő helyeivel |
| `byKind()` | `{ kategória: [tárgyak] }`, a config sorrendjében |
| `rarity(id)`, `rarityIndex(id)` | a ritkaság beállítása; sorszáma a létrán (common = 0) |

A láda-ablak: `src/ui/chestWindow.js` (`Game.chestWindow.open({ style, table, onDone })`).
A sorsolás most nem ír állapotot (a ládából kapott loot csak látvány; a tárolás az inventory feature-rel jön).

## `Game.itemIcons`
| Függvény | Mit csinál |
| --- | --- |
| `parse(icon)` | `"it:901"` → `assets/items/item901.png`; `"wp:bronze c3 r5"` → a bronz fegyverlap 3. oszlop, 5. sor. Visszatér: `{ url, key, frame?, sheet?, x, y }` vagy `null` |
| `files(icons)` | a betöltendő képek listája ismétlés nélkül (a `BootScene` ezzel tölti be) |
