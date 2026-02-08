import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { 
  Package, 
  Search, 
  Loader2,
  Eye,
  ChevronRight,
  Clock,
  CheckCircle,
  Truck,
  XCircle
} from 'lucide-react';
import api from '@/services/api';

export default function EntrepriseOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/commandes/');
      setOrders(response.data.results || response.data);
    } catch (err) {
      console.error('Erreur chargement commandes:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchSearch = 
      order.numero_commande.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.client_nom?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock, label: 'En attente' },
      confirmed: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle, label: 'Confirmée' },
      processing: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Package, label: 'En préparation' },
      shipped: { bg: 'bg-indigo-100', text: 'text-indigo-700', icon: Truck, label: 'Expédiée' },
      delivered: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Livrée' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Annulée' },
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

  const getStatusStats = () => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      processing: orders.filter(o => o.status === 'confirmed' || o.status === 'processing').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
    };
  };

  const stats = getStatusStats();

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-white flex justify-center items-center">
          <div className="flex items-center gap-3">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
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
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestion des Commandes</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Gérez toutes vos commandes reçues</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Total</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-white rounded-lg border border-yellow-200 p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Attente</p>
              <p className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="bg-white rounded-lg border border-blue-200 p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Traitement</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">{stats.processing}</p>
            </div>
            <div className="bg-white rounded-lg border border-indigo-200 p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Expédiées</p>
              <p className="text-xl sm:text-2xl font-bold text-indigo-600">{stats.shipped}</p>
            </div>
            <div className="bg-white rounded-lg border border-green-200 p-3 sm:p-4 col-span-2 sm:col-span-1">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Livrées</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.delivered}</p>
            </div>
          </div>

          {/* Filtres */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                />
              </div>

              {/* Filtre statut */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="confirmed">Confirmées</option>
                <option value="processing">En préparation</option>
                <option value="shipped">Expédiées</option>
                <option value="delivered">Livrées</option>
                <option value="cancelled">Annulées</option>
              </select>
            </div>
          </div>

          {/* Liste des commandes */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                {searchQuery || filterStatus !== 'all' ? 'Aucune commande trouvée' : 'Aucune commande'}
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                {searchQuery || filterStatus !== 'all' 
                  ? 'Essayez de modifier vos filtres' 
                  : 'Les commandes apparaîtront ici'}
              </p>
            </div>
          ) : (
            <>
              {/* Vue Desktop - Table */}
              <div className="hidden lg:block bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Commande
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Client
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Montant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              #{order.numero_commande}
                            </div>
                            {order.numero_suivi && (
                              <div className="text-xs text-gray-500">
                                Suivi: {order.numero_suivi}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{order.client_nom || 'Client'}</div>
                            <div className="text-xs text-gray-500">{order.ville_livraison}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(order.created_at).toLocaleDateString('fr-FR')}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(order.created_at).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">
                              {parseFloat(order.montant_final).toLocaleString()} Ar
                            </div>
                            {order.lignes && (
                              <div className="text-xs text-gray-500">
                                {order.lignes.length} article{order.lignes.length > 1 ? 's' : ''}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(order.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link
                              to={`/entreprise/orders/${order.id}`}
                              className="text-orange-600 hover:text-orange-700 inline-flex items-center transition-colors"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Voir
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Vue Mobile - Cards */}
              <div className="lg:hidden space-y-4">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">
                          #{order.numero_commande}
                        </p>
                        <p className="text-xs text-gray-600">
                          {order.client_nom || 'Client'}
                        </p>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Date :</span>
                        <span className="font-medium text-gray-900">
                          {new Date(order.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Montant :</span>
                        <span className="font-bold text-gray-900">
                          {parseFloat(order.montant_final).toLocaleString()} Ar
                        </span>
                      </div>
                      {order.lignes && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Articles :</span>
                          <span className="text-gray-900">
                            {order.lignes.length}
                          </span>
                        </div>
                      )}
                      {order.ville_livraison && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Ville :</span>
                          <span className="text-gray-900">
                            {order.ville_livraison}
                          </span>
                        </div>
                      )}
                    </div>

                    <Link
                      to={`/entreprise/orders/${order.id}`}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      Voir les détails
                    </Link>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
