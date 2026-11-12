# Lumen : équivalent fonctionnel d'un « navigateur vidéo avec bloqueur de pub »

SwiftUI, iOS 17+. **Code non compilé dans l'environnement de génération** (pas de toolchain Swift sous Linux) : à valider sous Xcode.

## Monter le projet
1. Xcode, puis *New Project*, puis *iOS App* (SwiftUI). Nommez-le `Lumen` et supprimez le `ContentView.swift` généré.
2. Glissez le contenu de `Lumen/` dans le projet, `blocker-rules.json` compris (cochez *Copy into target*).
3. *Signing & Capabilities*, puis *Background Modes* : cochez **Audio, AirPlay, and Picture in Picture**.
4. Optionnel : un fichier `.storekit` avec les 3 produits de `PremiumStore.productIDs`.

## Correspondance fonction → API
| Fonction observée | API |
|---|---|
| Navigation web | `WKWebView` |
| Blocage pub | `WKContentRuleList` (JSON des Content Blockers Safari) |
| Lecture arrière-plan | `AVAudioSession(.playback)` + `UIBackgroundModes=audio` + masquage de `document.hidden` |
| Picture in Picture | `allowsPictureInPictureMediaPlayback` (PiP natif du `<video>`) |
| AirPlay | `allowsAirPlayForMediaPlayback` + `AVRoutePickerView` |
| Abonnement / à vie | StoreKit 2 (`Product`, `Transaction.currentEntitlements`) |
| Favoris | `UserDefaults` + `Codable` |

Environ 350 lignes au total.
