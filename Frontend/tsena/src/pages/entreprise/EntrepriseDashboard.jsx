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
  AlertCircle,
  Eye
} from 'lucide-react';
import api from '@/services/api';

export default function EntrepriseDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    draftProducts: 0,
    outOfStockProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    totalViews: 0,
    totalSales: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const productsResponse = await api.get('/products/produits/', {
        params: { mes_produits: 'true' }
      });
      const products = productsResponse.data.results || productsResponse.data;

      const activeProducts = products.filter(p => p.status === 'active' && p.actif === true).length;
      const draftProducts = products.filter(p => p.status === 'draft').length;
      const outOfStockProducts = products.filter(p => p.stock === 0).length;
      const totalViews = products.reduce((sum, p) => sum + (p.nombre_vues || 0), 0);
      const totalSales = products.reduce((sum, p) => sum + (p.nombre_ventes || 0), 0);

      const lowStock = products
        .filter(p => p.stock > 0 && p.stock <= (p.seuil_alerte_stock || 10))
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 5);

      const top = products
        .filter(p => (p.nombre_ventes || 0) > 0)
        .sort((a, b) => (b.nombre_ventes || 0) - (a.nombre_ventes || 0))
        .slice(0, 5);

      let orders = [];
      let totalRevenue = 0;
      let pendingOrders = 0;

      try {
        const ordersResponse = await api.get('/orders/commandes/');
        const allOrders = ordersResponse.data.results || ordersResponse.data;
        const productIds = products.map(p => p.id);

        orders = allOrders.filter(order => {
          if (order.lignes && Array.isArray(order.lignes)) {
            return order.lignes.some(ligne => productIds.includes(ligne.produit || ligne.produit_id));
          }
          return false;
        });

        totalRevenue = orders.reduce((sum, order) => {
          if (order.lignes && Array.isArray(order.lignes)) {
            const entrepriseAmount = order.lignes
              .filter(ligne => productIds.includes(ligne.produit || ligne.produit_id))
              .reduce((lineSum, ligne) => lineSum + parseFloat(ligne.prix_total || 0), 0);
            return sum + entrepriseAmount;
          }
          return sum + parseFloat(order.montant_total || 0);
        }, 0);

        pendingOrders = orders.filter(o =>
          o.status === 'pending' || o.status === 'confirmed' || o.status === 'processing'
        ).length;

      } catch (orderError) {
        if (orderError.response?.status !== 404) {
          console.warn('Impossible de récupérer les commandes');
        }
      }

      setStats({
        totalProducts: products.length,
        activeProducts,
        draftProducts,
        outOfStockProducts,
        totalOrders: orders.length,
        totalRevenue,
        pendingOrders,
        totalViews,
        totalSales
      });

      const sortedOrders = orders
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

      setRecentOrders(sortedOrders);
      setLowStockProducts(lowStock);
      setTopProducts(top);

    } catch (err) {
      console.error('Erreur chargement dashboard:', err);
      setError('Erreur lors du chargement du dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatusLabel = (status) => {
    const labels = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      processing: 'En préparation',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée'
    };
    return labels[status] || status;
  };

  const getOrderStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-emerald-100 text-emerald-700',
      processing: 'bg-blue-100 text-blue-700',
      shipped: 'bg-indigo-100 text-indigo-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

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

  if (error) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg max-w-md text-center">
            {error}
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Dashboard Entreprise 🏢
              </h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">
                Bienvenue, {user?.entreprise?.nom_entreprise || user?.username}
              </p>
            </div>
            <Link
              to="/entreprise/products/create"
              className="inline-flex items-center justify-center px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Ajouter un produit
            </Link>
          </div>

          {/* Statistiques Principales */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
            {/* Total produits */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Produits</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-2">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      {stats.activeProducts} actifs
                    </span>
                    {stats.draftProducts > 0 && (
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                        {stats.draftProducts} brouillons
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                </div>
              </div>
            </div>

            {/* Commandes */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Commandes</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                  {stats.pendingOrders > 0 && (
                    <p className="text-xs sm:text-sm text-orange-600 mt-2 font-semibold">
                      {stats.pendingOrders} en attente
                    </p>
                  )}
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                </div>
              </div>
            </div>

            {/* Revenu */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Revenu</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {stats.totalRevenue.toLocaleString()} Ar
                  </p>
                  {stats.totalSales > 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      {stats.totalSales} ventes
                    </p>
                  )}
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Stock faible */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Alertes</p>
                  <p className="text-2xl sm:text-3xl font-bold text-red-600">
                    {lowStockProducts.length}
                  </p>
                  {stats.outOfStockProducts > 0 && (
                    <p className="text-xs sm:text-sm text-red-600 mt-2 font-semibold">
                      {stats.outOfStockProducts} rupture
                    </p>
                  )}
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Secondaires */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-blue-800 mb-1 font-medium">Vues Totales</p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-900">{stats.totalViews}</p>
                </div>
                <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-green-800 mb-1 font-medium">Ventes</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-900">{stats.totalSales}</p>
                </div>
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-purple-800 mb-1 font-medium">Conversion</p>
                  <p className="text-2xl sm:text-3xl font-bold text-purple-900">
                    {stats.totalViews > 0 ? ((stats.totalSales / stats.totalViews) * 100).toFixed(1) : '0.0'}%
                  </p>
                </div>
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Grille 3 colonnes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Commandes récentes */}
            <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Commandes Récentes</h2>
                <Link
                  to="/entreprise/orders"
                  className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                >
                  Voir tout →
                </Link>
              </div>

              <div className="divide-y divide-gray-200">
                {recentOrders.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingBag className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600">Aucune commande</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Les commandes apparaîtront ici
                    </p>
                  </div>
                ) : (
                  recentOrders.map((order) => (
                    <div key={order.id} className="px-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">
                            #{order.numero_commande || order.id}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {new Date(order.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-gray-900 text-sm">
                            {parseFloat(order.montant_total || 0).toLocaleString()} Ar
                          </p>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getOrderStatusColor(order.status)}`}>
                            {getOrderStatusLabel(order.status)}
                          </span>
                        </div>
                      </div>
                      {order.lignes && order.lignes.length > 0 && (
                        <p className="text-xs text-gray-500">
                          {order.lignes.length} article{order.lignes.length > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Stock faible */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Stock Faible ⚠️</h2>
                <Link
                  to="/entreprise/products"
                  className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                >
                  Gérer →
                </Link>
              </div>

              <div className="divide-y divide-gray-200">
                {lowStockProducts.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="text-gray-600 font-medium">Stocks OK ✓</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Stock suffisant
                    </p>
                  </div>
                ) : (
                  lowStockProducts.map((product) => (
                    <div key={product.id} className="px-4 sm:px-6 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-gray-100 rounded border border-gray-200 flex-shrink-0 overflow-hidden">
                            {product.image_principale ? (
                              <img
                                src={product.image_principale}
                                alt={product.nom}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">
                              {product.nom}
                            </p>
                            <p className="text-xs text-red-600 font-semibold">
                              Stock: {product.stock} / {product.seuil_alerte_stock}
                            </p>
                          </div>
                        </div>
                        <Link
                          to={`/entreprise/products/${product.slug}/edit`}
                          className="text-orange-600 hover:text-orange-700 text-xs font-medium flex-shrink-0"
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

          {/* Top Produits */}
          {topProducts.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 mb-6">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Top Produits 🏆</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
                {topProducts.map((product, index) => (
                  <div key={product.id} className="px-4 sm:px-6 py-4 text-center">
                    <div className="text-xl sm:text-2xl font-bold text-orange-600 mb-1">#{index + 1}</div>
                    <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-gray-100 rounded-lg mb-2 overflow-hidden border border-gray-200">
                      {product.image_principale ? (
                        <img
                          src={product.image_principale}
                          alt={product.nom}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <p className="font-medium text-xs sm:text-sm text-gray-900 truncate px-2" title={product.nom}>
                      {product.nom}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {product.nombre_ventes} vente{product.nombre_ventes > 1 ? 's' : ''}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions rapides */}
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4 sm:p-6">
            <h3 className="font-bold text-gray-900 mb-4 text-sm sm:text-base">Actions Rapides</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <Link
                to="/entreprise/products/create"
                className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-orange-300 transition-colors text-center"
              >
                <Plus className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-orange-600" />
                <p className="font-medium text-gray-900 text-xs sm:text-sm">Ajouter produit</p>
              </Link>
              <Link
                to="/entreprise/products"
                className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-orange-300 transition-colors text-center"
              >
                <Package className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-orange-600" />
                <p className="font-medium text-gray-900 text-xs sm:text-sm">Mes produits</p>
              </Link>
              <Link
                to="/entreprise/orders"
                className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-orange-300 transition-colors text-center"
              >
                <ShoppingBag className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-orange-600" />
                <p className="font-medium text-gray-900 text-xs sm:text-sm">Commandes</p>
              </Link>
              <Link
                to="/entreprise/reviews"
                className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-orange-300 transition-colors text-center"
              >
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-orange-600" />
                <p className="font-medium text-gray-900 text-xs sm:text-sm">Avis</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
