# memoire-clones

Prototypes clean-room pour une étude sur la reproductibilité d'applications par IA. Voir [ANALYSE.md](ANALYSE.md).

| Dossier | Équivalent fonctionnel de | Langage visuel | Lancer |
|---|---|---|---|
| `cadence-pwa/` | lecteur musical (type Demus) | iOS / lecteur musical (grands titres, tuiles, verre dépoli) | `python3 -m http.server -d cadence-pwa 8080` |
| `lumen-web/` | interface d'une plateforme vidéo | conventions d'une app vidéo mobile, identité propre | `python3 -m http.server -d lumen-web 8081` |
| `lumen-ios/` | navigateur vidéo + bloqueur (type YouPlay) | SwiftUI natif | Xcode (non compilé ici) |

Captures : `captures/` (iPhone 15 Pro émulé, clair et sombre). Tous les contenus (titres, artistes, chaînes, pochettes, miniatures) sont **fictifs et générés**.
