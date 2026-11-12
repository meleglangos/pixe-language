// A data/*.json ellenőrzése betöltéskor. Nem dob hibát: a talált problémák listáját adja vissza
// (a ContentLoader kiírja őket a konzolra, a tesztek pedig elbuknak, ha van ilyen).
(function () {
  const ID_RE = /^[a-z][a-z0-9_]*$/;
  const LISTS = ['monsters', 'dungeonProps', 'dungeons', 'items', 'lootTables', 'tasks', 'shop'];
  // Ezek az ID-k kerülhetnek a mentésbe: típusokon átívelően is egyedinek kell lenniük.
  const SAVED = ['dungeons', 'items'];

  function validate(raw) {
    const issues = [];
    const bad = msg => issues.push(msg);
    const byId = {};

    LISTS.forEach(key => {
      const list = raw[key] === undefined ? [] : raw[key];
      byId[key] = {};
      if (!Array.isArray(list)) { bad(key + ': tömbnek kell lennie'); return; }
      list.forEach((e, i) => {
        const id = e && e.id;
        if (typeof id !== 'string' || !ID_RE.test(id)) { bad(key + '[' + i + ']: hiányzó vagy hibás id (' + JSON.stringify(id) + '), csak kisbetű, szám, _'); return; }
        if (byId[key][id]) bad(key + ': ismétlődő id: ' + id); // az első marad érvényben (mint a betöltésnél)
        else byId[key][id] = e;
      });
    });
    const seen = {};
    SAVED.forEach(key => Object.keys(byId[key]).forEach(id => {
      if (seen[id]) bad('az id "' + id + '" két típusban is szerepel: ' + seen[id] + ', ' + key);
      seen[id] = key;
    }));

    const strings = raw.strings || {};
    const str = (where, key) => { if (typeof key !== 'string' || !strings[key]) bad(where + ': ismeretlen szöveg-kulcs: ' + key); };
    const ref = (where, key, id) => { if (!byId[key][id]) bad(where + ': ismeretlen ' + key + ' id: ' + id); };

    // térkép
    const map = raw.map || {};
    const poiIds = {};
    (map.pois || []).forEach(p => {
      if (!p || typeof p.id !== 'string' || !ID_RE.test(p.id)) { bad('map.pois: hibás id: ' + JSON.stringify(p && p.id)); return; }
      if (poiIds[p.id]) bad('map.pois: ismétlődő id: ' + p.id);
      poiIds[p.id] = p;
      str('map.pois.' + p.id, 'poi.' + p.id + '.name');
      str('map.pois.' + p.id, 'poi.' + p.id + '.desc');
      if (Game.data.poiTypes && !Game.data.poiTypes[p.type]) bad('map.pois.' + p.id + ': ismeretlen típus: ' + p.type);
    });
    ['ground', 'objects'].forEach(layer => {
      const rows = map[layer] || [];
      if (rows.length !== map.height || rows.some(r => r.length !== map.width)) bad('map.' + layer + ': a mérete nem ' + map.width + 'x' + map.height);
    });

    Object.values(byId.monsters).forEach(m => { str('monsters.' + m.id, m.name); str('monsters.' + m.id, m.desc); });

    Object.values(byId.dungeons).forEach(d => {
      const w = 'dungeons.' + d.id;
      str(w, d.name);
      if (!poiIds[d.id]) bad(w + ': nincs hozzá helyszín a világtérképen (map.pois)');
      if (Game.dungeonThemes && !Game.dungeonThemes[d.theme]) bad(w + ': ismeretlen téma: ' + d.theme);
      const rows = Array.isArray(d.layout) ? d.layout : [];
      if (!rows.length || rows.some(r => typeof r !== 'string' || r.length !== rows[0].length)) bad(w + '.layout: minden sornak azonos hosszúnak kell lennie');
      (d.monsters || []).forEach(m => ref(w + '.monsters', 'monsters', m.type));
      (d.props || []).forEach(p => ref(w + '.props', 'dungeonProps', p[0]));
      if (d.lootTable !== undefined) ref(w + '.lootTable', 'lootTables', d.lootTable);
    });

    const rarities = Game.data.config && Game.data.config.rarities;
    Object.values(byId.items).forEach(it => {
      if (it.name !== undefined) str('items.' + it.id, it.name);
      if (it.rarity !== undefined && rarities && !rarities.some(r => r.id === it.rarity)) bad('items.' + it.id + ': ismeretlen rarity: ' + it.rarity);
    });
    Object.values(byId.lootTables).forEach(t => (t.entries || []).forEach(e => { if (e.item !== undefined) ref('lootTables.' + t.id, 'items', e.item); }));
    Object.values(byId.shop).forEach(s => { if (s.item !== undefined) ref('shop.' + s.id, 'items', s.item); });

    return issues;
  }

  Game.contentValidator = { validate, ID_RE };
})();
