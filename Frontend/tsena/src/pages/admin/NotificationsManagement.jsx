// src/pages/admin/NotificationsManagement.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import {
  Bell,
  Send,
  Users,
  Store,
  X,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import api from '@/services/api';

export default function NotificationsManagement() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // Formulaire d'envoi
  const [formData, setFormData] = useState({
    recipient_type: 'all', // all, clients, entreprises, specific
    user_ids: [],
    type_notification: 'general',
    titre: '',
    message: '',
    lien: ''
  });

  // Liste des utilisateurs pour sélection
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users/admin/users/');
      setUsers(response.data.results || response.data || []);
    } catch (err) {
      console.error('Erreur chargement utilisateurs:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUserSelect = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let userIds = [];

      // Déterminer les destinataires
      if (formData.recipient_type === 'all') {
        userIds = users.map(u => u.id);
      } else if (formData.recipient_type === 'clients') {
        userIds = users.filter(u => u.user_type === 'client').map(u => u.id);
      } else if (formData.recipient_type === 'entreprises') {
        userIds = users.filter(u => u.user_type === 'entreprise').map(u => u.id);
      } else if (formData.recipient_type === 'specific') {
        userIds = selectedUsers;
      }

      if (userIds.length === 0) {
        setError('Veuillez sélectionner au moins un destinataire');
        setLoading(false);
        return;
      }

      // Envoyer la notification en masse
      await api.post('/notifications/bulk/', {
        user_ids: userIds,
        type_notification: formData.type_notification,
        titre: formData.titre,
        message: formData.message,
        lien: formData.lien
      });

      setSuccess(`Notification envoyée avec succès à ${userIds.length} utilisateur(s)`);
      
      // Réinitialiser le formulaire
      setFormData({
        recipient_type: 'all',
        user_ids: [],
        type_notification: 'general',
        titre: '',
        message: '',
        lien: ''
      });
      setSelectedUsers([]);
    } catch (err) {
      console.error('Erreur envoi notification:', err);
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi de la notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Envoyer des Notifications
            </h1>
            <p className="text-gray-600 mt-2">
              Communiquez avec vos utilisateurs
            </p>
          </div>
          <Link
            to="/admin/dashboard"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Retour au dashboard
          </Link>
        </div>

        {/* Alertes */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-green-800 font-medium">Succès</p>
              <p className="text-green-700 text-sm mt-1">{success}</p>
            </div>
            <button
              onClick={() => setSuccess('')}
              className="ml-auto text-green-600 hover:text-green-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">Erreur</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError('')}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          {/* Destinataires */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Destinataires
            </label>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, recipient_type: 'all' }))}
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  formData.recipient_type === 'all'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Users className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <p className="font-medium text-sm">Tous</p>
                <p className="text-xs text-gray-600">{users.length} users</p>
              </button>

              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, recipient_type: 'clients' }))}
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  formData.recipient_type === 'clients'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Users className="w-6 h-6 mx-auto mb-2 text-green-600" />
                <p className="font-medium text-sm">Clients</p>
                <p className="text-xs text-gray-600">
                  {users.filter(u => u.user_type === 'client').length} clients
                </p>
              </button>

              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, recipient_type: 'entreprises' }))}
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  formData.recipient_type === 'entreprises'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Store className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                <p className="font-medium text-sm">Entreprises</p>
                <p className="text-xs text-gray-600">
                  {users.filter(u => u.user_type === 'entreprise').length} entreprises
                </p>
              </button>

              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, recipient_type: 'specific' }))}
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  formData.recipient_type === 'specific'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Users className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                <p className="font-medium text-sm">Spécifiques</p>
                <p className="text-xs text-gray-600">
                  {selectedUsers.length} sélectionnés
                </p>
              </button>
            </div>
          </div>

          {/* Sélection spécifique */}
          {formData.recipient_type === 'specific' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sélectionner les utilisateurs
              </label>
              <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
                {users.map(user => (
                  <label key={user.id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleUserSelect(user.id)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {user.first_name || user.last_name 
                          ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                          : user.username}
                      </p>
                      <p className="text-xs text-gray-600">{user.email}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      user.user_type === 'client' ? 'bg-blue-100 text-blue-800' :
                      user.user_type === 'entreprise' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {user.user_type}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Type de notification */}
          <div>
            <label htmlFor="type_notification" className="block text-sm font-medium text-gray-700 mb-2">
              Type de notification
            </label>
            <select
              id="type_notification"
              name="type_notification"
              value={formData.type_notification}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="general">Général</option>
              <option value="order">Commande</option>
              <option value="order_status">Statut commande</option>
              <option value="stock">Stock</option>
              <option value="payment">Paiement</option>
              <option value="review">Avis</option>
              <option value="account">Compte</option>
            </select>
          </div>

          {/* Titre */}
          <div>
            <label htmlFor="titre" className="block text-sm font-medium text-gray-700 mb-2">
              Titre
            </label>
            <input
              type="text"
              id="titre"
              name="titre"
              value={formData.titre}
              onChange={handleChange}
              placeholder="Ex: Nouvelle promotion disponible"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={5}
              placeholder="Rédigez votre message ici..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Lien (optionnel) */}
          <div>
            <label htmlFor="lien" className="block text-sm font-medium text-gray-700 mb-2">
              Lien (optionnel)
            </label>
            <input
              type="text"
              id="lien"
              name="lien"
              value={formData.lien}
              onChange={handleChange}
              placeholder="Ex: /products/nouveau-produit"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Bouton d'envoi */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setFormData({
                recipient_type: 'all',
                user_ids: [],
                type_notification: 'general',
                titre: '',
                message: '',
                lien: ''
              })}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Réinitialiser
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Envoyer la notification
                </>
              )}
            </button>
          </div>
        </form>

        {/* Aperçu */}
        {formData.titre && formData.message && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Aperçu de la notification</h2>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <div className="flex items-start">
                <Bell className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{formData.titre}</h3>
                  <p className="text-gray-700 text-sm mb-2">{formData.message}</p>
                  {formData.lien && (
                    <a href="#" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      En savoir plus →
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}