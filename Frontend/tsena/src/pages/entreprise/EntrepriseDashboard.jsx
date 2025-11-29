import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { 
  Package, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp,
  Loader2,
  Plus,
  AlertCircle
} from 'lucide-react';
import api from '@/services/api';

export default function EntrepriseDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Récupérer les produits de l'entreprise
      const productsResponse = await api.get('/products/produits/', {
        params: { mes_produits: 'true' }
      });
      const products = productsResponse.data.results || productsResponse.data;

      // Récupérer les commandes de l'entreprise
      const ordersResponse = await api.get('/orders/commandes/');
      const orders = ordersResponse.data.results || ordersResponse.data;

      // Calculer les stats
      const activeProducts = products.filter(p => p.status === 'active').length;
      const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.montant_total), 0);
      const pendingOrders = orders.filter(o => 
        o.status === 'pending' || o.status === 'confirmed'
      ).length;

      // Produits avec stock faible
      const lowStock = products.filter(p => p.stock <= p.seuil_alerte_stock && p.stock > 0);

      setStats({
        totalProducts: products.length,
        activeProducts,
        totalOrders: orders.length,
        totalRevenue,
        pendingOrders
      });

      setRecentOrders(orders.slice(0, 5));
      setLowStockProducts(lowStock.slice(0, 5));
    } catch (err) {
      console.error('Erreur chargement dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 py-16 flex justify-center items-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-3">Chargement du dashboard...</span>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard Entreprise 🏢
            </h1>
            <p className="text-gray-600 mt-2">
              Bienvenue, {user?.entreprise?.nom_entreprise || user?.username}
            </p>
          </div>
          <Link
            to="/entreprise/products/create"
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Ajouter un produit
          </Link>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total produits */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Produits</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
                <p className="text-sm text-green-600 mt-1">
                  {stats.activeProducts} actifs
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Total commandes */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Commandes</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                <p className="text-sm text-orange-600 mt-1">
                  {stats.pendingOrders} en attente
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Revenu total */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Revenu Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalRevenue.toFixed(2)} Ar
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Produits stock faible */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Stock Faible</p>
                <p className="text-3xl font-bold text-red-600">
                  {lowStockProducts.length}
                </p>
                <p className="text-sm text-gray-500 mt-1">produits</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Grille 2 colonnes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Commandes récentes */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Commandes Récentes</h2>
              <Link
                to="/entreprise/orders"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Voir tout →
              </Link>
            </div>

            <div className="divide-y divide-gray-200">
              {recentOrders.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-gray-600">Aucune commande</p>
                </div>
              ) : (
                recentOrders.map((order) => (
                  <div key={order.id} className="px-6 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">
                          Commande #{order.numero_commande}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          {parseFloat(order.montant_total).toFixed(2)} Ar
                        </p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mt-1 ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status === 'pending' && 'En attente'}
                          {order.status === 'confirmed' && 'Confirmée'}
                          {order.status === 'processing' && 'En préparation'}
                          {order.status === 'delivered' && 'Livrée'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Produits en alerte stock */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Stock Faible ⚠️</h2>
              <Link
                to="/entreprise/products"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Gérer →
              </Link>
            </div>

            <div className="divide-y divide-gray-200">
              {lowStockProducts.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <Package className="mx-auto h-12 w-12 text-green-400 mb-3" />
                  <p className="text-gray-600">Tous les stocks sont OK ✓</p>
                </div>
              ) : (
                lowStockProducts.map((product) => (
                  <div key={product.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0">
                          {product.image_principale && (
                            <img
                              src={product.image_principale}
                              alt={product.nom}
                              className="w-full h-full object-cover rounded"
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{product.nom}</p>
                          <p className="text-sm text-red-600 font-semibold">
                            Stock: {product.stock}
                          </p>
                        </div>
                      </div>
                      <Link
                        to={`/entreprise/products/${product.id}/edit`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Modifier
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-gray-900 mb-4">Actions Rapides</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/entreprise/products/create"
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow text-center"
            >
              <Plus className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="font-medium text-gray-900">Ajouter un produit</p>
            </Link>
            <Link
              to="/entreprise/products"
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow text-center"
            >
              <Package className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="font-medium text-gray-900">Gérer mes produits</p>
            </Link>
            <Link
              to="/entreprise/orders"
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow text-center"
            >
              <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="font-medium text-gray-900">Voir les commandes</p>
            </Link>
            <Link to="/entreprise/reviews"               className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow text-center"
>Gérer les Avis</Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}