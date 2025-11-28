import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productService } from '@/services/productService';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { 
  Star, 
  ShoppingCart, 
  Minus, 
  Plus, 
  ChevronLeft,
  Package,
  Truck,
  Shield
} from 'lucide-react';
import ReviewSection from '@/components/products/ReviewSection';
import ImageGallery from '@/components/products/ImageGallery';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    loadProduct();
  }, [slug]);

  const loadProduct = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await productService.getProductBySlug(slug);
      setProduct(data);
    } catch (err) {
      setError('Produit non trouvé');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (product.stock >= quantity) {
      addToCart(product, quantity);
      alert(`${quantity} × ${product.nom} ajouté(s) au panier!`);
    }
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du produit...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Produit non trouvé</h2>
          <Link to="/" className="text-blue-600 hover:underline">
            Retour à la liste des produits
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images?.length > 0 
    ? product.images.map(img => img.image) 
    : ['/placeholder-product.jpg'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec bouton retour */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ChevronLeft className="h-5 w-5" />
            Retour
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Galerie d'images */}
          <div>
            <ImageGallery images={images} productName={product.nom} />
          </div>

          {/* Informations produit */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            {/* Badges */}
            <div className="flex gap-2 mb-4">
              {product.en_promotion && (
                <span className="px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded">
                  PROMOTION
                </span>
              )}
              {product.en_vedette && (
                <span className="px-3 py-1 bg-yellow-500 text-white text-sm font-semibold rounded">
                  PRODUIT VEDETTE
                </span>
              )}
            </div>

            {/* Titre */}
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              {product.nom}
            </h1>

            {/* Note et avis */}
            {product.note_moyenne > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.note_moyenne)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {product.note_moyenne.toFixed(1)}
                </span>
                <span className="text-sm text-gray-500">
                  ({product.nombre_avis} avis)
                </span>
              </div>
            )}

            {/* Prix */}
            <div className="mb-6">
              {product.prix_promo ? (
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-red-600">
                    {product.prix_final} Ar
                  </span>
                  <span className="text-xl text-gray-500 line-through">
                    {product.prix} Ar
                  </span>
                  <span className="px-2 py-1 bg-red-100 text-red-600 text-sm font-semibold rounded">
                    -{Math.round((1 - product.prix_final / product.prix) * 100)}%
                  </span>
                </div>
              ) : (
                <span className="text-3xl font-bold text-gray-800">
                  {product.prix} Ar
                </span>
              )}
            </div>

            {/* Description courte */}
            <p className="text-gray-600 mb-6">
              {product.description_courte}
            </p>

            {/* Stock */}
            <div className="mb-6">
              {product.stock > 0 ? (
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-green-600" />
                  <span className="text-green-600 font-medium">
                    En stock ({product.stock} disponibles)
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-red-600" />
                  <span className="text-red-600 font-medium">
                    Rupture de stock
                  </span>
                </div>
              )}
              
              {product.stock > 0 && product.stock <= product.seuil_alerte_stock && (
                <p className="text-orange-600 text-sm mt-1">
                  Attention : stock limité !
                </p>
              )}
            </div>

            {/* Sélecteur de quantité */}
            {product.stock > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantité
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                  <span className="text-xl font-semibold w-12 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Boutons d'action */}
            {product.stock > 0 && (
              <div className="flex gap-3 mb-6">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Ajouter au panier
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  Acheter maintenant
                </button>
              </div>
            )}

            {/* Informations supplémentaires */}
            <div className="border-t pt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Truck className="h-5 w-5 text-blue-600" />
                <span>Livraison disponible</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Shield className="h-5 w-5 text-blue-600" />
                <span>Garantie vendeur</span>
              </div>
            </div>

            {/* Vendeur */}
            {product.entreprise_nom && (
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600">
                  Vendu par{' '}
                  <span className="font-semibold text-gray-800">
                    {product.entreprise_nom}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Description détaillée */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Description du produit
          </h2>
          <div className="text-gray-600 whitespace-pre-line">
            {product.description}
          </div>
          
          {/* Caractéristiques */}
          {product.poids && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Caractéristiques
              </h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-gray-600">Poids:</span>
                  <span className="font-medium">{product.poids} kg</span>
                </li>
                {product.sku && (
                  <li className="flex items-center gap-2">
                    <span className="text-gray-600">SKU:</span>
                    <span className="font-medium">{product.sku}</span>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Section des avis */}
        <ReviewSection 
          product={product} 
          user={user}
          onReviewAdded={loadProduct}
        />
      </div>
    </div>
  );
};

export default ProductDetail;