import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { productService } from '@/services/productService';
import { useCart } from '@/context/CartContext';
import ReviewSection from '@/components/reviews/ReviewSection';
import {
  ShoppingCart,
  Star,
  Truck,
  Shield,
  ArrowLeft,
  Plus,
  Minus,
  Loader2,
  Package,
} from 'lucide-react';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getProductBySlug(slug);
      setProduct(data);
      setSelectedImage(data.images?.[0]?.image || data.image_principale);
    } catch (err) {
      console.error('Erreur chargement produit:', err);
      setError('Produit non trouvé');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      setAdding(true);
      await addToCart(product, quantity);
      alert(`${quantity} × ${product.nom} ajouté${quantity > 1 ? 's' : ''} au panier !`);
    } catch (error) {
      alert(error.message || 'Erreur lors de l\'ajout au panier');
    } finally {
      setAdding(false);
    }
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 py-16 flex justify-center items-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-3">Chargement du produit...</span>
        </div>
      </MainLayout>
    );
  }

  if (error || !product) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Produit non trouvé</h2>
          <p className="text-gray-600 mb-6">Le produit que vous recherchez n'existe pas.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Retour à l'accueil
          </button>
        </div>
      </MainLayout>
    );
  }

  const prix = parseFloat(product.prix_final || product.prix);
  const prixOriginal = product.prix_promo ? parseFloat(product.prix) : null;
  const enPromo = product.en_promotion && prixOriginal;

  return (
    <MainLayout>
      {/* 🎨 BACKGROUND ANIMÉ */}
      <div 
        className="min-h-screen"
        style={{
          backgroundImage: 'url(/backgrounds/svg_backgrounds_animated/bg_6_testimonials_animated.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-6 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Images */}
            <div>
              {/* Image principale */}
              <div className="bg-white/95 backdrop-blur-sm rounded-lg overflow-hidden mb-4 aspect-square shadow-lg border border-gray-200">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt={product.nom}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    Pas d'image
                  </div>
                )}
              </div>

              {/* Miniatures */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImage(image.image)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 bg-white/90 backdrop-blur-sm ${
                        selectedImage === image.image
                          ? 'border-blue-600 shadow-lg'
                          : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={image.image}
                        alt={image.alt_text || product.nom}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Informations */}
            <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-gray-200">
              {/* Badges */}
              <div className="flex gap-2 mb-4">
                {enPromo && (
                  <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded">
                    -{Math.round(((prixOriginal - prix) / prixOriginal) * 100)}% PROMO
                  </span>
                )}
                {product.en_vedette && (
                  <span className="bg-yellow-500 text-white text-sm font-bold px-3 py-1 rounded">
                    ⭐ VEDETTE
                  </span>
                )}
              </div>

              {/* Titre */}
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.nom}</h1>

              {/* Entreprise */}
              <p className="text-gray-600 mb-4">
                Vendu par <span className="font-semibold">{product.entreprise_nom}</span>
              </p>

              {/* Note */}
              {product.note_moyenne && parseFloat(product.note_moyenne) > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.round(parseFloat(product.note_moyenne))
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600">
                    {product.note_moyenne} ({product.nombre_avis || 0} avis)
                  </span>
                </div>
              )}

              {/* Prix */}
              <div className="mb-6">
                <div className="flex items-baseline gap-3">
                  <p className="text-4xl font-bold text-blue-600">{prix.toFixed(2)} Ar</p>
                  {enPromo && (
                    <p className="text-xl text-gray-500 line-through">
                      {prixOriginal.toFixed(2)} Ar
                    </p>
                  )}
                </div>
              </div>

              {/* Description courte */}
              {product.description_courte && (
                <p className="text-gray-700 mb-6">{product.description_courte}</p>
              )}

              {/* Stock */}
              <div className="mb-6">
                {product.stock > 10 && (
                  <p className="text-green-600 font-semibold">✓ En stock</p>
                )}
                {product.stock <= 10 && product.stock > 0 && (
                  <p className="text-orange-600 font-semibold">
                    ⚠️ Plus que {product.stock} en stock !
                  </p>
                )}
                {product.stock === 0 && (
                  <p className="text-red-600 font-semibold">✗ Rupture de stock</p>
                )}
              </div>

              {/* Quantité */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantité
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                  <button
                    onClick={incrementQuantity}
                    disabled={quantity >= product.stock}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Bouton Ajouter au panier */}
              <button
                onClick={handleAddToCart}
                disabled={adding || product.stock === 0}
                className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg font-semibold mb-4 shadow-lg"
              >
                {adding ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Ajout en cours...
                  </>
                ) : product.stock === 0 ? (
                  'Rupture de stock'
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Ajouter au panier - {(prix * quantity).toFixed(2)} Ar
                  </>
                )}
              </button>

              {/* Informations de livraison */}
              <div className="space-y-3 border-t pt-6">
                <div className="flex items-center gap-3 text-gray-700">
                  <Truck className="w-5 h-5 text-blue-600" />
                  <span>Livraison à partir de 5 000 Ar</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span>Paiement sécurisé</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description complète */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
            <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-gray-200">
              <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
            </div>
          </div>

          {/* Caractéristiques */}
          {product.poids && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Caractéristiques</h2>
              <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600">Poids:</span>
                    <span className="ml-2 font-semibold">{product.poids} kg</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section Avis */}
          <div className="mt-8">
            <ReviewSection 
              produitId={product.id}
              noteMoyenne={product.note_moyenne}
              nombreAvis={product.nombre_avis}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}