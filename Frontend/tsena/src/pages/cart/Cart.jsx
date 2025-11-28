import { Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import MainLayout from '@/layouts/MainLayout';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';

export default function Cart() {
  const { cart, loading, error, removeFromCart, updateQuantity, getTotal } = useCart();
  const { user } = useAuth();

  if (loading && cart.length === 0) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 text-blue-600 animate-spin" />
            <p className="mt-4 text-gray-600">Chargement du panier...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (cart.length === 0) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <ShoppingBag className="mx-auto h-24 w-24 text-gray-400" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Votre panier est vide</h2>
            <p className="mt-2 text-gray-600">Découvrez nos produits et commencez vos achats</p>
            <Link
              to="/"
              className="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Voir les produits
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Panier ({cart.length} articles)</h1>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Liste des articles */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => {
              const product = item.produit || item; // Support pour les deux formats
              const itemQuantity = item.quantite || item.quantity;
              const itemId = item.id;
              const prixTotal = parseFloat(item.prix_total || (product.prix_final || product.prix) * itemQuantity);

              return (
                <div key={itemId} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center space-x-4">
                    {/* Image */}
                    <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
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
                    </div>

                    {/* Détails */}
                    <div className="flex-grow">
                      <Link
                        to={`/products/${product.slug}`}
                        className="text-lg font-semibold hover:text-blue-600"
                      >
                        {product.nom}
                      </Link>
                      <p className="text-gray-600 text-sm mt-1">{product.entreprise_nom}</p>
                      <p className="text-blue-600 font-bold mt-2">
                        {parseFloat(product.prix_final || product.prix).toFixed(2)} Ar
                      </p>
                      {product.stock && product.stock <= 5 && (
                        <p className="text-orange-500 text-xs mt-1">
                          Plus que {product.stock} en stock !
                        </p>
                      )}
                    </div>

                    {/* Quantité */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(itemId, itemQuantity - 1)}
                        disabled={loading}
                        className="p-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-semibold">{itemQuantity}</span>
                      <button
                        onClick={() => updateQuantity(itemId, itemQuantity + 1)}
                        disabled={loading || (product.stock && itemQuantity >= product.stock)}
                        className="p-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Sous-total */}
                    <div className="text-right min-w-[100px]">
                      <p className="text-lg font-bold text-gray-900">
                        {prixTotal.toFixed(2)} Ar
                      </p>
                    </div>

                    {/* Supprimer */}
                    <button
                      onClick={() => removeFromCart(itemId)}
                      disabled={loading}
                      className="text-red-500 hover:text-red-700 disabled:opacity-50"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Récapitulatif */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-24">
              <h2 className="text-xl font-bold mb-4">Récapitulatif</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span>{getTotal().toFixed(2)} Ar</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Livraison</span>
                  <span>À calculer</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-blue-600">{getTotal().toFixed(2)} Ar</span>
                </div>
              </div>

              {user && user.user_type === 'client' ? (
                <Link
                  to="/checkout"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center font-semibold"
                >
                  Passer la commande
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 text-center">
                    Connectez-vous pour commander
                  </p>
                  <Link
                    to="/login"
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center font-semibold"
                  >
                    Se connecter
                  </Link>
                  <Link
                    to="/register/client"
                    className="w-full bg-gray-100 text-gray-800 py-3 rounded-lg hover:bg-gray-200 flex items-center justify-center font-semibold"
                  >
                    Créer un compte
                  </Link>
                </div>
              )}

              <Link
                to="/"
                className="block text-center text-blue-600 hover:text-blue-700 mt-4"
              >
                Continuer mes achats
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
