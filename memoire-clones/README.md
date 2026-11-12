# memoire-clones

Prototypes clean-room pour une étude sur la reproductibilité d'applications par IA. Voir [ANALYSE.md](ANALYSE.md).

| Dossier | Équivalent fonctionnel de | Langage visuel | Lancer |
|---|---|---|---|
| `cadence-pwa/` | lecteur musical (type Demus) | iOS / lecteur musical (grands titres, tuiles, verre dépoli) | `python3 -m http.server -d cadence-pwa 8080` |
| `lumen-web/` | interface d'une plateforme vidéo | conventions d'une app vidéo mobile, identité propre | `python3 -m http.server -d lumen-web 8081` |
| `lumen-ios/` | navigateur vidéo + bloqueur (type YouPlay) | SwiftUI natif | Xcode (non compilé ici) |

Captures : `captures/` (iPhone 15 Pro émulé, clair et sombre). Tous les contenus (titres, artistes, chaînes, pochettes, miniatures) sont **fictifs et générés**.

## Connexion Google (Lumen)

Connexion via OAuth 2.0 officiel (Google Identity Services). Lumen n'a **aucun champ mot de passe** : on s'identifie sur la page de Google, et Lumen ne reçoit qu'un jeton en lecture seule (`youtube.readonly` + profil), valable ~1 h, gardé en mémoire et révoqué à la déconnexion.

Mise en place (une fois, ~10 min) :
1. [Google Cloud Console](https://console.cloud.google.com/) : créer un projet, puis activer **YouTube Data API v3**.
2. Écran de consentement OAuth : type « Externe », laisser en mode **Test**, ajouter son adresse Gmail comme utilisateur test.
3. Identifiants, puis *Créer*, puis **ID client OAuth**, type « Application Web ». Origine JavaScript autorisée : `http://localhost:8081`.
4. Lancer `python3 -m http.server -d lumen-web 8081`, ouvrir http://localhost:8081, aller dans *Vous*, puis *Se connecter avec Google* et coller l'ID client (ou le mettre dans `lumen-web/config.js`).

Ce que ça récupère : profil, abonnements, vidéos « J'aime », playlists, et les vidéos d'une chaîne. Lecture via l'intégration officielle `youtube-nocookie.com/embed`. Test automatisé (Google simulé) : `tests-google-oauth.js`.
