"""Előnézeti lapok: kategóriánként rács, minden kép alatt az azonosítója;
atlaszoknál (tilesetek) a teljes kép 16 px-es ráccsal és mező-koordinátákkal."""
import os
from PIL import Image, ImageDraw, ImageFont

BG = (54, 56, 70, 255)
CELL_BG = (72, 75, 92, 255)
INK = (235, 235, 240, 255)
SUB = (170, 175, 195, 255)
GRID = (255, 60, 210, 85)
GRID_TXT = (255, 230, 80, 255)

try:
    FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 11)
    FONT_B = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 15)
    FONT_S = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf', 9)
except OSError:  # pragma: no cover
    FONT = FONT_B = FONT_S = ImageFont.load_default()


def save(img, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    rgb = img.convert('RGB')
    colors = rgb.getcolors(256)
    if colors is not None:  # legfeljebb 256 szín: veszteség nélkül palettára
        rgb = rgb.quantize(colors=256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE)
    rgb.save(path, optimize=True)


def first_frame(im, frames, max_frames=1):
    """Előnézeti kép egy fájlhoz: animációnál az első néhány kocka egymás mellett,
    a tartalomra vágva (a sok üres hely nélkül, pl. a 100×100-as kockákban álló kis figurák)."""
    if not frames:
        b = im.getbbox()
        return im.crop(b) if b else im
    fw, fh, n = frames
    cols = max(1, im.width // fw)
    cells = [im.crop(((i % cols) * fw, (i // cols) * fh, (i % cols) * fw + fw, (i // cols) * fh + fh)) for i in range(n)]
    boxes = [c.getbbox() for c in cells[:max_frames] if c.getbbox()] or [c.getbbox() for c in cells if c.getbbox()]
    if not boxes:
        return cells[0]
    x0, y0 = min(b[0] for b in boxes), min(b[1] for b in boxes)
    x1, y1 = max(b[2] for b in boxes), max(b[3] for b in boxes)
    x0, y0, x1, y1 = max(0, x0 - 1), max(0, y0 - 1), min(fw, x1 + 1), min(fh, y1 + 1)
    shown = cells[:max_frames]
    w = (x1 - x0)
    strip = Image.new('RGBA', (w * len(shown) + 2 * (len(shown) - 1), y1 - y0), (0, 0, 0, 0))
    for i, c in enumerate(shown):
        strip.alpha_composite(c.crop((x0, y0, x1, y1)), (i * (w + 2), 0))
    return strip


def fit(im, box):
    """Egész számú nagyítás / kicsinyítés, hogy beleférjen a dobozba."""
    w, h = im.size
    if w <= box and h <= box:
        s = max(1, min(4, box // max(w, h)))
        return im.resize((w * s, h * s), Image.NEAREST)
    d = 2
    while w // d > box or h // d > box:
        d += 1
    return im.resize((max(1, w // d), max(1, h // d)), Image.NEAREST)


def trim(text, width, font):
    if font.getlength(text) <= width:
        return text
    while text and font.getlength('…' + text) > width:
        text = text[1:]
    return '…' + text


def grid_sheet(title, entries, out, box=96, cols=None, assets_dir='.'):
    """entries: [(label, sublabel, PIL kép)]"""
    cw, ch = box + 16, box + 34
    cols = cols or max(1, min(len(entries), 1200 // cw))
    rows = (len(entries) + cols - 1) // cols
    img = Image.new('RGBA', (cols * cw + 16, rows * ch + 44), BG)
    d = ImageDraw.Draw(img)
    d.text((10, 10), title, font=FONT_B, fill=INK)
    for i, (label, sub, im) in enumerate(entries):
        x, y = 8 + (i % cols) * cw, 36 + (i // cols) * ch
        d.rectangle((x + 2, y + 2, x + cw - 3, y + box + 10), fill=CELL_BG)
        t = fit(im, box)
        img.alpha_composite(t, (x + (cw - t.width) // 2, y + 6 + (box - t.height) // 2))
        d.text((x + 3, y + box + 12), trim(label, cw - 6, FONT), font=FONT, fill=INK)
        if sub:
            d.text((x + 3, y + box + 24), trim(sub, cw - 6, FONT_S), font=FONT_S, fill=SUB)
    save(img, out)


def atlas_sheet(title, im, out, cell=16, scale=None, col_labels=None, row_labels=None):
    """Atlasz / tileset: teljes kép, rács, oszlop- és sorszámok (mezőben)."""
    w, h = im.size
    scale = scale or (3 if w <= 300 else 2 if w <= 1000 else 1)
    pad_l, pad_t = 30, 46 + (14 if col_labels else 0)
    big = im.resize((w * scale, h * scale), Image.NEAREST)
    img = Image.new('RGBA', (big.width + pad_l + 8, big.height + pad_t + 8), BG)
    back = Image.new('RGBA', big.size, CELL_BG)
    back.alpha_composite(big)
    img.alpha_composite(back, (pad_l, pad_t))
    d = ImageDraw.Draw(img)
    d.text((10, 8), title, font=FONT_B, fill=INK)
    step = cell * scale
    every = 1 if step >= 24 else 2 if step >= 12 else 4
    for i in range(0, w // cell + 1):
        x = pad_l + i * step
        d.line((x, pad_t, x, pad_t + big.height), fill=GRID, width=1)
        if i < w // cell and i % every == 0:
            d.text((x + 2, pad_t - 13), str(i), font=FONT_S, fill=GRID_TXT)
            if col_labels and i < len(col_labels):
                d.text((x + 2, pad_t - 27), col_labels[i], font=FONT_S, fill=SUB)
    for j in range(0, h // cell + 1):
        y = pad_t + j * step
        d.line((pad_l, y, pad_l + big.width, y), fill=GRID, width=1)
        if j < h // cell and j % every == 0:
            d.text((4, y + 2), str(j) if not row_labels else row_labels[j], font=FONT_S, fill=GRID_TXT)
    save(img, out)


def icon_sheet(title, icons, out, cols=16, scale=3):
    """Sok kis ikon számozva (pl. Items16)."""
    cw, ch = 16 * scale + 12, 16 * scale + 16
    rows = (len(icons) + cols - 1) // cols
    img = Image.new('RGBA', (cols * cw + 16, rows * ch + 44), BG)
    d = ImageDraw.Draw(img)
    d.text((10, 10), title, font=FONT_B, fill=INK)
    for i, (label, im) in enumerate(icons):
        x, y = 8 + (i % cols) * cw, 36 + (i // cols) * ch
        d.rectangle((x + 2, y + 2, x + cw - 3, y + 16 * scale + 5), fill=CELL_BG)
        img.alpha_composite(im.resize((16 * scale, 16 * scale), Image.NEAREST), (x + 6, y + 4))
        d.text((x + 4, y + 16 * scale + 5), label, font=FONT_S, fill=INK)
    save(img, out)
