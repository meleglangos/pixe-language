"""A "royal" láda pixel art rajza (assets/custom/chest_royal.png): 2 képkocka egy csíkban, 24×22 px-esek.
   0: csukott (domború fedél, fa deszkák, vas pántok és sarkok, aranyzár piros drágakővel)
   1: nyitott (a fedél hátrabillenve, belül csillogó arany)
Futtatás: python3 tools/art/chest_royal.py   (a repó gyökeréből)
"""
from PIL import Image

W, H = 24, 22
P = {
    'o': (27, 18, 32),      # körvonal
    'wd': (74, 36, 22), 'wm': (122, 64, 34), 'wl': (166, 98, 52), 'wh': (196, 128, 70),   # fa: sötét, közép, világos, csúcsfény
    'pl': (52, 26, 16),     # deszka-rés
    'id': (46, 52, 66), 'im': (96, 106, 126), 'il': (160, 172, 192), 'ih': (214, 222, 236),  # vas
    'gd': (158, 92, 24), 'gm': (232, 168, 52), 'gl': (255, 222, 128), 'gh': (255, 248, 210), # arany
    'rd': (110, 14, 34), 'rm': (196, 32, 58), 'rl': (255, 110, 128),                          # rubin
    'in': (30, 16, 12), 'in2': (58, 30, 18),                                                  # a láda belseje
}

def new():
    return Image.new('RGBA', (W, H), (0, 0, 0, 0))

def px(im, x, y, c):
    if 0 <= x < W and 0 <= y < H:
        im.putpixel((x, y), P[c] + (255,))

def rect(im, x0, y0, x1, y1, c):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            px(im, x, y, c)

def outline(im):
    """1 px-es körvonal mindenhol, ahol egy kitöltött pixel átlátszóval érintkezik."""
    src = im.copy()
    solid = lambda x, y: 0 <= x < W and 0 <= y < H and src.getpixel((x, y))[3] > 0
    for y in range(H):
        for x in range(W):
            if not solid(x, y):
                continue
            if any(not solid(x + dx, y + dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                im.putpixel((x, y), P['o'] + (255,))

def wood(im, x0, y0, x1, y1, seams):
    """fa felület: balról világosabb, jobbra sötétebb, vízszintes deszka-résekkel"""
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            t = (x - x0) / max(1, x1 - x0)
            c = 'wl' if t < 0.3 else 'wm' if t < 0.75 else 'wd'
            px(im, x, y, c)
    for y in seams:
        for x in range(x0, x1 + 1):
            px(im, x, y, 'pl')

def iron_v(im, x, y0, y1):
    """függőleges vaspánt (2 px széles), szegecsekkel"""
    for y in range(y0, y1 + 1):
        px(im, x, y, 'il'); px(im, x + 1, y, 'im')
    for y in range(y0 + 1, y1, 4):
        px(im, x, y, 'ih')

def body(im, top):
    """a láda alsó része a top sortól az aljáig"""
    wood(im, 1, top, W - 2, H - 3, seams=[top + 4, top + 8])
    # alsó vaspánt és sarkok
    rect(im, 1, H - 3, W - 2, H - 2, 'im'); rect(im, 1, H - 3, W - 2, H - 3, 'il')
    iron_v(im, 3, top, H - 3); iron_v(im, W - 5, top, H - 3)
    rect(im, 1, top, 3, top + 2, 'il'); rect(im, W - 4, top, W - 2, top + 2, 'im')        # felső sarkok
    rect(im, 1, H - 5, 3, H - 2, 'il'); rect(im, W - 4, H - 5, W - 2, H - 2, 'im')        # alsó sarkok
    px(im, 2, top + 1, 'ih'); px(im, 2, H - 4, 'ih')

def lock(im, y):
    """aranyzár piros drágakővel, a láda közepén"""
    cx = W // 2
    rect(im, cx - 3, y, cx + 2, y + 5, 'gm')
    rect(im, cx - 3, y, cx + 2, y, 'gl'); rect(im, cx - 3, y, cx - 3, y + 5, 'gl')
    rect(im, cx + 2, y + 1, cx + 2, y + 5, 'gd'); rect(im, cx - 2, y + 5, cx + 2, y + 5, 'gd')
    rect(im, cx - 2, y + 1, cx + 1, y + 4, 'rm')          # rubin
    px(im, cx - 2, y + 1, 'rl'); px(im, cx - 1, y + 1, 'rl'); px(im, cx - 2, y + 2, 'rl')
    rect(im, cx, y + 4, cx + 1, y + 4, 'rd'); px(im, cx + 1, y + 3, 'rd')
    px(im, cx - 3, y, 'gh')

def closed():
    im = new()
    # domború fedél: a 2–9. sor, lekerekített tetővel
    rows = {0: (7, W - 8), 1: (4, W - 5), 2: (2, W - 3)}
    for y in range(0, 10):
        x0, x1 = rows.get(y, (1, W - 2))
        for x in range(x0, x1 + 1):
            t = (x - 1) / (W - 3)
            c = 'wh' if (y in (1, 2) and 0.15 < t < 0.6) else 'wl' if t < 0.3 else 'wm' if t < 0.75 else 'wd'
            if y == 8:
                c = 'wd' if t > 0.3 else 'wm'          # árnyék a perem fölött: a fedél domború
            px(im, x, y, c)
    for x in range(2, W - 2):
        px(im, x, 5, 'pl')                                 # deszka-rés a fedélen
    iron_v(im, 3, 1, 9); iron_v(im, W - 5, 1, 9)
    rect(im, 1, 9, W - 2, 10, 'im'); rect(im, 1, 9, W - 2, 9, 'il')   # a fedél vas pereme
    # arany díszítés a fedél közepén
    cx = W // 2
    for (x, y, c) in [(cx - 1, 2, 'gl'), (cx, 2, 'gm'), (cx - 2, 3, 'gm'), (cx + 1, 3, 'gd'), (cx - 1, 3, 'gh'), (cx, 3, 'gl'),
                      (cx - 1, 4, 'gm'), (cx, 4, 'gd'), (cx - 3, 3, 'gd'), (cx + 2, 3, 'gd')]:
        px(im, x, y, c)
    body(im, 11)
    lock(im, 8)
    outline(im)
    return im

def opened():
    im = new()
    # a hátrabillent fedél belseje (vékony sáv a láda mögött)
    for y in range(0, 4):
        x0, x1 = (4, W - 5) if y == 0 else (2, W - 3)
        for x in range(x0, x1 + 1):
            px(im, x, y, 'wd' if y < 2 else 'in2')
    rect(im, 2, 3, W - 3, 3, 'im')
    # a láda nyitott szája: sötét belső, benne arany
    rect(im, 1, 4, W - 2, 10, 'in')
    rect(im, 1, 4, W - 2, 4, 'im'); rect(im, 1, 4, W - 2, 4, 'il')
    gold = [(4, 9), (5, 8), (6, 8), (7, 7), (8, 8), (9, 7), (10, 6), (11, 7), (12, 6), (13, 7), (14, 6), (15, 7), (16, 8), (17, 7), (18, 8), (19, 9)]
    for x, y in gold:
        rect(im, x, y, x, 10, 'gm')
        px(im, x, y, 'gl')
    for x, y in [(7, 7), (12, 6), (14, 6), (17, 7)]:
        px(im, x, y, 'gh')
    for x, y in [(9, 8), (13, 8), (16, 9)]:
        px(im, x, y, 'gd')
    px(im, 11, 8, 'rm'); px(im, 11, 7, 'rl')            # egy rubin a kincsek között
    body(im, 11)
    rect(im, 1, 10, W - 2, 11, 'im'); rect(im, 1, 10, W - 2, 10, 'il')  # a láda pereme
    lock(im, 11)
    outline(im)
    return im

if __name__ == '__main__':
    import os
    strip = Image.new('RGBA', (W * 2, H), (0, 0, 0, 0))
    strip.paste(closed(), (0, 0)); strip.paste(opened(), (W, 0))
    os.makedirs('assets/custom', exist_ok=True)
    strip.save('assets/custom/chest_royal.png')
    print('assets/custom/chest_royal.png', strip.size)
