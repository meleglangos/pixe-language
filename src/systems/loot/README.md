# Loot (`Game.loot`, `Game.itemIcons`)

Zsákmány sorsolása a loot táblákból, és a tárgy-ikonok helye. DOM és Phaser nélküli logika.
Spec: `docs/features/chest_opening.md`. Adat: `data/items.json`, `data/loot_tables.json` (formátum: `data/README.md`).

## `Game.loot`
| Függvény | Mit csinál |
| --- | --- |
| `roll(tableId, random)` | `[{ gold }, { item, qty }, …]`: az `always` tételek + `rolls` húzás a súlyozott `entries`-ből (visszatevéssel); az arany egy tételbe összevonva elöl, az azonos tárgyak összevonva |
| `range(v, random)` | `[min, max]` → egész a határokkal együtt; szám → önmaga |

A sorsolás most nem ír állapotot (a ládából kapott loot csak látvány; a tárolás az inventory feature-rel jön).

## `Game.itemIcons`
| Függvény | Mit csinál |
| --- | --- |
| `parse(icon)` | `"it:901"` → `assets/items/item901.png`; `"wp:bronze c3 r5"` → a bronz fegyverlap 3. oszlop, 5. sor. Visszatér: `{ url, key, frame?, sheet?, x, y }` vagy `null` |
| `files(icons)` | a betöltendő képek listája ismétlés nélkül (a `BootScene` ezzel tölti be) |
