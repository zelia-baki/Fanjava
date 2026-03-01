// src/pages/admin/NotificationsSent.jsx - Page pour voir les notifications envoyées

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import {
  Bell,
  Users,
  Eye,
  EyeOff,
  TrendingUp,
  CheckCircle,
  Clock,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import api from '@/services/api';

export default function NotificationsSent() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({});
  const [loadingStats, setLoadingStats] = useState({});

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications/list_admin/');
      setNotifications(response.data);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async (notificationId) => {
    try {
      setLoadingStats(prev => ({ ...prev, [notificationId]: true }));
      const response = await api.get(`/notifications/${notificationId}/stats/`);
      setStats(prev => ({ ...prev, [notificationId]: response.data }));
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    } finally {
      setLoadingStats(prev => ({ ...prev, [notificationId]: false }));
    }
  };

  const toggleActive = async (notificationId, currentStatus) => {
    try {
      await api.patch(`/notifications/${notificationId}/toggle_active/`);
      
      // Mettre à jour localement
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId
            ? { ...notif, active: !currentStatus }
            : notif
        )
      );
    } catch (error) {
      console.error('Erreur toggle active:', error);
    }
  };

  const getRecipientTypeLabel = (type) => {
    const labels = {
      all: 'Tous les utilisateurs',
      clients: 'Clients uniquement',
      entreprises: 'Entreprises uniquement',
      specific: 'Utilisateurs spécifiques'
    };
    return labels[type] || type;
  };

  const getTypeIcon = (type) => {
    const icons = {
      order: '🛒',
      order_status: '📦',
      stock: '⚠️',
      payment: '💳',
      review: '⭐',
      account: '👤',
      general: '📢'
    };
    return icons[type] || '📢';
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              to="/admin/notifications"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Notifications Envoyées
              </h1>
              <p className="text-gray-600 mt-1">
                Consultez les notifications que vous avez créées
              </p>
            </div>
          </div>
          <Link
            to="/admin/notifications"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Nouvelle notification
          </Link>
        </div>

        {/* Liste des notifications */}
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              Aucune notification envoyée pour le moment
            </p>
            <Link
              to="/admin/notifications"
              className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Créer une notification
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => {
              const notifStats = stats[notification.id];
              const isLoadingStats = loadingStats[notification.id];

              return (
                <div
                  key={notification.id}
                  className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* En-tête de la notification */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-3 flex-1">
                        <span className="text-2xl">{getTypeIcon(notification.type_notification)}</span>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-lg text-gray-900">
                              {notification.titre}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              notification.active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {notification.active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-gray-700 mb-2">{notification.message}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {getRecipientTypeLabel(notification.recipient_type)}
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {new Date(notification.created_at).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <button
                        onClick={() => toggleActive(notification.id, notification.active)}
                        className={`p-2 rounded-lg transition-colors ${
                          notification.active
                            ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                        }`}
                        title={notification.active ? 'Désactiver' : 'Activer'}
                      >
                        {notification.active ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {/* Bouton pour afficher les stats */}
                    {!notifStats && (
                      <button
                        onClick={() => loadStats(notification.id)}
                        disabled={isLoadingStats}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                      >
                        {isLoadingStats ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Chargement...</span>
                          </>
                        ) : (
                          <>
                            <TrendingUp className="w-4 h-4" />
                            <span>Voir les statistiques</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* Statistiques */}
                    {notifStats && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="bg-blue-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-gray-600">Destinataires</span>
                              <Users className="w-4 h-4 text-blue-600" />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">
                              {notifStats.recipient_count}
                            </p>
                          </div>

                          <div className="bg-green-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-gray-600">Lues</span>
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">
                              {notifStats.read_count}
                            </p>
                          </div>

                          <div className="bg-orange-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-gray-600">Non lues</span>
                              <Bell className="w-4 h-4 text-orange-600" />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">
                              {notifStats.unread_count}
                            </p>
                          </div>

                          <div className="bg-purple-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-gray-600">Taux de lecture</span>
                              <TrendingUp className="w-4 h-4 text-purple-600" />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">
                              {notifStats.read_percentage.toFixed(1)}%
                            </p>
                          </div>
                        </div>

                        {/* Barre de progression */}
                        <div className="mt-4">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${notifStats.read_percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}