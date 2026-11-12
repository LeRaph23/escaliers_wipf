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
  close: `<path d="M6 6l12 12M18 6 6 18" ${S}/>`,
  send: '<path d="M4 12 20 4l-6 16-3-7z" fill="currentColor"/>',
  trash: `<path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13" ${S}/>`,
  speed: `<path d="M4 16a8 8 0 1 1 16 0M12 16l4-5" ${S}/>`,
  hd: `<rect x="3" y="6" width="18" height="12" rx="2" ${S}/><path d="M7 10v4M10 10v4M7 12h3M13 10v4h2a2 2 0 0 0 0-4z" ${S}/>`,
  autoplay: `<rect x="3" y="7" width="18" height="10" rx="5" ${S}/><circle cx="16" cy="12" r="3" fill="currentColor"/>`,
  live: `<circle cx="12" cy="12" r="2.5" fill="currentColor"/><path d="M7.5 7.5a6.4 6.4 0 0 0 0 9M16.5 7.5a6.4 6.4 0 0 1 0 9M4.6 4.6a10.5 10.5 0 0 0 0 14.8M19.4 4.6a10.5 10.5 0 0 1 0 14.8" ${S}/>`,
  upload: `<path d="M12 16V4m-4.5 4.5L12 4l4.5 4.5M5 20h14" ${S}/>`,
  dislikeF: '<path d="M16.5 3.5h3v10h-3zM16.5 13.5l-3.6 6.3a1.6 1.6 0 0 1-2.9-1.2l.9-4.1H5.5a2 2 0 0 1-2-2.4l1.4-6.6a2 2 0 0 1 2-1.5h9.6z" fill="currentColor"/>',
  fullscreen: `<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" ${S}/>`,
};
const ic = (n) => `<svg viewBox="0 0 24 24" aria-hidden="true">${P[n]}</svg>`;

/* ---------- Génération de contenu fictif ---------- */
function hash(s) { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let s = seed || 1; return () => ((s = Math.imul(s ^ (s >>> 15), 2246822507) ^ Math.imul(s ^ (s >>> 13), 3266489909)) >>> 0) / 4294967296; }
const cache = new Map();
/* Miniatures « créateur » générées : scène, personnage stylisé (original), accroche en gros caractères */
const THUMB_PAL = [['#0f2027', '#2c5364', '#ffd166'], ['#3a1c71', '#d76d77', '#fff3b0'], ['#134e5e', '#71b280', '#ffe66d'], ['#1d2b64', '#6a82fb', '#ff6b6b'],
  ['#232526', '#5c5f63', '#7cf8c0'], ['#4a1942', '#ff5f6d', '#ffe156'], ['#0d3b66', '#3e8ed0', '#f4d35e'], ['#2c3e2d', '#5d8a3a', '#ffd23f'], ['#240b36', '#c31432', '#ffffff']];
function hookFor(title) {
  const num = title.match(/(\d+[\s ]?(?:€|h|heures|jours|minutes|niveaux|repas|m)?)/i);
  if (num) return num[1].toUpperCase().replace(/\s+/g, ' ');
  const words = title.replace(/[^\p{L}\s']/gu, '').split(/\s+/).filter((w) => w.length > 3);
  return words.slice(-2).join(' ').toUpperCase();
}
function thumb(seed, w = 320, h = 180, title = '') {
  const k = seed + w + h + title; if (cache.has(k)) return cache.get(k);
  const r = rng(hash(seed)); const [dark, mid, hot] = THUMB_PAL[hash(seed + 'p') % THUMB_PAL.length]; const vert = h > w;
  const blob = (c, op) => `<circle cx="${(r() * w).toFixed(0)}" cy="${(r() * h).toFixed(0)}" r="${(h * (.3 + r() * .4)).toFixed(0)}" fill="${c}" opacity="${op}"/>`;
  let sc = `<rect width="${w}" height="${h}" fill="${dark}"/><g filter="url(#bl)">${blob(mid, .9)}${blob(mid, .7)}${blob(hot, .35)}</g>`;
  const kind = Math.floor(r() * 3);
  if (kind === 0) for (let i = 0; i < 3; i++) sc += `<path d="M0 ${h * (.62 + i * .12)} Q ${w * (.3 + r() * .4)} ${h * (.5 + i * .1)} ${w} ${h * (.66 + i * .1)} V${h} H0Z" fill="${dark}" opacity="${.45 + i * .2}"/>`;
  if (kind === 1) for (let i = 0; i < 14; i++) sc += `<rect x="${(i * w / 14).toFixed(0)}" y="${(h * (.45 + r() * .4)).toFixed(0)}" width="${(w / 14 - 3).toFixed(0)}" height="${h}" fill="${dark}" opacity=".75"/>`;
  // personnage stylisé (silhouette avec liseré lumineux), côté opposé au texte
  const px = vert ? w * .5 : w * (r() < .5 ? .76 : .24), base = h * 1.02, s = vert ? w * .34 : h * .36;
  const person = `<g><path d="M${px - s * 1.15} ${base} C ${px - s * 1.1} ${base - s * 1.25}, ${px + s * 1.1} ${base - s * 1.25}, ${px + s * 1.15} ${base} Z" fill="${dark}"/><circle cx="${px}" cy="${base - s * 1.62}" r="${s * .56}" fill="${dark}"/></g>`;
  const subj = hash(seed + 'subj') % 3;
  if (subj === 0) sc += `<g stroke="${hot}" stroke-width="${(s * .07).toFixed(1)}" stroke-opacity=".9" fill="none" filter="url(#gl)">${person.replace(/fill="[^"]+"/g, '')}</g>${person}`;
  if (subj === 1) { const ow = s * 1.5, oh = s * 1.9, ox = px - ow / 2, oy = base - oh - s * .2;
    sc += `<rect x="${ox}" y="${oy}" width="${ow}" height="${oh}" rx="${s * .18}" fill="${hot}" opacity=".95" transform="rotate(-8 ${px} ${oy + oh / 2})"/><rect x="${ox + ow * .12}" y="${oy + oh * .1}" width="${ow * .76}" height="${oh * .55}" rx="${s * .08}" fill="${dark}" opacity=".85" transform="rotate(-8 ${px} ${oy + oh / 2})"/>`;
    sc += `<path d="M${px + ow * .55} ${oy + oh * .2} l${s * .5} ${-s * .35} m${-s * .1} ${s * .55} l${s * .55} ${-s * .05}" stroke="#fff" stroke-width="${s * .09}" stroke-linecap="round"/>`; }
  // accroche
  const hook = title ? esc(hookFor(title)) : ''; let text = '';
  if (hook) {
    const fs = (vert ? w * .14 : h * .2) * (hash(seed + 'subj') % 3 === 2 ? 1.25 : 1); const tx = vert ? w * .08 : hash(seed + 'subj') % 3 === 2 ? w * .07 : (px > w / 2 ? w * .05 : w * .46); const ty = vert ? h * .2 : h * .38;
    const lines = hook.length > 11 ? hook.split(' ').reduce((a, wd) => { (a.at(-1) + ' ' + wd).trim().length <= 11 ? a[a.length - 1] = (a.at(-1) + ' ' + wd).trim() : a.push(wd); return a; }, ['']) : [hook];
    const f = Math.min(fs, (vert || tx < w * .2 ? w * .86 : w * .5) / (Math.max(...lines.slice(0, 2).map((l) => l.length)) * .62));
    text = lines.slice(0, 2).map((l, i) => `<text x="${tx}" y="${ty + i * f * 1.08}" font-family="Inter Display, Inter, sans-serif" font-weight="900" font-size="${f.toFixed(0)}" fill="${i ? hot : '#fff'}" stroke="#000" stroke-width="${(f * .1).toFixed(1)}" paint-order="stroke" letter-spacing="-1">${l}</text>`).join('');
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice"><defs><filter id="bl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${(h * .12).toFixed(0)}"/></filter><filter id="gl"><feGaussianBlur stdDeviation="${(s * .05).toFixed(1)}"/></filter>
    <radialGradient id="vg" cx=".5" cy=".5" r=".7"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></radialGradient></defs>${sc}<rect width="${w}" height="${h}" fill="url(#vg)"/>${text}</svg>`;
  const u = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); cache.set(k, u); return u;
}
const avatarColor = (name) => `hsl(${hash(name) % 360} 55% 45%)`;
const avatar = (name, cls = '') => `<span class="avatar ${cls}" style="background:linear-gradient(140deg, hsl(${hash(name) % 360} 65% 58%), hsl(${(hash(name) + 50) % 360} 60% 38%))">${esc(name[0])}</span>`;

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
  return Object.assign({ subs: [], liked: [], disliked: [], later: [], history: [], downloads: [], hidden: [], hiddenCh: [], comments: {}, cliked: [], watchByDay: {}, speed: 1, quality: 'Auto', autoplay: true, notifSeen: false, recent: ['levain', 'islande vélo'] }, d); })();
const save = () => { try { localStorage.setItem('lumen.v1', JSON.stringify(St)); } catch {} };

/* ---------- Rendu ---------- */
const UI = {
  page: 'home', chip: 'Tout', prev: 'home',
  stack: [],
  go(p, push = true) {
    if (this.page === 'watch' && p !== 'watch') Watch.stop();
    if (push && this.page && this.page !== p) this.stack.push(this.page);
    if (['home', 'clips', 'subs', 'you'].includes(p)) { this.prev = p; this.stack = []; }
    this.page = p; document.querySelectorAll('.page').forEach((x) => x.classList.toggle('active', x.id === 'page-' + p));
    ({ home: () => this.home(), clips: () => this.clips(), subs: () => this.subs(), you: () => this.you(), search: () => this.search() })[p]?.();
    this.nav(); window.scrollTo(0, 0);
  },
  refresh() { window.scrollTo({ top: 0, behavior: 'smooth' }); if (this.page === 'home') { Reco.salt = (Reco.salt || 0) + 1; this.home(); toast('Fil actualisé'); } else this.go(this.page, false); },
  back() { const p = this.stack.pop() || this.prev || 'home'; if (p === 'watch' && Watch.v) { this.go('watch', false); Watch.renderPlayer(); Watch.renderInfo(); } else this.go(p, false); },
  nav() {
    const items = [['home', 'Accueil', 'home', 'homeF'], ['clips', 'Clips', 'clips', 'clipsF'], ['create', '', 'create'], ['subs', 'Abonnements', 'subs', 'subsF'], ['you', 'Vous']];
    $('#nav').innerHTML = items.map(([k, l, i, f]) => {
      const on = this.page === k || (k === this.prev && !['home', 'clips', 'subs', 'you'].includes(this.page));
      if (k === 'create') return `<button class="nav-item create" data-go="create" aria-label="Créer">${ic('create')}</button>`;
      if (k === 'you') return `<button class="nav-item${on ? ' on' : ''}" data-go="you">${avatar('Raphaël', 'me')}<span>${l}</span></button>`;
      return `<button class="nav-item${on ? ' on' : ''}" data-go="${k}">${ic(on ? f : i)}<span>${l}</span></button>`;
    }).join('');
    $('#nav').style.display = this.page === 'clips' ? 'flex' : '';
    document.body.classList.toggle('dark-nav', this.page === 'clips');
  },
  card(v) {
    return `<article class="video" data-v="${v.id}">
      <div class="thumb"><img src="${thumb(v.id, 320, 180, v.title)}" alt=""><span class="dur${v.live ? ' live' : ''}">${v.dur}</span>${v.watched ? `<span class="progress" style="width:${v.watched}%"></span>` : ''}</div>
      <div class="vmeta"><span data-ch="${esc(v.channel)}">${avatar(v.channel)}</span><div class="vtext"><div class="vtitle">${esc(v.title)}</div>
      <div class="vsub"><span data-ch="${esc(v.channel)}">${esc(v.channel)}</span> · ${v.live ? `${fmtN(Math.floor(v.views / 50))} spectateurs` : `${fmtN(v.views)} vues · ${fmtAgo(v.ago)}`}</div></div>
      <button class="kebab" data-menu="${v.id}" aria-label="Plus d'actions">${ic('more')}</button></div></article>`;
  },
  resultRow(v, kind) {
    return `<div class="result" data-v="${v.id}"><div class="thumb"><img src="${thumb(v.id, 320, 180, v.title)}" alt=""><span class="dur${v.live ? ' live' : ''}">${v.dur}</span></div><div class="vtext"><div class="vtitle">${esc(v.title)}</div><div class="vsub">${esc(v.channel)}<br>${fmtN(v.views)} vues · ${fmtAgo(v.ago)}</div></div>${kind ? `<button class="kebab" data-rm="${kind}:${v.id}" aria-label="Retirer">${ic('close')}</button>` : `<button class="kebab" data-menu="${v.id}" aria-label="Plus d'actions">${ic('more')}</button>`}</div>`;
  },
  clipShelf() {
    return `<div class="shelf-h">${ic('clipsF')}Clips</div><div class="clip-shelf">${CLIPS.slice(0, 4).map((c) =>
      `<div class="clip-card" data-clip="${c.id}"><img src="${thumb(c.id, 180, 320, c.title)}" alt=""><button class="kb ib" data-menu="${c.id}" aria-label="Plus">${ic('more')}</button><div class="ct"><b>${esc(c.title)}</b><small>${fmtN(c.views)} vues</small></div></div>`).join('')}</div>`;
  },
  home() {
    $('#chips').innerHTML = `<button class="chip icon" data-act="explore" aria-label="Explorer">${ic('compass')}</button>` + CHIPS.map((c) => `<button class="chip${c === this.chip ? ' on' : ''}" data-chip="${esc(c)}">${esc(c)}</button>`).join('');
    let list = Reco.feed();
    if (TOPICS[this.chip]) list = list.filter((v) => v.cat === this.chip);
    else if (this.chip === 'Direct') list = list.filter((v) => v.live);
    else if (this.chip === 'Récemment mis en ligne') list = list.slice().sort((a, b) => a.ago - b.ago);
    else if (this.chip === 'Nouveautés pour vous') list = list.filter((v) => !St.history.includes(v.id));
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
    $('#search-body').innerHTML = r.length ? r.map((v) => `<div class="result" data-v="${v.id}"><div class="thumb"><img src="${thumb(v.id, 320, 180, v.title)}" alt=""><span class="dur">${v.dur}</span></div><div class="vtext"><div class="vtitle">${esc(v.title)}</div><div class="vsub">${esc(v.channel)}<br>${fmtN(v.views)} vues · ${fmtAgo(v.ago)}</div></div><button class="kebab" data-menu="${v.id}">${ic('more')}</button></div>`).join('')
      : `<div class="empty"><b>Aucun résultat</b>Vérifiez l'orthographe ou collez un lien de vidéo.</div>`;
  },
  clips() {
    $('#clips').innerHTML = CLIPS.map((c) => `<section class="clip"><img src="${thumb(c.id, 360, 640, c.title)}" alt=""><div class="grad"></div>
      <div class="side"><button data-like="${c.id}"><span class="disc">${ic(St.liked.includes(c.id) ? 'likeF' : 'like')}</span>${fmtN(c.likes)}</button><button data-dislike="${c.id}"><span class="disc">${ic(St.disliked.includes(c.id) ? 'dislikeF' : 'dislike')}</span>Je n'aime pas</button><button data-ccom="${c.id}"><span class="disc">${ic('comment')}</span>${fmtN(c.comments)}</button><button data-share="${c.id}"><span class="disc">${ic('share')}</span>Partager</button></div>
      <div class="clip-prog"><span></span></div><div class="info"><div class="who" data-ch="${esc(c.channel)}">${avatar(c.channel)}@${esc(c.channel.toLowerCase().replace(/[^a-z]/g, ''))}<button class="sb" data-sub="${esc(c.channel)}">${St.subs.includes(c.channel) ? 'Abonné' : "S'abonner"}</button></div><p>${esc(c.title)}</p></div></section>`).join('') +
      `<div class="clip-top"><button class="ib" data-act="search" style="color:#fff">${ic('search')}</button><button class="ib" data-act="clipmenu" style="color:#fff">${ic('more')}</button></div>`;
  },
  subs() {
    const chans = St.subs.length ? St.subs : [];
    const vids = VIDEOS.filter((v) => chans.includes(v.channel));
    $('#page-subs').innerHTML = `<header class="appbar">${$('.brand').outerHTML}<div class="appbar-actions"><button class="ib" data-act="search">${ic('search')}</button></div></header>` +
      (chans.length ? `<div class="subs-row">${chans.map((c) => `<button data-ch="${esc(c)}">${avatar(c)}<span>${esc(c)}</span></button>`).join('')}</div><div class="feed">${vids.map((v) => this.card(v)).join('')}</div>`
        : `<div class="empty"><b>Aucun abonnement</b>Abonnez-vous à des chaînes pour voir leurs dernières vidéos ici.</div>`);
  },
  you() {
    const hist = St.history.map((id) => VIDEOS.find((v) => v.id === id)).filter(Boolean);
    const mini = (v) => `<div class="mini-v" data-v="${v.id}"><div class="thumb"><img src="${thumb(v.id, 320, 180, v.title)}" alt=""><span class="dur">${v.dur}</span></div><div class="vtitle">${esc(v.title)}</div><div class="vsub">${esc(v.channel)}</div></div>`;
    $('#page-you').innerHTML = `<header class="appbar"><span></span><div class="appbar-actions"><button class="ib" data-act="cast" aria-label="Diffuser">${ic('cast')}</button><button class="ib" data-act="search">${ic('search')}</button><button class="ib" data-act="settings">${ic('gear')}</button></div></header>
      <div class="you-head">${avatar('Raphaël', 'xl')}<div><h2>Raphaël</h2><small>@raphael · ${St.history.length} vidéos regardées</small></div></div>
      <div class="sec-h">Historique <button data-list="history">Tout afficher</button></div>${hist.length ? `<div class="hscroll">${hist.map(mini).join('')}</div>` : '<div class="vsub" style="padding:0 12px">Les vidéos regardées apparaîtront ici.</div>'}
      <div class="sec-h">À regarder plus tard <button data-list="later">Tout afficher</button></div>${St.later.length ? `<div class="hscroll">${St.later.map((id) => mini(VIDEOS.find((v) => v.id === id))).join('')}</div>` : '<div class="vsub" style="padding:0 12px">Rien pour l\'instant.</div>'}
      <div class="menu-list" style="margin-top:12px;border-top:1px solid var(--line)"><button data-list="liked">${ic('likeF')}Vidéos « J'aime » (${St.liked.length})</button><button data-list="downloads">${ic('download')}Téléchargements (${St.downloads.length})</button><button data-act="adblock">${ic('shield')}Bloqueur de publicités : ${St.adblock === false ? 'désactivé' : 'actif'}</button><button data-act="watchtime">${ic('clock')}Temps de visionnage</button><button data-act="settings">${ic('gear')}Paramètres de lecture</button></div>`;
  },
  sheet(v) {
    const inLater = St.later.includes(v.id), dl = St.downloads.includes(v.id);
    openSheet(`<div class="menu-list">
      <button data-s="later">${ic('clock')}${inLater ? 'Retirer de « À regarder plus tard »' : 'Enregistrer dans « À regarder plus tard »'}</button>
      <button data-s="dl">${ic('download')}${dl ? 'Supprimer le téléchargement' : 'Télécharger la vidéo'}</button>
      <button data-s="share">${ic('share')}Partager</button>
      <button data-s="no">${ic('notInterested')}Pas intéressé</button>
      <button data-s="noch">${ic('notInterested')}Ne pas recommander cette chaîne</button>
      <button data-s="report">${ic('flag')}Signaler</button></div>`, (e) => {
      const s = e.target.closest('[data-s]')?.dataset.s; if (!s) return; closeSheet();
      if (s === 'later') { St.later = inLater ? St.later.filter((x) => x !== v.id) : [v.id, ...St.later]; toast(inLater ? 'Retiré de « À regarder plus tard »' : 'Enregistré dans « À regarder plus tard »'); }
      if (s === 'dl') Watch.toggleDownload(v);
      if (s === 'share') Sheets.share(v);
      if (s === 'no') { St.hidden.push(v.id); toast('Vidéo masquée. Vos recommandations seront ajustées.'); }
      if (s === 'noch') { St.hiddenCh.push(v.channel); toast(`Nous ne recommanderons plus ${v.channel}`); }
      if (s === 'report') toast('Merci, le signalement a été enregistré');
      save(); if (UI.page === 'home') UI.home(); if (UI.page === 'watch') Watch.renderInfo();
    });
  },
};
function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 1800); }
function parseYT(t) {
  try { const u = new URL(t.trim()); if (u.hostname === 'youtu.be') return u.pathname.slice(1, 12);
    if (u.hostname.endsWith('youtube.com')) return u.searchParams.get('v') || (u.pathname.match(/\/(?:shorts|embed|live)\/([\w-]{11})/) || [])[1]; } catch {}
  return null;
}

/* ---------- Recommandation (locale, explicable) ----------
 * Affinités thème/chaîne apprises de l'historique (pondéré par récence), des « J'aime », « Je n'aime pas »,
 * abonnements et « Pas intéressé ». Score = 1,6·thème + 1,4·chaîne + popularité − déjà vu + variation du jour.
 */
const Reco = {
  profile() {
    const cat = {}, ch = {}; const add = (o, k, v) => { if (k) o[k] = (o[k] || 0) + v; };
    St.history.forEach((id, i) => { const v = byId(id); if (v) { const w = Math.max(.2, 1 - i / 20); add(cat, v.cat, w); add(ch, v.channel, w); } });
    St.liked.forEach((id) => { const v = byId(id); if (v) { add(cat, v.cat, 2.5); add(ch, v.channel, 2); } });
    St.disliked.forEach((id) => { const v = byId(id); if (v) { add(cat, v.cat, -2.5); add(ch, v.channel, -2); } });
    St.subs.forEach((c) => add(ch, c, 2.5)); St.hiddenCh.forEach((c) => add(ch, c, -6));
    const norm = (o) => { const m = Math.max(1, ...Object.values(o).map(Math.abs)); for (const k in o) o[k] /= m; return o; };
    return { cat: norm(cat), ch: norm(ch) };
  },
  score(v, p) {
    return 1.6 * (p.cat[v.cat] || 0) + 1.4 * (p.ch[v.channel] || 0) + .25 * Math.log10(v.views + 1) / 6
      - (St.history.includes(v.id) ? .7 : 0) - (St.disliked.includes(v.id) ? 3 : 0) + (hash(v.id + new Date().toDateString() + (Reco.salt || '')) % 100) / (Reco.salt ? 120 : 400);
  },
  visible: (v) => !St.hidden.includes(v.id) && !St.hiddenCh.includes(v.channel),
  feed() { const p = this.profile(); return VIDEOS.filter(this.visible).map((v) => [this.score(v, p), v]).sort((a, b) => b[0] - a[0]).map((x) => x[1]); },
  upNext(cur) { const p = this.profile(); return VIDEOS.filter((v) => v.id !== cur.id && this.visible(v))
    .map((v) => [this.score(v, p) + (v.cat === cur.cat ? 1 : 0) + (v.channel === cur.channel ? .5 : 0), v]).sort((a, b) => b[0] - a[0]).map((x) => x[1]); },
  why(v) { const p = this.profile(); if (St.subs.includes(v.channel)) return 'De vos abonnements'; if ((p.cat[v.cat] || 0) > .3) return `Parce que vous regardez : ${v.cat}`; return ''; },
};
const byId = (id) => VIDEOS.find((v) => v.id === id) || CLIPS.find((v) => v.id === id);

/* Contenus dérivés (descriptions, chapitres, commentaires) générés de façon déterministe */
const NAMES = ['Camille', 'Yanis', 'Léa', 'Mehdi', 'Inès', 'Hugo', 'Sarah', 'Tom', 'Nora', 'Lucas', 'Chloé', 'Adam'];
const PHRASES = ['Super vidéo, très clair. J\'ai essayé le soir même et ça marche !', 'Le montage est vraiment propre, bravo.', 'Qui regarde encore ça cette année ?',
  'J\'aurais aimé plus de détails sur la deuxième partie.', 'Merci, exactement ce que je cherchais.', 'La musique de fond est géniale, quel est le titre ?',
  'Je me suis abonné direct.', 'Le passage à 2:10 est incroyable.', 'Vous pourriez faire une suite ?', 'Enfin quelqu\'un qui explique simplement.'];
function chapters(v) { const n = 4; return Array.from({ length: n }, (_, i) => ({ t: Math.floor((v.secs || 300) * i / n), label: ['Introduction', 'Préparation', 'Le cœur du sujet', 'Résultat et conclusion'][i] })); }
const ts = (x) => `${Math.floor(x / 60)}:${String(Math.floor(x % 60)).padStart(2, '0')}`;
function commentsFor(v) {
  const r = rng(hash(v.id + 'c')); const gen = Array.from({ length: 8 }, (_, i) => ({ id: `${v.id}-c${i}`, who: NAMES[Math.floor(r() * NAMES.length)], text: PHRASES[Math.floor(r() * PHRASES.length)], likes: Math.floor(r() * 900), ago: 1 + Math.floor(r() * 60) }));
  return [...(St.comments[v.id] || []), ...gen];
}

/* ---------- Feuilles (bottom sheets) ---------- */
function openSheet(html, onClick) {
  $('.sheet-panel').innerHTML = `<div class="grab"></div>${html}`; $('#sheet').hidden = false;
  $('#sheet').onclick = (e) => { if (e.target.id === 'sheet') return closeSheet(); onClick?.(e); };
}
function closeSheet() { $('#sheet').hidden = true; }
const Sheets = {
  comments(v) {
    const list = commentsFor(v);
    openSheet(`<div class="sh-title">Commentaires <span>${fmtN(v.comments + (St.comments[v.id]?.length || 0))}</span><button class="ib" data-close aria-label="Fermer">${ic('close')}</button></div>
      <form class="c-form" id="c-form">${avatar('Raphaël')}<input id="c-input" placeholder="Ajouter un commentaire…" maxlength="500" autocomplete="off"><button class="c-send" aria-label="Publier">${ic('send')}</button></form>
      <div class="c-list">${list.map((c) => `<div class="c-item">${avatar(c.who)}<div><div class="c-meta">@${esc(c.who.toLowerCase())} · ${c.mine ? "à l'instant" : fmtAgo(c.ago)}</div><p>${esc(c.text)}</p>
      <div class="c-acts"><button data-clike="${c.id}" class="${St.cliked.includes(c.id) ? 'on' : ''}">${ic(St.cliked.includes(c.id) ? 'likeF' : 'like')}${c.likes + (St.cliked.includes(c.id) ? 1 : 0) || ''}</button>${c.mine ? `<button data-cdel="${c.id}">${ic('trash')}</button>` : ''}</div></div></div>`).join('')}</div>`,
    (e) => {
      if (e.target.closest('[data-close]')) return closeSheet();
      const l = e.target.closest('[data-clike]'); if (l) { const id = l.dataset.clike; St.cliked = St.cliked.includes(id) ? St.cliked.filter((x) => x !== id) : [...St.cliked, id]; save(); return Sheets.comments(v); }
      const d = e.target.closest('[data-cdel]'); if (d) { St.comments[v.id] = St.comments[v.id].filter((c) => c.id !== d.dataset.cdel); save(); toast('Commentaire supprimé'); return Sheets.comments(v); }
    });
    $('#c-form').onsubmit = (e) => { e.preventDefault(); const t = $('#c-input').value.trim(); if (!t) return;
      (St.comments[v.id] ||= []).unshift({ id: `${v.id}-u${Date.now()}`, who: 'Raphaël', text: t, likes: 0, ago: 0, mine: true }); save(); toast('Commentaire publié'); Sheets.comments(v); if (UI.page === 'watch') Watch.renderInfo(); };
  },
  settings() {
    const sp = [0.5, 1, 1.25, 1.5, 2];
    openSheet(`<div class="sh-title">Paramètres de lecture</div><div class="menu-list">
      <div class="sh-row"><span>${ic('speed')}Vitesse</span><div class="seg">${sp.map((x) => `<button data-speed="${x}" class="${St.speed === x ? 'on' : ''}">${String(x).replace('.', ',')}×</button>`).join('')}</div></div>
      <div class="sh-row"><span>${ic('hd')}Qualité</span><div class="seg">${['Auto', '1080p', '720p', '480p'].map((q) => `<button data-quality="${q}" class="${St.quality === q ? 'on' : ''}">${q}</button>`).join('')}</div></div>
      <button data-auto>${ic('autoplay')}Lecture automatique : ${St.autoplay ? 'activée' : 'désactivée'}</button></div>`,
    (e) => { const s = e.target.closest('[data-speed]'), q = e.target.closest('[data-quality]');
      if (s) { St.speed = +s.dataset.speed; save(); toast(`Vitesse : ${s.textContent}`); return Sheets.settings(); }
      if (q) { St.quality = q.dataset.quality; save(); toast(`Qualité : ${q.dataset.quality}`); return Sheets.settings(); }
      if (e.target.closest('[data-auto]')) { St.autoplay = !St.autoplay; save(); return Sheets.settings(); } });
  },
  explore() {
    openSheet(`<div class="sh-title">Explorer</div><div class="menu-list">${Object.keys(TOPICS).map((c) => `<button data-ex="${esc(c)}">${ic('compass')}${esc(c)}</button>`).join('')}<button data-ex="Direct">${ic('live')}En direct</button></div>`,
      (e) => { const b = e.target.closest('[data-ex]'); if (b) { UI.chip = b.dataset.ex; closeSheet(); UI.go('home'); } });
  },
  notifications() {
    const src = (St.subs.length ? VIDEOS.filter((v) => St.subs.includes(v.channel)) : Reco.feed()).slice(0, 8);
    openSheet(`<div class="sh-title">Notifications</div><div class="n-list">${src.map((v, i) => `<div class="n-item${i < 3 && !St.notifSeen ? ' unread' : ''}" data-v="${v.id}">${avatar(v.channel)}<div><p><b>${esc(v.channel)}</b> a mis en ligne : ${esc(v.title)}</p><small>${fmtAgo(v.ago % 20)}</small></div><img src="${thumb(v.id, 320, 180, v.title)}" alt=""></div>`).join('')}</div>`,
      (e) => { if (e.target.closest('[data-v]')) closeSheet(); });
    St.notifSeen = true; save(); $('.badge i')?.remove();
  },
  create() {
    openSheet(`<div class="sh-title">Créer</div><div class="menu-list"><button data-cr>${ic('clips')}Créer un clip</button><button data-cr>${ic('upload')}Mettre en ligne une vidéo</button><button data-cr>${ic('live')}Passer en direct</button></div>
      <p class="sh-note">La mise en ligne nécessite un serveur de stockage et de transcodage : hors du périmètre de ce prototype.</p>`,
      (e) => { if (e.target.closest('[data-cr]')) { closeSheet(); toast('Mise en ligne indisponible dans le prototype'); } });
  },
  watchTime() {
    const days = Array.from({ length: 7 }, (_, i) => St.watchByDay[new Date(Date.now() - (6 - i) * 864e5).toDateString()] || 0);
    const max = Math.max(60, ...days); const avg = days.reduce((a, b) => a + b, 0) / 7;
    openSheet(`<div class="sh-title">Temps de visionnage</div><div class="wt"><b>${Math.round(avg / 60)} min</b><small>Moyenne quotidienne (7 derniers jours)</small>
      <div class="wt-bars">${days.map((d, i) => `<div><span style="height:${(d / max) * 100}%"></span><small>${['D', 'L', 'M', 'M', 'J', 'V', 'S'][new Date(Date.now() - (6 - i) * 864e5).getDay()]}</small></div>`).join('')}</div></div>`);
  },
  share(v, t) {
    const url = `${location.origin}${location.pathname}?v=${v.id}${t ? `&t=${Math.floor(t)}` : ''}`;
    if (navigator.share) navigator.share({ title: v.title, url }).catch(() => {}); else { navigator.clipboard?.writeText(url).catch(() => {}); toast(t ? `Lien copié (à ${ts(t)})` : 'Lien copié'); }
  },
};

/* ---------- Pages chaîne et listes ---------- */
const Pages = {
  channel(name) {
    const vids = VIDEOS.filter((v) => v.channel === name).sort((a, b) => a.ago - b.ago); const sub = St.subs.includes(name);
    const total = vids.reduce((s, v) => s + v.subs, 0) / Math.max(1, vids.length);
    $('#page-channel').innerHTML = `<header class="appbar"><button class="ib" data-act="back">${ic('back')}</button><span class="ap-title">${esc(name)}</span><button class="ib" data-act="search">${ic('search')}</button></header>
      <div class="ch-banner"><img src="${thumb(name + 'banner', 640, 160, '')}" alt=""></div>
      <div class="ch-head">${avatar(name, 'xl')}<div><h2>${esc(name)}</h2><small>@${esc(name.toLowerCase().replace(/[^a-z]/g, ''))} · ${fmtN(Math.floor(total))} abonnés · ${vids.length} vidéo${vids.length > 1 ? 's' : ''}</small></div></div>
      <div style="padding:0 12px 12px"><button class="sub-btn wide${sub ? ' on' : ''}" data-sub="${esc(name)}">${sub ? ic('bellOn') + 'Abonné' : "S'abonner"}</button></div>
      <div class="ch-tabs"><span class="on">Vidéos</span><span>Clips</span><span>Playlists</span></div>
      ${vids.map((v) => UI.resultRow(v)).join('')}`;
    UI.go('channel');
  },
  list(kind) {
    const map = { history: ['Historique', St.history], later: ['À regarder plus tard', St.later], liked: ["Vidéos « J'aime »", St.liked], downloads: ['Téléchargements', St.downloads] };
    const [title, ids] = map[kind]; const vids = ids.map(byId).filter(Boolean);
    $('#page-list').innerHTML = `<header class="appbar"><button class="ib" data-act="back">${ic('back')}</button><span class="ap-title">${title}</span><span style="width:40px"></span></header>
      ${vids.length ? `<div class="list-meta">${vids.length} vidéo${vids.length > 1 ? 's' : ''}${kind === 'downloads' ? ' · disponibles hors connexion (démo)' : ''}</div>` + vids.map((v) => UI.resultRow(v, kind)).join('') : `<div class="empty"><b>Rien ici</b>Cette liste est vide pour l'instant.</div>`}`;
    UI.go('list');
  },
};

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
    p.innerHTML = `<div class="sim"><img src="${thumb(v.id, 640, 360, v.title)}" alt=""></div><span class="demo-tag">Lecture simulée · contenu fictif</span>
      <div class="ptop"><button class="ib" data-act="minimize" aria-label="Réduire">${ic('chevDown')}</button><div style="display:flex"><button class="ib" data-act="cast">${ic('cast')}</button><button class="ib" data-act="settings">${ic('gear')}</button></div></div>
      <div class="pctrl"><button data-p="rew" aria-label="Reculer de 10 s">${ic('rew')}</button><button class="pp" data-p="pp" aria-label="Lecture/Pause"></button><button data-p="ffw" aria-label="Avancer de 10 s">${ic('ffw')}</button></div>
      <div class="ptime"></div><div class="pbar"><span></span></div>`;
    this.play();
  },
  renderInfo() {
    const v = this.v, sub = St.subs.includes(v.channel), liked = St.liked.includes(v.id), dis = St.disliked.includes(v.id), dl = St.downloads.includes(v.id);
    const next = v.yt ? Reco.feed() : Reco.upNext(v); this.next = next; const com = commentsFor(v)[0];
    $('#watch').innerHTML = `<div class="w-title">${esc(v.title)}</div>
      ${v.views ? `<div class="w-sub">${fmtN(v.views)} vues · ${fmtAgo(v.ago)} · <span class="tag">#${esc(v.cat.toLowerCase().replace(/\s/g, ''))}</span></div>` : ''}
      <div class="w-channel"><span data-ch="${esc(v.channel)}" class="w-ch-link">${avatar(v.channel, 'lg')}<span class="cn">${esc(v.channel)}</span><span class="cs">${v.subs ? fmtN(v.subs) : ''}</span></span><span class="grow"></span>
        ${v.yt ? '' : `<button class="sub-btn${sub ? ' on' : ''}" data-sub="${esc(v.channel)}">${sub ? ic('bellOn') + 'Abonné' : "S'abonner"}</button>`}</div>
      <div class="actions"><div class="pill split"><button data-like="${v.id}" class="${liked ? 'on' : ''}" aria-pressed="${liked}">${ic(liked ? 'likeF' : 'like')}${fmtN(v.likes + (liked ? 1 : 0))}</button><button data-dislike="${v.id}" class="${dis ? 'on' : ''}" aria-pressed="${dis}" aria-label="Je n'aime pas">${ic(dis ? 'dislikeF' : 'dislike')}</button></div>
        <button class="pill" data-share="${v.id}">${ic('share')}Partager</button><button class="pill${St.later.includes(v.id) ? ' on' : ''}" data-later="${v.id}">${ic('save')}${St.later.includes(v.id) ? 'Enregistrée' : 'Enregistrer'}</button>
        <button class="pill${dl ? ' on' : ''}" data-dl="${v.id}">${ic(dl ? 'check' : 'download')}${dl ? 'Téléchargée' : 'Télécharger'}</button><button class="pill" data-extract>${ic('clipIt')}Extrait</button></div>
      ${v.yt ? '' : `<div class="desc" data-desc><b>Description</b><p>${esc(v.title)}. ${esc(v.channel)} vous emmène pas à pas, sans jargon.</p>
        <div class="chapters">${chapters(v).map((c) => `<button data-seek="${c.t}"><span>${ts(c.t)}</span>${c.label}</button>`).join('')}</div><span class="more-l">…plus</span></div>
      <div class="comments" data-comments><div class="ch">Commentaires<span>${fmtN(v.comments + (St.comments[v.id]?.length || 0))}</span></div><div class="cb">${avatar(com.who)}<p>${esc(com.text)}</p></div></div>`}
      ${St.autoplay && next[0] ? `<div class="upnext-h">À suivre <small>Lecture automatique activée</small></div>` : ''}
      ${next.slice(0, 12).map((x) => UI.card(x)).join('')}`;
  },
  toggleDownload(v) {
    const on = St.downloads.includes(v.id); St.downloads = on ? St.downloads.filter((x) => x !== v.id) : [v.id, ...St.downloads]; save();
    toast(on ? 'Téléchargement supprimé' : 'Téléchargée : disponible dans Vous › Téléchargements');
  },
  play() {
    this.playing = true; this.syncPP(); clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.t += .25 * St.speed; const day = new Date().toDateString(); St.watchByDay[day] = (St.watchByDay[day] || 0) + .25;
      if (this.t >= this.v.secs) { this.t = this.v.secs; clearInterval(this.timer); save(); if (St.autoplay && this.next?.[0]) { toast('Lecture de la vidéo suivante'); return this.open(this.next[0]); } this.playing = false; this.syncPP(); }
      this.syncBar(); if (Math.round(this.t * 4) % 40 === 0) save();
    }, 250); this.flashUI();
  },
  pause() { this.playing = false; clearInterval(this.timer); this.syncPP(); this.flashUI(true); },
  stop() { clearInterval(this.timer); this.playing = false; $('#player').innerHTML = ''; },
  syncPP() { const b = $('[data-p=pp]'); if (b) b.innerHTML = ic(this.playing ? 'pause' : 'play'); $('.sim')?.classList.toggle('paused', !this.playing); },
  syncBar() {
    const s = this.v.secs || 1, f = (x) => `${Math.floor(x / 60)}:${String(Math.floor(x % 60)).padStart(2, '0')}`;
    const bar = $('.pbar span'); if (bar) { bar.style.width = (this.t / s) * 100 + '%'; bar.parentElement.style.setProperty('--pp', (this.t / s) * 100 + '%'); }
    const tm = $('.ptime'); if (tm) tm.textContent = `${f(this.t)} / ${f(s)}`;
  },
  flashUI(stay) { const p = $('#player'); p.classList.add('ui'); clearTimeout(this.uiTimer); if (!stay) this.uiTimer = setTimeout(() => p.classList.remove('ui'), 2500); },
};

/* ---------- Événements ---------- */
const toggleIn = (key, id) => { const on = St[key].includes(id); St[key] = on ? St[key].filter((x) => x !== id) : [...St[key], id]; save(); return !on; };
document.addEventListener('click', (e) => {
  const t = e.target;
  const menu = t.closest('[data-menu]'); if (menu) { e.stopPropagation(); return UI.sheet(byId(menu.dataset.menu)); }
  const go = t.closest('[data-go]'); if (go) { if (go.dataset.go === 'create') return Sheets.create(); if (go.dataset.go === UI.page) return UI.refresh(); return UI.go(go.dataset.go); }
  const chip = t.closest('[data-chip]'); if (chip) { if (UI.chip === chip.dataset.chip) return UI.refresh(); UI.chip = chip.dataset.chip; UI.home(); window.scrollTo(0, 0); return; }
  const sub = t.closest('[data-sub]'); if (sub) { e.stopPropagation(); const c = sub.dataset.sub; const on = toggleIn('subs', c); toast(on ? `Abonné à ${c}` : 'Abonnement annulé');
    return ({ watch: () => Watch.renderInfo(), clips: () => UI.clips(), channel: () => Pages.channel(c) })[UI.page]?.(); }
  const ch = t.closest('[data-ch]'); if (ch) { e.stopPropagation(); return Pages.channel(ch.dataset.ch); }
  const like = t.closest('[data-like]'); if (like) { const id = like.dataset.like; const on = toggleIn('liked', id); if (on && St.disliked.includes(id)) toggleIn('disliked', id);
    toast(on ? 'Ajoutée aux vidéos « J\'aime »' : 'Retirée des vidéos « J\'aime »'); return UI.page === 'watch' ? Watch.renderInfo() : UI.clips(); }
  const dis = t.closest('[data-dislike]'); if (dis) { const id = dis.dataset.dislike; const on = toggleIn('disliked', id); if (on && St.liked.includes(id)) toggleIn('liked', id);
    toast(on ? 'Vous n\'aimez pas cette vidéo. Nous en tiendrons compte.' : 'Avis retiré'); return UI.page === 'watch' ? Watch.renderInfo() : UI.clips(); }
  const later = t.closest('[data-later]'); if (later) { const on = toggleIn('later', later.dataset.later); toast(on ? 'Enregistré dans « À regarder plus tard »' : 'Retiré de « À regarder plus tard »'); return Watch.renderInfo(); }
  const dl = t.closest('[data-dl]'); if (dl) { Watch.toggleDownload(byId(dl.dataset.dl) || Watch.v); return Watch.renderInfo(); }
  const sh = t.closest('[data-share]'); if (sh) return Sheets.share(byId(sh.dataset.share) || Watch.v);
  if (t.closest('[data-extract]')) return Sheets.share(Watch.v, Watch.t || 1);
  const seek = t.closest('[data-seek]'); if (seek) { e.stopPropagation(); Watch.t = +seek.dataset.seek; Watch.syncBar(); if (!Watch.playing) Watch.play(); window.scrollTo({ top: 0, behavior: 'smooth' }); return toast(`Chapitre : ${seek.textContent.replace(/^[\d:]+/, '')}`); }
  const desc = t.closest('[data-desc]'); if (desc) return desc.classList.toggle('open');
  if (t.closest('[data-comments]')) return Sheets.comments(Watch.v);
  const cc = t.closest('[data-ccom]'); if (cc) return Sheets.comments(byId(cc.dataset.ccom));
  const lst = t.closest('[data-list]'); if (lst) return Pages.list(lst.dataset.list);
  const rm = t.closest('[data-rm]'); if (rm) { e.stopPropagation(); const [k, id] = rm.dataset.rm.split(':'); const key = { history: 'history', later: 'later', liked: 'liked', downloads: 'downloads' }[k];
    St[key] = St[key].filter((x) => x !== id); save(); toast('Retiré de la liste'); return Pages.list(k); }
  const v = t.closest('[data-v]'); if (v) { const vid = byId(v.dataset.v); if (vid?.id.startsWith('c')) return UI.go('clips'); return Watch.open(vid); }
  const clip = t.closest('[data-clip]'); if (clip) return UI.go('clips');
  const q = t.closest('[data-q]'); if (q) { $('#q').value = q.dataset.q; return UI.results(q.dataset.q); }
  const pc = t.closest('[data-p]'); if (pc) { e.stopPropagation(); const a = pc.dataset.p;
    if (a === 'pp') Watch.playing ? Watch.pause() : Watch.play(); if (a === 'rew') Watch.t = Math.max(0, Watch.t - 10); if (a === 'ffw') Watch.t = Math.min(Watch.v.secs - 1, Watch.t + 10); Watch.syncBar(); return Watch.flashUI(!Watch.playing); }
  const act = t.closest('[data-act]')?.dataset.act;
  if (!act && t.closest('#player')) return Watch.flashUI(!Watch.playing);
  if (act === 'search') { UI.go('search'); $('#q').value = ''; UI.search(''); return setTimeout(() => $('#q').focus(), 30); }
  if (act === 'back' || act === 'minimize') return UI.back();
  if (act === 'home') { e.preventDefault(); if (UI.page === 'home' && UI.chip === 'Tout') return UI.refresh(); UI.chip = 'Tout'; return UI.go('home'); }
  if (act === 'notif') return Sheets.notifications();
  if (act === 'cast') return toast('Recherche d\'appareils… aucun appareil compatible sur ce réseau');
  if (act === 'settings') return Sheets.settings();
  if (act === 'explore') return Sheets.explore();
  if (act === 'watchtime') return Sheets.watchTime();
  if (act === 'adblock') { St.adblock = St.adblock === false; save(); toast(`Bloqueur de publicités ${St.adblock ? 'activé' : 'désactivé'}`); return UI.you(); }
  if (act === 'clipmenu') return Sheets.settings();
  if (act === 'voice') {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition; if (!SR) return toast('Recherche vocale indisponible sur ce navigateur');
    const r = new SR(); r.lang = 'fr-FR'; r.onresult = (ev) => { $('#q').value = ev.results[0][0].transcript; UI.results($('#q').value); }; r.start(); return toast('Parlez maintenant…');
  }
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
if (St.notifSeen) document.querySelector('.badge i')?.remove();
if (new URLSearchParams(location.search).get('t')) setTimeout(() => { Watch.t = +new URLSearchParams(location.search).get('t'); Watch.syncBar(); }, 100);
const start = new URLSearchParams(location.search);
UI.go(start.get('p') || 'home');
if (start.get('v')) Watch.open(VIDEOS.find((v) => v.id === start.get('v')) || VIDEOS[0]);
window.Lumen = { UI, Watch, VIDEOS, St, Pages, Reco, Sheets };
