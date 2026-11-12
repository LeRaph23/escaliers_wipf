/* Connexion Google via OAuth 2.0 (Google Identity Services, flux « token client »).
 *
 * Sécurité, et c'est le point démontré pour le mémoire :
 *  - Lumen n'affiche AUCUN champ e-mail ou mot de passe. L'authentification se fait sur accounts.google.com,
 *    dans une fenêtre de Google, qui affiche le nom de l'application qui demande l'accès.
 *  - Lumen reçoit seulement un jeton d'accès, limité en portée (lecture seule YouTube + profil) et en durée
 *    (environ 1 h). Ce jeton reste en mémoire : il n'est écrit ni dans localStorage, ni sur un serveur.
 *  - « Se déconnecter » révoque le jeton côté Google.
 *
 * Configuration : créer un identifiant client OAuth « Application Web » dans Google Cloud Console
 * (origine autorisée : http://localhost:8081), activer « YouTube Data API v3 », puis renseigner l'identifiant
 * dans config.js ou dans Vous › Compte Google. L'identifiant client n'est pas un secret.
 */
'use strict';
const Google = {
  SCOPES: 'openid email profile https://www.googleapis.com/auth/youtube.readonly',
  token: null, expires: 0, user: null, subs: [], liked: [], playlists: [], videos: new Map(), loading: false, error: '',
  clientId() { return (window.LUMEN_GOOGLE_CLIENT_ID || '').trim() || localStorage.getItem('lumen.gclient') || ''; },
  get signedIn() { return !!this.token && Date.now() < this.expires; },

  loadGis() {
    if (window.google?.accounts?.oauth2) return Promise.resolve();
    return new Promise((res, rej) => {
      const s = document.createElement('script'); s.src = 'https://accounts.google.com/gsi/client'; s.async = true;
      s.onload = () => res(); s.onerror = () => rej(new Error('Impossible de joindre accounts.google.com'));
      document.head.appendChild(s);
    });
  },

  async signIn() {
    const id = this.clientId();
    if (!id) return Sheets.googleSetup();
    try { await this.loadGis(); } catch (e) { return toast(e.message); }
    const client = google.accounts.oauth2.initTokenClient({
      client_id: id, scope: this.SCOPES, prompt: '',
      callback: (r) => {
        if (r.error) { toast(`Connexion refusée : ${r.error}`); return; }
        if (!google.accounts.oauth2.hasGrantedAllScopes(r, 'https://www.googleapis.com/auth/youtube.readonly')) toast('Accès YouTube non accordé : seules les infos de profil seront affichées');
        this.token = r.access_token; this.expires = Date.now() + (r.expires_in - 60) * 1000;
        this.sync();
      },
      error_callback: (e) => toast(e.type === 'popup_closed' ? 'Connexion annulée' : 'Fenêtre de connexion bloquée par le navigateur'),
    });
    client.requestAccessToken();
  },

  signOut() {
    const t = this.token;
    if (t && window.google?.accounts?.oauth2) google.accounts.oauth2.revoke(t, () => {});
    Object.assign(this, { token: null, expires: 0, user: null, subs: [], liked: [], playlists: [], error: '' }); this.videos.clear();
    toast('Déconnecté. L\'accès de Lumen à votre compte a été révoqué.'); UI.go(UI.page === 'watch' ? 'you' : UI.page, false);
  },

  async api(url) {
    if (!this.signedIn) throw new Error('Session expirée, reconnectez-vous');
    const r = await fetch(url, { headers: { Authorization: `Bearer ${this.token}` } });
    if (r.status === 401) { this.token = null; throw new Error('Session expirée, reconnectez-vous'); }
    if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error(j.error?.message || `Erreur Google (HTTP ${r.status})`); }
    return r.json();
  },

  /* Récupère profil, abonnements, vidéos « J'aime » et playlists (lecture seule) */
  async sync() {
    this.loading = true; this.error = ''; UI.go('you', false);
    const yt = 'https://www.googleapis.com/youtube/v3';
    try {
      this.user = await this.api('https://www.googleapis.com/oauth2/v3/userinfo');
      const [subs, liked, pls] = await Promise.all([
        this.api(`${yt}/subscriptions?part=snippet&mine=true&maxResults=50&order=relevance`),
        this.api(`${yt}/videos?part=snippet,contentDetails,statistics&myRating=like&maxResults=50`),
        this.api(`${yt}/playlists?part=snippet,contentDetails&mine=true&maxResults=50`),
      ]);
      this.subs = (subs.items || []).map((s) => ({ id: s.snippet.resourceId.channelId, name: s.snippet.title, thumb: s.snippet.thumbnails?.default?.url }));
      this.liked = (liked.items || []).map((v) => this.toVideo(v));
      this.playlists = (pls.items || []).map((p) => ({ id: p.id, name: p.snippet.title, count: p.contentDetails.itemCount, thumb: p.snippet.thumbnails?.medium?.url }));
      toast(`Connecté en tant que ${this.user.name || this.user.email}`);
    } catch (e) { this.error = e.message; toast(e.message); }
    this.loading = false; UI.go(UI.page, false);
  },

  async channelUploads(channelId) {
    const yt = 'https://www.googleapis.com/youtube/v3';
    const ch = await this.api(`${yt}/channels?part=contentDetails,snippet,statistics&id=${encodeURIComponent(channelId)}`);
    const c = ch.items?.[0]; if (!c) throw new Error('Chaîne introuvable');
    const items = await this.api(`${yt}/playlistItems?part=contentDetails&maxResults=25&playlistId=${encodeURIComponent(c.contentDetails.relatedPlaylists.uploads)}`);
    const ids = (items.items || []).map((i) => i.contentDetails.videoId).join(',');
    const vids = ids ? await this.api(`${yt}/videos?part=snippet,contentDetails,statistics&id=${ids}`) : { items: [] };
    return { name: c.snippet.title, thumb: c.snippet.thumbnails?.medium?.url, subs: +c.statistics.subscriberCount || 0, count: +c.statistics.videoCount || 0, videos: vids.items.map((v) => this.toVideo(v)) };
  },

  async playlistItems(playlistId) {
    const yt = 'https://www.googleapis.com/youtube/v3';
    const items = await this.api(`${yt}/playlistItems?part=contentDetails&maxResults=50&playlistId=${encodeURIComponent(playlistId)}`);
    const ids = (items.items || []).map((i) => i.contentDetails.videoId).join(',');
    if (!ids) return [];
    return (await this.api(`${yt}/videos?part=snippet,contentDetails,statistics&id=${ids}`)).items.map((v) => this.toVideo(v));
  },

  /* Conversion d'une ressource vidéo de l'API vers le modèle de Lumen */
  toVideo(v) {
    const secs = isoDur(v.contentDetails?.duration || 'PT0S');
    const o = { id: 'yt:' + v.id, yt: v.id, title: v.snippet.title, channel: v.snippet.channelTitle, channelId: v.snippet.channelId,
      views: +v.statistics?.viewCount || 0, likes: +v.statistics?.likeCount || 0, comments: +v.statistics?.commentCount || 0,
      ago: Math.max(0, Math.floor((Date.now() - Date.parse(v.snippet.publishedAt)) / 864e5)), secs, dur: v.snippet.liveBroadcastContent === 'live' ? 'EN DIRECT' : ts(secs),
      live: v.snippet.liveBroadcastContent === 'live', cat: 'YouTube', subs: 0, real: true,
      thumbUrl: v.snippet.thumbnails?.high?.url || v.snippet.thumbnails?.medium?.url || `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg` };
    this.videos.set(o.id, o); return o;
  },
};
function isoDur(s) { const m = s.match(/P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/) || []; return (+m[1] || 0) * 86400 + (+m[2] || 0) * 3600 + (+m[3] || 0) * 60 + (+m[4] || 0); }
