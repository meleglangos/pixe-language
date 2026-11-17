// Az "ellenőrizendő" jelölésű szövegek listája (data/translations.json, "review": true).
// Ezekben a német szövegekben nem volt 100%-ig biztos, aki írta; a játékos végigmehet rajtuk.
//
//   node tools/review-list.js     (vagy: npm run review)
const fs = require('fs');
const path = require('path');

function reviewList() {
  const strings = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'translations.json'), 'utf8'));
  return Object.keys(strings).filter(k => strings[k] && strings[k].review === true).map(k => ({ key: k, de: strings[k].de, hu: strings[k].hu }));
}

if (require.main === module) {
  const list = reviewList();
  if (!list.length) console.log('Nincs ellenőrizendő szöveg.');
  else {
    console.log(list.length + ' ellenőrizendő szöveg:\n');
    list.forEach(e => console.log(e.key + '\n  de: ' + e.de + '\n  hu: ' + e.hu + '\n'));
  }
}

module.exports = { reviewList };
