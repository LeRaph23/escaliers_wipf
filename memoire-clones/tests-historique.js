const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices['iPhone 15 Pro'] });
  await ctx.addInitScript(() => { window.confirm = () => true; });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8766/'); await p.evaluate(() => localStorage.clear());
  await p.goto('http://localhost:8766/'); await p.waitForTimeout(200);
  const r = {};
  // regarde 2 vidéos, avance le temps de lecture
  await p.evaluate(async () => { const L = window.Lumen;
    L.Watch.open(L.VIDEOS[3]); L.Watch.t = 90; L.Watch.v.secs; L.St.watched[L.VIDEOS[3].id].t = 90; L.St.watched[L.VIDEOS[3].id].secs = L.VIDEOS[3].secs; localStorage.setItem("lumen.v1", JSON.stringify(L.St));
    L.Watch.open(L.VIDEOS[7]); L.St.watched[L.VIDEOS[7].id].t = 30; L.St.watched[L.VIDEOS[7].id].secs = L.VIDEOS[7].secs; localStorage.setItem("lumen.v1", JSON.stringify(L.St));
  });
  r.histLen = await p.evaluate(() => window.Lumen.St.history.length);
  r.watchedKeys = await p.evaluate(() => Object.keys(window.Lumen.St.watched).length);
  // persiste après rechargement
  await p.reload(); await p.waitForTimeout(200);
  r.afterReloadHist = await p.evaluate(() => window.Lumen.St.history.length);
  // page historique
  await p.evaluate(() => window.Lumen.Pages.list('history')); await p.waitForTimeout(200);
  r.histRows = await p.$$eval('#page-list .result', e => e.length);
  r.histMeta = await p.textContent('#page-list .list-meta');
  r.hasProgress = await p.$$eval('#page-list .progress', e => e.length);
  r.firstSub = await p.textContent('#page-list .result .vsub');
  // reprise : rouvre la 1re vidéo regardée (90s) → doit reprendre, pas à 0
  const vid3 = await p.evaluate(() => window.Lumen.VIDEOS[3].id);
  await p.evaluate((id) => window.Lumen.Watch.open(window.Lumen.byId ? window.Lumen.byId(id) : window.Lumen.VIDEOS[3]), vid3);
  r.resumeT = await p.evaluate(() => Math.round(window.Lumen.Watch.t));
  // une vidéo YouTube simulée (real) doit survivre au rechargement via vcache
  await p.evaluate(() => { const L = window.Lumen; const yv = { id: 'yt:ABC', yt: 'ABC', title: 'Vraie vidéo YT', channel: 'Chaîne X', secs: 200, dur: '3:20', cat: 'YouTube', real: true, views: 1000, thumbUrl: '' }; L.Watch.open(yv); L.St.watched['yt:ABC'].t = 50; L.St.watched['yt:ABC'].secs = 200; localStorage.setItem("lumen.v1", JSON.stringify(L.St)); });
  await p.reload(); await p.waitForTimeout(200);
  await p.evaluate(() => window.Lumen.Pages.list('history')); await p.waitForTimeout(150);
  r.ytSurvives = await p.evaluate(() => !!window.Lumen.byId('yt:ABC'));
  r.ytInHistRow = await p.$$eval('#page-list .vtitle', e => e.map(x => x.textContent).includes('Vraie vidéo YT'));
  // effacement
  await p.evaluate(() => window.Lumen.Pages.list('history'));
  await p.click('[data-act=clearhist]'); await p.waitForTimeout(150);
  r.afterClear = await p.evaluate(() => [window.Lumen.St.history.length, Object.keys(window.Lumen.St.watched).length]);
  r.emptyShown = await p.isVisible('#page-list .empty');
  console.log(JSON.stringify(r, null, 1)); console.log('erreurs:', errs);
  await b.close();
})();
