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
            <Loader2 className="mx-auto h-12 w-12 text-emerald-500 animate-spin" />
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (cart.length === 0) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="max-w-md mx-auto px-4 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Votre panier est vide</h2>
            <p className="text-gray-600 mb-8">Découvrez nos produits et commencez vos achats</p>
            <Link
              to="/"
              className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-lg font-medium transition-colors"
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
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Titre simple */}
          <h1 className="text-2xl font-bold text-gray-900 mb-8">
            Panier <span className="text-gray-500 font-normal">({cart.length})</span>
          </h1>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Liste des articles */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => {
                const product = item.produit || item;
                const itemQuantity = item.quantite || item.quantity;
                const itemId = item.id;
                const prixUnitaire = parseFloat(product.prix_final || product.prix);
                const prixTotal = parseFloat(item.prix_total || prixUnitaire * itemQuantity);

                return (
                  <div key={itemId} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start gap-4">
                      {/* Image */}
                      <Link 
                        to={`/products/${product.slug}`}
                        className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200"
                      >
                        {product.image_principale ? (
                          <img
                            src={product.image_principale}
                            alt={product.nom}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                            Pas d'image
                          </div>
                        )}
                      </Link>

                      {/* Détails */}
                      <div className="flex-grow min-w-0">
                        <Link
                          to={`/products/${product.slug}`}
                          className="font-medium text-gray-900 hover:text-emerald-600 transition-colors block truncate"
                        >
                          {product.nom}
                        </Link>
                        <p className="text-sm text-gray-500 mt-0.5">{product.entreprise_nom}</p>
                        
                        {/* Prix unitaire */}
                        <p className="text-sm text-gray-900 font-medium mt-2">
                          {prixUnitaire.toLocaleString()} Ar
                        </p>

                        {/* Alerte stock */}
                        {product.stock && product.stock <= 5 && (
                          <p className="text-xs text-orange-600 mt-1">
                            Plus que {product.stock} en stock
                          </p>
                        )}

                        {/* Quantité + Supprimer (mobile) */}
                        <div className="flex items-center gap-4 mt-3">
                          {/* Contrôles quantité */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(itemId, itemQuantity - 1)}
                              disabled={loading}
                              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-30 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-10 text-center font-medium text-sm">{itemQuantity}</span>
                            <button
                              onClick={() => updateQuantity(itemId, itemQuantity + 1)}
                              disabled={loading || (product.stock && itemQuantity >= product.stock)}
                              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-30 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Bouton supprimer */}
                          <button
                            onClick={() => removeFromCart(itemId)}
                            disabled={loading}
                            className="text-red-500 hover:text-red-600 disabled:opacity-30 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>

                          {/* Sous-total (mobile) */}
                          <div className="ml-auto">
                            <p className="text-base font-bold text-gray-900">
                              {prixTotal.toLocaleString()} Ar
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Récapitulatif */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 sticky top-24">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Récapitulatif</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Sous-total ({cart.length} article{cart.length > 1 ? 's' : ''})</span>
                    <span className="font-medium text-gray-900">{getTotal().toLocaleString()} Ar</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Livraison</span>
                    <span className="text-gray-500">À calculer</span>
                  </div>
                  
                  <div className="border-t border-gray-300 pt-4 mt-4">
                    <div className="flex justify-between items-baseline">
                      <span className="text-base font-bold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-gray-900">{getTotal().toLocaleString()} Ar</span>
                    </div>
                  </div>
                </div>

                {/* Boutons d'action */}
                {user && user.user_type === 'client' ? (
                  <Link
                    to="/checkout"
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-lg flex items-center justify-center font-semibold transition-colors shadow-sm hover:shadow-md"
                  >
                    Passer la commande
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 text-center mb-4">
                      Connectez-vous pour commander
                    </p>
                    <Link
                      to="/login"
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg flex items-center justify-center font-semibold transition-colors"
                    >
                      Se connecter
                    </Link>
                    <Link
                      to="/register/client"
                      className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 flex items-center justify-center font-medium transition-colors"
                    >
                      Créer un compte
                    </Link>
                  </div>
                )}

                {/* Continuer les achats */}
                <Link
                  to="/"
                  className="block text-center text-sm text-emerald-600 hover:text-emerald-700 mt-6 transition-colors"
                >
                  ← Continuer mes achats
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
