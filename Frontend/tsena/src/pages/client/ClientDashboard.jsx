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
  MapPin
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
      setOrders(ordersList.slice(0, 5)); // Les 5 dernières commandes

      // Calculer les stats
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
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
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

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Bienvenue, {user?.first_name || user?.username} 👋
          </h1>
          <p className="text-gray-600 mt-2">Voici un aperçu de votre compte</p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total commandes */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total commandes</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* En cours */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">En cours</p>
                <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Livrées */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Livrées</p>
                <p className="text-3xl font-bold text-green-600">{stats.delivered}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Total dépensé */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total dépensé</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalSpent.toFixed(2)} Ar
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Grille 2 colonnes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Commandes récentes */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Commandes récentes</h2>
                <Link 
                  to="/profile/orders"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                >
                  Voir tout
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>

              <div className="divide-y divide-gray-200">
                {orders.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <Package className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-gray-600">Aucune commande</p>
                    <Link
                      to="/"
                      className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Commencer vos achats
                    </Link>
                  </div>
                ) : (
                  orders.map((order) => (
                    <div key={order.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              Commande #{order.numero_commande}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(order.created_at).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            {parseFloat(order.montant_final).toFixed(2)} Ar
                          </p>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mt-1 ${getStatusBadge(order.status)}`}>
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
                        to={`/orders/${order.id}`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
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

          {/* Informations du compte */}
          <div className="space-y-6">
            {/* Profil */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Mon profil</h3>
                <Link to="/profile/edit" className="text-blue-600 hover:text-blue-700 text-sm">
                  Modifier
                </Link>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Nom</p>
                    <p className="font-medium text-gray-900">
                      {user?.first_name} {user?.last_name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{user?.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Actions rapides</h3>
              <div className="space-y-3">
                <Link
                  to="/"
                  className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Parcourir les produits
                </Link>
                <Link
                  to="/cart"
                  className="block w-full bg-gray-100 text-gray-800 text-center py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Voir mon panier
                </Link>
                <Link
                  to="/profile/orders"
                  className="block w-full bg-gray-100 text-gray-800 text-center py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Mes commandes
                </Link>
                <Link to="/myreviews" 
                  className="block w-full bg-gray-100 text-gray-800 text-center py-2 rounded-lg hover:bg-gray-200 transition-colors"

                >Mes Avis</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
