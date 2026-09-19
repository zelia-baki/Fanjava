import { useEffect, useState } from 'react';
import { loadImageBlobUrl, imageService } from '../../services/imageService';

/**
 * Affiche une image reçue en binaire (blob) depuis le backend.
 *
 * Utiliser l'une des props :
 *  - imageId   : id d'une ImageProduit
 *  - path      : chemin API renvoyant l'image (ex. imageService.categoryImagePath(slug))
 *
 * `fallback` est affiché si aucune image n'est disponible ou si le chargement échoue.
 */
export default function BlobImage({ imageId, path, alt = '', className, fallback = null, ...props }) {
  const resolvedPath = path || (imageId ? imageService.productImagePath(imageId) : null);
  const [state, setState] = useState({ path: null, src: null, failed: false });

  useEffect(() => {
    if (!resolvedPath) return undefined;
    let cancelled = false;

    loadImageBlobUrl(resolvedPath)
      .then((src) => !cancelled && setState({ path: resolvedPath, src, failed: false }))
      .catch(() => !cancelled && setState({ path: resolvedPath, src: null, failed: true }));

    return () => {
      cancelled = true;
    };
  }, [resolvedPath]);

  // Ignore un résultat périmé si l'id a changé entre-temps
  const current = state.path === resolvedPath ? state : null;

  if (!resolvedPath || current?.failed) return fallback;
  if (!current?.src) {
    return <div className={`${className || ''} bg-gray-100 animate-pulse`} aria-hidden="true" />;
  }
  return <img src={current.src} alt={alt} className={className} {...props} />;
}
