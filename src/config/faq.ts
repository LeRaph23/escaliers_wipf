/**
 * Données FAQ – utilisées pour l’affichage et le schéma FAQPage.
 */

export const faqItems = [
  {
    question: "Intervenez-vous en urgence à Helfrantzkirch et dans le Haut-Rhin ?",
    answer:
      "Oui. SOS Elec assure un dépannage électrique en urgence 7j/7 sur Helfrantzkirch et le Haut-Rhin. En cas de panne, coupure ou danger, appelez-nous pour une intervention rapide.",
  },
  {
    question: "Quels types d’interventions réalisez-vous ?",
    answer:
      "Nous assurons le dépannage électrique, la mise aux normes (tableau, installation), les installations neuves et les rénovations. Toutes nos interventions sont réalisées par un électricien qualifié.",
  },
  {
    question: "Quels sont vos horaires d’ouverture ?",
    answer:
      "Notre bureau est ouvert le lundi de 08h à 12h et de 13h30 à 17h. Pour le dépannage en urgence, nous sommes joignables 7j/7 pour organiser une intervention rapide sur Helfrantzkirch et environs.",
  },
  {
    question: "Comment se déroule une intervention en urgence ?",
    answer:
      "Vous nous appelez, nous évaluons la situation et convenons d’un créneau d’intervention. Nous nous déplaçons à votre domicile ou local pour diagnostiquer et réparer dans les meilleurs délais.",
  },
  {
    question: "Intervenez-vous uniquement à Helfrantzkirch ?",
    answer:
      "Nous sommes basés à Helfrantzkirch (23 Rue Basse) et intervenons dans tout le Haut-Rhin et les communes alentour. N’hésitez pas à nous contacter pour vérifier votre zone.",
  },
  {
    question: "Proposez-vous des devis pour des travaux ?",
    answer:
      "Oui. Pour la mise aux normes, les installations ou les rénovations, nous établissons des devis gratuits. Contactez-nous par téléphone pour décrire votre projet et convenir d’un rendez-vous.",
  },
] as const;

export type FaqItem = (typeof faqItems)[number];
