# Lumen iOS — navigateur vidéo + bloqueur de pub (équivalent fonctionnel de YouPlay)

SwiftUI, iOS 17+. C'est la pièce qui reproduit YouPlay : un navigateur (`WKWebView`) qui affiche de vrais
sites (dont YouTube), avec bloqueur de pub, lecture en arrière-plan, PiP et AirPlay.

> **Important.** Ce code n'a **pas été compilé** (pas de Mac/Xcode dans l'environnement de génération).
> Des erreurs mineures de compilation sont possibles et font partie du coût réel de reproduction.

## Prérequis
- **Un Mac** (Xcode ne tourne que sur macOS). Sans Mac, l'installation sur iPhone est impossible — c'est une contrainte d'Apple, pas de ce projet.
- Xcode 15+ (gratuit sur le Mac App Store).
- Un **identifiant Apple** (gratuit) suffit pour installer sur ton propre iPhone ; l'app se resigne tous les 7 jours. Un compte développeur payant (99 €/an) lève cette limite.

## Ouvrir le projet

### Voie rapide (XcodeGen)
```bash
cd lumen-ios
brew install xcodegen      # une fois
xcodegen generate
open Lumen.xcodeproj
```
Le `project.yml` règle déjà le mode arrière-plan audio, le nom de l'app et l'identifiant de bundle.

### Voie manuelle (sans XcodeGen)
1. Xcode → *File → New → Project → iOS → App*. Interface **SwiftUI**, nom **Lumen**. Supprime `ContentView.swift` et le fichier `...App.swift` générés.
2. Glisse les 6 `.swift` du dossier `Lumen/` **et** `blocker-rules.json` dans le projet (coche *Copy items if needed* et *Add to target: Lumen*).
3. Cible *Lumen → Signing & Capabilities → + Capability → Background Modes* → coche **Audio, AirPlay, and Picture in Picture**.

## Installer sur ton iPhone
1. Branche l'iPhone en USB. Dans Xcode, choisis-le en haut comme destination.
2. *Lumen → Signing & Capabilities* : coche **Automatically manage signing**, choisis ton **Team** (ton identifiant Apple ; *Add an Account…* si besoin). Mets un **Bundle Identifier** unique, par ex. `com.tonnom.lumen`.
3. Sur l'iPhone (iOS 16+) : *Réglages → Confidentialité et sécurité → Mode développeur* → active, redémarre.
4. Clique **Run** (▶) dans Xcode.
5. Premier lancement : *Réglages → Général → VPN et gestion de l'appareil* → fais confiance à ton certificat de développeur.

## À propos de « mon historique / mes recos de la télé »
Une fois l'app installée, **connecte-toi à YouTube dans l'app** (le favori YouTube est en page d'accueil).
Les cookies sont conservés : YouTube te sert alors **ton** historique et **tes** recommandations, y compris les
vidéos vues sur ta télé — parce que c'est le site YouTube qui les affiche, pas l'app qui les synchronise.
C'est exactement le fonctionnement de YouPlay.

> La configuration Google Cloud (OAuth) que tu as faite concerne **Lumen web**, pas cette app iOS.
> Lumen iOS n'a besoin d'aucune clé : tu te connectes directement sur youtube.com dans le navigateur intégré.

## Barre du bas
**Retour · Accueil · Sur la télé · Télécharger · Mes vidéos · Plus** (le menu *Plus* contient Avancer,
Recharger, Favoris et Premium). « Accueil » ramène sur YouTube, ouvert directement au lancement.

## AirPlay (image + son) et téléchargement
- **AirPlay 1080p, image + son (bouton « Sur la télé » en bas).** Le site mobile de YouTube joue ses vidéos
  via Media Source Extensions : iOS ne sait pas les envoyer en AirPlay (seul le son part). Et la 1080p n'existe
  chez YouTube qu'en pistes vidéo et audio séparées, qu'AirPlay ne relit pas telles quelles. Sur une page de
  vidéo, le bouton **Sur la télé** **prépare donc un MP4 1080p** (mêmes étapes que le téléchargement, progression dans la
  bannière), puis l'ouvre dans le **lecteur natif d'iOS** : touche l'icône AirPlay du lecteur et choisis ta télé.
  Le fichier est supprimé à la fermeture du lecteur. Astuce : une vidéo déjà dans Mes vidéos part
  en AirPlay 1080p **sans attente**.
  > Temps d'attente : il faut d'abord récupérer la vidéo (~30 s pour 10 min de vidéo à 5 Mo/s).
  > Alternative immédiate sans attente : **Recopie de l'écran** (Centre de contrôle) + vidéo en plein écran.
- **Téléchargement natif (bouton « Télécharger » en bas), gardé dans l'app.** Sur une page de vidéo YouTube, le bouton
  télécharge la vidéo en **MP4 jusqu'à 1080p** dans la bibliothèque **Mes vidéos** de l'app
  (**rien n'est enregistré dans Photos**, aucune autorisation demandée) :
  1. la bibliothèque open source **YouTubeKit** (Swift Package, ajoutée automatiquement par `project.yml`)
     liste les flux de la vidéo ;
  2. l'app télécharge la meilleure piste vidéo H.264 (≤ 1080p) et la meilleure piste audio M4A, **par morceaux
     de 10 Mo avec 5 tentatives par morceau** (parade aux coupures HTTP 403) ;
  3. AVFoundation assemble vidéo + audio **sans réencodage**.
  Une bannière affiche la progression avec un bouton Annuler.
  **Retrouver ses vidéos :** bouton **Mes vidéos** en bas. Touche une vidéo pour la lire dans le
  lecteur natif — et l'envoyer **immédiatement en AirPlay 1080p**, sans attente puisqu'elle est déjà sur le
  téléphone. Glisse vers la gauche pour supprimer. Le dossier est aussi visible dans l'app **Fichiers**
  (Sur mon iPhone › Lumen › Téléchargements).
  > YouTubeKit tente d'abord l'extraction **sur l'appareil**, puis se rabat sur le serveur de son auteur ; dans
  > ce second cas, l'identifiant de la vidéo est envoyé à ce serveur.
  >
  > **Démonstration uniquement** : télécharger des vidéos YouTube est contraire à ses CGU. Ne pas distribuer
  > cette app ; elle serait de toute façon refusée sur l'App Store. La voie légale est YouTube Premium.

## Note de sécurité (pour le mémoire)
Une app-navigateur peut injecter du JavaScript dans toutes les pages affichées. `PlaybackSupport.swift`
exclut **explicitement** les pages de connexion (Google, Apple, Microsoft) de toute injection — à l'inverse
de ce que ferait un clone malveillant, qui s'en servirait pour lire les identifiants saisis. Voir `../ANALYSE.md` §9.
