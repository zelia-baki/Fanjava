import { useEffect, useState } from 'react';
import { productService } from '@/services/productService';

// Une seule requête par session, partagée par l'en-tête et la page d'accueil
let cache = null;

function chargerCategories() {
  if (!cache) {
    cache = productService
      .getCategories()
      .then((data) => (data.results || data).filter((cat) => cat.active !== false))
      .catch((err) => {
        cache = null; // permet de réessayer plus tard
        throw err;
      });
  }
  return cache;
}

export default function useCategories() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let cancelled = false;
    chargerCategories()
      .then((data) => !cancelled && setCategories(data))
      .catch(() => !cancelled && setCategories([]));
    return () => {
      cancelled = true;
    };
  }, []);

  return categories;
}
