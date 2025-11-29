// src/pages/NotificationsPage.jsx

import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Filter } from 'lucide-react';
import MainLayout from '@/layouts/MainLayout';
import notificationService from '@/services/notificationService';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getMyNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notifId) => {
    try {
      await notificationService.markAsRead(notifId);
      await loadNotifications();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      await loadNotifications();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleDelete = async (notifId) => {
    try {
      await notificationService.deleteNotification(notifId);
      await loadNotifications();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.lue;
    if (filter === 'read') return n.lue;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.lue).length;

  const getNotificationIcon = (type) => {
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
            <p className="text-gray-600">
              {unreadCount > 0 
                ? `Vous avez ${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`
                : 'Toutes vos notifications sont lues'}
            </p>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Filtres */}
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    filter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Toutes ({notifications.length})
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    filter === 'unread'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Non lues ({unreadCount})
                </button>
                <button
                  onClick={() => setFilter('read')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    filter === 'read'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Lues ({notifications.length - unreadCount})
                </button>
              </div>

              {/* Actions */}
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Tout marquer comme lu
                </button>
              )}
            </div>
          </div>

          {/* Liste notifications */}
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {filter === 'unread' ? 'Aucune notification non lue' : 
                 filter === 'read' ? 'Aucune notification lue' : 
                 'Aucune notification'}
              </h3>
              <p className="text-gray-600">
                Vous serez notifié ici des événements importants
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`bg-white rounded-lg shadow-sm border transition ${
                    !notif.lue 
                      ? 'border-blue-200 bg-blue-50' 
                      : 'border-gray-200 hover:shadow-md'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start">
                      {/* Icône */}
                      <div className="text-3xl mr-4 flex-shrink-0">
                        {getNotificationIcon(notif.type_notification)}
                      </div>

                      {/* Contenu */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {notif.titre}
                          </h3>
                          {!notif.lue && (
                            <span className="ml-2 w-2.5 h-2.5 bg-blue-600 rounded-full flex-shrink-0 mt-2"></span>
                          )}
                        </div>

                        <p className="text-gray-700 mb-3 whitespace-pre-line">
                          {notif.message}
                        </p>

                        {/* Lien */}
                        {notif.lien && (
                          <a
                            href={notif.lien}
                            onClick={() => !notif.lue && handleMarkAsRead(notif.id)}
                            className="inline-block text-blue-600 hover:text-blue-800 font-medium mb-3"
                          >
                            Voir plus →
                          </a>
                        )}

                        {/* Meta */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>
                              {new Date(notif.created_at).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                              {notif.type_display || notif.type_notification}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-2">
                            {!notif.lue && (
                              <button
                                onClick={() => handleMarkAsRead(notif.id)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="Marquer comme lu"
                              >
                                <Check className="w-5 h-5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(notif.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Supprimer"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}