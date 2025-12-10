import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { 
  ArrowLeft,
  Package,
  MapPin,
  Phone,
  Clock,
  CheckCircle,
  Truck,
  Loader2,
  Mail,
  XCircle
} from 'lucide-react';
import api from '@/services/api';

export default function ClientOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/commandes/${id}/`);
      setOrder(response.data);
    } catch (err) {
      console.error('Erreur chargement commande:', err);
      alert('Erreur lors du chargement de la commande');
      navigate('/profile/orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: { 
        label: 'En attente', 
        color: 'bg-yellow-100 text-yellow-800',
        icon: Clock,
        description: 'Votre commande a été reçue et est en attente de confirmation'
      },
      confirmed: { 
        label: 'Confirmée', 
        color: 'bg-blue-100 text-blue-800',
        icon: CheckCircle,
        description: 'Votre commande a été confirmée par le vendeur'
      },
      processing: { 
        label: 'En préparation', 
        color: 'bg-purple-100 text-purple-800',
        icon: Package,
        description: 'Votre commande est en cours de préparation'
      },
      shipped: { 
        label: 'Expédiée', 
        color: 'bg-indigo-100 text-indigo-800',
        icon: Truck,
        description: 'Votre commande a été expédiée'
      },
      delivered: { 
        label: 'Livrée', 
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
        description: 'Votre commande a été livrée'
      },
      cancelled: { 
        label: 'Annulée', 
        color: 'bg-red-100 text-red-800',
        icon: XCircle,
        description: 'Cette commande a été annulée'
      },
    };
    return statusMap[status] || statusMap.pending;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 py-16 flex justify-center items-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-3">Chargement...</span>
        </div>
      </MainLayout>
    );
  }

  if (!order) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Commande non trouvée</h2>
          <Link
            to="/profile/orders"
            className="mt-4 inline-block text-blue-600 hover:text-blue-700"
          >
            Retour à mes commandes
          </Link>
        </div>
      </MainLayout>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <button
          onClick={() => navigate('/profile/orders')}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Retour à mes commandes
        </button>

        {/* Titre et statut */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Commande #{order.numero_commande}
              </h1>
              <p className="text-gray-600 mt-1">
                Passée le {new Date(order.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${statusInfo.color}`}>
              <StatusIcon className="w-4 h-4 mr-2" />
              {statusInfo.label}
            </span>
          </div>
        </div>

        {/* Message de statut */}
        <div className={`mb-6 p-4 rounded-lg border ${statusInfo.color.replace('text-', 'border-').replace('100', '200')}`}>
          <p className="text-sm font-medium">
            {statusInfo.description}
          </p>
        </div>

        {/* Numéro de suivi */}
        {order.numero_suivi && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <Truck className="w-5 h-5 text-blue-600 mr-2" />
              <div>
                <p className="text-sm font-semibold text-blue-900">Numéro de suivi</p>
                <p className="text-blue-800 font-mono">{order.numero_suivi}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Produits commandés */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2 text-blue-600" />
              Produits commandés
            </h2>
            <div className="divide-y divide-gray-200">
              {order.lignes && order.lignes.map((ligne) => (
                <div key={ligne.id} className="py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Image du produit */}
                    <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                      {ligne.produit?.image_principale ? (
                        <img
                          src={ligne.produit.image_principale}
                          alt={ligne.nom_produit}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          Pas d'image
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{ligne.nom_produit}</p>
                      <p className="text-sm text-gray-600">
                        {ligne.quantite} × {parseFloat(ligne.prix_unitaire).toFixed(2)} Ar
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      {parseFloat(ligne.prix_total).toFixed(2)} Ar
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Totaux */}
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Sous-total</span>
                <span>{parseFloat(order.montant_total).toFixed(2)} Ar</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Frais de livraison</span>
                <span>{parseFloat(order.frais_livraison).toFixed(2)} Ar</span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-2 border-t">
                <span>Total</span>
                <span className="text-blue-600">{parseFloat(order.montant_final).toFixed(2)} Ar</span>
              </div>
            </div>
          </div>

          {/* Informations de livraison */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-blue-600" />
              Adresse de livraison
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Adresse</p>
                <p className="font-medium text-gray-900">{order.adresse_livraison}</p>
                <p className="text-gray-700">
                  {order.code_postal_livraison} {order.ville_livraison}, {order.pays_livraison}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Téléphone</p>
                  <p className="font-medium text-gray-900">{order.telephone_livraison}</p>
                </div>
              </div>
              {order.note_client && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Votre note</p>
                  <p className="text-gray-700 italic">"{order.note_client}"</p>
                </div>
              )}
            </div>
          </div>

          {/* Historique */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Historique</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Commande passée</p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.created_at).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
              
              {order.updated_at !== order.created_at && (
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Dernière mise à jour</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.updated_at).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Besoin d'aide */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <Mail className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Besoin d'aide ?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Vous avez une question concernant votre commande ?
            </p>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Contacter le support
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}