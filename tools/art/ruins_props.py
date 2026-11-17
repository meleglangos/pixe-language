"""Az erdei rom propjai a láda-ablak hátteréhez (assets/custom/ruins_props.png), egy lapon:
   x 0..24  (25×50): mohos lovagszobor talapzaton, kardja hegyével lefelé maga előtt
   x 26..38 (13×44): ép oszlop (fejezet, hornyolt törzs, lábazat)
   x 40..52 (13×28): törött oszlop
Futtatás: python3 tools/art/ruins_props.py   (a repó gyökeréből)
"""
import random
from PIL import Image

SHEET_W, SHEET_H = 53, 50
C = {
    'o': (24, 28, 30), 'hi': (190, 198, 194), 'l': (152, 162, 158), 'm': (120, 130, 127), 'd': (90, 99, 97),
    'dd': (62, 69, 68), 'k': (34, 38, 40),
    'g1': (52, 84, 40), 'g2': (82, 122, 50), 'g3': (134, 170, 70),
}
img = Image.new('RGBA', (SHEET_W, SHEET_H), (0, 0, 0, 0))
rnd = random.Random(7)


class Sprite:
    def __init__(self, ox, w, h):
        self.ox, self.w, self.h = ox, w, h
        self.px = {}

    def put(self, x, y, c):
        if 0 <= x < self.w and 0 <= y < self.h:
            self.px[(x, y)] = c

    def span(self, y, x0, x1, c=None):
        """kitöltött sor; c nélkül kő-árnyalás balról (világos) jobbra (sötét)"""
        for x in range(x0, x1 + 1):
            if c:
                self.put(x, y, c)
            else:
                t = (x - x0) / max(1, x1 - x0)
                self.put(x, y, 'hi' if t < 0.12 else 'l' if t < 0.4 else 'm' if t < 0.72 else 'd' if t < 0.9 else 'dd')

    def sym(self, cx, y, h, c=None):
        self.span(y, cx - h, cx + h, c)

    def moss(self, amount):
        """moha a felülről szabad pixeleken, lecsorgó szálakkal"""
        tops = [(x, y) for (x, y) in self.px if (x, y - 1) not in self.px and self.px[(x, y)] not in ('k',)]
        for (x, y) in tops:
            if rnd.random() < amount:
                self.px[(x, y)] = rnd.choice(['g2', 'g3', 'g2'])
                for k in range(1, rnd.choice([1, 1, 2, 3, 4])):
                    if (x, y + k) in self.px:
                        self.px[(x, y + k)] = 'g1' if k > 1 else 'g2'

    def cracks(self, n, length):
        keys = [p for p in self.px if self.px[p] in ('l', 'm', 'd')]
        for _ in range(n):
            x, y = rnd.choice(keys)
            for _ in range(length):
                if (x, y) in self.px and self.px[(x, y)] not in ('g1', 'g2', 'g3'):
                    self.px[(x, y)] = 'dd'
                x += rnd.choice([-1, 0, 1]); y += 1

    def draw(self):
        solid = set(self.px)
        for (x, y), c in self.px.items():
            edge = any((x + dx, y + dy) not in solid for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))
            moss = c in ('g1', 'g2', 'g3')
            col = ('g1' if moss else 'o') if edge else c
            img.putpixel((self.ox + x, y + (SHEET_H - self.h)), C[col] + (255,))


# ---------- lovagszobor ----------
s = Sprite(0, 25, 50)
cx = 12
for y in range(10, 41): s.sym(cx, y, 8 + (y - 10) // 15, 'dd')   # köpeny a háta mögött
for y in range(10, 41): s.put(cx - 8 - (y - 10) // 15, y, 'd')
for y in range(0, 2): s.sym(cx, y, 2)            # sisak teteje
for y in range(2, 8): s.sym(cx, y, 3)            # sisak
s.sym(cx, 8, 2)                                  # nyak
s.sym(cx, 9, 6)
for y in range(10, 13): s.sym(cx, y, 8)          # vállvért
for y in range(13, 23): s.sym(cx, y, 7)          # törzs + karok
for y in range(13, 22): s.span(y, cx - 7, cx - 6, None); s.put(cx + 6, y, 'd'); s.put(cx + 7, y, 'dd')
s.sym(cx, 23, 5)                                 # öv
for y in range(24, 31): s.sym(cx, y, 5 + (y - 24) // 4)   # tunika
for y in range(31, 39): s.sym(cx, y, 5)          # lábak
for y in range(39, 41): s.sym(cx, y, 6)          # lábfej
for y in range(41, 43): s.sym(cx, y, 10)         # talapzat teteje
for y in range(43, 49): s.sym(cx, y, 9)          # talapzat
s.sym(cx, 49, 11)                                # talapzat alja
# részletek
s.span(5, cx - 2, cx + 2, 'k')                   # sisakrostély
s.put(cx, 6, 'k')
for y in range(13, 23):                          # a karok és a törzs határa
    s.put(cx - 5, y, 'dd'); s.put(cx + 5, y, 'dd')
s.span(12, cx - 8, cx + 8, 'd')                  # a vállvért alja
s.span(23, cx - 5, cx + 5, 'dd'); s.put(cx, 23, 'hi')     # öv, csat
s.span(42, cx - 10, cx + 10, 'd'); s.span(48, cx - 9, cx + 9, 'dd')
# kard: markolatgomb, kezek a keresztvason, penge lefelé
s.sym(cx, 16, 1, 'l'); s.put(cx, 17, 'm')
s.sym(cx, 18, 3, 'k'); s.sym(cx, 18, 2, 'm'); s.sym(cx, 19, 3, 'k'); s.sym(cx, 19, 2, 'd')   # kesztyűs kezek
s.sym(cx, 20, 5, 'k'); s.sym(cx, 20, 4, 'hi'); s.put(cx + 4, 20, 'm')   # keresztvas
s.sym(cx, 21, 4, 'k')
for y in range(21, 40):
    s.put(cx - 2, y, 'k'); s.put(cx - 1, y, 'l'); s.put(cx, y, 'hi'); s.put(cx + 1, y, 'm'); s.put(cx + 2, y, 'k')
s.put(cx - 1, 40, 'k'); s.put(cx, 40, 'l'); s.put(cx + 1, 40, 'k')
s.cracks(4, 4)
s.moss(0.55)
s.draw()

# ---------- ép oszlop ----------
p = Sprite(26, 13, 44)
c2 = 6
for y in range(0, 2): p.sym(c2, y, 6)
for y in range(2, 4): p.sym(c2, y, 5)
for y in range(4, 40): p.sym(c2, y, 4)
for y in range(40, 42): p.sym(c2, y, 5)
for y in range(42, 44): p.sym(c2, y, 6)
for y in range(4, 40):
    p.put(c2 - 2, y, 'm'); p.put(c2 + 1, y, 'd')  # hornyolás
p.span(1, c2 - 6, c2 + 6, 'd'); p.span(42, c2 - 6, c2 + 6, 'd')
p.cracks(3, 6)
p.moss(0.6)
p.draw()

# ---------- törött oszlop ----------
b = Sprite(40, 13, 28)
top = [6, 4, 3, 2, 0, 1, 3, 5, 7]                 # csipkés törésvonal (oszloponként)
for y in range(0, 24):
    for i, x in enumerate(range(c2 - 4, c2 + 5)):
        if y >= top[i]:
            b.put(x, y, 'hi' if i == 0 else 'l' if i < 3 else 'm' if i < 6 else 'd' if i < 8 else 'dd')
for y in range(4, 24):
    if (c2 - 2, y) in b.px: b.put(c2 - 2, y, 'm')
    if (c2 + 1, y) in b.px: b.put(c2 + 1, y, 'd')
for y in range(24, 26): b.sym(c2, y, 5)
for y in range(26, 28): b.sym(c2, y, 6)
b.span(26, c2 - 6, c2 + 6, 'd')
b.cracks(2, 5)
b.moss(0.7)
b.draw()

img.save('assets/custom/ruins_props.png')
print('assets/custom/ruins_props.png', img.size)
