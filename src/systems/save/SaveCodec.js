// Az export/import szövegkód: <előtag>.<base64url(JSON)>.<ellenőrzőösszeg>
// Az előtag (config.exportPrefix, "DA1") a kód formátumát jelöli, nem a mentés verzióját:
// a mentés verziója a JSON-ban van (v), így a régi kódok is betölthetők (migrációval).
(function () {
  function toB64(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = ''; bytes.forEach(b => { bin += String.fromCharCode(b); });
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function fromB64(b64) {
    const bin = atob(b64.replace(/-/g, '+').replace(/_/g, '/'));
    return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0)));
  }
  function checksum(str) { // FNV-1a
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
    return (h >>> 0).toString(36);
  }

  Game.saveCodec = {
    encode(data, prefix) {
      const body = toB64(JSON.stringify(data));
      return prefix + '.' + body + '.' + checksum(body);
    },
    // A kódban lévő nyers adat, vagy null (rossz formátum / sérült kód).
    decode(code, prefix) {
      try {
        const parts = String(code).replace(/\s+/g, '').split('.');
        if (parts.length !== 3 || parts[0] !== prefix) return null;
        if (checksum(parts[1]) !== parts[2]) return null;
        return JSON.parse(fromB64(parts[1]));
      } catch (e) { return null; }
    },
    checksum,
  };
})();
