// src/services/notificationService.js - VERSION V2

import api from './api';

export const notificationService = {
  /**
   * Récupérer toutes les notifications de l'utilisateur connecté
   */
  async getMyNotifications() {
    const response = await api.get('/notifications/');
    return response.data.results || response.data || [];
  },

  /**
   * Récupérer le nombre de notifications non lues
   */
  async getUnreadCount() {
    const response = await api.get('/notifications/unread_count/');
    return response.data.count || 0;
  },

  /**
   * Marquer une notification comme lue
   */
  async markAsRead(notificationId) {
    const response = await api.post(`/notifications/${notificationId}/mark_read/`);
    return response.data;
  },

  /**
   * Marquer toutes les notifications comme lues
   */
  async markAllAsRead() {
    const response = await api.post('/notifications/mark_all_read/');
    return response.data;
  },

  /**
   * Masquer une notification (soft delete) - CHANGÉ POUR V2
   */
  async hideNotification(notificationId) {
    await api.delete(`/notifications/${notificationId}/hide/`);
  },

  // NOUVEAUX ENDPOINTS POUR ADMIN V2
  
  /**
   * Récupérer toutes les notifications créées (admin uniquement)
   */
  async getAdminNotifications() {
    const response = await api.get('/notifications/list_admin/');
    return response.data;
  },

  /**
   * Obtenir les statistiques d'une notification (admin uniquement)
   */
  async getNotificationStats(notificationId) {
    const response = await api.get(`/notifications/${notificationId}/stats/`);
    return response.data;
  },

  /**
   * Activer/désactiver une notification (admin uniquement)
   */
  async toggleActive(notificationId) {
    const response = await api.patch(`/notifications/${notificationId}/toggle_active/`);
    return response.data;
  }
};

export default notificationService;