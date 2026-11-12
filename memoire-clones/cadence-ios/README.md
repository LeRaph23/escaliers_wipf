# Cadence iOS — app native (équivalent fonctionnel de Demus)

Vraie app iOS : une enveloppe native (`WKWebView`) qui embarque l'interface web Cadence
(dossier `../cadence-pwa`, chargé **localement** depuis le bundle de l'app), avec session audio pour
la lecture en arrière-plan. L'app est autonome : le code web est dans l'app, pas servi par un site.

> **Non compilé ici** (pas de Mac/Xcode dans l'environnement de génération). L'interface a été vérifiée
> en chargement `file://` (équivalent WKWebView) : OK, sans erreur. Des ajustements mineurs restent possibles
> au premier build.

## Prérequis
- **Un Mac** avec Xcode 15+. Sans Mac, pas d'installation iPhone possible (contrainte Apple).
- Identifiant Apple **gratuit** (app valable 7 jours, à réinstaller ensuite) ou compte développeur payant.

## Construire
```bash
cd cadence-ios
brew install xcodegen      # une fois (sinon : https://brew.sh)
xcodegen generate
open Cadence.xcodeproj
```
Le `project.yml` embarque automatiquement le dossier `cadence-pwa` comme ressource et règle le mode audio.

> Méthode manuelle (sans XcodeGen) : *New Project → iOS → App* (SwiftUI, nom **Cadence**), supprime les
> fichiers générés, glisse les 2 `.swift` + `Info.plist` ; puis glisse le dossier **`cadence-pwa`** en
> choisissant **Create folder references** (dossier bleu, pas jaune) ; enfin *Signing & Capabilities →
> Background Modes → Audio, AirPlay, and Picture in Picture*.

## Installer sur l'iPhone
Identique à Lumen iOS :
1. iPhone en USB, *Se fier à cet ordinateur*.
2. Cible *Cadence → Signing & Capabilities* : **Automatically manage signing**, ton **Team**, Bundle ID unique (`com.tonnom.cadence`).
3. iPhone : *Réglages → Confidentialité et sécurité → Mode développeur* → activer, redémarrer.
4. **Run** ▶. Au 1er lancement : *Réglages → Général → VPN et gestion de l'appareil* → faire confiance.

## Limites assumées
- **Lecture en arrière-plan d'une vidéo YouTube dans une WKWebView** : iOS peut suspendre le média web quand
  l'app passe en arrière-plan. Le mode audio + la session `.playback` aident, mais la continuité n'est pas
  garantie comme avec un lecteur natif. En avant-plan : OK.
- La recherche par mots-clés demande une **clé YouTube Data API** (réglages de l'app) ; sinon catalogue de démo
  + liens YouTube collés.
- Lire l'audio de YouTube hors de son lecteur visible est contraire aux CGU de YouTube (légal en France pour
  l'étude). Voir `../ANALYSE.md`.
