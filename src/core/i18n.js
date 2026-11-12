// Szövegek lekérése a data/strings.json-ból (Game.data.strings).
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
