// Test du parcours OAuth avec un faux Google (GIS + API simulés, mêmes formats de réponse que l'API réelle).
const { chromium, devices } = require('playwright');
const out = process.argv[2];
const FAKE_GIS = `window.google = { accounts: { oauth2: {
  initTokenClient: (cfg) => ({ requestAccessToken: () => { window.__gisCfg = cfg; setTimeout(() => cfg.callback({ access_token: 'ya29.FAKE', expires_in: 3599, scope: cfg.scope }), 50); } }),
  hasGrantedAllScopes: () => true, revoke: (t, cb) => { window.__revoked = t; cb && cb(); } } } };`;
const vid = (id, title, ch, chId, dur, views) => ({ id, snippet: { title, channelTitle: ch, channelId: chId, publishedAt: '2026-10-01T10:00:00Z', liveBroadcastContent: 'none', thumbnails: { high: { url: `https://i.ytimg.com/vi/${id}/hqdefault.jpg` } } }, contentDetails: { duration: dur }, statistics: { viewCount: String(views), likeCount: '1200', commentCount: '88' } });
const LIKED = { items: [vid('aaaaaaaaaa1', 'Session acoustique en studio', 'Chaîne Test A', 'UCA', 'PT4M12S', 120000), vid('aaaaaaaaaa2', 'Tutoriel : monter une étagère', 'Chaîne Test B', 'UCB', 'PT12M5S', 54000), vid('aaaaaaaaaa3', 'Vlog : 3 jours à Lyon', 'Chaîne Test A', 'UCA', 'PT18M40S', 8000)] };
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices['iPhone 15 Pro'] });
  const calls = [];
  await ctx.route('https://accounts.google.com/gsi/client', (r) => r.fulfill({ contentType: 'text/javascript', body: FAKE_GIS }));
  await ctx.route(/googleapis\.com/, (r) => {
    const u = r.request().url(); const auth = r.request().headers().authorization; calls.push(u.replace(/\?.*/, '') + ' ' + (auth ? 'Bearer✓' : 'SANS JETON'));
    if (auth !== 'Bearer ya29.FAKE') return r.fulfill({ status: 401, json: { error: { message: 'unauthorized' } } });
    if (u.includes('userinfo')) return r.fulfill({ json: { name: 'Raphaël Test', email: 'compte.test@example.com', picture: 'https://lh3.googleusercontent.com/x' } });
    if (u.includes('/subscriptions')) return r.fulfill({ json: { items: [{ snippet: { title: 'Chaîne Test A', resourceId: { channelId: 'UCA' }, thumbnails: {} } }, { snippet: { title: 'Chaîne Test B', resourceId: { channelId: 'UCB' }, thumbnails: {} } }] } });
    if (u.includes('myRating=like')) return r.fulfill({ json: LIKED });
    if (u.includes('/playlists')) return r.fulfill({ json: { items: [{ id: 'PL1', snippet: { title: 'Musique du soir', thumbnails: {} }, contentDetails: { itemCount: 2 } }] } });
    if (u.includes('/channels')) return r.fulfill({ json: { items: [{ snippet: { title: 'Chaîne Test A', thumbnails: {} }, statistics: { subscriberCount: '45000', videoCount: '120' }, contentDetails: { relatedPlaylists: { uploads: 'UUA' } } }] } });
    if (u.includes('/playlistItems')) return r.fulfill({ json: { items: [{ contentDetails: { videoId: 'aaaaaaaaaa1' } }, { contentDetails: { videoId: 'aaaaaaaaaa3' } }] } });
    if (u.includes('/videos?part=snippet,contentDetails,statistics&id=')) return r.fulfill({ json: { items: [LIKED.items[0], LIKED.items[2]] } });
    r.fulfill({ status: 404, json: {} });
  });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  const shot = async (n) => { await p.waitForTimeout(400); await p.screenshot({ path: `${out}/g-${n}.png` }); };
  const res = {};
  await p.goto('http://localhost:8766/?p=you'); await p.waitForTimeout(300); await shot('1-deconnecte');
  // sans ID client : feuille de configuration
  await p.click('[data-act=gsignin]'); await shot('2-config');
  await p.fill('#g-id', 'pas-un-id'); await p.click('#g-form button'); res.validation = await p.textContent('#toast');
  await p.fill('#g-id', '123456-abc.apps.googleusercontent.com'); await p.click('#g-form button'); await p.waitForTimeout(800);
  await shot('3-connecte');
  res.scope = await p.evaluate(() => window.__gisCfg.scope);
  res.user = await p.textContent('.you-head h2');
  res.tokenInStorage = await p.evaluate(() => JSON.stringify({ ...localStorage }).includes('ya29') || JSON.stringify({ ...sessionStorage }).includes('ya29'));
  res.passwordFields = await p.evaluate(() => document.querySelectorAll('input[type=password], input[autocomplete*=password]').length);
  await p.click('[data-go=subs]'); await shot('4-abonnements');
  res.subs = await p.$$eval('.subs-row span', (e) => e.map((x) => x.textContent));
  await p.click('[data-ych=UCA]'); await p.waitForTimeout(500); await shot('5-chaine-reelle');
  res.channelVideos = await p.$$eval('#page-channel .result .vtitle', (e) => e.map((x) => x.textContent));
  await p.click('#page-channel .result'); await p.waitForTimeout(300);
  res.embed = await p.getAttribute('#player iframe', 'src');
  await p.click('[data-go=you]'); await p.click('[data-ypl=PL1]'); await p.waitForTimeout(400); res.playlist = await p.$$eval('#page-list .result', (e) => e.length);
  await p.click('[data-go=you]'); await p.click('[data-act=gsignout]'); await p.waitForTimeout(200);
  res.revoked = await p.evaluate(() => window.__revoked); res.afterSignOut = await p.textContent('.you-head h2');
  await shot('6-deconnexion');
  console.log(JSON.stringify(res, null, 1)); console.log('appels API :', [...new Set(calls)]); console.log('erreurs JS :', errs);
  await b.close();
})();
