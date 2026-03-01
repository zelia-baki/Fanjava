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
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        icon: Clock,
        description: 'Votre commande a été reçue et est en attente de confirmation'
      },
      confirmed: { 
        label: 'Confirmée', 
        color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        icon: CheckCircle,
        description: 'Votre commande a été confirmée par le vendeur'
      },
      processing: { 
        label: 'En préparation', 
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: Package,
        description: 'Votre commande est en cours de préparation'
      },
      shipped: { 
        label: 'Expédiée', 
        color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        icon: Truck,
        description: 'Votre commande a été expédiée'
      },
      delivered: { 
        label: 'Livrée', 
        color: 'bg-green-100 text-green-700 border-green-200',
        icon: CheckCircle,
        description: 'Votre commande a été livrée'
      },
      cancelled: { 
        label: 'Annulée', 
        color: 'bg-red-100 text-red-700 border-red-200',
        icon: XCircle,
        description: 'Cette commande a été annulée'
      },
    };
    return statusMap[status] || statusMap.pending;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-white flex justify-center items-center">
          <div className="flex items-center gap-3">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            <span className="text-gray-600">Chargement...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!order) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Commande non trouvée</h2>
            <Link
              to="/profile/orders"
              className="text-emerald-600 hover:text-emerald-700 underline"
            >
              Retour à mes commandes
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;

  return (
    <MainLayout>
      <div className="min-h-screen bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <button
            onClick={() => navigate('/profile/orders')}
            className="flex items-center text-gray-600 hover:text-emerald-600 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="text-sm">Retour</span>
          </button>

          {/* Titre et statut */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Commande #{order.numero_commande}
                </h1>
                <p className="text-gray-600 mt-1 text-sm">
                  Passée le {new Date(order.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold ${statusInfo.color}`}>
                <StatusIcon className="w-4 h-4 mr-2" />
                {statusInfo.label}
              </span>
            </div>
          </div>

          {/* Message de statut */}
          <div className={`mb-6 p-4 rounded-lg border ${statusInfo.color}`}>
            <p className="text-sm">
              {statusInfo.description}
            </p>
          </div>

          {/* Numéro de suivi */}
          {order.numero_suivi && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-blue-900">Numéro de suivi</p>
                  <p className="text-blue-800 font-mono text-sm">{order.numero_suivi}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Produits commandés */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2 text-emerald-500" />
                Produits commandés
              </h2>
              <div className="divide-y divide-gray-200">
                {order.lignes && order.lignes.map((ligne) => (
                  <div key={ligne.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      {/* Image du produit */}
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded flex-shrink-0 overflow-hidden border border-gray-200">
                        {ligne.produit?.image_principale ? (
                          <img
                            src={`http://localhost:8000${ligne.produit.image_principale}`}
                            alt={ligne.nom_produit}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400 text-xs">Pas d\'image</div>';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            Pas d'image
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{ligne.nom_produit}</p>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {ligne.quantite} × {parseFloat(ligne.prix_unitaire).toLocaleString()} Ar
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-gray-900 text-sm sm:text-base">
                        {parseFloat(ligne.prix_total).toLocaleString()} Ar
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totaux */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Sous-total</span>
                  <span className="font-medium text-gray-900">{parseFloat(order.montant_total).toLocaleString()} Ar</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Frais de livraison</span>
                  <span className="font-medium text-gray-900">{parseFloat(order.frais_livraison).toLocaleString()} Ar</span>
                </div>
                <div className="flex justify-between text-base sm:text-xl font-bold pt-3 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-gray-900">{parseFloat(order.montant_final).toLocaleString()} Ar</span>
                </div>
              </div>
            </div>

            {/* Informations de livraison */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-emerald-500" />
                Adresse de livraison
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Adresse</p>
                  <p className="font-medium text-gray-900 text-sm sm:text-base">{order.adresse_livraison}</p>
                  <p className="text-gray-700 text-sm">
                    {order.code_postal_livraison} {order.ville_livraison}, {order.pays_livraison}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Téléphone</p>
                    <p className="font-medium text-gray-900 text-sm">{order.telephone_livraison}</p>
                  </div>
                </div>
                {order.note_client && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Votre note</p>
                    <p className="text-gray-700 italic text-sm">"{order.note_client}"</p>
                  </div>
                )}
              </div>
            </div>

            {/* Historique */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Historique</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Commande passée</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
                
                {order.updated_at !== order.created_at && (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Clock className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div>
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
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Besoin d'aide ?</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-4">
                Une question concernant votre commande #{order.numero_commande} ?
              </p>
              <a 
                href={`mailto:support@fanjava.com?subject=Question commande ${order.numero_commande}&body=Bonjour,%0D%0A%0D%0AJ'ai une question concernant ma commande #${order.numero_commande}.%0D%0A%0D%0AMerci`}
                className="inline-block text-emerald-600 hover:text-emerald-700 text-sm font-medium border border-emerald-600 px-6 py-2 rounded-lg hover:bg-emerald-50 transition-colors"
              >
                Contacter le support
              </a>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
