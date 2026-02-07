import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { Star, Loader2, MessageSquare, Trash2 } from 'lucide-react';
import api from '@/services/api';

export default function MyReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyReviews();
  }, []);

  const fetchMyReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products/avis/mes_avis/');
      setReviews(response.data);
    } catch (err) {
      console.error('Erreur chargement avis:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (avisId) => {
    if (!window.confirm('Supprimer cet avis ?')) {
      return;
    }

    try {
      await api.delete(`/products/avis/${avisId}/`);
      alert('Avis supprimé !');
      fetchMyReviews();
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert('Erreur lors de la suppression');
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

  const getStatusBadge = (approuve) => {
    if (approuve) {
      return (
        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
          ✓ Approuvé
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
        ⏳ En attente
      </span>
    );
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-white flex justify-center items-center">
          <div className="flex items-center gap-3">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            <span className="text-gray-600">Chargement...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mes Avis</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Gérez tous vos avis et commentaires
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Total</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{reviews.length}</p>
            </div>
            <div className="bg-white rounded-lg border border-green-200 p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Approuvés</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">
                {reviews.filter(r => r.approuve).length}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-yellow-200 p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Attente</p>
              <p className="text-xl sm:text-2xl font-bold text-yellow-600">
                {reviews.filter(r => !r.approuve).length}
              </p>
            </div>
          </div>

          {/* Liste des avis */}
          {reviews.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                Aucun avis
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                Vous n'avez pas encore laissé d'avis
              </p>
              <Link
                to="/"
                className="inline-block px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
              >
                Découvrir des produits
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6"
                >
                  {/* En-tête */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/products/${review.produit}`}
                        className="text-base sm:text-lg font-semibold text-gray-900 hover:text-emerald-600 transition-colors block truncate"
                      >
                        {review.produit_nom}
                      </Link>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        {new Date(review.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    {getStatusBadge(review.approuve)}
                  </div>

                  {/* Note */}
                  <div className="mb-3">
                    {renderStars(review.note)}
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
                  <div className="flex items-center pt-3 border-t border-gray-200">
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center transition-colors"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Supprimer
                    </button>
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
