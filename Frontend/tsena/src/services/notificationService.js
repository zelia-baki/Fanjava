// src/services/notificationService.js

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
   * Supprimer une notification
   */
  async deleteNotification(notificationId) {
    await api.delete(`/notifications/${notificationId}/`);
  }
};

export default notificationService;