const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ ...devices['iPhone 15 Pro'] });
  await ctx.addInitScript(() => {
    const trk = (i, g) => ({ id: 'T' + i, title: 'Morceau ' + i, user: { name: 'Artiste ' + i, handle: 'a' + i }, duration: 180 + i, artwork: { '480x480': 'https://img/' + i + '.jpg' }, genre: g || 'Electronic', play_count: 1000 - i });
    const real = window.fetch;
    window.fetch = (url, opt) => {
      url = String(url);
      const J = (o) => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(o) });
      if (url === 'https://api.audius.co') return J({ data: ['https://host.test'] });
      if (url.includes('/v1/tracks/trending')) { const g = (url.match(/genre=([^&]+)/) || [])[1]; return J({ data: [1, 2, 3, 4, 5].map(i => trk(i, g ? decodeURIComponent(g) : 'Electronic')) }); }
      if (url.includes('/v1/tracks/search')) { const q = decodeURIComponent((url.match(/query=([^&]+)/) || [])[1] || ''); return J({ data: [1, 2, 3].map(i => trk(i + '-' + q)) }); }
      if (url.includes('/stream')) return Promise.resolve({ ok: true, status: 200 });
      return real(url, opt);
    };
  });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8765/'); await p.evaluate(() => localStorage.clear());
  await p.goto('http://localhost:8765/'); await p.waitForTimeout(500);
  const r = {};
  r.search = await p.evaluate(async () => (await Cadence.Audius.search('daft punk')).map(t => `${t.title} | ${t.artist} | ${t.src.includes('/stream') ? 'stream' : 'nostream'} | ${t.audius}`));
  r.playEngine = await p.evaluate(() => { const t = Cadence.Audius.searchCache['daft punk'][0]; Cadence.Player.playList([t]);
    return { engineIsAudio: Cadence.Player.engine === Cadence.AudioEngine, src: Cadence.AudioEngine.el.src, playing: Cadence.Player.playing, cur: Cadence.Player.current().title }; });
  r.media = await p.evaluate(() => navigator.mediaSession && navigator.mediaSession.metadata ? navigator.mediaSession.metadata.title : 'none');
  // genre
  await p.evaluate(() => { Cadence.UI.go('search'); Cadence.UI.push({ type: 'genre', id: 'rapfr' }); });
  await p.waitForTimeout(400);
  r.genreRows = await p.$$eval('#view-detail .row .r1', e => e.map(x => x.textContent));
  r.genreUsedHipHop = await p.evaluate(() => Object.keys(Cadence.Audius.genreCache).includes('rapfr') && Cadence.Audius.genreCache.rapfr.length > 0);
  // home trending
  await p.evaluate(() => { Cadence.UI.stack = []; Cadence.UI.go('home'); });
  await p.waitForTimeout(400);
  r.homeTrending = await p.evaluate(() => !!document.querySelector('[data-shelf=trend]'));
  r.heroCount = await p.$$eval('#view-home .hero', e => e.length);
  // next() advances within audius queue
  r.nextWorks = await p.evaluate(() => { const list = Cadence.Audius.trendCache.slice(0, 3); Cadence.Player.playList(list, 0); const a = Cadence.Player.current().id; Cadence.Player.next(); const b = Cadence.Player.current().id; return a !== b && Cadence.Player.engine === Cadence.AudioEngine; });
  console.log(JSON.stringify(r, null, 1)); console.log('erreurs:', errs.slice(0, 5));
  await b.close();
})();
