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
  Heart,
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
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <span className="ml-3 text-gray-600">Chargement...</span>
        </div>
      </MainLayout>
    );
  }

  if (error || !product) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <Package className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Produit non trouvé</h2>
          <p className="text-gray-600 mb-6">Le produit que vous recherchez n'existe pas.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-emerald-500 text-white px-6 py-3 rounded-lg hover:bg-emerald-600 transition-colors"
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
      {/* 🎨 FOND BLANC PROPRE */}
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb discret */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-emerald-600 mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="text-sm">Retour</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Galerie Images - Simple et épurée */}
            <div>
              {/* Image principale */}
              <div className="bg-gray-50 rounded-xl overflow-hidden mb-4 aspect-square border border-gray-200">
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
                <div className="grid grid-cols-5 gap-2">
                  {product.images.map((image) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImage(image.image)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === image.image
                          ? 'border-emerald-500 scale-105'
                          : 'border-gray-200 hover:border-gray-300'
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

            {/* Informations produit - Épurées */}
            <div>
              {/* Badges minimalistes */}
              <div className="flex gap-2 mb-4">
                {enPromo && (
                  <span className="bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    -{Math.round(((prixOriginal - prix) / prixOriginal) * 100)}%
                  </span>
                )}
                {product.en_vedette && (
                  <span className="bg-yellow-400 text-gray-900 text-xs font-semibold px-3 py-1 rounded-full">
                    ⭐ Vedette
                  </span>
                )}
              </div>

              {/* Titre */}
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.nom}</h1>

              {/* Vendeur */}
              <p className="text-sm text-gray-600 mb-4">
                Vendu par <span className="text-emerald-600 font-medium">{product.entreprise_nom}</span>
              </p>

              {/* Note */}
              {product.note_moyenne && parseFloat(product.note_moyenne) > 0 && (
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.round(parseFloat(product.note_moyenne))
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.note_moyenne} · {product.nombre_avis || 0} avis
                  </span>
                </div>
              )}

              {/* Prix - Grand et visible */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-baseline gap-3">
                  <p className="text-4xl font-bold text-gray-900">{prix.toLocaleString()} Ar</p>
                  {enPromo && (
                    <p className="text-xl text-gray-400 line-through">
                      {prixOriginal.toLocaleString()} Ar
                    </p>
                  )}
                </div>
              </div>

              {/* Description courte */}
              {product.description_courte && (
                <p className="text-gray-700 mb-6 leading-relaxed">{product.description_courte}</p>
              )}

              {/* Stock - Discret */}
              <div className="mb-6">
                {product.stock > 10 && (
                  <p className="text-sm text-emerald-600 font-medium">✓ En stock</p>
                )}
                {product.stock <= 10 && product.stock > 0 && (
                  <p className="text-sm text-orange-600 font-medium">
                    Plus que {product.stock} en stock
                  </p>
                )}
                {product.stock === 0 && (
                  <p className="text-sm text-red-600 font-medium">Rupture de stock</p>
                )}
              </div>

              {/* Quantité - Minimaliste */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantité
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
                  <button
                    onClick={incrementQuantity}
                    disabled={quantity >= product.stock}
                    className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* BOUTON AJOUTER AU PANIER - ORANGE ET ATTRAYANT 🧡 */}
              <button
                onClick={handleAddToCart}
                disabled={adding || product.stock === 0}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] mb-4"
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
                    Ajouter au panier · {(prix * quantity).toLocaleString()} Ar
                  </>
                )}
              </button>

              {/* Infos livraison - Discrètes */}
              <div className="space-y-3 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Truck className="w-5 h-5 text-emerald-500" />
                  <span>Livraison à partir de 5 000 Ar</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Shield className="w-5 h-5 text-emerald-500" />
                  <span>Paiement sécurisé</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description complète - Épurée */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Description</h2>
            <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">{product.description}</p>
            </div>
          </div>

          {/* Caractéristiques */}
          {product.poids && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Caractéristiques</h2>
              <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Poids:</span>
                    <span className="font-semibold text-gray-900">{product.poids} kg</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section Avis */}
          <div className="mt-12">
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
