import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import MainLayout from '@/layouts/MainLayout';
import ProductCard, { ProductCardSkeleton } from '@/components/products/ProductCard';
import { productService } from '@/services/productService';
import { useSeo } from '@/utils/seo';
import { Loader2, Search, Filter, X } from 'lucide-react';

const DELAI_SAISIE_MS = 350;

const TRIS = [
  { value: '', label: 'Plus récents' },
  { value: 'prix_effectif', label: 'Prix croissant' },
  { value: '-prix_effectif', label: 'Prix décroissant' },
  { value: '-note_moyenne', label: 'Mieux notés' },
  { value: '-nombre_ventes', label: 'Meilleures ventes' },
];

// Paramètres d'URL transmis tels quels à l'API
const FILTRES_API = ['search', 'categorie', 'en_promotion', 'en_stock', 'prix_min', 'prix_max', 'ordering'];

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);

  // Champs texte : saisie locale, appliquée à l'URL après un court délai
  const [saisie, setSaisie] = useState({
    search: searchParams.get('search') || '',
    prix_min: searchParams.get('prix_min') || '',
    prix_max: searchParams.get('prix_max') || '',
  });
  const debounceRef = useRef(null);

  const apiParams = () => {
    const params = {};
    FILTRES_API.forEach((key) => {
      const value = searchParams.get(key);
      if (value) params[key] = value;
    });
    return params;
  };

  useEffect(() => {
    productService
      .getCategories()
      .then((data) => setCategories(data.results || data))
      .catch(() => setCategories([]));
  }, []);

  // Recharge la première page à chaque changement de filtre ; la requête
  // précédente est annulée pour qu'une réponse périmée n'écrase pas la nouvelle.
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    productService
      .getProducts(apiParams(), { signal: controller.signal })
      .then((data) => {
        const results = data.results || data;
        setProducts(results);
        setCount(data.count ?? results.length);
        setHasMore(Boolean(data.next));
        setPage(1);
      })
      .catch((err) => {
        if (axios.isCancel(err)) return;
        console.error('Erreur chargement produits:', err);
        setError('Erreur lors du chargement des produits');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Si l'URL change depuis l'extérieur (logo, bouton précédent…), on resynchronise
  // les champs — sauf pendant une saisie en cours.
  useEffect(() => {
    if (debounceRef.current) return;
    setSaisie({
      search: searchParams.get('search') || '',
      prix_min: searchParams.get('prix_min') || '',
      prix_max: searchParams.get('prix_max') || '',
    });
  }, [searchParams]);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const updateParams = (changes) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(changes).forEach(([key, value]) => {
          if (value) next.set(key, value);
          else next.delete(key);
        });
        return next;
      },
      { replace: true }
    );
  };

  const handleSaisie = (e) => {
    const { name, value } = e.target;
    const nouvelle = { ...saisie, [name]: value };
    setSaisie(nouvelle);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      updateParams(nouvelle);
    }, DELAI_SAISIE_MS);
  };

  const appliquerSaisie = (e) => {
    e.preventDefault();
    clearTimeout(debounceRef.current);
    debounceRef.current = null;
    updateParams(saisie);
  };

  const handleToggle = (e) => {
    updateParams({ [e.target.name]: e.target.checked ? 'true' : '' });
  };

  const handleSelect = (e) => {
    updateParams({ [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    clearTimeout(debounceRef.current);
    debounceRef.current = null;
    setSaisie({ search: '', prix_min: '', prix_max: '' });
    setSearchParams({}, { replace: true });
  };

  const loadMore = async () => {
    try {
      setLoadingMore(true);
      const data = await productService.getProducts({ ...apiParams(), page: page + 1 });
      setProducts((prev) => {
        const dejaVus = new Set(prev.map((p) => p.id));
        return [...prev, ...(data.results || []).filter((p) => !dejaVus.has(p.id))];
      });
      setHasMore(Boolean(data.next));
      setPage((p) => p + 1);
    } catch (err) {
      console.error('Erreur chargement produits:', err);
      setError('Impossible de charger plus de produits');
    } finally {
      setLoadingMore(false);
    }
  };

  const filtresActifs = ['search', 'categorie', 'en_promotion', 'en_stock', 'prix_min', 'prix_max'].some((key) =>
    searchParams.get(key)
  );
  const premierChargement = loading && products.length === 0;

  const recherche = searchParams.get('search');
  const categorieNom = categories.find((c) => String(c.id) === searchParams.get('categorie'))?.nom;
  useSeo(
    recherche || categorieNom
      ? {
          title: recherche ? `Résultats pour « ${recherche} »` : categorieNom,
          description: `${recherche ? `Résultats de recherche pour « ${recherche} »` : `Produits de la catégorie ${categorieNom}`} sur FanJava.mg, la marketplace de Madagascar.`,
          path: '/',
        }
      : null,
    [recherche, categorieNom]
  );

  const pill = 'flex items-center gap-2 bg-white px-3 py-2 rounded-md border border-gray-200 text-sm';

  return (
    <MainLayout>
      <div className="min-h-screen bg-white">
        {/* Recherche */}
        <div className="bg-white border-b border-gray-200 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="max-w-4xl mx-auto text-lg sm:text-xl font-semibold text-gray-900 mb-3">
              Achetez en ligne auprès des vendeurs de Madagascar
            </h1>
            <form onSubmit={appliquerSaisie} className="max-w-4xl mx-auto relative" role="search">
              <input
                type="search"
                name="search"
                value={saisie.search}
                onChange={handleSaisie}
                placeholder="Rechercher un produit…"
                aria-label="Rechercher un produit"
                className="w-full pl-5 pr-16 py-3.5 sm:py-4 text-base border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors"
              />
              <button
                type="submit"
                aria-label="Lancer la recherche"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 sm:px-6 py-2 rounded-md transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Filtres */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-6">
            <select
              name="categorie"
              value={searchParams.get('categorie') || ''}
              onChange={handleSelect}
              aria-label="Catégorie"
              className={`${pill} pr-8 cursor-pointer focus:outline-none focus:border-emerald-500`}
            >
              <option value="">Toutes les catégories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nom}
                </option>
              ))}
            </select>

            <form onSubmit={appliquerSaisie} className={pill}>
              <input
                type="number"
                name="prix_min"
                min="0"
                inputMode="numeric"
                value={saisie.prix_min}
                onChange={handleSaisie}
                placeholder="Prix min"
                aria-label="Prix minimum"
                className="w-20 border-0 focus:outline-none p-0"
              />
              <span className="text-gray-300">—</span>
              <input
                type="number"
                name="prix_max"
                min="0"
                inputMode="numeric"
                value={saisie.prix_max}
                onChange={handleSaisie}
                placeholder="Prix max"
                aria-label="Prix maximum"
                className="w-20 border-0 focus:outline-none p-0"
              />
              <span className="text-gray-400">Ar</span>
            </form>

            <label className={`${pill} cursor-pointer hover:border-orange-400 transition-colors`}>
              <input
                type="checkbox"
                name="en_promotion"
                checked={searchParams.get('en_promotion') === 'true'}
                onChange={handleToggle}
                className="w-4 h-4 accent-orange-500"
              />
              <span className="text-gray-700">En promotion</span>
            </label>

            <label className={`${pill} cursor-pointer hover:border-emerald-400 transition-colors`}>
              <input
                type="checkbox"
                name="en_stock"
                checked={searchParams.get('en_stock') === 'true'}
                onChange={handleToggle}
                className="w-4 h-4 accent-emerald-500"
              />
              <span className="text-gray-700">En stock</span>
            </label>

            {filtresActifs && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700"
              >
                <X className="w-4 h-4" />
                Effacer les filtres
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-md mb-6 text-sm" role="alert">
              {error}
            </div>
          )}

          {premierChargement ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {Array.from({ length: 10 }, (_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Aucun résultat</h3>
              <p className="text-gray-500 mb-6">Essayez d'autres termes de recherche ou filtres</p>
              {filtresActifs && (
                <button type="button" onClick={clearFilters} className="text-emerald-600 hover:text-emerald-700 underline">
                  Effacer les filtres
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-200">
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  {count} produit{count > 1 ? 's' : ''}
                  {loading && <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />}
                </p>
                <select
                  name="ordering"
                  value={searchParams.get('ordering') || ''}
                  onChange={handleSelect}
                  aria-label="Trier par"
                  className="text-sm bg-white border border-gray-200 rounded-md px-3 py-1.5 cursor-pointer focus:outline-none focus:border-emerald-500"
                >
                  {TRIS.map((tri) => (
                    <option key={tri.value} value={tri.value}>
                      {tri.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pendant un rechargement, on garde les anciens résultats atténués plutôt qu'un écran vide */}
              <div
                className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 transition-opacity duration-200 ${
                  loading ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {hasMore && (
                <div className="flex flex-col items-center gap-2 mt-10">
                  <p className="text-xs text-gray-500">
                    {products.length} sur {count} produits affichés
                  </p>
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={loadingMore || loading}
                    className="flex items-center gap-2 border border-gray-300 hover:border-emerald-500 hover:text-emerald-600 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                    {loadingMore ? 'Chargement…' : 'Voir plus de produits'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
