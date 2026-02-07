import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { orderService } from '@/services/orderService';
import { useAuth } from '@/context/AuthContext';
import { 
  Package, 
  ShoppingBag, 
  TrendingUp, 
  Clock,
  Loader2,
  ChevronRight,
  User,
  Mail
} from 'lucide-react';

export default function ClientDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    delivered: 0,
    totalSpent: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await orderService.getOrders();
      const ordersList = data.results || data;
      setOrders(ordersList.slice(0, 5));

      const stats = {
        total: ordersList.length,
        pending: ordersList.filter(o => o.status === 'pending' || o.status === 'confirmed' || o.status === 'processing').length,
        delivered: ordersList.filter(o => o.status === 'delivered').length,
        totalSpent: ordersList.reduce((sum, o) => sum + parseFloat(o.montant_final), 0)
      };
      setStats(stats);
    } catch (err) {
      console.error('Erreur chargement données:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-emerald-100 text-emerald-700',
      processing: 'bg-blue-100 text-blue-700',
      shipped: 'bg-indigo-100 text-indigo-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
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
          {/* En-tête */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Bienvenue, {user?.first_name || user?.username} 👋
            </h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">Voici un aperçu de votre compte</p>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {/* Total commandes */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Total</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                </div>
              </div>
            </div>

            {/* En cours */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">En cours</p>
                  <p className="text-2xl sm:text-3xl font-bold text-orange-600">{stats.pending}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                </div>
              </div>
            </div>

            {/* Livrées */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Livrées</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600">{stats.delivered}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Total dépensé */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Dépensé</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {stats.totalSpent.toLocaleString()} Ar
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Grille 2 colonnes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Commandes récentes */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Commandes récentes</h2>
                  <Link 
                    to="/profile/orders"
                    className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center"
                  >
                    <span className="hidden sm:inline">Voir tout</span>
                    <ChevronRight className="w-4 h-4 sm:ml-1" />
                  </Link>
                </div>

                <div className="divide-y divide-gray-200">
                  {orders.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-600 mb-4">Aucune commande</p>
                      <Link
                        to="/"
                        className="inline-block text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        Commencer vos achats →
                      </Link>
                    </div>
                  ) : (
                    orders.map((order) => (
                      <div key={order.id} className="px-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start sm:items-center justify-between gap-3 mb-3">
                          <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Package className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                                #{order.numero_commande}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-600">
                                {new Date(order.created_at).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-gray-900 text-sm sm:text-base">
                              {parseFloat(order.montant_final).toLocaleString()} Ar
                            </p>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusBadge(order.status)}`}>
                              {order.status === 'pending' && 'En attente'}
                              {order.status === 'confirmed' && 'Confirmée'}
                              {order.status === 'processing' && 'En préparation'}
                              {order.status === 'shipped' && 'Expédiée'}
                              {order.status === 'delivered' && 'Livrée'}
                              {order.status === 'cancelled' && 'Annulée'}
                            </span>
                          </div>
                        </div>
                        <Link
                          to={`/profile/orders/${order.id}`}
                          className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center"
                        >
                          Voir les détails
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Profil */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base">Mon profil</h3>
                  <Link to="/profile/edit" className="text-emerald-600 hover:text-emerald-700 text-sm">
                    Modifier
                  </Link>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-600">Nom</p>
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {user?.first_name} {user?.last_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-600">Email</p>
                      <p className="font-medium text-gray-900 text-sm truncate">{user?.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions rapides */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                <h3 className="font-bold text-gray-900 mb-4 text-sm sm:text-base">Actions rapides</h3>
                <div className="space-y-3">
                  <Link
                    to="/"
                    className="block w-full bg-emerald-500 hover:bg-emerald-600 text-white text-center py-2.5 rounded-lg transition-colors font-medium text-sm"
                  >
                    Parcourir les produits
                  </Link>
                  <Link
                    to="/cart"
                    className="block w-full bg-white border border-gray-300 text-gray-700 text-center py-2.5 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                  >
                    Voir mon panier
                  </Link>
                  <Link
                    to="/profile/orders"
                    className="block w-full bg-white border border-gray-300 text-gray-700 text-center py-2.5 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                  >
                    Mes commandes
                  </Link>
                  <Link 
                    to="/myreviews" 
                    className="block w-full bg-white border border-gray-300 text-gray-700 text-center py-2.5 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                  >
                    Mes Avis
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
