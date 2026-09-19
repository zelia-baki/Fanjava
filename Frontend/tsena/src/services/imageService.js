import api from './api';

// Cache mémoire : chemin API -> Promise<blob URL local>.
// Chaque image n'est téléchargée qu'une fois par session, même si elle
// apparaît à plusieurs endroits de la page.
const cache = new Map();

/**
 * Télécharge une image en binaire depuis le backend et renvoie une URL locale
 * (blob:) utilisable dans <img src>. Le navigateur ne charge jamais d'URL
 * de fichier serveur : il affiche les octets reçus de l'API.
 */
export function loadImageBlobUrl(path) {
  if (!cache.has(path)) {
    const promise = api
      .get(path, { responseType: 'blob' })
      .then((response) => URL.createObjectURL(response.data))
      .catch((error) => {
        cache.delete(path); // permet de réessayer plus tard
        throw error;
      });
    cache.set(path, promise);
  }
  return cache.get(path);
}

export const imageService = {
  productImagePath: (imageId) => `/products/images/${imageId}/blob/`,
  categoryImagePath: (slug) => `/products/categories/${slug}/image/`,
  entrepriseLogoPath: (entrepriseId) => `/users/entreprises/${entrepriseId}/logo/`,
};
