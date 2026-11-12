/* Lumen (web) : étude d'interface d'une plateforme vidéo mobile.
 * Contenus fictifs, miniatures générées. Un lien YouTube collé dans la recherche est lu via
 * l'intégration officielle (youtube-nocookie.com/embed).
 */
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- Icônes (originales) ---------- */
const S = 'stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"';
const P = {
  cast: `<path d="M3 17.5a3.5 3.5 0 0 1 3.5 3.5M3 13.5a7.5 7.5 0 0 1 7.5 7.5M3 6V5a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-6" ${S}/><circle cx="3.6" cy="20.4" r=".9" fill="currentColor"/>`,
  bell: `<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15zM10 20.5a2 2 0 0 0 4 0" ${S}/>`,
  search: `<circle cx="10.5" cy="10.5" r="6.5" ${S}/><path d="m15.5 15.5 5 5" ${S}/>`,
  back: `<path d="M20 12H4m6-6-6 6 6 6" ${S}/>`,
  mic: `<rect x="9" y="3" width="6" height="11" rx="3" ${S}/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" ${S}/>`,
  more: '<circle cx="12" cy="5.5" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="18.5" r="1.6" fill="currentColor"/>',
  compass: `<circle cx="12" cy="12" r="8.5" ${S}/><path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8z" ${S}/>`,
  home: `<path d="M4 10.5 12 4l8 6.5V20h-5.5v-5.5h-5V20H4z" ${S}/>`,
  homeF: '<path d="M4 10.5 12 4l8 6.5V20h-5.5v-5.5h-5V20H4z" fill="currentColor"/>',
  clips: `<rect x="6" y="2.5" width="12" height="19" rx="3" ${S}/><path d="m10.5 9.5 4 2.5-4 2.5z" fill="currentColor"/>`,
  clipsF: '<rect x="6" y="2.5" width="12" height="19" rx="3" fill="currentColor"/><path d="m10.5 9.5 4 2.5-4 2.5z" fill="var(--bg)"/>',
  create: `<circle cx="12" cy="12" r="9.5" ${S} stroke-width="1.3"/><path d="M12 8v8M8 12h8" ${S} stroke-width="1.3"/>`,
  subs: `<rect x="3.5" y="7.5" width="17" height="12.5" rx="2" ${S}/><path d="M6 4.5h12M10.5 11v5.5l4.5-2.75z" ${S}/>`,
  subsF: '<rect x="3.5" y="7.5" width="17" height="12.5" rx="2" fill="currentColor"/><path d="M6 4.5h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M10.5 11v5.5l4.5-2.75z" fill="var(--bg)"/>',
  like: `<path d="M7.5 20.5h-3v-10h3zM7.5 10.5l3.6-6.3a1.6 1.6 0 0 1 2.9 1.2l-.9 4.1h5.4a2 2 0 0 1 2 2.4l-1.4 6.6a2 2 0 0 1-2 1.5H7.5" ${S}/>`,
  likeF: '<path d="M7.5 20.5h-3v-10h3zM7.5 10.5l3.6-6.3a1.6 1.6 0 0 1 2.9 1.2l-.9 4.1h5.4a2 2 0 0 1 2 2.4l-1.4 6.6a2 2 0 0 1-2 1.5H7.5z" fill="currentColor"/>',
  dislike: `<path d="M16.5 3.5h3v10h-3zM16.5 13.5l-3.6 6.3a1.6 1.6 0 0 1-2.9-1.2l.9-4.1H5.5a2 2 0 0 1-2-2.4l1.4-6.6a2 2 0 0 1 2-1.5h9.6" ${S}/>`,
  share: `<path d="M14 5.5 20.5 12 14 18.5V15c-5 0-8 1.5-10.5 4.5C4.5 14 7.5 10 14 9z" ${S}/>`,
  save: `<path d="M4 6h12M4 11h12M4 16h7M17.5 13v7M14 16.5h7" ${S}/>`,
  download: `<path d="M12 4v11m-4.5-4.5L12 15l4.5-4.5M5 20h14" ${S}/>`,
  clipIt: `<circle cx="6.5" cy="6.5" r="2.5" ${S}/><circle cx="6.5" cy="17.5" r="2.5" ${S}/><path d="M8.5 8 20 18M8.5 16 20 6" ${S}/>`,
  bellOn: `<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15zM10 20.5a2 2 0 0 0 4 0" ${S}/>`,
  play: '<path d="M8 5.2v13.6a.8.8 0 0 0 1.2.7l10.8-6.8a.8.8 0 0 0 0-1.4L9.2 4.5a.8.8 0 0 0-1.2.7z" fill="currentColor"/>',
  pause: '<rect x="6.5" y="5" width="3.8" height="14" rx="1" fill="currentColor"/><rect x="13.7" y="5" width="3.8" height="14" rx="1" fill="currentColor"/>',
  rew: `<path d="M11.5 7 6.5 12l5 5M18 7l-5 5 5 5" ${S} stroke-width="2.2"/>`,
  ffw: `<path d="m12.5 7 5 5-5 5M6 7l5 5-5 5" ${S} stroke-width="2.2"/>`,
  chevDown: `<path d="m6 9 6 6 6-6" ${S} stroke-width="2.2"/>`,
  history: `<circle cx="12" cy="12" r="8.5" ${S}/><path d="M12 7.5V12l3 2" ${S}/>`,
  arrowFill: `<path d="M6 18 18 6M8 6h10v10" ${S}/>`,
  clock: `<circle cx="12" cy="12" r="8.5" ${S}/><path d="M12 7.5V12l3 2" ${S}/>`,
  list: `<path d="M4 6h16M4 12h16M4 18h10" ${S}/>`,
  gear: `<circle cx="12" cy="12" r="3" ${S}/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7" ${S}/>`,
  shield: `<path d="M12 3.5 19 6v6c0 4.5-3 7.5-7 8.5-4-1-7-4-7-8.5V6z" ${S}/><path d="m9 12 2 2 4-4" ${S}/>`,
  check: `<path d="m5 12.5 4.5 4.5L19 7.5" ${S} stroke-width="2.2"/>`,
  comment: `<path d="M4 5.5h16v11H9l-5 4z" ${S}/>`,
  flag: `<path d="M5 21V4m0 0h11l-2 4 2 4H5" ${S}/>`,
  notInterested: `<circle cx="12" cy="12" r="8.5" ${S}/><path d="m6 6 12 12" ${S}/>`,
  fullscreen: `<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" ${S}/>`,
};
const ic = (n) => `<svg viewBox="0 0 24 24" aria-hidden="true">${P[n]}</svg>`;

/* ---------- Génération de contenu fictif ---------- */
function hash(s) { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let s = seed || 1; return () => ((s = Math.imul(s ^ (s >>> 15), 2246822507) ^ Math.imul(s ^ (s >>> 13), 3266489909)) >>> 0) / 4294967296; }
const cache = new Map();
function thumb(seed, w = 320, h = 180) {
  const k = seed + w + h; if (cache.has(k)) return cache.get(k);
  const r = rng(hash(seed)); const hue = Math.floor(r() * 360); const h2 = (hue + 30 + r() * 120) % 360;
  const kind = Math.floor(r() * 4); let sh = '';
  if (kind === 0) { // paysage
    for (let i = 0; i < 4; i++) sh += `<path d="M0 ${h * (.45 + i * .14)} Q ${w * r()} ${h * (.3 + i * .12)} ${w} ${h * (.5 + i * .12)} V${h} H0Z" fill="hsl(${h2} ${40 + i * 8}% ${45 - i * 9}%)"/>`;
    sh += `<circle cx="${w * (.2 + r() * .6)}" cy="${h * .28}" r="${h * .12}" fill="hsl(${hue + 40} 90% 75%)"/>`;
  } else if (kind === 1) { // studio / objet
    sh += `<ellipse cx="${w / 2}" cy="${h * .85}" rx="${w * .35}" ry="${h * .08}" fill="rgba(0,0,0,.25)"/><rect x="${w * .36}" y="${h * .25}" width="${w * .28}" height="${h * .55}" rx="${h * .06}" fill="hsl(${h2} 70% 55%)"/><rect x="${w * .4}" y="${h * .32}" width="${w * .2}" height="${h * .3}" rx="4" fill="hsl(${h2} 60% 85%)"/>`;
  } else if (kind === 2) { // ville / néons
    for (let i = 0; i < 12; i++) { const bw = w / 12; const bh = h * (.3 + r() * .55); sh += `<rect x="${i * bw}" y="${h - bh}" width="${bw - 2}" height="${bh}" fill="hsl(${h2} 35% ${12 + r() * 14}%)"/>`; for (let j = 0; j < 4; j++) sh += `<rect x="${i * bw + 4 + r() * (bw - 10)}" y="${h - bh + 6 + r() * (bh - 12)}" width="3" height="3" fill="hsl(${hue} 100% 70%)"/>`; }
  } else { // abstrait
    for (let i = 0; i < 6; i++) sh += `<circle cx="${r() * w}" cy="${r() * h}" r="${h * (.15 + r() * .4)}" fill="hsl(${(hue + i * 25) % 360} 75% ${45 + r() * 20}%)" opacity=".75"/>`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="g" x2="0" y2="1"><stop offset="0" stop-color="hsl(${hue} 65% 62%)"/><stop offset="1" stop-color="hsl(${hue} 45% 28%)"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#g)"/>${sh}</svg>`;
  const u = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); cache.set(k, u); return u;
}
const avatarColor = (name) => `hsl(${hash(name) % 360} 55% 45%)`;
const avatar = (name, cls = '') => `<span class="avatar ${cls}" style="background:${avatarColor(name)}">${esc(name[0])}</span>`;

const CHANNELS = ['Atelier Brut', 'Les Carnets de Léa', 'Vélo Nomade', 'Cuisine Minute', 'Studio Polar', 'Code & Café', 'Pixel Ferme', 'Mécanique Douce', 'Hors Piste', 'Labo Sonore', 'Jardin Urbain', 'Planète Rando'];
const TOPICS = {
  Musique: ['Session live au bord du lac', 'J\'ai composé un morceau avec des objets de cuisine', 'Comment mixer une voix en 10 minutes'],
  'Jeux vidéo': ['Je termine ce jeu sans jamais sauter', 'Speedrun commenté : la route la plus courte', 'Les 10 niveaux les plus difficiles de l\'année'],
  Cuisine: ['Le vrai pain au levain, sans machine', 'Trois repas pour 10 € toute la semaine', 'J\'ai testé les recettes virales du mois'],
  Voyages: ['Traverser l\'Islande à vélo en 12 jours', '48 h à Lisbonne avec un petit budget', 'Nuit en refuge à 3 000 m'],
  Tech: ['Ce petit serveur fait tourner toute ma maison', 'Je démonte un téléphone de 2009', 'Coder un jeu en 48 heures'],
  Bricolage: ['Restaurer une chaise trouvée dans la rue', 'Fabriquer une étagère invisible', 'Réparer plutôt que jeter : la cafetière'],
  Sport: ['Mon premier semi-marathon, sans entraînement ?', 'Escalade : progresser en 30 jours', 'Le stretching que personne ne fait'],
};
const CHIPS = ['Tout', ...Object.keys(TOPICS), 'Direct', 'Récemment mis en ligne', 'Nouveautés pour vous'];
const VIDEOS = (() => {
  const r = rng(7); const out = []; let n = 0;
  for (const [cat, titles] of Object.entries(TOPICS)) for (const t of titles) {
    const ch = CHANNELS[n % CHANNELS.length]; const mins = 2 + Math.floor(r() * 40); const live = r() < .06;
    out.push({ id: 'v' + n, title: t, channel: ch, cat, views: Math.floor(10 ** (3 + r() * 3.6)), ago: Math.floor(1 + r() * 400),
      dur: live ? 'EN DIRECT' : `${mins}:${String(Math.floor(r() * 60)).padStart(2, '0')}`, secs: mins * 60, live,
      subs: Math.floor(10 ** (3.5 + r() * 2.8)), likes: Math.floor(10 ** (2 + r() * 3)), comments: Math.floor(10 ** (1 + r() * 2.6)),
      watched: r() < .15 ? 20 + r() * 70 : 0 });
    n++;
  }
  return out.sort(() => r() - .5);
})();
const CLIPS = VIDEOS.slice(0, 8).map((v, i) => ({ ...v, id: 'c' + i, title: ['Le geste qui change tout', 'Avant / après en 15 secondes', 'Vous faisiez ça faux', 'Astuce de pro', 'Personne ne s\'attendait à ça', 'Le résultat final', 'Version accélérée', 'Le coin secret'][i] }));
const fmtN = (n) => n >= 1e6 ? `${(n / 1e6).toFixed(1).replace('.', ',').replace(',0', '')} M` : n >= 1e3 ? `${(n / 1e3).toFixed(n < 1e4 ? 1 : 0).replace('.', ',').replace(',0', '')} k` : String(n);
const fmtAgo = (d) => d < 1 ? 'il y a quelques heures' : d < 7 ? `il y a ${d} jour${d > 1 ? 's' : ''}` : d < 30 ? `il y a ${Math.floor(d / 7)} semaine${d >= 14 ? 's' : ''}` : d < 365 ? `il y a ${Math.floor(d / 30)} mois` : `il y a ${Math.floor(d / 365)} an${d >= 730 ? 's' : ''}`;

/* ---------- État ---------- */
const St = (() => { let d = {}; try { d = JSON.parse(localStorage.getItem('lumen.v1')) || {}; } catch {}
  return Object.assign({ subs: [], liked: [], later: [], history: [], recent: ['levain', 'islande vélo'] }, d); })();
const save = () => { try { localStorage.setItem('lumen.v1', JSON.stringify(St)); } catch {} };

/* ---------- Rendu ---------- */
const UI = {
  page: 'home', chip: 'Tout', prev: 'home',
  go(p) {
    if (p !== 'watch' && p !== 'search') this.prev = p;
    if (this.page === 'watch' && p !== 'watch') Watch.stop();
    this.page = p; $$('.page').forEach((x) => x.classList.toggle('active', x.id === 'page-' + p));
    ({ home: () => this.home(), clips: () => this.clips(), subs: () => this.subs(), you: () => this.you(), search: () => this.search() })[p]?.();
    this.nav(); window.scrollTo(0, 0);
  },
  nav() {
    const items = [['home', 'Accueil', 'home', 'homeF'], ['clips', 'Clips', 'clips', 'clipsF'], ['create', '', 'create'], ['subs', 'Abonnements', 'subs', 'subsF'], ['you', 'Vous']];
    $('#nav').innerHTML = items.map(([k, l, i, f]) => {
      const on = this.page === k || (k === this.prev && (this.page === 'watch' || this.page === 'search'));
      if (k === 'create') return `<button class="nav-item create" data-go="create" aria-label="Créer">${ic('create')}</button>`;
      if (k === 'you') return `<button class="nav-item${on ? ' on' : ''}" data-go="you">${avatar('Raphaël', 'me')}<span>${l}</span></button>`;
      return `<button class="nav-item${on ? ' on' : ''}" data-go="${k}">${ic(on ? f : i)}<span>${l}</span></button>`;
    }).join('');
    $('#nav').style.display = this.page === 'clips' ? 'flex' : '';
    document.body.classList.toggle('dark-nav', this.page === 'clips');
  },
  card(v) {
    return `<article class="video" data-v="${v.id}">
      <div class="thumb"><img src="${thumb(v.id)}" alt=""><span class="dur${v.live ? ' live' : ''}">${v.dur}</span>${v.watched ? `<span class="progress" style="width:${v.watched}%"></span>` : ''}</div>
      <div class="vmeta">${avatar(v.channel)}<div class="vtext"><div class="vtitle">${esc(v.title)}</div>
      <div class="vsub">${esc(v.channel)} · ${v.live ? `${fmtN(Math.floor(v.views / 50))} spectateurs` : `${fmtN(v.views)} vues · ${fmtAgo(v.ago)}`}</div></div>
      <button class="kebab" data-menu="${v.id}" aria-label="Plus d'actions">${ic('more')}</button></div></article>`;
  },
  clipShelf() {
    return `<div class="shelf-h">${ic('clipsF')}Clips</div><div class="clip-shelf">${CLIPS.slice(0, 4).map((c) =>
      `<div class="clip-card" data-clip="${c.id}"><img src="${thumb(c.id, 180, 320)}" alt=""><button class="kb ib" aria-label="Plus">${ic('more')}</button><div class="ct"><b>${esc(c.title)}</b><small>${fmtN(c.views)} vues</small></div></div>`).join('')}</div>`;
  },
  home() {
    $('#chips').innerHTML = `<button class="chip icon" aria-label="Explorer">${ic('compass')}</button>` + CHIPS.map((c) => `<button class="chip${c === this.chip ? ' on' : ''}" data-chip="${esc(c)}">${esc(c)}</button>`).join('');
    let list = VIDEOS;
    if (TOPICS[this.chip]) list = VIDEOS.filter((v) => v.cat === this.chip);
    else if (this.chip === 'Direct') list = VIDEOS.filter((v) => v.live);
    else if (this.chip === 'Récemment mis en ligne') list = VIDEOS.slice().sort((a, b) => a.ago - b.ago);
    const cards = list.map((v) => this.card(v));
    if (this.chip === 'Tout' && cards.length > 2) cards.splice(2, 0, this.clipShelf());
    $('#feed').innerHTML = cards.join('') || '<div class="empty"><b>Aucune vidéo</b>Essayez un autre filtre.</div>';
  },
  search(q = $('#q').value) {
    const body = $('#search-body'); const n = q.trim().toLowerCase();
    if (!n) { body.innerHTML = St.recent.map((s) => `<div class="sugg" data-q="${esc(s)}">${ic('history')}<span>${esc(s)}</span><svg viewBox="0 0 24 24" class="fill">${P.back}</svg></div>`).join(''); return; }
    const sugg = [...new Set(VIDEOS.flatMap((v) => [v.title.toLowerCase(), v.channel.toLowerCase()]).filter((s) => s.includes(n)))].slice(0, 6);
    body.innerHTML = sugg.map((s) => `<div class="sugg" data-q="${esc(s)}">${ic('search')}<span>${esc(s)}</span></div>`).join('') || '';
  },
  results(q) {
    const n = q.trim().toLowerCase(); if (!n) return;
    St.recent = [q, ...St.recent.filter((x) => x !== q)].slice(0, 8); save();
    const yt = parseYT(q);
    if (yt) return Watch.open({ id: 'yt:' + yt, yt, title: 'Vidéo externe', channel: 'Lien collé', views: 0, ago: 0, dur: '', subs: 0, likes: 0, comments: 0, cat: '' });
    const r = VIDEOS.filter((v) => (v.title + ' ' + v.channel + ' ' + v.cat).toLowerCase().includes(n));
    $('#search-body').innerHTML = r.length ? r.map((v) => `<div class="result" data-v="${v.id}"><div class="thumb"><img src="${thumb(v.id)}" alt=""><span class="dur">${v.dur}</span></div><div class="vtext"><div class="vtitle">${esc(v.title)}</div><div class="vsub">${esc(v.channel)}<br>${fmtN(v.views)} vues · ${fmtAgo(v.ago)}</div></div><button class="kebab" data-menu="${v.id}">${ic('more')}</button></div>`).join('')
      : `<div class="empty"><b>Aucun résultat</b>Vérifiez l'orthographe ou collez un lien de vidéo.</div>`;
  },
  clips() {
    $('#clips').innerHTML = CLIPS.map((c) => `<section class="clip"><img src="${thumb(c.id, 360, 640)}" alt=""><div class="grad"></div>
      <div class="side"><button data-like="${c.id}"><span class="disc">${ic(St.liked.includes(c.id) ? 'likeF' : 'like')}</span>${fmtN(c.likes)}</button><button><span class="disc">${ic('dislike')}</span>Je n'aime pas</button><button><span class="disc">${ic('comment')}</span>${fmtN(c.comments)}</button><button><span class="disc">${ic('share')}</span>Partager</button></div>
      <div class="info"><div class="who">${avatar(c.channel)}@${esc(c.channel.toLowerCase().replace(/[^a-z]/g, ''))}<button class="sb" data-sub="${esc(c.channel)}">${St.subs.includes(c.channel) ? 'Abonné' : "S'abonner"}</button></div><p>${esc(c.title)}</p></div></section>`).join('') +
      `<div class="clip-top"><button class="ib" data-act="search" style="color:#fff">${ic('search')}</button><button class="ib" style="color:#fff">${ic('more')}</button></div>`;
  },
  subs() {
    const chans = St.subs.length ? St.subs : [];
    const vids = VIDEOS.filter((v) => chans.includes(v.channel));
    $('#page-subs').innerHTML = `<header class="appbar">${$('.brand').outerHTML}<div class="appbar-actions"><button class="ib" data-act="search">${ic('search')}</button></div></header>` +
      (chans.length ? `<div class="subs-row">${chans.map((c) => `<button>${avatar(c)}<span>${esc(c)}</span></button>`).join('')}</div><div class="feed">${vids.map((v) => this.card(v)).join('')}</div>`
        : `<div class="empty"><b>Aucun abonnement</b>Abonnez-vous à des chaînes pour voir leurs dernières vidéos ici.</div>`);
  },
  you() {
    const hist = St.history.map((id) => VIDEOS.find((v) => v.id === id)).filter(Boolean);
    const mini = (v) => `<div class="mini-v" data-v="${v.id}"><div class="thumb"><img src="${thumb(v.id)}" alt=""><span class="dur">${v.dur}</span></div><div class="vtitle">${esc(v.title)}</div><div class="vsub">${esc(v.channel)}</div></div>`;
    $('#page-you').innerHTML = `<header class="appbar"><span></span><div class="appbar-actions"><button class="ib">${ic('cast')}</button><button class="ib" data-act="search">${ic('search')}</button><button class="ib" data-act="settings">${ic('gear')}</button></div></header>
      <div class="you-head">${avatar('Raphaël', 'xl')}<div><h2>Raphaël</h2><small>@raphael · Afficher la chaîne</small></div></div>
      <div class="sec-h">Historique <button>Tout afficher</button></div>${hist.length ? `<div class="hscroll">${hist.map(mini).join('')}</div>` : '<div class="vsub" style="padding:0 12px">Les vidéos regardées apparaîtront ici.</div>'}
      <div class="sec-h">À regarder plus tard <button>Tout afficher</button></div>${St.later.length ? `<div class="hscroll">${St.later.map((id) => mini(VIDEOS.find((v) => v.id === id))).join('')}</div>` : '<div class="vsub" style="padding:0 12px">Rien pour l\'instant.</div>'}
      <div class="menu-list" style="margin-top:12px;border-top:1px solid var(--line)"><button>${ic('likeF')}Vidéos « J'aime » (${St.liked.length})</button><button>${ic('download')}Téléchargements</button><button>${ic('shield')}Bloqueur de publicités : actif</button><button>${ic('clock')}Temps de visionnage</button></div>`;
  },
  sheet(v) {
    const inLater = St.later.includes(v.id);
    $('.sheet-panel').innerHTML = `<div class="grab"></div><div class="menu-list">
      <button data-s="later">${ic('clock')}${inLater ? 'Retirer de « À regarder plus tard »' : 'Enregistrer dans « À regarder plus tard »'}</button>
      <button data-s="save">${ic('save')}Enregistrer dans une playlist</button><button data-s="share">${ic('share')}Partager</button>
      <button data-s="no">${ic('notInterested')}Pas intéressé</button><button data-s="report">${ic('flag')}Signaler</button></div>`;
    $('#sheet').hidden = false;
    $('#sheet').onclick = (e) => {
      const s = e.target.closest('[data-s]')?.dataset.s;
      if (s === 'later') { St.later = inLater ? St.later.filter((x) => x !== v.id) : [v.id, ...St.later]; save(); toast(inLater ? 'Retiré' : 'Enregistré dans « À regarder plus tard »'); }
      else if (s === 'share') { navigator.clipboard?.writeText(location.href.split('#')[0] + '#v=' + v.id); toast('Lien copié'); }
      else if (s) toast('Action enregistrée');
      $('#sheet').hidden = true;
    };
  },
};
function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 1800); }
function parseYT(t) {
  try { const u = new URL(t.trim()); if (u.hostname === 'youtu.be') return u.pathname.slice(1, 12);
    if (u.hostname.endsWith('youtube.com')) return u.searchParams.get('v') || (u.pathname.match(/\/(?:shorts|embed|live)\/([\w-]{11})/) || [])[1]; } catch {}
  return null;
}

/* ---------- Page de lecture ---------- */
const Watch = {
  v: null, t: 0, playing: false, timer: null, uiTimer: null,
  open(v) {
    this.v = v; this.t = 0; St.history = [v.id, ...St.history.filter((x) => x !== v.id)].slice(0, 20); save();
    UI.go('watch'); this.renderPlayer(); this.renderInfo();
  },
  renderPlayer() {
    const v = this.v, p = $('#player');
    if (v.yt) { p.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${v.yt}?autoplay=1&playsinline=1" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`; return; }
    p.innerHTML = `<div class="sim"><img src="${thumb(v.id, 640, 360)}" alt=""></div><span class="demo-tag">Lecture simulée · contenu fictif</span>
      <div class="ptop"><button class="ib" data-act="minimize" aria-label="Réduire">${ic('chevDown')}</button><div style="display:flex"><button class="ib">${ic('cast')}</button><button class="ib">${ic('gear')}</button></div></div>
      <div class="pctrl"><button data-p="rew" aria-label="Reculer de 10 s">${ic('rew')}</button><button class="pp" data-p="pp" aria-label="Lecture/Pause"></button><button data-p="ffw" aria-label="Avancer de 10 s">${ic('ffw')}</button></div>
      <div class="ptime"></div><div class="pbar"><span></span></div>`;
    this.play();
  },
  renderInfo() {
    const v = this.v, sub = St.subs.includes(v.channel), liked = St.liked.includes(v.id);
    const next = VIDEOS.filter((x) => x.id !== v.id).sort((a, b) => (b.cat === v.cat) - (a.cat === v.cat));
    $('#watch').innerHTML = `<div class="w-title">${esc(v.title)}</div>
      <div class="w-sub">${v.views ? `${fmtN(v.views)} vues  ${fmtAgo(v.ago)}  <b>...plus</b>` : ''}</div>
      <div class="w-channel">${avatar(v.channel, 'lg')}<div class="grow"><span class="cn">${esc(v.channel)}</span><span class="cs">${v.subs ? fmtN(v.subs) : ''}</span></div>
        <button class="sub-btn${sub ? ' on' : ''}" data-sub="${esc(v.channel)}">${sub ? ic('bellOn') + 'Abonné' : "S'abonner"}</button></div>
      <div class="actions"><div class="pill split"><button data-like="${v.id}" class="${liked ? 'on' : ''}">${ic(liked ? 'likeF' : 'like')}${fmtN(v.likes + (liked ? 1 : 0))}</button><button aria-label="Je n'aime pas">${ic('dislike')}</button></div>
        <button class="pill" data-share="${v.id}">${ic('share')}Partager</button><button class="pill" data-later="${v.id}">${ic('save')}Enregistrer</button><button class="pill">${ic('download')}Télécharger</button><button class="pill">${ic('clipIt')}Extrait</button></div>
      <div class="comments"><div class="ch">Commentaires<span>${fmtN(v.comments)}</span></div><div class="cb">${avatar('Camille')}<p>Super vidéo, très clair. J'ai essayé le soir même et ça marche !</p></div></div>
      ${next.map((x) => UI.card(x)).join('')}`;
  },
  play() { this.playing = true; this.syncPP(); clearInterval(this.timer); this.timer = setInterval(() => { this.t += .25; if (this.t >= this.v.secs) this.t = 0; this.syncBar(); }, 250); this.flashUI(); },
  pause() { this.playing = false; clearInterval(this.timer); this.syncPP(); this.flashUI(true); },
  stop() { clearInterval(this.timer); this.playing = false; $('#player').innerHTML = ''; },
  syncPP() { const b = $('[data-p=pp]'); if (b) b.innerHTML = ic(this.playing ? 'pause' : 'play'); $('.sim')?.classList.toggle('paused', !this.playing); },
  syncBar() {
    const s = this.v.secs || 1, f = (x) => `${Math.floor(x / 60)}:${String(Math.floor(x % 60)).padStart(2, '0')}`;
    const bar = $('.pbar span'); if (bar) bar.style.width = (this.t / s) * 100 + '%';
    const tm = $('.ptime'); if (tm) tm.textContent = `${f(this.t)} / ${f(s)}`;
  },
  flashUI(stay) { const p = $('#player'); p.classList.add('ui'); clearTimeout(this.uiTimer); if (!stay) this.uiTimer = setTimeout(() => p.classList.remove('ui'), 2500); },
};

/* ---------- Événements ---------- */
document.addEventListener('click', (e) => {
  const t = e.target;
  const menu = t.closest('[data-menu]'); if (menu) { e.stopPropagation(); return UI.sheet(VIDEOS.find((v) => v.id === menu.dataset.menu)); }
  const go = t.closest('[data-go]'); if (go) { if (go.dataset.go === 'create') return toast('Création non incluse dans le prototype'); return UI.go(go.dataset.go); }
  const chip = t.closest('[data-chip]'); if (chip) { UI.chip = chip.dataset.chip; UI.home(); window.scrollTo(0, 0); return; }
  const sub = t.closest('[data-sub]'); if (sub) { const c = sub.dataset.sub; const on = St.subs.includes(c); St.subs = on ? St.subs.filter((x) => x !== c) : [...St.subs, c]; save(); toast(on ? 'Abonnement annulé' : 'Abonnement ajouté'); return UI.page === 'watch' ? Watch.renderInfo() : UI.page === 'clips' ? UI.clips() : null; }
  const like = t.closest('[data-like]'); if (like) { const id = like.dataset.like; const on = St.liked.includes(id); St.liked = on ? St.liked.filter((x) => x !== id) : [...St.liked, id]; save(); if (!on) toast('Ajoutée aux vidéos « J\'aime »'); return UI.page === 'watch' ? Watch.renderInfo() : UI.clips(); }
  const later = t.closest('[data-later]'); if (later) { St.later = [later.dataset.later, ...St.later.filter((x) => x !== later.dataset.later)]; save(); return toast('Enregistré dans « À regarder plus tard »'); }
  if (t.closest('[data-share]')) { navigator.clipboard?.writeText(location.href); return toast('Lien copié'); }
  const v = t.closest('[data-v]'); if (v) return Watch.open(VIDEOS.find((x) => x.id === v.dataset.v));
  const clip = t.closest('[data-clip]'); if (clip) return UI.go('clips');
  const q = t.closest('[data-q]'); if (q) { $('#q').value = q.dataset.q; return UI.results(q.dataset.q); }
  const pc = t.closest('[data-p]'); if (pc) { e.stopPropagation(); const a = pc.dataset.p;
    if (a === 'pp') Watch.playing ? Watch.pause() : Watch.play(); if (a === 'rew') Watch.t = Math.max(0, Watch.t - 10); if (a === 'ffw') Watch.t += 10; Watch.syncBar(); return Watch.flashUI(!Watch.playing); }
  if (t.closest('#player')) return Watch.flashUI(!Watch.playing);
  const act = t.closest('[data-act]')?.dataset.act;
  if (act === 'search') { UI.go('search'); $('#q').value = ''; UI.search(''); return setTimeout(() => $('#q').focus(), 30); }
  if (act === 'back' || act === 'minimize') return UI.go(UI.prev);
  if (act === 'home') { e.preventDefault(); UI.chip = 'Tout'; return UI.go('home'); }
  if (act === 'notif') return toast('Aucune nouvelle notification');
  if (act === 'cast') return toast('Aucun appareil trouvé');
  if (act === 'settings') return toast('Réglages : bloqueur actif, lecture en arrière-plan activée');
});
$('#q').addEventListener('input', (e) => UI.search(e.target.value));
$('#search-form').addEventListener('submit', (e) => { e.preventDefault(); $('#q').blur(); UI.results($('#q').value); });
let lastY = 0;
window.addEventListener('scroll', () => {
  if (UI.page !== 'home') return; const y = window.scrollY; const hide = y > lastY && y > 120;
  $('#page-home .appbar').classList.toggle('hide', hide); $('#chips').classList.toggle('hide', hide); lastY = y;
}, { passive: true });

/* ---------- Démarrage ---------- */
document.querySelectorAll('[data-i]').forEach((b) => b.insertAdjacentHTML('afterbegin', ic(b.dataset.i)));
const start = new URLSearchParams(location.search);
UI.go(start.get('p') || 'home');
if (start.get('v')) Watch.open(VIDEOS.find((v) => v.id === start.get('v')) || VIDEOS[0]);
window.Lumen = { UI, Watch, VIDEOS, St };
