// src/services/adminService.js

import api from './api';

export const adminService = {
  // ========== STATISTIQUES GLOBALES ==========
  
  async getGlobalStats() {
    const response = await api.get('/admin/stats/');
    return response.data;
  },

  // ========== GESTION DES UTILISATEURS ==========
  
  async getAllUsers(params = {}) {
    const response = await api.get('/users/admin/users/', { params });
    return response.data;
  },

  async getUserDetail(userId) {
    const response = await api.get(`/users/admin/users/${userId}/`);
    return response.data;
  },

  async updateUser(userId, data) {
    const response = await api.patch(`/users/admin/users/${userId}/`, data);
    return response.data;
  },

  async deleteUser(userId) {
    const response = await api.delete(`/users/admin/users/${userId}/`);
    return response.data;
  },

  // ========== GESTION DES CLIENTS ==========
  
  async getAllClients(params = {}) {
    const response = await api.get('/users/admin/clients/', { params });
    return response.data;
  },

  // ========== GESTION DES ENTREPRISES ==========
  
  async getAllEntreprises(params = {}) {
    const response = await api.get('/users/admin/entreprises/', { params });
    return response.data;
  },

  async approveEntreprise(entrepriseId) {
    const response = await api.post(`/users/admin/entreprises/${entrepriseId}/approve/`);
    return response.data;
  },

  async rejectEntreprise(entrepriseId) {
    const response = await api.post(`/users/admin/entreprises/${entrepriseId}/reject/`);
    return response.data;
  },

  async suspendEntreprise(entrepriseId) {
    const response = await api.post(`/users/admin/entreprises/${entrepriseId}/suspend/`);
    return response.data;
  },

  // ========== GESTION DES PRODUITS (TOUS) ==========
  
  async getAllProducts(params = {}) {
    const response = await api.get('/products/produits/', { params });
    return response.data;
  },

  async updateProduct(slug, data) {
    const response = await api.patch(`/products/produits/${slug}/`, data);
    return response.data;
  },

  async deleteProduct(slug) {
    const response = await api.delete(`/products/produits/${slug}/`);
    return response.data;
  },

  // ========== GESTION DES COMMANDES (TOUTES) ==========
  
  async getAllOrders(params = {}) {
    const response = await api.get('/orders/commandes/', { params });
    return response.data;
  },

  async updateOrder(orderId, data) {
    const response = await api.patch(`/orders/commandes/${orderId}/`, data);
    return response.data;
  },

  // ========== GESTION DES PAIEMENTS ==========
  
  async getAllPayments(params = {}) {
    const response = await api.get('/payments/', { params });
    return response.data;
  },

  async getPaymentDetail(paymentId) {
    const response = await api.get(`/payments/${paymentId}/`);
    return response.data;
  },

  async refundPayment(paymentId) {
    const response = await api.post(`/payments/${paymentId}/refund/`);
    return response.data;
  },

  // ========== GESTION DES AVIS ==========
  
  async getAllReviews(params = {}) {
    const response = await api.get('/products/avis/', { params });
    return response.data;
  },

  async approveReview(reviewId) {
    const response = await api.patch(`/products/avis/${reviewId}/`, {
      approuve: true
    });
    return response.data;
  },

  async rejectReview(reviewId) {
    const response = await api.delete(`/products/avis/${reviewId}/`);
    return response.data;
  },

  // ========== GESTION DES NOTIFICATIONS ==========
  
  async getAllNotifications(params = {}) {
    const response = await api.get('/notifications/', { params });
    return response.data;
  },

  async createNotification(data) {
    const response = await api.post('/notifications/', data);
    return response.data;
  },

  async createBulkNotification(data) {
    const response = await api.post('/notifications/bulk/', data);
    return response.data;
  },

  async deleteNotification(notificationId) {
    const response = await api.delete(`/notifications/${notificationId}/`);
    return response.data;
  },

  // ========== GESTION DES CATÉGORIES ==========
  
  async getAllCategories() {
    const response = await api.get('/products/categories/');
    return response.data;
  },

  async createCategory(data) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== '') {
        formData.append(key, value);
      }
    });
    const response = await api.post('/products/categories/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  async updateCategory(slug, data) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== '') {
        formData.append(key, value);
      }
    });
    const response = await api.put(`/products/categories/${slug}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  async deleteCategory(slug) {
    const response = await api.delete(`/products/categories/${slug}/`);
    return response.data;
  },
};

export default adminService;