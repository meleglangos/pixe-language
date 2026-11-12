// Szövegek lekérése a fordítási fájlból (data/translations.json -> Game.data.strings).
// Minden megjelenő szöveg innen jön: Game.i18n.de(kulcs) a játékban látszik, Game.i18n.hu(kulcs) a "?" buborék.
(function () {
  function get(key, lang, vars) {
    const entry = Game.data.strings[key];
    if (!entry) { console.warn('Hiányzó szöveg:', key); return key; }
    let s = entry[lang] || entry.de || key;
    if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
    return s;
  }
  Game.i18n = {
    de: (key, vars) => get(key, 'de', vars),
    hu: (key, vars) => get(key, 'hu', vars),
  };
})();
