// A felület összes szövege. de = ami a játékban látszik, hu = a "?" buborék fordítása.
// {név} = behelyettesített érték.
Game.data.strings = {
  'game.title': { de: 'Das Deutsch-Abenteuer', hu: 'A német kaland' },

  // HUD
  'hud.hp':   { de: 'Leben', hu: 'Élet' },
  'hud.gold': { de: 'Gold', hu: 'Arany' },
  'hud.menu': { de: 'Menü', hu: 'Menü' },

  // Általános
  'common.close':  { de: 'Schließen', hu: 'Bezárás' },
  'common.cancel': { de: 'Abbrechen', hu: 'Mégse' },
  'common.back':   { de: 'Zurück', hu: 'Vissza' },

  // Üdvözlés
  'intro.title': { de: 'Willkommen!', hu: 'Üdvözöllek!' },
  'intro.text1': {
    de: 'Schön, dass du da bist! Erkunde die Insel zusammen mit deinem Hund.',
    hu: 'De jó, hogy itt vagy! Fedezd fel a szigetet a kutyáddal együtt.',
  },
  'intro.text2': {
    de: 'Klicke oder tippe auf die Karte, um dorthin zu laufen. Am Computer kannst du auch WASD oder die Pfeiltasten benutzen.',
    hu: 'Kattints vagy koppints a térképre, hogy odasétálj. Számítógépen a WASD-t vagy a nyílbillentyűket is használhatod.',
  },
  'intro.text3': {
    de: 'Das kleine Fragezeichen neben jedem Text zeigt dir die ungarische Übersetzung.',
    hu: 'A minden szöveg melletti kis kérdőjel megmutatja a magyar fordítást.',
  },
  'intro.start': { de: 'Los geht’s!', hu: 'Indulás!' },

  // Menü
  'menu.title':        { de: 'Menü', hu: 'Menü' },
  'menu.export':       { de: 'Spielstand exportieren', hu: 'Mentés exportálása' },
  'menu.import':       { de: 'Spielstand importieren', hu: 'Mentés importálása' },
  'menu.reset':        { de: 'Neues Spiel beginnen', hu: 'Új játék kezdése' },
  'menu.controls':     { de: 'Steuerung', hu: 'Irányítás' },
  'menu.controlsText': {
    de: 'Klicke oder tippe auf die Karte, um zu laufen. WASD und die Pfeiltasten funktionieren auch.',
    hu: 'Kattints vagy koppints a térképre a sétáláshoz. A WASD és a nyílbillentyűk is működnek.',
  },
  'menu.autosave': {
    de: 'Das Spiel speichert automatisch auf diesem Gerät.',
    hu: 'A játék automatikusan ment erre az eszközre.',
  },

  // Export
  'export.title':  { de: 'Spielstand exportieren', hu: 'Mentés exportálása' },
  'export.desc': {
    de: 'Kopiere diesen Code und füge ihn auf einem anderen Gerät unter „Spielstand importieren“ ein.',
    hu: 'Másold ki ezt a kódot, és illeszd be egy másik eszközön a „Mentés importálása” alatt.',
  },
  'export.copy':   { de: 'Code kopieren', hu: 'Kód másolása' },
  'export.copied': { de: 'Kopiert!', hu: 'Kimásolva!' },
  'export.manual': {
    de: 'Der Code ist markiert – bitte kopiere ihn von Hand.',
    hu: 'A kód ki van jelölve – kérlek, másold ki kézzel.',
  },

  // Import
  'import.title': { de: 'Spielstand importieren', hu: 'Mentés importálása' },
  'import.desc': {
    de: 'Füge hier deinen Code ein. Achtung: Der Spielstand auf diesem Gerät wird überschrieben.',
    hu: 'Illeszd be ide a kódodat. Figyelem: az ezen az eszközön lévő mentés felülíródik.',
  },
  'import.placeholder': { de: 'Code hier einfügen …', hu: 'Ide illeszd be a kódot…' },
  'import.load':  { de: 'Spielstand laden', hu: 'Mentés betöltése' },
  'import.error': {
    de: 'Dieser Code ist ungültig. Bitte prüfe, ob du ihn vollständig kopiert hast.',
    hu: 'Ez a kód érvénytelen. Kérlek, ellenőrizd, hogy teljesen kimásoltad-e.',
  },
  'import.ok':    { de: 'Spielstand geladen!', hu: 'Mentés betöltve!' },

  // Új játék
  'reset.title':   { de: 'Neues Spiel', hu: 'Új játék' },
  'reset.confirm': {
    de: 'Möchtest du wirklich neu beginnen? Dein ganzer Fortschritt geht verloren.',
    hu: 'Biztosan újra akarod kezdeni? Az összes eddigi haladásod elvész.',
  },
  'reset.yes':  { de: 'Ja, neu beginnen', hu: 'Igen, újrakezdem' },
  'reset.done': { de: 'Ein neues Abenteuer beginnt!', hu: 'Új kaland kezdődik!' },

  // Helyszínek
  'poi.enter':  { de: 'Betreten', hu: 'Belépés' },
  'poi.locked': {
    de: 'Noch verschlossen – dieser Ort öffnet bald!',
    hu: 'Még zárva – ez a hely hamarosan megnyílik!',
  },
  'poi.type.home':    { de: 'Zuhause', hu: 'Otthon' },
  'poi.type.shop':    { de: 'Laden', hu: 'Bolt' },
  'poi.type.dungeon': { de: 'Verlies', hu: 'Kazamata' },
  'poi.type.boss':    { de: 'Endgegner', hu: 'Főellenség' },

  'poi.home.name': { de: 'Dein Häuschen', hu: 'A házikód' },
  'poi.home.desc': { de: 'Hier ist es warm und gemütlich.', hu: 'Itt meleg van és otthonos.' },
  'poi.shop.name': { de: 'Der Krämerladen', hu: 'A szatócsbolt' },
  'poi.shop.desc': {
    de: 'Ausrüstung, Tränke und kleine Überraschungen.',
    hu: 'Felszerelés, italok és apró meglepetések.',
  },
  'poi.dungeon1.name': { de: 'Die Wurzelhöhle', hu: 'A Gyökérbarlang' },
  'poi.dungeon1.desc': {
    de: 'Eine dunkle Höhle unter den alten Bäumen.',
    hu: 'Egy sötét barlang az öreg fák alatt.',
  },
  'poi.dungeon2.name': { de: 'Die Kristallmine', hu: 'A Kristálybánya' },
  'poi.dungeon2.desc': {
    de: 'Tief im Berg funkeln seltsame Kristalle.',
    hu: 'A hegy mélyén különös kristályok csillognak.',
  },
  'poi.dungeon3.name': { de: 'Die versunkene Gruft', hu: 'Az elsüllyedt kripta' },
  'poi.dungeon3.desc': {
    de: 'Alte Steine, kalte Luft – hier spukt es.',
    hu: 'Régi kövek, hideg levegő – itt kísértetek járnak.',
  },
  'poi.boss.name': { de: 'Der Drachenturm', hu: 'A Sárkánytorony' },
  'poi.boss.desc': {
    de: 'Ganz oben im Turm wartet jemand auf dich.',
    hu: 'A torony legtetején vár rád valaki.',
  },

  // Rarity fokozatok (a 2. szakasztól használjuk)
  'rarity.common1':   { de: 'Gewöhnlich I', hu: 'Közönséges I' },
  'rarity.common2':   { de: 'Gewöhnlich II', hu: 'Közönséges II' },
  'rarity.common3':   { de: 'Gewöhnlich III', hu: 'Közönséges III' },
  'rarity.rare1':     { de: 'Selten I', hu: 'Ritka I' },
  'rarity.rare2':     { de: 'Selten II', hu: 'Ritka II' },
  'rarity.rare3':     { de: 'Selten III', hu: 'Ritka III' },
  'rarity.epic1':     { de: 'Episch I', hu: 'Epikus I' },
  'rarity.epic2':     { de: 'Episch II', hu: 'Epikus II' },
  'rarity.legendary': { de: 'Legendär', hu: 'Legendás' },

  // Hiba
  'error.libs': {
    de: 'Das Spiel konnte nicht geladen werden. Bitte prüfe deine Internetverbindung und lade die Seite neu.',
    hu: 'A játékot nem sikerült betölteni. Kérlek, ellenőrizd az internetkapcsolatot, és töltsd újra az oldalt.',
  },
};
