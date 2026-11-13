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

## 6. Itérations de design (tests visuels automatisés)

Méthode : Chromium headless émulant un iPhone 15 Pro, scénario Playwright scripté (navigation, lecture, menus), captures en clair et en sombre, correction, recapture. Planches dans `captures/`.

| Itération | Défaut détecté sur capture | Correction |
|---|---|---|
| Cadence 1 | Pochette « À l'écoute » débordant sur la poignée de fermeture (écrans courts) | Taille contrainte par la hauteur (`container-type: size`, `min(100cqw, 100cqh)`) |
| Cadence 2 | En mode file d'attente, titre superposé à la liste | En-tête compact (pochette + titre) comme sur le modèle observé |
| Cadence 3 | Pochette encore affichée en mode file (`display:flex` l'emportait sur `[hidden]`) | Règle `[hidden]` explicite |
| Lumen 1 | Icônes de la barre du haut absentes | Injection des icônes au démarrage |
| Lumen 2 | Barre du bas claire sur le flux vertical sombre ; badge « démo » sur les contrôles | Thème sombre contextuel ; badge masqué quand les contrôles s'affichent |

**Constat.** Environ 5 allers-retours capture → correction suffisent pour atteindre un rendu proche d'une app native. Ce qui *n'est pas* reproduit, et ne doit pas l'être : nom, logo, couleur signature, icônes propriétaires (SF Symbols), photos d'artistes. C'est précisément ce qui distingue une **étude de conventions d'interface** (licite) d'une **contrefaçon de marque / page de phishing** (art. L713-2 CPI ; art. 226-4-1 et 313-1 du code pénal selon l'usage).

**Point pour le volet sécurité.** Le coût pour franchir ce dernier pas (remplacer le nom et la couleur par ceux de la cible) est quasi nul une fois la structure reproduite. La protection ne peut donc pas reposer sur la difficulté de copie du design. Elle repose sur la distribution (stores, domaines, certificats) et sur la détection (similarité visuelle de pages, surveillance des noms de domaine, signalements).

## 7. Contrainte légale observée : visibilité du lecteur

Les CGU de l'API YouTube imposent un lecteur visible d'au moins 200×200 px. Cadence respecte cette contrainte : quand l'écran « À l'écoute » est fermé, une vignette vidéo flottante reste affichée. Résultat : l'expérience est visiblement *moins bonne* que celle d'un lecteur musical classique (lecture audio seule, écran verrouillé). **Hypothèse à vérifier :** les apps de ce segment qui offrent une écoute audio pure, sans vidéo visible, s'écartent probablement de ces CGU ou utilisent des API non documentées. L'écart d'expérience entre la version conforme et l'original est en soi un indicateur.

## 8. Fonctions « intelligentes » et audit fonctionnel

**Recommandation (les deux apps).** Moteur local et explicable : affinités artiste/genre (Cadence) ou chaîne/thème (Lumen) apprises à partir des écoutes pondérées par récence, des « J'aime », « Je n'aime pas », abonnements, sauts (< 30 % du titre) et « Pas intéressé ». Ces affinités pilotent l'accueil, les suggestions « À suivre », la lecture automatique en fin de file et les playlists automatiques de Cadence (« Vos titres en boucle », « Mix découverte », « Mix du jour », « Ajoutés récemment », « Jamais écoutés »).
Un test comportemental (profil rap + électro sautée) a révélé un bug : un artiste systématiquement sauté apparaissait encore dans les favoris, parce que les affinités négatives n'étaient pas filtrées. Il est corrigé.

**Ce que ça ne reproduit pas.** Les vraies plateformes recommandent par filtrage collaboratif sur des millions d'utilisateurs (les gens qui aiment X aiment aussi Y). C'est impossible sans base d'utilisateurs ni serveur. C'est la principale barrière **non copiable** identifiée : la donnée, pas le code.

**Audit « boutons morts »** (`tests-audit-boutons.js`). Sur chaque écran, chaque élément interactif visible est cliqué un par un depuis un état propre, et on vérifie un effet observable (DOM, stockage, lecteur, URL, notification).
- Cadence : 179 éléments, 3 sans effet. Tous correspondent au fait de retoucher l'onglet actif alors qu'on est déjà en haut (comportement natif normal).
- Lumen : 210 éléments, 3 sans effet. Même cas, plus « reculer de 10 s » à 0:00.
- 0 erreur JavaScript. L'audit a trouvé 2 vrais bugs, corrigés : la lecture/pause de Cadence inversait deux fois son état, et le bouton « Diffuser » de Lumen n'était pas câblé.

**Synchronisation.** Aujourd'hui : stockage local et export/import JSON. Une synchronisation multi-appareils réelle exige un backend (authentification + base) ; voir la discussion dans le README.

## 9. Historique et recommandations : empruntés, pas copiés

**Constat.** L'app cible A (« navigateur vidéo ») offre connexion, historique et recommandations YouTube. Elle ne les *réimplémente* pas : c'est un navigateur (`WKWebView`) qui affiche le site m.youtube.com, sur lequel l'utilisateur se connecte. Historique et recommandations sont calculés et servis par YouTube. Lumen iOS reproduit exactement ce mécanisme (cookies persistants, `websiteDataStore = .default()`).

À l'inverse, une app qui passe par l'API officielle (Lumen web) **ne peut pas** obtenir ces données. L'historique et « À regarder plus tard » sont retirés de l'API YouTube Data v3 depuis 2016, et le fil de recommandations n'est exposé par aucune API publique. Les seules voies restantes sont :
- l'export manuel Google Takeout (licite, mais instantané figé, pas une synchro) ;
- l'API interne non documentée avec les cookies de session (contraire aux CGU, et techniquement identique à un vol de session).

**Conclusion pour le mémoire.** Les fonctions les plus « difficiles » (personnalisation, recommandations) ne sont pas reproduites : elles sont **empruntées en encapsulant le service d'origine**. La barrière non copiable reste la donnée d'usage, détenue par la plateforme.

**Risque de sécurité associé (catégorie « app-navigateur »).** L'app hôte contrôle la vue web, donc elle peut injecter du JavaScript dans toute page, y compris la page de connexion Google, et lire identifiants et cookies de session. Une seule ligne sépare un script de confort (lecture en arrière-plan) d'un enregistreur de frappe. Le prototype Lumen injectait initialement son script sur *toutes* les pages. Il exclut désormais explicitement les domaines d'authentification (Google, Apple, Microsoft). L'utilisateur, lui, n'a **aucun moyen de vérifier** ce comportement dans une app installée depuis un store. C'est l'argument central :
- Google bloque la connexion depuis les vues web intégrées de certaines apps ;
- les recommandations à porter sont : connexion via `ASWebAuthenticationSession` / navigateur système, audit des apps-navigateurs en store, sensibilisation des utilisateurs.

**Non vérifié.** Je n'ai pas testé si la connexion Google aboutit aujourd'hui dans un `WKWebView` standard : Google peut la refuser selon l'agent utilisateur. Je n'ai mis en œuvre aucun contournement de ce contrôle, car il s'agit précisément d'une protection anti-interception.

## 10. « Synchroniser l'historique de la télé » : ce qui est possible, et ce qui ne l'est pas

Demande fréquente : faire apparaître dans le clone les vidéos regardées ailleurs (télé, autre appareil). Trois voies, une seule à écarter :

| Voie | Statut | Mécanisme |
|---|---|---|
| **Navigateur affichant youtube.com** (Lumen iOS / YouPlay) | Licite | Ce n'est pas une synchro : l'utilisateur est connecté à YouTube, et le site lui ressert son historique et ses recommandations, télé comprise. |
| **Import Google Takeout** (Lumen web) | Licite | Export officiel des données utilisateur (`watch-history.json`), importé dans l'app. Différé et manuel, pas temps réel. |
| **API interne InnerTube + cookies de session** | À écarter | Seule voie « temps réel », mais contraire aux CGU YouTube et techniquement identique à un détournement de session. Non implémentée. |

**Conclusion centrale du mémoire.** Il n'existe, par conception, **aucune API officielle** donnant l'historique de visionnage YouTube en continu : Google l'a supprimée en 2016. Autrement dit, toute app tierce qui affiche vraiment l'historique « télé » en temps réel soit encapsule le site d'origine (et n'a donc rien copié de la plateforme), soit opère hors des règles avec la session de l'utilisateur. La barrière n'est pas technique côté interface : elle est **contractuelle et côté données**, détenue par la plateforme. C'est précisément ce qu'une étude destinée à l'ANSSI/SGDSN doit documenter : la facilité de copie de l'enveloppe, l'impossibilité de copie légale de la donnée d'usage, et le risque que des clones franchissent cette ligne en détournant la session.

L'import Takeout de Lumen web est testé par `tests-takeout.js` (jeu d'essai `tests-takeout-sample.json`).

## 11. Vraie musique dans le clone (Cadence) : voie officielle vs voie interne

**Mis en œuvre (licite).** Recherche réelle via **YouTube Data API v3** (clé utilisateur, catégorie Musique), sur la barre de recherche, les tuiles de genre et une étagère « Sur YouTube » de l'accueil. Lecture via le **lecteur IFrame officiel**. Gratuit (10 000 unités/jour ≈ 100 recherches/jour, sans carte bancaire). Aucune donnée d'identification requise au-delà d'une clé API.

**Non mis en œuvre (volontairement) : l'approche « façon Demus ».** Pour (a) se passer de clé/quota et (b) jouer l'**audio seul sans lecteur visible**, une app peut interroger l'**API interne « InnerTube »** de YouTube et extraire l'URL du flux. Cette voie :
- viole les Conditions d'utilisation de YouTube (interdiction d'accéder au service par un moyen autre que l'interface/API publiques, et de dissocier l'audio du lecteur) ;
- techniquement, revient à reproduire le comportement d'un extracteur de flux non autorisé ;
- expose à la suspension de compte et à des mesures côté plateforme.

**Pourquoi c'est le cœur de la démonstration.** La seule chose que la voie interne « ajoute » par rapport à l'API officielle, c'est de **sortir du cadre contractuel** (pas de clé, audio dissocié). La fonction visible pour l'utilisateur — chercher et écouter une musique de YouTube — est déjà obtenue légalement. Autrement dit : **la frontière entre le clone d'étude et le clone contrefaisant n'est pas une frontière de compétence technique, mais de conformité.** Un auteur de clone malveillant franchit cette ligne pour quelques avantages de confort ; c'est ce franchissement, et non la copie de l'interface, qui constitue le risque à documenter pour l'ANSSI/SGDSN.

Pour cette raison, ce dépôt implémente uniquement la voie officielle. Test : `tests-cadence-youtube.js`.


## 12. Résolution légale du besoin « vraie musique, lecture en arrière-plan »

La demande — écouter de vraies musiques, écran verrouillé, gratuitement — ne peut pas être satisfaite via YouTube sans enfreindre ses CGU : la lecture en arrière-plan est une fonctionnalité **payante** (YouTube Premium) que le lecteur officiel bloque volontairement, et seule l'extraction de flux (API interne) permettrait de la contourner.

**Choix retenu, licite.** Cadence est rebranché sur **Audius**, plateforme de streaming libre et gratuite dont l'API publique est explicitement destinée aux applications tierces. Chaque piste expose une URL de flux audio jouée par un lecteur `<audio>` HTML5 : la lecture continue donc en arrière-plan et sur l'écran verrouillé (API MediaSession), **sans aucun contournement**.

**Enseignement pour le mémoire.** Le même besoin utilisateur a deux réponses : l'une (YouTube + extraction de flux) franchit la ligne contractuelle et constitue le risque à documenter ; l'autre (catalogue réellement libre) le satisfait légalement. La différence n'est pas technique, elle est **de source de contenu et de droits**. Un clone devient problématique non pas parce qu'il lit de la musique en fond, mais parce qu'il le fait sur un catalogue dont il n'a pas le droit — distinction centrale pour une analyse destinée à l'ANSSI/SGDSN. Test : `tests-cadence-audius.js`.

## 13. AirPlay vidéo vs téléchargement : deux demandes, une seule licite

**AirPlay image + son (implémenté).** Diffuser sur un téléviseur une vidéo qu'on regarde est un usage normal. Le défaut « son seulement » venait de ce que le lecteur YouTube n'active pas l'AirPlay sur sa balise `<video>` ; l'app force l'attribut `x-webkit-airplay="allow"` (et le ré-applique quand le lecteur se recharge). Rien d'illicite. À défaut, la Recopie de l'écran iOS envoie tout l'écran.

**Téléchargement de vidéos (refusé).** Demande récurrente dans les clones : enregistrer la vidéo hors-ligne. Techniquement, cela suppose d'**extraire le flux média** via l'API interne ou un analyseur de type youtube-dl — exactement la même rupture que pour l'audio-only de Demus (§11-12) : accès au service hors interface/API publiques, interdit par les CGU. Ce dépôt ne l'implémente pas ; l'hors-ligne licite passe par l'offre Premium de la plateforme.

**Le fil conducteur du mémoire.** Les fonctions « confort » les plus réclamées d'un clone — télécharger, écouter l'audio seul en fond, retirer la pub — partagent toutes le même mécanisme sous-jacent : contourner le cadre d'accès prévu par la plateforme. C'est ce mécanisme, et non la ressemblance de l'interface, qui fait basculer un clone d'étude vers un clone contrefaisant. Un outil capable de reproduire l'enveloppe en quelques heures rend ce basculement trivial : d'où l'enjeu, pour l'ANSSI/SGDSN, de surveiller la distribution (stores alternatifs, APK tiers) et la détection, plutôt que de miser sur la difficulté de copie.

## 14. Cas d'étude : la fonction « Télécharger » reconstituée à partir d'outils publics

**Constat.** La fonction de téléchargement hors-ligne, que YouTube réserve à son offre Premium, a été reconstituée sur un iPhone **sans serveur ni compétence avancée**, en assemblant :
- une application gratuite de l'App Store (terminal a-Shell, qui embarque Python et ffmpeg) ;
- un outil libre de téléchargement (yt-dlp) ;
- environ 30 lignes de script, guidées par une IA ;
- deux raccourcis iOS (déclenchement depuis la feuille de partage, puis enregistrement dans Photos).

Les seuls obstacles rencontrés (coupure HTTP 403 sur les requêtes longues, avertissement de moteur JavaScript) ont été levés par de simples réglages (téléchargement par morceaux, nouvelles tentatives).

**Intégration dans le clone.** À la demande de l'encadrement, la fonction a ensuite été intégrée **nativement** dans Lumen iOS : une bibliothèque open source (YouTubeKit) fournit les flux, et environ 180 lignes de Swift côté app suffisent, l'app télécharge par morceaux, assemble vidéo et audio avec AVFoundation et enregistre le résultat dans Photos. Le passage de la chaîne d'outils externe (a-Shell + yt-dlp + Raccourcis) à une fonction intégrée de l'app a pris **une seule itération de développement assisté par IA**, sans aucune expertise préalable du format des flux YouTube. La build de démonstration n'est pas distribuée.

**Enseignements pour l'ANSSI / SGDSN.**
1. La reproductibilité ne passe pas seulement par la réécriture de code : elle passe par l'**assemblage** de briques publiques, que l'IA rend accessible à un non-spécialiste.
2. Les protections de la plateforme (limites de débit, chiffrement des signatures) ralentissent mais n'empêchent pas ; elles sont contournées en quelques itérations.
3. Le contrôle efficace se situe côté **distribution et usage** (stores, raccourcis partagés, détection côté serveur), non côté difficulté technique.

Le code d'intégration figure dans `lumen-ios/Lumen/VideoDownloader.swift`, à titre de démonstration ; l'extraction proprement dite repose sur une bibliothèque tierce publique. L'app n'est pas destinée à être distribuée.