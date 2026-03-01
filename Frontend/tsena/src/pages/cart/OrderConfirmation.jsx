import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { CheckCircle, Package, MapPin, Phone, ArrowRight, Truck, Clock, Mail } from 'lucide-react';

export default function OrderConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();

  const { orders, message } = location.state || {};

  useEffect(() => {
    // Rediriger si pas de commandes
    if (!orders || orders.length === 0) {
      navigate('/');
    }
  }, [orders, navigate]);

  if (!orders || orders.length === 0) {
    return null;
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Message de succès */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-8 mb-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Commande confirmée !
            </h1>
            <p className="text-gray-600 text-lg">
              {message || `${orders.length} commande${orders.length > 1 ? 's' : ''} créée${orders.length > 1 ? 's' : ''} avec succès`}
            </p>
          </div>

          {/* Confirmation email */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900 mb-1">Confirmation par email</p>
                <p className="text-sm text-blue-800">
                  Un email de confirmation vous a été envoyé avec tous les détails de votre commande.
                </p>
              </div>
            </div>
          </div>

          {/* Détails des commandes */}
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-6">
                {/* En-tête */}
                <div className="border-b border-gray-200 pb-4 mb-6">
                  <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
                    <h2 className="text-xl font-bold text-gray-900">
                      Commande #{order.numero_commande}
                    </h2>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
                      {order.status === 'pending' && 'En attente'}
                      {order.status === 'confirmed' && 'Confirmée'}
                      {order.status === 'processing' && 'En préparation'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Créée le {new Date(order.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                {/* Adresse de livraison */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-semibold text-gray-900">Adresse de livraison</h3>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700 space-y-1">
                    <p className="font-medium">{order.adresse_livraison}</p>
                    <p>{order.ville_livraison}, {order.code_postal_livraison}</p>
                    <p>{order.pays_livraison}</p>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <p>{order.telephone_livraison}</p>
                    </div>
                  </div>
                </div>

                {/* Produits commandés */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-semibold text-gray-900">Produits commandés</h3>
                  </div>
                  <div className="space-y-2">
                    {order.lignes && order.lignes.map((ligne) => (
                      <div
                        key={ligne.id}
                        className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3"
                      >
                        <div className="flex-grow">
                          <p className="font-medium text-gray-900 text-sm">{ligne.nom_produit}</p>
                          <p className="text-sm text-gray-600">
                            {ligne.quantite} × {parseFloat(ligne.prix_unitaire).toLocaleString()} Ar
                          </p>
                        </div>
                        <p className="font-semibold text-gray-900">
                          {parseFloat(ligne.prix_total).toLocaleString()} Ar
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totaux */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Sous-total</span>
                      <span className="font-medium text-gray-900">{parseFloat(order.montant_total).toLocaleString()} Ar</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Frais de livraison</span>
                      <span className="font-medium text-gray-900">{parseFloat(order.frais_livraison).toLocaleString()} Ar</span>
                    </div>
                    <div className="flex justify-between items-baseline pt-3 border-t border-gray-200">
                      <span className="text-base font-bold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-gray-900">
                        {parseFloat(order.montant_final).toLocaleString()} Ar
                      </span>
                    </div>
                  </div>
                </div>

                {/* Note client */}
                {order.note_client && (
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Note: </span>
                      {order.note_client}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="flex items-center justify-center px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors shadow-sm"
            >
              Continuer mes achats
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              to="/profile/orders"
              className="flex items-center justify-center px-8 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              <Package className="w-5 h-5 mr-2" />
              Voir mes commandes
            </Link>
          </div>

          {/* Timeline de suivi */}
          <div className="mt-10 bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-6 text-center">Que se passe-t-il maintenant ?</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Commande reçue</p>
                  <p className="text-sm text-gray-600">Nous avons bien reçu votre commande</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Préparation</p>
                  <p className="text-sm text-gray-600">Votre commande sera préparée par le vendeur</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Notification d'expédition</p>
                  <p className="text-sm text-gray-600">Vous recevrez un email dès l'expédition</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <Truck className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Livraison</p>
                  <p className="text-sm text-gray-600">Estimée sous 3-5 jours ouvrés</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
