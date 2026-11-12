// Olvasható JSON: ami elfér egy sorban (max. 110 karakter), az egy sorba kerül, a többi tagolva.
// A csak számokból álló hosszú tömbök (Tiled csemperétegek "data" mezője) soronként a réteg
// szélességével tördelve kerülnek ki, így a pálya a fájlban is "látszik".
// A tools/ szkriptek ezzel írják a data/*.json fájlokat, hogy mindig ugyanígy nézzenek ki.
function inline(v) {
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(inline).join(', ') + ']';
  return '{' + Object.keys(v).map(k => JSON.stringify(k) + ': ' + inline(v[k])).join(', ') + '}';
}
function format(v, indent, rowLen) {
  const one = inline(v);
  if (v === null || typeof v !== 'object' || indent.length + one.length <= 110) return one;
  const inner = indent + '  ';
  if (Array.isArray(v)) {
    if (v.length && v.every(x => typeof x === 'number')) {
      const n = rowLen || 20, lines = [];
      for (let i = 0; i < v.length; i += n) lines.push(inner + v.slice(i, i + n).join(','));
      return '[\n' + lines.join(',\n') + '\n' + indent + ']';
    }
    return '[\n' + v.map(x => inner + format(x, inner)).join(',\n') + '\n' + indent + ']';
  }
  const width = Number.isInteger(v.width) && v.width > 0 ? v.width : undefined;
  return '{\n' + Object.keys(v).map(k => inner + JSON.stringify(k) + ': ' + format(v[k], inner, k === 'data' ? width : undefined)).join(',\n') + '\n' + indent + '}';
}
module.exports = value => format(value, '') + '\n';
