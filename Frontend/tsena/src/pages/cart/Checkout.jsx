import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { orderService } from '@/services/orderService';
import MainLayout from '@/layouts/MainLayout';
import { ArrowLeft, CreditCard, MapPin, Phone, Loader2, Info, Lock } from 'lucide-react';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, getTotal, clearCart } = useCart();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    adresse_livraison: '',
    ville_livraison: '',
    code_postal_livraison: '',
    pays_livraison: 'Madagascar',
    telephone_livraison: '',
    note_client: '',
    frais_livraison: '0.00',
  });

  const [errors, setErrors] = useState({});

  // Rediriger si panier vide
  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  // Rediriger si pas client
  if (user?.user_type !== 'client') {
    navigate('/login');
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.adresse_livraison.trim()) {
      newErrors.adresse_livraison = "L'adresse de livraison est requise";
    }

    if (!formData.ville_livraison.trim()) {
      newErrors.ville_livraison = 'La ville est requise';
    }

    if (!formData.code_postal_livraison.trim()) {
      newErrors.code_postal_livraison = 'Le code postal est requis';
    }

    if (!formData.telephone_livraison.trim()) {
      newErrors.telephone_livraison = 'Le téléphone est requis';
    } else if (!/^[0-9\s+()-]+$/.test(formData.telephone_livraison)) {
      newErrors.telephone_livraison = 'Format de téléphone invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await orderService.createOrderFromCart(formData);
      await clearCart();
      navigate('/order-confirmation', {
        state: { orders: response.commandes, message: response.message },
      });
    } catch (err) {
      console.error('Erreur création commande:', err);
      setError(
        err.response?.data?.error ||
          'Une erreur est survenue lors de la création de la commande'
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const sousTotal = getTotal();

  return (
    <MainLayout>
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Retour */}
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center text-gray-600 hover:text-emerald-600 mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="text-sm">Retour au panier</span>
          </button>

          {/* Titre */}
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Finaliser la commande</h1>

          {/* Erreur */}
          {error && (
            <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-red-900 mb-1">Erreur</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulaire */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-6">
                  <MapPin className="w-5 h-5 text-emerald-500" />
                  <h2 className="text-lg font-bold text-gray-900">Adresse de livraison</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Adresse */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse complète <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="adresse_livraison"
                      value={formData.adresse_livraison}
                      onChange={handleChange}
                      placeholder="123 Rue Exemple, Quartier"
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                        errors.adresse_livraison ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {errors.adresse_livraison && (
                      <p className="mt-1.5 text-sm text-red-600">{errors.adresse_livraison}</p>
                    )}
                  </div>

                  {/* Ville et Code postal */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ville <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="ville_livraison"
                        value={formData.ville_livraison}
                        onChange={handleChange}
                        placeholder="Antananarivo"
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                          errors.ville_livraison ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                      {errors.ville_livraison && (
                        <p className="mt-1.5 text-sm text-red-600">{errors.ville_livraison}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Code postal <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="code_postal_livraison"
                        value={formData.code_postal_livraison}
                        onChange={handleChange}
                        placeholder="101"
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                          errors.code_postal_livraison ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                      {errors.code_postal_livraison && (
                        <p className="mt-1.5 text-sm text-red-600">{errors.code_postal_livraison}</p>
                      )}
                    </div>
                  </div>

                  {/* Pays */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pays <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="pays_livraison"
                      value={formData.pays_livraison}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    >
                      <option value="Madagascar">Madagascar</option>
                      <option value="France">France</option>
                      <option value="Maurice">Maurice</option>
                      <option value="Réunion">Réunion</option>
                    </select>
                  </div>

                  {/* Téléphone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="inline w-4 h-4 mr-1" />
                      Téléphone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="telephone_livraison"
                      value={formData.telephone_livraison}
                      onChange={handleChange}
                      placeholder="+261 34 12 345 67"
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                        errors.telephone_livraison ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {errors.telephone_livraison && (
                      <p className="mt-1.5 text-sm text-red-600">{errors.telephone_livraison}</p>
                    )}
                  </div>

                  {/* Info frais de livraison */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-blue-900 mb-1">
                          Frais de livraison
                        </p>
                        <p className="text-sm text-blue-800 leading-relaxed">
                          Les frais de livraison seront discutés directement avec le vendeur. 
                          Vous serez contacté pour confirmer le montant avant l'expédition.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Note */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Note (optionnelle)
                    </label>
                    <textarea
                      name="note_client"
                      value={formData.note_client}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Instructions spéciales pour la livraison..."
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none transition-colors"
                    />
                  </div>

                  {/* Bouton de soumission - ORANGE */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center font-semibold text-base transition-colors shadow-sm hover:shadow-md"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Création en cours...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 mr-2" />
                        Confirmer la commande
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Récapitulatif */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 sticky top-24">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Récapitulatif</h2>

                {/* Liste des articles */}
                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {cart.map((item) => {
                    const product = item.produit || item;
                    const quantity = item.quantite || item.quantity;
                    const price = product.prix_final || product.prix;

                    return (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white border border-gray-200 rounded overflow-hidden flex-shrink-0">
                          {product.image_principale ? (
                            <img
                              src={product.image_principale}
                              alt={product.nom}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100"></div>
                          )}
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{product.nom}</p>
                          <p className="text-xs text-gray-500">Qté: {quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">{(price * quantity).toLocaleString()} Ar</p>
                      </div>
                    );
                  })}
                </div>

                {/* Totaux */}
                <div className="space-y-3 border-t border-gray-300 pt-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Sous-total ({cart.length} article{cart.length > 1 ? 's' : ''})</span>
                    <span className="font-medium text-gray-900">{sousTotal.toLocaleString()} Ar</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Frais de livraison</span>
                    <span className="text-blue-600 font-medium">À discuter</span>
                  </div>
                  <div className="border-t border-gray-300 pt-3">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-base font-bold text-gray-900">Total estimé</span>
                      <span className="text-xl font-bold text-gray-900">{sousTotal.toLocaleString()} Ar</span>
                    </div>
                    <p className="text-xs text-gray-500 text-right">
                      + frais de livraison
                    </p>
                  </div>
                </div>

                {/* Info sécurité */}
                <div className="mt-6 flex items-center justify-center gap-2 text-gray-600">
                  <Lock className="w-4 h-4" />
                  <p className="text-xs">Paiement sécurisé</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
