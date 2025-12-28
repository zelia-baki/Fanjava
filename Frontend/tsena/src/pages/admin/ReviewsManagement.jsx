// src/pages/admin/ReviewsManagement.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import {
  Star,
  Search,
  Loader2,
  Check,
  X,
  Eye,
  User,
  Package,
  Calendar
} from 'lucide-react';
import api from '@/services/api';

export default function ReviewsManagement() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products/avis/');
      setReviews(response.data.results || response.data || []);
    } catch (err) {
      console.error('Erreur chargement avis:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId) => {
    try {
      await api.patch(`/products/avis/${reviewId}/`, { approuve: true });
      setReviews(reviews.map(r => 
        r.id === reviewId ? { ...r, approuve: true } : r
      ));
      alert('Avis approuvé avec succès');
    } catch (err) {
      console.error('Erreur approbation avis:', err);
      alert('Erreur lors de l\'approbation de l\'avis');
    }
  };

  const handleReject = async (reviewId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) return;

    try {
      await api.delete(`/products/avis/${reviewId}/`);
      setReviews(reviews.filter(r => r.id !== reviewId));
      alert('Avis supprimé avec succès');
    } catch (err) {
      console.error('Erreur suppression avis:', err);
      alert('Erreur lors de la suppression de l\'avis');
    }
  };

  // Filtrage
  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.commentaire?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.client_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.produit_nom?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'approved' && review.approuve) ||
      (filterStatus === 'pending' && !review.approuve);

    return matchesSearch && matchesStatus;
  });

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 py-16 flex justify-center items-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-3">Chargement des avis...</span>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Modération des Avis
            </h1>
            <p className="text-gray-600 mt-2">
              {filteredReviews.length} avis trouvé{filteredReviews.length > 1 ? 's' : ''}
            </p>
          </div>
          <Link
            to="/admin/dashboard"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Retour au dashboard
          </Link>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Recherche */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rechercher
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Client, produit, commentaire..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtre statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous</option>
                <option value="pending">En attente</option>
                <option value="approved">Approuvés</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-800">En attente</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {reviews.filter(r => !r.approuve).length}
                </p>
              </div>
              <Eye className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-800">Approuvés</p>
                <p className="text-2xl font-bold text-green-900">
                  {reviews.filter(r => r.approuve).length}
                </p>
              </div>
              <Check className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-800">Note moyenne</p>
                <p className="text-2xl font-bold text-blue-900">
                  {reviews.length > 0
                    ? (reviews.reduce((sum, r) => sum + r.note, 0) / reviews.length).toFixed(1)
                    : '0.0'}
                  /5
                </p>
              </div>
              <Star className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Liste des avis */}
        <div className="space-y-4">
          {filteredReviews.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Star className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <p className="text-gray-600">Aucun avis trouvé</p>
            </div>
          ) : (
            filteredReviews.map((review) => (
              <div
                key={review.id}
                className={`bg-white rounded-lg shadow-sm border p-6 ${
                  review.approuve ? 'border-green-200' : 'border-yellow-200'
                }`}
              >
                {/* En-tête de l'avis */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="font-medium text-gray-900">
                          {review.client_nom || `Client #${review.client}`}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Package className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">
                          {review.produit_nom || `Produit #${review.produit}`}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">
                          {new Date(review.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {renderStars(review.note)}
                      <span className="text-sm font-semibold text-gray-900">
                        {review.note}/5
                      </span>
                    </div>
                  </div>

                  {/* Badge statut */}
                  {review.approuve ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                      <Check className="w-3 h-3 mr-1" />
                      Approuvé
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                      <Eye className="w-3 h-3 mr-1" />
                      En attente
                    </span>
                  )}
                </div>

                {/* Titre de l'avis (si présent) */}
                {review.titre && (
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {review.titre}
                  </h3>
                )}

                {/* Commentaire */}
                <p className="text-gray-700 mb-4 leading-relaxed">
                  {review.commentaire}
                </p>

                {/* Actions */}
                <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                  {!review.approuve && (
                    <button
                      onClick={() => handleApprove(review.id)}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Approuver
                    </button>
                  )}
                  <button
                    onClick={() => handleReject(review.id)}
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Supprimer
                  </button>
                  <Link
                    to={`/products/${review.produit}`}
                    className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Voir le produit
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
}