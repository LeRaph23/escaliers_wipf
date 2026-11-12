/* Cadence : équivalent fonctionnel d'un « lecteur musical adossé au catalogue YouTube ».
 * Lecture : lecteur IFrame YouTube officiel uniquement (pas d'extraction de flux ni de
 * téléchargement). Données : localStorage. Recherche : YouTube Data API v3 (clé utilisateur).
 */
'use strict';

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- Stockage ---------- */
const Store = {
  key: 'cadence.v1',
  data: { library: [], playlists: [], apiKey: '' },
  load() {
    try { Object.assign(this.data, JSON.parse(localStorage.getItem(this.key)) || {}); } catch {}
  },
  save() {
    try { localStorage.setItem(this.key, JSON.stringify(this.data)); } catch {}
  },
};

/* ---------- Catalogue (YouTube) ---------- */
const Catalog = {
  thumb: (id) => `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,

  parseId(text) {
    const t = text.trim();
    if (/^[\w-]{11}$/.test(t)) return t;
    try {
      const u = new URL(t);
      if (u.hostname === 'youtu.be') return u.pathname.slice(1, 12);
      if (u.hostname.endsWith('youtube.com')) {
        return u.searchParams.get('v') || (u.pathname.match(/\/(?:shorts|embed|live)\/([\w-]{11})/) || [])[1] || null;
      }
    } catch {}
    return null;
  },

  async fromId(id) {
    const track = { id, title: `Vidéo ${id}`, artist: 'YouTube', thumb: this.thumb(id) };
    try {
      const r = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent('https://www.youtube.com/watch?v=' + id)}`);
      if (r.ok) { const j = await r.json(); track.title = j.title; track.artist = j.author_name; }
    } catch {}
    return track;
  },

  async search(q, apiKey) {
    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    Object.entries({ part: 'snippet', type: 'video', videoCategoryId: '10', maxResults: '25', q, key: apiKey })
      .forEach(([k, v]) => url.searchParams.set(k, v));
    const r = await fetch(url);
    if (!r.ok) throw new Error(`API YouTube : HTTP ${r.status}`);
    const j = await r.json();
    return j.items.map((it) => ({
      id: it.id.videoId,
      title: decodeEntities(it.snippet.title),
      artist: decodeEntities(it.snippet.channelTitle).replace(/ - Topic$/, ''),
      thumb: it.snippet.thumbnails?.medium?.url || this.thumb(it.id.videoId),
    }));
  },
};
function decodeEntities(s) { const t = document.createElement('textarea'); t.innerHTML = s; return t.value; }

/* ---------- Lecteur ---------- */
const Player = {
  yt: null, ready: false, queue: [], index: -1, shuffle: false, repeat: 'off', // off | all | one
  pending: null,

  init() {
    window.onYouTubeIframeAPIReady = () => {
      this.yt = new YT.Player('yt-frame', {
        width: 200, height: 200,
        playerVars: { playsinline: 1, rel: 0 },
        events: {
          onReady: () => { this.ready = true; if (this.pending) { this.load(this.pending); this.pending = null; } },
          onStateChange: (e) => this.onState(e.data),
          onError: () => this.next(),
        },
      });
    };
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    s.onerror = () => console.warn('IFrame API indisponible (hors ligne ?)');
    document.head.appendChild(s);
    setInterval(() => this.tick(), 500);
  },

  playList(tracks, start = 0, shuffled = false) {
    if (!tracks.length) return;
    let q = tracks.slice();
    if (shuffled) { q = shuffleArr(q); start = 0; }
    this.queue = q; this.index = start;
    this.load(q[start]);
  },
  enqueue(track) {
    this.queue.push(track);
    if (this.index < 0) { this.index = 0; this.load(track); }
    UI.renderQueue();
  },
  load(track) {
    UI.showPlayer(track);
    if (!this.ready) { this.pending = track; return; }
    this.yt.loadVideoById(track.id);
    MediaSessionBridge.update(track);
  },
  current() { return this.queue[this.index]; },
  toggle() {
    if (!this.ready) return;
    this.yt.getPlayerState() === YT.PlayerState.PLAYING ? this.yt.pauseVideo() : this.yt.playVideo();
  },
  next(auto = false) {
    if (!this.queue.length) return;
    if (auto && this.repeat === 'one') return this.load(this.current());
    let i = this.shuffle ? Math.floor(Math.random() * this.queue.length) : this.index + 1;
    if (i >= this.queue.length) { if (this.repeat !== 'all') return; i = 0; }
    this.index = i; this.load(this.queue[i]);
  },
  prev() {
    if (this.ready && this.yt.getCurrentTime() > 3) return this.yt.seekTo(0, true);
    if (this.index > 0) { this.index--; this.load(this.queue[this.index]); }
  },
  onState(s) {
    $('#btn-play').textContent = s === 1 ? '⏸' : '▶';
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = s === 1 ? 'playing' : 'paused';
    if (s === 0) this.next(true);
  },
  tick() {
    if (!this.ready || !this.yt.getDuration) return;
    const d = this.yt.getDuration(), t = this.yt.getCurrentTime();
    if (d > 0 && !UI.seeking) $('#seek').value = String((t / d) * 100);
  },
  seekPct(p) { if (this.ready) this.yt.seekTo((this.yt.getDuration() * p) / 100, true); },
};
function shuffleArr(a) {
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

/* Contrôles écran verrouillé / casque / centre de contrôle */
const MediaSessionBridge = {
  init() {
    if (!('mediaSession' in navigator)) return;
    const ms = navigator.mediaSession;
    ms.setActionHandler('play', () => Player.toggle());
    ms.setActionHandler('pause', () => Player.toggle());
    ms.setActionHandler('nexttrack', () => Player.next());
    ms.setActionHandler('previoustrack', () => Player.prev());
  },
  update(t) {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: t.title, artist: t.artist, artwork: [{ src: t.thumb, sizes: '320x180', type: 'image/jpeg' }],
    });
  },
};

/* ---------- Bibliothèque ---------- */
const Library = {
  has: (id) => Store.data.library.some((t) => t.id === id),
  toggle(track) {
    const lib = Store.data.library;
    const i = lib.findIndex((t) => t.id === track.id);
    i >= 0 ? lib.splice(i, 1) : lib.unshift(track);
    Store.save(); UI.refresh();
  },
  createPlaylist(name) {
    Store.data.playlists.push({ id: crypto.randomUUID(), name, tracks: [] });
    Store.save(); UI.renderPlaylists();
  },
  addTo(plId, track) {
    const pl = Store.data.playlists.find((p) => p.id === plId);
    if (pl && !pl.tracks.some((t) => t.id === track.id)) { pl.tracks.push(track); Store.save(); }
  },
  removeFrom(plId, trackId) {
    const pl = Store.data.playlists.find((p) => p.id === plId);
    pl.tracks = pl.tracks.filter((t) => t.id !== trackId); Store.save();
  },
  deletePlaylist(plId) {
    Store.data.playlists = Store.data.playlists.filter((p) => p.id !== plId); Store.save();
  },
};

/* ---------- Interface ---------- */
const UI = {
  results: [], openPlaylist: null, seeking: false,

  trackRow(t, list, i, extra = '') {
    const li = document.createElement('li');
    if (Player.current()?.id === t.id) li.classList.add('playing');
    li.innerHTML = `
      <img src="${esc(t.thumb)}" alt="" loading="lazy">
      <div class="t-text"><span class="t-title">${esc(t.title)}</span><span class="t-artist">${esc(t.artist)}</span></div>
      <div class="t-actions">
        <button data-a="like" title="Bibliothèque">${Library.has(t.id) ? '♥' : '♡'}</button>
        <button data-a="queue" title="File d'attente">＋</button>
        <button data-a="pl" title="Ajouter à une playlist">☰</button>${extra}
      </div>`;
    li.querySelector('.t-text').onclick = () => Player.playList(list, i);
    li.querySelector('[data-a=like]').onclick = () => Library.toggle(t);
    li.querySelector('[data-a=queue]').onclick = () => Player.enqueue(t);
    li.querySelector('[data-a=pl]').onclick = () => this.pickPlaylist(t);
    return li;
  },
  renderList(el, tracks, extraFor) {
    el.replaceChildren(...tracks.map((t, i) => {
      const li = this.trackRow(t, tracks, i, extraFor ? extraFor.html : '');
      if (extraFor) li.querySelector('[data-a=extra]').onclick = () => extraFor.fn(t);
      return li;
    }));
    if (!tracks.length) el.innerHTML = '<li class="hint">Rien ici pour l\'instant.</li>';
  },
  renderSearch() { this.renderList($('#search-results'), this.results); },
  renderLibrary() { this.renderList($('#library-list'), Store.data.library); },
  renderQueue() { this.renderList($('#queue-list'), Player.queue); },
  renderPlaylists() {
    const ul = $('#playlists');
    ul.replaceChildren(...Store.data.playlists.map((p) => {
      const li = document.createElement('li');
      li.innerHTML = `<span>${esc(p.name)}</span><span class="hint">${p.tracks.length} titre(s)</span>`;
      li.onclick = () => this.showPlaylist(p.id);
      return li;
    }));
    const pl = Store.data.playlists.find((p) => p.id === this.openPlaylist);
    ul.hidden = !!pl; $('#playlist-form').hidden = !!pl; $('#playlist-detail').hidden = !pl;
    if (pl) {
      $('#playlist-title').textContent = pl.name;
      this.renderList($('#playlist-tracks'), pl.tracks, {
        html: '<button data-a="extra" title="Retirer">✕</button>',
        fn: (t) => { Library.removeFrom(pl.id, t.id); this.renderPlaylists(); },
      });
    }
  },
  showPlaylist(id) { this.openPlaylist = id; this.renderPlaylists(); },
  refresh() { this.renderSearch(); this.renderLibrary(); this.renderQueue(); this.renderPlaylists(); },

  pickPlaylist(track) {
    const ul = $('#add-targets');
    if (!Store.data.playlists.length) ul.innerHTML = '<li class="hint">Créez d\'abord une playlist.</li>';
    else ul.replaceChildren(...Store.data.playlists.map((p) => {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.textContent = p.name; b.value = p.id;
      b.onclick = () => { Library.addTo(p.id, track); this.renderPlaylists(); };
      li.append(b); return li;
    }));
    $('#add-to-playlist').showModal();
  },
  showPlayer(t) {
    $('#player').hidden = false; document.body.classList.add('has-player');
    $('#now-title').textContent = t.title; $('#now-artist').textContent = t.artist;
    this.renderQueue(); this.renderSearch(); this.renderLibrary();
  },
  switchView(name) {
    document.querySelectorAll('.view').forEach((v) => v.classList.toggle('active', v.id === `view-${name}`));
    document.querySelectorAll('.tabs button').forEach((b) => b.classList.toggle('active', b.dataset.view === name));
  },

  bind() {
    document.querySelectorAll('.tabs button').forEach((b) => (b.onclick = () => this.switchView(b.dataset.view)));

    $('#search-form').onsubmit = async (e) => {
      e.preventDefault();
      const q = $('#search-input').value.trim(); if (!q) return;
      const hint = $('#search-hint');
      const id = Catalog.parseId(q);
      try {
        if (id) { this.results = [await Catalog.fromId(id)]; hint.textContent = ''; }
        else if (Store.data.apiKey) { hint.textContent = 'Recherche…'; this.results = await Catalog.search(q, Store.data.apiKey); hint.textContent = ''; }
        else { hint.textContent = 'Ajoutez une clé API dans les réglages, ou collez un lien YouTube.'; return; }
      } catch (err) { hint.textContent = err.message; return; }
      this.renderSearch();
    };

    $('#playlist-form').onsubmit = (e) => {
      e.preventDefault(); Library.createPlaylist($('#playlist-name').value.trim()); $('#playlist-name').value = '';
    };
    $('#playlist-back').onclick = () => { this.openPlaylist = null; this.renderPlaylists(); };
    const openPl = () => Store.data.playlists.find((p) => p.id === this.openPlaylist);
    $('#playlist-play').onclick = () => Player.playList(openPl().tracks);
    $('#playlist-shuffle').onclick = () => Player.playList(openPl().tracks, 0, true);
    $('#playlist-delete').onclick = () => {
      if (confirm('Supprimer cette playlist ?')) { Library.deletePlaylist(this.openPlaylist); this.openPlaylist = null; this.renderPlaylists(); }
    };

    $('#btn-play').onclick = () => Player.toggle();
    $('#btn-next').onclick = () => Player.next();
    $('#btn-prev').onclick = () => Player.prev();
    $('#btn-shuffle').onclick = (e) => { Player.shuffle = !Player.shuffle; e.target.classList.toggle('on', Player.shuffle); };
    $('#btn-repeat').onclick = (e) => {
      Player.repeat = { off: 'all', all: 'one', one: 'off' }[Player.repeat];
      e.target.classList.toggle('on', Player.repeat !== 'off');
      e.target.textContent = Player.repeat === 'one' ? '↻¹' : '↻';
    };
    const seek = $('#seek');
    seek.oninput = () => (this.seeking = true);
    seek.onchange = () => { Player.seekPct(+seek.value); this.seeking = false; };

    $('#btn-settings').onclick = () => { $('#api-key').value = Store.data.apiKey; $('#settings').showModal(); };
    $('#settings').onclose = () => { Store.data.apiKey = $('#api-key').value.trim(); Store.save(); };
    $('#btn-export').onclick = () => {
      const blob = new Blob([JSON.stringify({ library: Store.data.library, playlists: Store.data.playlists }, null, 2)], { type: 'application/json' });
      const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'cadence-bibliotheque.json' });
      a.click(); URL.revokeObjectURL(a.href);
    };
    $('#file-import').onchange = async (e) => {
      const f = e.target.files[0]; if (!f) return;
      try {
        const j = JSON.parse(await f.text());
        if (Array.isArray(j.library)) Store.data.library = j.library;
        if (Array.isArray(j.playlists)) Store.data.playlists = j.playlists;
        Store.save(); this.refresh();
      } catch { alert('Fichier invalide'); }
    };
  },
};

/* ---------- Démarrage ---------- */
Store.load();
UI.bind();
UI.refresh();
MediaSessionBridge.init();
Player.init();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
window.Cadence = { Store, Catalog, Player, Library, UI }; // utile pour les tests
