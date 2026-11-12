// Audit « boutons morts » : clique chaque élément interactif visible, un par un, depuis un état propre,
// et vérifie qu'il produit un effet observable (DOM, toast, stockage, état du lecteur, URL).
const { chromium, devices } = require('playwright');
const app = process.argv[2];
const CFG = {
  cadence: {
    url: 'http://localhost:8765/',
    seed: `(() => { const C = window.Cadence; C.DEMO.slice(0, 6).forEach(t => C.Store.data.library.push(t));
      const pl = C.Library.createPlaylist('Route de nuit'); C.DEMO.slice(3, 9).forEach(t => pl.tracks.push(t));
      C.DEMO.slice(10, 16).forEach(t => C.Player.playList([t])); C.Player.engine.pause(); C.Player.playing = false; C.Store.save(); C.UI.go('home'); C.UI.syncPlayer(); })()`,
    states: {
      recherche: `Cadence.UI.go('search')`,
      accueil: `Cadence.UI.go('home')`,
      bibliotheque: `Cadence.UI.go('library')`,
      playlist: `Cadence.UI.go('library'); Cadence.UI.push({ type: 'playlist', id: Cadence.Store.data.playlists[0].id })`,
      playlistAuto: `Cadence.UI.go('home'); Cadence.UI.push({ type: 'playlist', id: 'smart:disco' })`,
      genre: `Cadence.UI.go('search'); Cadence.UI.push({ type: 'genre', id: 'rapfr' })`,
      aLecoute: `Cadence.Player.playList(Cadence.DEMO.slice(0, 5)); Cadence.UI.openNP()`,
      fileAttente: `Cadence.Player.playList(Cadence.DEMO.slice(0, 5)); Cadence.UI.openNP(); Cadence.UI.toggleQueue()`,
    },
    scope: (s) => s === 'aLecoute' || s === 'fileAttente' ? '#np' : 'body',
    sig: `JSON.stringify([document.body.innerHTML.length, [...document.body.innerHTML].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7), localStorage.getItem('cadence.v2'), Cadence.Player.playing, Cadence.Player.index, Cadence.Player.queue.length, document.getElementById('toast')?.textContent, document.getElementById('toast')?.style.opacity])`,
  },
  lumen: {
    url: 'http://localhost:8766/',
    seed: `(() => { const L = window.Lumen; L.St.history = L.VIDEOS.slice(0, 4).map(v => v.id); L.St.later = [L.VIDEOS[5].id]; L.St.subs = [L.VIDEOS[0].channel]; localStorage.setItem('lumen.v1', JSON.stringify(L.St)); })()`,
    states: {
      accueil: `Lumen.UI.go('home')`,
      lecture: `Lumen.Watch.open(Lumen.VIDEOS[2])`,
      clips: `Lumen.UI.go('clips')`,
      abonnements: `Lumen.UI.go('subs')`,
      vous: `Lumen.UI.go('you')`,
      chaine: `Lumen.Pages.channel(Lumen.VIDEOS[0].channel)`,
      historique: `Lumen.Pages.list('history')`,
      recherche: `Lumen.UI.go('search'); document.getElementById('q').value = 'vélo'; Lumen.UI.results('vélo')`,
    },
    scope: (s) => s === 'clips' ? '#page-clips, #nav' : `.page.active, #nav`,
    sig: `JSON.stringify([document.body.innerHTML.length, [...document.body.innerHTML].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7), localStorage.getItem('lumen.v1'), location.href, Lumen.Watch.playing, Lumen.Watch.t > 0, document.getElementById('toast').textContent, document.getElementById('toast').className])`,
  },
}[app];

const SEL = 'button, a[href], [role=button], .card, .tile, .row, .video, .result, .chip, [data-v], [data-ch], [data-q], .mini, .clip-card, .comments, .desc';
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices['iPhone 15 Pro'], permissions: ['clipboard-read', 'clipboard-write'] });
  await ctx.addInitScript(() => { window.prompt = () => 'Test auto'; window.confirm = () => true; });
  const page = await ctx.newPage(); const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const prepare = async (state) => {
    await page.goto(CFG.url); await page.evaluate(() => localStorage.clear()); await page.goto(CFG.url);
    await page.evaluate(CFG.seed); await page.evaluate(CFG.states[state]); await page.waitForTimeout(450);
  };
  const report = {}; let total = 0, dead = 0;
  for (const state of Object.keys(CFG.states)) {
    await prepare(state);
    const scope = CFG.scope(state);
    const labels = await page.evaluate(([sel, scope]) => {
      const els = [...document.querySelectorAll(scope)].flatMap((r) => [...r.querySelectorAll(sel)]);
      return els.map((el) => { const r = el.getBoundingClientRect(); const vis = !(el.closest('#np') && !el.closest('#np.open')) && r.width > 4 && r.height > 4 && getComputedStyle(el).visibility !== 'hidden' && !el.closest('[hidden]') && el.offsetParent !== null;
        return vis ? (el.getAttribute('aria-label') || el.innerText || el.className).trim().replace(/\s+/g, ' ').slice(0, 40) : null; });
    }, [SEL, scope]);
    const idx = labels.map((l, i) => (l === null ? -1 : i)).filter((i) => i >= 0).slice(0, 45);
    report[state] = { cliquables: idx.length, morts: [] };
    for (const i of idx) {
      await prepare(state);
      const before = await page.evaluate(CFG.sig);
      const ok = await page.evaluate(([sel, scope, i]) => {
        const el = [...document.querySelectorAll(scope)].flatMap((r) => [...r.querySelectorAll(sel)])[i]; if (!el) return false;
        el.scrollIntoView({ block: 'center' }); el.click(); return true;
      }, [SEL, scope, i]);
      await page.waitForTimeout(260);
      const after = await page.evaluate(CFG.sig).catch(() => 'navigated');
      total++;
      if (!ok || before === after) { dead++; report[state].morts.push(labels[i]); }
    }
  }
  console.log(JSON.stringify(report, null, 1));
  console.log(`\nTOTAL : ${total} éléments cliqués, ${dead} sans effet observable. Erreurs JS : ${errors.length}`, [...new Set(errors)].slice(0, 5));
  await b.close();
})();
