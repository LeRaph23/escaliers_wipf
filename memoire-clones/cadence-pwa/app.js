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
  volHi: '<path d="M3 9.5h3l4.5-4v13l-4.5-4H3z" fill="currentColor"/><path d="M14 9a4.2 4.2 0 0 1 0 6M16.8 6.4a8 8 0 0 1 0 11.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/>',
};
const icon = (n) => `<svg viewBox="0 0 24 24" aria-hidden="true">${P[n]}</svg>`;

/* ---------- Pochettes générées (déterministes) ---------- */
function hash(s) { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let s = seed || 1; return () => ((s = Math.imul(s ^ (s >>> 15), 2246822507) ^ Math.imul(s ^ (s >>> 13), 3266489909)) >>> 0) / 4294967296; }
function palette(seed) {
  const r = rng(hash(seed)); const h = Math.floor(r() * 360);
  return [`hsl(${h} 70% 55%)`, `hsl(${(h + 40 + r() * 80) % 360} 75% 62%)`, `hsl(${(h + 180 + r() * 40) % 360} 55% 28%)`];
}
const artCache = new Map();
function genArt(seed) {
  if (artCache.has(seed)) return artCache.get(seed);
  const r = rng(hash(seed + '#')); const [a, b, c] = palette(seed); const style = Math.floor(r() * 4);
  let shapes = '';
  if (style === 0) for (let i = 0; i < 5; i++) shapes += `<circle cx="${r() * 300}" cy="${r() * 300}" r="${40 + r() * 110}" fill="${[a, b, c][i % 3]}" opacity=".85"/>`;
  else if (style === 1) for (let i = 0; i < 9; i++) shapes += `<rect x="${i * 34}" y="${60 + r() * 160}" width="26" height="300" rx="13" fill="${i % 2 ? b : c}" opacity=".9"/>`;
  else if (style === 2) for (let i = 7; i > 0; i--) shapes += `<circle cx="150" cy="150" r="${i * 24}" fill="${[a, b, c][i % 3]}"/>`;
  else for (let i = 0; i < 6; i++) shapes += `<path d="M0 ${40 + i * 45} Q150 ${r() * 300} 300 ${40 + i * 45 + r() * 30} V300 H0Z" fill="${[a, b, c][i % 3]}" opacity=".7"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><defs><linearGradient id="g" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${c}"/></linearGradient></defs><rect width="300" height="300" fill="url(#g)"/>${shapes}</svg>`;
  const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  artCache.set(seed, url); return url;
}
/* <img> avec repli sur la pochette générée si la vignette YouTube ne charge pas */
function artImg(t, key) {
  const fb = genArt(key || t.album || t.id);
  const src = t.demo || !t.thumb ? fb : t.thumb;
  return `<img src="${esc(src)}" alt="" loading="lazy" onerror="this.onerror=null;this.src='${fb}'">`;
}

/* ---------- Catalogue de démonstration (entièrement fictif) ---------- */
const DEMO_ARTISTS = ['Nova Lune', 'Les Rives', 'Kaïs Merel', 'Orée', 'Midi Vingt', 'Sable Noir', 'Jade Okoro', 'Velours', 'Tamaris', 'Ilan Fosse', 'Poussière d\'Or', 'Mira Vale'];
const DEMO_WORDS = ['Néons', 'Marée haute', 'Dernier métro', 'Lumière froide', 'Satellite', 'Après minuit', 'Vertige', 'Cœur pixel', 'Avenue', 'Rêve lucide', 'Tempête douce', 'Écho', 'Électrique', 'Horizon', 'Sous la pluie', 'Roulette', 'Ciel ouvert', 'Ombre portée', 'Fièvre', 'Kilomètres', 'Calme plat', 'Grand bleu', 'Silhouette', 'Mirage'];
const GENRES = [
  { id: 'charts', name: 'Classements', c: '#7a7a2a' }, { id: 'hits', name: 'Hits du moment', c: '#d8b93a' },
  { id: 'rapfr', name: 'Rap francophone', c: '#6a8be8' }, { id: 'popfr', name: 'Pop française', c: '#e8678c' },
  { id: 'pop', name: 'Pop', c: '#e35a7a' }, { id: 'rap', name: 'Rap', c: '#6b8ae6' },
  { id: 'rnb', name: 'R&B', c: '#8e78dc' }, { id: 'dance', name: 'Dance', c: '#4fb46f' },
  { id: 'electro', name: 'Électronique', c: '#4aae6c' }, { id: 'chill', name: 'Chill', c: '#e9414f' },
  { id: 'live', name: 'Concerts', c: '#3a1414' }, { id: 'acoustic', name: 'Acoustique', c: '#ec7088' },
  { id: '80s', name: 'Les années 80', c: '#e0b23a' }, { id: '90s', name: 'Les années 90', c: '#dcae3c' },
  { id: 'jazz', name: 'Jazz', c: '#2f6f8f' }, { id: 'rock', name: 'Rock', c: '#555c66' },
];
const DEMO = (() => {
  const r = rng(42); const tracks = [];
  DEMO_WORDS.forEach((w, i) => {
    const artist = DEMO_ARTISTS[i % DEMO_ARTISTS.length];
    tracks.push({ id: `demo-${i}`, demo: true, title: w, artist, album: `${artist} — ${DEMO_WORDS[(i * 7) % DEMO_WORDS.length]}`,
      dur: 150 + Math.floor(r() * 110), genre: GENRES[(i * 5) % GENRES.length].id });
  });
  return tracks;
})();
const demoFor = (genreId) => { const r = rng(hash(genreId)); return DEMO.slice().sort(() => r() - .5).slice(0, 12); };

/* ---------- Stockage ---------- */
const Store = {
  key: 'cadence.v2',
  data: { library: [], playlists: [], history: [], apiKey: '' },
  load() { try { Object.assign(this.data, JSON.parse(localStorage.getItem(this.key)) || {}); } catch {} },
  save() { try { localStorage.setItem(this.key, JSON.stringify(this.data)); } catch {} },
};

/* ---------- Catalogue YouTube ---------- */
const Catalog = {
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
  async search(q, key) {
    const u = new URL('https://www.googleapis.com/youtube/v3/search');
    Object.entries({ part: 'snippet', type: 'video', videoCategoryId: '10', maxResults: '25', q, key }).forEach(([k, v]) => u.searchParams.set(k, v));
    const r = await fetch(u); if (!r.ok) throw new Error(`API YouTube : HTTP ${r.status}`);
    const d = document.createElement('textarea'); const dec = (s) => ((d.innerHTML = s), d.value);
    return (await r.json()).items.map((it) => ({ id: it.id.videoId, title: dec(it.snippet.title),
      artist: dec(it.snippet.channelTitle).replace(/ - Topic$/, ''), thumb: it.snippet.thumbnails?.high?.url || this.thumb(it.id.videoId) }));
  },
  searchDemo(q) {
    const n = q.toLowerCase();
    return DEMO.filter((t) => (t.title + ' ' + t.artist).toLowerCase().includes(n));
  },
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
    YTEngine.onState = onState; SimEngine.onState = onState; YTEngine.init();
    setInterval(() => UI.syncTime(), 250);
  },
  playList(list, start = 0, shuffled = false) {
    if (!list.length) return;
    let q = list.slice(); if (shuffled) { q = shuffleArr(q); start = 0; }
    this.shuffle = shuffled; this.queue = q; this.index = start; this.load();
  },
  playNext(t) { if (this.index < 0) return this.playList([t]); this.queue.splice(this.index + 1, 0, t); UI.toast('Lecture ensuite'); UI.syncPlayer(); },
  playLast(t) { if (this.index < 0) return this.playList([t]); this.queue.push(t); UI.toast('Ajouté à la file'); UI.syncPlayer(); },
  load() {
    const t = this.current(); if (!t) return;
    this.engine?.stop();
    this.engine = t.demo ? SimEngine : YTEngine;
    t.demo ? SimEngine.load(t.dur) : YTEngine.load(t.id);
    this.playing = true;
    const h = Store.data.history; Store.data.history = [t, ...h.filter((x) => x.id !== t.id)].slice(0, 20); Store.save();
    Media.update(t); UI.syncPlayer(); UI.renderActive();
  },
  toggle() { if (!this.current()) return; this.playing ? this.engine.pause() : this.engine.play(); this.playing = !this.playing; UI.syncPlayer(); },
  next(auto = false) {
    if (!this.queue.length) return;
    if (auto && this.repeat === 'one') { this.engine.seek(0); this.engine.play(); return; }
    let i = this.index + 1;
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
    return `<button class="card" data-pl="${pl.id}"><div class="art">${artImg(pl.tracks[0] || { id: pl.id, demo: true }, pl.tracks[0] ? null : pl.id)}</div><div class="c1">${esc(pl.name)}</div><div class="c2">${pl.tracks.length} morceau${pl.tracks.length > 1 ? 'x' : ''}</div></button>`;
  },
  tileDeco(g) {
    const r = rng(hash(g.id)); let s = '';
    for (let i = 0; i < 4; i++) s += `<circle cx="${110 + r() * 90}" cy="${r() * 110}" r="${18 + r() * 46}" fill="#fff" opacity="${(.06 + r() * .12).toFixed(2)}"/>`;
    s += `<path d="M${120 + r() * 40} 112 C ${140 + r() * 30} ${30 + r() * 30}, ${170 + r() * 20} ${20 + r() * 40}, 200 ${10 + r() * 30} V112Z" fill="#000" opacity=".14"/>`;
    return `<svg class="deco" viewBox="0 0 200 112" preserveAspectRatio="xMidYMid slice"><rect width="200" height="112" fill="${g.c}"/>${s}</svg>`;
  },

  /* -- vues -- */
  renderHome() {
    const h = Store.data.history, pls = Store.data.playlists;
    const picks = demoFor('picks').slice(0, 6), mix = demoFor('mix').slice(0, 8);
    this.ctx.home = { history: h, picks, mix };
    $('#view-home').innerHTML = this.largeHead('Accueil') +
      `<div class="section-h">Sélection pour vous</div>
       <div class="shelf wide">${picks.slice(0, 3).map((t, i) => `<button class="hero" data-hero="${i}"><div class="art">${artImg(t)}</div><div class="hero-txt"><small>Mix · ${esc(t.artist)}</small><b>${esc(t.title)}</b></div></button>`).join('')}</div>` +
      (h.length ? `<div class="section-h">Écoutés récemment ${icon('chevR')}</div><div class="shelf" data-shelf="history">${h.map((t, i) => this.card(t, i)).join('')}</div>` : '') +
      (pls.length ? `<div class="section-h">Vos playlists ${icon('chevR')}</div><div class="shelf">${pls.map((p) => this.plCard(p)).join('')}</div>` : '') +
      `<div class="section-h">Nouveautés pour vous ${icon('chevR')}</div><div class="shelf" data-shelf="mix">${mix.map((t, i) => this.card(t, i)).join('')}</div>` +
      `<p style="text-align:center"><span class="demo-pill">Contenus de démonstration fictifs</span></p>`;
  },
  renderNew() {
    const a = demoFor('new-a'), b = demoFor('new-b');
    this.ctx.new = { a, b };
    $('#view-new').innerHTML = this.largeHead('Nouveautés') +
      `<div class="shelf wide">${a.slice(0, 3).map((t, i) => `<button class="hero" data-hero-new="${i}"><div class="art">${artImg(t)}</div><div class="hero-txt"><small>Nouvelle sortie</small><b>${esc(t.title)}</b></div></button>`).join('')}</div>
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
    const id = Catalog.parseId(q);
    try {
      if (id) { this.searching = true; this.renderSearch(); this.results = [await Catalog.fromId(id)]; }
      else if (Store.data.apiKey) { this.searching = true; this.renderSearch(); this.results = await Catalog.search(q, Store.data.apiKey); }
      else { this.results = Catalog.searchDemo(q); if (!this.results.length) this.searchHint = 'Sans clé API, seul le catalogue de démo est cherchable. Collez un lien YouTube ou ajoutez une clé dans Compte.'; }
    } catch (e) { this.results = []; this.searchHint = e.message; }
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
      const g = GENRES.find((x) => x.id === d.id); list = demoFor(g.id);
      html += this.largeHead(g.name, false) + `<div class="shelf wide">${list.slice(0, 3).map((t, i) => `<button class="hero" data-play-ctx="${i}"><div class="art">${artImg(t)}</div><div class="hero-txt"><small>${esc(g.name)}</small><b>${esc(t.title)}</b></div></button>`).join('')}</div><div class="section-h">Morceaux populaires</div>` + this.list(list);
    } else if (d.type === 'playlist') {
      const pl = Store.data.playlists.find((p) => p.id === d.id); if (!pl) return this.pop();
      list = pl.tracks;
      html += `<div class="pl-head"><div class="art">${artImg(pl.tracks[0] || { id: pl.id, demo: true }, pl.tracks[0] ? null : pl.id)}</div><h1>${esc(pl.name)}</h1><div class="sub">Ma playlist</div><div class="sub2">${list.length} morceau${list.length > 1 ? 'x' : ''} · ${fmt(list.reduce((s, t) => s + (t.dur || 0), 0))}</div></div>
        <div class="pl-btns"><button data-act="pl-play">${icon('play')}Lecture</button><button data-act="pl-shuffle">${icon('shuffle')}Aléatoire</button></div>` +
        (list.length ? this.list(list) : '<div class="empty">Cette playlist est vide.</div>');
    } else if (d.type === 'playlists') {
      html += this.largeHead('Playlists', false) + `<div class="list"><div class="row new-pl" data-act="new-pl" role="button"><div class="art">${icon('plus')}</div><div class="rt"><div class="rtx r1">Nouvelle playlist…</div></div></div>${Store.data.playlists.map((p) => `<div class="row" data-pl="${p.id}" role="button"><div class="art">${artImg(p.tracks[0] || { id: p.id, demo: true }, p.tracks[0] ? null : p.id)}</div><div class="rt"><div class="rtx"><div class="r1">${esc(p.name)}</div><div class="r2">${p.tracks.length} morceau${p.tracks.length > 1 ? 'x' : ''}</div></div><span class="chev" style="width:18px;color:var(--label3)">${icon('chevR')}</span></div></div>`).join('')}</div>`;
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
    if (this.view === view && !this.stack.length) { $('#scroller').scrollTo({ top: 0, behavior: 'smooth' }); return; }
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
    $('#np-list').innerHTML = icon('queue');
    $('#np-more').innerHTML = icon('more');
    $('.vol-ico.lo').innerHTML = icon('volLo'); $('.vol-ico.hi').innerHTML = icon('volHi');
    if (t) {
      $('#np-title').textContent = t.title; $('#np-artist').textContent = t.artist;
      const liked = Library.has(t.id); $('#np-like').innerHTML = icon(liked ? 'heartFill' : 'heart'); $('#np-like').classList.toggle('on', liked);
      if (this._npId !== t.id) {
        this._npId = t.id;
        const [c1, c2, c3] = palette(t.album || t.id);
        np.style.setProperty('--np-c1', c3); np.style.setProperty('--np-c2', c1); np.style.setProperty('--np-c3', c2);
        $('#np-art').innerHTML = t.demo ? artImg(t) : '';
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
  },
  /* Le lecteur YouTube reste visible : dans « À l'écoute », sinon en vignette flottante 200×200 */
  placeVideo() {
    const t = Player.current(), host = $('#yt-host'), fv = $('#float-video');
    const real = t && !t.demo, open = $('#np').classList.contains('open');
    host.className = '';
    if (real && open) { $('#np-art').appendChild(host); host.className = 'in-np'; fv.hidden = true; }
    else if (real) { fv.appendChild(host); host.className = 'in-float'; fv.hidden = false; }
    else { document.body.appendChild(host); fv.hidden = true; }
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
    $('#np-queue').innerHTML = `<div class="q-head"><div class="art">${artImg(t)}</div><div class="rtx"><div class="np-title">${esc(t.title)}</div><div class="q-artist">${esc(t.artist)}</div></div></div><h3>À suivre</h3><p>${Player.shuffle ? 'Lecture aléatoire' : 'Depuis votre sélection'}</p>` +
      (up.length ? `<div class="list" style="margin:0">${up.map((t, i) => this.row(t, i)).join('')}</div>` : '<p>Rien à suivre.</p>');
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
      + (this.stack.at(-1)?.type === 'playlist' ? `<div class="menu"><button data-m="rm" class="danger">Supprimer de la playlist${icon('trash')}</button></div>` : ''), (p) => {
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
        const list = { history: Store.data.history, mix: this.ctx.home?.mix, new: this.ctx.new?.a, lib: Store.data.library, ctx: this.ctx.detail }[sh] || [];
        return Player.playList(list, +card.dataset.card);
      }
      const hero = el.closest('[data-hero]'); if (hero) return Player.playList(this.ctx.home.picks, +hero.dataset.hero);
      const heroN = el.closest('[data-hero-new]'); if (heroN) return Player.playList(this.ctx.new.a, +heroN.dataset.heroNew);
      const pc = el.closest('[data-play-ctx]'); if (pc) return Player.playList(this.ctx.detail, +pc.dataset.playCtx);
      const g = el.closest('[data-genre]'); if (g) return this.push({ type: 'genre', id: g.dataset.genre });
      const pl = el.closest('[data-pl]'); if (pl) return this.push({ type: 'playlist', id: pl.dataset.pl });
      const nav = el.closest('[data-nav]'); if (nav) return this.push({ type: nav.dataset.nav });
      const ar = el.closest('[data-artist]'); if (ar) return this.push({ type: 'artist', id: ar.dataset.artist });
      const sc = el.closest('[data-scope]'); if (sc) { this.scope = sc.dataset.scope; return this.renderSearch(); }
      const act = el.closest('[data-act]')?.dataset.act;
      if (act === 'settings') { $('#api-key').value = Store.data.apiKey; return $('#settings').showModal(); }
      if (act === 'back') return this.pop();
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
    $('#np-like').onclick = () => Player.current() && Library.toggle(Player.current());
    $('#np-more').onclick = () => Player.current() && this.trackMenu(Player.current());
    const seek = $('#seek');
    seek.oninput = () => { this.seeking = true; seek.style.setProperty('--p', `${seek.value / 10}%`); };
    seek.onchange = () => { const e = Player.engine; if (e) e.seek(((e.duration() || Player.current()?.dur || 0) * seek.value) / 1000); this.seeking = false; };
    const vol = $('#vol'); const sv = () => vol.style.setProperty('--p', vol.value + '%'); sv();
    vol.oninput = () => { sv(); YTEngine.volume(+vol.value); };
    $('.float-close').innerHTML = icon('close'); $('.float-close').onclick = () => Player.stop();
    $('#float-video').addEventListener('dblclick', () => this.openNP());

    $('#settings').onclose = () => { Store.data.apiKey = $('#api-key').value.trim(); Store.save(); };
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
window.Cadence = { Store, Catalog, Player, Library, UI, DEMO };
