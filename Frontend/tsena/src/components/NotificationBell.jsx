// src/components/NotificationBell.jsx - VERSION V2

import { useState, useEffect } from 'react';
import { Bell, X, Check, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import notificationService from '@/services/notificationService';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
    // Recharger toutes les 30 secondes
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const [notifs, count] = await Promise.all([
        notificationService.getMyNotifications(),
        notificationService.getUnreadCount()
      ]);
      setNotifications(notifs.slice(0, 10)); // Limiter à 10 dernières
      setUnreadCount(count);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    }
  };

  const handleMarkAsRead = async (notifId) => {
    try {
      await notificationService.markAsRead(notifId);
      await loadNotifications();
    } catch (error) {
      console.error('Erreur marquer comme lu:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    setLoading(true);
    try {
      await notificationService.markAllAsRead();
      await loadNotifications();
    } catch (error) {
      console.error('Erreur marquer tout comme lu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHide = async (notifId) => {
    try {
      await notificationService.hideNotification(notifId); // CHANGÉ: hideNotification au lieu de deleteNotification
      await loadNotifications();
    } catch (error) {
      console.error('Erreur masquage notification:', error);
    }
  };

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

  return (
    <div className="relative">
      {/* Bouton cloche */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-700 hover:text-blue-600 transition"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown des notifications */}
      {isOpen && (
        <>
          {/* Overlay pour fermer en cliquant ailleurs */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Panel notifications */}
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[32rem] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    disabled={loading}
                    className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
                  >
                    Tout marquer lu
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Liste notifications */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Aucune notification</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 hover:bg-gray-50 transition ${
                        !notif.lue ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start">
                        {/* Icône */}
                        <div className="text-2xl mr-3 flex-shrink-0">
                          {getNotificationIcon(notif.type_notification)}
                        </div>

                        {/* Contenu */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h4 className="font-semibold text-sm text-gray-900 mb-1">
                              {notif.titre}
                            </h4>
                            {!notif.lue && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {notif.message}
                          </p>
                          
                          {/* Lien si présent */}
                          {notif.lien && (
                            <Link
                              to={notif.lien}
                              onClick={() => {
                                handleMarkAsRead(notif.id);
                                setIsOpen(false);
                              }}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Voir plus →
                            </Link>
                          )}

                          {/* Date */}
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(notif.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>

                          {/* Actions */}
                          <div className="flex items-center space-x-3 mt-2">
                            {!notif.lue && (
                              <button
                                onClick={() => handleMarkAsRead(notif.id)}
                                className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                              >
                                <Check className="w-3 h-3 mr-1" />
                                Marquer lu
                              </button>
                            )}
                            <button
                              onClick={() => handleHide(notif.id)}
                              className="text-xs text-red-600 hover:text-red-800 flex items-center"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Masquer
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 text-center">
                <Link
                  to="/notifications"
                  onClick={() => setIsOpen(false)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Voir toutes les notifications
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}