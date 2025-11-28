import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { CheckCircle, Package, MapPin, Phone, Mail, ArrowRight } from 'lucide-react';

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Message de succès */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
            Commande confirmée !
          </h1>
          <p className="text-center text-gray-600 text-lg">
            {message || `${orders.length} commande(s) créée(s) avec succès`}
          </p>
        </div>

        {/* Informations importantes */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="font-semibold text-blue-900 mb-2">📧 Confirmation par email</h2>
          <p className="text-blue-800 text-sm">
            Un email de confirmation vous a été envoyé avec tous les détails de votre commande.
          </p>
        </div>

        {/* Détails des commandes */}
        <div className="space-y-6">
          {orders.map((order, index) => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* En-tête de la commande */}
              <div className="border-b pb-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-bold text-gray-900">
                    Commande #{order.numero_commande}
                  </h2>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                    {order.status === 'pending' && 'En attente'}
                    {order.status === 'confirmed' && 'Confirmée'}
                    {order.status === 'processing' && 'En préparation'}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">
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
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-gray-600" />
                  Adresse de livraison
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
                  <p>{order.adresse_livraison}</p>
                  <p>{order.ville_livraison}, {order.code_postal_livraison}</p>
                  <p>{order.pays_livraison}</p>
                  <p className="mt-2 flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    {order.telephone_livraison}
                  </p>
                </div>
              </div>

              {/* Produits commandés */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-gray-600" />
                  Produits commandés
                </h3>
                <div className="space-y-3">
                  {order.lignes && order.lignes.map((ligne) => (
                    <div
                      key={ligne.id}
                      className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                    >
                      <div className="flex-grow">
                        <p className="font-medium text-gray-900">{ligne.nom_produit}</p>
                        <p className="text-sm text-gray-600">
                          Quantité: {ligne.quantite} × {parseFloat(ligne.prix_unitaire).toFixed(2)} Ar
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        {parseFloat(ligne.prix_total).toFixed(2)} Ar
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totaux */}
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Sous-total</span>
                    <span>{parseFloat(order.montant_total).toFixed(2)} Ar</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Frais de livraison</span>
                    <span>{parseFloat(order.frais_livraison).toFixed(2)} Ar</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
                    <span>Total</span>
                    <span className="text-blue-600">
                      {parseFloat(order.montant_final).toFixed(2)} Ar
                    </span>
                  </div>
                </div>
              </div>

              {/* Note client */}
              {order.note_client && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
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
            className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Continuer mes achats
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
          <Link
            to="/profile/orders"
            className="flex items-center justify-center px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
          >
            <Package className="w-5 h-5 mr-2" />
            Voir mes commandes
          </Link>
        </div>

        {/* Informations de suivi */}
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <h3 className="font-semibold text-gray-900 mb-2">Que se passe-t-il maintenant ?</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>✅ Nous avons bien reçu votre commande</p>
            <p>📦 Votre commande sera préparée par le vendeur</p>
            <p>🚚 Vous recevrez un email dès l'expédition</p>
            <p>📬 Livraison estimée sous 3-5 jours ouvrés</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
