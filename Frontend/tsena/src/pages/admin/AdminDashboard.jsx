// src/pages/admin/AdminDashboard.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { useAuth } from '@/context/AuthContext';
import {
  Users,
  Package,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Star,
  Store,
  Loader2,
  ChevronRight,
  Eye,
  Clock
} from 'lucide-react';
import { statsService } from '@/services/statsService';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [globalStats, chartData, products] = await Promise.all([
        statsService.getGlobalStats(),
        statsService.getSalesChartData(),
        statsService.getTopProducts(5)
      ]);

      setStats(globalStats);
      setSalesData(chartData);
      setTopProducts(products);
    } catch (err) {
      console.error('Erreur chargement dashboard:', err);
      setError('Erreur lors du chargement du dashboard');
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Administrateur 🛡️
          </h1>
          <p className="text-gray-600 mt-2">
            Vue d'ensemble de la plateforme FanJava
          </p>
        </div>

        {/* Statistiques principales - Ligne 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Total utilisateurs */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Utilisateurs</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {stats?.totalClients || 0} clients
                  </span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {stats?.totalEntreprises || 0} entreprises
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            {stats?.usersGrowth && (
              <div className="mt-3 flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                +{stats.usersGrowth}% ce mois
              </div>
            )}
          </div>

          {/* Total produits */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Produits</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalProducts || 0}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {stats?.activeProducts || 0} actifs
                  </span>
                  {stats?.lowStockProducts > 0 && (
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                      {stats.lowStockProducts} stock faible
                    </span>
                  )}
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Total commandes */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Commandes</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalOrders || 0}</p>
                <div className="flex items-center space-x-2 mt-2">
                  {stats?.pendingOrders > 0 && (
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                      {stats.pendingOrders} en attente
                    </span>
                  )}
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {stats?.completedOrders || 0} livrées
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            {stats?.ordersGrowth && (
              <div className="mt-3 flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                +{stats.ordersGrowth}% ce mois
              </div>
            )}
          </div>

          {/* Revenu total */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Revenu Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(stats?.totalRevenue || 0).toLocaleString('fr-FR', {
                    minimumFractionDigits: 2
                  })} Ar
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Ce mois: {(stats?.monthlyRevenue || 0).toLocaleString('fr-FR', {
                    minimumFractionDigits: 2
                  })} Ar
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            {stats?.revenueGrowth && (
              <div className="mt-3 flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                +{stats.revenueGrowth}% ce mois
              </div>
            )}
          </div>
        </div>

        {/* Statistiques secondaires - Ligne 2 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Nouveaux utilisateurs */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-800 mb-1">Nouveaux ce mois</p>
                <p className="text-3xl font-bold text-blue-900">{stats?.newUsersThisMonth || 0}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          {/* Avis en attente */}
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow-sm p-6 border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-800 mb-1">Avis en attente</p>
                <p className="text-3xl font-bold text-yellow-900">{stats?.pendingReviews || 0}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          {/* Note moyenne */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-800 mb-1">Note moyenne</p>
                <p className="text-3xl font-bold text-green-900">{stats?.averageRating || 0}/5</p>
              </div>
              <Star className="w-8 h-8 text-green-600" />
            </div>
          </div>

          {/* Alertes stock */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow-sm p-6 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-800 mb-1">Alertes Stock</p>
                <p className="text-3xl font-bold text-red-900">
                  {(stats?.lowStockProducts || 0) + (stats?.outOfStockProducts || 0)}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Grille 2 colonnes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Actions rapides */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Actions Rapides</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Gérer les utilisateurs */}
                <Link
                  to="/admin/users"
                  className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Gérer les utilisateurs</h3>
                  <p className="text-sm text-gray-600">
                    {stats?.totalUsers || 0} utilisateurs inscrits
                  </p>
                </Link>

                {/* Gérer les produits */}
                <Link
                  to="/admin/products"
                  className="border-2 border-gray-200 rounded-lg p-4 hover:border-purple-400 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Package className="w-6 h-6 text-purple-600" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Gérer les produits</h3>
                  <p className="text-sm text-gray-600">
                    {stats?.totalProducts || 0} produits au total
                  </p>
                </Link>

                {/* Gérer les commandes */}
                <Link
                  to="/admin/orders"
                  className="border-2 border-gray-200 rounded-lg p-4 hover:border-orange-400 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ShoppingBag className="w-6 h-6 text-orange-600" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Gérer les commandes</h3>
                  <p className="text-sm text-gray-600">
                    {stats?.pendingOrders || 0} en attente de traitement
                  </p>
                </Link>

                {/* Modérer les avis */}
                <Link
                  to="/admin/reviews"
                  className="border-2 border-gray-200 rounded-lg p-4 hover:border-yellow-400 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Star className="w-6 h-6 text-yellow-600" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-yellow-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Modérer les avis</h3>
                  <p className="text-sm text-gray-600">
                    {stats?.pendingReviews || 0} avis à modérer
                  </p>
                </Link>

                {/* Gérer les catégories */}
                <Link
                  to="/admin/categories"
                  className="border-2 border-gray-200 rounded-lg p-4 hover:border-indigo-400 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Store className="w-6 h-6 text-indigo-600" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Gérer les catégories</h3>
                  <p className="text-sm text-gray-600">Organiser les produits</p>
                </Link>

                {/* Envoyer des notifications */}
                <Link
                  to="/admin/notifications"
                  className="border-2 border-gray-200 rounded-lg p-4 hover:border-green-400 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <AlertCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Notifications</h3>
                  <p className="text-sm text-gray-600">Envoyer des messages</p>
                </Link>
              </div>
            </div>
          </div>

          {/* Top Produits */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Top Produits 🏆</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {topProducts.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <Package className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-gray-600">Aucun produit vendu</p>
                </div>
              ) : (
                topProducts.map((product, index) => (
                  <div key={product.id} className="px-6 py-3 hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="text-lg font-bold text-blue-600 w-6">
                        #{index + 1}
                      </div>
                      <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                        {product.image_principale ? (
                          <img
                            src={product.image_principale}
                            alt={product.nom}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {product.nom}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-600">
                            {product.nombre_ventes} ventes
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-600">
                            {product.nombre_vues} vues
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Graphique des ventes (simplifié) */}
        {salesData.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Évolution des ventes (12 derniers mois)
            </h2>
            <div className="h-64 flex items-end space-x-2">
              {salesData.map((data, index) => {
                const maxRevenue = Math.max(...salesData.map(d => d.revenue));
                const height = maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer relative group"
                      style={{ height: `${height}%` }}
                      title={`${data.revenue.toFixed(2)} Ar - ${data.orders} commandes`}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {data.revenue.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} Ar
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2 transform -rotate-45 origin-top-left">
                      {new Date(data.month + '-01').toLocaleDateString('fr-FR', { 
                        month: 'short' 
                      })}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}