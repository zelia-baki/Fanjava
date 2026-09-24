import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import MainLayout from '@/layouts/MainLayout';
import ProductCard, { ProductCardSkeleton } from '@/components/products/ProductCard';
import BlobImage from '@/components/ui/BlobImage';
import { productService } from '@/services/productService';
import { imageService } from '@/services/imageService';
import useCategories from '@/hooks/useCategories';
import { useSeo } from '@/utils/seo';
import { formatPrix } from '@/utils/format';
import {
  Loader2,
  Filter,
  X,
  Truck,
  ShieldCheck,
  BadgeCheck,
  Headphones,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';

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

const ARGUMENTS = [
  { icon: Truck, titre: 'Livraison à domicile', texte: 'Partout à Madagascar' },
  { icon: ShieldCheck, titre: 'Paiement sécurisé', texte: 'Mobile Money, virement, espèces' },
  { icon: BadgeCheck, titre: 'Vendeurs vérifiés', texte: 'Boutiques approuvées' },
  { icon: Headphones, titre: 'Service client', texte: 'Une équipe à votre écoute' },
];

// Couleurs des tuiles de catégorie sans image
const TEINTES = ['bg-emerald-600', 'bg-gray-900', 'bg-orange-500', 'bg-emerald-800', 'bg-stone-700', 'bg-orange-700'];

function Hero({ vitrine }) {
  return (
    <section className="bg-gray-950 text-white relative overflow-hidden">
      {/* Motifs géométriques */}
      <div className="absolute -right-24 -top-24 w-96 h-96 bg-emerald-600/20 rotate-12" aria-hidden="true" />
      <div className="absolute right-1/3 -bottom-20 w-56 h-56 bg-orange-500/15 -rotate-6" aria-hidden="true" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400 mb-5">
            <span className="w-8 h-0.5 bg-emerald-400" aria-hidden="true" />
            Marketplace 100 % malgache
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] mb-6">
            Le meilleur des vendeurs de Madagascar,{' '}
            <span className="text-emerald-400">livré chez vous.</span>
          </h1>
          <p className="text-gray-300 text-base sm:text-lg max-w-xl mb-8">
            Des milliers de produits de boutiques locales vérifiées. Commandez en quelques clics, payez en toute sécurité.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/?en_promotion=true"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-7 h-13 transition-colors"
            >
              Voir les promotions
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/register/entreprise"
              className="inline-flex items-center border-2 border-white/80 hover:bg-white hover:text-gray-950 text-white font-semibold px-7 h-13 transition-colors"
            >
              Vendre sur FanJava
            </Link>
          </div>
        </div>

        {/* Vitrine : quelques produits du catalogue */}
        {vitrine.length >= 2 && (
          <div className="hidden lg:grid grid-cols-2 gap-3">
            {vitrine.slice(0, 4).map((product, index) => (
              <Link
                key={product.id}
                to={`/products/${product.slug}`}
                className={`group relative block aspect-square overflow-hidden bg-gray-800 ${index === 1 ? 'translate-y-8' : ''} ${
                  index === 2 ? '-translate-y-8' : ''
                }`}
              >
                <BlobImage
                  imageId={product.image_principale_id}
                  alt={product.nom}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-10">
                  <p className="text-sm font-semibold line-clamp-1">{product.nom}</p>
                  <p className="text-emerald-300 font-display font-bold">
                    {formatPrix(product.prix_final || product.prix)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Arguments() {
  return (
    <section className="border-b border-gray-200 bg-white" aria-label="Nos engagements">
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 divide-x divide-gray-200">
        {ARGUMENTS.map((argument) => (
          <div key={argument.titre} className="flex items-center gap-3 px-4 sm:px-6 py-5">
            <div className="w-11 h-11 shrink-0 bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <argument.icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">{argument.titre}</p>
              <p className="text-xs text-gray-500 truncate">{argument.texte}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Categories({ categories }) {
  const principales = categories.filter((cat) => !cat.parent).slice(0, 6);
  if (principales.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
      <div className="flex items-end justify-between mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-950">Parcourir par catégorie</h2>
      </div>
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        {principales.map((cat, index) => (
          <Link
            key={cat.id}
            to={`/?categorie=${cat.id}`}
            className={`group relative aspect-square sm:aspect-[4/5] overflow-hidden ${TEINTES[index % TEINTES.length]}`}
          >
            {cat.has_image && (
              <BlobImage
                path={imageService.categoryImagePath(cat.slug)}
                alt=""
                lazy
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-4 text-white">
              <p className="font-display font-bold text-sm sm:text-lg leading-tight">{cat.nom}</p>
              <p className="text-xs text-white/80 mt-1 flex items-center gap-1 group-hover:gap-2 transition-all">
                {cat.nombre_produits ? `${cat.nombre_produits} produits` : 'Découvrir'}
                <ArrowRight className="w-3.5 h-3.5" />
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categories = useCategories();

  const [products, setProducts] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [vitrine, setVitrine] = useState([]);

  // Champs prix : saisie locale, appliquée à l'URL après un court délai
  const [saisie, setSaisie] = useState({
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

  // Produits mis en avant dans la bannière (vedettes, sinon les plus récents)
  useEffect(() => {
    productService
      .getFeaturedProducts()
      .then((data) => setVitrine((data.results || data).filter((p) => p.image_principale_id)))
      .catch(() => setVitrine([]));
  }, []);
  const vitrineAffichee =
    vitrine.length >= 2 ? vitrine : products.filter((p) => p.image_principale_id && p.stock !== 0);

  // Si l'URL change depuis l'extérieur (logo, bouton précédent…), on resynchronise
  // les champs — sauf pendant une saisie en cours.
  useEffect(() => {
    if (debounceRef.current) return;
    setSaisie({
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
    setSaisie({ prix_min: '', prix_max: '' });
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
  const enPromo = searchParams.get('en_promotion') === 'true';
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

  const titreResultats = recherche
    ? `Résultats pour « ${recherche} »`
    : categorieNom || (enPromo ? 'Promotions du moment' : 'Tous les produits');

  const champ = 'h-10 bg-white border border-gray-300 text-sm px-3 focus:outline-none focus:border-gray-900';

  return (
    <MainLayout>
      <div className="min-h-screen bg-white">
        {!filtresActifs && (
          <>
            <Hero vitrine={vitrineAffichee} />
            <Arguments />
            <Categories categories={categories} />
          </>
        )}

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          {/* En-tête de la liste */}
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <div>
              {filtresActifs ? (
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950">{titreResultats}</h1>
              ) : (
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-950">Nos derniers produits</h2>
              )}
              {!premierChargement && (
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                  {count} produit{count > 1 ? 's' : ''}
                  {loading && <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />}
                </p>
              )}
            </div>
            <select
              name="ordering"
              value={searchParams.get('ordering') || ''}
              onChange={handleSelect}
              aria-label="Trier par"
              className={`${champ} pr-8 cursor-pointer font-medium`}
            >
              {TRIS.map((tri) => (
                <option key={tri.value} value={tri.value}>
                  Trier : {tri.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtres */}
          <div className="flex flex-wrap items-center gap-2 mb-8 p-3 bg-gray-50 border border-gray-200">
            <SlidersHorizontal className="w-4 h-4 text-gray-500 ml-1 mr-1 hidden sm:block" aria-hidden="true" />
            <select
              name="categorie"
              value={searchParams.get('categorie') || ''}
              onChange={handleSelect}
              aria-label="Catégorie"
              className={`${champ} pr-8 cursor-pointer`}
            >
              <option value="">Toutes les catégories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nom}
                </option>
              ))}
            </select>

            <form onSubmit={appliquerSaisie} className="flex items-center">
              <input
                type="number"
                name="prix_min"
                min="0"
                inputMode="numeric"
                value={saisie.prix_min}
                onChange={handleSaisie}
                placeholder="Prix min"
                aria-label="Prix minimum"
                className={`${champ} w-28`}
              />
              <input
                type="number"
                name="prix_max"
                min="0"
                inputMode="numeric"
                value={saisie.prix_max}
                onChange={handleSaisie}
                placeholder="Prix max"
                aria-label="Prix maximum"
                className={`${champ} w-28 border-l-0`}
              />
              <span className="h-10 px-3 flex items-center bg-gray-100 border border-l-0 border-gray-300 text-sm text-gray-500">Ar</span>
            </form>

            <label
              className={`h-10 px-4 flex items-center gap-2 border text-sm cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-emerald-500 ${
                enPromo ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white border-gray-300 text-gray-700 hover:border-gray-900'
              }`}
            >
              <input type="checkbox" name="en_promotion" checked={enPromo} onChange={handleToggle} className="sr-only" />
              Promotions
            </label>

            <label
              className={`h-10 px-4 flex items-center gap-2 border text-sm cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-emerald-500 ${
                searchParams.get('en_stock') === 'true'
                  ? 'bg-gray-900 border-gray-900 text-white'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-gray-900'
              }`}
            >
              <input
                type="checkbox"
                name="en_stock"
                checked={searchParams.get('en_stock') === 'true'}
                onChange={handleToggle}
                className="sr-only"
              />
              En stock
            </label>

            {filtresActifs && (
              <button
                type="button"
                onClick={clearFilters}
                className="h-10 px-3 flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-red-600 ml-auto"
              >
                <X className="w-4 h-4" />
                Tout effacer
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 mb-6 text-sm" role="alert">
              {error}
            </div>
          )}

          {premierChargement ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
              {Array.from({ length: 10 }, (_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-gray-300">
              <Filter className="w-14 h-14 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun produit trouvé</h3>
              <p className="text-gray-500 mb-6">Essayez d'autres termes de recherche ou filtres</p>
              {filtresActifs && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="bg-gray-900 hover:bg-emerald-600 text-white font-semibold px-6 h-11 transition-colors"
                >
                  Effacer les filtres
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Pendant un rechargement, on garde les anciens résultats atténués plutôt qu'un écran vide */}
              <div
                className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5 transition-opacity duration-200 ${
                  loading ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {hasMore && (
                <div className="flex flex-col items-center gap-3 mt-12">
                  <p className="text-xs text-gray-500">
                    {products.length} sur {count} produits affichés
                  </p>
                  <div className="w-48 h-1 bg-gray-200" aria-hidden="true">
                    <div className="h-full bg-emerald-600" style={{ width: `${Math.min(100, (products.length / count) * 100)}%` }} />
                  </div>
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={loadingMore || loading}
                    className="mt-2 flex items-center gap-2 border-2 border-gray-900 hover:bg-gray-900 hover:text-white px-8 h-12 text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                    {loadingMore ? 'Chargement…' : 'Voir plus de produits'}
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* Appel aux vendeurs */}
        {!filtresActifs && (
          <section className="bg-emerald-700 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold mb-2">Vous avez des produits à vendre ?</h2>
                <p className="text-emerald-100">Ouvrez votre boutique sur FanJava et touchez des clients dans tout Madagascar.</p>
              </div>
              <Link
                to="/register/entreprise"
                className="shrink-0 inline-flex items-center gap-2 bg-white text-emerald-800 hover:bg-gray-950 hover:text-white font-semibold px-7 h-12 transition-colors"
              >
                Devenir vendeur
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </section>
        )}
      </div>
    </MainLayout>
  );
}
