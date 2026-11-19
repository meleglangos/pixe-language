"""A kereshető katalógus oldal (catalog.html) adatai: assets/catalog_data.js.

A build.py hívja. Minden kép egy bejegyzés (Pixel Crawler, karakterek stb.: fájlonként), az ikoncsomagok
ikononként: Items16 (a sorszám-tartomány leírásával), Weapon Icons (anyag × oszlop × sor, az oszlop fegyverfajtájával).
Az oldal ezt tölti be, plusz a data/bundle.js-t, hogy jelölje, melyik ikon szerepel már tárgyként a játékban.
"""
import json
import os
import re

import notes
from rules import PACKS, HIDDEN_CATEGORIES, HIDDEN_ITEM16
from item16_names import NAMES as ITEM16_NAMES

MATERIALS = {'bronze': 'bronz', 'iron': 'vas', 'steel': 'acél', 'gold': 'arany'}


def md_rows(text):
    """Egy markdown táblázat sorai (a fejléc és az elválasztó nélkül) cellák listájaként."""
    rows = []
    for line in text.splitlines():
        line = line.strip()
        if not line.startswith('|') or set(line) <= set('|- '):
            continue
        cells = [c.strip() for c in line.strip('|').split('|')]
        rows.append(cells)
    return rows[1:] if rows else []


def num_range(s):
    m = re.match(r'(\d+)\s*[–-]\s*(\d+)', s)
    if m:
        return int(m.group(1)), int(m.group(2))
    m = re.match(r'(\d+)', s)
    return (int(m.group(1)), int(m.group(1))) if m else None


def item16_ranges():
    out = []
    for cells in md_rows(notes.CATEGORY_NOTES[('it', 'ikon')]):
        r = num_range(cells[0])
        if r:
            out.append((r[0], r[1], cells[1], [t.strip() for t in cells[2].split(',') if t.strip()]))
    return out


def weapon_names():
    """oszlop -> (felső fél neve, alsó fél neve); a "15: lándzsa, 16: díszes lándzsa" alakú cellát oszloponként bontja."""
    def pick(cell, col):
        parts = re.findall(r'(\d+)(?:\s*[–-]\s*(\d+))?\s*:\s*([^,]+?)(?=,\s*\d+\s*[:–-]|$)', cell)
        for a, b, name in parts:
            lo, hi = int(a), int(b or a)
            if lo <= col <= hi:
                return name.strip()
        return re.sub(r'^\d+\s*[–-]\s*\d+\s*:\s*', '', cell).strip()
    out = {}
    for cells in md_rows(notes.CATEGORY_NOTES[('wp', 'fegyver-ikon')]):
        r = num_range(cells[0])
        if not r:
            continue
        for col in range(r[0], r[1] + 1):
            out[col] = (pick(cells[1], col), pick(cells[2], col))
    return out


def build(items, note_for, assets_dir):
    entries = []
    ranges = item16_ranges()
    wnames = weapon_names()
    for it in items:
        pack = it['pack']
        if it['mode'] == 'icons':
            n = int(re.search(r'(\d+)', it['inner']).group(1))
            name, tags = 'ikon', []
            for lo, hi, desc, t in ranges:
                if lo <= n <= hi:
                    name, tags = desc, t
                    break
            # pontos név ikononként (item16_names.py); a tartomány leírása a címkék közé kerül (keresni ebben is lehet)
            e = {'id': 'it:%d' % n, 'pack': pack, 'cat': tags[0] if tags else 'egyéb', 'name': ITEM16_NAMES.get(n, name),
                 'tags': tags + ([name] if n in ITEM16_NAMES else []), 'src': 'assets/' + it['path'], 'w': 16, 'h': 16}
            if any(lo <= n <= hi for lo, hi in HIDDEN_ITEM16):
                e['hidden'] = True
            entries.append(e)
            continue
        if pack == 'wp' and it['cat'] == 'fegyver-ikon':
            mat = os.path.basename(it['path']).split('-')[0]
            for row in range(it['h'] // 16):
                for col in range(it['w'] // 16):
                    top, bottom = wnames.get(col, ('fegyver', 'fegyver'))
                    nm = top if row < 10 else bottom
                    entries.append({'id': 'wp:%s c%d r%d' % (mat, col, row), 'pack': pack, 'cat': 'fegyver',
                                    'name': '%s (%s, %d. változat)' % (nm, MATERIALS.get(mat, mat), row % 10 + 1),
                                    'tags': ['fegyver', MATERIALS.get(mat, mat)], 'src': 'assets/' + it['path'],
                                    'sheet': [it['w'], it['h']], 'x': col * 16, 'y': row * 16, 'w': 16, 'h': 16})
            continue
        desc, tags = note_for(it)
        e = {'id': it['id'], 'pack': pack, 'cat': it['catname'], 'name': desc or it['path'].split('/')[-1],
             'tags': tags or [], 'src': 'assets/' + it['path'], 'w': it['w'], 'h': it['h'], 'file': True}
        if it.get('frames'):
            e['frame'] = list(it['frames'][:2])
        if (pack, it['cat']) in HIDDEN_CATEGORIES:
            e['hidden'] = True
        entries.append(e)
    data = {'packs': PACKS, 'entries': entries}
    path = os.path.join(assets_dir, 'catalog_data.js')
    with open(path, 'w') as f:
        f.write('// GENERÁLT FÁJL – ne szerkeszd! Forrás: tools/asset_catalog/build.py (catalog_page.py)\n')
        f.write('window.ASSET_CATALOG = ')
        json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
        f.write(';\n')
    return len(entries)
