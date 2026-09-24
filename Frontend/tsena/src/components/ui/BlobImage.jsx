import { useEffect, useRef, useState } from 'react';
import { loadImageBlobUrl, imageService } from '../../services/imageService';

/**
 * Affiche une image reçue en binaire (blob) depuis le backend.
 *
 * Utiliser l'une des props :
 *  - imageId   : id d'une ImageProduit
 *  - path      : chemin API renvoyant l'image (ex. imageService.categoryImagePath(slug))
 *
 * `fallback` est affiché si aucune image n'est disponible ou si le chargement échoue.
 * `lazy` ne télécharge l'image que lorsqu'elle approche de la zone visible (listes longues).
 */
export default function BlobImage({ imageId, path, alt = '', className, fallback = null, lazy = false, ...props }) {
  const resolvedPath = path || (imageId ? imageService.productImagePath(imageId) : null);
  const [state, setState] = useState({ path: null, src: null, failed: false });
  const [visible, setVisible] = useState(!lazy);
  const [loaded, setLoaded] = useState(false);
  const placeholderRef = useRef(null);

  useEffect(() => {
    if (visible || !placeholderRef.current) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px' }
    );
    observer.observe(placeholderRef.current);
    return () => observer.disconnect();
  }, [visible]);

  useEffect(() => {
    if (!resolvedPath || !visible) return undefined;
    let cancelled = false;

    loadImageBlobUrl(resolvedPath)
      .then((src) => !cancelled && setState({ path: resolvedPath, src, failed: false }))
      .catch(() => !cancelled && setState({ path: resolvedPath, src: null, failed: true }));

    return () => {
      cancelled = true;
    };
  }, [resolvedPath, visible]);

  // Ignore un résultat périmé si l'id a changé entre-temps
  const current = state.path === resolvedPath ? state : null;

  if (!resolvedPath || current?.failed) return fallback;
  if (!current?.src) {
    return <div ref={placeholderRef} className={`${className || ''} bg-gray-100 animate-pulse`} aria-hidden="true" />;
  }
  return (
    <img
      src={current.src}
      alt={alt}
      onLoad={() => setLoaded(true)}
      className={className}
      {...props}
      // Style inline pour ne pas écraser les classes transition-* passées par le parent
      style={{ opacity: loaded ? 1 : 0, transition: 'opacity 300ms ease, transform 300ms ease', ...props.style }}
    />
  );
}
