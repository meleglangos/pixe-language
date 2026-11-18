"""A láda-ablak kép-hátterei: az eredeti (letöltött) képekből valódi pixel art készül.
   assets/backgrounds/original/<név>.jpg  ->  assets/backgrounds/chest_<név>.png
Az eredeti nagy, elmosódott "pixeles" kép: N×N-es blokkok átlagára kicsinyítjük (N egész, kb. 147 px szélesre), és 48 színre csökkentjük
(dither nélkül), így a játékban egész számú (3×) nagyítással éles pixel art lesz belőle.
Futtatás: python3 tools/art/backgrounds.py   (a repó gyökeréből)
"""
import os
from PIL import Image

SRC, DST, WIDTH, HEIGHT, COLORS = 'assets/backgrounds/original', 'assets/backgrounds', 147, 255, 48

for f in sorted(os.listdir(SRC)):
    name, ext = os.path.splitext(f)
    if ext.lower() not in ('.jpg', '.jpeg', '.png'):
        continue
    im = Image.open(os.path.join(SRC, f)).convert('RGB')
    factor = max(1, min(im.width // WIDTH, im.height // HEIGHT))   # egész számú kicsinyítés: legalább kb. 147×255 maradjon
    small = im.resize((im.width // factor, im.height // factor), Image.BOX)
    px = small.quantize(colors=COLORS, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGB')
    out = os.path.join(DST, 'chest_' + name + '.png')
    px.save(out, optimize=True)
    print(out, px.size)
