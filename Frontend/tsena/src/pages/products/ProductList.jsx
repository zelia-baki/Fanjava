import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '@/services/productService';
import { useCart } from '@/context/CartContext';
import MainLayout from '@/layouts/MainLayout';
import { Search, Filter, ShoppingCart, Star } from 'lucide-react';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const { addToCart } = useCart();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        productService.getProducts(),
        productService.getCategories(),
      ]);
      setProducts(Array.isArray(productsData) ? productsData : (productsData.results || []));
      setCategories(Array.isArray(categoriesData) ? categoriesData : (categoriesData.results || []));
    } catch (error) {
      console.error('Erreur chargement:', error);
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = {
        search,
        categorie: selectedCategory,
        prix_min: priceRange.min,
        prix_max: priceRange.max,
      };
      const data = await productService.getProducts(params);
      setProducts(Array.isArray(data) ? data : (data.results || []));
    } catch (error) {
      console.error('Erreur recherche:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    alert('Produit ajouté au panier !');
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl">Chargement...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section recherche et filtres */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Toutes les catégories</option>
                {Array.isArray(categories) && categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <button
                onClick={handleSearch}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtrer
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <input
              type="number"
              placeholder="Prix min"
              value={priceRange.min}
              onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Prix max"
              value={priceRange.max}
              onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Liste des produits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.isArray(products) && products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <Link to={`/products/${product.slug}`}>
                <div className="aspect-square bg-gray-200 rounded-t-lg overflow-hidden">
                  {product.image_principale ? (
                    <img
                      src={product.image_principale}
                      alt={product.nom}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      Pas d'image
                    </div>
                  )}
                </div>
              </Link>

              <div className="p-4">
                <Link to={`/products/${product.slug}`}>
                  <h3 className="font-semibold text-lg mb-2 hover:text-blue-600 line-clamp-2">
                    {product.nom}
                  </h3>
                </Link>

                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {product.description_courte}
                </p>

                <div className="flex items-center mb-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600 ml-1">
                    {product.note_moyenne || '0.00'}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div>
                    {product.prix_promo ? (
                      <>
                        <span className="text-lg font-bold text-blue-600">
                          {product.prix_promo} Ar
                        </span>
                        <span className="text-sm text-gray-500 line-through ml-2">
                          {product.prix} Ar
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-blue-600">
                        {product.prix} Ar
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock === 0}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {product.stock === 0 ? 'Rupture de stock' : 'Ajouter au panier'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Aucun produit trouvé</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}