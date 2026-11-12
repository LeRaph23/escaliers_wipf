const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ ...devices['iPhone 15 Pro'] });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8766/'); await p.evaluate(() => localStorage.clear()); await p.goto('http://localhost:8766/'); await p.waitForTimeout(200);
  const fs = require('fs'); const text = fs.readFileSync(process.argv[2], 'utf8');
  const r = await p.evaluate((t) => { const res = window.Lumen.importTakeout(t); const S = window.Lumen.St;
    return { res, histLen: S.history.length, order: S.history.map(id => window.Lumen.byId(id)?.title),
      music: S.history.includes('yt:abcdefghij3'), dedup: S.history.filter(x => x==='yt:abcdefghij1').length,
      topAt: new Date(S.watched[S.history[0]].at).toISOString().slice(0,10), source: S.watched[S.history[0]].source }; }, text);
  // persiste + s'affiche dans la page historique
  await p.reload(); await p.waitForTimeout(150);
  await p.evaluate(() => window.Lumen.Pages.list('history')); await p.waitForTimeout(200);
  r.rowsAfterReload = await p.$$eval('#page-list .result .vtitle', e => e.map(x => x.textContent));
  r.hasYtThumb = await p.$$eval('#page-list img', e => e.some(x => x.src.includes('ytimg.com') || x.src.startsWith('data:')));
  console.log(JSON.stringify(r, null, 1)); console.log('erreurs:', errs); await b.close();
})();
