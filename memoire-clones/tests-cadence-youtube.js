const { chromium, devices } = require('playwright');
const FAKE = {
  items: [
    { id:{videoId:'aaaaaaaaaa1'}, snippet:{ title:'Artiste Démo &amp; Co — Titre réel', channelTitle:'Grand Label - Topic', thumbnails:{ high:{ url:'https://i.ytimg.com/vi/aaaaaaaaaa1/hqdefault.jpg' } } } },
    { id:{videoId:'bbbbbbbbbb2'}, snippet:{ title:'Deuxième morceau', channelTitle:'Chaîne Musique', thumbnails:{ high:{ url:'https://i.ytimg.com/vi/bbbbbbbbbb2/hqdefault.jpg' } } } },
  ]
};
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ ...devices['iPhone 15 Pro'] });
  let calls = 0; let lastUrl = '';
  await ctx.route(/googleapis\.com\/youtube\/v3\/search.*/, (r) => { calls++; lastUrl = r.request().url(); r.fulfill({ json: FAKE }); });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8765/'); await p.evaluate(() => localStorage.clear());
  await p.goto('http://localhost:8765/'); await p.waitForTimeout(200);
  const r = {};
  // pas de clé → bannière + pastille démo
  await p.evaluate(() => Cadence.UI.go('home'));
  r.bannerNoKey = await p.isVisible('.setup-card');
  // ajoute une clé
  await p.evaluate(() => { Cadence.Store.data.apiKey = 'AIzaSyFAKEKEY_0123456789abcdefghijklmno'; Cadence.Store.save(); Cadence.Catalog.ytCache = {}; });
  // recherche réelle
  await p.evaluate(() => Cadence.UI.go('search'));
  r.searchResults = await p.evaluate(async () => { const res = await Cadence.Catalog.search('daft punk', Cadence.Store.data.apiKey); return res.map(t => `${t.title} · ${t.artist}`); });
  r.categoryMusic = /videoCategoryId=10/.test(lastUrl);
  // tuile de genre → vraie recherche
  await p.evaluate(() => Cadence.UI.go('search'));
  await p.evaluate(() => Cadence.UI.push({ type: 'genre', id: 'rapfr' }));
  await p.waitForTimeout(400);
  r.genreRows = await p.$$eval('#view-detail .row .r1', e => e.map(x => x.textContent));
  r.genreQuery = decodeURIComponent((lastUrl.match(/[?&]q=([^&]+)/)||[])[1]||'');
  // lecture d'un résultat réel → moteur YouTube (pas simulé)
  r.playsViaYT = await p.evaluate(() => { const t = Cadence.Catalog.ytCache[Object.keys(Cadence.Catalog.ytCache)[0]][0];
    Cadence.Player.playList([t]); return Cadence.Player.engine === undefined ? 'n/a' : (Cadence.Player.current().demo ? 'SIM' : 'YT'); });
  // accueil avec clé → étagère "Sur YouTube"
  await p.evaluate(() => { Cadence.UI.stack = []; Cadence.UI.go('home'); });
  await p.waitForTimeout(400);
  r.homeYTShelf = await p.evaluate(() => !!document.querySelector('[data-shelf=yt]') || document.body.innerHTML.includes('Sur YouTube'));
  r.apiCalls = calls;
  console.log(JSON.stringify(r, null, 1)); console.log('erreurs:', errs);
  await b.close();
})();
