/* Cadence : lecteur musical adossé au catalogue YouTube (prototype de mémoire, clean-room).
 * Lecture : lecteur IFrame YouTube officiel, toujours visible (≥ 200×200). Pas d'extraction de flux.
 * Les morceaux « démo » sont fictifs, avec pochettes générées : ils servent aux tests de design
 * hors ligne, et leur lecture est simulée.
 */
'use strict';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (s) => { s = Math.max(0, Math.round(s || 0)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

/* ---------- Icônes (dessinées pour le projet) ---------- */
const P = {
  home: '<path d="M3.5 10.6 12 3.8l8.5 6.8V20a1 1 0 0 1-1 1h-5v-6.2h-5V21h-5a1 1 0 0 1-1-1z" fill="currentColor"/>',
  grid: '<rect x="3.5" y="3.5" width="7.5" height="7.5" rx="2" fill="currentColor"/><rect x="13" y="3.5" width="7.5" height="7.5" rx="2" fill="currentColor"/><rect x="3.5" y="13" width="7.5" height="7.5" rx="2" fill="currentColor"/><rect x="13" y="13" width="7.5" height="7.5" rx="3.75" fill="currentColor"/>',
  library: '<path d="M6 3.2h12M4.6 5.8h14.8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/><rect x="3" y="8" width="18" height="13.5" rx="3" fill="currentColor"/><path d="M14.5 10.8v6.1a1.9 1.9 0 1 1-1.3-1.8v-3.6l-3 .7v4.4a1.9 1.9 0 1 1-1.3-1.8v-4.2z" fill="var(--icon-cut, #fff)"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.8" stroke="currentColor" stroke-width="2.2" fill="none"/><path d="m15.6 15.6 5 5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
  mic: '<rect x="9" y="2.8" width="6" height="11.4" rx="3" stroke="currentColor" stroke-width="1.8" fill="none"/><path d="M5.8 11.2a6.2 6.2 0 0 0 12.4 0M12 17.4v3.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/>',
  play: '<path d="M7 4.6v14.8a1 1 0 0 0 1.5.86l12.3-7.4a1 1 0 0 0 0-1.72L8.5 3.74A1 1 0 0 0 7 4.6z" fill="currentColor"/>',
  pause: '<rect x="6" y="4.5" width="4.2" height="15" rx="1.2" fill="currentColor"/><rect x="13.8" y="4.5" width="4.2" height="15" rx="1.2" fill="currentColor"/>',
  next: '<path d="M3 6.2v11.6a.8.8 0 0 0 1.2.7L12 12.7v5.1a.8.8 0 0 0 1.2.7l8.6-5.8a.85.85 0 0 0 0-1.4l-8.6-5.8a.8.8 0 0 0-1.2.7v5.1L4.2 5.5a.8.8 0 0 0-1.2.7z" fill="currentColor"/>',
  prev: '<path d="M21 6.2v11.6a.8.8 0 0 1-1.2.7L12 12.7v5.1a.8.8 0 0 1-1.2.7l-8.6-5.8a.85.85 0 0 1 0-1.4l8.6-5.8a.8.8 0 0 1 1.2.7v5.1l7.8-5.8a.8.8 0 0 1 1.2.7z" fill="currentColor"/>',
  note: '<path d="M17.5 3.5v11.3a2.8 2.8 0 1 1-1.8-2.6V7.6l-6.6 1.6v7.9a2.8 2.8 0 1 1-1.8-2.6V6.4z" fill="currentColor"/>',
  more: '<circle cx="5.5" cy="12" r="1.9" fill="currentColor"/><circle cx="12" cy="12" r="1.9" fill="currentColor"/><circle cx="18.5" cy="12" r="1.9" fill="currentColor"/>',
  shuffle: '<path d="M3 7h3.6c2.2 0 3.4 1 4.7 3l2.4 4c1.2 2 2.4 3 4.6 3H21M3 17h3.6c1.6 0 2.6-.5 3.5-1.5M13.9 8.5c.9-1 1.9-1.5 3.5-1.5H21M18.5 4.5 21 7l-2.5 2.5M18.5 14.5 21 17l-2.5 2.5" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
  repeat: '<path d="M4 11V9.5A3.5 3.5 0 0 1 7.5 6H19m-3-3 3 3-3 3M20 13v1.5a3.5 3.5 0 0 1-3.5 3.5H5m3 3-3-3 3-3" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
  repeat1: '<path d="M4 11V9.5A3.5 3.5 0 0 1 7.5 6H19m-3-3 3 3-3 3M20 13v1.5a3.5 3.5 0 0 1-3.5 3.5H5m3 3-3-3 3-3" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M11.2 10.4 12.6 9.6V14.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/>',
  queue: '<path d="M4 6h11M4 11h11M4 16h7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M17 13.5v6.3a1.8 1.8 0 1 1-1.2-1.7v-6.4l4.2-1v1.8z" fill="currentColor"/>',
  heart: '<path d="M12 20.3s-7.8-4.6-7.8-10.2A4.4 4.4 0 0 1 12 7.2a4.4 4.4 0 0 1 7.8 2.9c0 5.6-7.8 10.2-7.8 10.2z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" fill="none"/>',
  heartFill: '<path d="M12 20.3s-7.8-4.6-7.8-10.2A4.4 4.4 0 0 1 12 7.2a4.4 4.4 0 0 1 7.8 2.9c0 5.6-7.8 10.2-7.8 10.2z" fill="currentColor"/>',
  plus: '<path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
  playNext: '<path d="M4 7h10M4 12h10M4 17h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M16 13.5v6l5-3z" fill="currentColor"/>',
  playLast: '<path d="M4 7h10M4 12h6M4 17h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M16 4v6l5-3z" fill="currentColor"/>',
  listAdd: '<path d="M4 6h12M4 11h12M4 16h7M17 14v7M13.5 17.5h7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  trash: '<path d="M4.5 6.5h15M9.5 6.5V4.5h5v2M6.5 6.5l1 13a1.5 1.5 0 0 0 1.5 1.4h6a1.5 1.5 0 0 0 1.5-1.4l1-13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
  chevR: '<path d="m9 5 7 7-7 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
  chevL: '<path d="m15 5-7 7 7 7" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
  close: '<path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>',
  playlists: '<path d="M4 6h11M4 11h11M4 16h7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M18 9.5v8.3a1.8 1.8 0 1 1-1.2-1.7V8.5L21 7.4v1.8z" fill="currentColor"/>',
  person: '<circle cx="12" cy="8" r="4.2" fill="currentColor"/><path d="M3.8 20.6a8.2 8.2 0 0 1 16.4 0z" fill="currentColor"/>',
  album: '<rect x="3.5" y="3.5" width="17" height="17" rx="3" stroke="currentColor" stroke-width="1.8" fill="none"/><circle cx="12" cy="12" r="3.6" stroke="currentColor" stroke-width="1.8" fill="none"/>',
  song: '<path d="M17.5 3.5v11.3a2.8 2.8 0 1 1-1.8-2.6V6.5l-6.6 1.6v9a2.8 2.8 0 1 1-1.8-2.6V6.4z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/>',
  volLo: '<path d="M4 9.5h3l4.5-4v13l-4.5-4H4z" fill="currentColor"/>',
  output: '<path d="M6 17H4.5A1.5 1.5 0 0 1 3 15.5v-10A1.5 1.5 0 0 1 4.5 4h15A1.5 1.5 0 0 1 21 5.5v10a1.5 1.5 0 0 1-1.5 1.5H18" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M12 13.5 17 20H7z" fill="currentColor"/>',
  volHi: '<path d="M3 9.5h3l4.5-4v13l-4.5-4H3z" fill="currentColor"/><path d="M14 9a4.2 4.2 0 0 1 0 6M16.8 6.4a8 8 0 0 1 0 11.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/>',
};
const icon = (n) => `<svg viewBox="0 0 24 24" aria-hidden="true">${P[n]}</svg>`;

/* ---------- Pochettes générées (déterministes) ---------- */
function hash(s) { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let s = seed || 1; return () => ((s = Math.imul(s ^ (s >>> 15), 2246822507) ^ Math.imul(s ^ (s >>> 13), 3266489909)) >>> 0) / 4294967296; }
/* Palettes éditoriales (sélection manuelle) : rendu plus « pochette » que des teintes aléatoires */
const PALETTES = [
  ['#1d2b64', '#f8cdda', '#ff6f91'], ['#0f2027', '#2c5364', '#7ee8fa'], ['#3a1c71', '#d76d77', '#ffaf7b'],
  ['#134e5e', '#71b280', '#e8f5c8'], ['#2b1055', '#7597de', '#f0c3ff'], ['#2f0743', '#41295a', '#ff9a8b'],
  ['#1a1a1d', '#4e4e50', '#e0c3fc'], ['#4a1942', '#ff5f6d', '#ffc371'], ['#00416a', '#79a7c7', '#f9d423'],
  ['#2c3e2d', '#2c7744', '#f2e6d0'], ['#240b36', '#c31432', '#ff8a5c'], ['#05117e', '#6a82fb', '#fc5c7d'],
  ['#3d2c1e', '#c08552', '#f3e9dc'], ['#0d3b66', '#f4d35e', '#ee964b'], ['#1b0e2e', '#5f0f40', '#fb8b24'],
];
function palette(seed) { const p = PALETTES[hash('pal:' + seed + ':' + String(seed).length) % PALETTES.length]; return [p[2], p[1], p[0]]; }
const artCache = new Map();
function genArt(seed, label) {
  const key = seed + '|' + (label || ''); if (artCache.has(key)) return artCache.get(key);
  const r = rng(hash(seed + '#')); const [hi, mid, dark] = palette(seed).map(String); const style = hash('style:' + seed) % 5;
  const blob = (c, op) => `<circle cx="${(r() * 300).toFixed(0)}" cy="${(r() * 300).toFixed(0)}" r="${(70 + r() * 110).toFixed(0)}" fill="${c}" opacity="${op}"/>`;
  let body = `<rect width="300" height="300" fill="${dark}"/><g filter="url(#b)">${blob(mid, .95)}${blob(hi, .85)}${blob(mid, .7)}${blob(hi, .5)}</g>`;
  if (style === 1) { // anneaux fins
    let s = ''; for (let i = 1; i < 14; i++) s += `<circle cx="150" cy="${150 + i * 2}" r="${i * 11}" fill="none" stroke="${hi}" stroke-opacity="${(1 - i / 15).toFixed(2)}" stroke-width="1.2"/>`;
    body += s;
  } else if (style === 2) { // monogramme
    body += `<text x="22" y="262" font-family="Inter Display, Inter, sans-serif" font-weight="800" font-size="230" fill="${hi}" opacity=".9" letter-spacing="-12">${esc((label || seed).replace(/[^A-Za-zÀ-ÿ]/g, '').slice(0, 1).toUpperCase() || 'C')}</text>`;
  } else if (style === 3) { // bandes obliques
    let s = ''; for (let i = -4; i < 12; i++) s += `<rect x="${i * 34}" y="-50" width="12" height="420" fill="${i % 3 ? mid : hi}" opacity=".55" transform="rotate(28 150 150)"/>`;
    body += s;
  } else if (style === 4) { // soleil + horizon
    body += `<circle cx="150" cy="168" r="78" fill="${hi}"/><rect y="168" width="300" height="132" fill="${dark}" opacity=".88"/>`;
    for (let i = 0; i < 6; i++) body += `<rect x="${72 + i * 3}" y="${178 + i * 14}" width="${156 - i * 6}" height="${4 + i}" rx="2" fill="${hi}" opacity="${(.5 - i * .07).toFixed(2)}"/>`;
  }
  if (label) body += `<text x="20" y="38" font-family="Inter, sans-serif" font-weight="700" font-size="17" fill="#fff" opacity=".92" letter-spacing=".5">${esc(label.toUpperCase().slice(0, 22))}</text>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><defs><filter id="b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="26"/></filter>
    <filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .09 0"/></filter>
    <radialGradient id="v" cx=".5" cy=".45" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></radialGradient></defs>
    ${body}<rect width="300" height="300" fill="url(#v)"/><rect width="300" height="300" filter="url(#n)"/></svg>`;
  const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  artCache.set(key, url); return url;
}
/* <img> avec repli sur la pochette générée si la vignette YouTube ne charge pas */
function artImg(t, key) {
  const fb = genArt(key || t.album || t.id, t.demo && t.album && hash(t.album) % 3 === 0 ? t.album.split(' — ')[1] : '');
  const src = t.demo || !t.thumb ? fb : t.thumb;
  return `<img src="${esc(src)}" alt="" loading="lazy" onerror="this.onerror=null;this.src='${fb}'">`;
}

/* ---------- Catalogue de démonstration (entièrement fictif) ---------- */
const DEMO_ARTISTS = ['Nova Lune', 'Les Rives', 'Kaïs Merel', 'Orée', 'Midi Vingt', 'Sable Noir', 'Jade Okoro', 'Velours', 'Tamaris', 'Ilan Fosse', 'Poussière d\'Or', 'Mira Vale'];
const DEMO_WORDS = ['Néons', 'Marée haute', 'Dernier métro', 'Lumière froide', 'Satellite', 'Après minuit', 'Vertige', 'Cœur pixel', 'Avenue', 'Rêve lucide', 'Tempête douce', 'Écho', 'Électrique', 'Horizon', 'Sous la pluie', 'Roulette', 'Ciel ouvert', 'Ombre portée', 'Fièvre', 'Kilomètres', 'Calme plat', 'Grand bleu', 'Silhouette', 'Mirage'];
const GENRES = [
  { id: 'charts', name: 'Classements', c: '#7a7a2a', c2: '#4b4b16' }, { id: 'hits', name: 'Hits du moment', c: '#d8b93a', c2: '#c08a1e' },
  { id: 'rapfr', name: 'Rap francophone', c: '#6a8be8', c2: '#4a63c9' }, { id: 'popfr', name: 'Pop française', c: '#e8678c', c2: '#c94570' },
  { id: 'pop', name: 'Pop', c: '#e35a7a', c2: '#c23c63' }, { id: 'rap', name: 'Rap', c: '#6b8ae6', c2: '#4d66c4' },
  { id: 'rnb', name: 'R&B', c: '#8e78dc', c2: '#6a54c0' }, { id: 'dance', name: 'Dance', c: '#4fb46f', c2: '#2f8f53' },
  { id: 'electro', name: 'Électronique', c: '#4aae6c', c2: '#2c8a52' }, { id: 'chill', name: 'Chill', c: '#e9414f', c2: '#b82a3a' },
  { id: 'live', name: 'Concerts', c: '#3a1414', c2: '#1a0909' }, { id: 'acoustic', name: 'Acoustique', c: '#ec7088', c2: '#cc5270' },
  { id: '80s', name: 'Les années 80', c: '#e0b23a', c2: '#c0901e' }, { id: '90s', name: 'Les années 90', c: '#dcae3c', c2: '#b88a20' },
  { id: 'jazz', name: 'Jazz', c: '#2f6f8f', c2: '#1d4a62' }, { id: 'rock', name: 'Rock', c: '#555c66', c2: '#383d45' },
];
const GLYPHS = {
  charts: '<path d="M4 20V13M9 20V8M14 20V11M19 20V4"/>', hits: '<path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-4-1-6 1-9z"/>',
  rapfr: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6"/>', popfr: '<path d="M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z"/>',
  pop: '<path d="M12 4l1.8 4.6L18.5 10l-4.7 1.4L12 16l-1.8-4.6L5.5 10l4.7-1.4zM18 16l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>', rap: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4"/>',
  rnb: '<path d="M12 20s-7-4.2-7-9.4A4 4 0 0 1 12 8a4 4 0 0 1 7 2.6C19 15.8 12 20 12 20z"/>', dance: '<circle cx="12" cy="13" r="7"/><path d="M5 13h14M12 6v14M7 8.5c3 2 7 2 10 0M7 17.5c3-2 7-2 10 0M12 3v3"/>',
  electro: '<path d="M2 12h3l2-6 3 12 3-9 2 6 2-3h5"/>', chill: '<path d="M18 15A7 7 0 1 1 10 5a6 6 0 0 0 8 10z"/>',
  live: '<path d="M4 20l5-12M20 20l-5-12M12 20V6M6 4l2 3M18 4l-2 3M12 2v2"/>', acoustic: '<circle cx="9" cy="15" r="5"/><path d="M12.5 11.5 20 4M18 3l3 3M9 15h.01"/>',
  '80s': '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="8.5" cy="12" r="2"/><circle cx="15.5" cy="12" r="2"/><path d="M7 18l1.5-3h7L17 18"/>', '90s': '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/><path d="M12 5.5a6.5 6.5 0 0 1 6.5 6.5"/>',
  jazz: '<path d="M17 3v12a3 3 0 1 1-2-2.8V6L9 7.5v9.5a3 3 0 1 1-2-2.8V5.5z"/>', rock: '<path d="M13 2 5 14h6l-1 8 8-12h-6z"/>',
};
/* Catalogue de démonstration : 12 artistes fictifs × 2 albums × 4 titres, chacun avec un genre principal. */
const DEMO_GENRE_OF = { 'Nova Lune': 'popfr', 'Les Rives': 'acoustic', 'Kaïs Merel': 'rapfr', 'Orée': 'chill', 'Midi Vingt': 'electro', 'Sable Noir': 'rock',
  'Jade Okoro': 'rnb', 'Velours': 'jazz', 'Tamaris': 'dance', 'Ilan Fosse': 'rap', "Poussière d'Or": '80s', 'Mira Vale': 'pop' };
const DEMO = (() => {
  const r = rng(42); const tracks = []; let n = 0;
  DEMO_ARTISTS.forEach((artist, ai) => {
    for (let al = 0; al < 2; al++) {
      const album = `${artist} — ${DEMO_WORDS[(ai * 5 + al * 11) % DEMO_WORDS.length]}`;
      for (let k = 0; k < 4; k++) {
        const w = DEMO_WORDS[(ai * 7 + al * 4 + k * 3) % DEMO_WORDS.length];
        const title = k === 3 ? `${w} (version live)` : al && k === 1 ? `${w} II` : w;
        tracks.push({ id: `demo-${n++}`, demo: true, title, artist, album, dur: 150 + Math.floor(r() * 110),
          genre: DEMO_GENRE_OF[artist], pop: Math.round(r() * 100), year: 2026 - Math.floor(r() * (al ? 2 : 8)) });
      }
    }
  });
  return tracks;
})();
const GENRE_ALIAS = { charts: null, hits: null, live: 'live', '90s': '80s' };
function demoFor(genreId) {
  if (genreId === 'charts' || genreId === 'hits') return DEMO.slice().sort((a, b) => b.pop - a.pop).slice(0, 20);
  if (genreId === 'live') return DEMO.filter((t) => t.title.includes('live'));
  const g = GENRE_ALIAS[genreId] || genreId;
  const own = DEMO.filter((t) => t.genre === g);
  const r = rng(hash(genreId)); const rest = DEMO.filter((t) => t.genre !== g).sort(() => r() - .5);
  return [...own, ...rest].slice(0, Math.max(12, own.length));
}

/* ---------- Recommandation (locale, explicable) ----------
 * Affinités apprises à partir des écoutes (pondérées par récence), des titres sauvegardés et des sauts.
 * score = 2·affinité artiste + 1,5·affinité genre + 0,4·popularité − pénalité « écouté récemment » − pénalité de sauts
 */
const Reco = {
  stats(id) { return Store.data.plays[id] || { n: 0, skips: 0, last: 0 }; },
  recordPlay(t) { const s = this.stats(t.id); s.n++; s.last = Date.now(); Store.data.plays[t.id] = s; Store.data.known[t.id] = t; Store.save(); },
  recordSkip(t) { const s = this.stats(t.id); s.skips++; Store.data.plays[t.id] = s; Store.save(); },
  profile() {
    const art = {}, gen = {}; const now = Date.now(); const add = (o, k, v) => { if (k) o[k] = (o[k] || 0) + v; };
    for (const [id, s] of Object.entries(Store.data.plays)) {
      const t = Store.data.known[id]; if (!t) continue;
      const decay = Math.exp(-(now - s.last) / (14 * 864e5)); const w = (s.n - 1.5 * s.skips) * (0.5 + decay);
      add(art, t.artist, w); add(gen, t.genre, w);
    }
    Store.data.library.forEach((t) => { add(art, t.artist, 3); add(gen, t.genre, 2); });
    const norm = (o) => { const m = Math.max(1, ...Object.values(o).map(Math.abs)); for (const k in o) o[k] /= m; return o; };
    return { art: norm(art), gen: norm(gen) };
  },
  score(t, p = this.profile()) {
    const s = this.stats(t.id); const hoursAgo = s.last ? (Date.now() - s.last) / 36e5 : 1e9;
    return 2 * (p.art[t.artist] || 0) + 1.5 * (p.gen[t.genre] || 0) + 0.4 * ((t.pop ?? 50) / 100)
      - (hoursAgo < 2 ? 1.5 : hoursAgo < 24 ? .5 : 0) - 0.6 * s.skips + this.jitter(t.id);
  },
  jitter(id) { return (hash(id + new Date().toDateString()) % 100) / 1000; }, // variation quotidienne stable
  pool() { const m = new Map(); [...Object.values(Store.data.known), ...Store.data.library, ...Audius.allCached()].forEach((t) => m.set(t.id, t)); const a = [...m.values()]; return a.length ? a : DEMO.slice(); },
  rank(list, n) { const p = this.profile(); return list.map((t) => [this.score(t, p), t]).sort((a, b) => b[0] - a[0]).slice(0, n).map((x) => x[1]); },
  diversify(list, maxPerArtist = 2) { const c = {}; return list.filter((t) => (c[t.artist] = (c[t.artist] || 0) + 1) <= maxPerArtist); },
  forYou(n = 12) { const day = Date.now() - 864e5; return this.diversify(this.rank(this.pool().filter((t) => (this.stats(t.id).last || 0) < day), n * 3)).slice(0, n); },
  discovery(n = 20) { return this.diversify(this.rank(this.pool().filter((t) => !this.stats(t.id).n && !Library.has(t.id)), n * 3)).slice(0, n); },
  topGenres(k = 2) { return Object.entries(this.profile().gen).filter((x) => x[1] > 0).sort((a, b) => b[1] - a[1]).slice(0, k).map((x) => x[0]); },
  topArtists(k = 3) { return Object.entries(this.profile().art).filter((x) => x[1] > 0).sort((a, b) => b[1] - a[1]).slice(0, k).map((x) => x[0]); },
  /* Suite automatique : morceaux proches du titre en cours, jamais déjà dans la file */
  continuation(seed, exclude, n = 6) {
    const p = this.profile(); const inQ = new Set(exclude.map((t) => t.id));
    return this.diversify(this.pool().filter((t) => !inQ.has(t.id))
      .map((t) => [this.score(t, p) + (t.artist === seed?.artist ? 1.2 : 0) + (t.genre && t.genre === seed?.genre ? 1 : 0), t])
      .sort((a, b) => b[0] - a[0]).map((x) => x[1]), 2).slice(0, n);
  },
  /* Playlists automatiques (recalculées à chaque affichage) */
  smart() {
    const plays = Store.data.plays; const known = Store.data.known; const out = [];
    const top = Object.entries(plays).filter(([, s]) => s.n >= 2).sort((a, b) => b[1].n - a[1].n).map(([id]) => known[id]).filter(Boolean).slice(0, 25);
    if (top.length >= 3) out.push({ id: 'smart:top', name: 'Vos titres en boucle', desc: 'Les morceaux que vous écoutez le plus', tracks: top });
    out.push({ id: 'smart:disco', name: 'Mix découverte', desc: 'Des titres jamais écoutés, choisis selon vos goûts', tracks: this.discovery(20) });
    this.topGenres(2).forEach((g, i) => { const G = GENRES.find((x) => x.id === g); if (G) out.push({ id: 'smart:genre:' + g, name: `Mix du jour ${i + 1}`, desc: `${G.name} et plus`, tracks: this.diversify(this.rank(this.pool().filter((t) => t.genre === g), 20).concat(this.forYou(8)), 3).slice(0, 20) }); });
    if (Store.data.library.length) out.push({ id: 'smart:recent', name: 'Ajoutés récemment', desc: 'Les derniers ajouts à votre bibliothèque', tracks: Store.data.library.slice(0, 25) });
    const forgot = Store.data.library.filter((t) => !this.stats(t.id).n);
    if (forgot.length >= 3) out.push({ id: 'smart:forgot', name: 'Jamais écoutés', desc: 'Dans votre bibliothèque, pas encore joués', tracks: forgot });
    return out;
  },
};

/* ---------- Stockage ---------- */
const Store = {
  key: 'cadence.v2',
  data: { library: [], playlists: [], history: [], plays: {}, known: {}, apiKey: '', autoplay: true },
  load() { try { Object.assign(this.data, JSON.parse(localStorage.getItem(this.key)) || {}); } catch {} },
  save() { this.data.updated = Date.now(); try { localStorage.setItem(this.key, JSON.stringify(this.data)); } catch {} },
};

/* ---------- Catalogue YouTube ---------- */
const GENRE_QUERY = {
  charts: 'top hits musique', hits: 'hits du moment musique', rapfr: 'rap français', popfr: 'pop française',
  pop: 'pop music', rap: 'rap music', rnb: 'rnb soul music', dance: 'dance music', electro: 'musique électronique',
  chill: 'chill lofi music', live: 'live concert music', acoustic: 'acoustic session music', '80s': 'années 80 tubes',
  '90s': 'années 90 tubes', jazz: 'jazz music', rock: 'rock music',
};
const Catalog = {
  ytCache: {},
  thumb: (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
  parseId(text) {
    const t = text.trim();
    if (/^[\w-]{11}$/.test(t) && /[\d_-]|[A-Z].*[a-z]|[a-z].*[A-Z]/.test(t)) return t;
    try {
      const u = new URL(t);
      if (u.hostname === 'youtu.be') return u.pathname.slice(1, 12);
      if (u.hostname.endsWith('youtube.com')) return u.searchParams.get('v') || (u.pathname.match(/\/(?:shorts|embed|live)\/([\w-]{11})/) || [])[1] || null;
    } catch {}
    return null;
  },
  async fromId(id) {
    const t = { id, title: `Vidéo ${id}`, artist: 'YouTube', thumb: this.thumb(id) };
    try {
      const r = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent('https://www.youtube.com/watch?v=' + id)}`);
      if (r.ok) { const j = await r.json(); t.title = j.title; t.artist = j.author_name; }
    } catch {}
    return t;
  },
  async search(q, key, n = 25) {
    const u = new URL('https://www.googleapis.com/youtube/v3/search');
    Object.entries({ part: 'snippet', type: 'video', videoCategoryId: '10', maxResults: String(n), q, key }).forEach(([k, v]) => u.searchParams.set(k, v));
    const r = await fetch(u); if (!r.ok) throw new Error(`API YouTube : HTTP ${r.status}`);
    const d = document.createElement('textarea'); const dec = (s) => ((d.innerHTML = s), d.value);
    return (await r.json()).items.map((it) => ({ id: it.id.videoId, title: dec(it.snippet.title),
      artist: dec(it.snippet.channelTitle).replace(/ - Topic$/, ''), thumb: it.snippet.thumbnails?.high?.url || this.thumb(it.id.videoId) }));
  },
  async searchCached(q, key, n = 25) {
    if (this.ytCache[q]) return this.ytCache[q];
    const res = await this.search(q, key, n);
    this.ytCache[q] = res;
    res.forEach((t) => { Store.data.known[t.id] = t; });
    Store.save();
    return res;
  },
  searchDemo(q) {
    const n = q.toLowerCase();
    return DEMO.filter((t) => (t.title + ' ' + t.artist).toLowerCase().includes(n));
  },
};

/* ---------- Audius : streaming musical libre et gratuit (sans clé) ----------
 * API publique ; chaque piste expose une URL de flux audio directe, jouée par un vrai
 * lecteur <audio> → lecture en arrière-plan / écran verrouillé (contrairement au lecteur YouTube). */
const AUDIUS_GENRE = { rapfr: 'Hip-Hop/Rap', rap: 'Hip-Hop/Rap', popfr: 'Pop', pop: 'Pop', rnb: 'R&B/Soul',
  dance: 'House', electro: 'Electronic', chill: 'Lo-Fi', jazz: 'Jazz', rock: 'Rock', acoustic: 'Acoustic' };
const GENRE_TEXT = { live: 'live', '80s': '80s', '90s': '90s', charts: '', hits: '' };
const Audius = {
  app: 'Cadence',
  fallback: ['https://discoveryprovider.audius.co', 'https://discoveryprovider2.audius.co', 'https://discoveryprovider3.audius.co'],
  host: null, _hostP: null, searchCache: {}, genreCache: {}, trendCache: null,
  async pickHost() {
    if (this.host) return this.host;
    if (!this._hostP) this._hostP = (async () => {
      try { const r = await fetch('https://api.audius.co'); const j = await r.json(); if (j.data && j.data.length) return j.data[Math.floor(Math.random() * Math.min(5, j.data.length))]; } catch {}
      return this.fallback[0];
    })();
    this.host = await this._hostP; return this.host;
  },
  async get(path) {
    const h = await this.pickHost(); const sep = path.includes('?') ? '&' : '?';
    const r = await fetch(`${h}${path}${sep}app_name=${this.app}`);
    if (!r.ok) throw new Error('Audius HTTP ' + r.status);
    return (await r.json()).data || [];
  },
  toTrack(t) {
    return { id: 'au:' + t.id, src: `${this.host}/v1/tracks/${t.id}/stream?app_name=${this.app}`,
      title: t.title || 'Sans titre', artist: (t.user && (t.user.name || t.user.handle)) || 'Audius',
      dur: t.duration || 0, thumb: (t.artwork && (t.artwork['480x480'] || t.artwork['150x150'])) || '',
      genre: (t.genre || '').toLowerCase(), pop: t.play_count || 0, audius: true };
  },
  register(list) { list.forEach((t) => { Store.data.known[t.id] = t; }); Store.save(); return list; },
  async search(q, n = 25) {
    if (this.searchCache[q]) return this.searchCache[q];
    const list = (await this.get(`/v1/tracks/search?query=${encodeURIComponent(q)}&limit=${n}`)).map((t) => this.toTrack(t));
    this.searchCache[q] = list; return this.register(list);
  },
  async trending(genre, n = 20) {
    const list = (await this.get(genre ? `/v1/tracks/trending?genre=${encodeURIComponent(genre)}&limit=${n}` : `/v1/tracks/trending?limit=${n}`)).map((t) => this.toTrack(t));
    if (!genre) this.trendCache = list; return this.register(list);
  },
  async forGenre(gid) {
    if (this.genreCache[gid]) return this.genreCache[gid];
    let list;
    if (AUDIUS_GENRE[gid]) list = await this.trending(AUDIUS_GENRE[gid], 25);
    else if (GENRE_TEXT[gid]) list = await this.search(GENRE_TEXT[gid], 25);
    else list = await this.trending(null, 25);
    this.genreCache[gid] = list; return list;
  },
  allCached() { return [...(this.trendCache || []), ...Object.values(this.genreCache).flat(), ...Object.values(this.searchCache).flat()]; },
};

/* ---------- Moteurs de lecture ---------- */
/* YouTube IFrame (morceaux réels) */
const YTEngine = {
  yt: null, ready: false, pending: null, onState: null,
  init() {
    window.onYouTubeIframeAPIReady = () => {
      this.yt = new YT.Player('yt-frame', { width: 200, height: 200, playerVars: { playsinline: 1, rel: 0, controls: 0 },
        events: { onReady: () => { this.ready = true; if (this.pending) this.load(this.pending); this.pending = null; },
          onStateChange: (e) => this.onState?.({ 1: 'playing', 2: 'paused', 0: 'ended' }[e.data]), onError: () => this.onState?.('ended') } });
    };
    const s = document.createElement('script'); s.src = 'https://www.youtube.com/iframe_api'; s.onerror = () => {};
    document.head.appendChild(s);
  },
  load(id) { if (!this.ready) { this.pending = id; return; } this.yt.loadVideoById(id); },
  play() { this.ready && this.yt.playVideo(); }, pause() { this.ready && this.yt.pauseVideo(); },
  stop() { this.ready && this.yt.stopVideo(); this.pending = null; },
  time() { return this.ready ? this.yt.getCurrentTime() : 0; }, duration() { return this.ready ? this.yt.getDuration() : 0; },
  seek(s) { this.ready && this.yt.seekTo(s, true); }, volume(v) { this.ready && this.yt.setVolume(v); },
};
/* Lecture simulée (morceaux démo, sans réseau) */
const SimEngine = {
  t: 0, d: 0, playing: false, last: 0, onState: null,
  load(d) { this.t = 0; this.d = d; this.play(); },
  play() { this.playing = true; this.last = performance.now(); this.onState?.('playing'); },
  pause() { this.tick(); this.playing = false; this.onState?.('paused'); },
  stop() { this.playing = false; },
  tick() { const n = performance.now(); if (this.playing) this.t += (n - this.last) / 1000; this.last = n;
    if (this.playing && this.t >= this.d) { this.playing = false; this.t = this.d; this.onState?.('ended'); } },
  time() { this.tick(); return this.t; }, duration() { return this.d; }, seek(s) { this.t = s; }, volume() {},
};
/* Lecteur audio natif (Audius) : <audio> HTML5 → arrière-plan & écran verrouillé */
const AudioEngine = {
  el: null, onState: null,
  init() {
    this.el = new Audio(); this.el.preload = 'auto';
    this.el.addEventListener('playing', () => this.onState && this.onState('playing'));
    this.el.addEventListener('pause', () => this.onState && this.onState('paused'));
    this.el.addEventListener('ended', () => this.onState && this.onState('ended'));
    this.el.addEventListener('error', () => this.onState && this.onState('ended'));
  },
  load(src) { this.el.src = src; const p = this.el.play(); if (p && p.catch) p.catch(() => {}); },
  play() { const p = this.el.play(); if (p && p.catch) p.catch(() => {}); },
  pause() { this.el.pause(); },
  stop() { this.el.pause(); this.el.removeAttribute('src'); try { this.el.load(); } catch {} },
  time() { return this.el.currentTime || 0; },
  duration() { return this.el.duration && isFinite(this.el.duration) ? this.el.duration : 0; },
  seek(s) { try { this.el.currentTime = s; } catch {} },
  volume(v) { this.el.volume = Math.max(0, Math.min(1, v / 100)); },
};

/* ---------- Lecteur ---------- */
const Player = {
  queue: [], index: -1, shuffle: false, repeat: 'off', playing: false, engine: null,
  current() { return this.queue[this.index]; },
  init() {
    const onState = (s) => {
      if (s === 'playing') this.playing = true;
      if (s === 'paused') this.playing = false;
      if (s === 'ended') return this.next(true);
      UI.syncPlayer();
    };
    AudioEngine.onState = onState; SimEngine.onState = onState; YTEngine.onState = onState; AudioEngine.init();
    setInterval(() => UI.syncTime(), 250);
  },
  playList(list, start = 0, shuffled = false) {
    if (!list.length) return;
    let q = list.slice(); if (shuffled) { q = shuffleArr(q); start = 0; }
    this.shuffle = shuffled; this.queue = q; this.index = start; this.autoFrom = null; this.load();
  },
  playNext(t) { if (this.index < 0) return this.playList([t]); this.queue.splice(this.index + 1, 0, t); UI.toast('Lecture ensuite'); UI.syncPlayer(); },
  playLast(t) { if (this.index < 0) return this.playList([t]); this.queue.push(t); UI.toast('Ajouté à la file'); UI.syncPlayer(); },
  load() {
    const t = this.current(); if (!t) return;
    this.engine?.stop();
    this.engine = t.audius ? AudioEngine : t.demo ? SimEngine : YTEngine;
    t.audius ? AudioEngine.load(t.src) : t.demo ? SimEngine.load(t.dur) : YTEngine.load(t.id);
    this.playing = true;
    const h = Store.data.history; Store.data.history = [t, ...h.filter((x) => x.id !== t.id)].slice(0, 20); Reco.recordPlay(t);
    Media.update(t); UI.syncPlayer(); UI.renderActive();
  },
  toggle() { if (!this.current()) return; const play = !this.playing; play ? this.engine.play() : this.engine.pause(); this.playing = play; UI.syncPlayer(); },
  next(auto = false) {
    if (!this.queue.length) return;
    if (auto && this.repeat === 'one') { this.engine.seek(0); this.engine.play(); return; }
    const cur = this.current(), d = this.engine?.duration() || cur?.dur || 0;
    if (!auto && cur && d && this.engine.time() / d < .3) Reco.recordSkip(cur);
    let i = this.index + 1;
    if (i >= this.queue.length && this.repeat === 'off' && Store.data.autoplay) { this.queue.push(...Reco.continuation(cur, this.queue)); this.autoFrom ??= i; }
    if (i >= this.queue.length) { if (this.repeat !== 'all') { this.playing = false; this.engine.pause(); this.engine.seek(0); UI.syncPlayer(); return; } i = 0; }
    this.index = i; this.load();
  },
  prev() { if (this.engine && this.engine.time() > 3) return this.engine.seek(0); if (this.index > 0) { this.index--; this.load(); } },
  stop() { this.engine?.stop(); this.queue = []; this.index = -1; this.playing = false; UI.syncPlayer(); UI.renderActive(); },
  toggleShuffle() {
    this.shuffle = !this.shuffle; const cur = this.current();
    if (this.shuffle && cur) { const rest = this.queue.filter((_, i) => i !== this.index); this.queue = [cur, ...shuffleArr(rest)]; this.index = 0; }
    UI.syncPlayer();
  },
  cycleRepeat() { this.repeat = { off: 'all', all: 'one', one: 'off' }[this.repeat]; UI.syncPlayer(); },
};
function shuffleArr(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

/* Contrôles système (écran verrouillé, casque) */
const Media = {
  init() {
    if (!('mediaSession' in navigator)) return;
    const m = navigator.mediaSession;
    m.setActionHandler('play', () => Player.toggle()); m.setActionHandler('pause', () => Player.toggle());
    m.setActionHandler('nexttrack', () => Player.next()); m.setActionHandler('previoustrack', () => Player.prev());
  },
  update(t) {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({ title: t.title, artist: t.artist, artwork: [{ src: t.thumb || genArt(t.album || t.id), sizes: '512x512' }] });
  },
};

/* ---------- Bibliothèque ---------- */
const Library = {
  has: (id) => Store.data.library.some((t) => t.id === id),
  toggle(t) {
    const l = Store.data.library; const i = l.findIndex((x) => x.id === t.id);
    if (i >= 0) { l.splice(i, 1); UI.toast('Retiré de la bibliothèque'); } else { l.unshift(t); UI.toast('Ajouté à la bibliothèque'); }
    Store.save(); UI.rerender();
  },
  createPlaylist(name, first) {
    const pl = { id: crypto.randomUUID(), name, tracks: first ? [first] : [], created: Date.now() };
    Store.data.playlists.unshift(pl); Store.save(); return pl;
  },
  addTo(pl, t) { if (!pl.tracks.some((x) => x.id === t.id)) pl.tracks.push(t); Store.save(); UI.toast(`Ajouté à « ${pl.name} »`); },
  artists() {
    const m = new Map(); Store.data.library.forEach((t) => m.set(t.artist, [...(m.get(t.artist) || []), t]));
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  },
};

/* ---------- Interface ---------- */
const UI = {
  view: 'home', stack: [], query: '', scope: 'catalog', results: [], searching: false,

  /* -- composants -- */
  largeHead(title, avatar = true) {
    return `<div class="large-head"><h1 class="large-title">${esc(title)}</h1>${avatar ? '<button class="avatar" data-act="settings" aria-label="Compte">RM</button>' : ''}</div>`;
  },
  row(t, i, opts = {}) {
    const lead = opts.num ? `<span class="num">${i + 1}</span>` : `<div class="art">${artImg(t)}</div>`;
    return `<div class="row${Player.current()?.id === t.id ? ' playing' : ''}" data-i="${i}" data-id="${esc(t.id)}" role="button">${lead}
      <div class="rt"><div class="rtx"><div class="r1">${esc(t.title)}</div><div class="r2">${opts.sub ?? 'Morceau · ' + esc(t.artist)}</div></div>
      <button class="more" data-more="${i}" aria-label="Options">${icon('more')}</button></div></div>`;
  },
  list(tracks, opts) { return `<div class="list" data-list>${tracks.map((t, i) => this.row(t, i, opts)).join('')}</div>`; },
  card(t, i) {
    return `<button class="card" data-card="${i}"><div class="art">${artImg(t)}</div><div class="c1">${esc(t.title)}</div><div class="c2">${esc(t.artist)}</div></button>`;
  },
  plCard(pl) {
    const cover = pl.id.startsWith('smart:') ? `<img src="${genArt(pl.id, pl.name)}" alt="">` : artImg(pl.tracks[0] || { id: pl.id, demo: true }, pl.tracks[0] ? null : pl.id);
    return `<button class="card" data-pl="${pl.id}"><div class="art">${cover}</div><div class="c1">${esc(pl.name)}</div><div class="c2">${pl.tracks.length} morceau${pl.tracks.length > 1 ? 'x' : ''}</div></button>`;
  },
  tileDeco(g) {
    const glyph = GLYPHS[g.id] || GLYPHS.pop;
    return `<svg class="deco" viewBox="0 0 200 112" preserveAspectRatio="xMidYMid slice">
      <defs><linearGradient id="tg-${g.id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${g.c}"/><stop offset="1" stop-color="${g.c2 || g.c}"/></linearGradient></defs>
      <rect width="200" height="112" fill="url(#tg-${g.id})"/>
      <g transform="translate(122 -10) rotate(-14 48 60) scale(3.9)" fill="none" stroke="#000" stroke-opacity=".18" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(.6 .9)">${glyph}</g></g>
      <g transform="translate(122 -10) rotate(-14 48 60) scale(3.9)" fill="none" stroke="#fff" stroke-opacity=".92" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${glyph}</g></svg>`;
  },

  /* -- vues -- */
  renderHome() {
    const h = Store.data.history, pls = Store.data.playlists, smart = Reco.smart();
    const picks = Reco.forYou(6), fresh = Reco.discovery(10);
    const tops = Reco.topArtists(3);
    this.ctx.home = { history: h, picks, mix: fresh, smart };
    const hasHist = Object.keys(Store.data.plays).length > 0 || Store.data.library.length > 0;
    const trend = Audius.trendCache || [];
    if (!trend.length) Audius.trending(null, 20).then(() => { if (this.view === 'home' && !this.stack.length) this.renderHome(); }).catch(() => {});
    const hero = hasHist && picks.length ? picks : trend;
    this.ctx.home.picks = hero; this.ctx.home.trend = trend;
    const why = tops.length ? `Parce que vous écoutez ${esc(tops.slice(0, 2).join(' et '))}` : 'Les tendances du moment — vos recommandations arrivent dès que vous écoutez';
    $('#view-home').innerHTML = this.largeHead('Accueil') +
      `<div class="section-h">${hasHist && picks.length ? 'Sélection pour vous' : 'Tendances'}</div><p class="why">${why}</p>
       <div class="shelf wide">${hero.slice(0, 4).map((t, i) => `<button class="hero" data-hero="${i}"><div class="art">${artImg(t)}</div><div class="hero-txt"><small>${hasHist && picks.length ? 'Recommandé' : 'Tendance'}</small><b>${esc(t.title)}</b><span class="hero-sub">${esc(t.artist)}</span></div></button>`).join('') || '<div class="yt-loading">Chargement des tendances…</div>'}</div>` +
      `<button class="section-h" data-open="smart">Créés pour vous ${icon('chevR')}</button><div class="shelf">${smart.map((p) => this.plCard(p)).join('')}</div>` +
      (h.length ? `<button class="section-h" data-open="history">Écoutés récemment ${icon('chevR')}</button><div class="shelf" data-shelf="history">${h.map((t, i) => this.card(t, i)).join('')}</div>` : '') +
      (pls.length ? `<button class="section-h" data-nav="playlists">Vos playlists ${icon('chevR')}</button><div class="shelf">${pls.map((p) => this.plCard(p)).join('')}</div>` : '') +
      (trend.length ? `<div class="section-h">Tendances Audius</div><div class="shelf" data-shelf="trend">${trend.slice(0, 12).map((t, i) => this.card(t, i)).join('')}</div>` : '') +
      `<button class="section-h" data-open="discovery">À découvrir ${icon('chevR')}</button><div class="shelf" data-shelf="mix">${fresh.map((t, i) => this.card(t, i)).join('')}</div>` +
      `<p style="text-align:center"><span class="demo-pill">Musique libre via Audius</span></p>`;
  },
  renderNew() {
    const a = demoFor('new-a'), b = demoFor('new-b');
    this.ctx.new = { a, b };
    $('#view-new').innerHTML = this.largeHead('Nouveautés') +
      `<div class="shelf wide">${a.slice(0, 3).map((t, i) => `<button class="hero" data-hero-new="${i}"><div class="art">${artImg(t)}</div><div class="hero-txt"><small>Nouvelle sortie</small><b>${esc(t.title)}</b><span class="hero-sub">${esc(t.artist)}</span></div></button>`).join('')}</div>
       <div class="section-h">Derniers morceaux ${icon('chevR')}</div>${this.list(b.slice(0, 6))}
       <div class="section-h">À découvrir ${icon('chevR')}</div><div class="shelf" data-shelf="new">${a.map((t, i) => this.card(t, i)).join('')}</div>`;
  },
  renderLibrary() {
    const lib = Store.data.library;
    const nav = [['playlists', 'playlists', 'Playlists'], ['artists', 'person', 'Artistes'], ['albums', 'album', 'Albums'], ['songs', 'song', 'Morceaux']];
    $('#view-library').innerHTML = this.largeHead('Bibliothèque') +
      `<div class="list nav-list">${nav.map(([k, ic, l]) => `<div class="row" data-nav="${k}" role="button"><span class="ico">${icon(ic)}</span><div class="rt"><div class="rtx">${l}</div><span class="chev">${icon('chevR')}</span></div></div>`).join('')}</div>` +
      (lib.length ? `<div class="section-h">Ajouts récents</div><div class="grid2" data-shelf="lib">${lib.slice(0, 12).map((t, i) => this.card(t, i)).join('')}</div>`
        : `<div class="empty"><b>Ajoutez de la musique</b>Touchez ··· sur un morceau puis « Ajouter à la bibliothèque ».</div>`);
  },
  renderSearch() {
    const v = $('#view-search');
    if (!v.dataset.built) {
      v.dataset.built = '1';
      v.innerHTML = this.largeHead('Rechercher') +
        `<form class="searchbar" id="search-form">${icon('search')}<input id="q" type="search" placeholder="Artistes, morceaux, liens…" enterkeyhint="search" autocomplete="off"><button type="button" class="mic" id="mic" aria-label="Dictée">${icon('mic')}</button></form>
         <div id="search-body"></div>`;
      const q = $('#q', v);
      q.oninput = () => { this.query = q.value; clearTimeout(this._deb); this._deb = setTimeout(() => this.runSearch(), 250); };
      $('#search-form', v).onsubmit = (e) => { e.preventDefault(); this.runSearch(true); q.blur(); };
      $('#mic', v).onclick = () => this.dictate();
    }
    const body = $('#search-body', v);
    if (!this.query.trim()) {
      body.innerHTML = `<div class="tiles">${GENRES.map((g) => `<button class="tile" data-genre="${g.id}">${this.tileDeco(g)}<span>${esc(g.name)}</span></button>`).join('')}</div>`;
      return;
    }
    const seg = `<div class="segmented"><button data-scope="catalog" class="${this.scope === 'catalog' ? 'on' : ''}">Catalogue</button><button data-scope="library" class="${this.scope === 'library' ? 'on' : ''}">Bibliothèque</button></div>`;
    const list = this.scope === 'library'
      ? Store.data.library.filter((t) => (t.title + t.artist).toLowerCase().includes(this.query.toLowerCase()))
      : this.results;
    this.ctx.search = list;
    body.innerHTML = seg + (this.searching ? '<div class="empty">Recherche…</div>' : list.length ? this.list(list) : `<div class="empty"><b>Aucun résultat</b>${this.searchHint || 'Essayez un autre terme.'}</div>`);
  },
  async runSearch() {
    const q = this.query.trim(); this.searchHint = '';
    if (!q) return this.renderSearch();
    this.searching = true; this.renderSearch();
    try { this.results = await Audius.search(q); if (!this.results.length) this.searchHint = 'Aucun morceau trouvé.'; }
    catch (e) { this.results = Catalog.searchDemo(q); this.searchHint = 'Hors ligne — catalogue de démonstration.'; }
    this.searching = false; if (q === this.query.trim()) this.renderSearch();
  },
  dictate() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return this.toast('Dictée indisponible sur ce navigateur');
    const r = new SR(); r.lang = 'fr-FR'; const mic = $('#mic'); mic.classList.add('listening');
    r.onresult = (e) => { this.query = $('#q').value = e.results[0][0].transcript; this.runSearch(); };
    r.onend = () => mic.classList.remove('listening'); r.start();
  },

  /* -- vue empilée (détail) -- */
  push(d) { this.stack.push(d); this.renderDetail(); this.show('detail'); $('#scroller').scrollTop = 0; },
  pop() { this.stack.pop(); if (this.stack.length) this.renderDetail(); this.show(this.stack.length ? 'detail' : this.view); },
  renderDetail() {
    const d = this.stack.at(-1); if (!d) return; const v = $('#view-detail');
    const back = `<button class="back" data-act="back">${icon('chevL')}${esc(this.backLabel())}</button>`;
    let html = back, list = [];
    if (d.type === 'genre') {
      const g = GENRES.find((x) => x.id === d.id);
      list = Audius.genreCache[g.id] || [];
      if (!list.length) Audius.forGenre(g.id).then(() => { const top = this.stack.at(-1); if (top && top.type === 'genre' && top.id === d.id) this.renderDetail(); }).catch((e) => { this._auErr = e.message; const top = this.stack.at(-1); if (top && top.type === 'genre' && top.id === d.id) this.renderDetail(); });
      html += this.largeHead(g.name, false);
      if (!list.length) html += this._auErr ? `<div class="empty"><b>Hors ligne</b>Impossible de joindre Audius.</div>` : `<div class="yt-loading">Chargement…</div>`;
      else html += `<div class="shelf wide">${list.slice(0, 3).map((t, i) => `<button class="hero" data-play-ctx="${i}"><div class="art">${artImg(t)}</div><div class="hero-txt"><small>${esc(g.name)}</small><b>${esc(t.title)}</b><span class="hero-sub">${esc(t.artist)}</span></div></button>`).join('')}</div><div class="section-h">Populaires</div>` + this.list(list);
    } else if (d.type === 'playlist') {
      const smart = d.id.startsWith('smart:');
      const pl = smart ? Reco.smart().find((p) => p.id === d.id) : Store.data.playlists.find((p) => p.id === d.id); if (!pl) return this.pop();
      list = pl.tracks;
      html += `<div class="pl-head"><div class="art">${smart ? `<img src="${genArt(pl.id, pl.name)}" alt="">` : artImg(pl.tracks[0] || { id: pl.id, demo: true }, pl.tracks[0] ? null : pl.id)}</div><h1>${esc(pl.name)}</h1><div class="sub">${smart ? 'Cadence · mise à jour automatique' : 'Ma playlist'}</div>${smart ? `<p class="pl-desc">${esc(pl.desc)}</p>` : ''}<div class="sub2">${list.length} morceau${list.length > 1 ? 'x' : ''} · ${fmt(list.reduce((s, t) => s + (t.dur || 0), 0))}</div></div>
        <div class="pl-btns"><button data-act="pl-play">${icon('play')}Lecture</button><button data-act="pl-shuffle">${icon('shuffle')}Aléatoire</button></div>` +
        (list.length ? this.list(list) : '<div class="empty">Cette playlist est vide.</div>');
    } else if (d.type === 'tracks') {
      list = d.id === 'history' ? Store.data.history : Reco.discovery(30);
      html += this.largeHead(d.id === 'history' ? 'Écoutés récemment' : 'À découvrir', false) + `<div class="pl-btns"><button data-act="ctx-play">${icon('play')}Lecture</button><button data-act="ctx-shuffle">${icon('shuffle')}Aléatoire</button></div>` + this.list(list);
    } else if (d.type === 'smartlist') {
      html += this.largeHead('Créés pour vous', false) + `<div class="grid2">${Reco.smart().map((p) => this.plCard(p)).join('')}</div>`;
    } else if (d.type === 'playlists') {
      html += this.largeHead('Playlists', false) + `<div class="list"><div class="row new-pl" data-act="new-pl" role="button"><div class="art">${icon('plus')}</div><div class="rt"><div class="rtx r1">Nouvelle playlist…</div></div></div>${[...Reco.smart(), ...Store.data.playlists].map((p) => `<div class="row" data-pl="${p.id}" role="button"><div class="art">${p.id.startsWith('smart:') ? `<img src="${genArt(p.id, p.name)}" alt="">` : artImg(p.tracks[0] || { id: p.id, demo: true }, p.tracks[0] ? null : p.id)}</div><div class="rt"><div class="rtx"><div class="r1">${esc(p.name)}</div><div class="r2">${p.tracks.length} morceau${p.tracks.length > 1 ? 'x' : ''}</div></div><span class="chev" style="width:18px;color:var(--label3)">${icon('chevR')}</span></div></div>`).join('')}</div>`;
    } else if (d.type === 'songs') {
      list = Store.data.library;
      html += this.largeHead('Morceaux', false) + (list.length ? `<div class="pl-btns"><button data-act="ctx-play">${icon('play')}Lecture</button><button data-act="ctx-shuffle">${icon('shuffle')}Aléatoire</button></div>` + this.list(list) : '<div class="empty">Aucun morceau.</div>');
    } else if (d.type === 'artists') {
      const arts = Library.artists();
      html += this.largeHead('Artistes', false) + `<div class="list">${arts.map(([a, ts]) => `<div class="row" data-artist="${esc(a)}" role="button"><div class="art" style="border-radius:50%">${artImg(ts[0])}</div><div class="rt"><div class="rtx r1">${esc(a)}</div><span class="chev" style="width:18px;color:var(--label3)">${icon('chevR')}</span></div></div>`).join('') || '<div class="empty">Aucun artiste.</div>'}</div>`;
    } else if (d.type === 'artist') {
      list = Store.data.library.filter((t) => t.artist === d.id);
      html += this.largeHead(d.id, false) + this.list(list);
    } else if (d.type === 'albums') {
      const m = new Map(); Store.data.library.forEach((t) => { const k = t.album || t.title; if (!m.has(k)) m.set(k, t); });
      list = [...m.values()];
      html += this.largeHead('Albums', false) + (list.length ? `<div class="grid2" data-shelf="ctx">${list.map((t, i) => `<button class="card" data-card="${i}"><div class="art">${artImg(t)}</div><div class="c1">${esc(t.album || t.title)}</div><div class="c2">${esc(t.artist)}</div></button>`).join('')}</div>` : '<div class="empty">Aucun album.</div>');
    }
    this.ctx.detail = list; v.innerHTML = html;
  },
  backLabel() { const p = this.stack.at(-2); return p ? ({ playlists: 'Playlists', artists: 'Artistes' }[p.type] || 'Retour') : $(`#view-${this.view}`).dataset.title; },

  /* -- navigation -- */
  ctx: {},
  show(name) {
    $$('.view').forEach((v) => v.classList.toggle('active', v.id === `view-${name}`));
  },
  go(view) {
    if (this.view === view && !this.stack.length) { $('#scroller').scrollTo({ top: 0, behavior: 'smooth' }); this.renderView(view); this.show(view); if (view === 'search') { this.query = ''; const q = $('#q'); if (q) { q.value = ''; q.focus(); } this.renderSearch(); } return; }
    this.view = view; this.stack = []; this.renderView(view); this.show(view); $('#scroller').scrollTop = 0; this.renderTabs(); this.compact(false);
  },
  renderView(v) { ({ home: () => this.renderHome(), new: () => this.renderNew(), library: () => this.renderLibrary(), search: () => this.renderSearch() })[v](); },
  rerender() { this.renderView(this.view); if (this.stack.length) this.renderDetail(); if ($('#np').classList.contains('open')) this.syncPlayer(); },
  renderActive() { $$('.row[data-id]').forEach((r) => r.classList.toggle('playing', r.dataset.id === Player.current()?.id)); },
  renderTabs() {
    const tabs = [['home', 'home', 'Accueil'], ['new', 'grid', 'Nouveautés'], ['library', 'library', 'Bibliothèque']];
    $('#tabs').innerHTML = tabs.map(([k, ic, l]) => `<button class="tab${this.view === k ? ' on' : ''}" data-view="${k}">${icon(ic)}<span>${l}</span></button>`).join('');
    const s = $('#tab-search'); s.innerHTML = icon('search'); s.classList.toggle('on', this.view === 'search');
    $('#dock').classList.toggle('search-on', this.view === 'search');
  },
  compact(on) { $('#dock').classList.toggle('compact', on); },

  /* -- lecteur -- */
  syncPlayer() {
    const t = Player.current(), mini = $('#mini');
    mini.classList.toggle('has-track', !!t);
    $('.mini-art', mini).innerHTML = t ? artImg(t) : icon('note');
    $('.mini-title', mini).textContent = t ? t.title : "À l'arrêt";
    $('[data-act=toggle]', mini).innerHTML = icon(Player.playing ? 'pause' : 'play');
    $('[data-act=next]', mini).innerHTML = icon('next');
    const np = $('#np');
    np.classList.toggle('paused', !Player.playing);
    $('#np-play').innerHTML = icon(Player.playing ? 'pause' : 'play');
    $('#np-prev').innerHTML = icon('prev'); $('#np-next').innerHTML = icon('next');
    $('#np-shuffle').innerHTML = icon('shuffle'); $('#np-shuffle').classList.toggle('on', Player.shuffle);
    $('#np-repeat').innerHTML = icon(Player.repeat === 'one' ? 'repeat1' : 'repeat'); $('#np-repeat').classList.toggle('on', Player.repeat !== 'off');
    $('#np-list').innerHTML = icon('queue'); $('#np-output').innerHTML = icon('output');
    $('#np-more').innerHTML = icon('more');
    $('.vol-ico.lo').innerHTML = icon('volLo'); $('.vol-ico.hi').innerHTML = icon('volHi');
    if (t) {
      $('#np-title').textContent = t.title; $('#np-artist').textContent = t.artist;
      const liked = Library.has(t.id); $('#np-like').innerHTML = icon(liked ? 'heartFill' : 'heart'); $('#np-like').classList.toggle('on', liked);
      if (this._npId !== t.id) {
        this._npId = t.id;
        const [c1, c2, c3] = palette(t.album || t.id);
        np.style.setProperty('--np-c1', c3); np.style.setProperty('--np-c2', c1); np.style.setProperty('--np-c3', c2);
        $('#np-art').innerHTML = artImg(t);
      }
      if (!$('#np-queue').hidden) this.renderQueue();
    }
    this.placeVideo();
  },
  syncTime() {
    const e = Player.engine; if (!e || !Player.current()) return;
    const d = e.duration() || Player.current().dur || 0, c = e.time();
    if (!this.seeking) { const s = $('#seek'); s.value = d ? (c / d) * 1000 : 0; s.style.setProperty('--p', `${s.value / 10}%`); }
    $('#t-cur').textContent = fmt(c); $('#t-rem').textContent = '-' + fmt(d - c);
    if ('mediaSession' in navigator && d && navigator.mediaSession.setPositionState) { try { navigator.mediaSession.setPositionState({ duration: d, position: Math.min(c, d) }); } catch {} }
  },
  /* Le lecteur YouTube reste visible : dans « À l'écoute », sinon en vignette flottante 200×200 */
  placeVideo() {
    const fv = $('#float-video'); if (fv) fv.hidden = true;
    const host = $('#yt-host'); if (host) { host.className = ''; document.body.appendChild(host); }
  },
  openNP() { if (!Player.current()) return; $('#np').classList.add('open'); $('#np').setAttribute('aria-hidden', 'false'); this.syncPlayer(); },
  closeNP() { $('#np').classList.remove('open'); $('#np').setAttribute('aria-hidden', 'true'); this.placeVideo(); },
  toggleQueue() {
    const q = $('#np-queue'), st = $('#np-stage'); const show = q.hidden;
    q.hidden = !show; st.hidden = show; $('#np').classList.toggle('queue-mode', show); $('#np-list').classList.toggle('on', show);
    if (show) this.renderQueue(); this.placeVideo();
  },
  renderQueue() {
    const up = Player.queue.slice(Player.index + 1);
    const t = Player.current();
    $('#np-queue').innerHTML = `<div class="q-head"><div class="art">${artImg(t)}</div><div class="rtx"><div class="np-title">${esc(t.title)}</div><div class="q-artist">${esc(t.artist)}</div></div></div><div class="q-bar"><div><h3>À suivre</h3><p>${Player.shuffle ? 'Lecture aléatoire' : 'Depuis votre sélection'}</p></div><button class="q-auto${Store.data.autoplay ? ' on' : ''}" data-act="autoplay" aria-pressed="${Store.data.autoplay}">∞ Lecture auto</button></div>` +
      (up.length ? `<div class="list" style="margin:0">${up.map((t, i) => this.row(t, i, Player.autoFrom != null && Player.index + 1 + i >= Player.autoFrom ? { sub: 'Lecture auto · ' + esc(t.artist) } : {})).join('')}</div>` : `<p>${Store.data.autoplay ? 'Des titres similaires seront ajoutés automatiquement.' : 'Rien à suivre.'}</p>`);
    this.ctx.queue = up;
  },

  /* -- feuille d'actions -- */
  sheet(html, bind) {
    const s = $('#sheet'); $('.sheet-panel', s).innerHTML = html; s.hidden = false;
    s.onclick = (e) => { if (e.target === s) this.closeSheet(); };
    bind?.($('.sheet-panel', s));
  },
  closeSheet() { $('#sheet').hidden = true; },
  trackMenu(t) {
    const liked = Library.has(t.id);
    this.sheet(`<div class="sheet-head"><div class="art">${artImg(t)}</div><div><div class="r1">${esc(t.title)}</div><div class="r2">${esc(t.artist)}</div></div></div>
      <div class="menu"><button data-m="lib">${liked ? 'Retirer de la bibliothèque' : 'Ajouter à la bibliothèque'}${icon(liked ? 'trash' : 'plus')}</button><button data-m="pl">Ajouter à une playlist…${icon('listAdd')}</button></div>
      <div class="menu"><button data-m="next">Lire ensuite${icon('playNext')}</button><button data-m="last">Lire en dernier${icon('playLast')}</button></div>`
      + (this.stack.at(-1)?.type === 'playlist' && !this.stack.at(-1).id.startsWith('smart:') ? `<div class="menu"><button data-m="rm" class="danger">Supprimer de la playlist${icon('trash')}</button></div>` : ''), (p) => {
      p.onclick = (e) => {
        const m = e.target.closest('[data-m]')?.dataset.m; if (!m) return;
        if (m === 'pl') return this.playlistPicker(t);
        this.closeSheet();
        if (m === 'lib') Library.toggle(t);
        if (m === 'next') Player.playNext(t);
        if (m === 'last') Player.playLast(t);
        if (m === 'rm') { const pl = Store.data.playlists.find((x) => x.id === this.stack.at(-1).id); pl.tracks = pl.tracks.filter((x) => x.id !== t.id); Store.save(); this.renderDetail(); }
      };
    });
  },
  playlistPicker(t) {
    this.sheet(`<div class="menu-title">Ajouter à une playlist</div><div class="menu"><button data-new>Nouvelle playlist…${icon('plus')}</button>${Store.data.playlists.map((p) => `<button data-p="${p.id}">${esc(p.name)}<span class="r2">${p.tracks.length}</span></button>`).join('')}</div>`, (panel) => {
      panel.onclick = (e) => {
        const b = e.target.closest('button'); if (!b) return;
        if ('new' in b.dataset) { const n = prompt('Nom de la playlist'); if (!n) return; Library.createPlaylist(n.trim(), t); this.toast(`Playlist « ${n} » créée`); }
        else Library.addTo(Store.data.playlists.find((p) => p.id === b.dataset.p), t);
        this.closeSheet(); this.rerender();
      };
    });
  },
  updateKeyStatus() {
    const el = document.getElementById('key-status'); if (!el) return;
    const k = document.getElementById('api-key').value.trim();
    if (!k) { el.textContent = 'Aucune clé : mode démo.'; el.className = 'hint'; }
    else if (/^AIza[\w-]{30,}$/.test(k)) { el.textContent = '✓ Format de clé valide.'; el.className = 'hint ok'; }
    else { el.textContent = 'Format inhabituel (une clé commence par « AIza »).'; el.className = 'hint warn'; }
  },
  toast(msg) {
    let el = $('#toast'); if (!el) { el = document.createElement('div'); el.id = 'toast'; document.body.appendChild(el);
      Object.assign(el.style, { position: 'fixed', left: '50%', top: 'calc(env(safe-area-inset-top,0px) + 14px)', transform: 'translateX(-50%)', zIndex: 80, padding: '10px 18px', borderRadius: '20px', fontSize: '15px', fontWeight: 500, background: 'var(--glass)', backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)', boxShadow: 'var(--shadow)', transition: 'opacity .25s', pointerEvents: 'none' }); }
    el.textContent = msg; el.style.opacity = 1; clearTimeout(this._tt); this._tt = setTimeout(() => (el.style.opacity = 0), 1600);
  },

  /* -- événements -- */
  listFor(el) {
    if (el.closest('#np-queue')) return this.ctx.queue;
    const v = el.closest('.view')?.id;
    return { 'view-search': this.ctx.search, 'view-detail': this.ctx.detail, 'view-new': this.ctx.new?.b }[v] || [];
  },
  bind() {
    document.addEventListener('click', (e) => {
      const el = e.target;
      const tab = el.closest('[data-view]'); if (tab) { this.go(tab.dataset.view); if (tab.dataset.view === 'search') setTimeout(() => $('#q')?.focus({ preventScroll: true }), 50); return; }
      const more = el.closest('[data-more]'); if (more) { e.stopPropagation(); return this.trackMenu(this.listFor(more)[+more.dataset.more]); }
      const row = el.closest('.row[data-i]'); if (row) {
        const list = this.listFor(row), i = +row.dataset.i;
        if (row.closest('#np-queue')) { Player.index += i + 1; return Player.load(); }
        return Player.playList(list, i);
      }
      const card = el.closest('[data-card]'); if (card) {
        const sh = card.closest('[data-shelf]')?.dataset.shelf;
        const list = { history: Store.data.history, mix: this.ctx.home?.mix, trend: this.ctx.home?.trend, new: this.ctx.new?.a, lib: Store.data.library, ctx: this.ctx.detail }[sh] || [];
        return Player.playList(list, +card.dataset.card);
      }
      const hero = el.closest('[data-hero]'); if (hero) return Player.playList(this.ctx.home.picks, +hero.dataset.hero);
      const heroN = el.closest('[data-hero-new]'); if (heroN) return Player.playList(this.ctx.new.a, +heroN.dataset.heroNew);
      const pc = el.closest('[data-play-ctx]'); if (pc) return Player.playList(this.ctx.detail, +pc.dataset.playCtx);
      const op = el.closest('[data-open]'); if (op) return this.push(op.dataset.open === 'smart' ? { type: 'smartlist' } : { type: 'tracks', id: op.dataset.open });
      const g = el.closest('[data-genre]'); if (g) return this.push({ type: 'genre', id: g.dataset.genre });
      const pl = el.closest('[data-pl]'); if (pl) return this.push({ type: 'playlist', id: pl.dataset.pl });
      const nav = el.closest('[data-nav]'); if (nav) return this.push({ type: nav.dataset.nav });
      const ar = el.closest('[data-artist]'); if (ar) return this.push({ type: 'artist', id: ar.dataset.artist });
      const sc = el.closest('[data-scope]'); if (sc) { this.scope = sc.dataset.scope; return this.renderSearch(); }
      const act = el.closest('[data-act]')?.dataset.act;
      if (act === 'settings') return $('#settings').showModal();
      if (act === 'back') return this.pop();
      if (act === 'autoplay') { Store.data.autoplay = !Store.data.autoplay; Store.save(); this.toast(Store.data.autoplay ? 'Lecture automatique activée' : 'Lecture automatique désactivée'); return this.renderQueue(); }
      if (act === 'pl-play' || act === 'ctx-play') return Player.playList(this.ctx.detail);
      if (act === 'pl-shuffle' || act === 'ctx-shuffle') return Player.playList(this.ctx.detail, 0, true);
      if (act === 'new-pl') { const n = prompt('Nom de la playlist'); if (n) { const p = Library.createPlaylist(n.trim()); this.push({ type: 'playlist', id: p.id }); } return; }
      if (act === 'toggle') { e.stopPropagation(); return Player.toggle(); }
      if (act === 'next') { e.stopPropagation(); return Player.next(); }
      if (el.closest('#mini')) return this.openNP();
    });

    const scroller = $('#scroller'); let lastY = 0;
    scroller.addEventListener('scroll', () => {
      const y = scroller.scrollTop; if (Math.abs(y - lastY) < 6) return;
      this.compact(y > lastY && y > 80); lastY = y;
    }, { passive: true });

    $('.np-grabber').onclick = () => this.closeNP();
    let sy = null; $('#np').addEventListener('touchstart', (e) => (sy = e.touches[0].clientY), { passive: true });
    $('#np').addEventListener('touchend', (e) => { if (sy !== null && e.changedTouches[0].clientY - sy > 120 && !e.target.closest('input,.np-queue')) this.closeNP(); sy = null; });
    $('#np-play').onclick = () => Player.toggle(); $('#np-next').onclick = () => Player.next(); $('#np-prev').onclick = () => Player.prev();
    $('#np-shuffle').onclick = () => Player.toggleShuffle(); $('#np-repeat').onclick = () => Player.cycleRepeat();
    $('#np-list').onclick = () => this.toggleQueue();
    $('#np-output').onclick = () => this.toast('Sortie audio : cet appareil');
    $('#np-like').onclick = () => Player.current() && Library.toggle(Player.current());
    $('#np-more').onclick = () => Player.current() && this.trackMenu(Player.current());
    const seek = $('#seek');
    seek.oninput = () => { this.seeking = true; seek.style.setProperty('--p', `${seek.value / 10}%`); };
    seek.onchange = () => { const e = Player.engine; if (e) e.seek(((e.duration() || Player.current()?.dur || 0) * seek.value) / 1000); this.seeking = false; };
    const vol = $('#vol'); const sv = () => vol.style.setProperty('--p', vol.value + '%'); sv();
    vol.oninput = () => { sv(); YTEngine.volume(+vol.value); };
    $('.float-close').innerHTML = icon('close'); $('.float-close').onclick = () => Player.stop();
    $('#float-video').addEventListener('dblclick', () => this.openNP());


    $('#btn-export').onclick = () => {
      const blob = new Blob([JSON.stringify({ library: Store.data.library, playlists: Store.data.playlists }, null, 2)], { type: 'application/json' });
      const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'cadence-bibliotheque.json' }); a.click(); URL.revokeObjectURL(a.href);
    };
    $('#file-import').onchange = async (e) => {
      const f = e.target.files[0]; if (!f) return;
      try { const j = JSON.parse(await f.text()); if (Array.isArray(j.library)) Store.data.library = j.library; if (Array.isArray(j.playlists)) Store.data.playlists = j.playlists; Store.save(); this.rerender(); this.toast('Bibliothèque importée'); }
      catch { this.toast('Fichier invalide'); }
    };
  },
};

/* ---------- Démarrage ---------- */
Store.load();
UI.bind();
UI.renderTabs();
UI.go(new URLSearchParams(location.search).get('tab') || 'home');
UI.syncPlayer();
Media.init();
Player.init();
if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
window.Cadence = { Store, Catalog, Player, Library, UI, DEMO, Reco, Audius, AudioEngine };
