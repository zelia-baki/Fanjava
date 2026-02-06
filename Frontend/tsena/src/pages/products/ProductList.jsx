import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import ProductCard from '@/components/products/ProductCard';
import { productService } from '@/services/productService';
import { Loader2, Search, Filter } from 'lucide-react';
import NewYearCountdownCard from '@/components/ui/NewYearCountdownCard';


export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    categorie: searchParams.get('categorie') || '',
    en_promotion: searchParams.get('en_promotion') || '',
    prix_min: searchParams.get('prix_min') || '',
    prix_max: searchParams.get('prix_max') || '',
  });

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Construire les paramètres de requête
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.categorie) params.categorie = filters.categorie;
      if (filters.en_promotion) params.en_promotion = 'true';
      if (filters.prix_min) params.prix_min = filters.prix_min;
      if (filters.prix_max) params.prix_max = filters.prix_max;

      const data = await productService.getProducts(params);
      setProducts(data.results || data);
    } catch (err) {
      console.error('Erreur chargement produits:', err);
      setError('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value, checked, type } = e.target;
    const newValue = type === 'checkbox' ? (checked ? 'true' : '') : value;

    setFilters((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Mettre à jour l'URL
    const newParams = new URLSearchParams(searchParams);
    if (newValue) {
      newParams.set(name, newValue);
    } else {
      newParams.delete(name);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      categorie: '',
      en_promotion: '',
      prix_min: '',
      prix_max: '',
    });
    setSearchParams({});
  };

  return (
    <MainLayout>
      {/* 🎨 BACKGROUND ANIMÉ */}
      <div
        className="min-h-screen"
        style={{
          backgroundImage: 'url(/backgrounds/svg_backgrounds_animated/bg_2_product_animated.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* 🎆 Compte à rebours Nouvel An */}
          <NewYearCountdownCard />

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Nos Produits</h1>
            <p className="text-gray-600">
              Découvrez notre sélection de produits de qualité
            </p>
          </div>

          {/* Barre de recherche et filtres */}
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Recherche */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Rechercher un produit..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Prix min */}
              <div>
                <input
                  type="number"
                  name="prix_min"
                  value={filters.prix_min}
                  onChange={handleFilterChange}
                  placeholder="Prix min"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Prix max */}
              <div>
                <input
                  type="number"
                  name="prix_max"
                  value={filters.prix_max}
                  onChange={handleFilterChange}
                  placeholder="Prix max"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Promotions */}
              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="en_promotion"
                    checked={filters.en_promotion === 'true'}
                    onChange={handleFilterChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">En promotion</span>
                </label>
              </div>
            </div>

            {/* Bouton réinitialiser */}
            {(filters.search || filters.en_promotion || filters.prix_min || filters.prix_max) && (
              <button
                onClick={clearFilters}
                className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Liste des produits */}
          <div className="relative">
            {loading && products.length === 0 ? (
              <div className="flex justify-center items-center py-16 bg-white/80 backdrop-blur-sm rounded-lg">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <span className="ml-3 text-gray-600">Chargement des produits...</span>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm">
                <Filter className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Aucun produit trouvé
                </h3>
                <p className="text-gray-600 mb-4">
                  Essayez de modifier vos critères de recherche
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Voir tous les produits
                </button>
              </div>
            ) : (
              <>
                {loading && (
                  <div className="absolute top-0 right-0 bg-white/80 px-3 py-1 rounded-lg shadow-sm z-10">
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin inline" />
                    <span className="ml-2 text-sm text-gray-600">Recherche...</span>
                  </div>
                )}
                <p className="text-gray-900 font-medium mb-4 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg inline-block">
                  {products.length} produit{products.length > 1 ? 's' : ''} trouvé{products.length > 1 ? 's' : ''}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}