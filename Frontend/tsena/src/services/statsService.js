// src/services/statsService.js - VERSION CORRIGÉE AVEC GESTION D'ERREURS

import api from './api';

export const statsService = {
  /**
   * Récupérer les statistiques globales du site
   */
  async getGlobalStats() {
    try {
      // Récupérer les données en parallèle avec gestion d'erreurs
      const [usersRes, productsRes, ordersRes, reviewsRes] = await Promise.allSettled([
        api.get('/users/admin/users/'),
        api.get('/products/produits/'),
        api.get('/orders/commandes/'),
        api.get('/products/avis/')
      ]);

      // Extraire les données ou utiliser des tableaux vides en cas d'erreur
      const usersData = usersRes.status === 'fulfilled' 
        ? (usersRes.value.data.results || usersRes.value.data || [])
        : [];
      
      const productsData = productsRes.status === 'fulfilled'
        ? (productsRes.value.data.results || productsRes.value.data || [])
        : [];
      
      const ordersData = ordersRes.status === 'fulfilled'
        ? (ordersRes.value.data.results || ordersRes.value.data || [])
        : [];
      
      const reviewsData = reviewsRes.status === 'fulfilled'
        ? (reviewsRes.value.data.results || reviewsRes.value.data || [])
        : [];

      // Calculer les statistiques
      const stats = {
        // Utilisateurs
        totalUsers: usersData.length,
        totalClients: usersData.filter(u => u.user_type === 'client').length,
        totalEntreprises: usersData.filter(u => u.user_type === 'entreprise').length,
        newUsersThisMonth: usersData.filter(u => {
          const created = new Date(u.created_at);
          const now = new Date();
          return created.getMonth() === now.getMonth() && 
                 created.getFullYear() === now.getFullYear();
        }).length,

        // Produits
        totalProducts: productsData.length,
        activeProducts: productsData.filter(p => p.status === 'active' && p.actif).length,
        outOfStockProducts: productsData.filter(p => p.stock === 0).length,
        lowStockProducts: productsData.filter(p => 
          p.stock > 0 && p.stock <= (p.seuil_alerte_stock || 10)
        ).length,

        // Commandes
        totalOrders: ordersData.length,
        pendingOrders: ordersData.filter(o => 
          ['pending', 'confirmed', 'processing'].includes(o.status)
        ).length,
        completedOrders: ordersData.filter(o => o.status === 'delivered').length,
        cancelledOrders: ordersData.filter(o => o.status === 'cancelled').length,

        // Revenus
        totalRevenue: ordersData.reduce((sum, o) => 
          sum + parseFloat(o.montant_final || 0), 0
        ),
        monthlyRevenue: ordersData
          .filter(o => {
            const created = new Date(o.created_at);
            const now = new Date();
            return created.getMonth() === now.getMonth() && 
                   created.getFullYear() === now.getFullYear();
          })
          .reduce((sum, o) => sum + parseFloat(o.montant_final || 0), 0),

        // Avis
        totalReviews: reviewsData.length,
        pendingReviews: reviewsData.filter(r => !r.approuve).length,
        averageRating: reviewsData.length > 0
          ? (reviewsData.reduce((sum, r) => sum + r.note, 0) / reviewsData.length).toFixed(1)
          : 0,

        // Croissance (simulée - à remplacer par de vraies données)
        usersGrowth: 15.3,
        revenueGrowth: 23.5,
        ordersGrowth: 18.7
      };

      return stats;
    } catch (error) {
      console.error('Erreur récupération stats:', error);
      
      // Retourner des statistiques par défaut en cas d'erreur
      return {
        totalUsers: 0,
        totalClients: 0,
        totalEntreprises: 0,
        newUsersThisMonth: 0,
        totalProducts: 0,
        activeProducts: 0,
        outOfStockProducts: 0,
        lowStockProducts: 0,
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
        totalReviews: 0,
        pendingReviews: 0,
        averageRating: 0,
        usersGrowth: 0,
        revenueGrowth: 0,
        ordersGrowth: 0
      };
    }
  },

  /**
   * Récupérer les stats des ventes par mois (12 derniers mois)
   */
  async getSalesChartData() {
    try {
      const response = await api.get('/orders/commandes/');
      const orders = response.data.results || response.data || [];

      // Grouper par mois
      const monthlyData = {};
      const now = new Date();
      
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = date.toISOString().substring(0, 7); // YYYY-MM
        monthlyData[key] = { revenue: 0, orders: 0 };
      }

      orders.forEach(order => {
        const monthKey = order.created_at.substring(0, 7);
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].revenue += parseFloat(order.montant_final || 0);
          monthlyData[monthKey].orders += 1;
        }
      });

      return Object.entries(monthlyData).map(([month, data]) => ({
        month,
        revenue: data.revenue,
        orders: data.orders
      }));
    } catch (error) {
      console.error('Erreur récupération chart data:', error);
      return [];
    }
  },

  /**
   * Récupérer les top produits
   */
  async getTopProducts(limit = 10) {
    try {
      const response = await api.get('/products/produits/');
      const products = response.data.results || response.data || [];

      return products
        .filter(p => (p.nombre_ventes || 0) > 0)
        .sort((a, b) => (b.nombre_ventes || 0) - (a.nombre_ventes || 0))
        .slice(0, limit);
    } catch (error) {
      console.error('Erreur récupération top products:', error);
      return [];
    }
  },

  /**
   * Récupérer les top entreprises
   */
  async getTopEntreprises(limit = 10) {
    try {
      const response = await api.get('/users/admin/entreprises/');
      const entreprises = response.data.results || response.data || [];

      return entreprises
        .sort((a, b) => (b.nombre_ventes || 0) - (a.nombre_ventes || 0))
        .slice(0, limit);
    } catch (error) {
      console.error('Erreur récupération top entreprises:', error);
      return [];
    }
  }
};

export default statsService;