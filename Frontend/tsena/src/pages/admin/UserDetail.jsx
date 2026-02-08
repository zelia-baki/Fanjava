// src/pages/admin/UserDetail.jsx

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import api from '@/services/api';
import {
  Users,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Store,
  ShoppingBag,
  Package,
  DollarSign,
  TrendingUp,
  Loader2,
  ChevronLeft,
  UserCheck,
  UserX,
  Edit,
  AlertCircle,
  Eye,
  Star,
  FileText
} from 'lucide-react';

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Récupérer les infos de l'utilisateur
      const userResponse = await api.get(`/users/admin/users/${id}/`);
      const userData = userResponse.data;
      setUser(userData);

      // 2. Récupérer les stats selon le type d'utilisateur
      if (userData.user_type === 'client') {
        await fetchClientStats(userData);
      } else if (userData.user_type === 'entreprise') {
        await fetchEntrepriseStats(userData);
      }

    } catch (err) {
      console.error('Erreur chargement utilisateur:', err);
      setError('Impossible de charger les détails de l\'utilisateur');
    } finally {
      setLoading(false);
    }
  };

  const fetchClientStats = async (userData) => {
    try {
      // Récupérer les commandes du client
      const ordersResponse = await api.get('/orders/commandes/', {
        params: { client_id: userData.id }
      });
      const orders = ordersResponse.data.results || ordersResponse.data || [];

      // Récupérer les avis du client
      let reviews = [];
      try {
        const reviewsResponse = await api.get('/reviews/avis/', {
          params: { client_id: userData.client?.id }
        });
        reviews = reviewsResponse.data.results || reviewsResponse.data || [];
      } catch (err) {
        console.log('Pas d\'avis trouvés');
      }

      setStats({
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => ['pending', 'confirmed', 'processing'].includes(o.status)).length,
        deliveredOrders: orders.filter(o => o.status === 'delivered').length,
        totalSpent: orders.reduce((sum, o) => sum + parseFloat(o.montant_final || 0), 0),
        totalReviews: reviews.length,
        recentOrders: orders.slice(0, 5)
      });
    } catch (err) {
      console.error('Erreur stats client:', err);
      setStats({ totalOrders: 0, pendingOrders: 0, deliveredOrders: 0, totalSpent: 0 });
    }
  };

  const fetchEntrepriseStats = async (userData) => {
    try {
      // Récupérer les produits de l'entreprise
      const productsResponse = await api.get('/products/produits/', {
        params: { entreprise_id: userData.entreprise?.id }
      });
      const products = productsResponse.data.results || productsResponse.data || [];

      // Récupérer les commandes contenant les produits de l'entreprise
      let orders = [];
      try {
        const ordersResponse = await api.get('/orders/commandes/');
        const allOrders = ordersResponse.data.results || ordersResponse.data || [];
        const productIds = products.map(p => p.id);
        
        orders = allOrders.filter(order => {
          if (order.lignes && Array.isArray(order.lignes)) {
            return order.lignes.some(ligne => productIds.includes(ligne.produit || ligne.produit_id));
          }
          return false;
        });
      } catch (err) {
        console.log('Pas de commandes trouvées');
      }

      const totalRevenue = orders.reduce((sum, order) => {
        if (order.lignes && Array.isArray(order.lignes)) {
          const productIds = products.map(p => p.id);
          const entrepriseAmount = order.lignes
            .filter(ligne => productIds.includes(ligne.produit || ligne.produit_id))
            .reduce((lineSum, ligne) => lineSum + parseFloat(ligne.prix_total || 0), 0);
          return sum + entrepriseAmount;
        }
        return sum + parseFloat(order.montant_total || 0);
      }, 0);

      setStats({
        totalProducts: products.length,
        activeProducts: products.filter(p => p.status === 'active').length,
        outOfStockProducts: products.filter(p => p.stock === 0).length,
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => ['pending', 'confirmed', 'processing'].includes(o.status)).length,
        totalRevenue: totalRevenue,
        totalViews: products.reduce((sum, p) => sum + (p.nombre_vues || 0), 0),
        totalSales: products.reduce((sum, p) => sum + (p.nombre_ventes || 0), 0),
        recentProducts: products.slice(0, 5)
      });
    } catch (err) {
      console.error('Erreur stats entreprise:', err);
      setStats({ totalProducts: 0, activeProducts: 0, totalOrders: 0, totalRevenue: 0 });
    }
  };

  const handleToggleActive = async () => {
    if (!window.confirm(`Voulez-vous vraiment ${user.is_active ? 'désactiver' : 'activer'} ce compte ?`)) {
      return;
    }

    try {
      setActionLoading(true);
      await api.patch(`/users/admin/users/${id}/`, {
        is_active: !user.is_active
      });
      
      // Recharger les données
      await fetchUserDetails();
      
      alert(`Compte ${user.is_active ? 'désactivé' : 'activé'} avec succès`);
    } catch (err) {
      console.error('Erreur toggle active:', err);
      alert('Erreur lors de la modification du statut');
    } finally {
      setActionLoading(false);
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
          <span className="ml-3">Chargement des détails...</span>
        </div>
      </MainLayout>
    );
  }

  if (error || !user) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error || 'Utilisateur non trouvé'}
          </div>
          <Link
            to="/admin/users"
            className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Retour à la liste
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête avec actions */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              to="/admin/users"
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Détails de l'utilisateur
              </h1>
              <p className="text-gray-600 mt-1">
                {user.user_type === 'client' && 'Client'}
                {user.user_type === 'entreprise' && 'Entreprise'}
                {user.user_type === 'admin' && 'Administrateur'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleToggleActive}
              disabled={actionLoading}
              className={`px-4 py-2 rounded-lg font-medium flex items-center space-x-2 ${
                user.is_active
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              } ${actionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : user.is_active ? (
                <UserX className="w-4 h-4" />
              ) : (
                <UserCheck className="w-4 h-4" />
              )}
              <span>{user.is_active ? 'Désactiver' : 'Activer'}</span>
            </button>
          </div>
        </div>

        {/* Informations principales */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user.first_name ? user.first_name[0].toUpperCase() : user.username[0].toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {user.first_name || user.last_name
                    ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                    : user.username}
                </h2>
                <p className="text-gray-600">@{user.username}</p>
                <div className="flex items-center space-x-2 mt-2">
                  {user.is_active ? (
                    <span className="flex items-center text-green-600 text-sm">
                      <UserCheck className="w-4 h-4 mr-1" />
                      Compte actif
                    </span>
                  ) : (
                    <span className="flex items-center text-red-600 text-sm">
                      <UserX className="w-4 h-4 mr-1" />
                      Compte désactivé
                    </span>
                  )}
                </div>
              </div>
            </div>

            {user.user_type === 'entreprise' && user.entreprise && (
              <div className="text-right">
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  user.entreprise.status === 'approved' ? 'bg-green-100 text-green-800' :
                  user.entreprise.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  user.entreprise.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {user.entreprise.status === 'approved' && '✓ Approuvé'}
                  {user.entreprise.status === 'pending' && '⏳ En attente'}
                  {user.entreprise.status === 'rejected' && '✗ Rejeté'}
                  {user.entreprise.status === 'suspended' && '⏸ Suspendu'}
                </div>
                {user.entreprise.verified && (
                  <p className="text-xs text-green-600 mt-1">Vérifié ✓</p>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Email */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{user.email}</p>
              </div>
            </div>

            {/* Téléphone */}
            {user.phone && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Téléphone</p>
                  <p className="font-medium text-gray-900">{user.phone}</p>
                </div>
              </div>
            )}

            {/* Date d'inscription */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Inscription</p>
                <p className="font-medium text-gray-900">
                  {new Date(user.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Informations spécifiques CLIENT */}
        {user.user_type === 'client' && user.client && (
          <>
            {/* Stats Client */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Commandes</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalOrders || 0}</p>
                  </div>
                  <ShoppingBag className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">En cours</p>
                    <p className="text-3xl font-bold text-orange-600">{stats.pendingOrders || 0}</p>
                  </div>
                  <Package className="w-8 h-8 text-orange-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Dépensé</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(stats.totalSpent || 0).toFixed(2)} Ar
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Avis Laissés</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalReviews || 0}</p>
                  </div>
                  <Star className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
            </div>

            {/* Adresse Client */}
            {(user.client.adresse_livraison || user.client.ville) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                  Adresse de livraison
                </h3>
                <div className="text-gray-700">
                  {user.client.adresse_livraison && <p>{user.client.adresse_livraison}</p>}
                  <p>
                    {user.client.ville && `${user.client.ville}, `}
                    {user.client.code_postal && `${user.client.code_postal}, `}
                    {user.client.pays || 'Madagascar'}
                  </p>
                </div>
              </div>
            )}

            {/* Commandes récentes */}
            {stats.recentOrders && stats.recentOrders.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900">Commandes Récentes</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {stats.recentOrders.map((order) => (
                    <div key={order.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">
                            Commande #{order.numero_commande || order.id}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(order.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            {parseFloat(order.montant_final || 0).toFixed(2)} Ar
                          </p>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mt-1 ${getOrderStatusColor(order.status)}`}>
                            {getOrderStatusLabel(order.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Informations spécifiques ENTREPRISE */}
        {user.user_type === 'entreprise' && user.entreprise && (
          <>
            {/* Infos Entreprise */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  {user.entreprise.logo && (
                    <img
                      src={user.entreprise.logo}
                      alt={user.entreprise.nom_entreprise}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {user.entreprise.nom_entreprise}
                    </h3>
                    {user.entreprise.siret && (
                      <p className="text-sm text-gray-600">SIRET: {user.entreprise.siret}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">⭐</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {user.entreprise.note_moyenne || '0.00'}
                  </span>
                </div>
              </div>

              {user.entreprise.description && (
                <div className="mb-4">
                  <p className="text-gray-700">{user.entreprise.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contact entreprise */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Contact</h4>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center text-gray-700">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      {user.entreprise.email_entreprise}
                    </p>
                    <p className="flex items-center text-gray-700">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      {user.entreprise.telephone}
                    </p>
                    {user.entreprise.whatsapp && (
                      <p className="flex items-center text-gray-700">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        WhatsApp: {user.entreprise.whatsapp}
                      </p>
                    )}
                  </div>
                </div>

                {/* Adresse entreprise */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Adresse</h4>
                  <div className="text-sm text-gray-700">
                    <p>{user.entreprise.adresse}</p>
                    <p>
                      {user.entreprise.ville}, {user.entreprise.code_postal}
                    </p>
                    <p>{user.entreprise.pays}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Entreprise */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Produits</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalProducts || 0}</p>
                    <p className="text-xs text-green-600 mt-1">{stats.activeProducts || 0} actifs</p>
                  </div>
                  <Package className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Commandes</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalOrders || 0}</p>
                    <p className="text-xs text-orange-600 mt-1">{stats.pendingOrders || 0} en attente</p>
                  </div>
                  <ShoppingBag className="w-8 h-8 text-orange-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Revenu Total</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(stats.totalRevenue || 0).toFixed(2)} Ar
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{stats.totalSales || 0} ventes</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Vues Totales</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalViews || 0}</p>
                  </div>
                  <Eye className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Produits récents */}
            {stats.recentProducts && stats.recentProducts.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900">Produits Récents</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {stats.recentProducts.map((product) => (
                    <div key={product.id} className="px-6 py-4 hover:bg-gray-50 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden">
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
                        <div>
                          <p className="font-semibold text-gray-900">{product.nom}</p>
                          <p className="text-sm text-gray-600">
                            Stock: {product.stock} • Prix: {product.prix} Ar
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{product.nombre_ventes} ventes</p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mt-1 ${
                          product.status === 'active' ? 'bg-green-100 text-green-800' :
                          product.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {product.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Informations ADMIN */}
        {user.user_type === 'admin' && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Compte Administrateur</h3>
                <p className="text-sm text-gray-600">Accès complet à la plateforme</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 space-y-2">
              <p className="text-sm text-gray-700 flex items-center">
                ✓ Gestion des utilisateurs
              </p>
              <p className="text-sm text-gray-700 flex items-center">
                ✓ Gestion des produits et catégories
              </p>
              <p className="text-sm text-gray-700 flex items-center">
                ✓ Gestion des commandes et avis
              </p>
              <p className="text-sm text-gray-700 flex items-center">
                ✓ Notifications système
              </p>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}