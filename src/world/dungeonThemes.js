// Dungeon-témák: hogyan néz ki a padló, a fal, az ajtó és a kijárat.
// A DungeonScene minden dungeonnél ugyanaz; a kinézetet a dungeon "theme" mezője választja ki.
//
// Egy téma:
//   voidColor                      - a "semmi" színe a pályán kívül
//   paintBase(scene, ctx, L)       - padló + falak megrajzolása; L = { W, H, at(x,y), floor(x,y) }
//   blockedExtra(L) -> [[x,y],..]  - plusz nem járható mezők (pl. sziklás sarkok)   [opcionális]
//   door(scene, ctx, d)            - átjáró megrajzolása; visszaad { overlay, gate } képeket
//   exit(scene, ctx, e)            - kijárat megrajzolása (2 mező széles, 3 magas a falban)
//
// Pályajelek (layout): '#' fal, '.' padló, ',' másik padló, '~' víz (nem járható),
//                      'x' szakadék (nem járható), '=' híd (járható)
(function () {
  const TS = 16;
  const themes = Game.dungeonThemes = {};
  const draw = (scene, ctx, name, x, y) => Game.gfx.drawFrame(scene, ctx, name, x, y);
  const canvasTex = (scene, key, w, h) => {
    if (scene.textures.exists(key)) scene.textures.remove(key);
    return scene.textures.createCanvas(key, w, h);
  };

  // ======================= KRIPTA =======================
  themes.crypt = {
    voidColor: '#141412',

    paintBase(scene, ctx, L) {
      const f = L.floor;
      for (let y = 0; y < L.H; y++) for (let x = 0; x < L.W; x++) {
        const px = x * TS, py = y * TS;
        if (f(x, y)) {
          const hash = (x * 73 + y * 151 + x * y * 7) % 23;
          draw(scene, ctx, hash < 2 ? 'floor_alt_' + ((x + y) % 4) : 'floor_' + ((x % 3) + (y % 3) * 3), px, py);
        } else if (f(x, y + 1)) draw(scene, ctx, 'wall_bottom_' + (x % 3), px, py);
        else if (f(x, y + 2)) draw(scene, ctx, 'wall_top_' + (x % 3), px, py);
        else if (f(x, y + 3)) draw(scene, ctx, 'wall_cap_' + (x % 3), px, py);
      }
      // a csomagban nincs oldalsó / alsó falperem: vékony kőszegély kódból, a fal színeivel
      for (let y = 0; y < L.H; y++) for (let x = 0; x < L.W; x++) {
        if (!f(x, y)) continue;
        const px = x * TS, py = y * TS;
        if (!f(x - 1, y)) { ctx.fillStyle = '#394554'; ctx.fillRect(px - 3, py, 3, TS); ctx.fillStyle = '#607897'; ctx.fillRect(px - 1, py, 1, TS); }
        if (!f(x + 1, y)) { ctx.fillStyle = '#394554'; ctx.fillRect(px + TS, py, 3, TS); ctx.fillStyle = '#607897'; ctx.fillRect(px + TS, py, 1, TS); }
        if (!f(x, y + 1) && !f(x, y + 4)) { ctx.fillStyle = '#394554'; ctx.fillRect(px - (f(x - 1, y) ? 0 : 3), py + TS, TS + (f(x - 1, y) ? 0 : 3) + (f(x + 1, y) ? 0 : 3), 3); ctx.fillStyle = '#607897'; ctx.fillRect(px, py + TS, TS, 1); }
        if (!f(x, y - 1)) { ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.fillRect(px, py, TS, 4); } // árnyék a fal tövében
      }
    },

    // Nyitott kőboltív; a belseje átlátszó, így a karakter a kőkeret mögött megy át.
    door(scene, ctx, d) {
      const px = d.x * TS, py = (d.y - 2) * TS;
      const tex = canvasTex(scene, 'door_' + d.x + '_' + d.y, 32, 48), c = tex.getContext();
      draw(scene, c, 'door_arch', 0, 0);
      c.globalCompositeOperation = 'destination-out';
      [[7, 12, 20], [8, 10, 22], [9, 9, 23], [10, 7, 25], [11, 7, 25], [12, 6, 26], [13, 5, 27], [14, 5, 27]].forEach(([y, a, b]) => c.fillRect(a, y, b - a, 1));
      c.fillRect(4, 15, 24, 33);
      c.globalCompositeOperation = 'source-over';
      tex.refresh();
      draw(scene, ctx, 'door_arch', px, py);
      ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(px + 4, py + 48, 24, 3);
      return {
        overlay: scene.add.image(px, py, tex.key).setOrigin(0, 0),
        gate: scene.add.image(px, py, 'pc_dungeon', 'door_gate').setOrigin(0, 0),
      };
    },

    // Csukott faajtó a falban: ezen jöttünk be.
    exit(scene, ctx, e) { draw(scene, ctx, 'door_wood', e.x * TS, (e.y - 2) * TS); },
  };

  // ======================= BÁNYA =======================
  const walk = c => c === '.' || c === ',' || c === '=';
  const open = c => walk(c) || c === '~' || c === 'x';

  function mineShape(L) {
    const isOpen = (x, y) => open(L.at(x, y));
    // sziklafal-homlokzat: a járható padló fölötti két sor
    const isFace = (x, y) => !isOpen(x, y) && (walk(L.at(x, y + 1)) || (!isOpen(x, y + 1) && walk(L.at(x, y + 2))));
    const O = (x, y) => isOpen(x, y) || isFace(x, y);
    return { isOpen, isFace, O };
  }

  // Gerendakeretes vágat a sziklafalban (ajtóhoz és kijárathoz).
  function tunnel(scene, ctx, x, y, key, glow) {
    const px = x * TS, py = (y - 2) * TS;
    for (let j = 0; j < 3; j++) for (let i = 0; i < 2; i++) draw(scene, ctx, 'dirt_' + (((x + i) % 3) + ((y + j) % 3) * 3), px + i * TS, py + j * TS);
    const g = ctx.createLinearGradient(0, py, 0, py + 48);
    g.addColorStop(0, 'rgba(4,6,12,0.86)'); g.addColorStop(1, 'rgba(4,6,12,0.5)');
    ctx.fillStyle = g; ctx.fillRect(px, py, 32, 48);
    if (glow) { // kintről beszűrődő fény
      const gl = ctx.createLinearGradient(0, py, 0, py + 48);
      gl.addColorStop(0, 'rgba(190,220,255,0.75)'); gl.addColorStop(1, 'rgba(190,220,255,0)');
      ctx.fillStyle = gl; ctx.fillRect(px + 5, py, 22, 48);
    }
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(px, py, 4, 48); ctx.fillRect(px + 28, py, 4, 48);
    // keret: két oszlop + szemöldökfa; külön képként a karakter fölé kerül
    const tex = canvasTex(scene, key, 40, 56), c = tex.getContext();
    draw(scene, c, 'wood_post', 3, 24); draw(scene, c, 'wood_post', 3, 8);
    draw(scene, c, 'wood_post', 31, 24); draw(scene, c, 'wood_post', 31, 8);
    draw(scene, c, 'wood_beam', 4, 5); draw(scene, c, 'wood_beam', 4, 0);
    tex.refresh();
    return scene.add.image(px - 4, py - 8, key).setOrigin(0, 0);
  }

  themes.mine = {
    voidColor: '#0a0e12',

    blockedExtra(L) {
      // a lekerekített sziklasarkok a padló alsó sarkaiba lógnak
      const { O } = mineShape(L), out = [];
      for (let y = 0; y < L.H; y++) for (let x = 0; x < L.W; x++) {
        if (walk(L.at(x, y)) && L.at(x, y) !== '=' && !O(x, y + 1) && (!O(x - 1, y) || !O(x + 1, y))) out.push([x, y]);
      }
      return out;
    },

    paintBase(scene, ctx, L) {
      const { isFace, O } = mineShape(L);
      const at = L.at;
      const multiply = (color, x, y, w, h) => { ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = color; ctx.fillRect(x, y, w, h); ctx.globalCompositeOperation = 'source-over'; };

      // tömör szikla: halvány textúra a sötétben
      ctx.globalAlpha = 0.07;
      for (let y = 0; y < L.H; y++) for (let x = 0; x < L.W; x++) if (!O(x, y)) draw(scene, ctx, 'rock_fill', x * TS, y * TS);
      ctx.globalAlpha = 1;

      for (let y = 0; y < L.H; y++) for (let x = 0; x < L.W; x++) {
        const c = at(x, y), px = x * TS, py = y * TS, i9 = (x % 3) + (y % 3) * 3;
        if (c === '.' || c === ',') {
          ctx.fillStyle = '#20282a'; ctx.fillRect(px, py, TS, TS);
          draw(scene, ctx, (c === ',' ? 'dirt_' : 'cobble_') + i9, px, py);
          multiply(c === ',' ? '#7d7f96' : '#7e94aa', px, py, TS, TS); // hideg, kékesszürke tónus
        } else if (c === '~') {
          ctx.fillStyle = '#082430'; ctx.fillRect(px, py, TS, TS);
        } else if (c === 'x' || c === '=') {
          // szakadék: a perem alatt lefelé sötétedő sziklafal, aztán feketeség
          ctx.fillStyle = '#04060b'; ctx.fillRect(px, py, TS, TS);
          let depth = 0;
          while (depth < 3 && (at(x, y - depth - 1) === 'x' || at(x, y - depth - 1) === '=')) depth++;
          const above = at(x, y - depth - 1);
          if (depth < 3 && (walk(above) && above !== '=')) {
            draw(scene, ctx, 'rock_face_' + (depth % 2 ? 'b' : 'a') + (x % 3), px, py);
            ctx.fillStyle = 'rgba(4,6,11,' + [0.35, 0.68, 0.9][depth] + ')'; ctx.fillRect(px, py, TS, TS);
          }
        } else if (isFace(x, y)) {
          draw(scene, ctx, 'rock_face_' + (isFace(x, y + 1) ? 'a' : 'b') + (x % 3), px, py);
        }
      }

      // híd: pallók a szakadék fölött, kétoldalt kötélkorlát
      for (let y = 0; y < L.H; y++) for (let x = 0; x < L.W; x++) {
        if (at(x, y) !== '=') continue;
        const px = x * TS, py = y * TS;
        draw(scene, ctx, 'planks_' + ((x % 3) + (y % 3) * 3), px, py);
        if (at(x - 1, y) !== '=') { ctx.fillStyle = '#2a1a10'; ctx.fillRect(px - 2, py, 3, TS); ctx.fillStyle = '#c9a26a'; ctx.fillRect(px - 2, py, 1, TS); }
        if (at(x + 1, y) !== '=') { ctx.fillStyle = '#2a1a10'; ctx.fillRect(px + TS - 1, py, 3, TS); ctx.fillStyle = '#c9a26a'; ctx.fillRect(px + TS + 1, py, 1, TS); }
      }

      // sziklaperem a nyílt terek körül (a csomag "gödör" mintájából)
      const v = (x, y) => (x * 7 + y * 13) % 2;
      for (let y = 0; y < L.H; y++) for (let x = 0; x < L.W; x++) {
        const px = x * TS, py = y * TS;
        if (!O(x, y)) {
          if (O(x, y + 1)) draw(scene, ctx, !O(x - 1, y + 1) && O(x + 1, y + 1) ? 'rock_top_l' : !O(x + 1, y + 1) && O(x - 1, y + 1) ? 'rock_top_r' : 'rock_top_' + v(x, y), px, py);
          if (O(x, y - 1)) draw(scene, ctx, !O(x - 1, y - 1) && O(x + 1, y - 1) ? 'rock_bot_l' : !O(x + 1, y - 1) && O(x - 1, y - 1) ? 'rock_bot_r' : 'rock_bot_' + v(x, y), px, py);
          if (O(x + 1, y)) draw(scene, ctx, !O(x + 1, y - 1) && O(x + 1, y + 1) ? 'rock_left_t' : !O(x + 1, y + 1) && O(x + 1, y - 1) ? 'rock_left_b' : 'rock_left_' + v(x, y), px, py);
          if (O(x - 1, y)) draw(scene, ctx, !O(x - 1, y - 1) && O(x - 1, y + 1) ? 'rock_right_t' : !O(x - 1, y + 1) && O(x - 1, y - 1) ? 'rock_right_b' : 'rock_right_' + v(x, y), px, py);
        } else if (walk(at(x, y)) && at(x, y) !== '=' && !O(x, y + 1)) {
          if (!O(x - 1, y)) draw(scene, ctx, 'rock_in_bl', px, py);
          else if (!O(x + 1, y)) draw(scene, ctx, 'rock_in_br', px, py);
        }
      }

      // árnyékok: a falak tövében és a peremek mentén
      for (let y = 0; y < L.H; y++) for (let x = 0; x < L.W; x++) {
        if (!walk(at(x, y)) || at(x, y) === '=') continue;
        const px = x * TS, py = y * TS;
        if (isFace(x, y - 1)) { ctx.fillStyle = 'rgba(0,0,0,0.38)'; ctx.fillRect(px, py, TS, 3); ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(px, py + 3, TS, 4); }
        if (!O(x - 1, y)) { ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(px, py, 3, TS); }
        if (!O(x + 1, y)) { ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(px + TS - 3, py, 3, TS); }
        const below = at(x, y + 1);
        if (below === 'x' || below === '~') { ctx.fillStyle = 'rgba(190,215,235,0.22)'; ctx.fillRect(px, py + TS - 1, TS, 1); }
      }
    },

    door(scene, ctx, d) {
      const overlay = tunnel(scene, ctx, d.x, d.y, 'door_' + d.x + '_' + d.y, false);
      // zárva: deszkatorlasz
      const tex = canvasTex(scene, 'gate_' + d.x + '_' + d.y, 32, 48), c = tex.getContext();
      [14, 23, 32, 41].forEach((y, i) => draw(scene, c, 'wood_plank', i % 2 ? 1 : -1, y));
      tex.refresh();
      return { overlay, gate: scene.add.image(d.x * TS, (d.y - 2) * TS, tex.key).setOrigin(0, 0) };
    },

    // Kijárat: gerendakeretes vágat, a végén beszűrődő fénnyel.
    exit(scene, ctx, e) {
      const overlay = tunnel(scene, ctx, e.x, e.y, 'exit_' + e.x + '_' + e.y, true);
      overlay.setDepth(3);
    },
  };
})();
