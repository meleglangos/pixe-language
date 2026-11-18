"""A láda-ablak kép-hátterei: az eredeti (letöltött) képekből valódi pixel art készül.
   assets/backgrounds/original/<név>.jpg  ->  assets/backgrounds/chest_<név>.png
Az eredeti nagy, elmosódott "pixeles" kép: 5×5-ös blokkok átlagára kicsinyítjük, és 48 színre csökkentjük
(dither nélkül), így a játékban egész számú (3×) nagyítással éles pixel art lesz belőle.
Futtatás: python3 tools/art/backgrounds.py   (a repó gyökeréből)
"""
import os
from PIL import Image

SRC, DST, FACTOR, COLORS = 'assets/backgrounds/original', 'assets/backgrounds', 5, 48

for f in sorted(os.listdir(SRC)):
    name, ext = os.path.splitext(f)
    if ext.lower() not in ('.jpg', '.jpeg', '.png'):
        continue
    im = Image.open(os.path.join(SRC, f)).convert('RGB')
    small = im.resize((im.width // FACTOR, im.height // FACTOR), Image.BOX)
    px = small.quantize(colors=COLORS, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGB')
    out = os.path.join(DST, 'chest_' + name + '.png')
    px.save(out, optimize=True)
    print(out, px.size)
