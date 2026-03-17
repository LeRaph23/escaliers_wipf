/**
 * Données SOS Elec – source unique pour meta, JSON-LD, CTA et contenu.
 * Fiche Google Maps : Helfrantzkirch, Haut-Rhin.
 */

export const site = {
  name: "SOS Elec",
  nameFull: "SOS élec / Electricité générale haut-rhin",
  description:
    "Électricien urgence dépannage à Helfrantzkirch et dans le Haut-Rhin. Dépannage 7j/7, mise aux normes, interventions rapides.",
  keyword: "Électricien urgence dépannage Helfrantzkirch",
  locale: "fr_FR",

  url: "https://www.sos-elec.com/",
  /** Image pour partage social (recommandé 1200×630). Créer public/og-image.jpg si besoin. */
  imageOg: "/og-image.jpg",
  phone: "+33672045106",
  phoneDisplay: "06 72 04 51 06",
  email: "soselec68@gmail.com",

  address: {
    streetAddress: "23 Rue Basse",
    addressLocality: "Helfrantzkirch",
    addressRegion: "Haut-Rhin",
    postalCode: "68510",
    addressCountry: "FR",
  },
  addressSingleLine: "23 Rue Basse, 68510 Helfrantzkirch, France",

  geo: {
    latitude: 47.6074772,
    longitude: 7.4148526,
  },

  sameAs: [
    "https://www.google.fr/maps/place/SOS+%C3%A9lec+%2F+Electricit%C3%A9+g%C3%A9n%C3%A9rale+haut-rhin/@47.6074772,7.4148526,17z",
  ],

  openingHours: ["Mo 08:00-12:00", "Mo 13:30-17:00"],
  priceRange: "€€",
  areaServed: ["Helfrantzkirch", "Haut-Rhin"],

  /** À actualiser depuis votre fiche Google Business (Maps). Valeurs affichées sur le site et dans le SEO. */
  googleRating: 4.3,
  googleReviewCount: 45,
} as const;

export type SiteConfig = typeof site;
