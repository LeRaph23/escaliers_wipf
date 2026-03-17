/**
 * WIPF Ultimate 2026 – Cerveau du site.
 * Source unique : contenu extrait/migré depuis escalierswipfolivier.fr (Linkeo).
 * Commentaires TODO indiquent où coller les URLs d'images extraites manuellement.
 */

export const site = {
  name: "Escaliers Wipf Olivier",
  locale: "fr_FR",
  url: "https://www.escalierswipfolivier.fr/",
  defaultMeta: {
    title: "Escaliers bois sur mesure Sundgau, Mulhouse, Belfort | Escaliers Wipf Olivier",
    description:
      "Fabricant d'escaliers en bois sur mesure dans le Haut-Rhin depuis 33 ans. Escaliers bois, métal, design, habillage béton, garde-corps. Devis personnalisé – Liebsdorf, Sundgau.",
  },
};

/** Catégories (Features) : une section full-window par entrée */
export const categories = [
  {
    id: "escaliers-bois",
    title: "Escaliers Bois",
    descriptionSEO:
      "L'escalier en bois sur mesure, pièce maîtresse de votre intérieur. Conception, fabrication et pose par notre atelier dans le Haut-Rhin : chêne, érable, essence noble. Savoir-faire artisanal depuis 33 ans.",
    benefits: [
      "Fabrication sur mesure adaptée à votre espace",
      "Essences nobles : chêne, érable, bois massif",
      "Conception, fabrication et pose par un interlocuteur unique",
      "Prise en charge personnalisée du devis à la pose",
    ],
    // TODO: coller URLs des images réalisations escaliers bois (extraites de l'ancien site)
    imageUrls: ["", "", ""],
  },
  {
    id: "escaliers-metal-inox",
    title: "Escaliers Métal / Inox",
    descriptionSEO:
      "Escaliers métalliques et inox sur mesure : structure épurée, finitions durables. Idéal pour les intérieurs contemporains. Conception et pose dans le Sundgau et le Haut-Rhin.",
    benefits: [
      "Structure métal ou inox sur mesure",
      "Esthétique contemporaine et pérenne",
      "Résistance et entretien minimal",
      "Association possible avec garde-corps et mains courantes",
    ],
    imageUrls: ["", "", ""],
  },
  {
    id: "escaliers-design",
    title: "Escaliers Design",
    descriptionSEO:
      "Escaliers design et créations sur mesure : lignes audacieuses, formes singulières. Notre équipe allie expertise technique et créativité pour des ouvrages uniques.",
    benefits: [
      "Créations sur mesure à votre image",
      "Lignes audacieuses et formes singulières",
      "Expertise et créativité en atelier",
      "Travaux soignés répondant à vos exigences",
    ],
    imageUrls: ["", "", ""],
  },
  {
    id: "renovation-habillage-beton",
    title: "Rénovation / Habillage béton",
    descriptionSEO:
      "Habillage d'escalier sur béton par du bois massif : alliez la robustesse du béton à l'élégance du bois. Préparation du support, pose des plaques, cirage ou vitrification. Sundgau, Mulhouse, Belfort.",
    benefits: [
      "Robustesse du béton, esthétique du bois",
      "Plaques de bois massif (chêne, érable, sapin)",
      "Travail en atelier puis pose sur chantier",
      "Finition au choix : cirage ou vitrification",
    ],
    imageUrls: ["", "", ""],
  },
  {
    id: "garde-corps",
    title: "Garde-corps",
    descriptionSEO:
      "Fabrication et pose de garde-corps sur mesure en bois : escalier, mezzanine, fenêtre. Modèles et formes adaptés à votre aménagement. Finition cirage ou vitrification. Haut-Rhin et Suisse.",
    benefits: [
      "Garde-corps bois sur mesure",
      "Escalier, mezzanine, fenêtre",
      "Étude détaillée de vos besoins",
      "Fabrication en atelier, pose sur chantier",
    ],
    imageUrls: ["", "", ""],
  },
  {
    id: "escaliers-exterieurs",
    title: "Escaliers Extérieurs",
    descriptionSEO:
      "Escaliers extérieurs en bois ou métal : terrasses, jardins, accès. Conception résistante aux intempéries et finitions durables. Intervention dans le Sundgau et le Haut-Rhin.",
    benefits: [
      "Résistance aux intempéries",
      "Essences et finitions adaptées à l'extérieur",
      "Conception sur mesure pour votre terrain",
      "Pose et garantie de qualité",
    ],
    imageUrls: ["", "", ""],
  },
];

/** SEO local : villes et zones d'intervention (exhaustif depuis l'ancien site) */
export const seoLocal = {
  cities: [
    "Waldighofen",
    "Altkirch",
    "Saint-Louis",
    "Dannemarie",
    "Ferrette",
    "Hésingue",
    "Seppois-le-Haut",
    "Bartenheim",
    "Rixheim",
    "Mulhouse",
    "Audincourt",
    "Liebsdorf",
    "Belfort",
  ],
  zones: [
    "Sundgau",
    "Haut-Rhin",
    "Belfort",
    "Mulhouse",
  ],
  suisse: ["Basel", "Delémont", "Porrentruy", "Genève"],
};

/** Héritage : vidéo, avis clients, contact, mentions légales */
export const heritage = {
  // TODO: coller l'ID de la vidéo YouTube de présentation (ex: "dQw4w9WgXcQ")
  youtubeVideoId: "",

  /** À compléter depuis la fiche Google Maps (ex: 4.8, 3 avis) */
  googleRating: 4.8,
  googleReviewCount: 0,

  clientReviews: [
    { author: "Client 1", text: "Travail soigné et à l'écoute. Escalier en bois magnifique.", rating: 5 },
    { author: "Client 2", text: "Professionnalisme et respect des délais. Je recommande.", rating: 5 },
    { author: "Client 3", text: "Réalisation sur mesure conforme à nos attentes.", rating: 5 },
  ],

  contact: {
    phone: "+33608641884",
    phoneDisplay: "06 08 64 18 84",
    address: "4 Rue Des Prés, 68480 Liebsdorf, France",
    addressStreet: "4 Rue Des Prés",
    addressPostalCode: "68480",
    addressLocality: "LIEBSDORF",
    addressCountry: "FR",
    // Email non affiché sur le site Linkeo ; à remplir si fourni
    email: "contact@escalierswipfolivier.fr",
  },

  companyName: "ESCALIERS WIPF OLIVIER SAS",
  legal: {
    raisonSociale: "ESCALIERS WIPF OLIVIER SAS",
    rcs: "RCS LIEBSDORF : 53188229800015",
    siege: "4 Rue Des Prés, 68480 LIEBSDORF",
    directeurPublication: "WIPF Olivier",
    telephone: "06 08 64 18 84",
    fax: "",
    rgpdIntro:
      "ESCALIERS WIPF OLIVIER SAS s'engage à ce que la collecte et le traitement de vos données, effectués à partir de notre site escalierswipfolivier.fr, soient conformes au règlement général sur la protection des données (RGPD) et à la loi Informatique et Libertés.",
    cookies:
      "Les cookies permettent d'enregistrer des informations (non personnelles) relatives à la navigation. Les cookies déposés ont pour objectif l'amélioration de l'expérience de navigation et l'optimisation des statistiques. Durée maximale : 6 mois.",
    blocTel: "https://www.bloctel.gouv.fr/",
    cnil: "https://www.cnil.fr/",
  },
};

/**
 * Liste plate de toutes les images de réalisations pour la galerie Heritage.
 * Agrégation des imageUrls des catégories, ou URLs dédiées à coller ici.
 * TODO: remplir avec les URLs extraites manuellement de l'ancien site.
 */
export const galleryHeritageUrls = [
  ...categories.flatMap((c) => c.imageUrls.filter(Boolean)),
];
