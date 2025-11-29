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

      // 1. Récupérer TOUS les produits de l'entreprise (pas de filtre status)
      const productsResponse = await api.get('/products/produits/', {
        params: { 
          mes_produits: 'true'
          // Ne pas filtrer par status pour avoir TOUS les produits
        }
      });
      const products = productsResponse.data.results || productsResponse.data;

      console.log('📦 Produits récupérés:', products.length);

      // 2. Calculer les statistiques des produits
      const activeProducts = products.filter(p => p.status === 'active' && p.actif === true).length;
      const draftProducts = products.filter(p => p.status === 'draft').length;
      const outOfStockProducts = products.filter(p => p.stock === 0).length;
      const totalViews = products.reduce((sum, p) => sum + (p.nombre_vues || 0), 0);
      const totalSales = products.reduce((sum, p) => sum + (p.nombre_ventes || 0), 0);

      // 3. Produits avec stock faible (stock <= seuil ET stock > 0)
      const lowStock = products
        .filter(p => p.stock > 0 && p.stock <= (p.seuil_alerte_stock || 10))
        .sort((a, b) => a.stock - b.stock) // Trier par stock croissant
        .slice(0, 5);

      // 4. Top produits (par nombre de ventes)
      const top = products
        .filter(p => (p.nombre_ventes || 0) > 0)
        .sort((a, b) => (b.nombre_ventes || 0) - (a.nombre_ventes || 0))
        .slice(0, 5);

      // 5. Récupérer les commandes
      // IMPORTANT: Filtrer les commandes qui contiennent des produits de cette entreprise
      let orders = [];
      let totalRevenue = 0;
      let pendingOrders = 0;

      try {
        const ordersResponse = await api.get('/orders/commandes/');
        const allOrders = ordersResponse.data.results || ordersResponse.data;

        console.log('📋 Commandes totales:', allOrders.length);

        // Filtrer les commandes qui contiennent au moins un produit de l'entreprise
        const productIds = products.map(p => p.id);
        
        orders = allOrders.filter(order => {
          // Vérifier si la commande contient des produits de l'entreprise
          if (order.lignes && Array.isArray(order.lignes)) {
            return order.lignes.some(ligne => productIds.includes(ligne.produit || ligne.produit_id));
          }
          return false;
        });

        console.log('📋 Commandes filtrées pour cette entreprise:', orders.length);

        // Calculer le revenu total et les commandes en attente
        totalRevenue = orders.reduce((sum, order) => {
          // Si la commande a des lignes, calculer uniquement le montant des produits de l'entreprise
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
        console.error('Erreur récupération commandes:', orderError);
        // Si l'erreur est 404, c'est normal (pas de commandes)
        if (orderError.response?.status !== 404) {
          console.warn('Impossible de récupérer les commandes, statistiques limitées');
        }
      }

      // 6. Mettre à jour les stats
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

      // 7. Trier et limiter les commandes récentes
      const sortedOrders = orders
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

      setRecentOrders(sortedOrders);
      setLowStockProducts(lowStock);
      setTopProducts(top);

      console.log('✅ Dashboard chargé:', {
        produits: products.length,
        commandes: orders.length,
        revenu: totalRevenue
      });

    } catch (err) {
      console.error('❌ Erreur chargement dashboard:', err);
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
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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

  if (error) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
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

        {/* Statistiques Principales - Ligne 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Total produits */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Produits</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {stats.activeProducts} actifs
                  </span>
                  {stats.draftProducts > 0 && (
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                      {stats.draftProducts} brouillons
                    </span>
                  )}
                </div>
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
                <p className="text-sm text-gray-600 mb-1">Commandes</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                {stats.pendingOrders > 0 && (
                  <p className="text-sm text-orange-600 mt-2 font-semibold">
                    {stats.pendingOrders} en attente
                  </p>
                )}
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
                  {stats.totalRevenue.toLocaleString('fr-FR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })} Ar
                </p>
                {stats.totalSales > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    {stats.totalSales} ventes
                  </p>
                )}
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Stock faible */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Alertes Stock</p>
                <p className="text-3xl font-bold text-red-600">
                  {lowStockProducts.length}
                </p>
                {stats.outOfStockProducts > 0 && (
                  <p className="text-xs text-red-600 mt-2 font-semibold">
                    {stats.outOfStockProducts} en rupture
                  </p>
                )}
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques Secondaires - Ligne 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Vues totales */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-800 mb-1">Vues Totales</p>
                <p className="text-3xl font-bold text-blue-900">{stats.totalViews}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          {/* Ventes totales */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-800 mb-1">Ventes Totales</p>
                <p className="text-3xl font-bold text-green-900">{stats.totalSales}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>

          {/* Taux de conversion */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-sm p-6 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-800 mb-1">Taux Conversion</p>
                <p className="text-3xl font-bold text-purple-900">
                  {stats.totalViews > 0 
                    ? ((stats.totalSales / stats.totalViews) * 100).toFixed(1)
                    : '0.0'
                  }%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Grille 3 colonnes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Commandes récentes */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
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
                  <p className="text-gray-600">Aucune commande pour le moment</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Les commandes apparaîtront ici dès qu'un client achètera vos produits
                  </p>
                </div>
              ) : (
                recentOrders.map((order) => (
                  <div key={order.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">
                          Commande #{order.numero_commande || order.id}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          {parseFloat(order.montant_total || 0).toLocaleString('fr-FR', {
                            minimumFractionDigits: 2
                          })} Ar
                        </p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mt-1 ${
                          getOrderStatusColor(order.status)
                        }`}>
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

          {/* Produits en alerte stock */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Stock Faible ⚠️</h2>
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
                  <p className="text-gray-600 font-medium">Stocks OK ✓</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Tous vos produits ont un stock suffisant
                  </p>
                </div>
              ) : (
                lowStockProducts.map((product) => (
                  <div key={product.id} className="px-6 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
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
                        className="text-blue-600 hover:text-blue-700 text-xs font-medium ml-2 flex-shrink-0"
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Top Produits 🏆</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-gray-200">
              {topProducts.map((product, index) => (
                <div key={product.id} className="px-6 py-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">#{index + 1}</div>
                  <div className="w-16 h-16 mx-auto bg-gray-200 rounded-lg mb-2 overflow-hidden">
                    {product.image_principale ? (
                      <img
                        src={product.image_principale}
                        alt={product.nom}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <p className="font-medium text-sm text-gray-900 truncate" title={product.nom}>
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
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-gray-900 mb-4">Actions Rapides</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/entreprise/products/create"
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow text-center group"
            >
              <Plus className="w-8 h-8 mx-auto mb-2 text-blue-600 group-hover:scale-110 transition-transform" />
              <p className="font-medium text-gray-900">Ajouter un produit</p>
            </Link>
            <Link
              to="/entreprise/products"
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow text-center group"
            >
              <Package className="w-8 h-8 mx-auto mb-2 text-blue-600 group-hover:scale-110 transition-transform" />
              <p className="font-medium text-gray-900">Gérer mes produits</p>
            </Link>
            <Link
              to="/entreprise/orders"
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow text-center group"
            >
              <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-blue-600 group-hover:scale-110 transition-transform" />
              <p className="font-medium text-gray-900">Voir les commandes</p>
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}