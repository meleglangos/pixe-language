"""Melyik fájl melyik csomagba és kategóriába tartozik, és mi az azonosítója.

Egy azonosító rövid, egyedi név, ezzel hivatkozik rá a katalógus és az előnézet.
"""
import re
from scan import slug

PC = 'pixel-crawler/Pixel Crawler - Free Pack/'
MI = 'modern-interiors/Modern tiles_Free/'
WP = 'weapons/16x16 Weapons RPG Icons/'

PACKS = {
    'pc': 'Pixel Crawler (Anokolisa)',
    'wp': '16x16 Weapon RPG Icons (Shade)',
    'it': 'Items16 (Glionox)',
    'mi': 'Modern Interiors – Free (LimeZu)',
    't1': 'Tiny RPG Character Asset Pack 01 – Free: Soldier & Orc (Zerie)',
    't2': 'Tiny RPG Character Asset Pack 02 – Free: Demon_A & Blood Monster_A (Zerie)',
}

# (csomag, kategória-azonosító, kategória neve, minta a csomagon belüli útvonalra, megjelenítés)
#   megjelenítés: 'grid' = rács (egy kép / fájl), 'atlas' = teljes kép ráccsal, 'icons' = számozott ikonok,
#                 'list' = csak a katalógusban, előnézet nélkül
CATEGORIES = [
    ('pc', 'karakter', 'Karakter alaptest (Body_A) animációk', r'^Entities/Characters/', 'grid'),
    ('pc', 'npc', 'NPC-k', r"^Entities/Npc's/", 'grid'),
    ('pc', 'szorny', 'Szörnyek (csontvázak, orkok)', r'^Entities/Mobs/', 'grid'),
    ('pc', 'tileset', 'Tilesetek (padló, fal, víz, dungeon)', r'^Environment/Tilesets/', 'atlas'),
    ('pc', 'fa', 'Fák', r'^Environment/Props/Static/Trees/', 'grid'),
    ('pc', 'prop-animalt', 'Animált propok (serpenyők)', r'^Environment/Props/Animated/', 'grid'),
    ('pc', 'prop', 'Dekoráció / propok (atlaszok)', r'^Environment/Props/Static/', 'atlas'),
    ('pc', 'epulet', 'Épületek (falak, tetők, belső tér)', r'^Environment/Structures/Buildings/', 'atlas'),
    ('pc', 'allomas', 'Munkaállomások (tűz, kemence, üllő...)', r'^Environment/Structures/Stations/', 'grid'),
    ('pc', 'fegyver', 'Fegyver-sprite-ok (kézben tartott)', r'^Weapons/', 'atlas'),
    ('pc', 'mockup', 'Mintakép', r'^MockUps/', 'list'),
    ('wp', 'fegyver-ikon', 'Fegyver ikonok (4 anyag × 480)', r'^(bronze|iron|steel|gold)-weapons', 'atlas'),
    ('wp', 'attekintes', 'A csomag saját áttekintő képe', r'^all-assets', 'list'),
    ('it', 'ikon', 'Tárgy ikonok (1244 db, 16×16)', r'^item\d+\.png$', 'icons'),
    ('mi', 'karakter', 'Karakterek (Adam, Alex, Amelia, Bob)', r'^Characters_free/[^/]+$', 'grid'),
    ('mi', 'rpgmaker', 'RPG Maker MV formátum', r'^Characters_free/RPGMAKERMV/', 'list'),
    ('mi', 'belso-16', 'Belső tér és szobaépítő, 16×16', r'^Interiors_free/16x16/', 'atlas'),
    ('mi', 'belso-nagy', 'Ugyanez 32×32 és 48×48 felbontásban', r'^Interiors_free/(32x32|48x48)/', 'list'),
    ('mi', 'attekintes', 'A csomag saját áttekintő képe', r'^free_overview', 'list'),
    ('mi', 'regi', 'Régi (Old) tilesetek és karakter', r'^Old/', 'list'),
    ('t1', 'lovedek', 'Lövedék (nyílvessző)', r'Arrow', 'grid'),
    ('t1', 'arnyekkal', 'Ugyanezek árnyékkal (with shadows)', r' with shadows/', 'list'),
    ('t2', 'arnyekkal', 'Ugyanezek árnyékkal (with shadows)', r' with shadows/', 'list'),
    ('t1', 'karakter', 'Karakterek animációi (Soldier, Orc)', r'^Characters\(100x100 split\)/[^/]+/[^/]+/[^/]+_\w+\.png$', 'grid'),
    ('t1', 'lap', 'Egyben lévő karakterlapok (soronként egy animáció)', r'^Characters\(100x100 split\)/[^/]+/[^/]+/[^/_]+\.png$', 'list'),
    ('t2', 'karakter', 'Karakterek animációi (Demon_A, Blood Monster_A)', r'^Characters\(100x100 split\)/[^/]+/[^/]+/[^/]+_(Attack|Death|Hurt|Idle|Walk)\d*\.png$', 'grid'),
    ('t2', 'lap', 'Egyben lévő karakterlapok (soronként egy animáció)', r'^Characters\(100x100 split\)/[^/]+/[^/]+/[^/]+\.png$', 'list'),
]

# Ahol az automatikus képkocka-felismerés nem működik (egymáshoz érő figurák), kézzel megadva:
# (minta a teljes útvonalra, (kockaszélesség, kockamagasság, darab), megjegyzés)
FRAME_HINTS = [
    (r'/Trees/', False, ''),  # változat-atlaszok, nem animációk
    (r'Characters_free/\w+_idle_anim_16x16', (16, 32, 24), '4 irány × 6 kocka (jobb, fel, bal, le)'),
    (r'Characters_free/\w+_run_16x16', (16, 32, 24), '4 irány × 6 kocka (jobb, fel, bal, le)'),
    (r'Characters_free/\w+_idle_16x16', (16, 32, 4), '4 irány, 1-1 kocka (jobb, fel, bal, le)'),
    (r'Characters_free/\w+_phone_16x16', (16, 32, 9), 'telefonálás'),
    (r'Characters_free/\w+_sit_16x16', (16, 32, 24), 'ülés, 4 irány × 6'),
    (r'Characters_free/\w+_sit2_16x16', (16, 32, 24), 'ülés (másik), 4 irány × 6'),
    (r'Characters_free/\w+_sit3_16x16', (16, 32, 12), 'ülés (harmadik), 2 irány × 6'),
    (r'Characters_free/[A-Z][a-z]+_16x16\.png', (16, 32, 168), 'teljes karakterlap: 24 oszlop × 7 sor'),
]

T1 = 'tiny-rpg-01/Tiny RPG Character Asset Pack 01 v2.0 -Free Soldier&Orc/'
T2 = 'tiny-rpg-02/Tiny RPG Character Asset Pack 02 -Free Demon_A&Blood Monster_A/'
PREFIX = {'pc': PC, 'wp': WP, 'mi': MI, 'it': 'items/', 't1': T1, 't2': T2}


def make_id(pack, inner):
    p = re.sub(r'\.png$', '', inner)
    if pack == 'pc':
        p = re.sub(r'^(Entities|Environment)/', '', p)
        p = re.sub(r'^(Props/Static|Structures)/', '', p)
        p = p.replace('Characters/Body_A/Animations/', 'body/').replace('Mobs/', '').replace("Npc's/", 'npc/')
        p = p.replace(' Crew/', '/').replace('Skeleton - ', 'skel-').replace('Orc - ', 'orc-')
        p = re.sub(r'_Base/', '/', p)
        p = re.sub(r'-Sheet$', '', p)
        parts = p.split('/')
        out = []
        for part in parts:  # ismétlődő szintek kiszűrése (pl. Idle/Idle)
            if out and slug(part).startswith(slug(out[-1])):
                out[-1] = part
            elif not (out and slug(out[-1]).startswith(slug(part))):
                out.append(part)
        if len(out) >= 3 and out[0] in ('Skeleton', 'Orc'):
            out = out[1:]
        p = '/'.join(out)
    elif pack == 'mi':
        p = p.replace('Characters_free/', '').replace('Interiors_free/', '').replace('_16x16', '').replace('_free', '')
    elif pack in ('t1', 't2'):
        m = re.match(r'Characters\(100x100 split\)/([^/]+)/([^/]+)/(.+)$', inner)
        arrow = re.search(r'Arrow01\((\d+x\d+)\)', inner)
        if arrow:
            p = ('soldier-' if 'Soldier/' in inner else '') + 'arrow-' + arrow.group(1)
        elif m:
            char, sub, fname = m.groups()
            anim = re.sub(r'\.png$', '', fname)[len(char):].lstrip('_') or 'lap'
            p = char + ('-shadow' if 'with shadows' in sub else '') + '/' + anim
    elif pack == 'wp':
        p = p.replace('-weapons', '')
    return pack + ':' + '/'.join(slug(x) for x in p.split('/'))


def classify(path):
    for pack, prefix in PREFIX.items():
        if path.startswith(prefix):
            inner = path[len(prefix):]
            for cpack, cat, cname, pattern, mode in CATEGORIES:
                if cpack == pack and re.search(pattern, inner):
                    d = dict(pack=pack, cat=cat, catname=cname, mode=mode, id=make_id(pack, inner), inner=inner)
                    for pat, fr, note in FRAME_HINTS:
                        if re.search(pat, path):
                            d['frames'], d['frame_note'] = fr or None, note
                            if fr == 'x100':  # 100x100-as kockák egy sorban
                                d['frames'] = 'x100'
                            break
                    return d
            return dict(pack=pack, cat='egyeb', catname='Egyéb', mode='list', id=make_id(pack, inner), inner=inner)
    return None
