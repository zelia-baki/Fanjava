import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productService } from '@/services/productService';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import MainLayout from '@/layouts/MainLayout';
import { ShoppingCart, Star, Package, Truck, Shield, ArrowLeft } from 'lucide-react';

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avisForm, setAvisForm] = useState({ note: 5, titre: '', commentaire: '' });
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    loadProduct();
  }, [slug]);

  const loadProduct = async () => {
    try {
      const data = await productService.getProductBySlug(slug);
      setProduct(data);
      setSelectedImage(data.images?.[0]?.image || data.image_principale);
    } catch (error) {
      console.error('Erreur chargement produit:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    alert('Produit ajouté au panier !');
  };

  const handleSubmitAvis = async (e) => {
    e.preventDefault();
    if (!user || user.user_type !== 'client') {
      alert('Vous devez être connecté en tant que client pour laisser un avis');
      return;
    }

    try {
      await productService.createAvis({
        produit: product.id,
        ...avisForm,
      });
      alert('Avis ajouté avec succès !');
      setAvisForm({ note: 5, titre: '', commentaire: '' });
      loadProduct();
    } catch (error) {
      alert('Erreur lors de l\'ajout de l\'avis');
    }
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

  if (!product) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <p>Produit non trouvé</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/" className="flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux produits
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden mb-4">
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

            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(img.image)}
                    className={`aspect-square bg-gray-200 rounded-lg overflow-hidden border-2 ${
                      selectedImage === img.image ? 'border-blue-600' : 'border-transparent'
                    }`}
                  >
                    <img src={img.image} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Détails */}
          <div>
            <h1 className="text-3xl font-bold mb-4">{product.nom}</h1>

            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.note_moyenne)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 text-gray-600">
                ({product.note_moyenne || '0.00'}) - {product.avis?.length || 0} avis
              </span>
            </div>

            <div className="mb-6">
              {product.prix_promo ? (
                <>
                  <span className="text-4xl font-bold text-blue-600">
                    {product.prix_promo} Ar
                  </span>
                  <span className="text-2xl text-gray-500 line-through ml-4">
                    {product.prix} Ar
                  </span>
                  <span className="ml-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                    -{Math.round(((product.prix - product.prix_promo) / product.prix) * 100)}%
                  </span>
                </>
              ) : (
                <span className="text-4xl font-bold text-blue-600">{product.prix} Ar</span>
              )}
            </div>

            <p className="text-gray-700 mb-6">{product.description}</p>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex items-center mb-2">
                <Package className="w-5 h-5 text-gray-600 mr-2" />
                <span className="text-gray-700">
                  Stock: {product.stock > 0 ? `${product.stock} disponibles` : 'Rupture de stock'}
                </span>
              </div>
              <div className="flex items-center mb-2">
                <Truck className="w-5 h-5 text-gray-600 mr-2" />
                <span className="text-gray-700">Livraison disponible</span>
              </div>
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-gray-600 mr-2" />
                <span className="text-gray-700">Garantie vendeur</span>
              </div>
            </div>

            {product.stock > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantité
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="text-xl font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center text-lg font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {product.stock === 0 ? 'Rupture de stock' : 'Ajouter au panier'}
            </button>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Vendu par:</strong> {product.entreprise_nom}
              </p>
            </div>
          </div>
        </div>

        {/* Section Avis */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Avis clients</h2>

          {user && user.user_type === 'client' && (
            <form onSubmit={handleSubmitAvis} className="bg-gray-50 p-6 rounded-lg mb-8">
              <h3 className="text-lg font-semibold mb-4">Laisser un avis</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setAvisForm({ ...avisForm, note: star })}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= avisForm.note
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
                <input
                  type="text"
                  value={avisForm.titre}
                  onChange={(e) => setAvisForm({ ...avisForm, titre: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Commentaire</label>
                <textarea
                  required
                  value={avisForm.commentaire}
                  onChange={(e) => setAvisForm({ ...avisForm, commentaire: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Publier l'avis
              </button>
            </form>
          )}

          <div className="space-y-4">
            {product.avis && product.avis.length > 0 ? (
              product.avis.map((avis) => (
                <div key={avis.id} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < avis.note ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 font-semibold">{avis.client_nom}</span>
                    <span className="ml-auto text-sm text-gray-500">
                      {new Date(avis.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {avis.titre && <h4 className="font-semibold mb-2">{avis.titre}</h4>}
                  <p className="text-gray-700">{avis.commentaire}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">Aucun avis pour ce produit</p>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}