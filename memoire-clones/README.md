# memoire-clones

Prototypes clean-room pour une étude sur la reproductibilité d'applications par IA. Voir [ANALYSE.md](ANALYSE.md).

| Dossier | Équivalent fonctionnel de | Langage visuel | Lancer |
|---|---|---|---|
| `cadence-pwa/` | lecteur musical (type Demus) | app web, **vraie musique via Audius** (gratuit, sans clé, lecture arrière-plan) | `python3 -m http.server -d cadence-pwa 8080` |
| `cadence-ios/` | lecteur musical (type Demus) | **app iOS native** (WKWebView embarquant `cadence-pwa`) | Xcode (voir `cadence-ios/README.md`) |
| `lumen-web/` | interface d'une plateforme vidéo | app web (identité propre) | `python3 -m http.server -d lumen-web 8081` |
| `lumen-ios/` | navigateur vidéo + bloqueur (type YouPlay) | **app iOS native** (SwiftUI) | Xcode (voir `lumen-ios/README.md`) |

Captures : `captures/` (iPhone 15 Pro émulé, clair et sombre). Tous les contenus (titres, artistes, chaînes, pochettes, miniatures) sont **fictifs et générés**.

## Connexion Google (Lumen)

Connexion via OAuth 2.0 officiel (Google Identity Services). Lumen n'a **aucun champ mot de passe** : on s'identifie sur la page de Google, et Lumen ne reçoit qu'un jeton en lecture seule (`youtube.readonly` + profil), valable ~1 h, gardé en mémoire et révoqué à la déconnexion.

Mise en place (une fois, ~10 min) :
1. [Google Cloud Console](https://console.cloud.google.com/) : créer un projet, puis activer **YouTube Data API v3**.
2. Écran de consentement OAuth : type « Externe », laisser en mode **Test**, ajouter son adresse Gmail comme utilisateur test.
3. Identifiants, puis *Créer*, puis **ID client OAuth**, type « Application Web ». Origine JavaScript autorisée : `http://localhost:8081`.
4. Lancer `python3 -m http.server -d lumen-web 8081`, ouvrir http://localhost:8081, aller dans *Vous*, puis *Se connecter avec Google* et coller l'ID client (ou le mettre dans `lumen-web/config.js`).

Ce que ça récupère : profil, abonnements, vidéos « J'aime », playlists, et les vidéos d'une chaîne. Lecture via l'intégration officielle `youtube-nocookie.com/embed`. Test automatisé (Google simulé) : `tests-google-oauth.js`.

## Import Takeout + Historique (Lumen)

**Importer son historique YouTube** (y compris les vidéos vues sur la télé) : Google Takeout, puis « Historique YouTube », export **JSON**, puis dans Lumen *Vous, Importer l'historique YouTube*. Import différé (pas temps réel) mais légal. Pour du « temps réel » façon YouPlay, c'est le wrapper iOS (`lumen-ios/`) qui affiche youtube.com directement.

### Historique de lecture

Historique de visionnage **continu** de ce qui est lu dans Lumen (vidéos de démo et vraies vidéos YouTube via l'embed officiel) : mis à jour pendant la lecture, persistant (localStorage), avec reprise à la position exacte, barre de progression, horodatage « Regardé il y a X », temps total et effacement. Nourrit les recommandations. Test : `tests-historique.js`.

Limite assumée : Lumen web ne peut pas récupérer l'historique de visionnage *de YouTube* (retiré de l'API officielle en 2016, et une page web ne peut pas lire la session youtube.com). Seul le wrapper iOS (`lumen-ios/`) l'obtient, parce que c'est YouTube lui-même qui l'affiche. Voir ANALYSE.md §9.
