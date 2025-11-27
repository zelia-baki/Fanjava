import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { orderService } from '@/services/orderService';
import MainLayout from '@/layouts/MainLayout';
import { MapPin, CreditCard, Package } from 'lucide-react';

export default function Checkout() {
  const { cart, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [adresseData, setAdresseData] = useState({
    adresse_livraison: user?.client?.adresse_livraison || '',
    ville: user?.client?.ville || '',
    code_postal: user?.client?.code_postal || '',
    pays: user?.client?.pays || 'Madagascar',
    telephone: user?.phone || '',
  });

  const handleSubmitOrder = async () => {
    setLoading(true);
    setError('');

    try {
      const orderData = {
        adresse_livraison: adresseData.adresse_livraison,
        ville: adresseData.ville,
        code_postal: adresseData.code_postal,
        pays: adresseData.pays,
        telephone: adresseData.telephone,
        items: cart.map((item) => ({
          produit: item.id,
          quantite: item.quantity,
          prix_unitaire: item.prix_final || item.prix,
        })),
      };

      const response = await orderService.createOrder(orderData);
      clearCart();
      navigate(`/order-confirmation/${response.id}`);
    } catch (err) {
      setError('Erreur lors de la création de la commande');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Finaliser la commande</h1>

        {/* Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div
              className={`flex items-center ${
                step >= 1 ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  step >= 1 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
                }`}
              >
                1
              </div>
              <span className="ml-2 font-medium">Adresse</span>
            </div>

            <div className="w-16 h-0.5 bg-gray-300"></div>

            <div
              className={`flex items-center ${
                step >= 2 ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  step >= 2 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
                }`}
              >
                2
              </div>
              <span className="ml-2 font-medium">Récapitulatif</span>
            </div>

            <div className="w-16 h-0.5 bg-gray-300"></div>

            <div
              className={`flex items-center ${
                step >= 3 ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  step >= 3 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
                }`}
              >
                3
              </div>
              <span className="ml-2 font-medium">Paiement</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulaire */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-6">
                  <MapPin className="w-6 h-6 text-blue-600 mr-2" />
                  <h2 className="text-xl font-bold">Adresse de livraison</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse complète
                    </label>
                    <textarea
                      required
                      value={adresseData.adresse_livraison}
                      onChange={(e) =>
                        setAdresseData({ ...adresseData, adresse_livraison: e.target.value })
                      }
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ville
                      </label>
                      <input
                        type="text"
                        required
                        value={adresseData.ville}
                        onChange={(e) =>
                          setAdresseData({ ...adresseData, ville: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Code postal
                      </label>
                      <input
                        type="text"
                        required
                        value={adresseData.code_postal}
                        onChange={(e) =>
                          setAdresseData({ ...adresseData, code_postal: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      required
                      value={adresseData.telephone}
                      onChange={(e) =>
                        setAdresseData({ ...adresseData, telephone: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pays</label>
                    <input
                      type="text"
                      required
                      value={adresseData.pays}
                      onChange={(e) => setAdresseData({ ...adresseData, pays: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Continuer
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-6">
                  <Package className="w-6 h-6 text-blue-600 mr-2" />
                  <h2 className="text-xl font-bold">Vérification de la commande</h2>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="border-b pb-4">
                    <h3 className="font-semibold mb-2">Adresse de livraison</h3>
                    <p className="text-gray-600">{adresseData.adresse_livraison}</p>
                    <p className="text-gray-600">
                      {adresseData.ville}, {adresseData.code_postal}
                    </p>
                    <p className="text-gray-600">{adresseData.pays}</p>
                    <p className="text-gray-600">Tél: {adresseData.telephone}</p>
                    <button
                      onClick={() => setStep(1)}
                      className="text-blue-600 hover:text-blue-700 text-sm mt-2"
                    >
                      Modifier
                    </button>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Articles commandés</h3>
                    <div className="space-y-2">
                      {cart.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {item.nom} x {item.quantity}
                          </span>
                          <span className="font-medium">
                            {((item.prix_final || item.prix) * item.quantity).toFixed(2)} Ar
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-100 text-gray-800 py-3 rounded-lg hover:bg-gray-200 font-semibold"
                  >
                    Retour
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold"
                  >
                    Continuer vers le paiement
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-6">
                  <CreditCard className="w-6 h-6 text-blue-600 mr-2" />
                  <h2 className="text-xl font-bold">Paiement</h2>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-6">
                  <p className="text-sm">
                    Le paiement en ligne sera disponible prochainement. Pour le moment, le
                    paiement se fait à la livraison.
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center p-4 border-2 border-blue-600 rounded-lg bg-blue-50">
                    <input
                      type="radio"
                      name="payment"
                      checked
                      readOnly
                      className="w-5 h-5 text-blue-600"
                    />
                    <label className="ml-3 flex-1">
                      <span className="font-semibold block">Paiement à la livraison</span>
                      <span className="text-sm text-gray-600">
                        Vous payez en espèces lors de la réception de votre commande
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 bg-gray-100 text-gray-800 py-3 rounded-lg hover:bg-gray-200 font-semibold"
                  >
                    Retour
                  </button>
                  <button
                    onClick={handleSubmitOrder}
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50"
                  >
                    {loading ? 'Traitement...' : 'Confirmer la commande'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Récapitulatif */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-24">
              <h2 className="text-xl font-bold mb-4">Résumé</h2>

              <div className="space-y-2 mb-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.nom} x {item.quantity}
                    </span>
                    <span>{((item.prix_final || item.prix) * item.quantity).toFixed(2)} Ar</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span>{getTotal().toFixed(2)} Ar</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Livraison</span>
                  <span>Gratuite</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-blue-600">{getTotal().toFixed(2)} Ar</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}