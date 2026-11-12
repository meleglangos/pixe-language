"""Asset-katalógus építése.

    python3 tools/asset_catalog/build.py

Végigmegy az assets/ mappán, és elkészíti:
  - assets/ASSETS.md        a katalógus (a gépi adatok + a notes.py kézi leírásai)
  - assets/previews/*.png   előnézeti lapok csomagonként és kategóriánként

Új asset feltöltése után: futtasd újra, nézd meg az új előnézeteket, és írd be a leírásukat
a notes.py-ba (ami nincs leírva, azt a katalógus "LEÍRÁS HIÁNYZIK" jelzéssel listázza).
"""
import os
import re
import sys
from collections import OrderedDict
from PIL import Image

sys.path.insert(0, os.path.dirname(__file__))
from scan import ASSETS, scan, slug  # noqa: E402
from rules import CATEGORIES, PACKS, classify  # noqa: E402
import previews as pv  # noqa: E402
import notes  # noqa: E402

PREV = os.path.join(ASSETS, 'previews')


def note_for(item):
    for pat, desc, tags in notes.FILES:
        if re.search(pat, item['path']):
            return desc, tags
    return None, None


def frames_text(item):
    f = item.get('frames')
    if not f:
        return ''
    fw, fh, n = f
    t = '%d kocka, %d×%d' % (n, fw, fh)
    if item.get('frame_note'):
        t += ' (' + item['frame_note'] + ')'
    return t


def build_previews(groups):
    """Visszaad: (csomag, kategória) -> [előnézeti fájlok relatív útvonala]"""
    out = {}
    if os.path.isdir(PREV):
        for f in os.listdir(PREV):
            if f.endswith('.png'):
                os.remove(os.path.join(PREV, f))
    for (pack, cat), items in groups.items():
        mode = items[0]['mode']
        catname = items[0]['catname']
        title = '%s — %s' % (PACKS[pack], catname)
        files = []
        if mode == 'grid':
            entries = []
            for it in items:
                im = Image.open(os.path.join(ASSETS, it['path'])).convert('RGBA')
                frame = pv.first_frame(im, it.get('frames'))
                sub = '%d kocka' % it['frames'][2] if it.get('frames') else '%d×%d' % (it['w'], it['h'])
                entries.append((it['id'].split(':', 1)[1], sub, frame))
            per_page = 60
            for page in range(0, len(entries), per_page):
                name = '%s-%s%s.png' % (pack, cat, '' if page == 0 else '-%d' % (page // per_page + 1))
                pv.grid_sheet(title, entries[page:page + per_page], os.path.join(PREV, name))
                files.append(name)
        elif mode == 'atlas':
            for it in items:
                im = Image.open(os.path.join(ASSETS, it['path'])).convert('RGBA')
                name = '%s-%s-%s.png' % (pack, cat, slug(it['id'].split(':', 1)[1].split('/')[-1]))
                col_labels = notes.WEAPON_COLUMNS if pack == 'wp' else None
                pv.atlas_sheet('%s  ·  %d×%d px  ·  mező 16 px (oszlop, sor)' % (it['id'], it['w'], it['h']),
                               im, os.path.join(PREV, name), col_labels=col_labels)
                it['preview'] = name
                files.append(name)
        elif mode == 'icons':
            icons = sorted(items, key=lambda it: int(re.search(r'(\d+)', it['inner']).group(1)))
            per_page = 256
            for page in range(0, len(icons), per_page):
                chunk = icons[page:page + per_page]
                first = re.search(r'(\d+)', chunk[0]['inner']).group(1)
                last = re.search(r'(\d+)', chunk[-1]['inner']).group(1)
                name = '%s-%s-%s-%s.png' % (pack, cat, first, last)
                pv.icon_sheet('%s — item%s … item%s' % (PACKS[pack], first, last),
                              [(re.search(r'(\d+)', it['inner']).group(1), Image.open(os.path.join(ASSETS, it['path'])).convert('RGBA')) for it in chunk],
                              os.path.join(PREV, name))
                files.append(name)
        out[(pack, cat)] = files
    return out


def md_escape(s):
    return s.replace('|', '\\|')


def build_markdown(groups, prev_files, counts):
    L = []
    w = L.append
    w('# Asset-katalógus')
    w('')
    w('> Generálva: `python3 tools/asset_catalog/build.py`. Ne szerkeszd kézzel: a leírások a')
    w('> `tools/asset_catalog/notes.py`-ban vannak, a gépi adatok (méret, képkockák) a fájlokból jönnek.')
    w('> Előnézetek: `assets/previews/`. Útvonalak az `assets/` mappához képest.')
    w('')
    w(notes.SUMMARY.strip())
    w('')
    w('## Számok')
    w('')
    w('| Csomag | Képfájl | Leírt tétel |')
    w('| --- | ---: | ---: |')
    for pack in PACKS:
        c = counts.get(pack, (0, 0))
        w('| %s | %d | %d |' % (PACKS[pack], c[0], c[1]))
    w('')
    w('## Tartalom')
    w('')
    for pack in PACKS:
        w('- **%s**' % PACKS[pack])
        for (p, cat), items in groups.items():
            if p == pack:
                w('  - [%s](#%s) (%d)' % (items[0]['catname'], slug(pack + '-' + cat), len(items)))
    w('')

    current = None
    for (pack, cat), items in groups.items():
        if pack != current:
            current = pack
            w('---')
            w('')
            w('## %s' % PACKS[pack])
            w('')
            if pack in notes.PACK_NOTES:
                w(notes.PACK_NOTES[pack].strip())
                w('')
        w('<a id="%s"></a>' % slug(pack + '-' + cat))
        w('### %s' % items[0]['catname'])
        w('')
        cat_note = notes.CATEGORY_NOTES.get((pack, cat))
        if cat_note:
            w(cat_note.strip())
            w('')
        files = prev_files.get((pack, cat), [])
        if files:
            w('Előnézet: ' + ', '.join('[`previews/%s`](previews/%s)' % (f, f) for f in files))
            w('')
        if items[0]['mode'] == 'icons':
            continue  # a csoportos leírás a CATEGORY_NOTES-ban van
        w('| Azonosító | Fájl | Méret | Képkockák | Leírás | Címkék |')
        w('| --- | --- | --- | --- | --- | --- |')
        for it in items:
            desc, tags = note_for(it)
            prev = (' · [előnézet](previews/%s)' % it['preview']) if it.get('preview') else ''
            w('| `%s` | `%s` | %d×%d | %s | %s%s | %s |' % (
                it['id'], md_escape(it['path']), it['w'], it['h'], frames_text(it) or '–',
                md_escape(desc or '**LEÍRÁS HIÁNYZIK**'), prev, md_escape(', '.join(tags or []))))
        w('')
    return '\n'.join(L) + '\n'


def main():
    items = scan(classify)
    order = {(p, c): i for i, (p, c, *_rest) in enumerate(CATEGORIES)}
    items.sort(key=lambda it: (list(PACKS).index(it['pack']), order.get((it['pack'], it['cat']), 999), it['path']))
    groups = OrderedDict()
    for it in items:
        groups.setdefault((it['pack'], it['cat']), []).append(it)
    prev_files = build_previews(groups)
    counts = {}
    for it in items:
        c = counts.setdefault(it['pack'], [0, 0])
        c[0] += 1
        if it['mode'] == 'icons' or note_for(it)[0]:
            c[1] += 1
    md = build_markdown(groups, prev_files, counts)
    with open(os.path.join(ASSETS, 'ASSETS.md'), 'w') as f:
        f.write(md)
    missing = [it['path'] for it in items if it['mode'] != 'icons' and not note_for(it)[0]]
    print('Képfájlok:', len(items), '| előnézetek:', sum(len(v) for v in prev_files.values()), '| leírás nélkül:', len(missing))
    for m in missing[:40]:
        print('  hiányzik:', m)


if __name__ == '__main__':
    main()
