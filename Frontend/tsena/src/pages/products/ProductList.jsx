import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productService } from '@/services/productService';
import { useCart } from '@/context/CartContext';
import { Star, ShoppingCart, Search, Filter, X } from 'lucide-react';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  
 const [filters, setFilters] = useState({
  search: searchParams.get('search') || '',
  categorie: searchParams.get('categorie') || '',
  prix_min: searchParams.get('prix_min') || '',
  prix_max: searchParams.get('prix_max') || '',
  en_vedette: searchParams.get('en_vedette') === 'true',
  status: searchParams.get('status') || '', 
});
  
  const [showFilters, setShowFilters] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [searchParams]);

  const loadCategories = async () => {
    try {
      const data = await productService.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Erreur chargement catégories:', err);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = Object.fromEntries(searchParams);
      const data = await productService.getProducts(params);
      setProducts(data.results || data);
    } catch (err) {
      setError('Erreur lors du chargement des produits');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    const params = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params[key] = value;
    });
    setSearchParams(params);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      categorie: '',
      prix_min: '',
      prix_max: '',
      en_promotion: false,
      en_vedette: false,
    });
    setSearchParams({});
  };

  const handleAddToCart = (product) => {
    if (product.stock > 0) {
      addToCart(product);
      alert(`${product.nom} ajouté au panier!`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des produits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Nos Produits</h1>
            
            {/* Barre de recherche */}
            <div className="flex-1 max-w-xl mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                  className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Bouton filtres */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Filter className="h-5 w-5" />
              Filtres
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Panel de filtres */}
        {showFilters && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Filtres</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Catégorie */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie
                </label>
                <select
                  value={filters.categorie}
                  onChange={(e) => handleFilterChange('categorie', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Toutes les catégories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nom}
                    </option>
                  ))}
                </select>
              </div>

              {/* Prix min */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix minimum
                </label>
                <input
                  type="number"
                  value={filters.prix_min}
                  onChange={(e) => handleFilterChange('prix_min', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Prix max */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix maximum
                </label>
                <input
                  type="number"
                  value={filters.prix_max}
                  onChange={(e) => handleFilterChange('prix_max', e.target.value)}
                  placeholder="10000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Checkboxes */}
              <div className="flex flex-col gap-2">
               <label className="flex items-center gap-2 cursor-pointer">
  <input
    type="checkbox"
    checked={filters.en_vedette}
    onChange={(e) => handleFilterChange('en_vedette', e.target.checked)}
    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
  />
  <span className="text-sm text-gray-700">Produits vedettes</span>
</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.en_vedette}
                    onChange={(e) => handleFilterChange('en_vedette', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Produits vedettes</span>
                </label>
              </div>
            </div>
            <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Statut
  </label>
  <select
    value={filters.status}
    onChange={(e) => handleFilterChange('status', e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
  >
    <option value="">Tous</option>
    <option value="active">Actifs</option>
    <option value="draft">Brouillon</option>
    <option value="inactive">Inactifs</option>
  </select>
</div>

            {/* Boutons d'action */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={applyFilters}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Appliquer les filtres
              </button>
              <button
                onClick={clearFilters}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        )}

        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Liste des produits */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Aucun produit trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Image */}
                <Link to={`/products/${product.slug}`}>
                  <div className="relative h-64 bg-gray-200">
                    {product.image_principale ? (
                      <img
                        src={product.image_principale}
                        alt={product.nom}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        Pas d'image
                      </div>
                    )}
                    
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-2">
                      {product.en_promotion && (
                        <span className="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded">
                          PROMO
                        </span>
                      )}
                      {product.en_vedette && (
                        <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-semibold rounded">
                          VEDETTE
                        </span>
                      )}
                      {product.stock === 0 && (
                        <span className="px-2 py-1 bg-gray-500 text-white text-xs font-semibold rounded">
                          RUPTURE
                        </span>
                      )}
                    </div>
                  </div>
                </Link>

                {/* Contenu */}
                <div className="p-4">
                  <Link to={`/products/${product.slug}`}>
                    <h3 className="text-lg font-semibold text-gray-800 hover:text-blue-600 mb-2">
                      {product.nom}
                    </h3>
                  </Link>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.description_courte}
                  </p>

                  {/* Note */}
                  {product.note_moyenne > 0 && (
                    <div className="flex items-center gap-1 mb-3">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium text-gray-700">
                        {product.note_moyenne.toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({product.nombre_avis || 0} avis)
                      </span>
                    </div>
                  )}

                  {/* Prix */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      {product.prix_promo ? (
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-red-600">
                            {product.prix_final} Ar
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            {product.prix} Ar
                          </span>
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-gray-800">
                          {product.prix} Ar
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bouton ajouter au panier */}
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium ${
                      product.stock === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {product.stock === 0 ? 'Rupture de stock' : 'Ajouter au panier'}
                  </button>

                  {/* Stock faible */}
                  {product.stock > 0 && product.stock <= 5 && (
                    <p className="text-xs text-orange-600 mt-2 text-center">
                      Plus que {product.stock} en stock
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;