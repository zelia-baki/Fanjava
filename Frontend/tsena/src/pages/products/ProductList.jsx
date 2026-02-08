import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import ProductCard from '@/components/products/ProductCard';
import { productService } from '@/services/productService';
import { Loader2, Search, Filter } from 'lucide-react';


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
      {/* 🎨 FOND BLANC PROPRE */}
      <div className="min-h-screen bg-white">
        
        {/* 🔍 HERO SEARCH - Style Amazon */}
        <div className="bg-white border-b border-gray-200 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              {/* Grande barre de recherche */}
              <div className="relative">
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Rechercher parmi des milliers de produits..."
                  className="w-full pl-6 pr-14 py-4 text-base border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors"
                />
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-md transition-colors">
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENU PRINCIPAL */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          {/* Filtres horizontaux discrets */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {/* Prix */}
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-md border border-gray-200">
              <input
                type="number"
                name="prix_min"
                value={filters.prix_min}
                onChange={handleFilterChange}
                placeholder="Min"
                className="w-20 text-sm border-0 focus:ring-0 p-0"
              />
              <span className="text-gray-300">—</span>
              <input
                type="number"
                name="prix_max"
                value={filters.prix_max}
                onChange={handleFilterChange}
                placeholder="Max"
                className="w-20 text-sm border-0 focus:ring-0 p-0"
              />
            </div>

            {/* Promo */}
            <label className="flex items-center gap-2 bg-white px-4 py-2 rounded-md border border-gray-200 cursor-pointer hover:border-orange-400 transition-colors">
              <input
                type="checkbox"
                name="en_promotion"
                checked={filters.en_promotion === 'true'}
                onChange={handleFilterChange}
                className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-0"
              />
              <span className="text-sm text-gray-700">En promotion</span>
            </label>

            {/* Reset */}
            {(filters.search || filters.en_promotion || filters.prix_min || filters.prix_max) && (
              <button
                onClick={clearFilters}
                className="text-sm text-emerald-600 hover:text-emerald-700 underline"
              >
                Effacer les filtres
              </button>
            )}
          </div>

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-md mb-6 text-sm">
              {error}
            </div>
          )}

          {/* Résultats */}
          {loading && products.length === 0 ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Aucun résultat
              </h3>
              <p className="text-gray-500 mb-6">
                Essayez d'autres termes de recherche
              </p>
              <button
                onClick={clearFilters}
                className="text-emerald-600 hover:text-emerald-700 underline"
              >
                Effacer les filtres
              </button>
            </div>
          ) : (
            <>
              {/* Compteur simple */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                <p className="text-sm text-gray-600">
                  {products.length} résultat{products.length > 1 ? 's' : ''}
                </p>
                {loading && (
                  <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
                )}
              </div>

              {/* Grille produits épurée */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
