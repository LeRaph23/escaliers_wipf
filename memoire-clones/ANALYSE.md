# Reproduction assistée par IA d'applications mobiles grand public : étude de cas

> Annexe technique de mémoire. Deux applications iOS d'un même éditeur indépendant ont servi de cible :
> un **navigateur vidéo avec bloqueur de publicités** (« YouPlay: AdBlock Video Browser ») et un
> **lecteur musical adossé au catalogue YouTube** (« Demus: Easy Music Streaming »).
> Les noms cités appartiennent à leurs titulaires. Les prototypes portent des noms distincts (Lumen, Cadence).

## 1. Méthode : réimplémentation « clean-room », sans décompilation

| Fait | Pas fait |
|---|---|
| Lecture des fiches App Store, des descriptions publiques et des avis | Déchiffrement de l'IPA (FairPlay) ou décompilation du binaire |
| Déduction de la stack à partir des fonctions visibles et des API iOS publiques | Interception du trafic ou des clés de l'app d'origine |
| Réécriture intégrale du code, de l'UI et des noms | Reprise d'icônes, de textes ou de ressources |

**Pourquoi.** En droit français, la décompilation d'un logiciel n'est licite que pour l'interopérabilité (CPI, art. L122-6-1 IV). Contourner FairPlay relève en plus des mesures techniques de protection (art. L335-3-1). L'observation boîte noire, elle, est permise à l'utilisateur légitime (art. L122-6-1 III). La méthode clean-room est donc à la fois la seule voie légale et la plus probante. Elle montre que **la fonction se reproduit sans accéder au code**.

## 2. Stack déduite (hypothèses, non vérifiées sur le binaire)

### 2.1 Navigateur vidéo (cible A), reproduit en `lumen-ios/`
| Fonction annoncée | Brique iOS la plus probable |
|---|---|
| Navigation | `WKWebView` (imposé par l'App Store pour tout navigateur hors UE) |
| Blocage pub | `WKContentRuleList`, format JSON des Content Blockers Safari |
| Lecture en arrière-plan | `AVAudioSession .playback` + mode `audio` + neutralisation de `visibilitychange` |
| PiP / AirPlay | Flags `WKWebViewConfiguration` + `AVRoutePickerView` |
| Monétisation | StoreKit 2 : abonnements + achat à vie (0,99 à 9,99 $) |
| Plateformes | SwiftUI multiplateforme (iPhone, iPad, Mac) |

### 2.2 Lecteur musical (cible B), reproduit en `cadence-pwa/`
| Fonction annoncée | Brique probable |
|---|---|
| Catalogue | Données YouTube : API Data v3 ou API interne « InnerTube » (non documentée) |
| Lecture | Lecteur embarqué (IFrame/WebView) **ou** extraction de flux. Inconnu sans analyse dynamique |
| Bibliothèque, playlists | Persistance locale (SwiftData/Core Data) |
| CarPlay, écran verrouillé | `MPNowPlayingInfoCenter`, `CPTemplateApplicationScene` |
| Monétisation | Achat unique (environ 5 €) |

Le prototype Cadence n'utilise **que** des voies officielles : lecteur IFrame visible (≥ 200×200 px, comme l'exigent les CGU de l'API), API Data v3 avec clé personnelle, oEmbed. Il n'extrait ni ne télécharge aucun flux. La démonstration porte donc sur la **reproductibilité fonctionnelle**, pas sur le contournement.

## 3. Résultats

| | Cible A → Lumen | Cible B → Cadence |
|---|---|---|
| Volume de code produit | ~350 lignes Swift + 12 règles | ~400 lignes JS/HTML/CSS |
| Temps de génération (IA) | quelques minutes | quelques minutes |
| Vérification | **non compilé** (pas de Xcode dans l'environnement) | testé en Chromium headless : recherche par lien, bibliothèque, playlists, file, persistance |
| Couverture fonctionnelle | navigation, blocage, arrière-plan, PiP, AirPlay, favoris, premium | recherche, bibliothèque, playlists, file, aléatoire/répétition, contrôles système, export/import |
| Manquant | icône, onboarding, finitions UI | CarPlay, mode hors ligne, recommandations |

**Constat.** Ces applications sont des assemblages minces d'API système publiques. Leur valeur tient au produit (finition, référencement App Store, confiance), pas à une barrière technique. L'IA ramène le coût de la copie fonctionnelle à quelques minutes, mais **pas** celui de la finition ni de la publication.

## 4. Lecture « sécurité » (enjeux ANSSI / SGDSN)

La copie en tant que telle relève surtout de la propriété intellectuelle. L'enjeu de sécurité est **l'abaissement du coût de production de clones crédibles servant de leurres** :

1. **Applications contrefaites malveillantes.** Un clone fonctionnel *et* utile retient l'utilisateur, ce qui rend la charge malveillante plus durable que dans une coquille vide. Vecteurs : stores alternatifs (ouverts dans l'UE par le DMA), sideloading Android, faux sites de téléchargement d'APK. Plusieurs de ces sites existent déjà pour la cible B (cf. recherche initiale).
2. **Catégorie à risque.** Les « navigateurs » et lecteurs voient tout le trafic de l'utilisateur : sessions, cookies, historique. Un clone de navigateur est un **outil de collecte d'identifiants** idéal (injection de `WKUserScript` sur tous les sites, cf. `PlaybackSupport.swift` : une seule ligne sépare un script anodin d'un keylogger).
3. **Asymétrie défense/attaque.** La revue App Store contrôle les métadonnées et le comportement statique. Le code généré varie à chaque génération, ce qui affaiblit les signatures et la détection par similarité.
4. **Pistes de remédiation.** Vérification d'éditeur sur les stores alternatifs, détection de similarité *fonctionnelle* plutôt que binaire, sensibilisation sur les APK tiers, attestation d'intégrité côté serveur (App Attest / Play Integrity) pour les apps légitimes.

## 5. Limites
- La stack est **inférée**, pas vérifiée. Une analyse dynamique légale (proxy sur son propre appareil, sans contournement) pourrait la confirmer.
- Lumen n'a pas été compilé. Les erreurs résiduelles éventuelles font partie du coût réel de reproduction et sont à mesurer.
- Un seul éditeur et deux apps : on ne peut pas généraliser sans élargir l'échantillon.
