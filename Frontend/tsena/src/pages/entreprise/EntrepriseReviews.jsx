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
      // Récupérer tous les avis des produits de l'entreprise
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
      <div className="flex items-center space-x-1">
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
        <div className="max-w-7xl mx-auto px-4 py-16 flex justify-center items-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-3">Chargement...</span>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Avis</h1>
          <p className="text-gray-600 mt-1">
            Gérez les avis de vos produits
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total avis</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border border-green-200">
            <p className="text-sm text-gray-600 mb-1">Approuvés</p>
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border border-yellow-200">
            <p className="text-sm text-gray-600 mb-1">En attente</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Note moyenne</p>
            <div className="flex items-center">
              <p className="text-2xl font-bold text-blue-600 mr-2">{stats.avgRating}</p>
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Filtre */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les avis</option>
              <option value="approved">Approuvés</option>
              <option value="pending">En attente</option>
            </select>
            <span className="text-sm text-gray-600">
              {filteredReviews.length} avis
            </span>
          </div>
        </div>

        {/* Liste des avis */}
        {filteredReviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Star className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun avis
            </h3>
            <p className="text-gray-600">
              {filterStatus === 'all' 
                ? 'Aucun avis pour vos produits pour le moment'
                : 'Aucun avis dans cette catégorie'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    {/* Produit */}
                    <Link
                      to={`/products/${review.produit}`}
                      className="text-lg font-semibold text-gray-900 hover:text-blue-600 mb-2 block"
                    >
                      {review.produit_nom}
                    </Link>

                    {/* Client & Date */}
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <span>
                        Par {review.client_prenom || review.client_nom || 'Client'}
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(review.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>

                    {/* Note */}
                    {renderStars(review.note)}
                  </div>

                  {/* Badge statut */}
                  {review.approuve ? (
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                      ✓ Approuvé
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                      ⏳ En attente
                    </span>
                  )}
                </div>

                {/* Titre */}
                {review.titre && (
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {review.titre}
                  </h4>
                )}

                {/* Commentaire */}
                <p className="text-gray-700 mb-4">
                  {review.commentaire}
                </p>

                {/* Actions */}
                <div className="flex items-center space-x-3 pt-3 border-t">
                  {!review.approuve && (
                    <button
                      onClick={() => handleApprove(review.id)}
                      className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approuver
                    </button>
                  )}
                  {review.approuve && (
                    <button
                      onClick={() => handleReject(review.id)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Rejeter
                    </button>
                  )}
                  <Link
                    to={`/products/${review.produit}`}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
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
    </MainLayout>
  );
}
