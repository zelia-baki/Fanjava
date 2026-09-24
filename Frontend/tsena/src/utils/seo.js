import { useEffect } from 'react';

export const SITE_URL = 'https://fanjava.mg';
export const SITE_NAME = 'FanJava.mg';
export const DEFAULT_TITLE = `${SITE_NAME} – Marketplace en ligne à Madagascar`;
export const DEFAULT_DESCRIPTION =
  'FanJava.mg, la marketplace multi-vendeurs de Madagascar : achetez en ligne les produits de vendeurs locaux vérifiés, avec paiement sécurisé et livraison.';
export const DEFAULT_IMAGE = `${SITE_URL}/Fanja.png`;

// Pages privées ou techniques : jamais indexées
const PREFIXES_PRIVES = [
  '/admin', '/dashboard', '/entreprise', '/profile', '/cart', '/checkout',
  '/order-confirmation', '/myreviews', '/notifications', '/reset-password', '/verify-email',
];

// Titre et description par défaut des pages publiques sans données dynamiques
const PAGES = {
  '/login': { title: 'Connexion', description: 'Connectez-vous à votre compte FanJava.mg pour suivre vos commandes et acheter en ligne.' },
  '/register/client': { title: 'Créer un compte client', description: 'Créez votre compte client FanJava.mg gratuitement et achetez auprès des vendeurs de Madagascar.' },
  '/register/entreprise': { title: 'Devenir vendeur', description: 'Vendez vos produits en ligne à Madagascar : créez votre boutique sur FanJava.mg.' },
  '/forgot-password': { title: 'Mot de passe oublié', description: 'Réinitialisez le mot de passe de votre compte FanJava.mg.' },
  '/contact': { title: 'Contact', description: 'Contactez l’équipe FanJava.mg : questions, commandes, partenariats vendeurs.' },
  '/faq': { title: 'Questions fréquentes', description: 'Réponses aux questions fréquentes sur les commandes, paiements et livraisons FanJava.mg.' },
  '/shipping': { title: 'Livraison et retours', description: 'Conditions de livraison et de retour des commandes passées sur FanJava.mg.' },
  '/terms': { title: 'Conditions d’utilisation', description: 'Conditions générales d’utilisation de la marketplace FanJava.mg.' },
  '/privacy': { title: 'Confidentialité', description: 'Politique de confidentialité et protection des données personnelles sur FanJava.mg.' },
};

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function setJsonLd(data) {
  const id = 'page-jsonld';
  document.getElementById(id)?.remove();
  if (!data) return;
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = id;
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

/** Met à jour <title>, description, canonical, Open Graph, robots et JSON-LD de la page courante. */
export function applySeo({ title, description, path = '/', image, type = 'website', noindex = false, jsonLd = null }) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const desc = (description || DEFAULT_DESCRIPTION).replace(/\s+/g, ' ').trim().slice(0, 160);
  const url = `${SITE_URL}${path}`;

  document.title = fullTitle;
  setMeta('name', 'description', desc);
  setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
  setCanonical(url);
  setMeta('property', 'og:title', fullTitle);
  setMeta('property', 'og:description', desc);
  setMeta('property', 'og:url', url);
  setMeta('property', 'og:type', type);
  setMeta('property', 'og:image', image || DEFAULT_IMAGE);
  setJsonLd(jsonLd);
}

/** Métadonnées par défaut selon l'URL (appelé à chaque navigation, avant celles de la page). */
export function applyRouteSeo(pathname) {
  const noindex = PREFIXES_PRIVES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  const page = PAGES[pathname] || {};
  applySeo({ ...page, path: pathname, noindex });
}

/** Métadonnées spécifiques d'une page (ex. fiche produit une fois chargée). */
export function useSeo(meta, deps) {
  useEffect(() => {
    if (meta) applySeo(meta);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
