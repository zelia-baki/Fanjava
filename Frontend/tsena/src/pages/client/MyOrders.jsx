import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { orderService } from '@/services/orderService';
import { Package, Loader2, ChevronRight, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getOrders();
      setOrders(data.results || data);
    } catch (err) {
      console.error('Erreur chargement commandes:', err);
      setError('Erreur lors du chargement de vos commandes');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock, label: 'En attente' },
      confirmed: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle, label: 'Confirmée' },
      processing: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Package, label: 'En préparation' },
      shipped: { bg: 'bg-indigo-100', text: 'text-indigo-700', icon: Truck, label: 'Expédiée' },
      delivered: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Livrée' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Annulée' },
      refunded: { bg: 'bg-gray-100', text: 'text-gray-700', icon: XCircle, label: 'Remboursée' },
    };

    const style = styles[status] || styles.pending;
    const Icon = style.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${style.bg} ${style.text}`}>
        <Icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
        {style.label}
      </span>
    );
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

  return (
    <MainLayout>
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Mes commandes</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {orders.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="h-10 w-10 text-gray-400" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Aucune commande</h2>
              <p className="text-gray-600 mb-8">Vous n'avez pas encore passé de commande</p>
              <Link
                to="/"
                className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Découvrir nos produits
              </Link>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  {/* Header de la commande */}
                  <div className="bg-gray-50 px-4 sm:px-6 py-4 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                          Commande #{order.numero_commande}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                          {new Date(order.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                        {getStatusBadge(order.status)}
                        <p className="text-base sm:text-lg font-bold text-gray-900">
                          {parseFloat(order.montant_final).toLocaleString()} Ar
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contenu de la commande */}
                  <div className="px-4 sm:px-6 py-4">
                    {/* Adresse de livraison */}
                    <div className="mb-4">
                      <p className="text-xs sm:text-sm text-gray-600">
                        <span className="font-semibold">Livraison :</span> {order.adresse_livraison}, {order.ville_livraison}
                      </p>
                    </div>

                    {/* Produits */}
                    <div className="space-y-3 mb-4">
                      {order.lignes && order.lignes.slice(0, 3).map((ligne) => (
                        <div key={ligne.id} className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded border border-gray-200 flex-shrink-0"></div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 text-sm truncate">{ligne.nom_produit}</p>
                              <p className="text-xs sm:text-sm text-gray-600">Qté: {ligne.quantite}</p>
                            </div>
                          </div>
                          <p className="font-semibold text-gray-900 text-sm flex-shrink-0">
                            {parseFloat(ligne.prix_total).toLocaleString()} Ar
                          </p>
                        </div>
                      ))}
                      {order.lignes && order.lignes.length > 3 && (
                        <p className="text-xs sm:text-sm text-gray-600">
                          + {order.lignes.length - 3} autre{order.lignes.length - 3 > 1 ? 's' : ''} article{order.lignes.length - 3 > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>

                    {/* Numéro de suivi */}
                    {order.numero_suivi && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-4">
                        <p className="text-xs sm:text-sm text-blue-900">
                          <span className="font-semibold">Numéro de suivi :</span> {order.numero_suivi}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                      <Link
                        to={`/profile/orders/${order.id}`}
                        className="flex items-center justify-center px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors text-sm"
                      >
                        Voir les détails
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Link>
                      {order.status === 'delivered' && (
                        <button className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors text-sm">
                          Laisser un avis
                        </button>
                      )}
                      {order.status === 'pending' && (
                        <button className="px-4 py-2.5 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 font-medium transition-colors text-sm">
                          Annuler la commande
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
