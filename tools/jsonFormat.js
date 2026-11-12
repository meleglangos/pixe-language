// Olvasható JSON: ami elfér egy sorban (max. 110 karakter), az egy sorba kerül, a többi tagolva.
// A tools/ szkriptek ezzel írják a data/*.json fájlokat, hogy mindig ugyanígy nézzenek ki.
function inline(v) {
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(inline).join(', ') + ']';
  return '{' + Object.keys(v).map(k => JSON.stringify(k) + ': ' + inline(v[k])).join(', ') + '}';
}
function format(v, indent) {
  const one = inline(v);
  if (v === null || typeof v !== 'object' || indent.length + one.length <= 110) return one;
  const inner = indent + '  ';
  if (Array.isArray(v)) return '[\n' + v.map(x => inner + format(x, inner)).join(',\n') + '\n' + indent + ']';
  return '{\n' + Object.keys(v).map(k => inner + JSON.stringify(k) + ': ' + format(v[k], inner)).join(',\n') + '\n' + indent + '}';
}
module.exports = value => format(value, '') + '\n';
