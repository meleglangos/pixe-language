// Kódból rajzolt placeholder grafika.
// Minden textúra kulcs szerint van regisztrálva; amelyikhez az assets.js-ben PNG tartozik,
// azt a BootScene tölti be, és itt már nem rajzolódik meg.
(function () {
  const OUT = '#2a1b22';

  function rng(seed) {
    let s = seed >>> 0;
    return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  }
  function R(ctx, c, x, y, w, h) { ctx.fillStyle = c; ctx.fillRect(x, y, w === undefined ? 1 : w, h === undefined ? 1 : h); }
  function ell(ctx, c, cx, cy, rx, ry) {
    ctx.fillStyle = c;
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
        if (dx * dx + dy * dy <= 1) ctx.fillRect(x, y, 1, 1);
      }
    }
  }
  const disc = (ctx, c, cx, cy, r) => ell(ctx, c, cx, cy, r, r);

  // 1 pixeles sötét körvonal a nem átlátszó pixelek köré (egy x0..x0+w, y0..y0+h cellán belül).
  function outline(ctx, x0, y0, w, h, color) {
    const img = ctx.getImageData(x0, y0, w, h), d = img.data;
    const solid = (x, y) => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] > 200;
    const edge = [];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (d[(y * w + x) * 4 + 3] === 0 && (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1))) edge.push([x, y]);
    }
    edge.forEach(([x, y]) => R(ctx, color || OUT, x0 + x, y0 + y));
  }

  // ---------- talaj ----------
  function tile(base, specks, n, seed, extra) {
    return {
      w: 16, h: 16,
      draw(ctx) {
        const r = rng(seed);
        R(ctx, base, 0, 0, 16, 16);
        for (let i = 0; i < n; i++) R(ctx, specks[Math.floor(r() * specks.length)], Math.floor(r() * 16), Math.floor(r() * 16));
        if (extra) extra(ctx, r);
      },
    };
  }
  const blades = c => (ctx, r) => { for (let i = 0; i < 4; i++) { const x = 1 + Math.floor(r() * 14), y = 1 + Math.floor(r() * 13); R(ctx, c, x, y, 1, 2); R(ctx, c, x + 1, y + 1); } };
  const flowers = (ctx, r) => {
    blades('#4f9440')(ctx, r);
    const cols = ['#ffffff', '#ffd94a', '#ff9db5', '#c9a0ff'];
    for (let i = 0; i < 4; i++) {
      const x = 1 + Math.floor(r() * 13), y = 1 + Math.floor(r() * 13), c = cols[Math.floor(r() * cols.length)];
      R(ctx, c, x, y, 2, 2); R(ctx, '#e8a020', x, y + 1);
    }
  };
  const waves = (ctx, r) => { for (let i = 0; i < 3; i++) { const x = Math.floor(r() * 12), y = 2 + Math.floor(r() * 12); R(ctx, '#7dbdea', x, y, 3, 1); R(ctx, '#a9d8f5', x + 1, y - 1, 2, 1); } };
  const pebbles = (ctx, r) => { for (let i = 0; i < 3; i++) { const x = 1 + Math.floor(r() * 13), y = 1 + Math.floor(r() * 13); R(ctx, '#84847f', x, y, 2, 1); R(ctx, '#bdbdb6', x, y - 1, 2, 1); } };

  const images = {};
  for (let i = 0; i < 3; i++) {
    images['tile_grass_' + i] = tile('#62ad4c', ['#5aa346', '#6cb856', '#5aa346'], 26, 11 + i, blades('#4f9440'));
    images['tile_darkgrass_' + i] = tile('#4d8f42', ['#46853c', '#56994a', '#417c38'], 28, 21 + i, blades('#3b7334'));
  }
  for (let i = 0; i < 2; i++) {
    images['tile_flowers_' + i] = tile('#62ad4c', ['#5aa346', '#6cb856'], 20, 31 + i, flowers);
    images['tile_rocky_' + i] = tile('#a3a39c', ['#999992', '#adada6', '#8f8f88'], 30, 41 + i, pebbles);
    images['tile_sand_' + i] = tile('#ecd9a2', ['#e3cd92', '#f3e3b4', '#dcc588'], 22, 51 + i);
    images['tile_path_' + i] = tile('#d6b77c', ['#c9a96c', '#e0c48c', '#bf9f63'], 26, 61 + i);
    images['tile_water_' + i] = tile('#3f8fd0', ['#3b88c8', '#4797d8'], 18, 71 + i, waves);
  }

  // Átmenetek a talajtípusok között (a WorldScene hívja a talaj kirajzolása után).
  // groupAt(x, y) -> 'land' | 'sand' | 'path' | 'water'
  function decorateGround(ctx, map, groupAt) {
    const ts = map.tileSize;
    for (let y = 0; y < map.height; y++) for (let x = 0; x < map.width; x++) {
      const g = groupAt(x, y), px = x * ts, py = y * ts;
      const n = groupAt(x, y - 1), s = groupAt(x, y + 1), w = groupAt(x - 1, y), e = groupAt(x + 1, y);
      if (g === 'water') {
        if (n !== 'water') { R(ctx, '#2a5f96', px, py, ts, 3); R(ctx, '#8a6a42', px, py, ts, 1); }
        if (s !== 'water') R(ctx, '#b5ddf5', px, py + ts - 1, ts, 1);
        if (w !== 'water') R(ctx, '#b5ddf5', px, py, 1, ts);
        if (e !== 'water') R(ctx, '#b5ddf5', px + ts - 1, py, 1, ts);
      } else if (g === 'path') {
        const c = '#a98c56';
        if (n !== 'path' && n !== 'water') R(ctx, c, px, py, ts, 1);
        if (s !== 'path' && s !== 'water') R(ctx, c, px, py + ts - 1, ts, 1);
        if (w !== 'path' && w !== 'water') R(ctx, c, px, py, 1, ts);
        if (e !== 'path' && e !== 'water') R(ctx, c, px + ts - 1, py, 1, ts);
      } else if (g === 'sand') {
        const c = '#cdb67c';
        if (n === 'land') R(ctx, c, px, py, ts, 1);
        if (s === 'land') R(ctx, c, px, py + ts - 1, ts, 1);
        if (w === 'land') R(ctx, c, px, py, 1, ts);
        if (e === 'land') R(ctx, c, px + ts - 1, py, 1, ts);
      }
    }
  }

  // ---------- tereptárgyak ----------
  const shadow = (ctx, cx, cy, rx, ry) => ell(ctx, 'rgba(20,30,20,0.28)', cx, cy, rx, ry);
  function sprite(w, h, body, shade) {
    return {
      w, h,
      draw(ctx) {
        body(ctx);
        outline(ctx, 0, 0, w, h);
        if (shade) { ctx.globalCompositeOperation = 'destination-over'; shade(ctx); ctx.globalCompositeOperation = 'source-over'; }
      },
    };
  }

  images.obj_tree_oak = sprite(32, 44, ctx => {
    R(ctx, '#7a5230', 13, 28, 6, 13); R(ctx, '#5c3b20', 17, 28, 2, 13); R(ctx, '#7a5230', 12, 39, 8, 2);
    disc(ctx, '#2f7a3a', 16, 18, 13);
    disc(ctx, '#2f7a3a', 8, 22, 6); disc(ctx, '#2f7a3a', 24, 22, 6);
    disc(ctx, '#3f9447', 15, 15, 11);
    disc(ctx, '#3f9447', 8, 20, 4); disc(ctx, '#3f9447', 23, 19, 5);
    disc(ctx, '#58ae55', 12, 11, 6); disc(ctx, '#58ae55', 20, 13, 4);
    disc(ctx, '#74c468', 11, 9, 3);
  }, ctx => shadow(ctx, 16, 40, 11, 3.5));

  images.obj_tree_pine = sprite(32, 48, ctx => {
    R(ctx, '#6e4a2c', 14, 36, 4, 9); R(ctx, '#54361e', 16, 36, 2, 9);
    const tiers = [[4, 9, 3], [11, 16, 6], [19, 25, 9], [28, 36, 12]];
    tiers.forEach(([y0, y1, half]) => {
      for (let y = y0; y <= y1; y++) {
        const hw = Math.max(1, Math.round(half * (y - y0 + 2) / (y1 - y0 + 2)));
        R(ctx, '#27664a', 16 - hw, y, hw * 2, 1);
        R(ctx, '#34805a', 16 - hw, y, hw, 1);
      }
      R(ctx, '#1e523b', 16 - half, y1, half * 2, 1);
    });
    R(ctx, '#4a9a6c', 14, 6, 1, 3); R(ctx, '#4a9a6c', 11, 14, 2, 1); R(ctx, '#4a9a6c', 9, 23, 2, 1); R(ctx, '#4a9a6c', 7, 33, 3, 1);
  }, ctx => shadow(ctx, 16, 44, 10, 3));

  images.obj_tree_dead = sprite(32, 40, ctx => {
    const c = '#6b5a52', d = '#4f423c';
    R(ctx, c, 14, 14, 4, 23); R(ctx, d, 16, 14, 2, 23); R(ctx, c, 13, 35, 6, 2);
    R(ctx, c, 9, 16, 5, 2); R(ctx, c, 8, 10, 2, 7); R(ctx, c, 6, 8, 2, 3);
    R(ctx, c, 18, 20, 6, 2); R(ctx, c, 23, 13, 2, 8); R(ctx, c, 25, 11, 2, 3);
    R(ctx, c, 15, 6, 2, 8); R(ctx, c, 13, 4, 2, 3); R(ctx, c, 17, 3, 2, 4);
  }, ctx => shadow(ctx, 16, 37, 8, 2.5));

  images.obj_rock = sprite(16, 16, ctx => {
    ell(ctx, '#8b8b90', 8, 10, 6.5, 4.5); ell(ctx, '#8b8b90', 6, 8, 4, 4);
    ell(ctx, '#a9a9ae', 6, 7, 3, 2.5); R(ctx, '#c6c6ca', 4, 6, 3, 1);
    R(ctx, '#6f6f76', 4, 13, 9, 1); R(ctx, '#6f6f76', 11, 9, 2, 4);
  }, ctx => shadow(ctx, 8, 14, 7, 2));

  images.obj_bush = sprite(16, 16, ctx => {
    ell(ctx, '#347f3c', 8, 10, 6.5, 4.5); disc(ctx, '#347f3c', 5, 8, 3.5); disc(ctx, '#347f3c', 11, 8, 3.5);
    disc(ctx, '#4a9c4c', 5, 7, 2.5); disc(ctx, '#4a9c4c', 10, 7, 2.5);
    R(ctx, '#e0425a', 4, 10, 2, 2); R(ctx, '#e0425a', 9, 11, 2, 2); R(ctx, '#e0425a', 11, 8, 2, 2);
    R(ctx, '#ff8a9c', 4, 10); R(ctx, '#ff8a9c', 9, 11); R(ctx, '#ff8a9c', 11, 8);
  }, ctx => shadow(ctx, 8, 14, 7, 2));

  images.obj_grave = sprite(16, 18, ctx => {
    R(ctx, '#9a9aa6', 4, 5, 8, 11); R(ctx, '#9a9aa6', 5, 3, 6, 2); R(ctx, '#9a9aa6', 6, 2, 4, 1);
    R(ctx, '#7c7c8a', 10, 4, 2, 12); R(ctx, '#bcbcc6', 5, 4, 1, 9);
    R(ctx, '#5e5e6c', 7, 6, 2, 6); R(ctx, '#5e5e6c', 6, 8, 4, 2);
    R(ctx, '#4d8f42', 3, 15, 3, 1); R(ctx, '#4d8f42', 11, 15, 2, 1);
  }, ctx => shadow(ctx, 8, 16, 6, 1.5));

  images.obj_crystal = sprite(16, 20, ctx => {
    const shard = (x, top, w, h, a, b) => {
      for (let i = 0; i < h; i++) { const inset = Math.max(0, Math.ceil(w / 2) - 1 - i); R(ctx, a, x + inset, top + i, w - inset * 2, 1); }
      R(ctx, b, x + Math.floor(w / 2), top + 2, Math.ceil(w / 2), h - 2);
      R(ctx, '#e8fbff', x + 1, top + 3, 1, Math.max(1, h - 7));
    };
    shard(6, 2, 5, 16, '#7fe3f0', '#3fb2cc');
    shard(2, 9, 4, 9, '#9aeaf5', '#4cbcd4');
    shard(10, 8, 4, 10, '#7fe3f0', '#3aa6c0');
  }, ctx => shadow(ctx, 8, 18, 7, 1.8));

  // ---------- épületek / helyszínek (48 széles, az ajtó középen alul) ----------
  function roof(ctx, y0, y1, c, cDark, cLight) {
    for (let y = y0; y <= y1; y++) {
      const inset = Math.max(0, Math.round(9 - (y - y0) * 0.55));
      R(ctx, c, 1 + inset, y, 46 - inset * 2, 1);
      if ((y - y0) % 5 === 4) R(ctx, cDark, 1 + inset, y, 46 - inset * 2, 1);
    }
    R(ctx, cLight, 11, y0, 26, 1); R(ctx, cDark, 1, y1 - 1, 46, 2);
  }
  function windowAt(ctx, x, y) {
    R(ctx, '#6b4a30', x - 1, y - 1, 10, 10); R(ctx, '#9fdcf2', x, y, 8, 8); R(ctx, '#d4f2fb', x + 1, y + 1, 2, 3);
    R(ctx, '#6b4a30', x + 3, y, 2, 8); R(ctx, '#6b4a30', x, y + 3, 8, 2);
  }
  function door(ctx, c, cDark) {
    R(ctx, '#4a3020', 19, 41, 10, 17); R(ctx, c, 20, 42, 8, 16); R(ctx, cDark, 24, 42, 4, 16); R(ctx, '#f2d060', 26, 50, 1, 2);
  }
  const groundShade = h => ctx => R(ctx, 'rgba(20,30,20,0.25)', 2, h - 3, 44, 3);

  images.poi_home = sprite(48, 60, ctx => {
    R(ctx, '#8a4a3a', 33, 4, 6, 12); R(ctx, '#a55c48', 33, 4, 6, 2); R(ctx, '#6e392c', 37, 6, 2, 10);
    R(ctx, '#f3e6c8', 4, 30, 40, 28); R(ctx, '#dccca6', 4, 54, 40, 4); R(ctx, '#9b6b42', 4, 30, 2, 28); R(ctx, '#9b6b42', 42, 30, 2, 28);
    roof(ctx, 8, 31, '#c9503f', '#a03a2e', '#e06a55');
    windowAt(ctx, 8, 40); windowAt(ctx, 32, 40);
    door(ctx, '#9a6236', '#7c4c28');
    R(ctx, '#ff9db5', 8, 50, 2, 2); R(ctx, '#ffd94a', 11, 50, 2, 2); R(ctx, '#ff9db5', 14, 50, 2, 2); R(ctx, '#4a9c4c', 7, 52, 10, 1);
  }, groundShade(60));

  images.poi_shop = sprite(48, 60, ctx => {
    R(ctx, '#e9dcc0', 4, 30, 40, 28); R(ctx, '#cfc09c', 4, 54, 40, 4); R(ctx, '#7a5a3a', 4, 30, 2, 28); R(ctx, '#7a5a3a', 42, 30, 2, 28);
    roof(ctx, 8, 31, '#3f8f9a', '#2c6c78', '#62b4be');
    for (let i = 0; i < 10; i++) R(ctx, i % 2 ? '#fff4e0' : '#e0524a', 4 + i * 4, 32, 4, 6);
    for (let i = 0; i < 10; i++) R(ctx, i % 2 ? '#e2d4b8' : '#b83c38', 4 + i * 4, 37, 4, 1);
    windowAt(ctx, 7, 42);
    R(ctx, '#6b4a30', 31, 41, 12, 11); R(ctx, '#3a2a36', 32, 42, 10, 9);
    R(ctx, '#e0425a', 33, 46, 2, 4); R(ctx, '#f0f0f0', 33, 45, 2, 1); R(ctx, '#58a6e8', 36, 47, 2, 3); R(ctx, '#f0f0f0', 36, 46, 2, 1); R(ctx, '#f2c040', 39, 46, 2, 4);
    R(ctx, '#8a6238', 31, 51, 12, 2);
    door(ctx, '#7c5a8a', '#5f426c');
    R(ctx, '#6b4a30', 19, 14, 10, 10); R(ctx, '#f6e7b8', 20, 15, 8, 8); disc(ctx, '#f2c040', 24, 19, 3); R(ctx, '#fff0a0', 23, 17, 1, 2); R(ctx, '#c4912a', 25, 19, 1, 2);
  }, groundShade(60));

  function mound(ctx, h, c, cDark, cLight) {
    ell(ctx, c, 24, h - 18, 23, 17); R(ctx, c, 1, h - 18, 46, 16);
    ell(ctx, cLight, 17, h - 26, 11, 6);
    R(ctx, cDark, 1, h - 6, 46, 4); R(ctx, cDark, 38, h - 22, 6, 16); R(ctx, cDark, 4, h - 14, 4, 8);
  }
  function archway(ctx, h, glow) {
    ell(ctx, '#18121c', 24, h - 14, 8, 9); R(ctx, '#18121c', 16, h - 14, 16, 12);
    if (glow) { R(ctx, glow, 22, h - 9, 1, 1); R(ctx, glow, 26, h - 9, 1, 1); }
  }

  images.poi_cave = sprite(48, 46, ctx => {
    mound(ctx, 46, '#7c7a72', '#5f5d58', '#96948a');
    ell(ctx, '#3f9447', 14, 13, 9, 3.5); ell(ctx, '#3f9447', 30, 11, 10, 3); ell(ctx, '#58ae55', 28, 10, 6, 1.8); ell(ctx, '#58ae55', 13, 12, 5, 1.8);
    archway(ctx, 46, '#f2d060');
    [[13, 22, 9], [15, 20, 5], [33, 21, 8], [31, 19, 4], [22, 19, 3], [27, 19, 4]].forEach(([x, y, l]) => R(ctx, '#7a5230', x, y, 1, l));
    R(ctx, '#7a5230', 10, 21, 28, 2); R(ctx, '#5c3b20', 10, 22, 28, 1);
  }, groundShade(46));

  images.poi_mine = sprite(48, 46, ctx => {
    mound(ctx, 46, '#8c7f76', '#6a5f58', '#a69a90');
    archway(ctx, 46);
    R(ctx, '#9a6a3a', 13, 22, 4, 22); R(ctx, '#9a6a3a', 31, 22, 4, 22); R(ctx, '#b07c46', 11, 19, 26, 4);
    R(ctx, '#74502a', 15, 22, 2, 22); R(ctx, '#74502a', 33, 22, 2, 22); R(ctx, '#74502a', 11, 22, 26, 1);
    R(ctx, '#f2c040', 23, 24, 2, 3); R(ctx, '#fff0a0', 23, 25, 1, 1);
    R(ctx, '#6a5f58', 19, 42, 10, 1); R(ctx, '#9a9aa0', 20, 38, 1, 6); R(ctx, '#9a9aa0', 27, 38, 1, 6);
    const cr = (x, y, h) => { R(ctx, '#7fe3f0', x, y, 3, h); R(ctx, '#3fb2cc', x + 2, y, 1, h); R(ctx, '#7fe3f0', x + 1, y - 1, 1, 1); R(ctx, '#e8fbff', x, y + 1, 1, 2); };
    cr(5, 30, 8); cr(8, 34, 6); cr(39, 28, 9); cr(42, 33, 6); cr(30, 8, 5);
  }, groundShade(46));

  images.poi_crypt = sprite(48, 54, ctx => {
    R(ctx, '#8e8e9c', 6, 22, 36, 30); R(ctx, '#74748a', 6, 46, 36, 6);
    for (let i = 0; i < 12; i++) R(ctx, '#a6a6b4', 4 + i * 2, 21 - i, 40 - i * 4, 1);
    R(ctx, '#6a6a7e', 3, 21, 42, 2); R(ctx, '#b8b8c6', 22, 4, 4, 9); R(ctx, '#b8b8c6', 20, 6, 8, 3);
    R(ctx, '#b0b0be', 8, 24, 5, 28); R(ctx, '#b0b0be', 35, 24, 5, 28); R(ctx, '#7c7c90', 11, 24, 2, 28); R(ctx, '#7c7c90', 38, 24, 2, 28);
    ell(ctx, '#18121c', 24, 38, 7, 8); R(ctx, '#18121c', 17, 38, 14, 14);
    R(ctx, '#b06ae8', 21, 42, 2, 2); R(ctx, '#b06ae8', 25, 42, 2, 2); R(ctx, '#3a2452', 18, 49, 12, 3);
    R(ctx, '#5e5e72', 30, 27, 1, 5); R(ctx, '#5e5e72', 31, 31, 2, 1); R(ctx, '#5e5e72', 14, 30, 1, 4);
    R(ctx, '#417c38', 6, 50, 4, 2); R(ctx, '#417c38', 37, 49, 5, 3);
  }, groundShade(54));

  images.poi_tower = sprite(48, 92, ctx => {
    const c = '#5c566e', d = '#433e54', l = '#77708c';
    R(ctx, c, 11, 24, 26, 66); R(ctx, d, 30, 24, 7, 66); R(ctx, l, 12, 24, 3, 66);
    R(ctx, d, 7, 84, 34, 6); R(ctx, c, 7, 82, 34, 3);
    R(ctx, c, 6, 14, 36, 12); R(ctx, d, 33, 14, 9, 12); R(ctx, d, 6, 24, 36, 2);
    for (let i = 0; i < 5; i++) { R(ctx, c, 6 + i * 8, 8, 4, 6); R(ctx, l, 6 + i * 8, 8, 1, 6); }
    for (let y = 30; y < 82; y += 7) for (let x = 14 + ((y / 7) % 2) * 4; x < 34; x += 9) R(ctx, d, x, y, 4, 1);
    [[18, 34], [27, 50]].forEach(([x, y]) => { R(ctx, '#18121c', x - 1, y - 1, 6, 9); R(ctx, '#ff8a3a', x, y, 4, 7); R(ctx, '#ffd070', x + 1, y + 1, 2, 3); });
    R(ctx, '#a03038', 20, 16, 8, 14); R(ctx, '#c9404a', 20, 16, 3, 14); R(ctx, '#a03038', 20, 30, 3, 2); R(ctx, '#a03038', 25, 30, 3, 2);
    R(ctx, '#f2c040', 23, 20, 2, 4); R(ctx, '#f2c040', 22, 21, 4, 1);
    ell(ctx, '#18121c', 24, 76, 7, 8); R(ctx, '#18121c', 17, 76, 14, 14);
    R(ctx, '#ff5a3a', 21, 80, 2, 2); R(ctx, '#ff5a3a', 25, 80, 2, 2);
    R(ctx, d, 2, 4, 3, 8); R(ctx, d, 4, 2, 2, 4); R(ctx, d, 43, 4, 3, 8); R(ctx, d, 42, 2, 2, 4);
  }, groundShade(92));

  // ---------- effektek ----------
  images.fx_shadow = { w: 12, h: 5, draw(ctx) { ell(ctx, 'rgba(20,30,20,0.35)', 6, 2.5, 6, 2.5); } };
  images.fx_marker = {
    w: 16, h: 16,
    draw(ctx) {
      ell(ctx, '#ffffff', 8, 9, 6.5, 4.5);
      ctx.globalCompositeOperation = 'destination-out'; ell(ctx, '#000', 8, 9, 4.8, 3); ctx.globalCompositeOperation = 'source-over';
    },
  };
  images.fx_heart = sprite(9, 9, ctx => {
    R(ctx, '#ff5a7a', 1, 2, 3, 3); R(ctx, '#ff5a7a', 5, 2, 3, 3); R(ctx, '#ff5a7a', 2, 1, 1, 1); R(ctx, '#ff5a7a', 6, 1, 1, 1);
    R(ctx, '#ff5a7a', 2, 5, 5, 1); R(ctx, '#ff5a7a', 3, 6, 3, 1); R(ctx, '#ff5a7a', 4, 7, 1, 1); R(ctx, '#ff5a7a', 4, 3, 1, 2);
    R(ctx, '#ffc0cc', 2, 2, 1, 1);
  });

  // ---------- karakterek ----------
  // col: 0 = áll, 1-2 = lépés, 3 = pislogás / farokcsóválás
  function drawGirl(ctx, dir, col) {
    const H = '#6f4526', Hd = '#52301a', Hl = '#8f5c33', S = '#f8d5b0', Sd = '#e3ae88', E = '#4a2a14';
    const D = '#e8607c', Dd = '#bf4460', Dl = '#f58aa0', W = '#ffffff', Sh = '#6a4428';
    const b = col === 1 || col === 2 ? 1 : 0;
    const y0 = 3 + b, y1 = y0 + 11, FOOT = 21;
    const blink = col === 3;
    const leg = (x, lifted) => {
      const top = y1 + 5, shoe = FOOT - (lifted ? 1 : 0);
      if (shoe > top) R(ctx, S, x, top, 2, shoe - top);
      R(ctx, Sh, x, shoe, 2, 1);
    };

    if (dir === 'down' || dir === 'up') {
      leg(5, col === 1); leg(9, col === 2);
      // ruha
      R(ctx, D, 5, y1, 6, 2); R(ctx, D, 4, y1 + 2, 8, 2); R(ctx, D, 3, y1 + 4, 10, 1); R(ctx, Dd, 3, y1 + 4, 10, 1);
      R(ctx, Dl, 5, y1 + 1, 1, 3);
      R(ctx, S, 4, y1 + 1, 1, 3); R(ctx, S, 11, y1 + 1, 1, 3);
      // fej
      R(ctx, H, 5, y0, 6, 1); R(ctx, H, 4, y0 + 1, 8, 1); R(ctx, H, 3, y0 + 2, 10, 1); R(ctx, H, 2, y0 + 3, 12, 8);
      R(ctx, Hl, 6, y0 + 1, 3, 1); R(ctx, Hl, 5, y0 + 2, 2, 1);
      if (dir === 'down') {
        R(ctx, S, 4, y0 + 5, 8, 5); R(ctx, S, 5, y0 + 10, 6, 1); R(ctx, Sd, 6, y0 + 10, 4, 1);
        R(ctx, H, 4, y0 + 5, 2, 1); R(ctx, H, 9, y0 + 5, 3, 1); R(ctx, H, 4, y0 + 6, 1, 1);
        if (blink) { R(ctx, E, 5, y0 + 8, 2, 1); R(ctx, E, 9, y0 + 8, 2, 1); }
        else { R(ctx, E, 5, y0 + 7, 2, 2); R(ctx, E, 9, y0 + 7, 2, 2); R(ctx, W, 5, y0 + 7, 1, 1); R(ctx, W, 9, y0 + 7, 1, 1); }
        R(ctx, '#f6a3a0', 4, y0 + 9, 1, 1); R(ctx, '#f6a3a0', 11, y0 + 9, 1, 1);
        R(ctx, '#c9645a', 7, y0 + 9, 2, 1);
        R(ctx, H, 2, y1, 2, 2); R(ctx, H, 12, y1, 2, 2);
      } else {
        R(ctx, H, 2, y1, 12, 1); R(ctx, H, 3, y1 + 1, 10, 1);
        R(ctx, Hd, 5, y0 + 5, 1, 6); R(ctx, Hd, 8, y0 + 6, 1, 6); R(ctx, Hd, 11, y0 + 5, 1, 5);
      }
    } else { // balra néz (a jobb oldali ennek a tükörképe)
      if (col === 1) { leg(5, false); leg(9, true); }
      else if (col === 2) { leg(8, false); leg(6, true); }
      else { leg(6, false); leg(8, false); }
      R(ctx, D, 5, y1, 6, 2); R(ctx, D, 5, y1 + 2, 7, 2); R(ctx, Dd, 4, y1 + 4, 9, 1);
      R(ctx, S, 7, y1 + 1, 2, 3); R(ctx, Dl, 7, y1, 2, 1);
      R(ctx, H, 5, y0, 6, 1); R(ctx, H, 4, y0 + 1, 8, 1); R(ctx, H, 3, y0 + 2, 10, 1); R(ctx, H, 3, y0 + 3, 11, 8);
      R(ctx, Hl, 6, y0 + 1, 3, 1); R(ctx, Hl, 5, y0 + 2, 2, 1);
      R(ctx, S, 3, y0 + 5, 6, 5); R(ctx, S, 4, y0 + 10, 5, 1); R(ctx, Sd, 5, y0 + 10, 4, 1);
      R(ctx, H, 3, y0 + 5, 3, 1); R(ctx, H, 7, y0 + 5, 2, 2); R(ctx, H, 8, y0 + 7, 1, 2);
      if (blink) R(ctx, E, 4, y0 + 8, 2, 1); else { R(ctx, E, 4, y0 + 7, 2, 2); R(ctx, W, 4, y0 + 7, 1, 1); }
      R(ctx, '#f6a3a0', 6, y0 + 9, 1, 1); R(ctx, '#c9645a', 3, y0 + 9, 1, 1);
      R(ctx, H, 10, y1, 4, 2); R(ctx, H, 11, y1 + 2, 2, 1); R(ctx, Hd, 12, y0 + 5, 1, 7);
    }
  }

  function drawDog(ctx, dir, col) {
    const B = '#b47a42', Dk = '#7d4f28', L = '#e0b07a', N = '#2a1b22';
    const wag = col === 3, s1 = col === 1, s2 = col === 2;
    if (dir === 'down') {
      R(ctx, B, 5, 9, 6, 4);
      R(ctx, B, 5, 13 - (s1 ? 1 : 0), 2, 1); R(ctx, B, 9, 13 - (s2 ? 1 : 0), 2, 1);
      R(ctx, B, wag ? 11 : 10, 8, 2, 2);
      R(ctx, B, 4, 3, 8, 7); R(ctx, Dk, 3, 3, 2, 6); R(ctx, Dk, 11, 3, 2, 6);
      R(ctx, L, 6, 7, 4, 3); R(ctx, N, 7, 7, 2, 1); R(ctx, '#e06a78', 7, 9, 2, 1);
      R(ctx, N, 5, 5, 1, 2); R(ctx, N, 10, 5, 1, 2);
    } else if (dir === 'up') {
      R(ctx, B, 5, 13 - (s1 ? 1 : 0), 2, 1); R(ctx, B, 9, 13 - (s2 ? 1 : 0), 2, 1);
      R(ctx, B, 5, 8, 6, 5); R(ctx, B, 4, 3, 8, 6); R(ctx, Dk, 3, 3, 2, 6); R(ctx, Dk, 11, 3, 2, 6);
      R(ctx, L, wag ? 8 : 7, 8, 2, 3);
    } else { // balra néz
      R(ctx, B, 5, 8, 8, 4); R(ctx, L, 6, 11, 6, 1);
      if (s1) { R(ctx, B, 4, 12, 2, 2); R(ctx, B, 11, 12, 2, 2); R(ctx, Dk, 7, 12, 2, 1); }
      else if (s2) { R(ctx, B, 6, 12, 2, 2); R(ctx, B, 9, 12, 2, 2); }
      else { R(ctx, B, 5, 12, 2, 2); R(ctx, B, 10, 12, 2, 2); }
      if (wag) { R(ctx, B, 13, 7, 2, 2); } else { R(ctx, B, 13, 5, 1, 4); }
      R(ctx, B, 2, 4, 6, 5); R(ctx, L, 1, 6, 2, 3); R(ctx, N, 1, 6, 1, 1);
      R(ctx, N, 3, 5, 1, 2); R(ctx, Dk, 6, 3, 2, 5);
    }
  }

  const sheets = { player: drawGirl, pet: drawDog };

  // ---------- regisztráció ----------
  Game.gfx.decorateGround = decorateGround;

  Game.gfx.generateMissing = function (scene) {
    const tm = scene.textures;
    for (const key of Object.keys(images)) {
      if (tm.exists(key)) continue;
      const def = images[key];
      const tex = tm.createCanvas(key, def.w, def.h);
      def.draw(tex.getContext());
      tex.refresh();
    }
    for (const key of Object.keys(sheets)) {
      if (tm.exists(key)) continue;
      const def = Game.data.assets.sheets[key];
      const fw = def.frameWidth, fh = def.frameHeight, cols = 4;
      const tex = tm.createCanvas(key, fw * cols, fh * def.rows.length);
      const ctx = tex.getContext();
      def.rows.forEach((dir, row) => {
        for (let col = 0; col < cols; col++) {
          ctx.save();
          if (dir === 'right') { ctx.translate((col + 1) * fw, row * fh); ctx.scale(-1, 1); }
          else ctx.translate(col * fw, row * fh);
          sheets[key](ctx, dir === 'right' ? 'left' : dir, col);
          ctx.restore();
          outline(ctx, col * fw, row * fh, fw, fh);
          tex.add(row * cols + col, 0, col * fw, row * fh, fw, fh);
        }
      });
      tex.refresh();
    }
  };

  // Spritesheet képkockáinak száma soronként (a placeholder 4 oszlopos).
  Game.gfx.sheetCols = function (scene, key) {
    const def = Game.data.assets.sheets[key];
    const src = scene.textures.get(key).getSourceImage();
    return Math.floor(src.width / def.frameWidth);
  };
})();
