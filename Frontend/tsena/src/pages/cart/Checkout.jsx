import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { orderService } from '@/services/orderService';
import MainLayout from '@/layouts/MainLayout';
import { ArrowLeft, CreditCard, MapPin, Phone, User, Loader2, Info } from 'lucide-react';

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
    frais_livraison: '0.00', // À discuter avec l'entreprise
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
    // Effacer l'erreur du champ modifié
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
      // Créer la commande via l'API
      const response = await orderService.createOrderFromCart(formData);

      // Vider le panier local
      await clearCart();

      // Rediriger vers la page de confirmation
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

  const fraisLivraison = parseFloat(formData.frais_livraison);
  const sousTotal = getTotal();
  const total = sousTotal + fraisLivraison;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Retour au panier
        </button>

        <h1 className="text-3xl font-bold mb-8">Finaliser la commande</h1>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-semibold">Erreur</p>
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulaire d'adresse */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center">
                <MapPin className="w-6 h-6 mr-2 text-blue-600" />
                Adresse de livraison
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Adresse */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse complète *
                  </label>
                  <input
                    type="text"
                    name="adresse_livraison"
                    value={formData.adresse_livraison}
                    onChange={handleChange}
                    placeholder="123 Rue Exemple, Quartier"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.adresse_livraison ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.adresse_livraison && (
                    <p className="mt-1 text-sm text-red-600">{errors.adresse_livraison}</p>
                  )}
                </div>

                {/* Ville et Code postal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ville *
                    </label>
                    <input
                      type="text"
                      name="ville_livraison"
                      value={formData.ville_livraison}
                      onChange={handleChange}
                      placeholder="Antananarivo"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.ville_livraison ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.ville_livraison && (
                      <p className="mt-1 text-sm text-red-600">{errors.ville_livraison}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Code postal *
                    </label>
                    <input
                      type="text"
                      name="code_postal_livraison"
                      value={formData.code_postal_livraison}
                      onChange={handleChange}
                      placeholder="101"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.code_postal_livraison ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.code_postal_livraison && (
                      <p className="mt-1 text-sm text-red-600">{errors.code_postal_livraison}</p>
                    )}
                  </div>
                </div>

                {/* Pays */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pays *
                  </label>
                  <select
                    name="pays_livraison"
                    value={formData.pays_livraison}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    name="telephone_livraison"
                    value={formData.telephone_livraison}
                    onChange={handleChange}
                    placeholder="+261 34 12 345 67"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.telephone_livraison ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.telephone_livraison && (
                    <p className="mt-1 text-sm text-red-600">{errors.telephone_livraison}</p>
                  )}
                </div>

                {/* Info frais de livraison */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <Info className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900 mb-1">
                        Frais de livraison
                      </p>
                      <p className="text-sm text-blue-800">
                        Les frais de livraison seront discutés directement avec l'entreprise vendeuse. 
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Bouton de soumission */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center font-semibold text-lg"
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

          {/* Récapitulatif de la commande */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Récapitulatif</h2>

              {/* Liste des articles */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {cart.map((item) => {
                  const product = item.produit || item;
                  const quantity = item.quantite || item.quantity;
                  const price = product.prix_final || product.prix;

                  return (
                    <div key={item.id} className="flex items-center space-x-3 text-sm">
                      <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0">
                        {product.image_principale && (
                          <img
                            src={product.image_principale}
                            alt={product.nom}
                            className="w-full h-full object-cover rounded"
                          />
                        )}
                      </div>
                      <div className="flex-grow">
                        <p className="font-medium text-gray-900">{product.nom}</p>
                        <p className="text-gray-500">Qté: {quantity}</p>
                      </div>
                      <p className="font-semibold">{(price * quantity).toFixed(2)} Ar</p>
                    </div>
                  );
                })}
              </div>

              {/* Totaux */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span>{sousTotal.toFixed(2)} Ar</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Frais de livraison</span>
                  <span className="text-sm text-blue-600">À discuter</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-xl font-bold">
                  <span>Total estimé</span>
                  <span className="text-blue-600">{sousTotal.toFixed(2)} Ar</span>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  + frais de livraison (à confirmer)
                </p>
              </div>

              {/* Info sécurité */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-600 text-center">
                  🔒 Vos informations sont sécurisées
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}