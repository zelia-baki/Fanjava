import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { Star, Loader2, CheckCircle, XCircle, Eye, Filter } from 'lucide-react';
import api from '@/services/api';

export default function EntrepriseReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products/avis/');
      setReviews(response.data.results || response.data);
    } catch (err) {
      console.error('Erreur chargement avis:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (avisId) => {
    try {
      await api.patch(`/products/avis/${avisId}/`, {
        approuve: true
      });
      alert('Avis approuvé !');
      fetchReviews();
    } catch (err) {
      console.error('Erreur approbation:', err);
      alert('Erreur lors de l\'approbation');
    }
  };

  const handleReject = async (avisId) => {
    if (!window.confirm('Rejeter cet avis ? (Il ne sera plus visible)')) {
      return;
    }

    try {
      await api.patch(`/products/avis/${avisId}/`, {
        approuve: false
      });
      alert('Avis rejeté !');
      fetchReviews();
    } catch (err) {
      console.error('Erreur rejet:', err);
      alert('Erreur lors du rejet');
    }
  };

  const renderStars = (note) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= note
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const filteredReviews = reviews.filter(review => {
    if (filterStatus === 'approved') return review.approuve;
    if (filterStatus === 'pending') return !review.approuve;
    return true;
  });

  const stats = {
    total: reviews.length,
    approved: reviews.filter(r => r.approuve).length,
    pending: reviews.filter(r => !r.approuve).length,
    avgRating: reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.note, 0) / reviews.length).toFixed(1)
      : 0
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-white flex justify-center items-center">
          <div className="flex items-center gap-3">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            <span className="text-gray-600">Chargement...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestion des Avis</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Gérez les avis de vos produits
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Total</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-white rounded-lg border border-green-200 p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Approuvés</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <div className="bg-white rounded-lg border border-yellow-200 p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Attente</p>
              <p className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="bg-white rounded-lg border border-orange-200 p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Note moyenne</p>
              <div className="flex items-center">
                <p className="text-xl sm:text-2xl font-bold text-orange-600 mr-2">{stats.avgRating}</p>
                <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
              </div>
            </div>
          </div>

          {/* Filtre */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <Filter className="w-5 h-5 text-gray-400 hidden sm:block" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              >
                <option value="all">Tous les avis</option>
                <option value="approved">Approuvés</option>
                <option value="pending">En attente</option>
              </select>
              <span className="text-xs sm:text-sm text-gray-600">
                {filteredReviews.length} avis
              </span>
            </div>
          </div>

          {/* Liste des avis */}
          {filteredReviews.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                Aucun avis
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                {filterStatus === 'all' 
                  ? 'Aucun avis pour vos produits'
                  : 'Aucun avis dans cette catégorie'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                      {/* Produit */}
                      <Link
                        to={`/products/${review.produit}`}
                        className="text-base sm:text-lg font-semibold text-gray-900 hover:text-orange-600 mb-2 block truncate transition-colors"
                      >
                        {review.produit_nom}
                      </Link>

                      {/* Client & Date */}
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-3">
                        <span>
                          Par {review.client_prenom || review.client_nom || 'Client'}
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span>
                          {new Date(review.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>

                      {/* Note */}
                      {renderStars(review.note)}
                    </div>

                    {/* Badge statut */}
                    {review.approuve ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full self-start">
                        ✓ Approuvé
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full self-start">
                        ⏳ En attente
                      </span>
                    )}
                  </div>

                  {/* Titre */}
                  {review.titre && (
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                      {review.titre}
                    </h4>
                  )}

                  {/* Commentaire */}
                  <p className="text-gray-700 mb-4 text-sm sm:text-base leading-relaxed">
                    {review.commentaire}
                  </p>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-gray-200">
                    {!review.approuve && (
                      <button
                        onClick={() => handleApprove(review.id)}
                        className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center transition-colors"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approuver
                      </button>
                    )}
                    {review.approuve && (
                      <button
                        onClick={() => handleReject(review.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center transition-colors"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Rejeter
                      </button>
                    )}
                    <Link
                      to={`/products/${review.produit}`}
                      className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Voir le produit
                    </Link>
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
