"""Asset-felmérés: minden képfájl adatai (csomag, kategória, méret, képkockák).

A kategóriákat és az azonosítókat a notes.py szabályai adják; ez a fájl csak a
mechanikus részt végzi (méret, spritesheet-felismerés).
"""
import os
import re
from PIL import Image

ASSETS = os.path.normpath(os.path.join(os.path.dirname(__file__), '..', '..', 'assets'))
SKIP_DIRS = {'previews'}


def rel(path):
    return os.path.relpath(path, ASSETS).replace(os.sep, '/')


def slug(s):
    s = s.lower().replace("'", '')
    s = re.sub(r'[^a-z0-9]+', '-', s)
    return s.strip('-')


def segments_of(flags):
    segs, start = [], None
    for x, c in enumerate(list(flags) + [False]):
        if c and start is None:
            start = x
        elif not c and start is not None:
            segs.append((start, x - 1))
            start = None
    return segs


def best_split(size, segs, min_size):
    """A legtöbb egyenlő részre bontás, ahol minden rész kap tartalmat, és egy szakasz sem lóg át."""
    best = 1
    for n in range(2, size // min_size + 1):
        if size % n:
            continue
        fs = size // n
        if any(a // fs != b // fs for a, b in segs):
            continue
        if len(set(a // fs for a, b in segs)) != n:
            continue
        best = n
    return best


def detect_frames(path, im):
    """Animációs csík / rács felismerése az átlátszó elválasztók alapján.

    Visszaad: (frameW, frameH, darab) vagy None. Csak a nevük alapján animációnak
    látszó fájlokra fut ("Sheet", "anim", "idle", "run"), vagy ha a kép legalább 2x olyan széles, mint magas.
    """
    w, h = im.size
    name = os.path.basename(path).lower()
    is_sheet = 'sheet' in name
    looks_like_strip = is_sheet or 'anim' in name or 'idle' in name or 'run' in name or w >= 2 * h
    if not looks_like_strip:
        return None
    a = im.getchannel('A')
    cols = [any(a.getpixel((x, y)) for y in range(0, h)) for x in range(w)]
    n = best_split(w, segments_of(cols), 8)
    m = 1
    if is_sheet and h >= 48:
        rows = [any(a.getpixel((x, y)) for x in range(0, w)) for y in range(h)]
        m = best_split(h, segments_of(rows), 24)
    if n * m <= 1:
        return None
    return (w // n, h // m, n * m)


def scan(rules):
    """rules: notes.classify(path) -> dict(pack, category, id) vagy None (kihagyás)."""
    items = []
    for root, dirs, files in os.walk(ASSETS):
        dirs[:] = sorted(d for d in dirs if d not in SKIP_DIRS)
        for f in sorted(files):
            if not f.lower().endswith('.png'):
                continue
            path = os.path.join(root, f)
            r = rel(path)
            info = rules(r)
            if info is None:
                continue
            with Image.open(path) as im:
                im = im.convert('RGBA')
                w, h = im.size
                frames = info['frames'] if 'frames' in info else (detect_frames(r, im) if info['mode'] == 'grid' else None)
                bbox = im.getbbox()
            if frames == 'x100':
                frames = (100, 100, w // 100)
            item = dict(info, path=r, w=w, h=h, frames=frames, empty=bbox is None)
            items.append(item)
    return items
